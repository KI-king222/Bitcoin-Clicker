/* extras.js — HASHPOOL NEXT: Komfort & Atmosphaere (nur in /next/, Kill-Switch ?noextras=1)
 * - Ziel-Anzeige (Tutorial): sagt dir, was als Naechstes zu tun ist, mit pulsierendem Schild + 3D-Pfeil an der Zielstation
 * - Ton (synthetisch, kein Download): Schritte, Tuerklingel, Kasse, Paket, Strassenrauschen; Knopf 🔊/🔇
 * - Qualitaet: Auto / Hoch / Niedrig (Pixeldichte, Autos aus, Nebel kuerzer); Auto schaltet bei lahmem Geraet runter
 * - Tag und Nacht: Zyklus (12 min) mit Tag-Himmel, Licht, Nebel, Laternenglanz
 * - Spielerposition wird gemerkt (localStorage hashpool-next-pos)
 */
(function () {
  var W = window;
  if (W.__nxExtras) return; W.__nxExtras = true;
  var S, G;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  function T(a, b) { return de() ? a : b; }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function sum(o) { var n = 0; for (var k in o) n += o[k] || 0; return n; }

  /* ---------- Ton ---------- */
  var ac = null, master = null, amb = null, ambGain = null, muted = ls("hashpool-next-mute") === "1", stepT = 0;
  function actx() {
    if (ac) return ac;
    try {
      ac = new (W.AudioContext || W.webkitAudioContext)(); master = ac.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ac.destination);
      var len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0), last = 0; for (var i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
      amb = ac.createBufferSource(); amb.buffer = buf; amb.loop = true; var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420; ambGain = ac.createGain(); ambGain.gain.value = 0.05; amb.connect(lp); lp.connect(ambGain); ambGain.connect(master); amb.start();
    } catch (e) { ac = null; }
    return ac;
  }
  function noise(dur, freq, vol) {
    var c = actx(); if (!c) return; var len = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = c.createBufferSource(); s.buffer = b; var f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; var g = c.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  function tone(freq, dur, vol, type, delay) {
    var c = actx(); if (!c) return; var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + (delay || 0); o.type = type || "sine"; o.frequency.value = freq; g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  var foot = 0;
  function pan(v) { var c = actx(); if (!c || !c.createStereoPanner) return null; var p = c.createStereoPanner(); p.pan.value = v; p.connect(master); return p; }
  function thump(f0, f1, dur, vol, dest) { var c = actx(); if (!c) return; var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime; o.type = "sine"; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dur); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + 0.02); }
  function scuff(dur, cut, vol, dest) { var c = actx(); if (!c) return; var len = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2); var s = c.createBufferSource(); s.buffer = b; var f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = cut; var g = c.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(dest || master); s.start(); }
  var snd = {
    // Schritt: weicher Tiefton (Auftreten) + kurzes dumpfes Schleifen; links/rechts leicht versetzt, draussen etwas knirschender
    step: function (out) { foot ^= 1; var d = pan(foot ? -0.18 : 0.18) || master, j = 0.92 + Math.random() * 0.16; thump((out ? 150 : 110) * j, 48, 0.11, out ? 0.13 : 0.16, d); scuff(0.06, out ? 2600 : 1100, out ? 0.05 : 0.04, d); },
    bell: function () { tone(1568, 0.7, 0.08, "sine", 0); tone(1175, 0.9, 0.08, "sine", 0.18); },
    cash: function () { tone(1320, 0.12, 0.06, "square", 0); tone(1760, 0.3, 0.06, "square", 0.1); },
    pack: function () { noise(0.14, 180, 0.35); tone(110, 0.15, 0.1, "sine", 0); },
    // "Blabla": kurzer Silbenton je 2 Buchstaben, Tonhoehe schwankt um die Stimme des Kunden (hoch/tief, Dreieck/Rechteck), Vokale klingen heller
    blip: function (ch, v, i) {
      var c = actx(); if (!c) return; v = v || { f: 160, w: "square", v: 1 }; var vowel = /[aeiouäöüAEIOU]/.test(ch), f = v.f * v.v * (vowel ? 1.18 : 0.92) * (1 + Math.sin(i * 1.7) * 0.12 + (Math.random() - 0.5) * 0.06);
      var o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter(), t0 = c.currentTime; o.type = v.w; o.frequency.setValueAtTime(f, t0); o.frequency.linearRampToValueAtTime(f * (vowel ? 0.92 : 1.06), t0 + 0.06); lp.type = "lowpass"; lp.frequency.value = vowel ? 1800 : 1100;
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.055, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.075); o.connect(lp); lp.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.09);
    },
    toggle: function () { muted = !muted; ls("hashpool-next-mute", muted ? "1" : "0"); if (master) master.gain.value = muted ? 0 : 1; var b = document.getElementById("nx-snd"); if (b) b.textContent = muted ? "🔇" : "🔊"; actx(); }
  };
  W.Parts3D = W.Parts3D || {}; W.Parts3D.nextSound = snd;

  /* ---------- Ziel / Tutorial ---------- */
  var goalEl, beacon = null, goalId = null, goalTxt = "";
  function pendInfo() { var L = W.Parts3D.nextLogi ? W.Parts3D.nextLogi.state() : { pend: [], carry: {} }, now = Date.now(), r = 0, w = 0; L.pend.forEach(function (p) { if (p.t <= now) r += p.n; else w += p.n; }); return { carry: sum(L.carry), ready: r, wait: w }; }
  function computeGoal() {
    var pi = pendInfo(), inv = sum((W.state && W.state.partInv) || {}), st = null; try { st = W.Parts3D.orders.state(); } catch (e) {}
    if (pi.carry > 0) return ["shelf", T("Räum die Pakete ins Regal (Hinterraum).", "Put the parcels on the shelf (back room).")];
    if (pi.ready > 0) return ["depot", T("Deine Bestellung liegt im Abholladen (rechts nebenan).", "Your order is waiting at the pickup store (next door, right).")];
    if (pi.wait > 0) return ["depot", T("Lieferung unterwegs … geh schon mal zum Abholladen.", "Delivery on its way … head to the pickup store.")];
    if (S.cust && S.cust.state === "wait") return ["counter", T("Ein Kunde wartet an der Theke!", "A customer is waiting at the counter!")];
    if (inv <= 0) return ["pc", T("Bestelle Teile am Computer im Hinterraum.", "Order parts at the computer in the back room.")];
    if (st && st.active) return ["bench", T("Baue den PC für deinen Auftrag am Bautisch.", "Build the PC for your order at the workbench.")];
    return ["bench", T("Teile im Lager: Baue am Bautisch einen PC.", "Parts in stock: build a PC at the workbench.")];
  }
  function setGoal(id, txt) {
    if (id !== goalId) {
      if (goalId && S.stations[goalId] && S.stations[goalId].el) S.stations[goalId].el.classList.remove("nx-goal");
      goalId = id; if (id && S.stations[id] && S.stations[id].el) S.stations[id].el.classList.add("nx-goal");
    }
    if (goalEl && txt !== goalTxt) { goalTxt = txt; goalEl.textContent = "🎯 " + txt; }
  }

  /* ---------- Qualitaet ---------- */
  var qMode = ls("hashpool-next-quality") || "auto", qLow = false, fSum = 0, fN = 0;
  function applyQuality(low) {
    qLow = low; try { S.rd.setPixelRatio(low ? Math.min(W.devicePixelRatio || 1, 1.5) : Math.min(W.devicePixelRatio || 1, 2)); S.rd.setSize(S.stage.clientWidth || 360, S.stage.clientHeight || 600, true); } catch (e) {}
    try { var E = W.Parts3D.nextEnv; if (E) E.cars.forEach(function (c) { c.g.visible = !low; }); S.scene.fog.far = low ? 45 : 70; } catch (e) {}
    var b = document.getElementById("nx-q"); if (b) b.textContent = "⚙ " + (qMode === "auto" ? "Auto" : qMode === "hi" ? T("Hoch", "High") : T("Niedrig", "Low"));
  }
  function cycleQuality() { qMode = qMode === "auto" ? "hi" : qMode === "hi" ? "lo" : "auto"; ls("hashpool-next-quality", qMode); fSum = 0; fN = 0; applyQuality(qMode === "lo"); }

  /* ---------- Tag / Nacht ---------- */
  var tod = 0.5, lastTod = -1;
  function dayFactor() { var p = (Date.now() / 720000) % 1, v = (Math.sin(p * 6.2832) + 0.35) / 1.1; return Math.max(0, Math.min(1, v)); }
  function applyTod(d) {
    try {
      var E = W.Parts3D.nextEnv, L = S.lights; if (L) { L.hemi.intensity = 0.55 + 0.45 * d; L.amb.intensity = 0.38 + 0.3 * d; }
      if (E) { E.skyDay.material.opacity = d; E.halos.forEach(function (h) { h.material.opacity = 1 - d * 0.9; }); }
      var c1 = [0x14, 0x1b, 0x30], c2 = [0xa4, 0xc4, 0xe6], c = c1.map(function (a, i) { return Math.round(a + (c2[i] - a) * d); }), hex = (c[0] << 16) | (c[1] << 8) | c[2];
      S.scene.fog.color.setHex(hex); S.scene.background.setHex(hex);
    } catch (e) {}
  }

  /* ---------- UI ---------- */
  function css() {
    var s = document.createElement("style");
    s.textContent = "#nx-goal{position:absolute;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 84px);color:#b9f58a;font:700 12px monospace;text-shadow:0 1px 3px #000;pointer-events:none;z-index:3}" +
      ".nx-lbl.nx-goal{border-color:#78d505;color:#b9f58a;box-shadow:0 0 12px #78d505aa;animation:nxp 1s infinite alternate}@keyframes nxp{from{transform:translate(-50%,-100%) scale(1)}to{transform:translate(-50%,-100%) scale(1.1)}}" +
      "#nx-err{top:calc(env(safe-area-inset-top,0px) + 104px)!important}";
    document.head.appendChild(s);
  }
  function init() {
    S = W.Parts3D.nextWorld.S; G = S.G; css();
    var root = document.getElementById("nx-world"), hud = root.querySelector(".nx-hud");
    goalEl = document.createElement("div"); goalEl.id = "nx-goal"; root.appendChild(goalEl);
    var bs = document.createElement("button"); bs.id = "nx-snd"; bs.type = "button"; bs.textContent = muted ? "🔇" : "🔊"; bs.addEventListener("click", snd.toggle); hud.appendChild(bs);
    var bq = document.createElement("button"); bq.id = "nx-q"; bq.type = "button"; bq.addEventListener("click", cycleQuality); hud.appendChild(bq);
    // iOS: AudioContext muss in touchend/click entsperrt werden (nicht pointerdown) und darf nicht an den Stumm-Schalter gebunden sein
    var SIL = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=", silEl = null;
    function unlock() {
      try { if (W.navigator && navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
      var c = actx(); if (c && c.state !== "running" && c.resume) { try { c.resume(); } catch (e) {} }
      if (!silEl) { try { silEl = document.createElement("audio"); silEl.src = SIL; silEl.loop = true; silEl.setAttribute("playsinline", ""); silEl.volume = 0.02; var pr = silEl.play(); if (pr && pr.catch) pr.catch(function () { silEl = null; }); } catch (e) { silEl = null; } }
      if (c && c.state === "running") { var b = document.getElementById("nx-snd"); if (b && !muted) b.textContent = "🔊"; }
    }
    ["touchend", "click", "pointerup", "keydown", "mousedown"].forEach(function (ev) { W.addEventListener(ev, unlock, { passive: true, capture: true }); });
    setInterval(function () { if (ac && ac.state === "suspended" && !muted) { var b = document.getElementById("nx-snd"); if (b) b.textContent = "🔈"; } }, 1500);
    // Position wiederherstellen
    try { var p = JSON.parse(ls("hashpool-next-pos") || "null"); if (p && S.free(p.x, p.z)) { S.px = p.x; S.pz = p.z; S.yaw = p.yaw || S.yaw; } } catch (e) {}
    // Pfeil (Bake) ueber dem Ziel
    beacon = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), new THREE.MeshBasicMaterial({ color: 0x78d505 })); beacon.rotation.x = Math.PI; S.scene.add(beacon); beacon.visible = false;
    S.onSpeak = function (ch, v, i) { if (ac) snd.blip(ch, v, i); };
    // Ton-Hooks: Einpacken / Einraeumen
    ["takeall", "stock"].forEach(function (k) { var o = S.invActions[k]; if (o) S.invActions[k] = function (t) { o(t); snd.pack(); }; });
    var lastCust = null, lastActive = null; try { lastActive = W.Parts3D.orders.state().active || null; } catch (e) {} var t5 = 0, t3 = 0, tg = 0;
    S.ticks.push(function (dt, tt) {
      // Qualitaet (Auto)
      if (qMode === "auto" && !qLow) { fSum += dt; fN++; if (fN >= 150) { if (fSum / fN > 0.034) { applyQuality(true); S.toast(T("Grafik automatisch gesenkt (flüssiger).", "Graphics lowered automatically (smoother).")); } fSum = 0; fN = 0; } }
      // Schritte + Ambiente
      var moving = Math.abs(S.joy.x) + Math.abs(S.joy.y) > 0.15 || !!S.auto || S.keys.w || S.keys.a || S.keys.s || S.keys.d || S.keys.arrowup || S.keys.arrowdown;
      stepT -= dt; if (moving && !S.dlg && !S.invOpen && stepT <= 0) { stepT = 0.36; if (ac) snd.step(S.roomOf(S.px, S.pz) === "E"); }
      if (ac && ambGain) { var out = S.roomOf(S.px, S.pz) === "E" ? 0.09 : 0.025; ambGain.gain.value += (out - ambGain.gain.value) * Math.min(1, dt * 2); }
      // Kunden-Klingel + Kasse bei neuem Auftrag
      if (S.cust !== lastCust) { if (S.cust && ac) snd.bell(); lastCust = S.cust; }
      try { var act = W.Parts3D.orders.state().active || null; if (act !== lastActive) { if (act) snd.cash(); lastActive = act; } } catch (e) {}
      // Ziel
      tg -= dt; if (tg <= 0) { tg = 0.5; var g = computeGoal(); setGoal(g[0], g[1]); }
      var gs = goalId && S.stations[goalId]; if (gs) { beacon.visible = true; beacon.position.set(gs.lx, gs.ly + 0.55 + Math.sin(tt * 4) * 0.06, gs.lz); beacon.rotation.y += dt * 2; } else beacon.visible = false;
      // Karte (5 Hz), Tag/Nacht (alle 2 s), Position (alle 3 s)
      t5 -= dt; if (t5 <= 0) { t5 = 2; var d = dayFactor(); if (Math.abs(d - lastTod) > 0.01) { lastTod = d; applyTod(d); } }
      t3 -= dt; if (t3 <= 0) { t3 = 3; ls("hashpool-next-pos", JSON.stringify({ x: Math.round(S.px * 100) / 100, z: Math.round(S.pz * 100) / 100, yaw: Math.round(S.yaw * 100) / 100 })); }
    });
    applyQuality(qMode === "lo"); applyTod(dayFactor());
    console.log("[HASHPOOL NEXT] extras bereit (Ziel, Karte, Ton, Qualitaet, Tag/Nacht)");
  }
  var n = 0, iv = setInterval(function () {
    n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined") { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); try { W.Parts3D.nextWorld.S.err("extras: " + e.message); } catch (x) {} console.warn("[extras]", e); }
    if (n > 400) clearInterval(iv);
  }, 400);
})();
