/* farmRoom loader — pulls known-good build from pinned commit (file too large for some push paths) */
(function () {
  var W = window;
  if (W.__farmRoom) return;
  if (/[?&]nofarm(=|&|$)/.test(String(W.location && W.location.search))) return;
  var urls = [
    "https://cdn.jsdelivr.net/gh/KI-king222/Bitcoin-Clicker@98a2051876686a35cd8dced32a566924e5e17a6e/js/parts3d/farmRoom.js",
    "https://raw.githubusercontent.com/KI-king222/Bitcoin-Clicker/98a2051876686a35cd8dced32a566924e5e17a6e/js/parts3d/farmRoom.js"
  ];
  function load(i) {
    if (i >= urls.length) { console.warn("[farmRoom] restore failed"); return; }
    fetch(urls[i], { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (t) {
        if (!t || t.indexOf("function hookSell") < 0) throw new Error("bad body");
        try { (0, eval)(t); } catch (e) { console.warn("[farmRoom] eval", e); }
      })
      .catch(function (e) { console.warn("[farmRoom] try", i, e); load(i + 1); });
  }
  load(0);
})();
