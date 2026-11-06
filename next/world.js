/* world.js — HASHPOOL NEXT: Shop-Simulator als Hauptscreen (nur in /next/ geladen)
 * ERSTE PERSON: du bist der Ladenbesitzer und laeufst selbst durch Laden, Hinterraum und (mit env.js) die Strasse.
 * Links Joystick (laufen), Rest wischen (umsehen), Station/Kunde antippen = hinlaufen + benutzen. WASD/Pfeile am PC.
 * Erweiterungs-Schnittstelle (fuer env.js, logistics.js, clicker.js): Parts3D.nextWorld.S
 *   S.rects (begehbare Flaechen), S.obst (Hindernisse), S.rooms/doors (Auto-Lauf), S.ticks (pro Frame), S.G (Grafik-Helfer),
 *   S.invShow(html)/S.invClose()/S.invActions, S.err(msg), S.toast(msg)
 * Speicher: nur localStorage hashpool-next-*.
 */
(function () {
  var W = window;
  if (W.__nxWorld) return; W.__nxWorld = true;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  function T(a, b) { return de() ? a : b; }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rr(a, b) { return a + Math.random() * (b - a); }
  function ORD() { return W.Parts3D && Parts3D.orders; }
  function SHOPDBG() { return W.Parts3D && Parts3D.shop && Parts3D.shop._dbg; }
  var PREF = "hashpool-next-world";

  /* ---------- Grafik-Helfer ---------- */
  function mat(c, o) { var p = { color: c, roughness: 0.8, metalness: 0.1 }; if (o) for (var k in o) p[k] = o[k]; return new THREE.MeshStandardMaterial(p); }
  function glow(c) { return new THREE.MeshBasicMaterial({ color: c }); }
  var GEO = {}, LOWQ = false; try { LOWQ = localStorage.getItem("hashpool-next-quality") === "lo"; } catch (e) {}
  function rgeo(w, h, d, r) {                  // abgerundeter Quader (Extrude mit Fase) - gecacht je Abmessung
    r = Math.min(r, Math.min(w, h, d) * 0.3); var k = [w, h, d, r].map(function (v) { return v.toFixed(3); }).join("|"); if (GEO[k]) return GEO[k];
    var g; try {
      var hw = (w - 2 * r) / 2, hh = (h - 2 * r) / 2, c = Math.max(0.001, Math.min(r * 0.9, hw * 0.9, hh * 0.9)), sh = new THREE.Shape();
      sh.moveTo(-hw + c, -hh); sh.lineTo(hw - c, -hh); sh.quadraticCurveTo(hw, -hh, hw, -hh + c); sh.lineTo(hw, hh - c); sh.quadraticCurveTo(hw, hh, hw - c, hh); sh.lineTo(-hw + c, hh); sh.quadraticCurveTo(-hw, hh, -hw, hh - c); sh.lineTo(-hw, -hh + c); sh.quadraticCurveTo(-hw, -hh, -hw + c, -hh);
      g = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelOffset: 0, bevelSegments: 2, curveSegments: 3, steps: 1 }); g.translate(0, 0, -(d - 2 * r) / 2);
    } catch (e) { g = new THREE.BoxGeometry(w, h, d); }
    GEO[k] = g; return g;
  }
  function box(w, h, d, m, x, y, z) {
    var mn = Math.min(w, h, d), mxx = Math.max(w, h, d), g = (!LOWQ && mn >= 0.05 && mxx < 3.2 && !(m && m.map)) ? rgeo(w, h, d, Math.max(0.012, Math.min(0.04, mn * 0.2))) : new THREE.BoxGeometry(w, h, d);
    var o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); return o;
  }
  function rbox(w, h, d, r, m, x, y, z) { var o = new THREE.Mesh(LOWQ ? new THREE.BoxGeometry(w, h, d) : rgeo(w, h, d, r), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function cyl(rt, rb, h, m, x, y, z, seg) { var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function sph(r, m, x, y, z, ws, hs) { var o = new THREE.Mesh(new THREE.SphereGeometry(r, ws || 16, hs || 12), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function tube(pts, r, m, seg) { try { var c = new THREE.CatmullRomCurve3(pts.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); })); return new THREE.Mesh(new THREE.TubeGeometry(c, seg || 24, r, 6, false), m); } catch (e) { return new THREE.Group(); } }
  function fan(r, col, blades) {                // Luefter: Ring + Nabe + Fluegel (Gruppe, um z drehen)
    var g = new THREE.Group(), n = blades || 7, bm = mat(col || 0x0b0d11, { roughness: 0.5, metalness: 0.3 });
    var ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.07, 8, 28), mat(0x1a1d24, { metalness: 0.6, roughness: 0.4 })); g.add(ring);
    var spin = new THREE.Group(); g.add(spin); spin.add(cyl(r * 0.22, r * 0.22, r * 0.12, mat(0x2a2f3a, { metalness: 0.7 }), 0, 0, 0, 16)).children[0].rotation.x = Math.PI / 2;
    for (var i = 0; i < n; i++) { var b = new THREE.Mesh(new THREE.BoxGeometry(r * 0.46, r * 0.82, r * 0.025), bm); var a = i * 6.2832 / n; b.position.set(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 0); b.rotation.z = a - Math.PI / 2; b.rotation.y = 0.45; spin.add(b); }
    g.userData.spin = spin; return g;
  }
  function plane(w, h, m, x, y, z, ry) { var o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x || 0, y || 0, z || 0); if (ry) o.rotation.y = ry; return o; }
  function textTex(txt, w, h, bg, fg, font) {
    /* scharfer Text: 3x Aufloesung, Schrift passt sich automatisch in das Schild ein (nichts ragt mehr heraus) */
    var K = Math.min(3, Math.max(1, Math.floor(2048 / w))), c = document.createElement("canvas"); c.width = w * K; c.height = h * K; var g = c.getContext("2d");
    g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
    var m = /(\d+(?:\.\d+)?)px/.exec(font), px = m ? parseFloat(m[1]) * K : 32 * K, mk = function (q) { return m ? font.replace(m[0], q + "px") : q + "px " + font; };
    px = Math.min(px, h * K * 0.7); g.font = mk(px);
    try { var tw = g.measureText(txt).width, maxw = c.width * 0.9; if (tw > maxw) { px = Math.floor(px * maxw / tw); g.font = mk(px); } } catch (e) {}
    g.fillText(txt, c.width / 2, c.height / 2 + px * 0.04);
    var t = new THREE.CanvasTexture(c); try { t.anisotropy = 8; } catch (e) {} return t;
  }
  function ctex(w, h, draw) { var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; try { t.anisotropy = 4; } catch (e) {} return t; }
  function rep(t, rx, ry) { var c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c; }
  function speckle(g, w, h, n, cols, s) { for (var i = 0; i < n; i++) { g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(Math.random() * w, Math.random() * h, s || 2, s || 2); } }
  var TX = {};
  function tex(name) {
    if (TX[name]) return TX[name];
    var t;
    switch (name) {
      case "wood": t = ctex(512, 512, function (g, w, h) {
        for (var r = 0; r < 8; r++) {
          var y = r * 64, sh = 100 + ((Math.random() * 40) | 0); g.fillStyle = "rgb(" + (sh + 30) + "," + (sh - 10) + "," + (sh - 45) + ")"; g.fillRect(0, y, w, 64);
          var off = Math.random() * w; g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(0, y, w, 2); g.fillRect(off, y, 2, 64); g.fillRect((off + w / 2) % w, y, 2, 64);
          for (var k = 0; k < 14; k++) { g.fillStyle = "rgba(" + (Math.random() < 0.5 ? "0,0,0" : "255,220,170") + ",.07)"; g.fillRect(Math.random() * w, y + Math.random() * 62, 40 + Math.random() * 120, 1.5); }
        }
      }); break;
      case "tile": t = ctex(256, 256, function (g, w, h) {
        for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) { var s = 96 + ((Math.random() * 14) | 0); g.fillStyle = "rgb(" + s + "," + (s + 6) + "," + (s + 16) + ")"; g.fillRect(a * 128, b * 128, 128, 128); }
        g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(0, 0, w, 3); g.fillRect(0, 128, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(128, 0, 3, h); speckle(g, w, h, 500, ["rgba(255,255,255,.06)", "rgba(0,0,0,.08)"], 2);
      }); break;
      case "plaster": t = ctex(256, 256, function (g, w, h) { g.fillStyle = "#39445a"; g.fillRect(0, 0, w, h); speckle(g, w, h, 1600, ["rgba(255,255,255,.035)", "rgba(0,0,0,.06)"], 2); }); break;
      case "plasterWarm": t = ctex(256, 256, function (g, w, h) { g.fillStyle = "#4a4237"; g.fillRect(0, 0, w, h); speckle(g, w, h, 1600, ["rgba(255,255,255,.04)", "rgba(0,0,0,.06)"], 2); }); break;
      case "asphalt": t = ctex(512, 512, function (g, w, h) { g.fillStyle = "#2a2d33"; g.fillRect(0, 0, w, h); speckle(g, w, h, 5000, ["rgba(255,255,255,.07)", "rgba(0,0,0,.12)", "rgba(120,120,130,.12)"], 2); }); break;
      case "pave": t = ctex(256, 256, function (g, w, h) {
        for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) { var s = 118 + ((Math.random() * 30) | 0); g.fillStyle = "rgb(" + s + "," + s + "," + (s + 6) + ")"; g.fillRect(a * 64, b * 64, 64, 64); }
        g.fillStyle = "rgba(0,0,0,.4)"; for (var i = 0; i < 4; i++) { g.fillRect(i * 64, 0, 2, h); g.fillRect(0, i * 64, w, 2); } speckle(g, w, h, 600, ["rgba(255,255,255,.07)", "rgba(0,0,0,.1)"], 2);
      }); break;
      case "brick": t = ctex(256, 256, function (g, w, h) {
        g.fillStyle = "#3a2a2a"; g.fillRect(0, 0, w, h);
        for (var r = 0; r < 8; r++) for (var c = -1; c < 4; c++) { var x = c * 64 + (r % 2 ? 32 : 0), s = (Math.random() * 26) | 0; g.fillStyle = "rgb(" + (130 + s) + "," + (66 + (s >> 1)) + "," + (52 + (s >> 1)) + ")"; g.fillRect(x + 2, r * 32 + 2, 60, 28); }
        speckle(g, w, h, 700, ["rgba(0,0,0,.14)", "rgba(255,255,255,.05)"], 2);
      }); break;
      case "metal": t = ctex(128, 128, function (g, w, h) { g.fillStyle = "#3c424d"; g.fillRect(0, 0, w, h); for (var i = 0; i < 90; i++) { g.fillStyle = "rgba(255,255,255," + (Math.random() * 0.07) + ")"; g.fillRect(0, Math.random() * h, w, 1); } }); break;
      case "awning": t = ctex(256, 64, function (g, w, h) { for (var i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f4efe6" : "#f7931a"; g.fillRect(i * 32, 0, 32, h); } }); break;
      case "carpet": t = ctex(128, 128, function (g, w, h) { g.fillStyle = "#2c3a58"; g.fillRect(0, 0, w, h); speckle(g, w, h, 900, ["rgba(255,255,255,.06)", "rgba(0,0,0,.12)"], 2); }); break;
      default: t = ctex(8, 8, function (g) { g.fillStyle = "#888"; g.fillRect(0, 0, 8, 8); });
    }
    TX[name] = t; return t;
  }
  var PCOL = [0xe8e8ec, 0x78d505, 0xff3a6e, 0x3a8bff, 0xffb020];
  function posterTex(kind) {
    return ctex(256, 352, function (g, w, h) {
      var bgs = { gpu: ["#1b0d2e", "#ff3a6e"], cpu: ["#0d2036", "#3a8bff"], sale: ["#2e1a0d", "#f7931a"], rgb: ["#0d2e1b", "#78d505"] }, c = bgs[kind] || bgs.sale;
      g.fillStyle = c[0]; g.fillRect(0, 0, w, h); var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "rgba(255,255,255,.0)"); gr.addColorStop(1, c[1] + "55"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = c[1]; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = c[1]; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = "bold 54px sans-serif"; g.fillText(kind === "gpu" ? "RTX" : kind === "cpu" ? "CPU" : kind === "rgb" ? "RGB" : "SALE", w / 2, 90);
      g.font = "bold 26px sans-serif"; g.fillText(kind === "sale" ? "-20 %" : "HASHPOOL", w / 2, 150); g.fillStyle = "#ffffffcc"; g.font = "20px sans-serif"; g.fillText("PC · Parts · Mining", w / 2, 300);
      g.strokeStyle = c[1]; g.lineWidth = 4; g.strokeRect(70, 180, 116, 80); g.beginPath(); g.moveTo(70, 180); g.lineTo(186, 260); g.moveTo(186, 180); g.lineTo(70, 260); g.stroke();
    });
  }

  /* ---------- Raeume / Kollision (Draufsicht: x rechts, z zum Betrachter/Strasse) ---------- */
  var DIV = -1.3;                              // Trennwand z; Tuer in der Mitte (|x| < 0.9)
  var R = 0.28;                                // Koerperradius
  var S = { ready: false, shown: false, hiddenByOverlay: false, t: 0, last: 0, cust: null, queue: [], nextCust: 5, hits: [], stations: {}, sig: "", dlg: null, invOpen: false, invGroup: null, raf: 0,
            yaw: Math.PI, pitch: 0, px: 0.3, pz: 1.4, py: 0.12, auto: null, joy: { x: 0, y: 0 }, keys: {}, bob: 0, face: null, ticks: [], invActions: {}, errN: 0,
            // begehbare Rechtecke [x1,x2,z1,z2] (Wandflaeche zu Wandflaeche, Koerperradius wird abgezogen); Tueren sind eigene Rechtecke, die in beide Raeume ragen
            rects: [[-4.31, 4.31, -1.22, 3.47], [-4.31, 4.31, -6.61, -1.38], [-0.85, 0.85, -2.0, -0.5], [-0.85, 0.85, 2.8, 4.3]],
            // Hindernisse (Rechtecke, Abstand < R wird blockiert): Theke, Computer-Tisch, Regal, Bautisch, Laden-Regal, Schaufenster-Podest
            obst: [[0.8, 3.8, -0.25, 0.65], [-3.9, -1.9, -6.5, -5.5], [-0.4, 3.2, -7.0, -6.0], [1.9, 4.1, -4.3, -2.9], [-4.3, -2.5, 2.7, 3.1], [1.6, 3.7, 2.3, 3.1]],
            // Raeume fuer den Auto-Lauf: id, Tueren (Verbindung a<->b mit je einem Wegpunkt davor/dahinter)
            doors: [{ a: "A", b: "B", pa: [0, -0.4], pb: [0, -2.2] }, { a: "A", b: "E", pa: [0, 2.5], pb: [0, 4.6] }],
            roomOf: function (x, z) { if (z < DIV) return "B"; if (z < 3.47 && Math.abs(x) <= 4.35) return "A"; return "E"; } };
  S.G = { M: mat, glow: glow, box: box, rbox: rbox, tube: tube, fan: fan,  cyl: cyl, sph: sph, plane: plane, ctex: ctex, rep: rep, tex: tex, textTex: textTex, speckle: speckle, rnd: rnd, rr: rr, T: T, de: de, fmt: fmt, posterTex: posterTex };
  function inRegion(x, z) {
    for (var i = 0; i < S.rects.length; i++) { var r = S.rects[i]; if (x > r[0] + R && x < r[1] - R && z > r[2] + R && z < r[3] - R) return true; }
    return false;
  }
  function hitsObst(x, z) {
    for (var i = 0; i < S.obst.length; i++) { var o = S.obst[i], cx = Math.max(o[0], Math.min(x, o[1])), cz = Math.max(o[2], Math.min(z, o[3])); if ((x - cx) * (x - cx) + (z - cz) * (z - cz) < R * R) return true; }
    return false;
  }
  function free(x, z) { return inRegion(x, z) && !hitsObst(x, z); }
  function route(fx, fz, tx, tz) {             // Wegpunkte (Auto-Lauf): Raumwechsel immer durch die Tueren (Breitensuche ueber S.doors)
    var a = S.roomOf(fx, fz), b = S.roomOf(tx, tz), pts = [];
    if (a !== b) {
      var prev = {}, q = [a], seen = {}; seen[a] = 1;
      while (q.length) { var c = q.shift(); if (c === b) break; S.doors.forEach(function (d) { var o = d.a === c ? d.b : d.b === c ? d.a : null; if (o && !seen[o]) { seen[o] = 1; prev[o] = { from: c, d: d }; q.push(o); } }); }
      var chain = [], cur = b; while (cur !== a && prev[cur]) { chain.unshift(prev[cur]); cur = prev[cur].from; }
      chain.forEach(function (st) { var d = st.d, fa = st.from === d.a; pts.push(fa ? d.pa : d.pb); pts.push(fa ? d.pb : d.pa); });
    }
    pts.push([tx, tz]); return pts;
  }
  function gy(x, z) { return (z > 6.3 && z < 12.5) ? 0 : 0.12; }
  var root = null;

  function css() {
    if (document.getElementById("nx-style")) return;
    var s = document.createElement("style"); s.id = "nx-style";
    s.textContent =
      "#nx-world{position:fixed;inset:0;z-index:800;background:#0a0d14;display:none;touch-action:none;-webkit-user-select:none;user-select:none}#nx-world.show{display:block}" +
      "#nx-world canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none}" +
      ".nx-hud{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 26px) 10px 8px;color:#e7e9ec;font:700 13px monospace;pointer-events:none;background:linear-gradient(#0009,#0000);z-index:3}" +
      ".nx-hud b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px}.nx-hud button{pointer-events:auto;font:700 11px monospace;padding:7px 7px;border-radius:9px;border:1px solid #2c3646;background:#12161ccc;color:#e7e9ec}" +
      "#nx-sub{position:absolute;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 66px);color:#ffd9a0;font:700 12px monospace;text-shadow:0 1px 3px #000;pointer-events:none;z-index:3}#nx-err{position:absolute;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 86px);color:#ff7a7a;font:11px monospace;text-shadow:0 1px 3px #000;pointer-events:none;z-index:3}" +
      ".nx-lbl{position:absolute;transform:translate(-50%,-100%);background:#12161ce6;color:#f7931a;border:1px solid #f7931a;border-radius:10px;padding:5px 9px;font:700 12px monospace;white-space:nowrap;cursor:pointer;z-index:2}" +
      ".nx-lbl.cust{background:#fff;color:#111;border-color:#fff;font-size:16px}" +
      "#nx-joy{position:absolute;left:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);width:130px;height:130px;border-radius:50%;background:#ffffff14;border:2px solid #ffffff44;z-index:3;touch-action:none}#nx-knob{position:absolute;left:45px;top:45px;width:40px;height:40px;border-radius:50%;background:#f7931acc;pointer-events:none}" +
      ".nx-hint{position:absolute;left:160px;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);color:#aeb6c2;font:11px monospace;text-shadow:0 1px 3px #000;pointer-events:none;text-align:right}" +
      ".nx-cross{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#ffffff88;pointer-events:none}" +
      "#nx-dlg,#nx-inv{position:absolute;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);background:#12161c;border:1px solid #f7931a;border-radius:16px;padding:12px 14px;color:#e7e9ec;font:13px sans-serif;display:none;z-index:5;max-height:66%;overflow:auto;box-shadow:0 8px 30px #000a}#nx-dlg.show,#nx-inv.show{display:block}" +
      "#nx-dlg h4,#nx-inv h4{margin:0 0 4px;font-size:15px}#nx-dlg h4 i{font-weight:400;color:#aeb6c2;font-size:12px}#nx-dlg p{margin:6px 0}#nx-dlg ul{margin:6px 0 6px 18px;padding:0}.nx-rw{color:#f7931a;font-weight:700}" +
      ".nx-bt{display:flex;gap:8px;margin-top:10px}.nx-bt button{flex:1;font:700 13px sans-serif;padding:11px;border-radius:10px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec}.nx-bt button.pri{background:#f7931a;border-color:#f7931a;color:#1a1206}" +
      ".nx-row{display:flex;justify-content:space-between;border-bottom:1px solid #222a36;padding:5px 0}.nx-note{color:#aeb6c2;font-size:12px;margin:4px 0}#nx-say{display:inline;margin:6px 0}#nx-caret{display:inline;color:#f7931a;animation:nxc .6s infinite alternate}@keyframes nxc{from{opacity:1}to{opacity:.1}}" +
      "#nx-back{position:fixed;left:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 70px);z-index:99990;font:700 12px monospace;padding:10px 12px;border-radius:12px;border:1px solid #f7931a;background:#12161c;color:#f7931a;display:none}";
    document.head.appendChild(s);
  }

  /* ---------- Figuren (Kunden) ---------- */
  function makeActor(spec) {
    var D = SHOPDBG(), ch;
    if (D && D.makeChar) ch = D.makeChar(spec);
    else {                                                                 // Notfall-Figur
      var g = new THREE.Group(), body = new THREE.Group(); g.add(body);
      body.add(cyl(0.2, 0.2, 1.2, mat(spec.shirt || 0xf7931a), 0, 0.8, 0, 10)); var head = new THREE.Group(); head.position.set(0, 1.6, 0); head.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(spec.skin || 0xe8b894))); body.add(head);
      var d = function () { return new THREE.Group(); }; ch = { g: g, body: body, legL: d(), legR: d(), armL: d(), armR: d(), head: head };
    }
    return { g: ch.g, ch: ch, path: [], pi: 0, speed: 2.2, ph: Math.random() * 6, done: null };
  }
  function stepActor(a, dt) {
    var moving = a.pi < a.path.length, ch = a.ch;
    if (moving) {
      var p = a.path[a.pi], dx = p[0] - a.g.position.x, dz = p[1] - a.g.position.z, d = Math.hypot(dx, dz), st = a.speed * dt;
      if (d <= st) { a.g.position.x = p[0]; a.g.position.z = p[1]; a.pi++; if (a.pi >= a.path.length && a.done) { var f = a.done; a.done = null; f(a); } }
      else {
        a.g.position.x += dx / d * st; a.g.position.z += dz / d * st; var tg = Math.atan2(dx, dz), df = tg - a.g.rotation.y;
        while (df > Math.PI) df -= 2 * Math.PI; while (df < -Math.PI) df += 2 * Math.PI; a.g.rotation.y += df * Math.min(1, dt * 10);
      }
      a.ph += dt * a.speed * 3.4; var sw = Math.sin(a.ph);
      ch.legL.rotation.x = sw * 0.6; ch.legR.rotation.x = -sw * 0.6; ch.armL.rotation.x = -sw * 0.5; ch.armR.rotation.x = sw * 0.5; ch.body.position.y = Math.abs(sw) * 0.035;
    } else {
      a.ph += dt * 2; ch.legL.rotation.x *= 0.8; ch.legR.rotation.x *= 0.8; ch.armL.rotation.x = Math.sin(a.ph) * 0.05; ch.armR.rotation.x = -Math.sin(a.ph) * 0.05; ch.body.position.y = 0; ch.head.rotation.y = Math.sin(a.ph * 0.5) * 0.3;
    }
  }
  S.makeActor = makeActor; S.stepActor = stepActor;

  /* ---------- Szene ---------- */
  function addStation(id, x, y, z, w, h, d, label, standX, standZ, action) {
    var hb = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false })); hb.position.set(x, y, z); hb.userData.st = id; S.scene.add(hb); S.hits.push(hb);
    var st = { id: id, sx: standX, sz: standZ, tx: x, tz: z, action: action, lx: x, ly: y + h / 2 + 0.2, lz: z, label: label, el: null };
    S.stations[id] = st; if (S.stage && S.ready) mkLabel(st); return st;
  }
  function mkLabel(st) { var el = document.createElement("div"); el.className = "nx-lbl"; el.textContent = st.label; el.addEventListener("click", function (e) { e.stopPropagation(); useStation(st.id); }); S.stage.appendChild(el); st.el = el; }
  S.addStation = addStation;

  function plant(sc, x, z, h) {
    var pm = mat(0x6a4a3a, { roughness: 0.9 }); sc.add(cyl(0.2, 0.15, 0.4, pm, x, 0.32, z, 20)); sc.add(cyl(0.17, 0.17, 0.03, mat(0x2a1d14, { roughness: 1 }), x, 0.52, z, 16)); sc.add(cyl(0.22, 0.22, 0.03, pm, x, 0.14, z, 20));
    var lm = [mat(0x2e8b4a, { roughness: 0.8 }), mat(0x3fa85a, { roughness: 0.8 }), mat(0x246f3b, { roughness: 0.8 })];
    for (var i = 0; i < 14; i++) { var a = i * 0.9, r = 0.05 + (i % 3) * 0.045, lf = sph(0.13 * h, lm[i % 3], x + Math.cos(a) * r, (0.72 + (i % 4) * 0.13) * h + 0.1, z + Math.sin(a) * r, 8, 6); lf.scale.set(0.38, 1.6, 0.16); lf.rotation.y = -a; lf.rotation.z = -Math.cos(a) * 0.55; lf.rotation.x = Math.sin(a) * 0.55; sc.add(lf); }
  }
  function clockTex() {
    var d = new Date(), hh = d.getHours() % 12 + d.getMinutes() / 60, mm = d.getMinutes();
    return ctex(256, 256, function (g, w, h) {
      g.fillStyle = "#f4f1ea"; g.beginPath(); g.arc(128, 128, 124, 0, 6.3); g.fill(); g.strokeStyle = "#1a1d24"; g.lineWidth = 4;
      for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; g.beginPath(); g.moveTo(128 + Math.sin(a) * 104, 128 - Math.cos(a) * 104); g.lineTo(128 + Math.sin(a) * 118, 128 - Math.cos(a) * 118); g.stroke(); }
      g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(hh * Math.PI / 6) * 62, 128 - Math.cos(hh * Math.PI / 6) * 62); g.stroke();
      g.lineWidth = 5; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(mm * Math.PI / 30) * 94, 128 - Math.cos(mm * Math.PI / 30) * 94); g.stroke(); g.fillStyle = "#f7931a"; g.beginPath(); g.arc(128, 128, 7, 0, 6.3); g.fill();
    });
  }
  function details(sc) {
    var steel = mat(0xb0b8c4, { metalness: 0.9, roughness: 0.3 }), dark = mat(0x15181e, { metalness: 0.4 }), white = mat(0xe9edf2, { roughness: 0.5 }), cable = mat(0x0c0e12, { roughness: 0.7 });
    // PC-Schreibtisch: Tastatur mit Tasten, Maus + Pad, Tasse, Schreibtischlampe, Kabel
    var kt = ctex(256, 80, function (g, w, h) { g.fillStyle = "#1b1f27"; g.fillRect(0, 0, w, h); g.fillStyle = "#3d4553"; for (var r = 0; r < 4; r++) for (var c = 0; c < 14; c++) g.fillRect(6 + c * 17.5, 6 + r * 16, 14, 12); g.fillRect(50, 66, 150, 10); });
    var kp = plane(0.46, 0.14, mat(0xffffff, { map: kt, roughness: 0.6 }), -2.9, 1.012, -5.85); kp.rotation.x = -Math.PI / 2; sc.add(kp);
    sc.add(box(0.24, 0.01, 0.2, mat(0x252b38, { roughness: 1 }), -2.45, 1.0, -5.85)); sc.add(rbox(0.06, 0.03, 0.1, 0.014, white, -2.45, 1.025, -5.85));
    sc.add(cyl(0.04, 0.035, 0.09, white, -2.1, 1.045, -5.7, 20)); var hd = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 8, 14), white); hd.position.set(-2.065, 1.045, -5.7); sc.add(hd);
    sc.add(cyl(0.07, 0.08, 0.025, dark, -3.55, 1.0, -5.7, 20)); var a1 = cyl(0.008, 0.008, 0.32, steel, -3.5, 1.17, -5.7, 8); a1.rotation.z = -0.4; sc.add(a1); var a2 = cyl(0.008, 0.008, 0.3, steel, -3.42, 1.38, -5.7, 8); a2.rotation.z = 1.0; sc.add(a2);
    var shade = cyl(0.025, 0.075, 0.11, mat(0xf7931a, { metalness: 0.4, roughness: 0.4 }), -3.3, 1.46, -5.7, 20); shade.rotation.z = -0.3; sc.add(shade); sc.add(sph(0.025, glow(0xfff1c0), -3.3, 1.4, -5.7, 10, 8));
    sc.add(tube([[-3.3, 1.0, -6.15], [-3.1, 1.0, -6.0], [-2.95, 1.02, -6.2], [-2.9, 1.1, -6.25]], 0.009, cable)); sc.add(tube([[-2.9, 1.005, -5.78], [-2.9, 1.0, -5.95], [-2.9, 1.02, -6.18]], 0.007, cable));
    // Theke: Kaffeemaschine, Tasse, Klingel, Prospektstaender, Kabel
    sc.add(rbox(0.28, 0.34, 0.26, 0.03, mat(0x20262f, { metalness: 0.5, roughness: 0.4 }), 3.45, 1.35, 0.3)); sc.add(box(0.12, 0.06, 0.012, glow(0x4fe38a), 3.45, 1.45, 0.435)); sc.add(box(0.2, 0.02, 0.12, steel, 3.45, 1.2, 0.36)); sc.add(cyl(0.035, 0.03, 0.06, white, 3.45, 1.25, 0.37, 16));
    var bell = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 8, 0, 6.2832, 0, 1.5708), mat(0xf0b429, { metalness: 0.9, roughness: 0.25 })); bell.position.set(2.2, 1.19, 0.45); sc.add(bell); sc.add(cyl(0.07, 0.07, 0.012, mat(0x20262f), 2.2, 1.19, 0.45, 16));
    sc.add(rbox(0.22, 0.3, 0.07, 0.02, mat(0x20262f, { metalness: 0.4 }), 1.05, 1.32, 0.2)); [0xf7931a, 0x3a8bff, 0x78d505].forEach(function (c, i) { sc.add(box(0.18, 0.07, 0.005, mat(c, { roughness: 0.8 }), 1.05, 1.22 + i * 0.09, 0.245)); });
    sc.add(tube([[1.6, 1.15, 0.0], [1.6, 0.9, -0.1], [1.2, 0.2, -0.3], [0.6, 0.15, -0.6]], 0.009, cable));
    // Wanduhr (rechte Wand)
    var cm = new THREE.Mesh(new THREE.CircleGeometry(0.22, 40), new THREE.MeshBasicMaterial({ map: clockTex() })); cm.position.set(4.29, 2.9, 0.6); cm.rotation.y = -Math.PI / 2; sc.add(cm);
    var cr = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.02, 10, 40), mat(0x15181e, { metalness: 0.6 })); cr.position.set(4.285, 2.9, 0.6); cr.rotation.y = -Math.PI / 2; sc.add(cr); S.clockMesh = cm;
    var ct = 0; S.ticks.push(function (dt) { ct += dt; if (ct > 30) { ct = 0; try { cm.material.map = clockTex(); cm.material.needsUpdate = true; } catch (e) {} } });
    // Deckenrohre + Lueftung im Hinterraum, Schienenstrahler im Laden
    var pm = mat(0x7d8696, { metalness: 0.8, roughness: 0.35 }); [-1.6, -4.7].forEach(function (z) { var pp = cyl(0.07, 0.07, 8.4, pm, 0, 3.33, z, 16); pp.rotation.z = Math.PI / 2; sc.add(pp); [-3.2, -1, 1.2, 3.4].forEach(function (x) { sc.add(box(0.06, 0.2, 0.1, dark, x, 3.42, z)); }); });
    var grille = ctex(128, 64, function (g, w, h) { g.fillStyle = "#2b3140"; g.fillRect(0, 0, w, h); g.fillStyle = "#0c0e12"; for (var i = 0; i < 9; i++) g.fillRect(8, 6 + i * 6, 112, 3); });
    sc.add(rbox(1.8, 0.3, 0.7, 0.03, mat(0x9aa3b2, { metalness: 0.6, roughness: 0.5 }), -2.0, 3.25, -3.3)); var vg = plane(0.9, 0.22, mat(0xffffff, { map: grille }), -2.0, 3.098, -3.3); vg.rotation.x = Math.PI / 2; sc.add(vg);
    sc.add(box(2.4, 0.04, 0.06, dark, 2.65, 3.42, 1.9)); [1.8, 2.4, 3.0].forEach(function (x, i) { var sp = cyl(0.045, 0.06, 0.14, dark, x - 0.2 + i * 0.0, 3.32, 1.9, 16); sp.rotation.x = 0.5; sc.add(sp); sc.add(sph(0.035, glow(0xfff4dc), x - 0.2, 3.25, 1.97, 8, 6)); });
    // Sicherheitsmarkierung + Bodenablauf im Hinterraum
    var hz = ctex(128, 32, function (g, w, h) { for (var i = -2; i < 12; i++) { g.fillStyle = i % 2 ? "#14161b" : "#f0b429"; g.beginPath(); g.moveTo(i * 16, h); g.lineTo(i * 16 + 16, h); g.lineTo(i * 16 + 32, 0); g.lineTo(i * 16 + 16, 0); g.fill(); } });
    var hp = plane(2.4, 0.18, mat(0xffffff, { map: hz, roughness: 0.9 }), 3.0, 0.13, -2.55); hp.rotation.x = -Math.PI / 2; sc.add(hp); sc.add(cyl(0.13, 0.13, 0.01, mat(0x20242b, { metalness: 0.6 }), -0.6, 0.125, -3.5, 20));
  }
  function pcTower(sc, x, y, z, col, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0;
    g.add(box(0.26, 0.5, 0.5, mat(0x1a1d24, { metalness: 0.6, roughness: 0.4 }), 0, 0.25, 0));
    g.add(box(0.012, 0.42, 0.42, new THREE.MeshBasicMaterial({ color: 0x9fc4e8, transparent: true, opacity: 0.32 }), 0.135, 0.25, 0));
    g.add(box(0.014, 0.4, 0.04, glow(col), 0.14, 0.25, 0.12)); g.add(box(0.014, 0.4, 0.04, glow(col), 0.14, 0.25, -0.12));
    for (var i = 0; i < 3; i++) { var fn = fan(0.055, col, 6); fn.rotation.y = Math.PI / 2; fn.position.set(0.14, 0.12 + i * 0.13, 0.0); g.add(fn); }
    sc.add(g);
  }
  function build3d(stage) {
    var sc = new THREE.Scene(); sc.background = new THREE.Color(0x0e1426); sc.fog = new THREE.Fog(0x141b30, 24, 70); S.scene = sc;
    var cam = new THREE.PerspectiveCamera(72, 1, 0.05, 160); cam.rotation.order = "YXZ"; sc.add(cam);
    var rd = new THREE.WebGLRenderer({ antialias: true }); rd.setPixelRatio(Math.min(W.devicePixelRatio || 1, 2)); stage.appendChild(rd.domElement);
    var hemi = new THREE.HemisphereLight(0xa9bce0, 0x2a2a34, 0.85), amb = new THREE.AmbientLight(0x56627a, 0.5); sc.add(hemi); sc.add(amb); S.lights = { hemi: hemi, amb: amb };
    var l1 = new THREE.PointLight(0xfff0d6, 1.0, 11); l1.position.set(0, 3.1, 1.2); sc.add(l1);
    var l2 = new THREE.PointLight(0xdfe9ff, 0.95, 11); l2.position.set(0, 3.1, -4.2); sc.add(l2);
    var l3 = new THREE.PointLight(0xffc977, 0.8, 10); l3.position.set(0, 3.4, 5.6); sc.add(l3);
    var l4 = new THREE.PointLight(0xfff0d6, 0.55, 6); l4.position.set(3.0, 2.6, -3.6); sc.add(l4);
    var l5 = new THREE.PointLight(0x9fc4ff, 0.5, 6); l5.position.set(-2.9, 2.6, -5.6); sc.add(l5);
    // Fallback-Boden draussen (env.js legt Strasse/Buergersteig darueber)
    sc.add(box(120, 0.1, 60, mat(0x151922, { roughness: 1 }), 0, -0.3, 20));
    var wood = mat(0x4a3526, { roughness: 0.6 }), deskTop = mat(0x6e5740, { roughness: 0.5 }), steel = mat(0xb0b8c4, { metalness: 0.9, roughness: 0.3 }), dark = mat(0x15181e, { metalness: 0.4 });
    // Decke
    var ceil = mat(0x242c3e, { roughness: 1 }); sc.add(box(8.8, 0.1, 4.85, ceil, 0, 3.55, 1.125)); sc.add(box(8.8, 0.1, 5.4, ceil, 0, 3.55, -4.0));
    [0.9, 2.7].forEach(function (z) { sc.add(box(2.6, 0.05, 0.3, glow(0xfff4dc), 0, 3.48, z)); });
    [-2.5, -5.0].forEach(function (z) { sc.add(box(3.4, 0.05, 0.3, glow(0xe6f0ff), 0, 3.48, z)); });
    // Boeden
    sc.add(box(8.6, 0.12, 4.85, mat(0xffffff, { map: rep(tex("wood"), 4.3, 2.4), roughness: 0.55 }), 0, 0.06, 1.125));
    sc.add(box(8.6, 0.12, 5.4, mat(0xffffff, { map: rep(tex("tile"), 8.6, 5.4), roughness: 0.85 }), 0, 0.06, -4.0));
    sc.add(box(3.2, 0.125, 2.2, mat(0xffffff, { map: rep(tex("carpet"), 3, 2), roughness: 1 }), 2.6, 0.065, 1.9));   // Teppich vorm Podest
    // Waende (innen verputzt, Fuss-/Sockelleisten)
    var wp = mat(0xffffff, { map: rep(tex("plaster"), 5, 2), roughness: 0.95 }), wpb = mat(0xffffff, { map: rep(tex("plasterWarm"), 5, 2), roughness: 0.95 });
    var trim0 = mat(0x161a22, { roughness: 0.6 }); sc.add(box(2.65, 3.6, 0.18, wp, -3.075, 1.8, -6.7)); sc.add(box(4.95, 3.6, 0.18, wp, 1.925, 1.8, -6.7)); sc.add(box(1.2, 1.2, 0.18, wp, -1.15, 3.0, -6.7)); sc.add(box(0.1, 2.4, 0.22, trim0, -1.77, 1.2, -6.7)); sc.add(box(0.1, 2.4, 0.22, trim0, -0.53, 1.2, -6.7));   // Tuer zur Farm-Halle (x -1.75..-0.55)
     sc.add(box(0.18, 3.6, 10.34, wpb, -4.4, 1.8, -1.62)); sc.add(box(0.18, 3.6, 4.14, wpb, 4.4, 1.8, -4.72)); sc.add(box(0.18, 1.2, 1.2, wpb, 4.4, 3.0, -2.05)); sc.add(box(0.18, 3.6, 5.0, wpb, 4.4, 1.8, 1.05));   // rechte Wand mit Tuer (z -2.65..-1.45) zur Montagehalle
    sc.add(box(0.22, 2.4, 0.1, trim0, 4.4, 1.2, -2.7)); sc.add(box(0.22, 2.4, 0.1, trim0, 4.4, 1.2, -1.4));
    sc.add(box(3.5, 3.6, 0.16, wp, -2.65, 1.8, DIV)); sc.add(box(3.5, 3.6, 0.16, wp, 2.65, 1.8, DIV)); sc.add(box(1.8, 1.1, 0.16, wp, 0, 3.05, DIV));
    var trim = mat(0x161a22, { roughness: 0.6 });
    [-6.6, -1.38].forEach(function (z) { sc.add(box(8.6, 0.14, 0.04, trim, 0, 0.19, z + (z < -3 ? 0.0 : 0.0))); });
    sc.add(box(0.04, 0.14, 5.4, trim, -4.29, 0.19, -4.0)); sc.add(box(0.04, 0.14, 5.4, trim, 4.29, 0.19, -4.0)); sc.add(box(0.04, 0.14, 4.7, trim, -4.29, 0.19, 1.15)); sc.add(box(0.04, 0.14, 4.7, trim, 4.29, 0.19, 1.15));
    sc.add(box(0.5, 3.6, 0.2, trim, -0.95, 1.8, DIV)); sc.add(box(0.5, 3.6, 0.2, trim, 0.95, 1.8, DIV));   // Tuerrahmen
    // Frontwand mit Schaufenstern und Tuer
    var fw = mat(0x1b2233, { roughness: 0.8 }), glass = new THREE.MeshStandardMaterial({ color: 0x9fc4e8, transparent: true, opacity: 0.13, roughness: 0.05, metalness: 0.2 }), frame = mat(0x0f1218, { metalness: 0.7, roughness: 0.4 });
    sc.add(box(0.5, 3.6, 0.16, fw, -4.15, 1.8, 3.55)); sc.add(box(0.5, 3.6, 0.16, fw, 4.15, 1.8, 3.55)); sc.add(box(0.7, 3.6, 0.16, fw, -1.1, 1.8, 3.55)); sc.add(box(0.7, 3.6, 0.16, fw, 1.1, 1.8, 3.55));
    [-2.7, 2.7].forEach(function (px) { sc.add(box(2.0, 0.9, 0.16, fw, px, 0.45, 3.55)); sc.add(box(2.0, 1.1, 0.16, fw, px, 3.05, 3.55)); sc.add(plane(2.0, 1.6, glass, px, 1.7, 3.55)); sc.add(box(2.04, 0.05, 0.1, frame, px, 2.5, 3.55)); sc.add(box(2.04, 0.05, 0.1, frame, px, 0.9, 3.55)); sc.add(box(0.04, 1.6, 0.1, frame, px, 1.7, 3.55)); });
    sc.add(box(1.8, 1.0, 0.16, fw, 0, 3.1, 3.55)); sc.add(box(1.9, 0.06, 0.12, frame, 0, 2.6, 3.55)); sc.add(box(0.06, 2.6, 0.12, frame, -0.92, 1.3, 3.55)); sc.add(box(0.06, 2.6, 0.12, frame, 0.92, 1.3, 3.55));
    var sign = plane(5.4, 0.8, new THREE.MeshBasicMaterial({ map: textTex("HASHPOOL  PC-SHOP", 1024, 160, "#10151f", "#f7931a", "bold 96px sans-serif") }), 0, 3.1, 3.7); sc.add(sign);
    sc.add(box(5.5, 0.9, 0.12, mat(0x10151f, { roughness: 0.7 }), 0, 3.1, 3.62));
    var aw = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.05, 1.5), mat(0xffffff, { map: rep(tex("awning"), 4, 1), roughness: 0.9 })); aw.position.set(0, 2.55, 4.3); aw.rotation.x = 0.16; sc.add(aw);
    var neon = plane(0.9, 0.4, new THREE.MeshBasicMaterial({ map: textTex("OPEN", 256, 112, "#101820", "#4fe38a", "bold 72px sans-serif") }), -2.4, 2.3, 3.44, Math.PI); sc.add(neon);
    // Lager-Beschilderung ueber der Innentuer (beide Seiten)
    sc.add(plane(1.6, 0.34, new THREE.MeshBasicMaterial({ map: textTex("LAGER / WERKSTATT", 512, 110, "#10151f", "#6aa8ff", "bold 46px sans-serif") }), 0, 2.85, DIV + 0.1));
    sc.add(box(1.6, 0.01, 0.06, glow(0xf7931a), 0, 0.13, DIV));
    // Poster
    [["gpu", 1.6], ["rgb", 2.5], ["sale", 3.4]].forEach(function (p) { sc.add(plane(0.72, 1.0, new THREE.MeshBasicMaterial({ map: posterTex(p[0]) }), p[1], 2.1, DIV + 0.1)); });
    [["cpu", -0.2], ["gpu", 1.4]].forEach(function (p) { sc.add(plane(0.72, 1.0, new THREE.MeshBasicMaterial({ map: posterTex(p[0]) }), 4.3, 1.9, p[1], -Math.PI / 2)); });
    // Computer (Teile bestellen)
    sc.add(box(1.9, 0.08, 0.9, deskTop, -2.9, 0.95, -6.0)); [[-3.8, -6.35], [-2.0, -6.35], [-3.8, -5.65], [-2.0, -5.65]].forEach(function (p) { sc.add(box(0.08, 0.95, 0.08, wood, p[0], 0.47, p[1])); });
    sc.add(box(0.8, 0.5, 0.04, dark, -2.9, 1.3, -6.25)); sc.add(box(0.06, 0.2, 0.06, dark, -2.9, 1.1, -6.25)); sc.add(box(0.74, 0.44, 0.01, new THREE.MeshBasicMaterial({ map: textTex("TEILE BESTELLEN", 256, 150, "#0a1830", "#6aa8ff", "bold 30px sans-serif") }), -2.9, 1.3, -6.22)); sc.add(box(0.5, 0.02, 0.16, mat(0x2b2f38), -2.9, 1.0, -5.85)); sc.add(box(0.16, 0.025, 0.1, mat(0x2b2f38), -2.55, 1.0, -5.85));
    sc.add(box(0.5, 0.45, 0.4, mat(0x1c212b, { metalness: 0.5 }), -3.55, 1.2, -6.2)); sc.add(box(0.012, 0.38, 0.03, glow(0x3a8bff), -3.29, 1.2, -6.2));
    addStation("pc", -2.9, 1.2, -6.0, 1.9, 1.0, 1.0, "💻 " + T("Teile bestellen", "Order parts"), -2.9, -4.95, function () { openMenu("shop"); });
    // Regal (Lager)
    var sm = mat(0x2d3646, { metalness: 0.5, roughness: 0.5 });
    sc.add(box(3.4, 2.5, 0.1, mat(0x1a202c), 1.4, 1.35, -6.55));
    for (var lv = 0; lv < 4; lv++) sc.add(box(3.4, 0.05, 0.6, sm, 1.4, 0.2 + lv * 0.85, -6.3));
    [-0.28, 1.4, 3.08].forEach(function (x) { sc.add(box(0.06, 2.6, 0.6, sm, x, 1.3, -6.3)); });
    S.invGroup = new THREE.Group(); sc.add(S.invGroup);
    sc.add(plane(1.6, 0.3, new THREE.MeshBasicMaterial({ map: textTex("LAGER", 256, 56, "#10151f", "#f7931a", "bold 40px sans-serif") }), 1.4, 3.12, -6.56));
    addStation("shelf", 1.4, 1.3, -6.2, 3.4, 2.5, 0.8, "📦 " + T("Regal", "Shelf"), 1.4, -5.3, function () { openShelf(); }); S.stations.shelf.ly = 3.55;
    // Bautisch
    sc.add(box(2.2, 0.1, 1.3, deskTop, 3.0, 0.95, -3.6)); [[-1, -0.5], [1, -0.5], [-1, 0.5], [1, 0.5]].forEach(function (p) { sc.add(box(0.08, 0.95, 0.08, wood, 3.0 + p[0] * 0.95, 0.47, -3.6 + p[1] * 0.55)); });
    sc.add(box(1.0, 0.012, 0.7, mat(0x1f6f3f, { roughness: 0.6 }), 3.0, 1.005, -3.6)); sc.add(box(0.5, 0.45, 0.35, mat(0x202833, { metalness: 0.5 }), 3.1, 1.25, -3.6)); sc.add(box(0.015, 0.38, 0.26, glow(0x78d505), 3.34, 1.25, -3.6));
    sc.add(box(0.1, 0.03, 0.4, mat(0xc0c4cc, { metalness: 0.8 }), 2.5, 1.02, -3.3)); sc.add(box(0.08, 0.08, 0.08, mat(0xb03a2e), 2.4, 1.04, -3.8)); sc.add(box(0.25, 0.04, 0.25, mat(0x2b2f38), 3.7, 1.0, -3.2)); sc.add(cyl(0.02, 0.02, 0.3, steel, 3.7, 1.18, -3.2, 8));
    var lamp = cyl(0.015, 0.015, 0.5, steel, 2.0, 1.25, -3.9, 8); lamp.rotation.z = 0.5; sc.add(lamp); sc.add(sph(0.05, glow(0xfff1c0), 2.12, 1.48, -3.9));
    addStation("bench", 3.0, 1.2, -3.6, 2.3, 1.0, 1.4, "🔧 " + T("Bautisch", "Workbench"), 1.45, -3.6, function () { openMenu("build"); });
    // Werkstatt-Wand: Lochwand + Whiteboard
    var peg = ctex(256, 160, function (g, w, h) { g.fillStyle = "#3a3f49"; g.fillRect(0, 0, w, h); g.fillStyle = "#222"; for (var x = 8; x < w; x += 16) for (var y = 8; y < h; y += 16) g.fillRect(x, y, 3, 3); g.strokeStyle = "#f7931a"; g.lineWidth = 5; g.strokeRect(40, 30, 70, 14); g.strokeStyle = "#78d505"; g.strokeRect(130, 50, 14, 70); g.strokeStyle = "#6aa8ff"; g.beginPath(); g.arc(190, 80, 24, 0, 6.3); g.stroke(); });
    sc.add(plane(2.4, 1.5, new THREE.MeshBasicMaterial({ map: peg }), 4.3, 2.0, -3.6, -Math.PI / 2));
    var wbt = ctex(256, 128, function (g, w, h) { g.fillStyle = "#e9edf2"; g.fillRect(0, 0, w, h); g.fillStyle = "#c33"; g.font = "bold 22px sans-serif"; g.fillText("TODO:", 14, 28); g.fillStyle = "#223"; g.font = "18px sans-serif"; g.fillText("• Teile abholen", 14, 56); g.fillText("• Regal einräumen", 14, 80); g.fillText("• PC bauen", 14, 104); });
    sc.add(plane(1.8, 0.9, new THREE.MeshBasicMaterial({ map: wbt }), -2.9, 2.55, -6.6)); sc.add(box(1.86, 0.96, 0.03, frame, -2.9, 2.55, -6.62));
    // Kisten + Paletten im Hinterraum
    var crate = mat(0xb8905c, { roughness: 0.9 }); sc.add(box(0.5, 0.4, 0.5, crate, -3.9, 0.32, -1.8)); sc.add(box(0.5, 0.35, 0.5, crate, -3.3, 0.3, -1.65));
    // Buzzer-Tisch (Grundgeruest; clicker.js setzt Aussehen/Upgrades/Aktion darauf)
    sc.add(box(2.0, 0.1, 0.9, deskTop, -2.3, 0.95, -0.55)); [[-3.25, -0.95], [-1.35, -0.95], [-3.25, -0.15], [-1.35, -0.15]].forEach(function (p) { sc.add(box(0.08, 0.95, 0.08, wood, p[0] + 0.05, 0.47, p[1] + 0.05)); });
    sc.add(cyl(0.24, 0.26, 0.09, mat(0x1d2230, { metalness: 0.6 }), -2.3, 1.05, -0.55, 24));
    S.buzz = cyl(0.18, 0.19, 0.1, mat(0xd32f2f, { metalness: 0.1, roughness: 0.35, emissive: 0x330000, emissiveIntensity: 0.9 }), -2.3, 1.16, -0.55, 24); sc.add(S.buzz);
    var tabc = ctex(256, 160, function (g, w, h) { g.fillStyle = "#0a1830"; g.fillRect(0, 0, w, h); g.fillStyle = "#78d505"; g.font = "bold 32px sans-serif"; g.textAlign = "center"; g.fillText("UPGRADES", 128, 70); g.fillStyle = "#6aa8ff"; g.font = "24px sans-serif"; g.fillText("tippen", 128, 112); });
    sc.add(box(0.5, 0.03, 0.34, mat(0x20262f, { metalness: 0.6 }), -1.55, 1.01, -0.4)); sc.add(box(0.46, 0.02, 0.3, new THREE.MeshBasicMaterial({ map: tabc }), -1.55, 1.035, -0.4));
    var scc = document.createElement("canvas"); scc.width = 768; scc.height = 432; S.scr = { ctx: scc.getContext("2d"), tex: new THREE.CanvasTexture(scc), owned: false };
    sc.add(box(2.5, 1.45, 0.05, mat(0x0b0f16, { metalness: 0.6 }), -2.3, 2.0, -1.17)); sc.add(plane(2.4, 1.35, new THREE.MeshBasicMaterial({ map: S.scr.tex }), -2.3, 2.0, -1.14));
    var bc = document.createElement("canvas"); bc.width = 512; bc.height = 320; S.board = { ctx: bc.getContext("2d"), tex: new THREE.CanvasTexture(bc) }; S.boardDirty = true;
    sc.add(box(0.05, 0.86, 1.34, mat(0x3a2a1c, { roughness: 0.7 }), 4.27, 2.3, 2.5)); sc.add(plane(1.24, 0.76, new THREE.MeshBasicMaterial({ map: S.board.tex }), 4.24, 2.3, 2.5, -Math.PI / 2));
    drawScreenBase();
    S.obst.push([-3.3, -1.3, -1.0, -0.1]);
    addStation("buzzer", -2.3, 1.15, -0.55, 0.9, 0.5, 0.9, "🔴 Buzzer", -2.3, 0.5, function () { buzzDefault(); });
    addStation("upg", -1.55, 1.1, -0.4, 0.6, 0.3, 0.45, "⬆️ Upgrades", -1.5, 0.5, function () { toast(T("Upgrade-Modul nicht geladen", "Upgrade module not loaded")); });
    // Theke + Kasse (Laden)
    var wd = mat(0x3a2a1f, { roughness: 0.6 }), wd2 = mat(0x5a4230, { roughness: 0.55 }), br = mat(0xc9a24a, { metalness: 0.85, roughness: 0.3 });
    sc.add(box(2.2, 1.0, 0.8, wd, 2.3, 0.62, 0.2)); sc.add(box(2.2, 0.06, 0.9, deskTop, 2.3, 1.15, 0.2));
    [1.2, 3.4].forEach(function (ex) { sc.add(cyl(0.4, 0.4, 1.0, wd, ex, 0.62, 0.2, 28)); sc.add(cyl(0.45, 0.45, 0.06, deskTop, ex, 1.15, 0.2, 28)); sc.add(cyl(0.42, 0.42, 0.14, mat(0x1b1410, { roughness: 0.8 }), ex, 0.19, 0.2, 28)); });
    sc.add(box(2.2, 0.14, 0.76, mat(0x1b1410, { roughness: 0.8 }), 2.3, 0.19, 0.2));   // Sockel
    [1.55, 2.3, 3.05].forEach(function (px) { sc.add(box(0.66, 0.62, 0.025, wd2, px, 0.66, 0.61)); sc.add(box(0.5, 0.46, 0.03, wd, px, 0.66, 0.612)); });   // Fuellungen
    var rail = cyl(0.028, 0.028, 3.0, br, 2.3, 0.22, 0.72, 12); rail.rotation.z = Math.PI / 2; sc.add(rail);   // Messing-Fussleiste
    [0.9, 1.7, 2.3, 2.9, 3.7].forEach(function (rx) { sc.add(cyl(0.015, 0.015, 0.12, br, rx, 0.22, 0.66, 8)); });
    var lip = cyl(0.02, 0.02, 2.2, br, 2.3, 1.19, 0.66, 10); lip.rotation.z = Math.PI / 2; sc.add(lip); sc.add(box(0.5, 0.34, 0.03, dark, 1.6, 1.38, 0.1)); sc.add(box(0.46, 0.3, 0.01, glow(0x2a8cff), 1.6, 1.38, 0.12));
    sc.add(box(0.4, 0.08, 0.3, dark, 1.6, 1.22, 0.25)); sc.add(box(0.12, 0.05, 0.08, mat(0xc0c4cc, { metalness: 0.7 }), 2.6, 1.21, 0.3)); sc.add(cyl(0.05, 0.05, 0.03, mat(0xf0b429, { metalness: 0.8 }), 3.3, 1.2, 0.35, 12));
    sc.add(plane(1.0, 0.2, new THREE.MeshBasicMaterial({ map: textTex("KASSE", 256, 50, "#10151f", "#f7931a", "bold 34px sans-serif") }), 2.3, 1.0, 0.62));
    addStation("counter", 2.3, 1.2, 0.2, 3.0, 1.2, 0.9, "🧾 " + T("Theke", "Counter"), 0.3, 1.0, function () { counterAction(); });
    // Schaufenster-Podest mit Gaming-PCs
    sc.add(box(2.1, 0.35, 0.8, mat(0x1a202c, { metalness: 0.4 }), 2.65, 0.3, 2.7)); sc.add(box(2.12, 0.02, 0.82, glow(0x2a8cff), 2.65, 0.48, 2.7));
    pcTower(sc, 1.95, 0.5, 2.7, 0x78d505, 0); pcTower(sc, 2.65, 0.5, 2.7, 0xff3a6e, 0); pcTower(sc, 3.35, 0.5, 2.7, 0x3a8bff, 0);
    sc.add(plane(0.5, 0.18, new THREE.MeshBasicMaterial({ map: textTex("Gaming-PCs", 256, 90, "#10151f", "#f7931a", "bold 36px sans-serif") }), 2.65, 0.4, 3.12));
    // Deko Laden: Regal mit Kartons
    sc.add(box(1.8, 2.4, 0.4, mat(0x1a202c, { metalness: 0.3 }), -3.4, 1.3, 2.9));
    for (var l = 0; l < 3; l++) for (var n = 0; n < 3; n++) { sc.add(box(0.44, 0.5, 0.34, mat(rnd([0x202833, 0x2b2f38, 0x39414f]), { metalness: 0.5 }), -3.9 + n * 0.5, 0.55 + l * 0.7, 2.9)); sc.add(box(0.015, 0.4, 0.26, glow(rnd([0x78d505, 0xff3a6e, 0x3a8bff, 0xffb020])), -3.9 + n * 0.5 + 0.22, 0.55 + l * 0.7, 2.9)); }
    plant(sc, 4.0, 3.1, 1.0); plant(sc, -4.0, -0.9, 0.9); plant(sc, 4.0, -6.3, 1.0); plant(sc, -0.9, 3.1, 0.8);
    // Wartebank (vorne links am Fenster)
    sc.add(box(1.2, 0.12, 0.45, mat(0x20262f, { roughness: 0.6 }), -1.9, 0.5, 2.95)); sc.add(box(1.2, 0.5, 0.1, mat(0x20262f, { roughness: 0.6 }), -1.9, 0.8, 3.15)); [-2.4, -1.4].forEach(function (x) { sc.add(box(0.06, 0.4, 0.4, steel, x, 0.28, 2.95)); });
    S.obst.push([-2.5, -1.3, 2.7, 3.2]);
    details(sc);
    S.grp = new THREE.Group(); sc.add(S.grp);
    S.cam = cam; S.rd = rd; S.stage = stage; S.ray = new THREE.Raycaster(); S.v = new THREE.Vector3(); S.ready = true;
    Object.keys(S.stations).forEach(function (id) { mkLabel(S.stations[id]); });
    bindControls(rd.domElement);
  }

  /* ---------- Bedienung (Erste Person) ---------- */
  function resize() {
    if (!S.ready) return; var w = S.stage.clientWidth || 360, h = S.stage.clientHeight || 600; S.rd.setSize(w, h, true); S.cam.aspect = w / h; S.cam.fov = w / h < 0.8 ? 80 : 68; S.cam.updateProjectionMatrix();
  }
  function bindControls(el) {
    var down = null, moved = 0, lx = 0, ly = 0, drag = false;
    el.addEventListener("pointerdown", function (e) { down = e.pointerId; moved = 0; drag = false; lx = e.clientX; ly = e.clientY; try { el.setPointerCapture(e.pointerId); } catch (x) {} });
    el.addEventListener("pointermove", function (e) {
      if (down !== e.pointerId) return; if (e.pointerType === "mouse" && !e.buttons) { down = null; return; } var dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      if (S.dlg || S.invOpen) return; if (!drag) { if (moved < 16) return; drag = true; return; } S.yaw -= dx * 0.006; S.pitch = Math.max(-0.9, Math.min(0.9, S.pitch - dy * 0.005)); S.face = null;
    });
    function up(e) { if (down !== e.pointerId) return; down = null; if (e.type === "pointerup" && moved < 10) tap(e.clientX, e.clientY); }
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    // Joystick
    var jy = document.getElementById("nx-joy"), kn = document.getElementById("nx-knob"), jid = null;
    function jset(e) {
      var r = jy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy, m = r.width / 2, d = Math.hypot(dx, dy);
      if (d > m) { dx = dx / d * m; dy = dy / d * m; } S.joy.x = dx / m; S.joy.y = dy / m; kn.style.transform = "translate(" + dx * 0.7 + "px," + dy * 0.7 + "px)";
    }
    jy.addEventListener("pointerdown", function (e) { jid = e.pointerId; try { jy.setPointerCapture(e.pointerId); } catch (x) {} jset(e); S.auto = null; e.stopPropagation(); });
    jy.addEventListener("pointermove", function (e) { if (jid === e.pointerId) jset(e); });
    function jend(e) { if (jid !== e.pointerId) return; jid = null; S.joy.x = 0; S.joy.y = 0; kn.style.transform = ""; }
    jy.addEventListener("pointerup", jend); jy.addEventListener("pointercancel", jend);
    W.addEventListener("keydown", function (e) { if (S.shown) S.keys[e.key.toLowerCase()] = true; }); W.addEventListener("keyup", function (e) { S.keys[e.key.toLowerCase()] = false; });
  }
  function tap(cx, cy) {
    if (S.dlg || S.invOpen) return;
    var r = S.rd.domElement.getBoundingClientRect(); S.ray.setFromCamera({ x: ((cx - r.left) / r.width) * 2 - 1, y: -((cy - r.top) / r.height) * 2 + 1 }, S.cam);
    var hs = S.hits.slice(); if (S.cust && S.cust.hit) hs.push(S.cust.hit);
    var h = S.ray.intersectObjects(hs, false);
    if (h && h.length) { var o = h[0].object; if (o.userData.st) { useStation(o.userData.st); return; } if (S.cust && o === S.cust.hit) { useStation("counter"); return; } }
  }
  function useStation(id) {
    var st = S.stations[id]; if (!st) return;
    var pts = route(S.px, S.pz, st.sx, st.sz);
    S.auto = { pts: pts, i: 0, id: id, face: [st.tx, st.tz] };
  }
  S.useStation = useStation; S.free = free;

  /* ---------- Aktionen: vorhandene Menues oeffnen ---------- */
  function clickId(id) { var e = document.getElementById(id); if (e) { e.click(); return true; } return false; }
  function openMenu(kind) {
    try {
      if (kind === "shop") { if (W.PartShop && PartShop.open) PartShop.open(); else clickId("ps-open-btn"); }
      else if (kind === "build") { if (W.PartShop && PartShop.openPicker) PartShop.openPicker(); else clickId("open-build-btn"); }
      else if (kind === "farm") { if (W.Parts3D && Parts3D.farm) Parts3D.farm.open(); else toast(T("Farm nicht geladen", "Farm not loaded")); }
    } catch (e) { console.warn("[nx] openMenu", kind, e); toast(T("Menü konnte nicht geöffnet werden", "Could not open menu")); }
  }
  function drawScreenBase() {
    var g = S.scr && S.scr.ctx; if (!g) return; var w = 768;
    g.fillStyle = "#07101c"; g.fillRect(0, 0, w, 432); g.fillStyle = "#0e2236"; g.fillRect(0, 0, w, 64); g.fillStyle = "#f7931a"; g.font = "bold 34px monospace"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("₿ HASHPOOL", 22, 34);
    g.fillStyle = "#78d505"; g.textAlign = "right"; g.font = "bold 24px monospace"; g.fillText(txtOf("tick") || "● ONLINE", w - 22, 34);
    var b = txtOf("balance") || "0 sats", num = b.replace(/\s*sats\s*$/i, ""); g.textAlign = "center"; g.fillStyle = "#ffffff"; g.font = "bold " + (num.length > 9 ? 70 : 92) + "px monospace"; g.fillText(num, w / 2, 150);
    g.fillStyle = "#6aa8ff"; g.font = "bold 28px monospace"; g.fillText("SATS  " + txtOf("usd-val"), w / 2, 216);
    var hr = txtOf("hashrate").split("·"); g.textAlign = "left"; g.fillStyle = "#cfd8dc"; g.font = "bold 30px monospace"; g.fillText("▸ " + (hr[0] || "").trim(), 40, 292); g.fillText("▸ " + (hr[1] || "").trim(), 40, 340);
    g.fillStyle = "#8a93a3"; g.font = "24px monospace"; g.fillText(T("Klicks hier: ", "Clicks here: ") + (S.clicks || 0) + "   " + txtOf("price"), 40, 392); S.scr.tex.needsUpdate = true;
  }
  S.drawScreenBase = drawScreenBase;
  function buzzDefault() { var el = document.getElementById("mine-btn"); if (el) el.click(); S.clicks = (S.clicks || 0) + 1; S.pressT = 0.12; }
  function counterAction() {
    var c = S.cust; if (c && c.state === "wait") { talk(c); return; }
    var O = ORD(); toast(T("Gerade kein Kunde an der Theke. Aufträge:", "No customer at the counter. Orders:")); if (O) O.open();
  }
  function toast(m) {
    var d = document.createElement("div"); d.style.cssText = "position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 56px);z-index:100002;background:#12161c;border:1px solid #f7931a;color:#e7e9ec;border-radius:12px;padding:10px 14px;font:700 13px monospace;text-align:center";
    d.textContent = m; document.body.appendChild(d); setTimeout(function () { try { d.remove(); } catch (e) {} }, 3200);
  }
  S.toast = toast;
  function showErr(m) { S.errN++; S.errs = (S.errs || []); if (S.errs.length < 4 && S.errs.indexOf(String(m)) < 0) S.errs.push(String(m)); var e = document.getElementById("nx-err"); if (e) e.textContent = "⚠ " + S.errs.map(function (x) { return x.slice(0, 90); }).join(" | "); try { console.warn("[nx]", m); } catch (x) {} }
  S.err = showErr;

  /* ---------- Regal / Inventar ---------- */
  var CATS = ["cpu", "mobo", "ram", "gpu", "ssd", "psu", "cooler", "case"];
  var CATC = { cpu: 0xc7c9d1, gpu: 0x2a8f4a, ram: 0x3a8bff, ssd: 0x8e5bd9, psu: 0xf0b429, mobo: 0xb03a2e, cooler: 0x16a5b8, "case": 0x7a8394 };
  var CATL = { cpu: "CPU", gpu: "GPU", ram: "RAM", ssd: "SSD", psu: "PSU", mobo: "MB", cooler: "FAN", "case": "CASE" };
  var LBL = {};
  function lblTex(cat) {
    if (LBL[cat]) return LBL[cat];
    var col = "#" + ("000000" + (CATC[cat] || 0x777777).toString(16)).slice(-6);
    LBL[cat] = textTex(CATL[cat] || String(cat).toUpperCase(), 128, 64, "#10151f", col, "bold 38px sans-serif"); return LBL[cat];
  }
  function invList() {
    var inv = (W.state && W.state.partInv) || {}, out = [];
    Object.keys(inv).forEach(function (id) { if (inv[id] > 0) out.push({ id: id, n: inv[id] }); });
    out.sort(function (a, b) { var ca = CATS.indexOf(String(a.id).split("-")[0]), cb = CATS.indexOf(String(b.id).split("-")[0]); return (ca - cb) || (String(a.id) < String(b.id) ? -1 : 1); });
    return out;
  }
  function partName(id) {
    try { var c = W.PART_CATALOG; if (c) for (var k in c) for (var i = 0; i < c[k].items.length; i++) if (c[k].items[i].id === id) return (c[k].icon || "") + " " + c[k].items[i].brand + " " + c[k].items[i].model; } catch (e) {}
    return id;
  }
  S.partName = partName; S.invList = invList;
  function rebuildShelf() {
    var list = invList(), sig = JSON.stringify(list); if (sig === S.sig) return; S.sig = sig;
    var g = S.invGroup; while (g.children.length) g.remove(g.children[0]);
    var idx = 0, cardboard = mat(0xb8905c, { roughness: 0.9 });
    list.forEach(function (it) {
      var cat = String(it.id).split("-")[0], col = CATC[cat] || 0x777777, cnt = Math.min(3, it.n);
      for (var k = 0; k < cnt && idx < 44; k++, idx++) {
        var lv = Math.floor(idx / 11), sl = idx % 11, x = 1.4 - 1.5 + sl * 0.3, y = 0.23 + lv * 0.85;
        g.add(box(0.25, 0.22, 0.3, cardboard, x, y + 0.11, -6.28)); g.add(box(0.255, 0.04, 0.31, mat(col), x, y + 0.22, -6.28));
        var lb = plane(0.2, 0.1, new THREE.MeshBasicMaterial({ map: lblTex(cat) }), x, y + 0.11, -6.125); g.add(lb);
      }
    });
  }
  function invShow(html) { var el = document.getElementById("nx-inv"); el.innerHTML = html; el.classList.add("show"); S.invOpen = true; S.joy.x = 0; S.joy.y = 0; }
  function closeInv() { var el = document.getElementById("nx-inv"); if (el) el.classList.remove("show"); S.invOpen = false; }
  S.invShow = invShow; S.invClose = closeInv;
  function openShelf() {
    var list = invList(), h = "<h4>📦 " + T("Dein Lager", "Your stock") + "</h4>";
    if (S.shelfExtra) { try { h += S.shelfExtra() || ""; } catch (e) { showErr(e.message); } }
    if (!list.length) h += "<p>" + T("Das Regal ist leer. Bestelle Teile am Computer und hole sie im Abholladen ab.", "The shelf is empty. Order parts at the computer and collect them at the pickup store.") + "</p>";
    list.forEach(function (it) { h += '<div class="nx-row"><span>' + partName(it.id) + "</span><b>×" + it.n + "</b></div>"; });
    h += '<div class="nx-bt"><button class="pri" data-a="bench">🔧 ' + T("Zum Bautisch", "To workbench") + '</button><button data-a="close">' + T("Schließen", "Close") + "</button></div>";
    invShow(h);
  }
  S.openShelf = openShelf; S.rebuildShelf = function () { S.sig = ""; rebuildShelf(); };

  /* ---------- Kunden ---------- */
  var TAG = { o1: ["Schüler", "Student"], o2: ["Student", "Student"], o3: ["Podcaster", "Podcaster"], o4: ["Rentner", "Retiree"], o5: ["Gamer", "Gamer"], o6: ["Streamerin", "Streamer"], o7: ["Krypto-Nerd", "Crypto nerd"], o8: ["Firmenchef", "CEO"] };
  var NAMES = ["Lena", "Tim", "Maya", "Jonas", "Aylin", "Ben", "Sofia", "Mehmet", "Nora", "Luca", "Emma", "Karim", "Yuki", "Olga", "Finn", "Ida", "Paul", "Zoe", "Ravi", "Greta"];
  var LOOK = { o1: { scale: 0.9, hair: "short" }, o4: { hairC: 0xe8e8ec, hair: "bald", beardP: 0.5, glasses: true }, o5: { phones: true, hair: "spiky" }, o6: { fem: true, hairC: 0xff5fa2, phones: true, hair: "long" }, o7: { hair: "beanie", glasses: true }, o8: { suit: true, glasses: true, hair: "short", scale: 1.05 } };
  var OPEN = { de: ["Hallo! Ich suche einen neuen Rechner.", "Hey, kannst du mir einen PC bauen?", "Guten Tag! Ich hätte da einen Wunsch …"], en: ["Hi! I'm looking for a new computer.", "Hey, can you build me a PC?", "Good day! I have a request …"] };
  function reqText(q) {
    switch (q.k) {
      case "cost": return q.max ? T("Teilekosten höchstens ", "Parts cost at most ") + fmt(q.max) + " sats" : T("Teile für mindestens ", "Parts worth at least ") + fmt(q.min) + " sats";
      case "load": return T("Höchstens ", "At most ") + q.max + " W";
      case "cpuT": return "CPU ≤ " + q.max + " °C"; case "gpuT": return "GPU ≤ " + q.max + " °C"; case "score": return "Score ≥ " + q.min;
      case "stable": return T("Muss stabil laufen", "Must run stable");
    } return q.k;
  }
  function specs() { try { return JSON.parse(localStorage.getItem("hashpool-next-faces") || "{}") || {}; } catch (e) { return {}; } }
  function saveSpec(id, sp, name) { try { var s = specs(); s[id] = { spec: sp, name: name }; localStorage.setItem("hashpool-next-faces", JSON.stringify(s)); } catch (e) {} }
  function spawnCustomer() {
    var O = ORD(), D = SHOPDBG(); if (!O || !D) return; var st = O.state(), kind = "browse", order = null, sp = null, name = rnd(NAMES);
    if (st.active) {
      var ao = null; O.list().forEach(function (o) { if (o.id === st.active) ao = o; }); var rigs = []; try { rigs = Parts3D.farm.slots() || []; } catch (e) {}
      if (ao && rigs.some(function (r) { try { return O.eval(ao, r.partIds).ok; } catch (e) { return false; } })) { kind = "pickup"; order = ao; var sv = specs()[ao.id]; if (sv) { sp = sv.spec; name = sv.name; } }
    }
    if (kind === "browse" && !st.active) { var fo = []; O.list().forEach(function (o) { if (!st.done[o.id]) fo.push(o); }); if (fo.length) { order = rnd(fo); kind = "order"; } }
    var all = S.queue.concat(S.cust ? [S.cust] : []);
    if (all.length && kind !== "browse" && all.some(function (x) { return x.order && order && x.order.id === order.id; })) { kind = "browse"; order = null; }
    if (all.length && kind === "browse") return;   // Laufkundschaft nur, wenn der Laden leer ist
    if (!sp) { sp = D.randomSpec(order ? LOOK[order.id] : null); if (order && kind === "order") saveSpec(order.id, sp, name); }
    var a = makeActor(sp), side = Math.random() < 0.5 ? -1 : 1; a.g.position.set(side * 13, 0.12, 4.9); a.speed = rr(1.5, 1.9);
    var hb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), new THREE.MeshBasicMaterial({ visible: false })); hb.position.set(0, 1.1, 0); a.g.add(hb); a.hit = hb;
    a.voice = { f: (sp && sp.fem) ? rr(250, 340) : rr(120, 200), w: (sp && sp.fem) ? "triangle" : "square", v: rr(0.85, 1.15) }; a.kind = kind; a.order = order; a.name = name; a.side = side; a.state = "in"; a.wait = 0; S.grp.add(a.g); S.stats.visitors++; saveStats();
    if (S.cust) { var k = S.queue.length; a.state = "qin"; a.pat = rr(55, 85); S.queue.push(a); a.path = [[0, 4.9], [0, 3.0], QSLOT[k] || QSLOT[1]]; a.pi = 0; a.done = function (x) { x.state = "queue"; }; if (S.onCustomer) { try { S.onCustomer(a); } catch (e) {} } return; }
    S.cust = a; if (S.onCustomer) { try { S.onCustomer(a); } catch (e) {} }
    a.path = [[0, 4.9], [0, 3.0], [0.7, 2.0]].concat(kind === "browse" ? [[rr(-3, -1), rr(1.4, 2.6)], [rr(-3, 3), rr(1.0, 2.0)], [0, 3.0]] : []); a.pi = 0;
    a.done = function (x) { if (x.kind === "browse") leave(x); else { x.state = "wait"; x.wait = 0; } };
  }
  function leave(c) {
    if (S.dlg === c) closeDlg(); c.state = "out"; c.path = [[0, 3.0], [0, 4.9], [c.side * 13, 4.9]]; c.pi = 0;
    var qi = S.queue.indexOf(c); if (qi >= 0) { S.queue.splice(qi, 1); reflow(); }
    c.done = function (x) { try { S.grp.remove(x.g); } catch (e) {} if (S.cust === x) { S.cust = null; S.nextCust = Math.min(S.nextCust, rr(2, 5)) ; promote(); } };
  }
  var QSLOT = [[0.7, 2.9], [1.9, 2.7], [-0.4, 2.9]];
  function reflow() { S.queue.forEach(function (q, i) { if (q.state === "queue") { q.path = [QSLOT[i] || QSLOT[1]]; q.pi = 0; q.done = function (x) { x.state = "queue"; }; } }); }
  function promote() {
    if (S.cust || !S.queue.length) return; var c = S.queue.shift(); S.cust = c; c.state = "in"; c.wait = 0; c.path = [[0.7, 2.0]]; c.pi = 0;
    c.done = function (x) { x.state = "wait"; x.wait = 0; }; reflow();
  }
  /* Ruf + Statistik */
  function loadJ(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  S.rep = +loadJ("hashpool-next-rep", 40) || 40; S.stats = loadJ("hashpool-next-stats", { visitors: 0, accepted: 0, delivered: 0, angry: 0 });
  function saveStats() { try { localStorage.setItem("hashpool-next-stats", JSON.stringify(S.stats)); localStorage.setItem("hashpool-next-rep", String(S.rep)); } catch (e) {} S.boardDirty = true; }
  function addRep(d) { S.rep = Math.max(0, Math.min(100, S.rep + d)); saveStats(); }
  S.addRep = addRep;
  function angry(c) { addRep(-8); S.stats.angry++; saveStats(); toast("😠 " + c.name + T(" ist genervt abgezogen (-8 ⭐)", " left angry (-8 ⭐)")); leave(c); }
  function capNow() { return S.rep < 30 ? 1 : S.rep < 60 ? 2 : 3; }
  var typeIv = null;
  function stopType() { if (typeIv) { clearInterval(typeIv); typeIv = null; } if (S.cust) S.cust.talking = false; }
  function finishType() {
    var say = document.getElementById("nx-say"), rest = document.getElementById("nx-rest"); if (!say) return;
    stopType(); say.textContent = say.getAttribute("data-full") || ""; var cr = document.getElementById("nx-caret"); if (cr) cr.style.display = "none"; if (rest) rest.style.display = "block";
  }
  function talk(c) {
    var O = ORD(), dlg = document.getElementById("nx-dlg"); if (!O || !dlg || c.state !== "wait") return;
    var tg = (TAG[c.order && c.order.id] || ["Kunde", "Customer"])[de() ? 0 : 1], h = "<h4>" + c.name + " <i>· " + tg + "</i></h4>", say = "", rest = "";
    if (c.kind === "pickup") { say = T("Ist mein PC fertig? Ich habe gesehen, dass da was in deiner Farm steht!", "Is my PC ready? I saw something in your farm!"); rest = '<div class="nx-bt"><button class="pri" data-a="deliver">' + T("Zeigen & abgeben", "Show & hand over") + '</button><button data-a="later">' + T("Später", "Later") + "</button></div>"; }
    else {
      var t = de() ? c.order.de : c.order.en, rw = Math.round(c.order.mult * Math.min(2, 1 + 0.25 * (O.state().cycle || 0)) * 100);
      say = rnd(OPEN[de() ? "de" : "en"]) + " " + t[0] + ". " + t[1];
      rest = "<ul>" + c.order.req.map(function (q) { return "<li>" + reqText(q) + "</li>"; }).join("") + "</ul>" +
        '<div class="nx-rw">' + T("Belohnung: ", "Reward: ") + rw + "% " + T("der Teilekosten (zusätzlich zum Verkauf)", "of parts cost (on top of the sale)") + '</div><div class="nx-bt"><button class="pri" data-a="accept">' + T("Annehmen", "Accept") + '</button><button data-a="decline">' + T("Ablehnen", "Decline") + "</button></div>";
    }
    h += '<p id="nx-say" data-full="' + say.replace(/"/g, "&quot;") + '"></p><span id="nx-caret">▍</span><div id="nx-rest" style="display:none">' + rest + "</div>";
    dlg.innerHTML = h; dlg.classList.add("show"); S.dlg = c; S.auto = null; S.joy.x = 0; S.joy.y = 0;
    // Text wird getippt, dazu "Blabla"-Toene (S.onSpeak setzt extras.js); Antippen ueberspringt
    var el = document.getElementById("nx-say"), i = 0; c.talking = true; stopType(); c.talking = true; var sp = Math.max(18, Math.min(34, 2600 / Math.max(20, say.length)));
    typeIv = setInterval(function () {
      if (!document.getElementById("nx-say")) { stopType(); return; }
      var ch = say.charAt(i); i++; el.textContent = say.slice(0, i); if (S.onSpeak && /\S/.test(ch) && i % 2 === 0) { try { S.onSpeak(ch, c.voice, i); } catch (e) {} }
      if (i >= say.length) finishType();
    }, sp);
  }
  function closeDlg() { stopType(); var d = document.getElementById("nx-dlg"); if (d) d.classList.remove("show"); S.dlg = null; }
  function dlgAction(a) {
    var c = S.dlg, O = ORD(); if (!c) return;
    if (a === "accept") { O.open(); var b = document.querySelector('#ord-ov [data-accept="' + c.order.id + '"]'); if (b) b.click(); O.close(); toast(T("Auftrag angenommen: ", "Order accepted: ") + (de() ? c.order.de[0] : c.order.en[0]) + " (+6 ⭐)"); addRep(6); S.stats.accepted++; saveStats(); leave(c); }
    else if (a === "decline" || a === "later") leave(c);
    else if (a === "deliver") { closeDlg(); try { c.doneN = Object.keys(O.state().done || {}).length; } catch (e) { c.doneN = -1; } O.open(); S.pendLeave = c; }
  }

  /* ---------- Schleife ---------- */
  function visible(id, cls) { var e = document.getElementById(id); if (!e) return false; if (cls) return e.classList.contains(cls); var cs = W.getComputedStyle(e); return cs.display !== "none" && cs.visibility !== "hidden"; }
  function overlayOpen() { return visible("ps-overlay") || visible("ps-picker") || visible("build-overlay") || visible("welcome-modal") || visible("bm-stage") || visible("farm-overlay", "open") || visible("ord-ov", "show") || visible("s3-ov", "show"); }
  S.overlayOpen = overlayOpen;
  function project(x, y, z) { S.v.set(x, y, z); S.v.project(S.cam); var w = S.stage.clientWidth, h = S.stage.clientHeight; return [(S.v.x * 0.5 + 0.5) * w, (-S.v.y * 0.5 + 0.5) * h, S.v.z]; }
  S.project = project;
  var cbub = null;
  function move(dt) {
    var sp = 3.9, mx = 0, mz = 0, blocked = !!(S.dlg || S.invOpen);
    if (blocked) return false;
    var jx = S.joy.x, jy = S.joy.y, k = S.keys;
    if (k["w"] || k["arrowup"]) jy -= 1; if (k["s"] || k["arrowdown"]) jy += 1; if (k["a"]) jx -= 1; if (k["d"]) jx += 1; if (k["arrowleft"]) S.yaw += dt * 1.8; if (k["arrowright"]) S.yaw -= dt * 1.8;
    var jm = Math.hypot(jx, jy);
    if (jm > 0.15) {
      S.auto = null; if (jm > 1) { jx /= jm; jy /= jm; }
      var fx = -Math.sin(S.yaw), fz = -Math.cos(S.yaw), rx = Math.cos(S.yaw), rz = -Math.sin(S.yaw);
      mx = (rx * jx - fx * jy) * sp * dt; mz = (rz * jx - fz * jy) * sp * dt;
      var nx = S.px + mx, nz = S.pz + mz;
      if (free(nx, nz)) { S.px = nx; S.pz = nz; } else if (free(nx, S.pz)) S.px = nx; else if (free(S.px, nz)) S.pz = nz;
      return true;
    }
    if (S.auto) {
      var a = S.auto, p = a.pts[a.i];
      if (!p) {
        if (a.face && !a.turned) {                                    // am Ziel: erst zur Station drehen (max 0,6 s), dann Aktion
          var fx3 = a.face[0] - S.px, fz3 = a.face[1] - S.pz, ty3 = Math.atan2(-fx3, -fz3), d3 = ty3 - S.yaw; while (d3 > Math.PI) d3 -= 2 * Math.PI; while (d3 < -Math.PI) d3 += 2 * Math.PI;
          S.yaw += d3 * Math.min(1, dt * 10); S.pitch += (-0.1 - S.pitch) * Math.min(1, dt * 8); a.tt = (a.tt || 0) + dt; if (Math.abs(d3) < 0.05 || a.tt > 0.6) a.turned = true; return true;
        }
        var id = a.id; S.auto = null; var st = S.stations[id]; if (st) { try { st.action(); } catch (e) { showErr("Station " + id + ": " + e.message); } } return false;
      }
      var dx = p[0] - S.px, dz = p[1] - S.pz, d = Math.hypot(dx, dz), step = 4.6 * dt;
      var ty = Math.atan2(-dx, -dz), df = ty - S.yaw; while (df > Math.PI) df -= 2 * Math.PI; while (df < -Math.PI) df += 2 * Math.PI; S.yaw += df * Math.min(1, dt * 6);
      if (d <= step) { S.px = p[0]; S.pz = p[1]; a.i++; } else { S.px += dx / d * step; S.pz += dz / d * step; }
      return true;
    }
    return false;
  }
  function frame(ts) {
    if (!S.shown) { S.raf = 0; return; }
    S.raf = W.requestAnimationFrame(frame);
    var hide = overlayOpen(); if (hide !== S.hiddenByOverlay) { S.hiddenByOverlay = hide; root.style.visibility = hide ? "hidden" : "visible"; }
    if (hide) { S.last = ts || 0; return; }
    var dt = Math.min(0.05, ((ts || 0) - S.last) / 1000 || 0.016); S.last = ts || 0; S.t += dt;
    try {
      var moving = move(dt); if (moving) S.bob += dt * 8;
      var c = S.cust;
      S.nextCust -= dt; if (S.nextCust <= 0) { S.nextCust = rr(8, 16) * (1.5 - S.rep / 120) * (S.raining ? 0.7 : 1) * (Date.now() < (S.adUntil || 0) ? 0.6 : 1); if ((c ? 1 : 0) + S.queue.length < capNow()) spawnCustomer(); }
      if (!c && S.queue.length) promote();
      for (var qi = 0; qi < S.queue.length; qi++) {
        var q = S.queue[qi]; stepActor(q, dt);
        if (q.state === "queue") { var fq = Math.atan2(S.px - q.g.position.x, S.pz - q.g.position.z), dq = fq - q.g.rotation.y; while (dq > Math.PI) dq -= 2 * Math.PI; while (dq < -Math.PI) dq += 2 * Math.PI; q.g.rotation.y += dq * Math.min(1, dt * 5); q.pat -= dt; if (q.pat <= 0 && !S.dlg) { angry(q); qi--; } }
      }
      c = S.cust;
      if (c) {
        stepActor(c, dt); try { if (c.ch && c.ch.head && c.state === "wait") c.ch.head.rotation.x = c.talking ? Math.sin(S.t * 17) * 0.09 : 0; } catch (e) {}
        if (c.state === "wait") { c.wait += dt; var fy = Math.atan2(S.px - c.g.position.x, S.pz - c.g.position.z), dd = fy - c.g.rotation.y; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI; c.g.rotation.y += dd * Math.min(1, dt * 5); if (c.wait > 90 && !S.dlg) angry(c); }
        if (S.pendLeave === c && !visible("ord-ov", "show")) { S.pendLeave = null; var dn = c.doneN; try { dn = Object.keys(ORD().state().done || {}).length - c.doneN; } catch (e) { dn = 0; } if (dn > 0) { addRep(10); S.stats.delivered++; saveStats(); toast("⭐ +10"); } leave(c); }
      }
      var ty = gy(S.px, S.pz); S.py += (ty - S.py) * Math.min(1, dt * 12);
      S.cam.position.set(S.px, S.py + 1.62 + Math.sin(S.bob) * 0.025, S.pz); S.cam.rotation.set(S.pitch, S.yaw, 0);
      S.cam.updateMatrixWorld();
      S.scT = (S.scT || 0) + dt; if (S.scT > 0.4) { S.scT = 0; if (S.scr && !S.scr.owned) drawScreenBase(); }
      if (S.buzz && !S.buzzOwned) { S.pressT = Math.max(0, (S.pressT || 0) - dt); S.buzz.position.y = 1.16 - (S.pressT > 0 ? 0.045 : 0); }
      for (var ti = 0; ti < S.ticks.length; ti++) { try { S.ticks[ti](dt, S.t); } catch (e) { showErr("tick: " + e.message); S.ticks.splice(ti, 1); ti--; } }
      Object.keys(S.stations).forEach(function (id) { var st = S.stations[id]; if (!st.el) return; var q = project(st.lx, st.ly, st.lz), dist = Math.hypot(st.lx - S.px, st.lz - S.pz); var sameRoom = S.roomOf(st.sx, st.sz) === S.roomOf(S.px, S.pz) || dist < 2.2; st.el.style.display = (q[2] < 1 && dist < 9 && !st.hide && sameRoom) ? "block" : "none"; st.el.style.left = q[0] + "px"; st.el.style.top = q[1] + "px"; });
      if (cbub) { if (c && c.state === "wait" && !S.dlg) { var q2 = project(c.g.position.x, 2.5, c.g.position.z); cbub.style.display = q2[2] < 1 ? "block" : "none"; cbub.style.left = q2[0] + "px"; cbub.style.top = q2[1] + "px"; cbub.textContent = c.wait > 60 ? "😠" : c.kind === "pickup" ? "📦 ?" : "💬"; } else cbub.style.display = "none"; }
      S.invT = (S.invT || 0) + dt; if (S.invT > 1) { S.invT = 0; rebuildShelf(); updHud(); }
      S.rd.render(S.scene, S.cam);
    } catch (e) { showErr("frame: " + e.message); }
  }
  function drawBoard() {
    var g = S.board && S.board.ctx; if (!g) return; var st = S.stats, n = Math.round(S.rep), stars = Math.max(1, Math.min(5, Math.ceil(n / 20)));
    g.fillStyle = "#16301f"; g.fillRect(0, 0, 512, 320); g.fillStyle = "#f7931a"; g.font = "bold 34px sans-serif"; g.textAlign = "center"; g.fillText(T("LADEN-STATISTIK", "SHOP STATS"), 256, 40);
    g.font = "40px sans-serif"; g.fillText("★★★★★".slice(0, stars) + "☆☆☆☆☆".slice(0, 5 - stars), 256, 92); g.fillStyle = "#cfe8d6"; g.font = "24px monospace"; g.textAlign = "left";
    var rows = [[T("Ruf", "Reputation"), n + "/100"], [T("Besucher", "Visitors"), st.visitors], [T("Aufträge", "Orders"), st.accepted], [T("Geliefert", "Delivered"), st.delivered], [T("Verärgert", "Angry"), st.angry]];
    rows.forEach(function (r, i) { g.fillText(r[0], 40, 140 + i * 36); g.textAlign = "right"; g.fillText(String(r[1]), 472, 140 + i * 36); g.textAlign = "left"; });
    S.board.tex.needsUpdate = true; S.boardDirty = false;
  }
  function updHud() {
    if (S.boardDirty) drawBoard();
    var b = document.getElementById("nx-bal"); if (!b) return; var v = 0; try { v = W.state.balance || 0; } catch (e) {}
    var t = txtOf("balance").replace(/\s*sats\s*$/i, ""); b.textContent = "💰" + (t || ((typeof W.fmtSats === "function" ? W.fmtSats(v) : fmt(v)) + " sats")) + " ⭐" + Math.round(S.rep) + (S.queue.length ? " 👥" + (S.queue.length + 1) : "");
    var sub = document.getElementById("nx-sub"); if (sub) sub.textContent = (S.subText ? S.subText() : ""); var mod = document.getElementById("nx-mod"); if (mod) mod.textContent = "W" + "✓ " + (W.Parts3D.nextEnv ? "E✓ " : "E– ") + (W.Parts3D.nextLogi ? "L✓ " : "L– ") + (W.Parts3D.clicker ? "C✓" : "C–");
  }
  function txtOf(id) { var e = document.getElementById(id); return e ? (e.textContent || "").replace(/\s+/g, " ").trim() : ""; }

  /* ---------- Aufbau / Start ---------- */
  function ensureDom() {
    if (root) return; css();
    root = document.createElement("div"); root.id = "nx-world";
    root.innerHTML = '<div class="nx-hud"><b id="nx-bal">💰</b><button id="nx-ord" type="button">📋 ' + T("Aufträge", "Orders") + '</button><button id="nx-cls" type="button">🖱️ ' + T("Klassik", "Classic") + '</button></div><div id="nx-sub"></div><div id="nx-mod" style="position:absolute;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 40px);color:#6b7686;font:10px monospace;z-index:3;pointer-events:none"></div><div id="nx-err"></div>' +
      '<div class="nx-cross"></div><div class="nx-lbl cust" id="nx-bub" style="display:none">💬</div><div class="nx-hint">' + T("Links: laufen · Wischen: umsehen · Station/Kunde antippen", "Left: walk · Swipe: look · Tap station/customer") + '</div>' +
      '<div id="nx-joy"><div id="nx-knob"></div></div><div id="nx-dlg"></div><div id="nx-inv"></div>';
    document.body.appendChild(root); cbub = document.getElementById("nx-bub");
    var back = document.createElement("button"); back.id = "nx-back"; back.type = "button"; back.textContent = "🏪 " + T("Zum Laden", "To shop"); document.body.appendChild(back); back.addEventListener("click", function () { show(true); });
    document.getElementById("nx-cls").addEventListener("click", function () { show(false); });
    document.getElementById("nx-ord").addEventListener("click", function () { var O = ORD(); if (O) O.open(); });
    cbub.addEventListener("click", function () { if (S.cust) useStation("counter"); });
    document.getElementById("nx-dlg").addEventListener("click", function (e) { var a = e.target && e.target.getAttribute && e.target.getAttribute("data-a"); if (a) dlgAction(a); else if (typeIv) finishType(); });
    document.getElementById("nx-inv").addEventListener("click", function (e) {
      var a = e.target && e.target.getAttribute && e.target.getAttribute("data-a"); if (!a) return;
      if (S.invActions[a]) { try { S.invActions[a](e.target); } catch (x) { showErr(a + ": " + x.message); } return; }
      if (a === "close") closeInv(); else if (a === "bench") { closeInv(); useStation("bench"); }
    });
    W.addEventListener("resize", function () { if (S.shown) resize(); });
  }
  function show(on) {
    try {
      ensureDom(); try { localStorage.setItem(PREF, on ? "1" : "0"); } catch (e) {}
      var back = document.getElementById("nx-back");
      if (!on) { S.shown = false; root.classList.remove("show"); back.style.display = "block"; return; }
      back.style.display = "none"; root.classList.add("show"); S.shown = true;
      if (!S.ready) build3d(root);
      resize(); setTimeout(resize, 80); S.last = 0; if (!S.raf) S.raf = W.requestAnimationFrame(frame); updHud(); rebuildShelf();
    } catch (e) { console.warn("[nx] show", e); try { showErr("show: " + e.message); } catch (x) {} }
  }
  W.Parts3D = W.Parts3D || {};
  W.Parts3D.nextWorld = { show: show, S: S };
  var n = 0, iv = setInterval(function () {
    n++;
    if (typeof THREE !== "undefined" && ORD() && W.state && document.body) {
      clearInterval(iv);
      var pref = null; try { pref = localStorage.getItem(PREF); } catch (e) {}
      ensureDom(); if (pref === "0") { document.getElementById("nx-back").style.display = "block"; } else show(true);
    } else if (n > 240) clearInterval(iv);
  }, 500);
  console.log("[HASHPOOL NEXT] world bereit (Erste Person)");
})();
