/* farmhall.js — Server-Farm-Halle fuer /next/: echter Raum hinter der Tuer in der Rueckwand des Hinterraums.
 * Server-Racks (Anzahl waechst mit den gekauften Minern), Kabeltrassen, Klimageraete, Lueftungsrohre, Leitstand mit Live-Anzeige.
 * Ersetzt die alte "Farm-Tuer" (Theke). Kill-Switch ?nofarmhall. */
(function () {
  var W = window;
  function init() {
    var S = W.Parts3D.nextWorld.S, G = S.G, scn = S.scene, sc = new THREE.Group(), T = G.T, M = G.M, box = G.box, cyl = G.cyl, glow = G.glow, plane = G.plane, rr = G.rr, rnd = G.rnd;
    scn.add(sc);   // eigene Gruppe: wird ausgeblendet, wenn der Spieler weit weg ist (spart Draw-Calls)
    var Z0 = -13.6, Z1 = -6.8, XW = 4.31, CZ = (Z0 + Z1) / 2;
    S.rects.push([-XW, XW, Z0, Z1]); S.rects.push([-1.75, -0.55, -7.6, -5.6]);
    S.doors.push({ a: "B", b: "I", pa: [-1.15, -5.7], pb: [-1.15, -7.5] });
    var oldRoom = S.roomOf; S.roomOf = function (x, z) { if (z < -6.75 && x > -4.4 && x < 4.4) return "I"; return oldRoom(x, z); };
    /* ---------- Texturen ---------- */
    var floorTex = G.ctex(256, 256, function (g, w, h) { g.fillStyle = "#6c727c"; g.fillRect(0, 0, w, h); for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) { var gr = g.createLinearGradient(i * 128, j * 128, i * 128 + 128, j * 128 + 128); gr.addColorStop(0, "#80868f"); gr.addColorStop(1, "#666c76"); g.fillStyle = gr; g.fillRect(i * 128 + 3, j * 128 + 3, 122, 122); } g.fillStyle = "#4b5059"; for (var k = 0; k < 2; k++) for (var m = 0; m < 2; m++) { g.fillRect(k * 128 + 1, m * 128 + 1, 4, 4); g.fillRect(k * 128 + 123, m * 128 + 123, 4, 4); } G.speckle(g, w, h, 500, ["rgba(0,0,0,.08)", "rgba(255,255,255,.05)"], 2); });
    var perfTex = G.ctex(128, 128, function (g, w, h) { g.fillStyle = "#3d424b"; g.fillRect(0, 0, w, h); g.fillStyle = "#14171c"; for (var y = 10; y < h; y += 14) for (var x = 10 + ((y / 14 | 0) % 2) * 7; x < w; x += 14) { g.beginPath(); g.arc(x, y, 4, 0, 6.3); g.fill(); } });
    var wallTex = G.ctex(256, 256, function (g, w, h) { g.fillStyle = "#c5cad2"; g.fillRect(0, 0, w, h); G.speckle(g, w, h, 900, ["rgba(0,0,0,.05)", "rgba(255,255,255,.07)"], 2); g.fillStyle = "rgba(0,0,0,.06)"; for (var i = 0; i < w; i += 64) g.fillRect(i, 0, 2, h); });
    function rackTex(accent, seed) {
      return G.ctex(128, 512, function (g, w, h) {
        g.fillStyle = "#12151a"; g.fillRect(0, 0, w, h); var n = 10, uh = (h - 16) / n;
        for (var u = 0; u < n; u++) {
          var y = 8 + u * uh, gr = g.createLinearGradient(0, y, 0, y + uh); gr.addColorStop(0, "#2a2f38"); gr.addColorStop(0.5, "#1d2128"); gr.addColorStop(1, "#14171c"); g.fillStyle = gr; g.fillRect(6, y + 2, w - 12, uh - 4);
          g.fillStyle = "#0a0c10"; for (var vx = 0; vx < 6; vx++) for (var vy = 0; vy < 3; vy++) g.fillRect(12 + vx * 7, y + 8 + vy * 10, 4, 6);
          for (var b = 0; b < 4; b++) { g.fillStyle = "#0d1014"; g.fillRect(62 + b * 14, y + 7, 12, uh - 16); g.fillStyle = ((u + b + seed) % 3 ? "#2fd36b" : "#f0a020"); g.fillRect(64 + b * 14, y + uh - 13, 3, 3); }
          g.fillStyle = accent; g.fillRect(w - 16, y + 8, 5, 5); g.fillStyle = "#58606c"; g.fillRect(w - 22, y + uh - 14, 12, 2);
        }
        g.fillStyle = "rgba(255,255,255,.04)"; g.fillRect(0, 0, 14, h);
      });
    }
    var backTex = G.ctex(128, 512, function (g, w, h) {
      g.fillStyle = "#101318"; g.fillRect(0, 0, w, h); var n = 10, uh = (h - 16) / n;
      for (var u = 0; u < n; u++) {
        var y = 8 + u * uh; g.fillStyle = "#1a1e25"; g.fillRect(6, y + 2, w - 12, uh - 4);
        for (var f = 0; f < 2; f++) { var cx = 34 + f * 46, cy = y + uh / 2; g.fillStyle = "#0a0c10"; g.beginPath(); g.arc(cx, cy, 17, 0, 6.3); g.fill(); g.strokeStyle = "#3a414c"; g.lineWidth = 2; g.stroke(); for (var b = 0; b < 7; b++) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(b * 0.9) * 13, cy + Math.sin(b * 0.9) * 13); g.strokeStyle = "#252a32"; g.lineWidth = 3; g.stroke(); } }
        g.fillStyle = "#2b303a"; g.fillRect(w - 26, y + 8, 14, uh - 16); g.fillStyle = "#58606c"; g.fillRect(w - 24, y + 12, 10, 3);
      }
      var cols = ["#f7931a", "#3a8bff", "#78d505", "#d9d9d9"]; for (var c = 0; c < 9; c++) { g.strokeStyle = cols[c % 4]; g.lineWidth = 3; g.beginPath(); var x0 = 12 + (c * 13) % 100, yy = 30 + (c * 61) % 400; g.moveTo(x0, yy); g.bezierCurveTo(x0 + 18, yy + 40, x0 - 20, yy + 80, x0 + 6, yy + 130); g.stroke(); }
    });
    var rt = [rackTex("#3a8bff", 0), rackTex("#f7931a", 1), rackTex("#78d505", 2)];
    /* ---------- Raum ---------- */
    var dk = M(0x1b1f27, { roughness: 0.55, metalness: 0.55 }), steel = M(0xaab2bd, { roughness: 0.35, metalness: 0.85 }), yel = M(0xf2b01e, { roughness: 0.5 }), blue = M(0x2a5fb0, { roughness: 0.5 });
    var W0 = 2 * XW + 0.2, DL = Z1 - Z0;
    var ft = G.rep(floorTex, 8, 6); sc.add(box(W0, 0.12, DL, M(0xffffff, { map: ft, roughness: 0.6, metalness: 0.2 }), 0, 0.06, CZ));
    var cp = plane(1.5, 1.2, M(0xffffff, { map: perfTex, roughness: 0.5, metalness: 0.4 }), 0, 0.125, -11.0); cp.rotation.x = -Math.PI / 2; cp.scale.set(2.6, 1, 1); sc.add(cp);   // perforierte Kaltgang-Platten
    sc.add(box(W0, 0.1, DL, M(0x20252f, { roughness: 1 }), 0, 3.55, CZ));
    var wm = M(0xffffff, { map: G.rep(wallTex, 6, 2), roughness: 0.9 });
    sc.add(box(W0, 3.6, 0.18, wm, 0, 1.8, Z0 - 0.09)); sc.add(box(0.18, 3.6, DL, wm, -XW - 0.09, 1.8, CZ)); sc.add(box(0.18, 3.6, DL, wm, XW + 0.09, 1.8, CZ));
    [[0, Z0 + 0.02, W0, 0], [-XW + 0.02, CZ, DL, 1], [XW - 0.02, CZ, DL, 1]].forEach(function (p) { var ho = p[3]; sc.add(box(ho ? 0.04 : p[2], 0.5, ho ? p[2] : 0.04, blue, p[0], 1.0, p[1])); sc.add(box(ho ? 0.045 : p[2], 0.06, ho ? p[2] : 0.045, yel, p[0], 1.28, p[1])); });
    // Sockel-/Eckleisten
    [-XW + 0.04, XW - 0.04].forEach(function (x) { sc.add(box(0.06, 0.16, DL, dk, x, 0.2, CZ)); }); sc.add(box(W0, 0.16, 0.06, dk, 0, 0.2, Z0 + 0.04));
    // Deckenlicht (laenglich) + Lueftungsrohre + Kabeltrassen
    for (var lz = -8.0; lz > -13.2; lz -= 1.7) sc.add(box(7.6, 0.05, 0.2, glow(0xeaf3ff), 0, 3.48, lz));
    [-9.95, -12.05].forEach(function (z, ri) {
      sc.add(box(7.4, 0.06, 0.5, steel, 0, 3.0, z)); for (var tx = -3.6; tx <= 3.6; tx += 0.45) sc.add(box(0.03, 0.05, 0.52, steel, tx, 3.02, z));
      sc.add(box(7.4, 0.04, 0.04, dk, 0, 3.06, z - 0.24)); sc.add(box(7.4, 0.04, 0.04, dk, 0, 3.06, z + 0.24));
      var cc = [0xf7931a, 0x3a8bff, 0x78d505, 0xe0e0e0]; for (var cb = 0; cb < 4; cb++) { var cw = cyl(0.025, 0.025, 7.2, M(cc[cb]), 0, 3.07, z - 0.15 + cb * 0.1, 8); cw.rotation.z = Math.PI / 2; sc.add(cw); }
    });
    var duct = cyl(0.3, 0.3, 8.2, M(0xb9c0cc, { roughness: 0.35, metalness: 0.8 }), 0, 3.25, -7.9, 24); duct.rotation.z = Math.PI / 2; sc.add(duct);
    for (var fx = -3.8; fx <= 3.8; fx += 1.9) { var fl = cyl(0.34, 0.34, 0.08, steel, fx, 3.25, -7.9, 24); fl.rotation.z = Math.PI / 2; sc.add(fl); }
    var d2 = cyl(0.22, 0.22, 3.2, M(0xb9c0cc, { roughness: 0.35, metalness: 0.8 }), 3.2, 3.25, -9.4, 20); d2.rotation.x = Math.PI / 2; sc.add(d2);
    // Hinterwand: Schild + Notausgang
    sc.add(plane(3.8, 0.5, new THREE.MeshBasicMaterial({ map: G.textTex("SERVER-FARM  ·  HASHPOOL", 640, 80, "#10151f", "#78d505", "bold 46px sans-serif") }), 0, 2.9, Z0 + 0.02));
    sc.add(plane(0.7, 0.28, new THREE.MeshBasicMaterial({ map: G.textTex("EXIT", 160, 64, "#0c5a2a", "#eafff0", "bold 32px sans-serif") }), -1.15, 2.7, Z1 + 0.02));
    /* ---------- Klimageraete (links/rechts am Eingang) ---------- */
    var fans = [];
    function crac(x, ry) {
      var g = new THREE.Group(); g.position.set(x, 0, -7.9); g.rotation.y = ry; sc.add(g);
      g.add(box(1.25, 2.15, 0.95, M(0xdfe3e8, { roughness: 0.45, metalness: 0.3 }), 0, 1.2, 0)); g.add(box(1.3, 0.1, 1.0, dk, 0, 0.17, 0)); g.add(box(1.3, 0.06, 1.0, dk, 0, 2.31, 0));
      for (var i = 0; i < 2; i++) { var fy = 0.95 + i * 0.85; var hb = cyl(0.34, 0.34, 0.03, dk, 0, fy + 0.15, 0.49, 28); hb.rotation.x = Math.PI / 2; g.add(hb); var fanG = G.fan ? G.fan(0.3, 0x0b0d11, 7) : null; if (fanG) { fanG.position.set(0, fy + 0.15, 0.51); g.add(fanG); fans.push(fanG); } }
      g.add(box(1.0, 0.18, 0.02, new THREE.MeshBasicMaterial({ map: G.textTex("COOLING", 160, 40, "#0a1830", "#6aa8ff", "bold 22px sans-serif") }), 0, 2.05, 0.49)); g.add(box(0.12, 0.12, 0.03, glow(0x78d505), 0.45, 0.32, 0.49));
    }
    crac(-3.55, 0); crac(3.55, 0); S.obst.push([-4.3, -2.9, -8.5, -7.3], [2.9, 4.3, -8.5, -7.3]);
    /* ---------- Leitstand ---------- */
    var dsk = new THREE.Group(); sc.add(dsk); dsk.add(box(2.2, 0.08, 0.8, M(0x30353f, { roughness: 0.5 }), 2.0, 0.95, -8.2)); [[0.95, -8.55], [3.05, -8.55], [0.95, -7.85], [3.05, -7.85]].forEach(function (p) { dsk.add(box(0.06, 0.9, 0.06, steel, p[0], 0.5, p[1])); }); dsk.add(box(2.1, 0.5, 0.04, dk, 2.0, 0.55, -8.55));
    var mc = document.createElement("canvas"); mc.width = 512; mc.height = 288; var mg = mc.getContext("2d"), mt = new THREE.CanvasTexture(mc), hist = [];
    [[1.3, 0.62], [2.0, 0.78], [2.7, 0.62]].forEach(function (p, i) { dsk.add(box(0.62, 0.38, 0.03, dk, p[0] + 0, 1.2 + (i === 1 ? 0.06 : 0), -8.45)); dsk.add(cyl(0.025, 0.025, 0.2, steel, p[0], 1.05, -8.45, 8)); if (i === 1) dsk.add(plane(0.58, 0.33, new THREE.MeshBasicMaterial({ map: mt }), p[0], 1.26, -8.43)); else dsk.add(plane(0.58, 0.33, new THREE.MeshBasicMaterial({ map: G.textTex(i ? "TEMP 41°C" : "POWER OK", 256, 150, "#06182a", i ? "#f7931a" : "#78d505", "bold 40px monospace") }), p[0], 1.2, -8.43)); });
    dsk.add(box(0.5, 0.025, 0.16, M(0x2b2f38), 2.0, 1.0, -8.15)); dsk.add(box(0.1, 0.03, 0.14, M(0x2b2f38), 2.45, 1.0, -8.15));
    var chair = new THREE.Group(); chair.position.set(2.0, 0, -7.55); dsk.add(chair); chair.add(cyl(0.22, 0.26, 0.05, dk, 0, 0.1, 0, 5)); chair.add(cyl(0.03, 0.03, 0.4, steel, 0, 0.3, 0, 8)); chair.add(cyl(0.25, 0.23, 0.1, M(0x222831, { roughness: 0.9 }), 0, 0.55, 0, 20)); var bk = box(0.46, 0.5, 0.08, M(0x222831, { roughness: 0.9 }), 0, 0.88, 0.22); chair.add(bk);
    [-0.3, 0.3].forEach(function (dx) { chair.add(cyl(0.04, 0.04, 0.05, dk, dx, 0.05, 0.12, 10)); });
    S.obst.push([0.9, 3.1, -8.65, -7.75]);
    var farmSt = S.addStation("farm", 2.0, 1.3, -8.2, 2.2, 0.8, 0.8, "🏭 " + T("Farm", "Farm"), 2.0, -7.15, function () { if (W.Parts3D && Parts3D.farm && Parts3D.farm.open) Parts3D.farm.open(); else S.toast(T("Farm nicht geladen", "Farm not loaded")); });
    // Wandbildschirm mit Verlauf
    var wc = document.createElement("canvas"); wc.width = 512; wc.height = 256; var wg = wc.getContext("2d"), wt = new THREE.CanvasTexture(wc);
    sc.add(box(3.0, 1.6, 0.06, dk, 0, 2.0, Z0 + 0.06)); sc.add(plane(2.9, 1.5, new THREE.MeshBasicMaterial({ map: wt }), 0, 2.0, Z0 + 0.1));
    sc.add(box(3.0, 1.6, 0.06, dk, -3.2, 1.9, Z1 - 0.06)); 
    /* ---------- Racks ---------- */
    var rackG = new THREE.Group(); sc.add(rackG); var leds = [], rackObst = [];
    function own(id) { try { return Number(W.state.owned[id]) || 0; } catch (e) { return 0; } }
    function units() { return own("usb") + own("gpu") + own("fpga") + own("asic") + 4 * own("farm") + 6 * own("plant"); }
    var sig = "";
    function slots() { var a = [], X = []; for (var i = 0; i < 10; i++) X.push((i % 2 ? 1 : -1) * (Math.floor(i / 2) + 0.5) * 0.68); X.sort(function (p, q) { return Math.abs(p) - Math.abs(q); }); X.forEach(function (x) { a.push([x, -9.95, 0]); }); X.forEach(function (x) { a.push([x, -12.05, 1]); }); return a; }
    function rebuild() {
      var n = Math.min(20, 2 + Math.floor(units() / 3)), s2 = n + "|" + own("usb"); if (s2 === sig) return; sig = s2;
      while (rackG.children.length) rackG.remove(rackG.children[0]); leds.length = 0; S.obst = S.obst.filter(function (o) { return rackObst.indexOf(o) < 0; }); rackObst.length = 0;
      var all = slots(), rowMin = [9, 9], rowMax = [-9, -9];
      for (var i = 0; i < 20; i++) {
        var sl = all[i], x = sl[0], z = sl[1], row = sl[2], on = false;
        if (n >= 20) on = true; else on = row === 0 ? (i < Math.ceil(n / 2)) : ((i - 10) < Math.floor(n / 2));
        var g = new THREE.Group(); g.position.set(x, 0, z); rackG.add(g);
        g.add(box(0.62, 2.12, 0.9, dk, 0, 1.18, 0)); g.add(box(0.7, 0.05, 0.98, steel, 0, 2.27, 0)); g.add(box(0.7, 0.07, 0.98, dk, 0, 0.15, 0)); [-0.3, 0.3].forEach(function (dx) { g.add(box(0.03, 2.1, 0.04, steel, dx, 1.17, row ? 0.46 : -0.46)); });
        if (on) {
          var fm = new THREE.MeshStandardMaterial({ map: rt[i % 3], roughness: 0.5, metalness: 0.4 }); var fp = plane(0.56, 2.04, fm, 0, 1.18, row ? 0.462 : -0.462); if (!row) fp.rotation.y = Math.PI; g.add(fp); var bp = plane(0.56, 2.04, new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.6, metalness: 0.4 }), 0, 1.18, row ? -0.462 : 0.462); if (row) bp.rotation.y = Math.PI; g.add(bp);
          for (var k = 0; k < 3; k++) { var lm = box(0.04, 0.025, 0.02, glow(k % 2 ? 0xf0a020 : 0x2fd36b), -0.2 + k * 0.1, 2.06 - (k % 2) * 0.04, row ? 0.47 : -0.47); g.add(lm); leds.push({ m: lm, p: rr(0, 6), f: rr(1.5, 5) }); }
          var cc = [0xf7931a, 0x3a8bff, 0x78d505][i % 3]; try { g.add(G.tube([[0.1, 2.3, 0], [0.18, 2.7, 0.0], [0.05, 3.0, row ? 0.0 : 0.0]], 0.018, M(cc), 14)); } catch (e) {}
          g.add(box(0.56, 0.04, 0.02, glow([0x3a8bff, 0xf7931a, 0x78d505][i % 3]), 0, 2.2, row ? 0.47 : -0.47));
        } else { var ep = plane(0.56, 2.04, M(0x23272f, { roughness: 0.6, metalness: 0.5 }), 0, 1.18, row ? 0.462 : -0.462); if (!row) ep.rotation.y = Math.PI; g.add(ep); for (var sh = 0; sh < 6; sh++) g.add(box(0.5, 0.02, 0.5, steel, 0, 0.4 + sh * 0.32, row ? 0.2 : -0.2)); }
        if (on) { rowMin[row] = Math.min(rowMin[row], x); rowMax[row] = Math.max(rowMax[row], x); }
      }
      [0, 1].forEach(function (row2) { var zc = row2 ? -12.05 : -9.95, o = [-3.45, 3.45, zc - 0.5, zc + 0.5]; rackObst.push(o); S.obst.push(o); });
    }
    /* ---------- Ausstattung ---------- */
    sc.add(cyl(0.09, 0.09, 0.45, M(0xc8261c, { roughness: 0.4 }), -4.1, 0.65, -9.0, 14)); sc.add(G.sph(0.09, M(0xc8261c, { roughness: 0.4 }), -4.1, 0.9, -9.0, 14, 10)); sc.add(box(0.03, 0.2, 0.03, dk, -4.1, 0.95, -9.0));
    var fe = plane(0.4, 0.4, new THREE.MeshBasicMaterial({ map: G.textTex("🧯", 128, 128, "#c8261c", "#fff", "64px sans-serif") }), -4.28, 1.5, -9.0); fe.rotation.y = Math.PI / 2; sc.add(fe);
    sc.add(box(0.5, 1.4, 0.3, M(0xb0b6c0, { roughness: 0.5, metalness: 0.4 }), 4.1, 0.82, -12.9)); sc.add(box(0.4, 0.3, 0.02, new THREE.MeshBasicMaterial({ map: G.textTex("PDU 63A", 128, 64, "#0a1830", "#f7931a", "bold 24px monospace") }), 4.1, 1.2, -12.74)); for (var pk = 0; pk < 5; pk++) sc.add(box(0.05, 0.05, 0.02, glow(pk % 2 ? 0x2fd36b : 0xf0a020), 3.95 + pk * 0.07, 0.9, -12.74));
    for (var q = 0; q < 5; q++) { var st = box(0.4, 0.12, 0.02, q % 2 ? yel : dk, 0 - 1.2 + q * 0.5, 0.17, Z0 + 0.03); st.rotation.z = -0.5; sc.add(st); }
    // Handlauf-Rohre an der Seitenwand
    var pp = cyl(0.05, 0.05, DL - 0.6, M(0x5d6b86, { roughness: 0.4, metalness: 0.7 }), -4.25, 2.2, CZ, 12); pp.rotation.x = Math.PI / 2; sc.add(pp);
    var pp2 = cyl(0.035, 0.035, DL - 0.6, M(0xf7931a, { roughness: 0.4, metalness: 0.5 }), -4.25, 2.0, CZ, 12); pp2.rotation.x = Math.PI / 2; sc.add(pp2);
    try { var pl = new THREE.PointLight(0xdfeaff, 0.9, 13); pl.position.set(0, 3.0, -10.8); scn.add(pl); } catch (e) {}
    /* ---------- Live ---------- */
    function txt(id) { var e = document.getElementById(id); return e ? (e.textContent || "").replace(/\s+/g, " ").trim() : ""; }
    var t5 = 0;
    function paint() {
      var hr = txt("hashrate") || "—"; var v = parseFloat(String(hr).replace(/[^0-9.]/g, "")) || 0; hist.push(v + rr(-1, 1) * Math.max(1, v * 0.03)); if (hist.length > 40) hist.shift();
      mg.fillStyle = "#06182a"; mg.fillRect(0, 0, 512, 288); mg.fillStyle = "#78d505"; mg.font = "bold 34px monospace"; mg.fillText("FARM STATUS", 22, 46); mg.fillStyle = "#cfe3ff"; mg.font = "28px monospace"; mg.fillText(hr.slice(0, 24), 22, 100);
      mg.fillStyle = "#8a93a3"; mg.font = "24px monospace"; mg.fillText("USB " + own("usb") + "  GPU " + own("gpu") + "  FPGA " + own("fpga"), 22, 150); mg.fillText("ASIC " + own("asic") + "  FARM " + own("farm") + "  SOLAR " + own("plant"), 22, 188); mg.fillStyle = "#f7931a"; mg.fillText("Racks: " + Math.min(20, 2 + Math.floor(units() / 3)) + " / 20", 22, 240); mt.needsUpdate = true;
      wg.fillStyle = "#06182a"; wg.fillRect(0, 0, 512, 256); wg.strokeStyle = "#16345a"; wg.lineWidth = 1; for (var gx = 0; gx < 512; gx += 64) { wg.beginPath(); wg.moveTo(gx, 0); wg.lineTo(gx, 256); wg.stroke(); } for (var gy = 0; gy < 256; gy += 64) { wg.beginPath(); wg.moveTo(0, gy); wg.lineTo(512, gy); wg.stroke(); }
      var mx = Math.max.apply(null, hist.concat([1])), mn = Math.min.apply(null, hist.concat([mx])); wg.strokeStyle = "#78d505"; wg.lineWidth = 3; wg.beginPath(); hist.forEach(function (h, i) { var x = 10 + i * (492 / 39), y = 236 - ((h - mn) / Math.max(1e-6, mx - mn || 1)) * 190; if (!i) wg.moveTo(x, y); else wg.lineTo(x, y); }); wg.stroke();
      wg.fillStyle = "#f7931a"; wg.font = "bold 28px monospace"; wg.fillText("HASHRATE", 12, 32); wt.needsUpdate = true;
    }
    S.ticks.push(function (dt, t) {
      var rm = S.roomOf(S.px, S.pz); sc.visible = rm === "I" || rm === "B"; if (!sc.visible) return;
      leds.forEach(function (l) { l.m.visible = Math.sin(t * l.f + l.p) > -0.35; }); fans.forEach(function (f) { f.rotation.z += dt * 9; });
      t5 += dt; if (t5 > 2) { t5 = 0; rebuild(); paint(); }
    });
    rebuild(); paint();
    W.Parts3D.nextFarmHall = { rebuild: function () { sig = ""; rebuild(); } };
    console.log("[HASHPOOL NEXT] farmhall bereit (Server-Halle)");
  }
  var n = 0, iv = setInterval(function () {
    n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined" && W.state) { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); try { W.Parts3D.nextWorld.S.err("farmhall: " + e.message); } catch (x) {} }
    if (n > 400) clearInterval(iv);
  }, 400);
})();
