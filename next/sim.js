/* sim.js — Simulator-Extras fuer /next/: Regen, Lieferwagen am Abholladen, Zufalls-Ereignisse.
 * Haengt sich per S.ticks ein; Kill-Switch ?nosim. Alles rein optisch/komfortabel, ohne Geld-Eingriffe. */
(function () {
  var W = window;
  function init() {
    var S = W.Parts3D.nextWorld.S, G = S.G, sc = S.scene, T = G.T, rr = G.rr, rnd = G.rnd, M = G.M, box = G.box, cyl = G.cyl, plane = G.plane;
    /* ---------- Regen ---------- */
    var N = 380, pos = new Float32Array(N * 6), rainOn = false, rainT = rr(90, 200), rainLeft = 0, rain = null, fogFar0 = S.scene.fog ? S.scene.fog.far : 70;
    var DX = 16, DY = 9, DZ = 16, drops = [];
    for (var i = 0; i < N; i++) drops.push([rr(-DX, DX), rr(0, DY), rr(-DZ, DZ), rr(11, 16)]);
    try {
      var geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      rain = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xa9bdd8, transparent: true, opacity: 0.45 })); rain.frustumCulled = false; rain.visible = false; sc.add(rain);
    } catch (e) { rain = null; S.err("sim/rain: " + e.message); }
    function setRain(on) {
      rainOn = on; S.raining = on; if (on) { rainLeft = rr(60, 130); S.toast(T("🌧️ Es fängt an zu regnen – mehr Leute suchen Unterschlupf im Laden", "🌧️ It starts to rain – more people duck into the shop")); }
      else { rainT = rr(180, 420); S.toast(T("🌤️ Der Regen hört auf", "🌤️ The rain stops")); }
    }
    S.setRain = setRain;
    function stepRain(dt) {
      if (!rainOn) { rainT -= dt; if (rainT <= 0) setRain(true); } else { rainLeft -= dt; if (rainLeft <= 0) setRain(false); }
      var fo = S.scene.fog; if (fo && !S.fogLocked) { var want = rainOn ? Math.min(fogFar0, 38) : fogFar0; fo.far += (want - fo.far) * Math.min(1, dt * 0.8); }
      if (!rain) return; var out = S.roomOf(S.px, S.pz) === "E" || S.roomOf(S.px, S.pz) === "F"; rain.visible = rainOn && out; if (!rain.visible) return;
      var cx = S.px, cz = S.pz;
      for (var k = 0; k < N; k++) {
        var d = drops[k]; d[1] -= d[3] * dt; if (d[1] < 0) { d[1] += DY; d[0] = rr(-DX, DX); d[2] = rr(-DZ, DZ); }
        var x = cx + d[0], z = cz + d[2], j = k * 6; pos[j] = x; pos[j + 1] = d[1]; pos[j + 2] = z; pos[j + 3] = x + 0.03; pos[j + 4] = d[1] + 0.5; pos[j + 5] = z + 0.02;
      }
      rain.geometry.attributes.position.needsUpdate = true;
    }
    /* ---------- Lieferwagen ---------- */
    var van = new THREE.Group(), body = M(0xf2f4f7, { roughness: 0.5 }), dk = M(0x1b1f27, { roughness: 0.6 }), org = M(0xf7931a, { roughness: 0.5 });
    van.add(box(3.4, 1.55, 1.8, body, 0, 1.15, 0)); van.add(box(1.25, 1.05, 1.76, body, 2.25, 0.95, 0)); van.add(box(0.05, 0.55, 1.5, M(0x2a3a52, { metalness: 0.6, roughness: 0.2 }), 2.88, 1.15, 0));
    van.add(box(3.4, 0.2, 1.84, org, 0, 0.6, 0)); van.add(box(0.2, 0.28, 1.9, dk, 3.0, 0.42, 0)); van.add(box(0.2, 0.28, 1.9, dk, -1.8, 0.42, 0));
    [[-1.0, 0.9], [-1.0, -0.9], [2.2, 0.9], [2.2, -0.9]].forEach(function (p) { var w = cyl(0.36, 0.36, 0.26, dk, p[0], 0.36, p[1], 18); w.rotation.x = Math.PI / 2; van.add(w); var h = cyl(0.17, 0.17, 0.28, M(0xb9c0cc, { metalness: 0.8, roughness: 0.3 }), p[0], 0.36, p[1], 12); h.rotation.x = Math.PI / 2; van.add(h); });
    [1, -1].forEach(function (sd) {
      van.add(plane(2.6, 0.5, new THREE.MeshBasicMaterial({ map: G.textTex("HASHPOOL  EXPRESS", 512, 100, "#f2f4f7", "#f7931a", "bold 52px sans-serif") }), -0.2, 1.3, sd * 0.91, sd > 0 ? 0 : Math.PI));
    });
    van.add(box(0.06, 0.2, 0.3, G.glow(0xfff2c0), 3.0, 0.78, 0.6)); van.add(box(0.06, 0.2, 0.3, G.glow(0xfff2c0), 3.0, 0.78, -0.6)); van.add(box(0.06, 0.16, 0.3, G.glow(0xff3030), -1.72, 0.78, 0.7)); van.add(box(0.06, 0.16, 0.3, G.glow(0xff3030), -1.72, 0.78, -0.7));
    van.visible = false; van.position.set(-30, 0, 5.9); sc.add(van);
    var vs = { on: false, st: 0, wait: 0 }, seen = {}, first = true, TARGET = 7.4;
    function vanTrigger() { if (!vs.on) { vs.on = true; vs.st = 0; vs.wait = 0; van.visible = true; van.position.x = TARGET - 38; } }
    function watchLogi() {
      var Lg = W.Parts3D.nextLogi; if (!Lg) return; var now = Date.now(), fresh = false;
      Lg.state().pend.forEach(function (p) { var k = p.id + "|" + p.t; if (p.t <= now && !seen[k]) { seen[k] = 1; fresh = true; } });
      if (fresh && !first) vanTrigger(); first = false;
    }
    function stepVan(dt) {
      if (!vs.on) return; var x = van.position.x;
      if (vs.st === 0) { var sp = Math.max(1.2, Math.min(9, (TARGET - x) * 1.1)); van.position.x += sp * dt; if (TARGET - van.position.x < 0.05) { vs.st = 1; vs.wait = 0; S.toast(T("🚚 Der Lieferwagen ist am Abholladen angekommen", "🚚 The delivery van arrived at the pickup store")); } }
      else if (vs.st === 1) { vs.wait += dt; if (vs.wait > 9) vs.st = 2; }
      else { van.position.x += Math.min(9, 1.5 + (van.position.x - TARGET) * 1.3) * dt; if (van.position.x > TARGET + 38) { vs.on = false; van.visible = false; } }
    }
    /* ---------- Ereignisse ---------- */
    var evT = rr(120, 240);
    var EV = [
      function () { S.addRep && S.addRep(5); S.toast(T("🏅 Ein Stammkunde empfiehlt deinen Laden weiter: +5 ⭐", "🏅 A regular recommends your shop: +5 ⭐")); },
      function () { S.nextCust = 1; S.addRep && S.addRep(3); S.toast(T("📰 Zeitungsbericht über den Laden – gleich kommt Kundschaft! +3 ⭐", "📰 Newspaper feature – customers incoming! +3 ⭐")); },
      function () { var Lg = W.Parts3D.nextLogi, any = false; if (Lg) Lg.state().pend.forEach(function (p) { if (p.t > Date.now()) { p.t = Date.now() - 1; any = true; } }); S.toast(any ? T("⚡ Express-Zustellung: deine Bestellung ist sofort abholbereit", "⚡ Express delivery: your order is ready for pickup now") : T("📦 Der Paketdienst fragt nach Aufträgen – gerade nichts offen", "📦 The courier asks for jobs – nothing open right now")); },
      function () { S.setRain && !rainOn && setRain(true); }
    ];
    function stepEvents(dt) { if (S.dlg || S.invOpen) return; evT -= dt; if (evT <= 0) { evT = rr(150, 320); try { rnd(EV)(); } catch (e) {} } }
    var wt = 0;
    S.ticks.push(function (dt) { stepRain(dt); stepVan(dt); stepEvents(dt); wt += dt; if (wt > 1) { wt = 0; watchLogi(); } });
    W.Parts3D.nextSim = { rain: setRain, van: vanTrigger, event: function (i) { EV[i](); } };
    console.log("[HASHPOOL NEXT] sim bereit (Regen, Lieferwagen, Ereignisse)");
  }
  var n = 0, iv = setInterval(function () {
    n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined") { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); try { W.Parts3D.nextWorld.S.err("sim: " + e.message); } catch (x) {} }
    if (n > 400) clearInterval(iv);
  }, 400);
})();
