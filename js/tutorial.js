/* tutorial.js — specific first-run guide (DE/EN), light overlay, clear outlines */
(function(){
  var STYLE_ID = "hp-tut-style";
  var ROOT_ID = "hp-tut";
  var steps = [
    {
      id: "mine",
      de: { title: "1 · Tippen zum Minen", body: "Drücke den großen orangen „Tap to Mine“-Button in der Mitte. Jeder Tipp gibt Sats. Später bringen Upgrades auch passive Sats pro Sekunde." },
      en: { title: "1 · Tap to mine", body: "Press the big orange “Tap to Mine” button in the center. Each tap gives sats. Later, upgrades also earn passive sats per second." },
      target: "#mine-btn"
    },
    {
      id: "balance",
      de: { title: "2 · Dein Guthaben", body: "Oben siehst du deine Sats und den Kurs. Dort erscheinen auch passive Einnahmen und der Wert pro Klick — schau nach jedem Upgrade hierhin." },
      en: { title: "2 · Your balance", body: "At the top you see your sats and rate. Passive income and value per click show here — check after each upgrade." },
      target: "#balance, .balance-wrap, #hr, .hud, header .balance"
    },
    {
      id: "shop",
      de: { title: "3 · Teile-Shop öffnen", body: "Tippe auf „Teile-Shop“ (Warenkorb). Dort kaufst du CPU, GPU, RAM, SSD, Netzteil, Mainboard und Kühler — wie echte PC-Teile, mit Stufen 1–10." },
      en: { title: "3 · Open Parts Shop", body: "Tap “Parts Shop”. Buy CPU, GPU, RAM, SSD, PSU, motherboard and cooler — real-style parts with tiers 1–10." },
      target: "#ps-open-btn"
    },
    {
      id: "build",
      de: { title: "4 · PC bauen", body: "Wenn du von jeder Kategorie mind. 1 Teil hast: „PC bauen“ öffnen → Kategorien ausklappen → je 1 Teil wählen → „Zusammenbauen starten“. Danach im 3D-Menü einbauen und verkaufen." },
      en: { title: "4 · Build a PC", body: "When you own ≥1 part per category: open Build → expand categories → pick one each → Start assembly. Then install in 3D and sell the rig." },
      target: "#open-build-btn"
    },
    {
      id: "upgrades",
      de: { title: "5 · Upgrades", body: "Unter dem Mine-Button (oder im Shop-Bereich) kaufst du Klick- und Passive-Upgrades. Die machen jeden Tipp und jede Sekunde stärker — aber mit fairen Kosten, damit es nicht zu schnell explodiert." },
      en: { title: "5 · Upgrades", body: "Below the mine button (or in the shop area) buy click and passive upgrades. They boost each tap and each second — with fair costs so progress stays balanced." },
      target: "#shop-click, #shop, .shop, #upgrades"
    },
    {
      id: "done",
      de: { title: "Fertig — viel Erfolg!", body: "Ziel: Sats minen, Teile kaufen, PC bauen, Rig verkaufen, wiederholen. Dieses Tutorial erscheint nur einmal. Viel Spaß bei HASHPOOL!" },
      en: { title: "You’re set — have fun!", body: "Loop: mine sats → buy parts → build PC → sell rig → repeat. This tutorial only shows once. Enjoy HASHPOOL!" },
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
      "#hp-tut .hp-tut-dim{position:absolute;inset:0;background:rgba(0,0,0,0.22);pointer-events:auto}",
      "#hp-tut .hp-tut-card{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);width:min(380px,94vw);background:rgba(18,21,26,0.96);border:2px solid #f7931a;border-radius:16px;padding:16px 18px;color:#f0f2f5;pointer-events:auto;box-shadow:0 12px 32px rgba(0,0,0,0.35)}",
      "#hp-tut .hp-tut-card h3{margin:0 0 8px;font-size:16px;color:#f7931a;font-weight:800}",
      "#hp-tut .hp-tut-card p{margin:0 0 14px;font-size:13.5px;line-height:1.5;color:#d0d6e0}",
      "#hp-tut .hp-tut-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}",
      "#hp-tut .hp-tut-actions button{font:700 13px system-ui;padding:10px 14px;border-radius:10px;border:1px solid #2a313c;background:#1a1f27;color:#e7e9ec;cursor:pointer}",
      "#hp-tut .hp-tut-actions button.primary{background:#f7931a;color:#1a1206;border-color:#f7931a}",
      "#hp-tut .hp-tut-spot{position:absolute;border:3px solid #f7931a;border-radius:14px;box-shadow:0 0 0 3px rgba(247,147,26,0.35),0 0 18px rgba(247,147,26,0.55);background:transparent;pointer-events:none;transition:all .2s ease;z-index:1}",
      "#hp-tut .hp-tut-spot::after{content:'';position:absolute;inset:-6px;border:2px dashed rgba(247,147,26,0.7);border-radius:16px;pointer-events:none}",
      "#hp-tut .hp-tut-progress{font-size:11px;color:#8b95a5;margin-bottom:8px;letter-spacing:0.02em}"
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
  function resolveTarget(sel){
    if(!sel) return null;
    var parts = sel.split(",");
    for(var i=0;i<parts.length;i++){
      var t = document.querySelector(parts[i].trim());
      if(t) return t;
    }
    return null;
  }
  function highlight(sel){
    var spot = document.getElementById("hp-tut-spot");
    if(!spot) return;
    if(!sel){ spot.style.display = "none"; return; }
    var t = resolveTarget(sel);
    if(!t){ spot.style.display = "none"; return; }
    try { t.scrollIntoView({ behavior: "smooth", block: "center" }); } catch(e){}
    var r = t.getBoundingClientRect();
    var pad = 6;
    spot.style.display = "block";
    spot.style.left = Math.max(4, r.left - pad) + "px";
    spot.style.top = Math.max(4, r.top - pad) + "px";
    spot.style.width = Math.min(window.innerWidth - 8, r.width + pad * 2) + "px";
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
        (idx > 0 ? '<button type="button" id="hp-tut-back">' + (lang()==="de"?"Zurück":"Back") + '</button>' : '') +
        '<button type="button" id="hp-tut-skip">' + (lang()==="de"?"Überspringen":"Skip") + '</button>' +
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
    window.addEventListener("resize", function onR(){ highlight(step.target); }, { once: true });
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
    setTimeout(function(){ try { start(); } catch(e){} }, 1800);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
