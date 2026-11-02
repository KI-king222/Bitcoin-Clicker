/* next.js — nur in /next/ geladen. Spielwiese fuer den Shop-Simulator.
 * Phase 0: Kennzeichnung, Rueckweg zur stabilen Version.
 * Phase 1: laedt world.js (Laden + Hinterraum + Stationen, Erste Person). ?noworld=1 schaltet es ab (dann = 1:1 Kopie).
 * Phase 2: laedt clicker.js (Buzzer-Tisch, Wand-Bildschirm, Upgrades im Raum) + clickfix.js. ?noclicker=1 schaltet es ab.
 * TEMP 2026-11-02: clicker.js vom Commit aa5dabe via jsDelivr (lokale Datei war kaputt).
 */
(function () {
  var W = window;
  if (W.__hpNext) return; W.__hpNext = true;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  var bar = document.createElement("div");
  bar.id = "hp-next-bar";
  bar.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 2px) 8px 2px;background:#f7931a;color:#1a1206;font:700 11px monospace;pointer-events:none";
  var a = document.createElement("span"); a.textContent = "NEXT · Test-Version";
  var sp = document.createElement("span"); sp.style.flex = "1";
  var back = document.createElement("a"); back.href = "./"; back.textContent = (de() ? "← stabile Version" : "← stable version");
  back.style.cssText = "pointer-events:auto;color:#1a1206;text-decoration:underline";
  bar.appendChild(a); bar.appendChild(sp); bar.appendChild(back);
  function put() { if (document.body && !document.getElementById("hp-next-bar")) document.body.appendChild(bar); }
  put(); setInterval(put, 2000);
  var q = String(W.location && W.location.search);
  function load(src, next) {
    var s = document.createElement("script");
    s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
    s.onload = function () { if (next) next(); };
    s.onerror = function () { console.warn("[NEXT] nicht ladbar:", src); if (next) next(); };
    document.body.appendChild(s);
  }
  // clicker: feste gute Version (EconomyNerf-Werte + Tisch) bis next/clicker.js wiederhergestellt ist
  var CLICKER = "https://cdn.jsdelivr.net/gh/KI-king222/Bitcoin-Clicker@aa5dabe/next/clicker.js";
  if (!/[?&]noworld(=|&|$)/.test(q)) load("next/world.js", function () {
    if (!/[?&]noclicker(=|&|$)/.test(q)) load(CLICKER, function () { load("next/clickfix.js"); });
  });
  console.log("[HASHPOOL NEXT] aktiv (clicker @ aa5dabe)");
})();
