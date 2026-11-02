/* logistics.js — HASHPOOL NEXT: Lieferung statt Sofort-Lager (nur in /next/ geladen, Kill-Switch ?nologi=1)
 * Ablauf: 1) am Computer im Hinterraum Teile bestellen (normaler Teile-Shop)
 *         2) Bestellung kommt nach ~25 s im Abholladen rechts neben deinem Laden an (Strasse!)
 *         3) du holst die Pakete dort ab (tragen sie in der Hand)
 *         4) am Regal im Hinterraum raeumst du sie ein -> erst dann sind die Teile im Lager (state.partInv) und baubar.
 * Technik: Nach dem Schliessen des Teile-Shops werden neu gekaufte Teile aus state.partInv in eine Lieferung (localStorage hashpool-next-logi-v1) verschoben.
 * Der Abholladen (Gebaeude, Schalter, Verkaeufer, Pakete) wird hier gebaut.
 */
(function () {
  var W = window;
  if (W.__nxLogi) return; W.__nxLogi = true;
  var KEY = "hashpool-next-logi-v1", DELAY = 25000, CAP = 12;
  var S, G, sc, L = { pend: [], carry: {} }, snap = null, shopWasOpen = false, parcels = null, held = null, clerk = null, heldSig = "", parcelSig = "", depotSt = null;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  function T(a, b) { return de() ? a : b; }
  function M(c, o) { return G.M(c, o); }
  function box(w, h, d, m, x, y, z) { return G.box(w, h, d, m, x, y, z); }
  function load() { try { var j = JSON.parse(localStorage.getItem(KEY) || "null"); if (j && j.pend && j.carry) L = j; } catch (e) {} }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(L)); } catch (e) {} try { if (typeof W.save === "function") W.save(); } catch (e) {} }
  function sum(o) { var n = 0; for (var k in o) n += o[k] || 0; return n; }
  function pendReady() { var now = Date.now(), r = []; L.pend.forEach(function (p) { if (p.t <= now) r.push(p); }); return r; }
  function pendWait() { var now = Date.now(), r = []; L.pend.forEach(function (p) { if (p.t > now) r.push(p); }); return r; }
  function nameOf(id) { return S && S.partName ? S.partName(id) : id; }

  /* ---------- Teile-Shop beobachten: neu gekaufte Teile in Lieferung umleiten ---------- */
  function shopOpenNow() { var e = document.getElementById("ps-overlay"); if (!e) return false; var cs = W.getComputedStyle(e); return cs.display !== "none" && cs.visibility !== "hidden"; }
  function watch() {
    var open = shopOpenNow(), inv = (W.state && W.state.partInv) || null; if (!inv) return;
    if (open && !shopWasOpen) { snap = {}; for (var k in inv) snap[k] = inv[k] || 0; }
    if (!open && shopWasOpen && snap) {
      var moved = 0, now = Date.now();
      Object.keys(inv).forEach(function (id) {
        var d = (inv[id] || 0) - (snap[id] || 0);
        if (d > 0) { inv[id] -= d; if (inv[id] <= 0) delete inv[id]; L.pend.push({ id: id, n: d, t: now + DELAY }); moved += d; }
      });
      snap = null;
      if (moved > 0) { persist(); if (S) { S.toast(T("📦 Bestellung unterwegs (" + moved + " Teile). Hol sie im Abholladen ab!", "📦 Order on its way (" + moved + " parts). Collect it at the pickup store!")); S.sig = ""; } }
    }
    shopWasOpen = open;
  }

  /* ---------- Abholladen (Gebaeude rechts neben dem Laden) ---------- */
  function buildDepot() {
    var tile = M(0xffffff, { map: G.rep(G.tex("tile"), 5.8, 4.1), roughness: 0.8 }), wall = M(0xffffff, { map: G.rep(G.tex("plasterWarm"), 4, 2), roughness: 0.95 }), fw = M(0x1b2233, { roughness: 0.8 }), trim = M(0x161a22, { roughness: 0.6 });
    sc.add(box(6.1, 0.12, 4.2, tile, 7.55, 0.06, 1.4));
    sc.add(box(6.3, 0.1, 4.3, M(0x242c3e, { roughness: 1 }), 7.55, 3.55, 1.4));
    sc.add(box(6.3, 3.6, 0.18, wall, 7.55, 1.8, -0.7)); sc.add(box(0.18, 3.6, 4.4, wall, 10.6, 1.8, 1.4));
    sc.add(box(2.05, 3.6, 0.16, fw, 5.525, 1.8, 3.55)); sc.add(box(2.35, 3.6, 0.16, fw, 9.425, 1.8, 3.55)); sc.add(box(1.7, 1.0, 0.16, fw, 7.4, 3.1, 3.55));
    sc.add(box(0.06, 2.6, 0.12, trim, 6.55, 1.3, 3.55)); sc.add(box(0.06, 2.6, 0.12, trim, 8.25, 1.3, 3.55));
    sc.add(box(4.8, 0.9, 0.12, M(0x10151f, { roughness: 0.7 }), 7.4, 3.1, 3.62)); sc.add(G.plane(4.6, 0.75, new THREE.MeshBasicMaterial({ map: G.textTex("ABHOLLADEN · HASH-PARTS", 1024, 160, "#10151f", "#6aa8ff", "bold 78px sans-serif") }), 7.4, 3.1, 3.69));
    sc.add(box(4.6, 0.05, 0.9, M(0x6aa8ff, { emissive: 0x2a5ab0, emissiveIntensity: 0.6 }), 7.4, 2.7, 3.95));
    sc.add(box(1.6, 0.01, 0.05, new THREE.MeshBasicMaterial({ color: 0xf7931a }), 7.4, 0.13, 3.3));
    var lt = new THREE.PointLight(0xfff0d6, 0.9, 8); lt.position.set(7.4, 3.0, 1.4); sc.add(lt); sc.add(box(2.6, 0.05, 0.3, new THREE.MeshBasicMaterial({ color: 0xfff4dc }), 7.4, 3.48, 1.4));
    // Schalter
    var wood = M(0x3a2a1f, { roughness: 0.6 }), top = M(0x6e5740, { roughness: 0.5 });
    sc.add(box(3.9, 1.0, 0.7, wood, 7.4, 0.62, 1.0)); sc.add(box(4.0, 0.06, 0.8, top, 7.4, 1.15, 1.0));
    sc.add(box(0.5, 0.34, 0.03, M(0x15181e), 8.9, 1.38, 0.8)); sc.add(box(0.46, 0.3, 0.01, new THREE.MeshBasicMaterial({ color: 0x2a8cff }), 8.9, 1.38, 0.82)); sc.add(G.plane(1.4, 0.2, new THREE.MeshBasicMaterial({ map: G.textTex("ABHOLUNG", 256, 50, "#10151f", "#6aa8ff", "bold 34px sans-serif") }), 7.4, 1.0, 1.36));
    S.obst.push([5.5, 9.3, 0.6, 1.4]);
    // Regale mit Paketen an der Rueckwand
    var sm = M(0x2d3646, { metalness: 0.5, roughness: 0.5 }), cb = M(0xb8905c, { roughness: 0.9 });
    sc.add(box(5.2, 2.5, 0.08, M(0x1a202c), 7.55, 1.35, -0.55)); for (var lv = 0; lv < 4; lv++) sc.add(box(5.2, 0.05, 0.5, sm, 7.55, 0.2 + lv * 0.8, -0.3));
    [5.0, 7.55, 10.1].forEach(function (x) { sc.add(box(0.06, 2.6, 0.5, sm, x, 1.3, -0.3)); });
    for (var l = 0; l < 3; l++) for (var n = 0; n < 11; n++) { if (Math.random() < 0.3) continue; var h = G.rr(0.25, 0.5); sc.add(box(G.rr(0.3, 0.42), h, 0.36, cb, 5.2 + n * 0.45, 0.23 + l * 0.8 + h / 2, -0.28)); }
    S.obst.push([4.9, 10.2, -0.7, -0.05]);
    // Absperrpfosten + Pflanze
    [[5.6, 2.9], [9.2, 2.9]].forEach(function (p) { sc.add(G.cyl(0.05, 0.05, 0.9, M(0xc0c4cc, { metalness: 0.9 }), p[0], 0.57, p[1], 8)); sc.add(G.sph(0.07, M(0xf7931a), p[0], 1.05, p[1], 8, 6)); });
    S.rects.push([4.5, 10.5, -0.6, 3.47], [6.55, 8.25, 2.8, 4.3]);
    S.doors.push({ a: "E", b: "F", pa: [7.4, 4.6], pb: [7.4, 2.6] });
    var oldRoom = S.roomOf; S.roomOf = function (x, z) { if (x > 4.5 && z < 3.47 && z > -0.7) return "F"; return oldRoom(x, z); };
    // Verkaeufer
    var D = W.Parts3D && Parts3D.shop && Parts3D.shop._dbg;
    if (D && D.randomSpec && S.makeActor) { try { clerk = S.makeActor(D.randomSpec({ hair: "cap", shirt: 0x3a5fa8, scale: 1.0 })); clerk.g.position.set(7.4, 0.12, 0.05); sc.add(clerk.g); } catch (e) { S.err("Verkäufer: " + e.message); } }
    parcels = new THREE.Group(); sc.add(parcels);
    depotSt = S.addStation("depot", 7.4, 1.3, 1.0, 4.0, 1.2, 0.9, "📦 " + T("Abholladen", "Pickup store"), 7.4, 1.95, depotAction);
  }
  function rebuildParcels() {
    var ready = pendReady(), n = Math.min(10, sum(ready.reduce(function (a, p) { a[p.id] = (a[p.id] || 0) + p.n; return a; }, {}))), sig = String(n);
    if (sig === parcelSig) return; parcelSig = sig;
    while (parcels.children.length) parcels.remove(parcels.children[0]);
    var cb = M(0xc79a62, { roughness: 0.9 }), tape = M(0xe8d8a8, { roughness: 0.5 });
    for (var i = 0; i < n; i++) { var x = 5.8 + (i % 5) * 0.75, z = 0.9 + Math.floor(i / 5) * 0.25 - 0.05, h = 0.22 + (i % 3) * 0.05; parcels.add(box(0.5, h, 0.4, cb, x, 1.18 + h / 2, z)); parcels.add(box(0.52, 0.01, 0.06, tape, x, 1.18 + h + 0.005, z)); parcels.add(box(0.12, 0.08, 0.005, M(0xffffff), x + 0.12, 1.18 + h * 0.5, z + 0.205)); }
  }

  /* ---------- Tragen ---------- */
  function rebuildHeld() {
    var n = sum(L.carry), sig = String(n); if (sig === heldSig) return; heldSig = sig;
    if (!held) { held = new THREE.Group(); held.position.set(0.0, -0.36, -0.62); S.cam.add(held); }
    while (held.children.length) held.remove(held.children[0]);
    var k = n === 0 ? 0 : Math.min(3, 1 + Math.floor(n / 4)), cb = M(0xc79a62, { roughness: 0.9 }), tape = M(0xe8d8a8);
    for (var i = 0; i < k; i++) { var b = box(0.42, 0.24, 0.32, cb, (i - (k - 1) / 2) * 0.01, i * 0.25, 0); held.add(b); held.add(box(0.44, 0.01, 0.06, tape, 0, i * 0.25 + 0.125, 0)); held.add(box(0.12, 0.08, 0.005, M(0xffffff), 0.12, i * 0.25, 0.165)); }
  }

  /* ---------- Aktionen ---------- */
  function depotAction() {
    var ready = pendReady(), wait = pendWait(), h = "<h4>📦 " + T("Abholladen", "Pickup store") + "</h4>";
    var cur = sum(L.carry);
    if (cur) h += '<p class="nx-note">' + T("Du trägst schon ", "You are already carrying ") + cur + T(" Teile. Bring sie erst ins Regal (Hinterraum).", " parts. Take them to the shelf first (back room).") + "</p>";
    if (!ready.length && !wait.length) h += "<p>" + T("Keine Bestellung offen. Bestelle Teile am Computer im Hinterraum.", "No open orders. Order parts at the computer in the back room.") + "</p>";
    if (wait.length) { var s = Math.max(1, Math.ceil((Math.min.apply(null, wait.map(function (p) { return p.t; })) - Date.now()) / 1000)); h += '<p class="nx-note">🚚 ' + T("Noch unterwegs: ", "Still on the way: ") + sum(wait.reduce(function (a, p) { a[p.id] = (a[p.id] || 0) + p.n; return a; }, {})) + T(" Teile (in ~", " parts (in ~") + s + " s)</p>"; }
    ready.forEach(function (p) { h += '<div class="nx-row"><span>' + nameOf(p.id) + "</span><b>×" + p.n + "</b></div>"; });
    h += '<div class="nx-bt">' + (ready.length && cur < CAP ? '<button class="pri" data-a="takeall">📦 ' + T("Mitnehmen", "Take") + "</button>" : "") + '<button data-a="close">' + T("Schließen", "Close") + "</button></div>";
    S.invShow(h);
  }
  function takeAll() {
    var free = CAP - sum(L.carry), took = 0, rest = [];
    L.pend.forEach(function (p) {
      if (p.t > Date.now() || free <= 0) { rest.push(p); return; }
      var t = Math.min(p.n, free); L.carry[p.id] = (L.carry[p.id] || 0) + t; free -= t; took += t; if (p.n - t > 0) rest.push({ id: p.id, n: p.n - t, t: p.t });
    });
    L.pend = rest; persist(); S.invClose(); parcelSig = ""; rebuildParcels(); rebuildHeld();
    if (took) S.toast(T("📦 " + took + " Teile eingepackt. Bring sie zum Regal im Hinterraum.", "📦 " + took + " parts packed. Take them to the shelf in the back room.")); if (sum(L.pend) - sum(pendWait()) > 0 && free <= 0) S.toast(T("Du kannst nicht mehr tragen – komm nochmal wieder.", "You can't carry more – come back again."));
  }
  function stock() {
    var inv = W.state.partInv = W.state.partInv || {}, n = 0;
    Object.keys(L.carry).forEach(function (id) { inv[id] = (inv[id] || 0) + L.carry[id]; n += L.carry[id]; }); L.carry = {};
    persist(); S.invClose(); heldSig = ""; rebuildHeld(); S.sig = ""; S.rebuildShelf();
    S.toast(T("✅ " + n + " Teile ins Regal geräumt", "✅ " + n + " parts put on the shelf"));
  }
  function subText() {
    var a = [], c = sum(L.carry), r = sum(pendReady().reduce(function (x, p) { x[p.id] = (x[p.id] || 0) + p.n; return x; }, {})), w = sum(pendWait().reduce(function (x, p) { x[p.id] = (x[p.id] || 0) + p.n; return x; }, {}));
    if (c) a.push("🧳 " + T("trägst ", "carrying ") + c + " → " + T("Regal", "shelf")); if (r) a.push("📦 " + T("abholbereit ", "ready ") + r + " → " + T("Abholladen", "pickup")); if (w) a.push("🚚 " + w + T(" unterwegs", " en route"));
    return a.join("  ·  ");
  }

  function init() {
    S = W.Parts3D.nextWorld.S; G = S.G; sc = S.scene; load();
    buildDepot(); rebuildHeld(); rebuildParcels();
    S.invActions.takeall = takeAll; S.invActions.stock = stock;
    S.shelfExtra = function () { var c = sum(L.carry); if (!c) return ""; var h = '<p class="nx-note">🧳 ' + T("Du trägst: ", "You carry: ") + "</p>"; Object.keys(L.carry).forEach(function (id) { h += '<div class="nx-row"><span>' + nameOf(id) + "</span><b>×" + L.carry[id] + "</b></div>"; }); h += '<div class="nx-bt"><button class="pri" data-a="stock">📥 ' + T("Einräumen", "Put on shelf") + " (" + c + ")</button></div>"; return h; };
    S.subText = subText;
    S.ticks.push(function (dt) { if (clerk) S.stepActor(clerk, dt); S.lgT = (S.lgT || 0) + dt; if (S.lgT > 0.5) { S.lgT = 0; rebuildParcels(); rebuildHeld(); if (depotSt && depotSt.el) { var r = pendReady().length; depotSt.el.textContent = (r ? "❗ " : "") + "📦 " + T("Abholladen", "Pickup store"); } } });
    setInterval(function () { try { watch(); } catch (e) { S.err("logistics: " + e.message); } }, 300);
    W.Parts3D.nextLogi = { state: function () { return L; }, depot: depotAction, take: takeAll, stock: stock };
    console.log("[HASHPOOL NEXT] logistics bereit (Abholladen)");
  }
  var n = 0, iv = setInterval(function () {
    n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined" && W.state) { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); try { W.Parts3D.nextWorld.S.err("logistics: " + e.message); } catch (x) {} console.warn("[logi]", e); }
    if (n > 400) clearInterval(iv);
  }, 400);
})();
