"""Deploy the site to GoDaddy hosting over SFTP.

Credentials live in C:/Users/<user>/.na-vs-eu-deploy.json (never committed).
Usage: python deploy.py
"""
import json
import os
import posixpath
import sys

import paramiko

SITE_FILES = [
    "index.html",
    "styles.css",
    "script.js",
    "event.ics",
    "favicon.ico",
    "favicon-32.png",
    "apple-touch-icon.png",
]
SITE_DIRS = ["assets"]

def main():
    cfg_path = os.path.expanduser("~/.na-vs-eu-deploy.json")
    with open(cfg_path, encoding="utf-8") as f:
        cfg = json.load(f)

    local_root = os.path.dirname(os.path.abspath(__file__))
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(cfg["host"], port=cfg["port"], username=cfg["username"],
                   password=cfg["password"], look_for_keys=False, allow_agent=False)
    sftp = client.open_sftp()
    root = cfg["remote_root"]

    def ensure_dir(path):
        try:
            sftp.stat(path)
        except FileNotFoundError:
            sftp.mkdir(path)

    def put(rel):
        local = os.path.join(local_root, rel)
        remote = posixpath.join(root, rel.replace(os.sep, "/"))
        sftp.put(local, remote)
        print("uploaded", rel)

    uploaded = 0
    for rel in SITE_FILES:
        put(rel)
        uploaded += 1
    for d in SITE_DIRS:
        for dirpath, _dirnames, filenames in os.walk(os.path.join(local_root, d)):
            rel_dir = os.path.relpath(dirpath, local_root)
            ensure_dir(posixpath.join(root, rel_dir.replace(os.sep, "/")))
            for name in filenames:
                put(os.path.join(rel_dir, name))
                uploaded += 1

    sftp.close()
    client.close()
    print(f"done: {uploaded} files")

if __name__ == "__main__":
    sys.exit(main())
