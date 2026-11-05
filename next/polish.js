/* polish.js — Optik-Feinschliff fuer /next/: weiche Kontaktschatten unter Moebeln, Ambient-Occlusion an Waenden/Sockeln,
 * runde Deko (Haengelampen, Wandlampen). Alles in wenigen Draw-Calls (gemergte Geometrie). Kill-Switch ?nopolish. */
(function () {
  var W = window;
  function init() {
    var S = W.Parts3D.nextWorld.S, G = S.G, sc = S.scene, M = G.M, cyl = G.cyl, glow = G.glow;
    var low = false; try { low = localStorage.getItem("hashpool-next-quality") === "lo"; } catch (e) {}
    /* ---------- Texturen ---------- */
    var blob = G.ctex(128, 128, function (g, w, h) { g.clearRect(0, 0, w, h); g.shadowColor = "rgba(0,0,0,1)"; g.shadowBlur = 26; g.fillStyle = "rgba(0,0,0,0.9)"; g.fillRect(34, 34, 60, 60); });
    blob.wrapS = blob.wrapT = THREE.ClampToEdgeWrapping;
    var edge = G.ctex(4, 64, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(0,0,0,0.42)"); gr.addColorStop(0.35, "rgba(0,0,0,0.16)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    edge.wrapS = edge.wrapT = THREE.ClampToEdgeWrapping;
    function quadMesh(arr, uv, tex, y) {
      if (!arr.length) return null; var geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(arr), 3)); geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uv), 2));
      var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.frustumCulled = false; m.renderOrder = 1; sc.add(m); return m;
    }
    function pushQuad(P, U, a, b, c, d, uvs) { [a, b, c, a, c, d].forEach(function (p, i) { P.push(p[0], p[1], p[2]); }); [0, 1, 2, 0, 2, 3].forEach(function (k) { U.push(uvs[k][0], uvs[k][1]); }); }
    /* ---------- Raumkanten (Ambient Occlusion am Boden) ---------- */
    var ROOMS = [[-4.31, 4.31, -1.22, 3.47], [-4.31, 4.31, -6.61, -1.38], [4.31, 10.3, -6.6, -1.45], [-4.31, 4.31, -13.6, -6.8], [4.5, 10.5, -0.6, 3.47]];
    var P = [], U = [], Y = 0.128, E = 0.55;
    ROOMS.forEach(function (r) {
      var x0 = r[0], x1 = r[1], z0 = r[2], z1 = r[3];
      pushQuad(P, U, [x0, Y, z0], [x1, Y, z0], [x1, Y, z0 + E], [x0, Y, z0 + E], [[0, 0], [1, 0], [1, 1], [0, 1]]);
      pushQuad(P, U, [x1, Y, z1], [x0, Y, z1], [x0, Y, z1 - E], [x1, Y, z1 - E], [[0, 0], [1, 0], [1, 1], [0, 1]]);
      pushQuad(P, U, [x0, Y, z1], [x0, Y, z0], [x0 + E, Y, z0], [x0 + E, Y, z1], [[0, 0], [1, 0], [1, 1], [0, 1]]);
      pushQuad(P, U, [x1, Y, z0], [x1, Y, z1], [x1 - E, Y, z1], [x1 - E, Y, z0], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    });
    quadMesh(P, U, edge);
    /* ---------- Kontaktschatten unter Moebeln (nur statische Objekte direkt an der Szene) ---------- */
    var done = {};
    function scan() {
      var P2 = [], U2 = [], n = 0, bb = new THREE.Box3();
      sc.children.forEach(function (o) {
        if (!o.isMesh || o.userData.noShadow || !o.visible || !o.geometry || done[o.id]) return; done[o.id] = 1;
        try { bb.setFromObject(o); } catch (e) { return; }
        var dx = bb.max.x - bb.min.x, dz = bb.max.z - bb.min.z, h = bb.max.y - bb.min.y;
        if (bb.min.y > 0.22 || bb.max.y < 0.35 || bb.max.y > 3.2 || dx < 0.25 || dz < 0.25 || dx > 6 || dz > 6 || h < 0.3) return;
        var cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2; if (cz > 3.5 || cz < -13.7 || cx < -4.4 || cx > 10.6) return;       // nur Innenraeume
        if (cx > -0.01 && cx < 0.01 && false) return;
        var px = 0.22 + Math.min(0.3, h * 0.1), x0 = bb.min.x - px, x1 = bb.max.x + px, z0 = bb.min.z - px, z1 = bb.max.z + px, y = 0.131;
        pushQuad(P2, U2, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [[0, 0], [1, 0], [1, 1], [0, 1]]); n++;
      });
      if (W.Parts3D.nextFarmHall && !done.hall) { done.hall = 1; [[-10.4, -9.5], [-12.5, -11.6]].forEach(function (r) { for (var hx = -3.3; hx <= 3.3; hx += 0.66) { pushQuad(P2, U2, [hx - 0.55, 0.131, r[0] - 0.25], [hx + 0.55, 0.131, r[0] - 0.25], [hx + 0.55, 0.131, r[1] + 0.25], [hx - 0.55, 0.131, r[1] + 0.25], [[0, 0], [1, 0], [1, 1], [0, 1]]); n++; } }); }
      if (n) quadMesh(P2, U2, blob);
      return n;
    }
    setTimeout(function () { try { scan(); } catch (e) { S.err("polish/schatten: " + e.message); } }, 7000);
    setTimeout(function () { try { scan(); } catch (e) {} }, 25000);
    /* ---------- Sockelleisten, Stuckleisten, Handlauf-Leiste (mit Tuerluecken) ---------- */
    var trimM = M(0xe9e4d8, { roughness: 0.6 }), railM = M(0xb48a52, { roughness: 0.5 });
    function strip(axis, fixed, a0, a1, gaps, y, h, th, mat) {   // axis "x": Leiste entlang x bei z=fixed
      var segs = [[a0, a1]]; (gaps || []).forEach(function (g) { var n = []; segs.forEach(function (sg) { if (g[1] <= sg[0] || g[0] >= sg[1]) { n.push(sg); return; } if (g[0] > sg[0]) n.push([sg[0], g[0]]); if (g[1] < sg[1]) n.push([g[1], sg[1]]); }); segs = n; });
      segs.forEach(function (sg) { var len = sg[1] - sg[0]; if (len < 0.05) return; var m = axis === "x" ? G.box(len, h, th, mat, (sg[0] + sg[1]) / 2, y, fixed) : G.box(th, h, len, mat, fixed, y, (sg[0] + sg[1]) / 2); m.userData.noShadow = true; sc.add(m); });
    }
    function room(x0, x1, z0, z1, g, wain) {
      var t = 0.03, I = 0.015;
      [[0.2, 0.14, t, trimM], [3.5, 0.12, 0.05, trimM]].concat(wain ? [[1.0, 0.05, 0.025, railM]] : []).forEach(function (L) {
        strip("x", z0 + I + L[2] / 2, x0 + I, x1 - I, g.zmin, L[0], L[1], L[2], L[3]); strip("x", z1 - I - L[2] / 2, x0 + I, x1 - I, g.zmax, L[0], L[1], L[2], L[3]);
        strip("z", x0 + I + L[2] / 2, z0 + I, z1 - I, g.xmin, L[0], L[1], L[2], L[3]); strip("z", x1 - I - L[2] / 2, z0 + I, z1 - I, g.xmax, L[0], L[1], L[2], L[3]);
      });
    }
    room(-4.31, 4.31, -1.22, 3.47, { zmin: [[-0.95, 0.95]], zmax: [[-0.95, 0.95]], xmin: [], xmax: [] }, true);
    room(-4.31, 4.31, -6.61, -1.38, { zmax: [[-0.95, 0.95]], zmin: [[-1.8, -0.5]], xmin: [], xmax: [[-2.7, -1.4]] }, true);
    room(4.31, 10.3, -6.6, -1.45, { zmax: [], zmin: [], xmin: [[-2.7, -1.4]], xmax: [] }, false);
    room(-4.31, 4.31, -13.6, -6.8, { zmax: [[-1.8, -0.5]], zmin: [], xmin: [], xmax: [] }, false);
    /* ---------- Runde Deko: Haengelampen + Wandlampen ---------- */
    function lamp(x, y, z, cord, col) {
      var g = new THREE.Group(); g.position.set(x, y, z);
      g.add(cyl(0.008, 0.008, cord, M(0x15181e), 0, cord / 2, 0, 6));
      var pts = [[0.04, 0], [0.1, -0.03], [0.2, -0.12], [0.28, -0.22], [0.3, -0.25], [0.28, -0.25], [0.18, -0.2], [0.09, -0.1], [0.03, -0.03]].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
      var sh = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.5, side: THREE.DoubleSide })); sh.position.y = 0; g.add(sh);
      g.add(G.sph(0.07, glow(0xfff0c8), 0, -0.14, 0, 12, 8)); g.add(cyl(0.04, 0.04, 0.05, M(0x15181e), 0, 0.03, 0, 10));
      var halo = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.1, depthWrite: false })); halo.rotation.x = Math.PI / 2; halo.position.y = -0.26; g.add(halo);
      g.userData.noShadow = true; sc.add(g); return g;
    }
    lamp(1.6, 3.5, 0.2, 0.9, 0xf7931a); lamp(3.1, 3.5, 0.2, 0.9, 0xf7931a); lamp(3.0, 3.5, -3.6, 0.9, 0x6aa8ff); lamp(-2.0, 3.5, -4.0, 0.7, 0x6aa8ff);
    if (!low) { lamp(-2.2, 3.5, 2.4, 0.8, 0x78d505); }
    function sconce(x, y, z, ry) {
      var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.add(G.box(0.1, 0.2, 0.04, M(0x15181e), 0, 0, 0));
      var pts = [[0.03, 0], [0.09, 0.04], [0.14, 0.14], [0.13, 0.22], [0.1, 0.24], [0.08, 0.14], [0.03, 0.05]].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
      var sh = new THREE.Mesh(new THREE.LatheGeometry(pts, 20), new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: 0.5, side: THREE.DoubleSide })); sh.position.set(0, -0.08, 0.1); g.add(sh);
      g.add(G.sph(0.05, glow(0xfff0c8), 0, 0.02, 0.1, 10, 8)); g.userData.noShadow = true; sc.add(g);
    }
    sconce(-4.26, 2.2, -2.3, Math.PI / 2); sconce(-4.26, 2.2, -5.0, Math.PI / 2); sconce(4.26, 2.4, 3.0, -Math.PI / 2);
    W.Parts3D.nextPolish = { scan: scan };
    console.log("[HASHPOOL NEXT] polish bereit (Schatten, Lampen)");
  }
  var n = 0, iv = setInterval(function () {
    n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined") { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); try { W.Parts3D.nextWorld.S.err("polish: " + e.message); } catch (x) {} }
    if (n > 400) clearInterval(iv);
  }, 400);
})();
