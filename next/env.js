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
  function haloTex() { return G.ctex(64, 64, function (g, w, h) { var r = g.createRadialGradient(32, 32, 2, 32, 32, 32); r.addColorStop(0, "rgba(255,225,150,.95)"); r.addColorStop(0.3, "rgba(255,200,110,.35)"); r.addColorStop(1, "rgba(255,200,110,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); }); }
  function facadeTex(kind) {
    return G.ctex(512, 512, function (g, w, h) {
      var base = { a: "#2d2a38", b: "#3a2f2f", c: "#263341", d: "#33382f" }[kind] || "#2d2a38"; g.fillStyle = base; g.fillRect(0, 0, w, h);
      G.speckle(g, w, h, 1500, ["rgba(255,255,255,.04)", "rgba(0,0,0,.08)"], 2);
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        var x = c * 128 + 24, y = r * 128 + 22, lit = Math.random() < 0.5;
        g.fillStyle = "#0b0d12"; g.fillRect(x - 4, y - 4, 88, 96);
        if (lit) { var gr = g.createLinearGradient(x, y, x, y + 88); gr.addColorStop(0, rnd(["#ffd88a", "#ffe9b8", "#ffc870"])); gr.addColorStop(1, "#c98a3a"); g.fillStyle = gr; } else { g.fillStyle = rnd(["#101828", "#16203a", "#0d1424"]); }
        g.fillRect(x, y, 80, 88); g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(x + 38, y, 4, 88); g.fillRect(x, y + 42, 80, 4);
        if (lit && Math.random() < 0.4) { g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(x + 10, y + 50, 24, 38); }
      }
    });
  }
  function signTex(txt, bg, fg) { return G.textTex(txt, 512, 128, bg, fg, "bold 64px sans-serif"); }

  /* ---------- Haeuser ---------- */
  function building(x, z, w, h, d, kind, face) {   // z = vordere Kante (Fassade zeigt nach +z oder -z)
    var m = M(0xffffff, { map: G.rep(facadeTex(kind), Math.max(1, w / 10.4), Math.max(1, h / 12.8)), roughness: 0.95 });
    var b = box(w, h, d, m, x, h / 2, z + (face > 0 ? -d / 2 : d / 2)); sc.add(b);
    sc.add(box(w + 0.3, 0.3, d + 0.3, M(0x15171d, { roughness: 1 }), x, h + 0.15, z + (face > 0 ? -d / 2 : d / 2)));
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
      sc.add(plane(5, 1.7, new THREE.MeshBasicMaterial({ color: p[4] }), p[0], 1.6, 15.45, Math.PI)); sc.add(plane(3.4, 0.7, new THREE.MeshBasicMaterial({ map: signTex(p[1], p[2], p[3]) }), p[0], 3.1, 15.44, Math.PI));
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
    sc.add(cyl(0.05, 0.08, 4.2, M(0x1b1e24, { metalness: 0.6 }), x, 2.2, z, 8)); var arm = box(0.9, 0.06, 0.06, M(0x1b1e24), x, 4.3, z - 0.4); arm.rotation.z = 0; sc.add(arm);
    sc.add(box(0.4, 0.1, 0.22, new THREE.MeshBasicMaterial({ color: 0xffe3a0 }), x, 4.25, z - 0.82));
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); halo.scale.set(3.2, 3.2, 1); halo.position.set(x, 4.2, z - 0.82); sc.add(halo); halos.push(halo);
    S.obst.push([x - 0.12, x + 0.12, z - 0.12, z + 0.12]);
  }
  function tree(x, z) {
    sc.add(box(0.8, 0.28, 0.8, M(0x3a3f48, { roughness: 0.9 }), x, 0.26, z)); sc.add(cyl(0.1, 0.14, 2.2, M(0x4a3626, { roughness: 1 }), x, 1.4, z, 8));
    var l1 = M(0x1f6a3a, { roughness: 1 }), l2 = M(0x2a8048, { roughness: 1 }); sc.add(sph(0.9, l1, x, 3.0, z, 10, 8)); sc.add(sph(0.7, l2, x + 0.5, 3.5, z + 0.2, 10, 8)); sc.add(sph(0.65, l2, x - 0.5, 3.3, z - 0.3, 10, 8)); sc.add(sph(0.55, l1, x, 3.9, z, 10, 8));
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
  }

  /* ---------- Autos ---------- */
  var cars = [], halos = [];
  function makeCar(col) {
    var g = new THREE.Group(), body = M(col, { metalness: 0.5, roughness: 0.35 }), dark = M(0x10131a, { metalness: 0.2, roughness: 0.2 });
    g.add(box(4.2, 0.55, 1.85, body, 0, 0.6, 0)); g.add(box(2.2, 0.5, 1.7, M(col, { metalness: 0.5, roughness: 0.35 }), -0.2, 1.1, 0)); g.add(box(2.0, 0.38, 1.74, dark, -0.2, 1.1, 0));
    [[1.3, 0.9], [-1.3, 0.9], [1.3, -0.9], [-1.3, -0.9]].forEach(function (p) { var wh = cyl(0.36, 0.36, 0.26, M(0x0b0c0f, { roughness: 0.9 }), p[0], 0.36, p[1], 14); wh.rotation.x = Math.PI / 2; g.add(wh); var hub = cyl(0.18, 0.18, 0.28, M(0xb8bcc6, { metalness: 0.9 }), p[0], 0.36, p[1], 10); hub.rotation.x = Math.PI / 2; g.add(hub); });
    g.add(box(0.05, 0.15, 0.4, new THREE.MeshBasicMaterial({ color: 0xfff4d0 }), 2.1, 0.7, 0.6)); g.add(box(0.05, 0.15, 0.4, new THREE.MeshBasicMaterial({ color: 0xfff4d0 }), 2.1, 0.7, -0.6));
    g.add(box(0.05, 0.15, 0.4, new THREE.MeshBasicMaterial({ color: 0xff2a2a }), -2.1, 0.7, 0.6)); g.add(box(0.05, 0.15, 0.4, new THREE.MeshBasicMaterial({ color: 0xff2a2a }), -2.1, 0.7, -0.6));
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
    [[5.3, 1], [13.7, -1], [5.6, -1]].forEach(function (p, i) {
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
