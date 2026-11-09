/* detail.js — Feinschliff: feines Oberflaechen-Relief (Bump) auf grossen Flaechen, Kleinteile (Tasse, Papiere, Stifte, Steckdosen, Rohre, Kabel).
 * Rein dekorativ. Kill-Switch ?nodetail. */
(function () {
  function init() {
    var S = window.Parts3D.nextWorld.S, G = S.G, sc = S.scene, M = G.M, box = G.box, cyl = G.cyl;
    var low = false; try { low = localStorage.getItem("hashpool-next-quality") === "lo"; } catch (e) {}
    // --- 1. Relief-Textur (feines Korn + Kratzer), geteilt ---
    var grain = null;
    function mkGrain() {
      var c = document.createElement("canvas"); c.width = c.height = 256; var g = c.getContext("2d"), id = g.createImageData(256, 256), d = id.data;
      for (var i = 0; i < d.length; i += 4) { var v = 128 + (Math.random() - 0.5) * 24; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      g.putImageData(id, 0, 0); g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 1;
      for (var k = 0; k < 40; k++) { g.beginPath(); var x = Math.random() * 256, y = Math.random() * 256; g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 6); g.stroke(); }
      var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); try { t.anisotropy = 4; } catch (e) {} return t;
    }
    var done = new WeakSet(), nb = 0;
    function bump() {   // Relief entfernt (zu scharf). Stattdessen: Decals (Poster, Schatten, Schilder) per polygonOffset vor die Wand ziehen = kein Flackern
      var seen = new WeakSet();
      sc.traverse(function (o) {
        if (!o.isMesh || !o.material || Array.isArray(o.material) || !o.geometry || o.geometry.type !== "PlaneGeometry") return;
        var m = o.material; if (seen.has(m)) return; seen.add(m);
        var p = o.geometry.parameters || {}; if ((p.width || 0) > 6 || (p.height || 0) > 6) return;
        if (m.polygonOffset) return; m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; m.needsUpdate = true; nb++;
      });
    }
    // --- 2. Kleinteile, auf Oberflaechen abgesetzt (Raycast nach unten) ---
    var rc = new THREE.Raycaster(); rc.camera = S.cam;
    function drop(x, z, y0, maxd) {
      rc.set(new THREE.Vector3(x, y0 || 2.5, z), new THREE.Vector3(0, -1, 0)); rc.far = maxd || 2.6;
      var hs = rc.intersectObjects(sc.children, true).filter(function (h) { return h.object.visible && h.object.material && h.object.material.visible !== false && !h.object.material.transparent && h.face && h.face.normal.y > 0.5; });
      return hs.length ? hs[0].point.y : null;
    }
    var dk = M(0x1b1f27, { roughness: 0.6, metalness: 0.4 }), steel = M(0xaab2bd, { roughness: 0.35, metalness: 0.85 }), white = M(0xf1efe8, { roughness: 0.8 }), paper = M(0xf4f1e6, { roughness: 1 });
    function mug(x, z, col) { var y = drop(x, z); if (y == null) return; var g = new THREE.Group(); g.position.set(x, y, z);
      g.add(cyl(0.045, 0.04, 0.09, M(col, { roughness: 0.4 }), 0, 0.045, 0, 20)); g.add(cyl(0.039, 0.039, 0.005, M(0x2a1608, { roughness: 0.3 }), 0, 0.085, 0, 20));
      var h = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 8, 14, Math.PI), M(col, { roughness: 0.4 })); h.position.set(0.045, 0.045, 0); h.rotation.z = -Math.PI / 2; g.add(h); sc.add(g); }
    function papers(x, z, n) { var y = drop(x, z); if (y == null) return; for (var i = 0; i < n; i++) { var p = box(0.21, 0.004, 0.3, paper, x + (Math.random() - 0.5) * 0.02, y + 0.003 + i * 0.0045, z + (Math.random() - 0.5) * 0.02); p.rotation.y = (Math.random() - 0.5) * 0.25; sc.add(p); } }
    function pen(x, z, a, col) { var y = drop(x, z); if (y == null) return; var p = cyl(0.006, 0.006, 0.15, M(col, { roughness: 0.4 }), x, y + 0.006, z, 8); p.rotation.z = Math.PI / 2; p.rotation.y = a; sc.add(p); }
    function mon(x, z) { }
    mug(2.9, 0.1, 0xf7931a); papers(1.7, 0.15, 6); pen(1.95, 0.05, 0.4, 0x2a6bd1); pen(1.98, 0.1, -0.3, 0xd32f2f);
    mug(3.5, -3.3, 0xeeeeee); papers(2.4, -3.9, 4); pen(2.7, -3.35, 1.2, 0x78d505);
    // --- 3. Steckdosen / Schalter / Rohre / Kabel ---
    function outlet(x, y, z, ry) { var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.add(box(0.09, 0.09, 0.015, white, 0, 0, 0)); g.add(cyl(0.022, 0.022, 0.012, M(0x2a2a2a, { roughness: 0.7 }), 0, 0, 0.01, 14)).children[1].rotation.x = Math.PI / 2; sc.add(g); }
    function sw(x, y, z, ry) { var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.add(box(0.08, 0.12, 0.015, white, 0, 0, 0)); g.add(box(0.04, 0.06, 0.012, M(0xdcd8cc), 0, 0, 0.01)); sc.add(g); }
    outlet(-4.27, 0.45, -0.6, Math.PI / 2); outlet(4.26, 0.45, 0.3, -Math.PI / 2); outlet(-4.27, 0.45, -4.5, Math.PI / 2); outlet(4.26, 0.45, -5.5, -Math.PI / 2);
    sw(-0.1, 1.3, -1.28, 0); sw(-0.1, 1.3, 3.4, Math.PI);
    // Deckenrohr (Elektro-Leerrohr) im Verkaufsraum
    var pm = M(0x8d939d, { roughness: 0.4, metalness: 0.8 });
    var pipe = cyl(0.035, 0.035, 8.4, pm, 0, 3.4, -1.15, 12); pipe.rotation.z = Math.PI / 2; sc.add(pipe);
    for (var bx = -3.8; bx <= 3.9; bx += 1.3) { sc.add(box(0.05, 0.1, 0.06, pm, bx, 3.4, -1.18)); }
    // Bodenkabel (schwarz) vom Tresen zur Wand
    try { sc.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(4.2, 0.135, 0.85), new THREE.Vector3(3.9, 0.135, 1.1), new THREE.Vector3(3.7, 0.135, 0.9), new THREE.Vector3(3.4, 0.135, 0.5)]), 24, 0.012, 6, false), M(0x0c0d10, { roughness: 0.8 }))); } catch (e) {}
    // Mueleimer am Eingang (rund, mit Rand)
    var bn = new THREE.Group(); bn.position.set(-1.8, 0.12, 3.2); bn.add(cyl(0.17, 0.14, 0.45, M(0x3a4048, { roughness: 0.5, metalness: 0.6 }), 0, 0.225, 0, 24)); bn.add(cyl(0.18, 0.18, 0.03, M(0x2a2f36, { metalness: 0.7, roughness: 0.4 }), 0, 0.46, 0, 24)); sc.add(bn);
    S.obst.push([-2.0, -1.6, 3.0, 3.4]);
    bump(); setTimeout(bump, 15000); setTimeout(bump, 40000);
    console.log("[HASHPOOL NEXT] detail bereit (Decal-Offset auf " + nb + " Materialien)");
  }
  var n = 0, iv = setInterval(function () { n++; try { if (window.Parts3D && window.Parts3D.nextWorld && window.Parts3D.nextWorld.S.ready && window.Parts3D.nextPolish && typeof THREE !== "undefined") { clearInterval(iv); setTimeout(function () { try { init(); } catch (e) { console.warn("detail", e); try { window.Parts3D.nextWorld.S.err("detail " + (e && e.message) + " " + String(e && e.stack).split("\n")[1], e); } catch (x) {} } }, 3000); } } catch (e) { clearInterval(iv); } if (n > 240) clearInterval(iv); }, 500);
})();
