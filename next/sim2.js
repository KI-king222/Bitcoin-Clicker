/* sim2.js — Verwaltung fuer /next/: Chef-Terminal (Mitarbeiter "Lagerhilfe", Einrichtung, Werbung).
 * Kosten werden vom echten Kontostand abgezogen (einmalig, keine laufenden Kosten). Kill-Switch ?nosim2 */
(function () {
  var W = window, KEY = "hashpool-next-mgmt-v1";
  function init() {
    var S = W.Parts3D.nextWorld.S, G = S.G, sc = S.scene, T = G.T, M = G.M, box = G.box, glow = G.glow, plane = G.plane;
    var D = { helper: false, decor: {}, adUntil: 0 };
    try { var j = JSON.parse(localStorage.getItem(KEY) || "null"); if (j) { D.helper = !!j.helper; D.decor = j.decor || {}; D.adUntil = j.adUntil || 0; } } catch (e) {}
    function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} S.adUntil = D.adUntil; }
    S.adUntil = D.adUntil;
    function bal() { try { return Number(W.state.balance) || 0; } catch (e) { return 0; } }
    function pay(c) { if (bal() < c) { S.toast(T("Zu wenig Geld (", "Not enough money (") + c + " sats)"); return false; } W.state.balance -= c; try { if (typeof W.save === "function") W.save(); } catch (e) {} return true; }
    /* ---------- Kiosk ---------- */
    var KX = 3.7, KZ = 1.5;
    sc.add(box(0.5, 1.0, 0.5, M(0x1a202c, { metalness: 0.4 }), KX, 0.62, KZ)); sc.add(box(0.62, 0.06, 0.62, M(0xf7931a, { roughness: 0.5 }), KX, 1.14, KZ));
    var scr = box(0.04, 0.4, 0.55, new THREE.MeshBasicMaterial({ map: G.textTex("CHEF", 128, 192, "#0a1830", "#6aa8ff", "bold 40px sans-serif") }), KX + 0.2, 1.45, KZ); scr.rotation.z = -0.25; sc.add(scr);
    S.obst.push([KX - 0.35, KX + 0.35, KZ - 0.35, KZ + 0.35]);
    S.addStation("office", KX, 1.3, KZ, 0.8, 1.2, 0.8, "🧾 " + T("Chef-Büro", "Office"), KX - 1.0, KZ, function () { panel(); });
    /* ---------- Einrichtung (sichtbar) ---------- */
    var DEC = [
      { id: "rug", c: 1500, n: ["Teppich am Tresen", "Rug at the counter"], build: function () { var r = plane(2.6, 1.7, new THREE.MeshStandardMaterial({ color: 0x4a1620, roughness: 1 }), 0.7, 0.135, 2.4); r.rotation.x = -Math.PI / 2; sc.add(r); var b = plane(2.3, 1.4, new THREE.MeshStandardMaterial({ color: 0x5e2030, roughness: 1 }), 0.7, 0.137, 2.4); b.rotation.x = -Math.PI / 2; sc.add(b); } },
      { id: "led", c: 2500, n: ["LED-Deckenband", "LED ceiling strip"], build: function () { var cols = [0x4fe38a, 0x3a8bff, 0xff3a6e]; [-3.9, 3.9].forEach(function (x, i) { sc.add(box(0.06, 0.05, 4.4, glow(cols[i]), x, 3.3, 1.2)); }); sc.add(box(7.8, 0.05, 0.06, glow(0xf7931a), 0, 3.3, -0.9)); } },
      { id: "sign", c: 3500, n: ["Leuchtreklame innen", "Neon sign inside"], build: function () { sc.add(plane(1.8, 0.5, new THREE.MeshBasicMaterial({ map: G.textTex("★ BEST PC SHOP ★", 512, 140, "#150d1f", "#ff5acd", "bold 58px sans-serif") }), 2.4, 2.9, -1.15)); } },
      { id: "plants", c: 1200, n: ["Pflanzen-Set", "Plant set"], build: function () { var pm = M(0x6a4a3a, { roughness: 0.9 }), lm = [M(0x2e8b4a), M(0x3fa85a)]; [[-3.9, -0.2], [3.9, 0.9], [-3.9, 2.0]].forEach(function (p, i) { sc.add(G.cyl(0.2, 0.15, 0.4, pm, p[0], 0.32, p[1], 16)); for (var k = 0; k < 5; k++) { var l = G.sph(0.22, lm[k % 2], p[0] + Math.cos(k * 1.3) * 0.12, 0.8 + (k % 3) * 0.16, p[1] + Math.sin(k * 1.3) * 0.12, 10, 8); l.scale.set(0.6, 1.3, 0.6); sc.add(l); } }); } }
    ];
    DEC.forEach(function (d) { if (D.decor[d.id]) { try { d.build(); } catch (e) { S.err("decor " + d.id + ": " + e.message); } } });
    /* ---------- Lagerhilfe ---------- */
    var helper = null, HC = 3000;
    function spawnHelper() {
      if (helper || !D.helper) return; var X = W.Parts3D.shop && W.Parts3D.shop._dbg; if (!X || !X.randomSpec || !S.makeActor) return;
      try { helper = S.makeActor(X.randomSpec({ hair: "cap", shirt: 0x2f9e5a, scale: 1.0 })); helper.g.position.set(2.3, 0.12, -0.85); helper.g.rotation.y = Math.PI; sc.add(helper.g); } catch (e) { S.err("Lagerhilfe: " + e.message); }
    }
    var jt = 20;
    function work(dt) {
      if (helper) S.stepActor(helper, dt); else if (D.helper) spawnHelper();
      if (!D.helper) return; jt -= dt; if (jt > 0) return; jt = 25;
      var Lg = W.Parts3D.nextLogi; if (!Lg || S.invOpen || S.dlg) { jt = 5; return; }
      var st = Lg.state(), now = Date.now(), ready = st.pend.some(function (p) { return p.t <= now; });
      if (ready) { try { Lg.take(); setTimeout(function () { try { if (!S.invOpen) Lg.stock(); } catch (e) {} }, 1500); S.toast(T("👷 Lagerhilfe räumt neue Lieferung ins Regal", "👷 Stock helper puts the new delivery on the shelf")); } catch (e) {} }
    }
    S.ticks.push(work);
    /* ---------- Panel ---------- */
    function panel() {
      var h = "<h4>🧾 " + T("Chef-Büro", "Office") + "</h4><p class=\"nx-note\">💰 " + Math.floor(bal()) + " sats</p>";
      h += '<div class="nx-row"><span>👷 ' + T("Lagerhilfe (räumt Lieferungen automatisch ein)", "Stock helper (shelves deliveries automatically)") + "</span><b>" + (D.helper ? "✓" : HC) + "</b></div>";
      if (!D.helper) h += '<div class="nx-bt"><button class="pri" data-a="m_helper">👷 ' + T("Einstellen", "Hire") + "</button></div>";
      DEC.forEach(function (d) { h += '<div class="nx-row"><span>' + (de() ? d.n[0] : d.n[1]) + "</span><b>" + (D.decor[d.id] ? "✓" : d.c) + "</b></div>" + (D.decor[d.id] ? "" : '<div class="nx-bt"><button data-a="m_dec_' + d.id + '">' + T("Kaufen (+4 ⭐)", "Buy (+4 ⭐)") + "</button></div>"); });
      var left = Math.max(0, Math.ceil((D.adUntil - Date.now()) / 60000));
      h += '<div class="nx-row"><span>📣 ' + T("Werbung (15 Min mehr Kundschaft)", "Ads (15 min more customers)") + "</span><b>" + (left ? left + " min" : 2000) + '</b></div><div class="nx-bt"><button data-a="m_ad">' + T("Werbung schalten", "Run ads") + '</button><button data-a="close">' + T("Schließen", "Close") + "</button></div>";
      S.invShow(h);
    }
    function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
    S.invActions.m_helper = function () { if (D.helper || !pay(HC)) return; D.helper = true; save(); spawnHelper(); S.toast(T("👷 Lagerhilfe eingestellt", "👷 Stock helper hired")); panel(); };
    S.invActions.m_ad = function () { if (!pay(2000)) return; D.adUntil = Math.max(Date.now(), D.adUntil) + 15 * 60000; save(); S.toast(T("📣 Werbung läuft", "📣 Ads running")); panel(); };
    DEC.forEach(function (d) { S.invActions["m_dec_" + d.id] = function () { if (D.decor[d.id] || !pay(d.c)) return; D.decor[d.id] = 1; save(); d.build(); S.addRep && S.addRep(4); S.toast("✨ " + (de() ? d.n[0] : d.n[1]) + " +4 ⭐"); panel(); }; });
    W.Parts3D.nextMgmt = { state: function () { return D; }, panel: panel };
    console.log("[HASHPOOL NEXT] sim2 bereit (Chef-Büro)");
  }
  var n = 0, iv = setInterval(function () {
    n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && typeof THREE !== "undefined" && W.state) { clearInterval(iv); init(); } } catch (e) { clearInterval(iv); try { W.Parts3D.nextWorld.S.err("sim2: " + e.message); } catch (x) {} }
    if (n > 400) clearInterval(iv);
  }, 400);
})();
