/* furniture.js — Regal (Lager) und Bautisch mit mehr Details/runden Formen. Ergaenzt die vorhandenen Objekte (Positionen unveraendert).
 * buildFurniture(sc, G) nutzt nur THREE + die Helfer M/box/cyl/plane/ctex/glow und laeuft daher auch im Connector-Viewer. Kill-Switch ?nofurniture. */
(function () {
  function buildFurniture(sc, G) {
    var M = G.M, box = G.box, cyl = G.cyl, plane = G.plane, glow = G.glow;
    var steel = M(0xaab2bd, { roughness: 0.35, metalness: 0.85 }), dk = M(0x1b1f27, { roughness: 0.55, metalness: 0.55 }), org = M(0xf7931a, { roughness: 0.5 }), wood = M(0x6b4a2e, { roughness: 0.6 }), wood2 = M(0x8a6240, { roughness: 0.55 }), br = M(0xc9a24a, { metalness: 0.85, roughness: 0.3 });
    /* ---------- Regal: x 1.4 ± 1.7, z -6.6..-6.0, Boeden bei y 0.2 + n*0.85 ---------- */
    var perf = G.ctex(256, 256, function (g, w, h) { g.fillStyle = "#1d2430"; g.fillRect(0, 0, w, h); g.fillStyle = "#0a0d12"; for (var y = 12; y < h; y += 24) for (var x = 12 + ((y / 24 | 0) % 2) * 12; x < w; x += 24) { g.beginPath(); g.arc(x, y, 5, 0, 6.3); g.fill(); } });
    perf.wrapS = perf.wrapT = THREE.RepeatWrapping; perf.repeat.set(4, 3);
    sc.add(plane(3.3, 2.45, new THREE.MeshStandardMaterial({ map: perf, roughness: 0.6, metalness: 0.4 }), 1.4, 1.35, -6.495));
    var xb = function (x0, z0, ry) { var b = box(0.04, 3.0, 0.02, steel, x0, 1.35, z0); b.rotation.z = ry; sc.add(b); }; xb(0.55, -6.48, 0.62); xb(0.55, -6.48, -0.62); xb(2.25, -6.48, 0.62); xb(2.25, -6.48, -0.62);
    [-0.28, 1.4, 3.08].forEach(function (x) {
      sc.add(cyl(0.04, 0.04, 2.66, steel, x, 1.33, -6.02, 14)); sc.add(cyl(0.05, 0.05, 0.05, dk, x, 2.68, -6.02, 14));
      sc.add(cyl(0.05, 0.065, 0.07, dk, x, 0.155, -6.05, 12)); sc.add(cyl(0.05, 0.065, 0.07, dk, x, 0.155, -6.55, 12));
    });
    for (var lv = 0; lv < 4; lv++) {
      var y = 0.2 + lv * 0.85; sc.add(box(3.4, 0.1, 0.03, org, 1.4, y + 0.06, -5.995)); sc.add(box(3.4, 0.03, 0.06, dk, 1.4, y + 0.03, -6.02));
      ["CPU/RAM", "GPU", "SSD/PSU"].forEach(function (lt, li) { sc.add(box(0.5, 0.07, 0.01, new THREE.MeshBasicMaterial({ map: G.textTex(lt, 192, 48, "#e8e4d8", "#10151f", "bold 30px sans-serif") }), 0.3 + li * 1.1, y + 0.065, -5.975)); });
    }
    /* ---------- Bautisch: Mitte (3.0, -3.6), Platte y 0.95, 2.2 x 1.3 ---------- */
    var bz = -3.6, bx = 3.0;
    sc.add(box(1.96, 0.14, 1.12, wood, bx, 0.82, bz));                                   // Zarge
    [-0.4, 0, 0.4].forEach(function (dz) { sc.add(box(0.03, 0.15, 0.34, wood2, 2.0, 0.81, bz + dz)); sc.add(cyl(0.018, 0.018, 0.05, br, 1.97, 0.81, bz + dz, 10)); });
    var lowShelf = box(1.9, 0.04, 1.0, wood2, bx, 0.28, bz); sc.add(lowShelf);
    [[2.05, bz - 0.5], [3.95, bz - 0.5], [2.05, bz + 0.5], [3.95, bz + 0.5]].forEach(function (p) { sc.add(cyl(0.05, 0.05, 0.9, wood, p[0], 0.47, p[1], 10)); });
    sc.add(box(0.06, 0.05, 1.0, wood, 2.05, 0.28, bz)); sc.add(box(0.06, 0.05, 1.0, wood, 3.95, 0.28, bz));
    [[1.92, 0, 1.3], [4.08, 0, 1.3]].forEach(function (e) { var r = cyl(0.05, 0.05, 1.3, wood2, e[0], 0.95, bz, 14); r.rotation.x = Math.PI / 2; sc.add(r); });
    [bz - 0.65, bz + 0.65].forEach(function (z) { var r = cyl(0.05, 0.05, 2.2, wood2, bx, 0.95, z, 14); r.rotation.z = Math.PI / 2; sc.add(r); });
    for (var c = 0; c < 3; c++) sc.add(box(0.5, 0.3 + (c % 2) * 0.08, 0.38, M([0x2f4a6b, 0x6b3a2f, 0x4a5a2f][c], { roughness: 0.8 }), 2.55 + c * 0.55, 0.45, bz + (c - 1) * 0.1));
    var vise = new THREE.Group(); vise.position.set(3.88, 1.0, bz - 0.5); sc.add(vise);
    vise.add(box(0.26, 0.12, 0.16, dk, 0, 0.06, 0)); vise.add(box(0.06, 0.16, 0.14, steel, 0.16, 0.12, 0)); var scr = cyl(0.018, 0.018, 0.3, steel, 0.28, 0.1, 0, 8); scr.rotation.z = Math.PI / 2; vise.add(scr); vise.add(cyl(0.012, 0.012, 0.2, steel, 0.42, 0.1, 0, 6));
  }
  function init() { var S = window.Parts3D.nextWorld.S; buildFurniture(S.scene, S.G); console.log("[HASHPOOL NEXT] furniture bereit (Regal, Bautisch)"); }
  window.__nextBuildFurniture = buildFurniture;
  if (window.Parts3D && window.Parts3D.nextWorld && window.Parts3D.nextWorld.S) { /* Viewer-Test ohne Spiel */ }
  var n = 0, iv = setInterval(function () { n++; try { if (window.Parts3D && window.Parts3D.nextWorld && window.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined") { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); try { window.Parts3D.nextWorld.S.err("furniture: " + e.message); } catch (x) {} } if (n > 400) clearInterval(iv); }, 400);
})();
