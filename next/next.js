/* next.js — nur in /next/ geladen. Spielwiese fuer den Shop-Simulator.
 * Phase 0: Kennzeichnung, Rueckweg zur stabilen Version.
 * Ladereihenfolge (alles lokal aus next/): world.js (Laden, Erste Person) -> env.js (Strasse) -> logistics.js (Abholladen/Lieferung)
 *   -> clicker.js (Buzzer-Tisch, Original-Upgrades im Raum) -> clickfix.js.
 * Kill-Switches: ?noworld ?noenv ?nologi ?noclicker ?noextras ?nosim ?nosim2 ?nofactory (world aus = 1:1 Kopie des Spiels).
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
  // Das Spiel schreibt sein Dokument asynchron neu (Body wird ersetzt). Skript-Tags, die davor angehaengt wurden, gehen dabei
  // verloren und ihr onload feuert nie -> die Kette blieb zufaellig stehen (Tisch/Ton/Klick-Fix fehlten). Darum: erst starten,
  // wenn das Spiel steht, und jedes Skript bei Verlust erneut anhaengen.
  function gameReady() { return !!(document.getElementById("mine-btn") && W.state && W.Parts3D); }
  function load(src, next) {
    var tries = 0, fin = false, t0 = Date.now();
    function go() {
      if (fin) return; tries++;
      var s = document.createElement("script"); s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=" + Date.now();
      s.onload = function () { if (!fin) { fin = true; clearInterval(iv); if (next) next(); } };
      s.onerror = function () { if (!fin) { fin = true; clearInterval(iv); console.warn("[NEXT] nicht ladbar:", src); if (next) next(); } };
      (document.body || document.documentElement).appendChild(s); cur = s;
    }
    var cur = null, iv = setInterval(function () {
      if (fin) return; if (cur && !cur.isConnected && tries < 6) go();            // Tag wurde mit dem alten Body entsorgt
      else if (Date.now() - t0 > 45000) { fin = true; clearInterval(iv); console.warn("[NEXT] Zeitueberschreitung:", src); if (next) next(); }
    }, 700);
    go();
  }
  // Basis-Pfad fest ermitteln: nach dem Neuschreiben des Dokuments (Spiel ersetzt den Body, <base href> faellt weg) wuerden
  // relative Pfade wie "next/world.js" auf /next/next/world.js zeigen (404) -> Module fehlten still.
  var BASE = ""; try { var cs = document.currentScript && document.currentScript.src; if (cs) BASE = cs.replace(/next\.js(\?.*)?$/, ""); } catch (e) {}
  if (!BASE) BASE = W.location.origin + W.location.pathname.replace(/[^\/]*$/, "").replace(/\/next\/?$/, "/") + "next/";
  var chain = [];
  if (!off("noworld")) {
    chain.push("world.js");
    if (!off("noenv")) chain.push("env.js");
    if (!off("nologi")) chain.push("logistics.js");
    if (!off("noclicker")) { chain.push("clicker.js"); chain.push("clickfix.js"); }
    if (!off("noextras")) chain.push("extras.js");
    if (!off("nosim")) chain.push("sim.js");
    if (!off("nosim2")) chain.push("sim2.js");
    if (!off("nofactory")) chain.push("factory.js");
  }
  function nextLoad() { var f = chain.shift(); if (f) load(BASE + f, nextLoad); }
  (function waitGame(n) { if (gameReady() || n > 120) nextLoad(); else setTimeout(function () { waitGame(n + 1); }, 250); })(0);
  console.log("[HASHPOOL NEXT] aktiv");
})();
