/* tutorial.js — first-run guided steps (DE/EN) */
(function(){
  var STYLE_ID = "hp-tut-style";
  var ROOT_ID = "hp-tut";
  var steps = [
    {
      id: "welcome",
      de: { title: "Willkommen bei HASHPOOL", body: "Tippe auf den gro\u00dfen Button, um Sats zu minen. Upgrades bringen dir passive Einnahmen." },
      en: { title: "Welcome to HASHPOOL", body: "Tap the big button to mine sats. Upgrades give you passive income." },
      target: "#mine-btn"
    },
    {
      id: "shop",
      de: { title: "Teile-Shop", body: "Im Teile-Shop kaufst du echte PC-Komponenten (CPU, GPU, RAM \u2026). Bessere Teile = besserer Verkaufspreis." },
      en: { title: "Parts Shop", body: "Buy real PC parts (CPU, GPU, RAM\u2026). Better parts mean a better sell price." },
      target: "#ps-open-btn"
    },
    {
      id: "build",
      de: { title: "PC bauen", body: "Wenn du von jeder Kategorie mind. 1 Teil hast, \u00f6ffne \u201ePC bauen\u201c, w\u00e4hle je 1 Teil und starte den Zusammenbau." },
      en: { title: "Build a PC", body: "Once you own 1 part per category, open Build, pick one of each, and start assembly." },
      target: "#open-build-btn"
    },
    {
      id: "done",
      de: { title: "Viel Erfolg!", body: "Verkaufe fertige Rigs f\u00fcr Sats. Das Tutorial erscheint nur einmal f\u00fcr neue Spieler." },
      en: { title: "Have fun!", body: "Sell finished rigs for sats. This tutorial only shows once for new players." },
      target: null
    }
  ];
  var idx = 0;

  function lang(){
    try { return (state && state.lang === "de") ? "de" : "en"; } catch(e){ return "de"; }
  }
  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
      "#hp-tut{position:fixed;inset:0;z-index:100000;pointer-events:none;font-family:system-ui,-apple-system,sans-serif}",
      "#hp-tut .hp-tut-dim{position:absolute;inset:0;background:rgba(0,0,0,0.55);pointer-events:auto}",
      "#hp-tut .hp-tut-card{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);width:min(360px,92vw);background:#12151a;border:2px solid #f7931a;border-radius:16px;padding:16px 18px;color:#f0f2f5;pointer-events:auto;box-shadow:0 16px 40px rgba(0,0,0,0.5)}",
      "#hp-tut .hp-tut-card h3{margin:0 0 8px;font-size:17px;color:#f7931a;font-weight:800}",
      "#hp-tut .hp-tut-card p{margin:0 0 14px;font-size:14px;line-height:1.45;color:#c8ced8}",
      "#hp-tut .hp-tut-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}",
      "#hp-tut .hp-tut-actions button{font:700 13px system-ui;padding:10px 14px;border-radius:10px;border:1px solid #2a313c;background:#1a1f27;color:#e7e9ec;cursor:pointer}",
      "#hp-tut .hp-tut-actions button.primary{background:#f7931a;color:#1a1206;border-color:#f7931a}",
      "#hp-tut .hp-tut-spot{position:absolute;border:2px solid #f7931a;border-radius:14px;box-shadow:0 0 0 9999px rgba(0,0,0,0.55),0 0 20px rgba(247,147,26,0.5);pointer-events:none;transition:all .25s ease}",
      "#hp-tut .hp-tut-progress{font-size:11px;color:#8b95a5;margin-bottom:8px}"
    ].join("\n");
    document.head.appendChild(s);
  }
  function finish(){
    try {
      if(typeof state !== "undefined") state.tutorialDone = true;
      if(typeof save === "function") save();
    } catch(e){}
    var el = document.getElementById(ROOT_ID);
    if(el) el.remove();
  }
  function highlight(sel){
    var spot = document.getElementById("hp-tut-spot");
    if(!spot) return;
    if(!sel){ spot.style.display = "none"; return; }
    var t = document.querySelector(sel);
    if(!t){ spot.style.display = "none"; return; }
    try { t.scrollIntoView({ behavior: "smooth", block: "center" }); } catch(e){}
    var r = t.getBoundingClientRect();
    var pad = 8;
    spot.style.display = "block";
    spot.style.left = (r.left - pad) + "px";
    spot.style.top = (r.top - pad) + "px";
    spot.style.width = (r.width + pad * 2) + "px";
    spot.style.height = (r.height + pad * 2) + "px";
  }
  function render(){
    ensureStyle();
    var root = document.getElementById(ROOT_ID);
    if(!root){
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.innerHTML = '<div class="hp-tut-dim"></div><div class="hp-tut-spot" id="hp-tut-spot" style="display:none"></div><div class="hp-tut-card" id="hp-tut-card"></div>';
      document.body.appendChild(root);
    }
    var step = steps[idx];
    if(!step){ finish(); return; }
    var L = step[lang()] || step.en;
    var card = document.getElementById("hp-tut-card");
    var isLast = idx >= steps.length - 1;
    card.innerHTML =
      '<div class="hp-tut-progress">' + (idx + 1) + " / " + steps.length + '</div>' +
      '<h3>' + L.title + '</h3>' +
      '<p>' + L.body + '</p>' +
      '<div class="hp-tut-actions">' +
        (idx > 0 ? '<button type="button" id="hp-tut-back">' + (lang()==="de"?"Zur\u00fcck":"Back") + '</button>' : '') +
        '<button type="button" id="hp-tut-skip">' + (lang()==="de"?"\u00dcberspringen":"Skip") + '</button>' +
        '<button type="button" class="primary" id="hp-tut-next">' + (isLast ? (lang()==="de"?"Los geht\'s":"Let\'s go") : (lang()==="de"?"Weiter":"Next")) + '</button>' +
      '</div>';
    highlight(step.target);
    document.getElementById("hp-tut-next").onclick = function(){
      if(isLast) finish();
      else { idx++; render(); }
    };
    var sk = document.getElementById("hp-tut-skip");
    if(sk) sk.onclick = finish;
    var bk = document.getElementById("hp-tut-back");
    if(bk) bk.onclick = function(){ idx = Math.max(0, idx - 1); render(); };
  }
  function shouldShow(){
    try {
      if(typeof state === "undefined") return false;
      if(state.tutorialDone) return false;
      if((state.lifetime||0) > 5000) return false;
      if((state.rigsSold||0) > 0) return false;
      return true;
    } catch(e){ return false; }
  }
  function start(){
    if(!shouldShow()) return;
    idx = 0;
    render();
  }
  window.HashpoolTutorial = { start: start, finish: finish };
  function boot(){
    setTimeout(function(){
      try { start(); } catch(e){}
    }, 1800);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
