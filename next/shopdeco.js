/* shopdeco.js — mehr Leben im Verkaufsraum: Podest mit Glaskuppel, Getraenkeautomat, Wanduhr, Deckenventilator, Fussmatte, Schaufenster-Aufsteller.
 * Nur Dekoration (+ 2 Hindernisse). Kill-Switch ?noshopdeco. */
(function () {
  function init() {
    var S = window.Parts3D.nextWorld.S, G = S.G, sc = S.scene, M = G.M, box = G.box, cyl = G.cyl, sph = G.sph, plane = G.plane;
    var dk = M(0x1b1f27, { roughness: 0.55, metalness: 0.55 }), steel = M(0xaab2bd, { roughness: 0.35, metalness: 0.85 }), wood = M(0x6b4a2e, { roughness: 0.6 });
    // Podest mit Glaskuppel und PC-Turm (rund)
    var px = -1.9, pz = 1.3;
    sc.add(cyl(0.55, 0.6, 0.12, dk, px, 0.18, pz, 28)); sc.add(cyl(0.5, 0.5, 0.7, M(0x3a2a1e, { roughness: 0.7 }), px, 0.59, pz, 28)); sc.add(cyl(0.54, 0.54, 0.05, M(0xc9a24a, { metalness: 0.9, roughness: 0.3 }), px, 0.96, pz, 28));
    sc.add(G.rbox(0.3, 0.55, 0.5, 0.04, M(0x1a1d24, { metalness: 0.5, roughness: 0.3 }), px, 1.27, pz));
    sc.add(box(0.02, 0.4, 0.3, new THREE.MeshBasicMaterial({ color: 0x6aa8ff }), px + 0.16, 1.27, pz));
    var dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.2, depthWrite: false })); dome.scale.y = 1.4; dome.position.set(px, 0.99, pz); sc.add(dome);
    S.obst.push([px - 0.6, px + 0.6, pz - 0.6, pz + 0.6]);
    // Getraenkeautomat an der linken Wand vorn
    var vx = -4.0, vz = 3.0;
    sc.add(G.rbox(0.8, 1.9, 0.7, 0.05, M(0xc0392b, { roughness: 0.4, metalness: 0.3 }), vx, 1.07, vz));
    var face = box(0.02, 1.2, 0.5, new THREE.MeshBasicMaterial({ map: G.textTex("COLA", 128, 192, "#10151f", "#78d505", "bold 26px sans-serif") }), vx + 0.36, 1.25, vz); sc.add(face);
    sc.add(box(0.02, 0.2, 0.4, dk, vx + 0.36, 0.35, vz));
    S.obst.push([vx - 0.45, vx + 0.45, vz - 0.4, vz + 0.4]);
    // Wanduhr ueber dem Eingang (Innenseite der Frontwand)
    var cx = -2.4, cy = 2.75, cz = 3.4;
    var face2 = cyl(0.3, 0.3, 0.04, M(0xf2f2f2, { roughness: 0.5 }), cx, cy, cz, 32); face2.rotation.x = Math.PI / 2; sc.add(face2);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 32), dk); rim.position.set(cx, cy, cz - 0.01); sc.add(rim);
    var hh = box(0.03, 0.16, 0.01, dk, 0, 0.08, 0), mh = box(0.02, 0.24, 0.01, dk, 0, 0.12, 0);
    var gh = new THREE.Group(), gm = new THREE.Group(); gh.position.set(cx, cy, cz - 0.03); gm.position.set(cx, cy, cz - 0.04); gh.add(hh); gm.add(mh); sc.add(gh); sc.add(gm);
    // Deckenventilator
    var fx = -1.0, fz = 0.6, fan = new THREE.Group(); fan.position.set(fx, 3.3, fz); sc.add(fan);
    sc.add(cyl(0.02, 0.02, 0.3, dk, fx, 3.45, fz, 8)); fan.add(cyl(0.12, 0.12, 0.1, dk, 0, 0, 0, 16));
    for (var b = 0; b < 4; b++) { var bl = box(0.7, 0.015, 0.14, wood, 0.4, 0, 0); var arm = new THREE.Group(); arm.rotation.y = b * Math.PI / 2; arm.add(bl); fan.add(arm); }
    // Fussmatte am Eingang
    sc.add(G.rbox(1.2, 0.02, 0.7, 0.01, M(0x2a2e36, { roughness: 1 }), 0, 0.13, 3.15));
    S.ticks.push(function (dt, t) {
      fan.rotation.y += dt * 2.2;
      if (!S._clk || t - S._clk > 1) { S._clk = t; var d = new Date(), m = d.getMinutes() + d.getSeconds() / 60, h = (d.getHours() % 12) + m / 60; gm.rotation.z = -m / 60 * Math.PI * 2; gh.rotation.z = -h / 12 * Math.PI * 2; }
    });
    console.log("[HASHPOOL NEXT] shopdeco bereit (Podest, Automat, Uhr, Ventilator)");
  }
  var n = 0, iv = setInterval(function () { n++; try { if (window.Parts3D && window.Parts3D.nextWorld && window.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined") { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); console.warn("shopdeco", e); try { window.Parts3D.nextWorld.S.err("shopdeco", e); } catch (x) {} } if (n > 240) clearInterval(iv); }, 500);
})();
