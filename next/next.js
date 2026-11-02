/* next.js — nur in /next/ geladen. Spielwiese fuer den Shop-Simulator.
 * Phase 0: Kennzeichnung, Rueckweg zur stabilen Version.
 * Ladereihenfolge (alles lokal aus next/): world.js (Laden, Erste Person) -> env.js (Strasse) -> logistics.js (Abholladen/Lieferung)
 *   -> clicker.js (Buzzer-Tisch, Original-Upgrades im Raum) -> clickfix.js.
 * Kill-Switches: ?noworld ?noenv ?nologi ?noclicker ?noextras (world aus = 1:1 Kopie des Spiels).
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
  function off(k) { return new RegExp("[?&]" + k + "(=|&|$)").test(q); }
  function load(src, next) {
    var s = document.createElement("script");
    s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
    s.onload = function () { if (next) next(); };
    s.onerror = function () { console.warn("[NEXT] nicht ladbar:", src); if (next) next(); };
    document.body.appendChild(s);
  }
  var chain = [];
  if (!off("noworld")) {
    chain.push("next/world.js");
    if (!off("noenv")) chain.push("next/env.js");
    if (!off("nologi")) chain.push("next/logistics.js");
    if (!off("noclicker")) { chain.push("next/clicker.js"); chain.push("next/clickfix.js"); }
    if (!off("noextras")) chain.push("next/extras.js");
  }
  (function nextLoad() { var f = chain.shift(); if (f) load(f, nextLoad); })();
  console.log("[HASHPOOL NEXT] aktiv");
})();
