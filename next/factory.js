/* factory.js — Montagehalle (Fabrik) fuer /next/: neuer Raum hinter der Tuer in der rechten Wand des Hinterraums.
 * 5 Ausbaustufen (Maschinen erscheinen sichtbar), produziert PCs -> sats (auch offline bis 2 h), Abholung am Terminal.
 * Kill-Switch ?nofactory. Kosten/Einnahmen laufen ueber den echten Kontostand. */
(function () {
  var W = window, KEY = "hashpool-next-factory-v1";
  function init() {
    var S = W.Parts3D.nextWorld.S, G = S.G, scn = S.scene, sc = new THREE.Group(), T = G.T, M = G.M, box = G.box, cyl = G.cyl, glow = G.glow, plane = G.plane;
    scn.add(sc);
    var F = { lv: 0, last: Date.now(), stock: 0, made: 0 };
    try { var j = JSON.parse(localStorage.getItem(KEY) || "null"); if (j) { F.lv = j.lv | 0; F.last = j.last || Date.now(); F.stock = j.stock || 0; F.made = j.made || 0; } } catch (e) {}
    function save() { try { localStorage.setItem(KEY, JSON.stringify(F)); } catch (e) {} }
    function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
    var COST = [8000, 25000, 80000, 250000, 800000], RATE = [0, 600, 2400, 8000, 25000, 80000];   // sats pro Minute je Stufe
    var X0 = 4.31, X1 = 10.3, Z0 = -6.6, Z1 = -1.45, CAPMIN = 120;
    /* ---------- Raum ---------- */
    S.rects.push([X0, X1, Z0, Z1]); S.rects.push([3.6, 5.1, -2.6, -1.5]);
    S.doors.push({ a: "B", b: "H", pa: [3.2, -2.05], pb: [5.4, -2.05] });
    var oldRoom = S.roomOf; S.roomOf = function (x, z) { if (x > 4.35 && z < -1.3 && z > -6.8) return "H"; return oldRoom(x, z); };
    var conc = M(0x8a9099, { roughness: 0.95 }), wallm = M(0xb9bec6, { roughness: 0.95 }), dk = M(0x1d222b, { roughness: 0.6, metalness: 0.5 }), steel = M(0xaab2bd, { roughness: 0.35, metalness: 0.85 }), yel = M(0xf2b01e, { roughness: 0.5 }), org = M(0xf7931a, { roughness: 0.5 });
    var cx = (X0 + X1) / 2, w = X1 - X0, d = Z1 - Z0, cz = (Z0 + Z1) / 2;
    sc.add(box(w, 0.12, d, conc, cx, 0.06, cz)); sc.add(box(w, 0.1, d, M(0x2a2f3a, { roughness: 1 }), cx, 3.55, cz));
    sc.add(box(w + 0.3, 3.6, 0.18, wallm, cx, 1.8, Z0 - 0.09)); sc.add(box(0.18, 3.6, d + 0.2, wallm, X1 + 0.09, 1.8, cz)); sc.add(box(w, 3.6, 0.18, wallm, cx, 1.8, Z1 + 0.09));
    sc.add(box(0.05, 3.6, d, M(0x8f949c, { roughness: 0.9 }), X1 - 0.02, 1.8, cz));   // Wand grau statt grellgelb
    // Wandrippen + gelbes Warnband an der Ostwand
    for (var ri = 0; ri <= 8; ri++) sc.add(box(0.08, 3.5, 0.1, dk, X1 - 0.08, 1.8, Z0 + 0.3 + ri * (d - 0.6) / 8));
    sc.add(box(0.06, 0.18, d - 0.2, yel, X1 - 0.07, 0.9, cz)); sc.add(box(0.06, 0.18, d - 0.2, yel, X1 - 0.07, 2.6, cz));
    // Fensterband an der Rueckwand (Oberlichter)
    for (var wi = 0; wi < 5; wi++) { sc.add(box(0.9, 0.5, 0.05, dk, X0 + 0.9 + wi * 1.25, 2.9, Z0 + 0.03)); sc.add(box(0.8, 0.4, 0.04, new THREE.MeshBasicMaterial({ color: 0x9fc4e8 }), X0 + 0.9 + wi * 1.25, 2.9, Z0 + 0.06)); }
    // Deckentraeger
    for (var ti = 0; ti < 5; ti++) { sc.add(box(0.14, 0.22, d, dk, X0 + 0.7 + ti * 1.3, 3.45, cz)); }
    [Z0 + 1.0, cz, Z1 - 1.0].forEach(function (tz) { sc.add(box(w, 0.14, 0.12, steel, cx, 3.3, tz)); });
    for (var h = 0; h < 2; h++) sc.add(box(w, 0.4, 0.04, h ? yel : dk, cx, 0.32 + h * 0.4, Z0 + 0.03));   // Warnstreifen hinten
    [6.0, 8.2].forEach(function (x) { sc.add(box(0.3, 0.05, 4.4, glow(0xe8f2ff), x, 3.48, cz)); });
    try { var pl = new THREE.PointLight(0xfff0d8, 0.85, 12); pl.position.set(cx, 3.0, cz); scn.add(pl); } catch (e) {}
    sc.add(plane(3.6, 0.5, new THREE.MeshBasicMaterial({ map: G.textTex("MONTAGEHALLE", 512, 72, "#10151f", "#f7931a", "bold 46px sans-serif") }), 7.3, 3.0, Z0 + 0.02));
    // Tuerrahmen innen (gelb)
    sc.add(box(0.1, 2.4, 0.08, yel, X0 + 0.15, 1.2, -2.7)); sc.add(box(0.1, 2.4, 0.08, yel, X0 + 0.15, 1.2, -1.4)); sc.add(box(0.1, 0.1, 1.38, yel, X0 + 0.15, 2.45, -2.05));
    /* ---------- Fliessband + Maschinen (nach Stufe sichtbar) ---------- */
    var L = [new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group()]; L.forEach(function (g) { sc.add(g); });
    var BZ = -4.3, cases = [], press, arm1, arm2, armBase, testLed, belt2cases = [], tick0 = 0;
    // Stufe 1: Band + Presse
    var bt = L[0]; bt.add(box(5.2, 0.14, 0.9, dk, 7.4, 0.82, BZ)); bt.add(box(5.0, 0.04, 0.8, M(0x2c3340, { roughness: 0.9 }), 7.4, 0.9, BZ));
    for (var lx = 5.0; lx <= 9.9; lx += 1.0) { bt.add(box(0.1, 0.78, 0.8, dk, lx, 0.45, BZ)); }
    for (var rr0 = 5.1; rr0 < 9.8; rr0 += 0.35) { var ro = cyl(0.05, 0.05, 0.84, steel, rr0, 0.91, BZ, 10); ro.rotation.x = Math.PI / 2; bt.add(ro); }
    for (var c = 0; c < 6; c++) { var cs = new THREE.Group(); cs.add(box(0.62, 0.34, 0.46, M(0x3a414f, { roughness: 0.6, metalness: 0.4 }), 0, 0.2, 0)); cs.add(box(0.4, 0.03, 0.3, glow(0x78d505), 0, 0.38, 0)); cs.add(box(0.64, 0.04, 0.1, org, 0, 0.2, 0.18)); cs.position.set(5.4 + c * 0.75, 0.92, BZ); bt.add(cs); cases.push(cs); }
    press = new THREE.Group(); [-0.55, 0.55].forEach(function (dz) { press.add(box(0.12, 1.9, 0.12, steel, 0, 0.95, dz)); }); var head = box(0.9, 0.35, 1.3, yel, 0, 0, 0); head.position.set(0, 0, 0); var pm = new THREE.Group(); pm.add(head); pm.position.y = 2.0; press.add(pm); press.userData.head = pm; press.position.set(6.6, 0.12, BZ); bt.add(press); bt.add(box(1.1, 0.12, 1.5, dk, 6.6, 2.1, BZ));
    // Stufe 2: Roboterarm
    var rb = L[1]; armBase = cyl(0.4, 0.5, 0.5, dk, 8.3, 0.37, BZ - 1.2, 20); rb.add(armBase); rb.add(cyl(0.3, 0.3, 0.2, org, 8.3, 0.7, BZ - 1.2, 20));
    arm1 = new THREE.Group(); arm1.position.set(8.3, 0.8, BZ - 1.2); arm1.add(box(0.2, 1.1, 0.2, org, 0, 0.55, 0)); arm2 = new THREE.Group(); arm2.position.set(0, 1.1, 0); arm2.add(box(0.16, 0.16, 1.1, org, 0, 0, 0.5)); arm2.add(box(0.28, 0.1, 0.28, dk, 0, -0.1, 1.05)); arm1.add(arm2); rb.add(arm1);
    // Stufe 3: Teststation + Monitor
    var ts = L[2]; ts.add(box(1.4, 1.5, 0.9, dk, 9.0, 1.6, BZ)); ts.add(box(1.3, 0.1, 1.2, yel, 9.0, 2.4, BZ)); ts.add(box(1.4, 0.1, 0.1, dk, 9.0, 0.95, BZ + 0.5)); [-0.62, 0.62].forEach(function (dx) { ts.add(box(0.1, 1.3, 0.1, dk, 9.0 + dx, 0.75, BZ - 0.45)); });
    testLed = box(0.2, 0.2, 0.05, glow(0x78d505), 9.0, 2.0, BZ + 0.47); ts.add(testLed); ts.add(box(0.9, 0.5, 0.05, new THREE.MeshBasicMaterial({ map: G.textTex("TEST OK ✓", 256, 128, "#06240f", "#78d505", "bold 44px monospace") }), 9.0, 1.4, BZ + 0.47));
    // Stufe 4: zweites Band hinten
    var b2 = L[3]; b2.add(box(5.2, 0.14, 0.9, dk, 7.4, 0.82, -5.9)); b2.add(box(5.0, 0.04, 0.8, M(0x2c3340, { roughness: 0.9 }), 7.4, 0.9, -5.9)); for (var l2 = 5.0; l2 <= 9.9; l2 += 1.0) b2.add(box(0.1, 0.78, 0.8, dk, l2, 0.45, -5.9));
    for (var c2 = 0; c2 < 5; c2++) { var k2 = new THREE.Group(); k2.add(box(0.62, 0.34, 0.46, M(0x2e4a6b, { roughness: 0.6, metalness: 0.4 }), 0, 0.2, 0)); k2.add(box(0.4, 0.03, 0.3, glow(0x3a8bff), 0, 0.38, 0)); k2.position.set(5.5 + c2 * 0.9, 0.92, -5.9); b2.add(k2); belt2cases.push(k2); }
    // Stufe 5: KI-Leitstand mit Hologramm + Deckenlampen
    var ai = L[4]; ai.add(box(1.8, 1.0, 0.9, dk, 8.2, 0.62, -1.95)); ai.add(plane(1.6, 0.9, new THREE.MeshBasicMaterial({ map: G.textTex("AI CONTROL", 256, 144, "#0a1830", "#6aa8ff", "bold 40px monospace") }), 8.2, 1.55, -2.42, Math.PI)); ai.holo = cyl(0.3, 0.3, 0.02, glow(0x6aa8ff), 8.2, 1.15, -1.95, 24);
    ai.add(ai.holo); var orb = G.sph(0.18, glow(0x7ff0ff), 8.2, 1.9, -1.95, 16, 12); ai.add(orb); ai.orb = orb;
    [6.5, 8.5].forEach(function (x) { ai.add(box(0.16, 0.16, 4.2, glow(0xf7931a), x, 3.3, cz)); });
    // Paletten / Ausgang
    var pal = new THREE.Group(); sc.add(pal); sc.add(box(1.5, 0.14, 1.2, M(0x8a6a3a, { roughness: 0.9 }), 9.4, 0.19, BZ + 1.7));
    /* ---------- Arbeiter ---------- */
    var workers = [], WSPEC = [[7.4, BZ + 0.95, 1], [8.6, BZ + 0.95, 2]];
    function spawnWorkers() {
      var X = W.Parts3D.shop && W.Parts3D.shop._dbg; if (!X || !X.randomSpec || !S.makeActor || workers.length) return;
      WSPEC.forEach(function (p, i) { if (F.lv < p[2] + (i ? 1 : 0)) return; try { var a = S.makeActor(X.randomSpec({ hair: "cap", shirt: i ? 0xe0a020 : 0xf7931a, scale: 1.0 })); a.g.position.set(p[0], 0.12, p[1]); a.g.rotation.y = Math.PI; a.fac = 1; sc.add(a.g); workers.push(a); } catch (e) { S.err("Fabrikarbeiter: " + e.message); } });
    }
    function applyLevel() { for (var i = 0; i < 5; i++) L[i].visible = F.lv > i; if (ai.holo) ai.visible = F.lv >= 5; }
    function palletUpdate() { var n = Math.min(12, Math.floor(F.stock / Math.max(1, RATE[Math.max(1, F.lv)] * 0.5))); if (pal.userData.n === n) return; pal.userData.n = n; while (pal.children.length) pal.remove(pal.children[0]); for (var i = 0; i < n; i++) { var b = box(0.5, 0.32, 0.4, M(0xb8905c, { roughness: 0.9 }), 9.0 + (i % 3) * 0.5, 0.42 + Math.floor(i / 6) * 0.34, BZ + 1.45 + ((i / 3 | 0) % 2) * 0.45); pal.add(b); } }
    /* ---------- Rechnung ---------- */
    function accrue() {
      var now = Date.now(), dt = Math.max(0, Math.min(CAPMIN * 60000, now - F.last)); F.last = now;
      if (F.lv > 0) { var cap = RATE[F.lv] * CAPMIN; F.stock = Math.min(cap, F.stock + RATE[F.lv] * dt / 60000); }
    }
    /* ---------- Terminal ---------- */
    var TX = 6.3, TZ = -1.7;
    sc.add(box(0.9, 1.0, 0.5, dk, TX, 0.62, TZ)); sc.add(box(1.0, 0.06, 0.6, org, TX, 1.14, TZ)); var sc2 = box(0.8, 0.45, 0.05, new THREE.MeshBasicMaterial({ map: G.textTex("FABRIK", 256, 144, "#0a1830", "#f7931a", "bold 52px sans-serif") }), TX, 1.5, TZ - 0.05); sc2.rotation.x = -0.15; sc.add(sc2);
    S.obst.push([TX - 0.55, TX + 0.55, TZ - 0.35, TZ + 0.35]);
    S.addStation("factory", TX, 1.3, TZ, 1.0, 1.1, 0.6, "🏭 " + T("Fabrik", "Factory"), TX, TZ - 1.0, function () { panel(); });
    function fm(n) { n = Math.floor(n); return n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e4 ? (n / 1e3).toFixed(1) + "K" : String(n); }
    function bal() { try { return Number(W.state.balance) || 0; } catch (e) { return 0; } }
    function panel() {
      accrue(); var h = "<h4>🏭 " + T("Montagehalle", "Assembly hall") + "</h4><p class=\"nx-note\">💰 " + fm(bal()) + " sats</p>";
      h += '<div class="nx-row"><span>' + T("Stufe", "Level") + "</span><b>" + F.lv + " / 5</b></div>";
      h += '<div class="nx-row"><span>' + T("Produktion", "Output") + "</span><b>" + fm(RATE[F.lv]) + " sats/min</b></div>";
      h += '<div class="nx-row"><span>' + T("Im Lager (max. 2 h)", "In storage (max 2 h)") + "</span><b>" + fm(F.stock) + "</b></div>";
      h += '<div class="nx-bt">' + (F.stock >= 1 ? '<button class="pri" data-a="f_collect">💰 ' + T("Einnahmen abholen", "Collect") + "</button>" : "");
      if (F.lv < 5) { var nm = [["Fließband + Presse", "Belt + press"], ["Roboterarm", "Robot arm"], ["Teststation", "Test station"], ["Zweites Band", "Second belt"], ["KI-Leitstand", "AI control"]][F.lv]; h += '<button data-a="f_up">⬆️ ' + (de() ? nm[0] : nm[1]) + " (" + fm(COST[F.lv]) + ")</button>"; }
      h += '<button data-a="close">' + T("Schließen", "Close") + "</button></div>"; S.invShow(h);
    }
    S.invActions.f_collect = function () { accrue(); var n = Math.floor(F.stock); if (n < 1) return; F.stock -= n; F.made++; try { W.state.balance += n; W.state.lifetime = (W.state.lifetime || 0) + n; if (typeof W.save === "function") W.save(); } catch (e) {} save(); S.toast("🏭 +" + fm(n) + " sats"); panel(); };
    S.invActions.f_up = function () { if (F.lv >= 5) return; var c = COST[F.lv]; if (bal() < c) { S.toast(T("Zu wenig Geld (", "Not enough money (") + fm(c) + " sats)"); return; } accrue(); try { W.state.balance -= c; if (typeof W.save === "function") W.save(); } catch (e) {} F.lv++; save(); applyLevel(); spawnWorkers(); S.toast("🏭 " + T("Ausbau auf Stufe ", "Upgraded to level ") + F.lv); panel(); };
    /* ---------- Animation ---------- */
    var acc = 0;
    S.ticks.push(function (dt, t) {
      var rm = S.roomOf(S.px, S.pz); sc.visible = rm === "H" || rm === "B"; if (!sc.visible) { acc += dt; if (acc > 1) { acc = 0; accrue(); } return; }
      var sp = F.lv ? 0.35 + 0.12 * F.lv : 0;
      cases.forEach(function (cs) { cs.position.x += sp * dt * 3; if (cs.position.x > 9.8) cs.position.x = 5.1; });
      belt2cases.forEach(function (cs) { cs.position.x -= sp * dt * 3; if (cs.position.x < 5.1) cs.position.x = 9.8; });
      if (press) press.userData.head.position.y = 2.0 - (0.5 + 0.5 * Math.sin(t * 2.2 * (F.lv ? 1 : 0))) * 0.55;
      if (arm1) { arm1.rotation.y = Math.sin(t * 0.9) * 1.1; arm2.rotation.x = 0.3 + Math.sin(t * 1.8) * 0.35; }
      if (testLed) testLed.material.color.setHex(Math.sin(t * 3) > 0 ? 0x78d505 : 0x1f3a0a);
      if (ai.orb) { ai.orb.position.y = 1.9 + Math.sin(t * 2) * 0.08; ai.holo.rotation.y = t; }
      workers.forEach(function (a) { S.stepActor(a, dt); try { a.ch.armR.rotation.x = -0.9 + Math.sin(t * 4 + a.ph) * 0.35; } catch (e) {} });
      acc += dt; if (acc > 1) { acc = 0; accrue(); palletUpdate(); if (!workers.length && F.lv) spawnWorkers(); }
    });
    applyLevel(); accrue(); palletUpdate(); spawnWorkers();
    W.Parts3D.nextFactory = { state: function () { return F; }, panel: panel };
    console.log("[HASHPOOL NEXT] factory bereit (Montagehalle)");
  }
  var n = 0, iv = setInterval(function () {
    n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined" && W.state) { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); try { W.Parts3D.nextWorld.S.err("factory: " + e.message); } catch (x) {} }
    if (n > 400) clearInterval(iv);
  }, 400);
})();
