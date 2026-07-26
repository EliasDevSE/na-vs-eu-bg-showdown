var STANDINGS = {
  stage: "Group 1 plays Friday 4 September, 6 PM CEST. Standings update between games.",
  players: [
    { name: "Jeef",      tag: "NA", points: 0 },
    { name: "Beter",     tag: "NA", points: 0 },
    { name: "Xiaoliaoo", tag: "NA", points: 0 },
    { name: "Awedragon", tag: "NA", points: 0 },
    { name: "Rechot",    tag: "NA", points: 0 },
    { name: "TBD",       tag: "NA", points: 0 },
    { name: "TBD",       tag: "NA", points: 0 },
    { name: "TBD",       tag: "NA", points: 0 },
    { name: "Rdu",       tag: "EU", points: 0 },
    { name: "SuperJJ",   tag: "EU", points: 0 },
    { name: "XQN",       tag: "EU", points: 0 },
    { name: "Slyders",   tag: "EU", points: 0 },
    { name: "Zorgo",     tag: "EU", points: 0 },
    { name: "Oliech",    tag: "EU", points: 0 },
    { name: "TBD",       tag: "EU", points: 0 },
    { name: "TBD",       tag: "EU", points: 0 }
  ]
};

(function () {
  "use strict";

  var poolAmount = document.getElementById("poolAmount");
  function updatePool() {
    if (!poolAmount) return;
    fetch("https://api.streamelements.com/kappa/v2/overlays/6a6215e41b67264f6cdfdc6b/bootstrap?isEditor=false", {
      headers: { Authorization: "apikey 3hlZ4LUiV4XUOMvy7rL4" }
    }).then(function (r) { return r.json(); }).then(function (d) {
      var raised = d.session["tip-goal"].amount;
      var symbol = (d.tipping && d.tipping.currency && d.tipping.currency.symbol) || "€";
      poolAmount.textContent = symbol + raised.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }).catch(function () {});
  }
  updatePool();
  setInterval(updatePool, 15000);

  var list = document.getElementById("standingsList");
  var stageEl = document.getElementById("standingsStage");
  if (list && STANDINGS && STANDINGS.players && STANDINGS.players.length) {
    if (stageEl && STANDINGS.stage) stageEl.textContent = STANDINGS.stage;
    var sorted = STANDINGS.players.slice().sort(function (a, b) {
      if (!!a.eliminated !== !!b.eliminated) return a.eliminated ? 1 : -1;
      return (b.points || 0) - (a.points || 0);
    });
    sorted.forEach(function (p, i) {
      var li = document.createElement("li");
      li.className = "stand-row" + (i < 4 && !p.eliminated ? " top" : "") +
        (p.eliminated ? " out" : "") + (p.inCheck ? " check" : "");
      var status = [p.tag || "", p.eliminated ? "Eliminated" : (p.inCheck ? "In check" : "")]
        .filter(Boolean).join(" · ");
      li.innerHTML =
        '<span class="place">' + (i + 1) + '</span>' +
        '<span class="player"></span>' +
        '<span class="score">' + (p.points || 0) + '</span>';
      var playerEl = li.querySelector(".player");
      playerEl.textContent = p.name;
      if (status) {
        var small = document.createElement("small");
        small.textContent = status;
        playerEl.appendChild(small);
      }
      list.appendChild(li);
    });
  }

  var dateEl = document.querySelector(".hero-date");
  var EVENT = new Date(dateEl && dateEl.dataset.event ? dateEl.dataset.event : "2026-09-04T16:00:00Z");

  var cd = document.getElementById("countdown");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function goLive() {
    document.querySelectorAll(".live-reveal").forEach(function (el) { el.hidden = false; });
  }
  function tick() {
    if (!cd) return;
    var diff = EVENT.getTime() - Date.now();
    var box = {
      days:  cd.querySelector('[data-c="days"]'),
      hours: cd.querySelector('[data-c="hours"]'),
      mins:  cd.querySelector('[data-c="mins"]'),
      secs:  cd.querySelector('[data-c="secs"]')
    };
    if (diff <= 0) {
      box.days.textContent = box.hours.textContent = box.mins.textContent = box.secs.textContent = "00";
      cd.setAttribute("data-live", "true");
      goLive();
      return;
    }
    var s = Math.floor(diff / 1000);
    box.days.textContent  = Math.floor(s / 86400);
    box.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    box.mins.textContent  = pad(Math.floor((s % 3600) / 60));
    box.secs.textContent  = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  var local = document.getElementById("localTime");
  if (local && !isNaN(EVENT)) {
    try {
      local.textContent = new Intl.DateTimeFormat("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: "short"
      }).format(EVENT);
    } catch (e) {
      local.textContent = EVENT.toString();
    }
  }

  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
