/* clicker.js — HASHPOOL NEXT: Klick-Spiel IM Laden, mit den ORIGINAL-Upgrades des Spiels (1:1, nichts neu erfunden)
 * - Buzzer = #mine-btn des Spiels (echter Klick inkl. Crit, Sound, Speichern)
 * - Wand-Bildschirm zeigt Kontostand und Rate so, wie das Spiel sie anzeigt (#balance, #hashrate)
 * - Tablet am Tisch = Upgrade-Liste: 6 Miner (USB, GPU, FPGA, ASIC, Container-Farm, Solar) + 4 Klick-Upgrades
 *   (Spitzhacke, Wasserkuehlung, ASIC-Stift, Quanten-Tap). Kaufen klickt die echten Shop-Zeilen des Spiels (#shop, #shop-click).
 * - Jedes Upgrade ist im Raum sichtbar (Anzahl waechst mit state.owned / state.clickOwned): Klick-Upgrades am Tisch,
 *   Miner im Regal an der linken Wand, Container-Farm + Solarpark im Hof links vom Laden (hinter dem Zaun, von der Strasse zu sehen).
 * Passives Einkommen, Kosten, Wirkung, Speichern: alles Original-Logik des Spiels. Haengt sich per S.ticks/S.addStation/S.obst an world.js.
 */
