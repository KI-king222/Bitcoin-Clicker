/* env.js — HASHPOOL NEXT: begehbare Strasse + Umgebung (nur in /next/ geladen, Kill-Switch ?noenv=1)
 * Buergersteig, Strasse mit fahrenden Autos, Passanten, Baeume, Laternen, Baenke, Haeuser gegenueber, Nachbarhaeuser,
 * Hof links vom Laden (dort stehen Container-Farm und Solarpark aus clicker.js), Himmel mit Sternen und Mond.
 * Nutzt die Erweiterungs-Schnittstelle Parts3D.nextWorld.S (rects/obst/ticks/G).
 */
(function () {
  var W = window;
  if (W.__nxEnv) return; W.__nxEnv = true;
  var S, G, sc;
  function M(c, o) { return G.M(c, o); }
  function box(w, h, d, m, x, y, z) { return G.box(w, h, d, m, x, y, z); }
  function cyl(a, b, h, m, x, y, z, s) { return G.cyl(a, b, h, m, x, y, z, s); }
  function sph(r, m, x, y, z, a, b) { return G.sph(r, m, x, y, z, a, b); }
  function plane(w, h, m, x, y, z, ry) { return G.plane(w, h, m, x, y, z, ry); }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rr(a, b) { return a + Math.random() * (b - a); }
  var Y0 = 0.12;                                   // Hoehe Buergersteig/Boden

  function skyTex() {
    return G.ctex(512, 512, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#060914"); gr.addColorStop(0.35, "#141c3e"); gr.addColorStop(0.55, "#2c2f5e"); gr.addColorStop(0.7, "#7a4a62"); gr.addColorStop(0.78, "#e08a55"); gr.addColorStop(0.8, "#241a2a"); gr.addColorStop(1, "#0b0d14");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 160; i++) { g.fillStyle = "rgba(255,255,255," + (0.3 + Math.random() * 0.6) + ")"; var s = Math.random() < 0.15 ? 2 : 1; g.fillRect(Math.random() * w, Math.random() * h * 0.5, s, s); }
      var mg = g.createRadialGradient(380, 120, 4, 380, 120, 46); mg.addColorStop(0, "rgba(255,248,225,1)"); mg.addColorStop(0.25, "rgba(255,248,225,.95)"); mg.addColorStop(0.3, "rgba(200,210,255,.25)"); mg.addColorStop(1, "rgba(200,210,255,0)"); g.fillStyle = mg; g.fillRect(300, 40, 160, 160);
    });
  }
  function shopWinTex(col) {
    var r = (col >> 16) & 255, gg = (col >> 8) & 255, b = col & 255;
    return G.ctex(512, 172, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgb(" + (r * 0.55 | 0) + "," + (gg * 0.5 | 0) + "," + (b * 0.45 | 0) + ")"); gr.addColorStop(1, "rgb(" + (r * 0.95 | 0) + "," + (gg * 0.9 | 0) + "," + (b * 0.8 | 0) + ")"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 4; i++) { g.fillStyle = "rgba(40,25,15,.5)"; g.fillRect(20 + i * 125, 92 + (i % 2) * 10, 100, 6); g.fillStyle = "rgba(30,20,12," + (0.45 + (i % 3) * 0.1) + ")"; var k; for (k = 0; k < 4; k++) g.fillRect(28 + i * 125 + k * 24, 60 + (i % 2) * 10 - k * 4 % 12, 16, 32 + k * 4 % 12); }
      g.fillStyle = "rgba(20,14,10,.55)"; g.fillRect(0, h - 38, w, 38);
      g.fillStyle = "#171a20"; g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8); g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h); g.fillRect(w / 2 - 4, 0, 8, h); g.fillRect(w / 4 - 2, 0, 4, h); g.fillRect(w * 0.75 - 2, 0, 4, h);
      var rf = g.createLinearGradient(0, 0, w, h); rf.addColorStop(0, "rgba(255,255,255,.18)"); rf.addColorStop(0.35, "rgba(255,255,255,0)"); g.fillStyle = rf; g.fillRect(0, 0, w, h);
    });
  }
  function haloTex() { return G.ctex(64, 64, function (g, w, h) { var r = g.createRadialGradient(32, 32, 2, 32, 32, 32); r.addColorStop(0, "rgba(255,225,150,.95)"); r.addColorStop(0.3, "rgba(255,200,110,.35)"); r.addColorStop(1, "rgba(255,200,110,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); }); }
  function facadeTex(kind) {
    return G.ctex(512, 512, function (g, w, h) {
      var base = { a: "#3a3548", b: "#4a3a36", c: "#2f4152", d: "#3d4236" }[kind] || "#3a3548"; g.fillStyle = base; g.fillRect(0, 0, w, h);
      if (kind === "b" || kind === "d") { for (var br = 0; br < 32; br++) for (var bc = -1; bc < 16; bc++) { var bx = bc * 34 + (br % 2 ? 17 : 0); g.fillStyle = "rgba(" + (kind === "b" ? "150,80,60" : "110,120,90") + "," + (0.12 + Math.random() * 0.14) + ")"; g.fillRect(bx + 1, br * 16 + 1, 32, 14); } }
      G.speckle(g, w, h, 1600, ["rgba(255,255,255,.04)", "rgba(0,0,0,.09)"], 2);
      var vg = g.createLinearGradient(0, 0, 0, h); vg.addColorStop(0, "rgba(255,255,255,.04)"); vg.addColorStop(1, "rgba(0,0,0,.18)"); g.fillStyle = vg; g.fillRect(0, 0, w, h);
      for (var r = 0; r < 4; r++) {
        g.fillStyle = "rgba(0,0,0,.28)"; g.fillRect(0, r * 128 + 118, w, 6); g.fillStyle = "rgba(255,255,255,.07)"; g.fillRect(0, r * 128 + 124, w, 3);     // Geschossband
        for (var c = 0; c < 4; c++) {
          var x = c * 128 + 24, y = r * 128 + 22, lit = Math.random() < 0.5;
          g.fillStyle = "#c9c3b8"; g.fillRect(x - 7, y - 8, 94, 8); g.fillRect(x - 5, y + 86, 90, 7);                                                   // Sturz + Fensterbank
          g.fillStyle = "#15171d"; g.fillRect(x - 3, y - 2, 86, 90);
          if (lit) { var gr = g.createLinearGradient(x, y, x, y + 88); gr.addColorStop(0, rnd(["#ffe2a0", "#fff0c8", "#ffcf80"])); gr.addColorStop(1, rnd(["#d89a48", "#c98a3a"])); g.fillStyle = gr; } else { var gd = g.createLinearGradient(x, y, x + 80, y + 88); gd.addColorStop(0, "#22304f"); gd.addColorStop(0.5, "#101828"); gd.addColorStop(1, "#1a2540"); g.fillStyle = gd; }
          g.fillRect(x, y, 80, 88);
          if (lit && Math.random() < 0.6) { g.fillStyle = "rgba(160,60,50,.5)"; g.fillRect(x, y, 22, 88); g.fillRect(x + 58, y, 22, 88); }                  // Vorhaenge
          if (lit && Math.random() < 0.4) { g.fillStyle = "rgba(0,0,0,.38)"; g.beginPath(); g.arc(x + 40, y + 60, 12, 0, 6.3); g.fill(); g.fillRect(x + 28, y + 60, 24, 28); }   // Silhouette
          g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(x + 38, y, 4, 88); g.fillRect(x, y + 42, 80, 4);
          if (!lit) { g.fillStyle = "rgba(255,255,255,.07)"; g.beginPath(); g.moveTo(x, y + 88); g.lineTo(x + 30, y); g.lineTo(x + 44, y); g.lineTo(x + 14, y + 88); g.fill(); }
          if (Math.random() < 0.2) { g.fillStyle = "#2a1c14"; g.fillRect(x - 2, y + 92, 84, 10); g.fillStyle = "#3a8a4a"; for (var pl = 0; pl < 7; pl++) g.fillRect(x + pl * 12, y + 86, 8, 8); }     // Blumenkasten
        }
      }
    });
  }
  function signTex(txt, bg, fg) { return G.textTex(txt, 512, 128, bg, fg, "bold 64px sans-serif"); }

  /* ---------- Haeuser ---------- */
  function building(x, z, w, h, d, kind, face) {   // z = vordere Kante (Fassade zeigt nach +z oder -z)
    var m = M(0xffffff, { map: G.rep(facadeTex(kind), Math.max(1, w / 10.4), Math.max(1, h / 12.8)), roughness: 0.95 });
    var cz = z + (face > 0 ? -d / 2 : d / 2), fz = z + (face > 0 ? 0.06 : -0.06), sgn = face > 0 ? 1 : -1, b = box(w, h, d, m, x, h / 2, cz); sc.add(b);
    var st = M(0xb8b2a6, { roughness: 0.9 });
    sc.add(box(w + 0.4, 0.3, 0.5, st, x, h + 0.1, fz + sgn * 0.1)); sc.add(box(w + 0.2, 0.18, 0.3, st, x, 3.4, fz + sgn * 0.05));            // Dachgesims + Sockelband
    sc.add(box(w + 0.3, 0.9, d + 0.3, M(0x15171d, { roughness: 1 }), x, h + 0.45, cz));                                                          // Attika
    for (var k = 0; k < Math.max(1, Math.floor(w / 6)); k++) {                                                                                      // Dachaufbauten: Klimagerate, Schornstein, Antenne
      var ax = x - w / 2 + 2 + k * 5.4 + rr(0, 1.2);
      sc.add(box(1.0, 0.6, 0.8, M(0x8a9099, { metalness: 0.4 }), ax, h + 1.2, cz)); var fn = G.fan(0.22, 0x1a1d24, 5); fn.rotation.x = -Math.PI / 2; fn.position.set(ax, h + 1.52, cz); sc.add(fn);
      if (k % 2) { sc.add(box(0.5, 1.3, 0.5, M(0x4a3030, { roughness: 1 }), ax + 1.6, h + 1.5, cz + 0.6)); } else { sc.add(cyl(0.02, 0.02, 2.2, M(0x222), ax + 1.6, h + 2.0, cz - 0.5, 6)); sc.add(box(0.7, 0.03, 0.03, M(0x222), ax + 1.6, h + 2.6, cz - 0.5)); }
    }
    sc.add(cyl(0.07, 0.07, h, M(0x3a3f48, { metalness: 0.6 }), x + w / 2 - 0.3, h / 2, fz + sgn * 0.12, 10));                                       // Regenfallrohr
    return b;
  }
  function shopfront(x, z, w, txt, bg, fg, warm) {   // Ladenfront (Laden-Block, Fassade nach +z)
    var gl = new THREE.MeshBasicMaterial({ color: warm }); sc.add(plane(w * 0.7, 1.6, gl, x, 1.5, z + 0.03));
    sc.add(box(w * 0.7 + 0.2, 0.08, 0.12, M(0x0f1218), x, 2.35, z + 0.06)); sc.add(box(w * 0.7 + 0.2, 0.08, 0.12, M(0x0f1218), x, 0.66, z + 0.06));
    sc.add(plane(Math.min(w * 0.8, 3.6), 0.7, new THREE.MeshBasicMaterial({ map: signTex(txt, bg, fg) }), x, 3.1, z + 0.04));
  }
  function buildings() {
    // Nachbarn links (hinter dem Hof) und rechts (hinter dem Abholladen)
    building(-23, 3.5, 14, 9, 14, "a", 1); shopfront(-23, 3.5, 12, "CAFÉ", "#2a1810", "#ffb067", 0xffd9a0);
    building(17.5, 3.5, 14, 8, 14, "b", 1); shopfront(17.5, 3.5, 12, "BÄCKEREI", "#2a2010", "#ffe08a", 0xffe6b8);
    // gegenueber
    var x = -42;
    while (x < 40) {
      var w = rr(8, 15), h = rr(8, 15), k = rnd(["a", "b", "c", "d"]); building(x + w / 2, 15.6, w, h, rr(8, 12), k, -1);
      sc.add(box(w + 0.1, 0.12, 0.4, M(0x0f1218), x + w / 2, 3.2, 15.5)); x += w + rr(0.1, 0.6);
    }
    // Ladenfronten gegenueber (auf der Strassenseite sichtbar): Leuchtstreifen
    [[-12, "KIOSK", "#10201a", "#78d505", 0xcfe9d8], [-1, "PIZZA", "#2a1010", "#ff6a4a", 0xffd2b0], [9, "BANK", "#10182a", "#6aa8ff", 0xdce8ff]].forEach(function (p) {
      sc.add(plane(5, 1.7, new THREE.MeshBasicMaterial({ map: shopWinTex(p[4]) }), p[0], 1.6, 15.45, Math.PI)); sc.add(plane(3.4, 0.7, new THREE.MeshBasicMaterial({ map: signTex(p[1], p[2], p[3]) }), p[0], 3.1, 15.44, Math.PI));
    });
    // ferne Skyline
    for (var i = 0; i < 14; i++) { var sx = -80 + i * 12 + rr(-3, 3), sh = rr(18, 46); sc.add(box(rr(6, 10), sh, 6, M(0x0d1120, { roughness: 1 }), sx, sh / 2, 48)); for (var k2 = 0; k2 < 14; k2++) sc.add(box(0.5, 0.7, 0.05, new THREE.MeshBasicMaterial({ color: rnd([0xffd27a, 0xffe9b0, 0x9fd3ff]) }), sx + rr(-3, 3), rr(3, sh - 2), 44.95)); }
  }

  /* ---------- Boden, Strasse ---------- */
  function ground() {
    sc.add(box(100, 0.12, 2.8, M(0xffffff, { map: G.rep(G.tex("pave"), 40, 1.1), roughness: 0.95 }), 0, 0.06, 4.87));          // Buergersteig vor dem Laden z 3.47..6.27
    sc.add(box(100, 0.12, 2.5, M(0xffffff, { map: G.rep(G.tex("pave"), 40, 1.0), roughness: 0.95 }), 0, 0.06, 13.85));         // gegenueber z 12.6..15.1
    sc.add(box(100, 0.14, 0.18, M(0x9a9da6, { roughness: 0.8 }), 0, 0.07, 6.35)); sc.add(box(100, 0.14, 0.18, M(0x9a9da6, { roughness: 0.8 }), 0, 0.07, 12.5));   // Bordsteine
    var rd = box(100, 0.1, 6.2, M(0xffffff, { map: G.rep(G.tex("asphalt"), 40, 2.4), roughness: 0.95 }), 0, -0.05, 9.4); sc.add(rd);   // Fahrbahn z 6.3..12.5
    for (var d = -45; d <= 45; d += 3.2) sc.add(box(1.6, 0.012, 0.14, new THREE.MeshBasicMaterial({ color: 0xd8b73a }), d, 0.006, 9.4));
    var zw = new THREE.MeshBasicMaterial({ color: 0xe9e9ee }); for (var s = 0; s < 9; s++) sc.add(box(0.5, 0.012, 6.0, zw, -8.4 + s * 0.9 - 4, 0.007, 9.4)); // Zebrastreifen links
    [[-3.5, 7.8], [8.0, 11.0]].forEach(function (p) { sc.add(cyl(0.45, 0.45, 0.012, M(0x1a1c20, { metalness: 0.6 }), p[0], 0.007, p[1], 18)); });
    // Hof links (Kies) + Zaun
    sc.add(box(11, 0.12, 10.5, M(0xffffff, { map: G.rep(G.tex("asphalt"), 5, 5), roughness: 1, color: 0xb0a898 }), -10.0, 0.06, -1.7));
    var fe = M(0x20242c, { metalness: 0.7, roughness: 0.4 }); sc.add(box(11, 0.06, 0.05, fe, -10.0, 1.0, 3.5)); sc.add(box(11, 0.06, 0.05, fe, -10.0, 0.45, 3.5)); for (var p = -15.4; p <= -4.6; p += 1.2) sc.add(box(0.06, 1.1, 0.06, fe, p, 0.6, 3.5));
    sc.add(box(0.05, 1.1, 10.5, fe, -15.5, 0.6, -1.7)); sc.add(box(11, 3.2, 0.2, M(0x2a2f38, { roughness: 0.9 }), -10.0, 1.6, -7.0));
    S.obst.push([-15.6, -4.5, -7.2, 3.6]);
    // Absperrungen an den Enden der Strasse
    var bar = M(0xffffff, { map: G.rep(G.tex("awning"), 6, 1), roughness: 0.8 });
    [-16.5, 16.5].forEach(function (x) { sc.add(box(0.2, 0.9, 11.6, bar, x, 0.6, 9.5)); sc.add(box(0.1, 1.6, 0.1, M(0x333), x, 0.8, 3.6)); sc.add(box(0.1, 1.6, 0.1, M(0x333), x, 0.8, 15.2)); [3.9, 15.0].forEach(function (zz) { sc.add(sph(0.1, new THREE.MeshBasicMaterial({ color: 0xff8a20 }), x, 1.65, zz)); }); });
  }

  /* ---------- Strassenmoebel ---------- */
  function lamp(x, z) {
    var pm = M(0x1b1e24, { metalness: 0.7, roughness: 0.4 });
    sc.add(cyl(0.11, 0.14, 0.3, pm, x, 0.27, z, 14)); sc.add(cyl(0.05, 0.08, 4.0, pm, x, 2.3, z, 14));
    var arc = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.04, 8, 18, Math.PI / 2), pm); arc.position.set(x, 4.3, z - 0.45); arc.rotation.y = Math.PI / 2; arc.rotation.z = 0; sc.add(arc);
    sc.add(G.rbox(0.5, 0.12, 0.26, 0.04, pm, x, 4.74, z - 0.45)); sc.add(box(0.4, 0.06, 0.2, new THREE.MeshBasicMaterial({ color: 0xffe3a0 }), x, 4.66, z - 0.45));
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); halo.scale.set(3.4, 3.4, 1); halo.position.set(x, 4.5, z - 0.45); sc.add(halo); halos.push(halo);
    S.obst.push([x - 0.14, x + 0.14, z - 0.14, z + 0.14]);
  }
  function tree(x, z) {
    sc.add(G.rbox(0.9, 0.3, 0.9, 0.05, M(0x3a3f48, { roughness: 0.9 }), x, 0.27, z)); sc.add(cyl(0.7 * 0.5, 0.7 * 0.5, 0.04, M(0x2a1d14, { roughness: 1 }), x, 0.43, z, 18));
    var bark = M(0x4a3626, { roughness: 1 }); sc.add(cyl(0.09, 0.15, 2.3, bark, x, 1.5, z, 12));
    [[0.5, 0.5], [-0.5, 0.35], [0.1, -0.55]].forEach(function (p, i) { var br = cyl(0.03, 0.05, 0.9, bark, x + p[0] * 0.4, 2.7, z + p[1] * 0.4, 6); br.rotation.z = -p[0] * 0.9; br.rotation.x = p[1] * 0.9; sc.add(br); });
    var cols = [M(0x1f6a3a, { roughness: 1 }), M(0x2a8048, { roughness: 1 }), M(0x35965a, { roughness: 1 })];
    for (var i = 0; i < 12; i++) { var a = i * 2.4, r = 0.35 + (i % 3) * 0.28, y = 2.9 + (i % 4) * 0.38; sc.add(G.sph(0.5 + (i % 3) * 0.1, cols[i % 3], x + Math.cos(a) * r, y, z + Math.sin(a) * r, 10, 8)); }
    S.obst.push([x - 0.45, x + 0.45, z - 0.45, z + 0.45]);
  }
  function bench(x, z) {
    var w = M(0x7a5230, { roughness: 0.8 }), st = M(0x1b1e24, { metalness: 0.7 }); sc.add(box(1.5, 0.07, 0.42, w, x, 0.55, z)); sc.add(box(1.5, 0.4, 0.06, w, x, 0.85, z - 0.22)); sc.add(box(0.06, 0.45, 0.4, st, x - 0.65, 0.35, z)); sc.add(box(0.06, 0.45, 0.4, st, x + 0.65, 0.35, z));
    S.obst.push([x - 0.8, x + 0.8, z - 0.3, z + 0.3]);
  }
  function bin(x, z) { sc.add(cyl(0.22, 0.2, 0.8, M(0x2f6b3a, { roughness: 0.7 }), x, 0.52, z, 12)); sc.add(cyl(0.24, 0.24, 0.06, M(0x1b1e24), x, 0.95, z, 12)); S.obst.push([x - 0.25, x + 0.25, z - 0.25, z + 0.25]); }
  function hydrant(x, z) { sc.add(cyl(0.1, 0.12, 0.6, M(0xc0392b, { roughness: 0.6 }), x, 0.42, z, 10)); sc.add(sph(0.11, M(0xc0392b), x, 0.75, z, 8, 6)); S.obst.push([x - 0.15, x + 0.15, z - 0.15, z + 0.15]); }
  function furniture() {
    [-12, -6.6, 6.2, 12.5].forEach(function (x) { lamp(x, 6.0); });
    [-9.5, -3.4, 3.4, 12].forEach(function (x) { tree(x, 5.6); });
    bench(-6.2, 5.2); bench(11.5, 4.6); bin(-1.8, 5.5); bin(5.0, 5.5); hydrant(-11, 5.9); hydrant(14, 5.9);
    [-11, 0, 11].forEach(function (x) { tree(x + 3, 13.7); lamp(x - 3, 13.4); });
    // Pflanzkuebel vor den Schaufenstern, Fahrrad, Ampel, Briefkasten, Strassenschild
    [-3.2, 3.2].forEach(function (x) { sc.add(G.rbox(1.2, 0.5, 0.45, 0.05, M(0x5a4a3a, { roughness: 0.9 }), x, 0.37, 4.0)); for (var b = 0; b < 8; b++) sc.add(G.sph(0.17, M(b % 2 ? 0x2a8048 : 0x1f6a3a, { roughness: 1 }), x - 0.5 + b * 0.14, 0.78 + (b % 3) * 0.05, 4.0 + (b % 2 ? 0.06 : -0.06), 8, 6)); S.obst.push([x - 0.65, x + 0.65, 3.75, 4.25]); });
    (function () { var bx = -7.6, bz = 4.4, fm = M(0xd32f2f, { metalness: 0.6, roughness: 0.4 }), rb = M(0x0b0c0f, { roughness: 0.9 });
      [-0.45, 0.45].forEach(function (dx) { var w = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 8, 24), rb); w.position.set(bx + dx, 0.45, bz); w.rotation.y = Math.PI / 2; sc.add(w); });
      var fr = cyl(0.015, 0.015, 0.9, fm, bx, 0.7, bz, 8); fr.rotation.z = 1.3; sc.add(fr); var fr2 = cyl(0.015, 0.015, 0.7, fm, bx - 0.1, 0.65, bz, 8); fr2.rotation.z = -0.9; sc.add(fr2); sc.add(cyl(0.012, 0.012, 0.4, fm, bx + 0.42, 0.8, bz, 8)); sc.add(box(0.03, 0.03, 0.4, M(0x20242b), bx + 0.42, 1.0, bz)); sc.add(G.rbox(0.22, 0.05, 0.1, 0.02, M(0x20242b), bx - 0.4, 0.95, bz)); S.obst.push([bx - 0.8, bx + 0.8, bz - 0.2, bz + 0.2]); })();
    (function () { var tx = -8.4, tz = 6.0, pm = M(0x1b1e24, { metalness: 0.6 }); sc.add(cyl(0.05, 0.06, 3.2, pm, tx, 1.7, tz, 10)); sc.add(G.rbox(0.28, 0.8, 0.22, 0.05, pm, tx, 3.1, tz)); [[0xff2a2a, 3.38], [0xffb020, 3.1], [0x2aff6a, 2.82]].forEach(function (l, i) { sc.add(G.sph(0.08, new THREE.MeshBasicMaterial({ color: l[0] }), tx, l[1], tz + 0.12, 10, 8)); }); S.obst.push([tx - 0.12, tx + 0.12, tz - 0.12, tz + 0.12]); })();
    sc.add(G.rbox(0.5, 1.1, 0.4, 0.06, M(0x2a5fb0, { roughness: 0.5 }), 13.2, 0.7, 5.4)); sc.add(box(0.3, 0.04, 0.02, M(0x0b0c0f), 13.2, 1.0, 5.21)); S.obst.push([12.9, 13.5, 5.15, 5.65]);
    (function () { var sx = 9.4, sz = 6.0, pm = M(0x8a9099, { metalness: 0.6 }); sc.add(cyl(0.03, 0.03, 2.6, pm, sx, 1.4, sz, 8)); sc.add(G.rbox(0.9, 0.3, 0.04, 0.02, M(0x1f6a3a), sx, 2.55, sz)); sc.add(G.plane(0.84, 0.24, new THREE.MeshBasicMaterial({ map: signTex("HASH-STRASSE", "#1f6a3a", "#ffffff") }), sx, 2.55, sz + 0.025)); S.obst.push([sx - 0.1, sx + 0.1, sz - 0.1, sz + 0.1]); })();
  }

  /* ---------- Autos ---------- */
  var cars = [], halos = [];
  function makeCar(col) {
    var g = new THREE.Group(), body = M(col, { metalness: 0.55, roughness: 0.28 }), dark = M(0x0e1118, { metalness: 0.3, roughness: 0.15 }), rubber = M(0x0b0c0f, { roughness: 0.95 }), chrome = M(0xc4c9d2, { metalness: 1, roughness: 0.2 });
    g.add(G.rbox(4.2, 0.55, 1.85, 0.2, body, 0, 0.62, 0)); g.add(G.rbox(2.3, 0.52, 1.7, 0.22, body, -0.25, 1.12, 0)); g.add(G.rbox(2.1, 0.4, 1.74, 0.16, dark, -0.25, 1.12, 0));                                  // Karosserie, Kabine, Scheiben
    g.add(G.rbox(1.1, 0.04, 1.6, 0.02, body, 1.45, 0.92, 0)); g.add(G.rbox(4.3, 0.12, 1.9, 0.05, M(0x1a1c22, { roughness: 0.6 }), 0, 0.34, 0));                                                              // Haube, Stossfaenger-Band
    [[1.3, 0.92], [-1.3, 0.92], [1.3, -0.92], [-1.3, -0.92]].forEach(function (p) {
      var tire = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.11, 10, 20), rubber); tire.position.set(p[0], 0.38, p[1]); g.add(tire);
      var rim = cyl(0.2, 0.2, 0.18, chrome, p[0], 0.38, p[1], 16); rim.rotation.x = Math.PI / 2; g.add(rim); var hub = cyl(0.06, 0.06, 0.2, M(0x333840, { metalness: 0.8 }), p[0], 0.38, p[1], 10); hub.rotation.x = Math.PI / 2; g.add(hub);
      for (var sp = 0; sp < 5; sp++) { var spk = box(0.03, 0.16, 0.03, chrome, p[0] + Math.cos(sp * 1.2566) * 0.1, 0.38 + Math.sin(sp * 1.2566) * 0.1, p[1] + (p[1] > 0 ? 0.095 : -0.095)); spk.rotation.z = sp * 1.2566 - 1.57; g.add(spk); }
    });
    var hl = new THREE.MeshBasicMaterial({ color: 0xfff4d0 }), tl = new THREE.MeshBasicMaterial({ color: 0xff2a2a });
    [0.6, -0.6].forEach(function (z) { var h1 = cyl(0.09, 0.09, 0.05, hl, 2.12, 0.72, z, 14); h1.rotation.z = Math.PI / 2; g.add(h1); g.add(G.rbox(0.05, 0.12, 0.4, 0.02, tl, -2.12, 0.72, z)); g.add(G.rbox(0.18, 0.1, 0.08, 0.03, body, -0.7, 1.0, z > 0 ? 0.95 : -0.95)); });          // Scheinwerfer, Ruecklichter, Spiegel
    g.add(box(0.04, 0.12, 0.5, M(0xf2f2f2, { roughness: 0.5 }), 2.14, 0.45, 0)); g.add(box(0.04, 0.1, 0.4, M(0xf2f2f2, { roughness: 0.5 }), -2.14, 0.45, 0));    // Kennzeichen
    g.add(box(0.04, 0.2, 0.5, chrome, 2.14, 0.58, 0.0)); g.add(box(1.2, 0.015, 0.02, chrome, 0.2, 0.72, 0.93)); g.add(box(1.2, 0.015, 0.02, chrome, 0.2, 0.72, -0.93));                                         // Gitter, Zierleisten
    return g;
  }
  function spawnCars() {
    var cols = [0xc0392b, 0x2a6bd1, 0xe9edf2, 0x2b2f38, 0xf0b429, 0x2a8f4a, 0x8e5bd9];
    [[7.7, 1, 6.5], [7.7, 1, 6.5], [11.0, -1, 5.2], [11.0, -1, 5.2], [11.0, -1, 5.2]].forEach(function (p, i) {
      var c = makeCar(rnd(cols)); var x0 = -34 + i * 14 + rr(-3, 3); c.position.set(x0, 0, p[0]); c.rotation.y = p[1] > 0 ? 0 : Math.PI; sc.add(c); cars.push({ g: c, dir: p[1], z: p[0], v: p[2] + rr(-0.6, 0.6), cur: 0 });
    });
  }
  function tickCars(dt) {
    cars.forEach(function (c) {
      var want = c.v, px = S.px, pz = S.pz;
      if (Math.abs(pz - c.z) < 1.5 && (px - c.g.position.x) * c.dir > 0.5 && (px - c.g.position.x) * c.dir < 6) want = 0;                 // Spieler auf der Fahrbahn voraus: anhalten
      cars.forEach(function (o) { if (o !== c && o.z === c.z && (o.g.position.x - c.g.position.x) * c.dir > 0 && (o.g.position.x - c.g.position.x) * c.dir < 7) want = Math.min(want, o.cur * 0.9); });
      c.cur += (want - c.cur) * Math.min(1, dt * 2.5); c.g.position.x += c.dir * c.cur * dt;
      if (c.g.position.x > 38) c.g.position.x = -38; if (c.g.position.x < -38) c.g.position.x = 38;
    });
  }

  /* ---------- Passanten ---------- */
  var peds = [];
  function spawnPeds() {
    var D = W.Parts3D && Parts3D.shop && Parts3D.shop._dbg; if (!D || !D.randomSpec || !S.makeActor) return;
    [[5.3, 1], [13.7, -1], [5.6, -1], [4.4, 1], [13.2, 1], [5.0, -1], [14.2, -1], [4.8, 1]].forEach(function (p, i) {
      try {
        var a = S.makeActor(D.randomSpec(null)); a.speed = rr(1.0, 1.4); var x0 = rr(-12, 12); a.g.position.set(x0, 0.12, p[0]); sc.add(a.g);
        function go(a2) { var tx = a2.g.position.x > 0 ? -14.5 : 14.5; a2.path = [[tx, p[0] + rr(-0.3, 0.3)]]; a2.pi = 0; a2.done = go; }
        go(a); peds.push(a);
      } catch (e) { S.err("Passant: " + e.message); }
    });
  }

  function init() {
    S = W.Parts3D.nextWorld.S; G = S.G; sc = S.scene;
    var sky = new THREE.Mesh(new THREE.SphereGeometry(110, 24, 16), new THREE.MeshBasicMaterial({ map: skyTex(), side: THREE.BackSide, fog: false, depthWrite: false })); sc.add(sky);
    var dayTex = G.ctex(512, 512, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2f6fd0"); gr.addColorStop(0.45, "#7fb6f2"); gr.addColorStop(0.72, "#d9ecff"); gr.addColorStop(0.78, "#ffe6b8"); gr.addColorStop(0.8, "#6d7a88"); gr.addColorStop(1, "#4d5560"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 26; i++) { var cx = Math.random() * w, cy = 40 + Math.random() * 190; g.fillStyle = "rgba(255,255,255," + (0.35 + Math.random() * 0.3) + ")"; for (var k = 0; k < 5; k++) { g.beginPath(); g.ellipse(cx + k * 22, cy + (k % 2) * 6, 34 + Math.random() * 20, 12 + Math.random() * 6, 0, 0, 6.3); g.fill(); } }
    });
    var skyDay = new THREE.Mesh(new THREE.SphereGeometry(108, 24, 16), new THREE.MeshBasicMaterial({ map: dayTex, side: THREE.BackSide, fog: false, depthWrite: false, transparent: true, opacity: 0 })); sc.add(skyDay);
    ground(); buildings(); furniture(); spawnCars(); spawnPeds();
    S.rects.push([-16.2, 16.2, 3.47, 15.1]);
    S.ticks.push(function (dt) { sky.position.copy(S.cam.position); skyDay.position.copy(S.cam.position); tickCars(dt); peds.forEach(function (a) { S.stepActor(a, dt); }); });
    W.Parts3D.nextEnv = { cars: cars, peds: peds, sky: sky, skyDay: skyDay, halos: halos };
    console.log("[HASHPOOL NEXT] env bereit (Strasse)");
  }
  var n = 0, iv = setInterval(function () {
    n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined") { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); try { W.Parts3D.nextWorld.S.err("env: " + e.message); } catch (x) {} console.warn("[env]", e); }
    if (n > 400) clearInterval(iv);
  }, 400);
})();