(function () {
  var W = window;
  if (W.__nxClicker) return; W.__nxClicker = true;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  function T(a, b) { return de() ? a : b; }

  /* ---------- Original-Daten (aus js/data-1.js; Zahlen/Texte im Panel kommen live aus den Spiel-Zeilen) ---------- */
  var UP = [
    { id: "usb", icon: "🔌", hr: 0.08, name: { en: "USB Miner", de: "USB-Miner" }, desc: { en: "A novelty stick that gets warm.", de: "Ein Spielzeug-Stick, der warm wird." } },
    { id: "gpu", icon: "🖥️", hr: 0.55, name: { en: "GPU Rig", de: "GPU-Rig" }, desc: { en: "One graphics card, six fans.", de: "Eine Grafikkarte, sechs Lüfter." } },
    { id: "fpga", icon: "🧩", hr: 3.5, name: { en: "FPGA Board", de: "FPGA-Board" }, desc: { en: "Purpose-built silicon, quiet and cold.", de: "Speziell gebauter Chip, leise und kühl." } },
    { id: "asic", icon: "📦", hr: 22, name: { en: "ASIC Unit", de: "ASIC-Einheit" }, desc: { en: "Sounds like a jet engine. Mines like one too.", de: "Klingt wie ein Düsentriebwerk. Mint auch wie eins." } },
    { id: "farm", icon: "🏭", hr: 140, name: { en: "Container Farm", de: "Container-Farm" }, desc: { en: "A shipping container full of ASICs.", de: "Ein Schiffscontainer voller ASICs." } },
    { id: "plant", icon: "☀️", hr: 900, name: { en: "Solar Mining Plant", de: "Solar-Miningpark" }, desc: { en: "Your own power grid, dedicated to hashes.", de: "Dein eigenes Stromnetz, nur für Hashes." } }
  ];
  var CL = [
    { id: "pick", icon: "⛏️", mult: 1.35, name: { en: "Sharper Pickaxe", de: "Schärfere Spitzhacke" }, desc: { en: "Cuts through hashes a bit faster.", de: "Schneidet etwas schneller durch Hashes." } },
    { id: "cool", icon: "❄️", mult: 1.5, name: { en: "Liquid Cooling", de: "Wasserkühlung" }, desc: { en: "Overclock without melting anything.", de: "Übertakten, ohne dass etwas schmilzt." } },
    { id: "asicpen", icon: "🖊️", mult: 1.75, name: { en: "ASIC Pen", de: "ASIC-Stift" }, desc: { en: "A handheld chip, just for tapping.", de: "Ein Handheld-Chip, nur zum Tippen." } },
    { id: "quantum", icon: "✨", mult: 2.1, name: { en: "Quantum Tap", de: "Quanten-Tap" }, desc: { en: "Mines a little bit of tomorrow too.", de: "Mint ein bisschen von morgen mit." } }
  ];
  var S2 = { pressT: 0, leds: [], spin: [], orb: [], bub: [], orbit: [], pulse: [], sig: "", clicks: 0, acc: 0 };
  function st() { return W.state || {}; }
  function own(id) { try { return Number(st().owned[id]) || 0; } catch (e) { return 0; } }
  function cown(id) { try { return Number(st().clickOwned[id]) || 0; } catch (e) { return 0; } }
  function bal() { try { return Number(st().balance) || 0; } catch (e) { return 0; } }
  function txt(id) { var e = document.getElementById(id); return e ? (e.textContent || "").replace(/\s+/g, " ").trim() : ""; }
  function ownSig() { return UP.map(function (u) { return own(u.id); }).join(",") + "|" + CL.map(function (u) { return cown(u.id); }).join(","); }

  /* ---------- Klick des Spiels ---------- */
  function gameClick() {
    var el = document.getElementById("mine-btn"); if (!el) return 0;
    var b0 = bal(); el.click(); var d = bal() - b0; return d > 0 ? d : 0;
  }

  /* ---------- Szene ---------- */
  var S = null, grp = null, scrTex = null, scrCtx = null, buzMesh = null, panel = null;
  var RACK = [-4.4, -3.7, 0.5, 2.5];
  function mat(c, o) { var p = { color: c, roughness: 0.7, metalness: 0.2 }; if (o) for (var k in o) p[k] = o[k]; return new THREE.MeshStandardMaterial(p); }
  function glow(c) { return new THREE.MeshBasicMaterial({ color: c }); }
  function box(w, h, d, m, x, y, z) { try { return S.G.box(w, h, d, m, x, y, z); } catch (e) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x || 0, y || 0, z || 0); return o; } }
  function fanAt(r, x, y, z, rx, ry, spd, col, n) { var f = S.G.fan(r, col || 0x0b0d11, n || 7); f.position.set(x, y, z); f.rotation.x = rx || 0; f.rotation.y = ry || 0; grp.add(f); S2.spin.push({ m: f.userData.spin, ax: "z", s: spd }); return f; }
  function pickGroup(hm, x, y, z, rz) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.z = rz; var wd = mat(0x7a5230, { roughness: 0.8 });
    g.add(cyl(0.024, 0.03, 1.1, wd, 0, 0.55, 0, 12)); for (var k = 0; k < 4; k++) g.add(cyl(0.032, 0.032, 0.03, mat(0x3a2a1a), 0, 0.12 + k * 0.1, 0, 12));
    var head = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.028, 8, 18, Math.PI * 0.7), hm); head.position.set(0, 0.9, 0); head.rotation.z = Math.PI * 0.15; g.add(head);
    [0.15, 0.85].forEach(function (f, i) { var a = f * Math.PI, tip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 10), hm); tip.position.set(Math.cos(a) * 0.2, 0.9 + Math.sin(a) * 0.2, 0); tip.rotation.z = a + (i ? Math.PI / 2 : -Math.PI / 2) + (i ? 0 : Math.PI); g.add(tip); });
    g.add(cyl(0.045, 0.045, 0.07, hm, 0, 1.08, 0, 12)); return g;
  }
  function cyl(rt, rb, h, m, x, y, z, seg) { var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 24), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function sph(r, m, x, y, z, a, b) { var o = new THREE.Mesh(new THREE.SphereGeometry(r, a || 12, b || 8), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function plate(lines, w, h, x, y, z, ry) {
    var c = document.createElement("canvas"); c.width = 512; c.height = Math.round(512 * h / w); var g = c.getContext("2d");
    g.fillStyle = "#0b1018"; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = "#f7931a"; g.lineWidth = 6; g.strokeRect(3, 3, c.width - 6, c.height - 6);
    g.fillStyle = "#f7931a"; g.textAlign = "center"; g.textBaseline = "middle"; var lh = c.height / lines.length;
    lines.forEach(function (l, i) { g.font = "bold " + Math.floor(lh * 0.62) + "px sans-serif"; g.fillText(l, c.width / 2, lh * (i + 0.5)); });
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })); m.position.set(x, y, z); m.rotation.y = ry || 0; return m;
  }
  var TIERS = [{ c: 0xd32f2f, e: 0x000000, m: 0.1, led: 0 }, { c: 0xff7a1a, e: 0x331100, m: 0.2, led: 0xff7a1a }, { c: 0xcfd8dc, e: 0x000000, m: 0.9, led: 0xcfe9ff }, { c: 0xffc107, e: 0x553a00, m: 0.9, led: 0xffc107 }, { c: 0x40e0ff, e: 0x0a6a88, m: 0.5, led: 0x40e0ff }];
  function drawScreen() {
    var g = scrCtx; if (!g) return; S.clicks = S2.clicks; var w = 768, tier = tierOf();
    g.fillStyle = "#07101c"; g.fillRect(0, 0, w, 432);
    g.fillStyle = "#0e2236"; g.fillRect(0, 0, w, 64); g.fillStyle = "#f7931a"; g.font = "bold 34px monospace"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("₿ HASHPOOL", 22, 34);
    g.fillStyle = "#78d505"; g.textAlign = "right"; g.font = "bold 24px monospace"; g.fillText(txt("tick") || "● ONLINE", w - 22, 34);
    var b = txt("balance") || "0 sats", num = b.replace(/\s*sats\s*$/i, ""); g.textAlign = "center"; g.fillStyle = "#ffffff"; g.font = "bold " + (num.length > 9 ? 70 : 92) + "px monospace"; g.fillText(num, w / 2, 150);
    g.fillStyle = "#6aa8ff"; g.font = "bold 28px monospace"; g.fillText("SATS  " + txt("usd-val"), w / 2, 216);
    var hr = txt("hashrate").split("·"); g.textAlign = "left"; g.fillStyle = "#cfd8dc"; g.font = "bold 30px monospace";
    g.fillText("▸ " + (hr[0] || "").trim(), 40, 292); g.fillText("▸ " + (hr[1] || "").trim(), 40, 340); g.fillStyle = "#8a93a3"; g.font = "24px monospace"; g.fillText(T("Klicks hier: ", "Clicks here: ") + S2.clicks + "   " + txt("price"), 40, 392);
    for (var i = 0; i < 4; i++) { g.fillStyle = i < tier ? "#f7931a" : "#223044"; g.fillRect(w - 150 + i * 32, 372, 24, 24); }
    scrTex.needsUpdate = true;
  }
  function tierOf() { return (cown("pick") > 0) + (cown("cool") > 0) + (cown("asicpen") > 0) + (cown("quantum") > 0); }
  function totalHr() { var h = 0; UP.forEach(function (u) { h += own(u.id) * u.hr; }); return h; }

  function build() {
    if (grp) S.scene.remove(grp); grp = new THREE.Group(); S.scene.add(grp); S2.leds = []; S2.spin = []; S2.orb = []; S2.bub = []; S2.orbit = []; S2.pulse = [];
    var wood = mat(0x4a3526, { roughness: 0.6, metalness: 0.05 }), steel = mat(0xb0b8c4, { metalness: 0.9, roughness: 0.3 }), gold = mat(0xffc107, { metalness: 1, roughness: 0.25, emissive: 0x442b00, emissiveIntensity: 0.5 });
    var nPick = cown("pick"), nCool = cown("cool"), nPen = cown("asicpen"), nQ = cown("quantum"), tier = tierOf(), t = TIERS[tier];
    /* ----- Buzzer + Tisch-Look waechst mit der Anzahl verschiedener Klick-Upgrades ----- */
    var sc = 1 + 0.08 * tier; S.buzz.material = mat(t.c, { metalness: t.m, roughness: 0.25, emissive: t.e, emissiveIntensity: 0.9 }); S.buzz.geometry = new THREE.SphereGeometry(0.19, 32, 14, 0, 6.2832, 0, 1.5708); S.buzz.scale.set(sc, 0.55, sc); S2.by = 1.1; S.buzz.position.y = S2.by; S.buzzOwned = true; buzMesh = S.buzz;
    var crm = new THREE.Mesh(new THREE.TorusGeometry(0.21 * sc, 0.018, 10, 36), mat(0xd8dde6, { metalness: 1, roughness: 0.18 })); crm.rotation.x = Math.PI / 2; crm.position.set(-2.3, 1.1, -0.55); grp.add(crm);
    if (tier >= 2) { var ring = new THREE.Mesh(new THREE.TorusGeometry(0.235 * sc, 0.02, 8, 28), mat(t.c, { metalness: 0.95, roughness: 0.2 })); ring.rotation.x = Math.PI / 2; ring.position.set(-2.3, 1.1, -0.55); grp.add(ring); }
    if (tier >= 1) {       // LED-Streifen unter der Tischkante + Rahmen um den Bildschirm
      var lm = glow(t.led); grp.add(box(1.96, 0.025, 0.025, lm, -2.3, 0.9, -0.08)); grp.add(box(0.025, 0.025, 0.86, lm, -3.28, 0.9, -0.55)); grp.add(box(0.025, 0.025, 0.86, lm, -1.32, 0.9, -0.55));
      grp.add(box(2.56, 0.04, 0.03, lm, -2.3, 2.75, -1.15)); grp.add(box(2.56, 0.04, 0.03, lm, -2.3, 1.25, -1.15)); grp.add(box(0.04, 1.5, 0.03, lm, -3.58, 2.0, -1.15)); grp.add(box(0.04, 1.5, 0.03, lm, -1.02, 2.0, -1.15));
    }
    if (tier >= 3) grp.add(box(2.1, 0.015, 1.0, mat(0x14181f, { metalness: 0.3 }), -2.3, 1.008, -0.55));       // Tischmatte
    grp.add(plate([T("KLICK-ECKE", "CLICK CORNER"), "⭐".repeat(Math.max(1, tier))], 1.2, 0.36, -2.3, 3.05, -1.18, 0));
    /* ----- Spitzhacke: Hacken am Tisch, Erz-Haufen, Wand-Hacken ----- */
    if (nPick > 0) {
      var pc = nPick >= 15 ? 3 : nPick >= 5 ? 2 : 1, hm = nPick >= 15 ? gold : steel;
      for (var i = 0; i < pc; i++) grp.add(pickGroup(hm, -3.5 - i * 0.18, 0.12, -0.1 + i * 0.1, 0.18));
      var ores = Math.min(3 + nPick, 12), om = mat(0xb4530a, { roughness: 0.6, emissive: 0x2a1000, emissiveIntensity: 0.6 }), om2 = mat(0x6b6f78, { roughness: 0.9 });
      for (var o = 0; o < ores; o++) { var ox = -3.12 + (o % 4) * 0.09 + (Math.random() - 0.5) * 0.04, oz = -0.85 + Math.floor(o / 4) * 0.1 + (Math.random() - 0.5) * 0.04, os = 0.035 + Math.random() * 0.025; var rock = sph(os, o % 3 ? om : om2, ox, 1.0 + os, oz, 6, 5); grp.add(rock); }
      if (nPick >= 5) { [0.6, -0.6].forEach(function (a) { var pg = pickGroup(hm, -2.3 - Math.sin(a) * 0.0, 2.7, -1.18, a); pg.scale.set(0.8, 0.8, 0.8); grp.add(pg); }); }
    }
    /* ----- Wasserkuehlung: Radiator + Luefter, Kuehlturm mit Blasen, Schlaeuche ----- */
    if (nCool > 0) {
      var cc = nCool >= 15 ? 3 : nCool >= 5 ? 2 : 1, bl = mat(0x40a0ff, { emissive: 0x1060c0, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 });
      grp.add(box(0.55, 0.34, 0.05, mat(0x20262f, { metalness: 0.7 }), -1.55, 1.3, -1.12)); for (var k = 0; k < 6; k++) grp.add(box(0.5, 0.012, 0.02, glow(0x40a0ff), -1.55, 1.16 + k * 0.05, -1.08));
      fanAt(0.13, -1.55, 1.3, -1.07, 0, 0, 12, 0x0b0d11, 7);
      for (var j = 0; j < cc; j++) grp.add(cyl(0.06, 0.06, 0.26, bl, -1.2 - j * 0.16, 1.18, -0.88, 12));
      var tube = cyl(0.015, 0.015, 1.6, bl, -2.35, 1.1, -0.92, 8); tube.rotation.z = Math.PI / 2; grp.add(tube);
      grp.add(cyl(0.1, 0.1, 0.5, new THREE.MeshStandardMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.28, roughness: 0.1 }), -3.15, 1.27, -0.88, 14)); grp.add(cyl(0.085, 0.085, 0.3, bl, -3.15, 1.15, -0.88, 12)); grp.add(cyl(0.11, 0.11, 0.04, steel, -3.15, 1.03, -0.88, 14)); grp.add(cyl(0.11, 0.11, 0.04, steel, -3.15, 1.53, -0.88, 14));
      for (var bb = 0; bb < 5; bb++) { var bub = sph(0.012, glow(0xcfeaff), -3.15, 1.2, -0.88, 6, 4); grp.add(bub); S2.bub.push({ m: bub, y: 1.15 + bb * 0.07, x: -3.15 + (Math.random() - 0.5) * 0.06, z: -0.88 + (Math.random() - 0.5) * 0.06 }); }
    }
    /* ----- ASIC-Stift: Halter, leuchtender Stift, rotierender Hologramm-Chip ----- */
    if (nPen > 0) {
      var pn = nPen >= 15 ? 3 : nPen >= 5 ? 2 : 1;
      for (var q = 0; q < pn; q++) { var px = -3.0 + q * 0.12; grp.add(box(0.1, 0.03, 0.1, mat(0x20262f), px, 1.01, -0.3 - q * 0.0)); var pen = cyl(0.012, 0.012, 0.32, mat(0x111418, { metalness: 0.6 }), px, 1.18, -0.3, 8); pen.rotation.z = 0.25; grp.add(pen); var cone = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.05, 12), mat(0xb0b8c4, { metalness: 0.9 })); cone.position.set(px - 0.046, 1.359, -0.3); cone.rotation.z = 0.25; grp.add(cone); var tip = sph(0.014, glow(0x40ff90), px - 0.052, 1.386, -0.3, 10, 8); grp.add(tip); S2.leds.push(tip); var clip = box(0.012, 0.12, 0.012, steel, px - 0.025, 1.27, -0.285); clip.rotation.z = 0.25; grp.add(clip); grp.add(box(0.012, 0.12, 0.012, steel, px + 0.01, 1.28, -0.285)); }
      var chip = new THREE.Group(); chip.position.set(-2.95, 1.62, -0.3); chip.add(box(0.14, 0.02, 0.14, glow(0x40ff90), 0, 0, 0)); chip.add(box(0.08, 0.025, 0.08, mat(0x10301c, { metalness: 0.6 }), 0, 0.012, 0)); for (var pin = -2; pin <= 2; pin++) { chip.add(box(0.012, 0.01, 0.03, steel, pin * 0.03, 0, 0.085)); chip.add(box(0.012, 0.01, 0.03, steel, pin * 0.03, 0, -0.085)); } grp.add(chip); S2.spin.push({ m: chip, ax: "y", s: 1.4 }); S2.pulse.push({ m: chip, base: 1.62, amp: 0.03 });
    }
    /* ----- Quanten-Tap: Orb, Ringe, Funken, Lichtsaeule ----- */
    if (nQ > 0) {
      var qs = 0.12 + Math.min(nQ, 10) * 0.012, orb = new THREE.Mesh(new THREE.SphereGeometry(qs, 20, 14), new THREE.MeshStandardMaterial({ color: 0xb06aff, emissive: 0x7a2bd8, emissiveIntensity: 1.2, roughness: 0.2 })); orb.position.set(-2.3, 1.85, -0.55); grp.add(orb); S2.orb.push(orb);
      [0, 1].forEach(function (r) { var rg = new THREE.Mesh(new THREE.TorusGeometry(qs * 1.9, 0.012, 8, 32), glow(r ? 0x6ad4ff : 0xff6af0)); rg.position.set(-2.3, 1.85, -0.55); rg.rotation.x = r ? 1.0 : 0.3; grp.add(rg); S2.spin.push({ m: rg, ax: r ? "z" : "y", s: r ? 1.6 : -1.1 }); });
      grp.add(cyl(0.05, 0.05, 1.6, new THREE.MeshBasicMaterial({ color: 0x9a5aff, transparent: true, opacity: 0.18 }), -2.3, 1.95, -0.55, 12)); grp.add(cyl(0.3, 0.3, 0.03, mat(0x2a1450, { emissive: 0x6a2bd0, emissiveIntensity: 0.9, metalness: 0.5 }), -2.3, 1.015, -0.55, 24));
      var ns = Math.min(4 + nQ, 10); for (var sp = 0; sp < ns; sp++) { var spk = sph(0.018, glow(sp % 2 ? 0xff9aff : 0x9ad8ff), -2.3, 1.85, -0.55, 6, 4); grp.add(spk); S2.orbit.push({ m: spk, a: sp * 6.28 / ns, r: 0.38 + (sp % 3) * 0.08, s: 1.2 + (sp % 4) * 0.35, cy: 1.85 + ((sp % 3) - 1) * 0.12 }); }
    }
    /* ----- Miner-Racks an der linken Wand ----- */
    var frame = mat(0x151a22, { metalness: 0.5 });
    grp.add(box(0.5, 1.9, 0.95, frame, -4.1, 1.07, 1.0)); grp.add(box(0.5, 1.9, 0.9, frame, -4.1, 1.07, 2.0));
    var shelf = mat(0x2d3646, { metalness: 0.4 }); [0.05, 0.55, 1.1, 1.65].forEach(function (y) { grp.add(box(0.46, 0.04, 0.9, shelf, -3.97, y + 0.15, 1.0)); grp.add(box(0.46, 0.04, 0.86, shelf, -3.97, y + 0.15, 2.0)); });
    [0.5, 1.5, 2.5].forEach(function (z) { grp.add(cyl(0.025, 0.025, 3.4, mat(0x20242b), -4.25, 1.8, z, 8)); });   // Kabelschaechte
    grp.add(box(0.3, 0.05, 1.9, mat(0x20242b), -3.55, 0.15, 1.5));                                             // Steckerleiste am Boden
    var nU = own("usb"), nG = own("gpu"), nF = own("fpga"), nA = own("asic"), nFarm = own("farm"), nPl = own("plant");
    for (var u = 0; u < Math.min(nU, 12); u++) { var row = Math.floor(u / 6), cz = 0.65 + (u % 6) * 0.14; grp.add(box(0.2, 0.03, 0.05, mat(0x2a2f3a), -4.0 + row * 0.2 - 0.05, 0.23, cz)); var l = box(0.03, 0.02, 0.04, glow(0x78d505), -3.9 + row * 0.2 - 0.05, 0.25, cz); grp.add(l); S2.leds.push(l); grp.add(box(0.012, 0.012, 0.15, mat(0x111418), -3.85 + row * 0.2, 0.2, cz + 0.03)); }
    for (var g = 0; g < Math.min(nG, 4); g++) { var gz = 0.68 + g * 0.2; grp.add(box(0.34, 0.4, 0.17, mat(0x23282f, { metalness: 0.5 }), -4.02, 0.9, gz)); fanAt(0.075, -3.84, 0.92, gz, 0, Math.PI / 2, 9, 0x0b0d11, 7); grp.add(box(0.01, 0.03, 0.14, glow(0x78d505), -3.84, 0.74, gz)); grp.add(box(0.012, 0.05, 0.1, mat(0xc0c4cc, { metalness: 0.9 }), -3.84, 1.08, gz)); }
    for (var f = 0; f < Math.min(nF, 6); f++) { var fz = 0.62 + f * 0.15; grp.add(box(0.2, 0.22, 0.02, mat(0x1f7a46), -4.0, 1.42, fz)); grp.add(box(0.07, 0.07, 0.03, mat(0xffc107, { metalness: 0.9 }), -4.0, 1.44, fz)); var fl = box(0.02, 0.02, 0.02, glow(0x40e0ff), -3.89, 1.52, fz); grp.add(fl); S2.leds.push(fl); grp.add(box(0.1, 0.02, 0.018, glow(0x40e0ff), -4.0, 1.34, fz)); }
    for (var a = 0; a < Math.min(nA, 6); a++) { var arow = Math.floor(a / 2), az = 1.7 + (a % 2) * 0.42, ay = 0.3 + arow * 0.55; grp.add(box(0.36, 0.34, 0.38, mat(0x2b3140, { metalness: 0.6 }), -4.02, ay + 0.3, az)); fanAt(0.13, -3.83, ay + 0.32, az, 0, Math.PI / 2, 14, 0x0b0d11, 9); grp.add(box(0.01, 0.04, 0.3, glow(0xff7a1a), -3.83, ay + 0.16, az)); grp.add(box(0.01, 0.1, 0.02, steel, -3.83, ay + 0.4, az + 0.15)); }
    grp.add(plate(["🔌 " + (de() ? UP[0].name.de : UP[0].name.en) + " ×" + nU, "🖥️ GPU ×" + nG + "   🧩 FPGA ×" + nF], 1.0, 0.34, -4.28, 2.3, 1.0, Math.PI / 2));
    grp.add(plate(["📦 " + (de() ? UP[3].name.de : UP[3].name.en) + " ×" + nA], 0.9, 0.24, -4.28, 2.3, 2.0, Math.PI / 2));
    if (nA > 0) grp.add(plate(["⚠ HOT ⚠"], 0.5, 0.16, -4.28, 2.05, 2.45, Math.PI / 2));
    // Hash-Meter: Balken an der Wand, leuchten mit der gesamten passiven Rate (log-Skala)
    var lit = Math.min(12, Math.floor(Math.log(1 + totalHr()) / Math.log(1.9)));
    for (var mb = 0; mb < 12; mb++) { var on = mb < lit, cl = mb < 5 ? 0x78d505 : mb < 9 ? 0xffb020 : 0xff3a3a; grp.add(box(0.03, 0.12 + mb * 0.012, 0.1, on ? glow(cl) : mat(0x20262f), -4.29, 2.9, 0.6 + mb * 0.15)); }
    grp.add(plate(["HASH"], 0.45, 0.14, -4.28, 3.15, 0.75, Math.PI / 2));
    /* ----- Hof links vom Laden (hinter dem Zaun, von der Strasse sichtbar): Container-Farm + Solar-Miningpark ----- */
    if (nFarm > 0) {
      var gy0 = 0.12, nc = nFarm >= 15 ? 3 : nFarm >= 5 ? 2 : 1;
      for (var ci = 0; ci < nc; ci++) {
        var cx = -10.5 - (ci === 2 ? 3.6 : 0), cz2 = 1.3, cy = gy0 + 0.75 + (ci === 1 ? 1.5 : 0); grp.add(box(3.4, 1.5, 1.3, mat(0x2a6bd1, { roughness: 0.6 }), cx, cy, cz2));
        for (var r = 0; r < 12; r++) grp.add(box(0.05, 1.4, 1.34, mat(0x1f55ab), cx - 1.55 + r * 0.28, cy, cz2));
        grp.add(box(3.4, 0.06, 1.32, mat(0xf0b429), cx, cy - 0.7, cz2)); grp.add(box(0.05, 1.4, 0.04, steel, cx + 1.6, cy, cz2 + 0.66)); grp.add(box(0.05, 1.4, 0.04, steel, cx + 1.4, cy, cz2 + 0.66));
        fanAt(0.3, cx + 1.72, cy + 0.05, cz2, 0, Math.PI / 2, 10, 0x0b0d11, 9);
        // Details: Eckpfosten, Dachrippen, Tuerriegel, Standfuesse
        [[-1.7, -0.65], [-1.7, 0.65], [1.7, -0.65], [1.7, 0.65]].forEach(function (q) { grp.add(box(0.12, 1.56, 0.12, steel, cx + q[0], cy, cz2 + q[1])); });
        for (var rb = 0; rb < 6; rb++) grp.add(box(0.07, 0.05, 1.36, steel, cx - 1.4 + rb * 0.56, cy + 0.77, cz2));
        for (var lk = 0; lk < 2; lk++) { grp.add(cyl(0.025, 0.025, 1.3, steel, cx - 1.72 + lk * 0.1, cy, cz2 - 0.0, 8)); grp.add(box(0.06, 0.1, 0.06, mat(0xf0b429), cx - 1.72 + lk * 0.1, cy - 0.1, cz2 + 0.06)); }
        if (ci === 0) [[-1.5, -0.5], [1.5, -0.5], [-1.5, 0.5], [1.5, 0.5]].forEach(function (q) { grp.add(box(0.2, 0.12, 0.2, mat(0x333840), cx + q[0], gy0 + 0.06, cz2 + q[1])); });
      }
      for (var v = 0; v < Math.min(nFarm, 10); v++) { var vl = box(0.18, 0.1, 0.03, glow(0xff7a1a), -10.5 - 1.4 + v * 0.3, gy0 + 1.2, 1.3 + 0.68); grp.add(vl); S2.leds.push(vl); }
      grp.add(box(0.8, 0.4, 0.6, mat(0xd0d4da, { metalness: 0.3 }), -9.4, gy0 + 1.7 + (nc > 1 ? 1.5 : 0), 1.3)); fanAt(0.17, -9.4, gy0 + 1.92 + (nc > 1 ? 1.5 : 0), 1.3, -Math.PI / 2, 0, 14, 0x0b0d11, 6);
      grp.add(cyl(0.015, 0.015, 1.2, steel, -12.0, gy0 + 2.3, 1.3, 6)); grp.add(box(0.06, 1.0, 0.06, mat(0x333840), -10.5, gy0 + 2.0, 2.1)); grp.add(plate(["🏭 " + (de() ? UP[4].name.de : UP[4].name.en) + " ×" + nFarm], 2.0, 0.34, -10.5, gy0 + 2.2, 2.14, 0));
    }
    if (nPl > 0) {
      var np = Math.min(2 + nPl * 2, 12);
      for (var s = 0; s < np; s++) { var sx = -14.2 + (s % 4) * 1.25, sz = -5.6 + Math.floor(s / 4) * 1.2, pn2 = box(1.05, 0.04, 0.8, mat(0x123a7a, { metalness: 0.7, roughness: 0.25 }), sx, 0.95, sz); pn2.rotation.x = -0.5; grp.add(pn2); var fr2 = box(1.12, 0.03, 0.87, steel, sx, 0.945, sz - 0.002); fr2.rotation.x = -0.5; grp.add(fr2); var vl2 = box(0.5, 0.1, 0.05, mat(0x4a4f58), sx, 0.62, sz + 0.3); grp.add(vl2); grp.add(box(0.06, 0.85, 0.06, mat(0x4a4f58), sx, 0.55, sz + 0.2)); for (var gl2 = 0; gl2 < 3; gl2++) { var gline = box(1.05, 0.045, 0.01, mat(0x6aa0ff), sx, 0.95, sz); gline.rotation.x = -0.5; gline.position.z += (gl2 - 1) * 0.22; gline.position.y += (gl2 - 1) * -0.11; grp.add(gline); } }
      grp.add(box(0.6, 0.8, 0.3, mat(0xd0d4da, { metalness: 0.3 }), -6.4, 0.55, -4.2)); grp.add(box(0.5, 0.12, 0.02, glow(0x78d505), -6.4, 0.75, -4.04)); grp.add(box(7.6, 0.03, 0.03, mat(0x111418), -10.3, 0.15, -4.0));
      grp.add(box(0.06, 1.0, 0.06, mat(0x333840), -10.3, 0.62, -1.6)); grp.add(plate(["☀️ " + (de() ? UP[5].name.de : UP[5].name.en) + " ×" + nPl], 2.4, 0.34, -10.3, 1.3, -1.55, 0));
    }
    S2.sig = ownSig();
  }

  /* ---------- Bedienung ---------- */
  var actx = null;
  function beep(f) { try { actx = actx || new (W.AudioContext || W.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; o.type = "square"; g.gain.value = 0.03; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.05); } catch (e) {} }
  function fmtG(n) { n = Number(n) || 0; if (n < 10 && n % 1 !== 0) return (Math.round(n * 10) / 10).toFixed(1); return String(Math.floor(n)); }
  function floatText(txt2, crit) {
    if (!S || !S.cam) return; var v = new THREE.Vector3(-2.3 + (Math.random() - 0.5) * 0.4, 1.5, -0.55); v.project(S.cam); if (v.z > 1) return;
    var w = S.stage.clientWidth, h = S.stage.clientHeight, d = document.createElement("div"); d.className = "nx-float"; d.textContent = txt2; if (crit) d.style.color = "#ff6a6a"; d.style.left = ((v.x * 0.5 + 0.5) * w) + "px"; d.style.top = ((-v.y * 0.5 + 0.5) * h) + "px"; S.stage.appendChild(d);
    requestAnimationFrame(function () { d.style.transform = "translate(-50%,-90px)"; d.style.opacity = "0"; }); setTimeout(function () { try { d.remove(); } catch (e) {} }, 800);
  }
  function press() {
    var d = gameClick(), crit = false;
    if (d <= 0) { var pc = Number(st().perClick) || 1; try { W.state.balance += pc; W.state.lifetime += pc; } catch (e) {} d = pc; }
    else if (st().perClick && d > st().perClick * 2) crit = true;
    S2.clicks++; S2.pressT = 0.12; beep(crit ? 880 : 320 + (S2.clicks % 5) * 40); floatText((crit ? "CRIT! +" : "+") + fmtG(d), crit);
  }
  function rows(kind) { var host = document.getElementById(kind === "C" ? "shop-click" : "shop"); return host ? host.children : []; }
  function ensureQty() { try { if (st().buyQty !== 1) { var b = document.querySelector('.qty-btn[data-qty="1"]'); if (b) b.click(); } } catch (e) {} }
  function openUpg() {
    css(); if (!panel) {
      panel = document.createElement("div"); panel.id = "nx-upg"; S.stage.appendChild(panel);
      panel.addEventListener("click", function (e) {
        var t = e.target; if (!t || !t.getAttribute) return; var b = t.getAttribute("data-buy"), q = t.getAttribute("data-qty");
        if (q) { var qb = document.querySelector('.qty-btn[data-qty="' + q + '"]'); if (qb) qb.click(); setTimeout(renderUpg, 30); return; }
        if (b) { buy(b); return; } if (t.getAttribute("data-x")) closeUpg();
      });
    }
    renderUpg(); panel.classList.add("show"); S.invOpen = true; S.joy.x = 0; S.joy.y = 0;
  }
  function closeUpg() { if (panel) panel.classList.remove("show"); S.invOpen = false; }
  function costOf(kind, i) { var r = rows(kind)[i]; return r ? Number(r.dataset.cost) || 0 : 0; }
  function fmtCost(n) { n = Math.ceil(n); return (n < 100000 ? n.toLocaleString(de() ? "de-DE" : "en-US") : n.toLocaleString(de() ? "de-DE" : "en-US", { notation: "compact", maximumFractionDigits: 2 })) + " sats"; }
  function renderUpg() {
    var lang = de() ? "de" : "en", h = "<h4>⬆️ Upgrades</h4><p class='nx-sub'>💰 " + txt("balance") + " · " + txt("hashrate") + "</p><div class='nx-qty'>";
    var qs = document.querySelectorAll(".qty-btn"); Array.prototype.forEach.call(qs, function (b) { var q = b.getAttribute("data-qty"); h += '<button type="button" data-qty="' + q + '"' + (Number(st().buyQty) === Number(q) ? ' class="on"' : "") + ">×" + q + "</button>"; }); h += "</div>";
    function sect(title, list, kind, ownFn, spec) {
      h += "<div class='nx-sec'>" + title + "</div>";
      list.forEach(function (u, i) {
        var n = ownFn(u.id), c = costOf(kind, i), r = rows(kind)[i], can = r && !r.disabled;
        var nm = u.name[lang], ds = u.desc[lang] + " · " + spec(u);
        try { if (r) { var e1 = r.querySelector(".name"), e2 = r.querySelector(".desc"); if (e1) nm = (e1.textContent || "").split("·")[0].trim() || nm; if (e2) ds = (e2.textContent || "").trim() || ds; } } catch (x) {}
        h += '<div class="nx-up"><div><b>' + u.icon + " " + nm + "</b>" + (n > 0 ? " <span class='nx-pip'>×" + n + "</span>" : "") + "<br><small>" + ds + "</small></div>" +
          '<button type="button" data-buy="' + kind + i + '"' + (can ? "" : " disabled") + ">" + fmtCost(c) + "</button></div>";
      });
    }
    sect(T("Klick-Upgrades", "Click upgrades"), CL, "C", cown, function (u) { return "×" + u.mult + " " + T("pro Klick", "per click"); });
    sect(T("Miner (passiv)", "Miners (passive)"), UP, "P", own, function (u) { return "+" + u.hr + " H/s"; });
    h += '<div class="nx-bt"><button type="button" data-x="1">' + T("Schließen", "Close") + "</button></div>"; panel.innerHTML = h;
  }
  function buy(code) {
    var kind = code.charAt(0), i = Number(code.slice(1)), r = rows(kind)[i]; if (!r || r.disabled) return;
    r.click(); setTimeout(function () { renderUpg(); }, 40); beep(660);
  }
  function css() {
    if (document.getElementById("nx-clk-style")) return; var s = document.createElement("style"); s.id = "nx-clk-style";
    s.textContent = ".nx-float{position:absolute;transform:translate(-50%,0);color:#ffd36a;font:700 20px monospace;text-shadow:0 1px 4px #000;pointer-events:none;transition:transform .75s ease-out,opacity .75s;z-index:4}" +
      "#nx-upg{position:absolute;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);background:#12161c;border:1px solid #f7931a;border-radius:16px;padding:12px 14px;color:#e7e9ec;font:13px sans-serif;display:none;z-index:6;max-height:80%;overflow:auto;box-shadow:0 8px 30px #000a}#nx-upg.show{display:block}" +
      "#nx-upg h4{margin:0 0 4px;font-size:15px}.nx-sub{margin:0 0 8px;color:#aeb6c2;font-size:12px}.nx-sec{margin:10px 0 2px;color:#f7931a;font-weight:700;font-size:12px;text-transform:uppercase}" +
      ".nx-qty{display:flex;gap:6px;margin-bottom:4px}.nx-qty button{flex:1;font:700 12px monospace;padding:7px;border-radius:8px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec}.nx-qty button.on{background:#f7931a;border-color:#f7931a;color:#1a1206}" +
      ".nx-up{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #222a36;padding:8px 0}.nx-up small{color:#aeb6c2}.nx-pip{color:#f7931a;font-weight:700}" +
      ".nx-up button{font:700 12px monospace;padding:9px 10px;border-radius:9px;border:1px solid #f7931a;background:#f7931a;color:#1a1206;min-width:96px}.nx-up button[disabled]{opacity:.35;background:#161c24;color:#e7e9ec;border-color:#2c3646}" +
      "#nx-upg .nx-bt{display:flex;margin-top:10px}#nx-upg .nx-bt button{flex:1;font:700 13px sans-serif;padding:11px;border-radius:10px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec}";
    document.head.appendChild(s);
  }
  function loop(dt) {
    if (buzMesh) { S2.pressT = Math.max(0, S2.pressT - dt); buzMesh.position.y = (S2.by || 1.16) - (S2.pressT > 0 ? 0.04 : 0); }
    var now = Date.now() / 1000; S2.leds.forEach(function (l, i) { l.visible = Math.sin(now * 5 + i * 1.7) > -0.3; });
    S2.spin.forEach(function (s) { s.m.rotation[s.ax] += dt * s.s; }); S2.orb.forEach(function (o) { o.position.y = 1.85 + Math.sin(now * 2) * 0.04; });
    S2.bub.forEach(function (b) { b.y += dt * 0.18; if (b.y > 1.45) b.y = 1.12; b.m.position.set(b.x, b.y, b.z); });
    S2.orbit.forEach(function (o) { o.a += dt * o.s; o.m.position.set(-2.3 + Math.cos(o.a) * o.r, o.cy + Math.sin(o.a * 1.7) * 0.05, -0.55 + Math.sin(o.a) * o.r); });
    S2.pulse.forEach(function (p) { p.m.position.y = p.base + Math.sin(now * 2.2) * p.amp; });
    S2.acc += dt; if (S2.acc > 0.3) { S2.acc = 0; drawScreen(); if (ownSig() !== S2.sig) build(); if (panel && panel.classList.contains("show")) renderUpg(); }
  }
  function init() {
    S = W.Parts3D.nextWorld.S; css(); scrCtx = S.scr.ctx; scrTex = S.scr.tex; S.scr.owned = true; S.buzzOwned = true; buzMesh = S.buzz;
    try { build(); } catch (e) { S.err("Upgrade-Grafik: " + e.message); }
    try { drawScreen(); } catch (e) { S.err("Bildschirm: " + e.message); }
    S.obst.push(RACK);
    S.stations.buzzer.action = press; S.stations.upg.action = function () { ensureQty(); openUpg(); };
    S.ticks.push(function (dt) { loop(dt); });
    W.Parts3D.clicker = { press: press, open: openUpg, rebuild: build };
    console.log("[HASHPOOL NEXT] clicker bereit (Original-Upgrades)");
  }
  var n = 0, iv = setInterval(function () {
    n++;
    try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && W.state && typeof THREE !== "undefined") { clearInterval(iv); init(); } }
    catch (e) { clearInterval(iv); try { W.Parts3D.nextWorld.S.err("clicker: " + e.message); } catch (x) {} console.warn("[clicker]", e); }
    if (n > 400) clearInterval(iv);
  }, 400);
})();
