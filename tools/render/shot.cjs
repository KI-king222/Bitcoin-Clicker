const { chromium } = require("playwright"); const fs = require("fs");
const THREE_MIN = process.env.THREE_MIN || "/home/claude/mrdoob/three.js/build/three.min.js";   // three r128 (git clone --depth 1 --branch r128 https://github.com/mrdoob/three.js)
const RP = (process.env.REPO || process.cwd()).replace(/\/?$/, "/");
const PORT = process.env.PORT || 8123;
const GAME_HTML = process.env.GAME_HTML || __dirname + "/game.html";
const three = fs.readFileSync(THREE_MIN, "utf8");
const views = JSON.parse(process.argv[2] || "[[0.3,1.4,3.14,0]]");
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
  const p = await b.newPage({ viewport: { width: 430, height: 800 }, deviceScaleFactor: 1 });
  const logs = []; p.on("requestfailed", r => logs.push("REQFAIL " + r.url().slice(0,120))); p.on("request", r => { if (/\/next\/[a-z0-9]+\.js/.test(r.url())) logs.push("REQ " + r.url().replace(/.*next\//, "").slice(0, 30)); }); p.on("pageerror", e => logs.push("PAGEERR " + e.message)); p.on("console", m => logs.push(m.type() + ": " + m.text().slice(0, 200)));
  await p.addInitScript(three); await p.addInitScript(() => { const R = THREE.WebGLRenderer.prototype.render; THREE.WebGLRenderer.prototype.render = function (a, b) { if (window.__render) return R.call(this, a, b); }; });
  await p.addInitScript(() => { try { localStorage.setItem("hashpool-next-world", "1"); localStorage.setItem("hashpool-next-pos", ""); } catch (e) {} });
    await p.route(/jsdelivr|cdnjs|unpkg|raw\.githubusercontent/, r => { const u = r.request().url(); let f = null; if (/index\.html/.test(u)) { r.fulfill({ body: fs.readFileSync(GAME_HTML), contentType: "text/html" }); return; } else if (/status\.json/.test(u)) f = "status.json"; else { const m = u.match(/Bitcoin-Clicker(?:@[0-9a-f]+|\/main)?\/(.+?)(\?|$)/); if (m) f = m[1]; } if (f && fs.existsSync(RP + f)) r.fulfill({ body: fs.readFileSync(RP + f), contentType: /html/.test(f) ? "text/html" : /json/.test(f) ? "application/json" : "text/plain" }); else r.abort(); });
  await p.goto("http://localhost:" + PORT + "/next/index.html", { waitUntil: "load" });
  await p.waitForTimeout(9000); try { await p.click("text=Nice", { timeout: 3000 }); } catch (e) {} await p.waitForTimeout(6000); try { await p.click("text=No thanks", { timeout: 3000 }); } catch (e) {}
  try { await p.waitForFunction(() => window.Parts3D && Parts3D.nextWorld && Parts3D.nextWorld.S.ready, null, { timeout: 120000 }); } catch (e) { console.log("WAIT-FAIL"); }
  await p.waitForTimeout(3000); try { await p.click("text=No thanks", { timeout: 2000 }); } catch (e) {}
  console.log(await p.evaluate(() => JSON.stringify({ ord: !!(Parts3D.orders), st: !!window.state, body: document.body.innerText.slice(0,120), rev: THREE.REVISION, shown: Parts3D.nextWorld.S.shown, ready: Parts3D.nextWorld.S.ready, err: (document.getElementById("nx-err")||{}).textContent })));
  let i = 0;
  if (process.env.PRE) { console.log("PRE:", await p.evaluate(process.env.PRE)); await p.waitForTimeout(+(process.env.WAIT||15000)); }
  if (process.argv[3]) { console.log(await p.evaluate((a) => { const S = Parts3D.nextWorld.S; S.px = 0; S.pz = 5; S.yaw = 3.14; S.pitch = 0.05; S.cam.position.set(0, 1.62, 5); S.cam.rotation.set(0.05, 3.14, 0); S.cam.updateMatrixWorld(); const out = []; const pts = JSON.parse(a); pts.forEach(pt => { const ndc = new THREE.Vector2(pt[0] / 430 * 2 - 1, -(pt[1] - 0) / 800 * 2 + 1); S.ray.setFromCamera(ndc, S.cam); const h = S.ray.intersectObjects(S.scene.children, true); const o = h[0] && h[0].object; out.push(o ? [o.type, o.geometry && o.geometry.type, o.geometry && o.geometry.parameters && JSON.stringify(o.geometry.parameters).slice(0,80), o.material && o.material.color && o.material.color.getHexString(), o.position.toArray().map(n=>+n.toFixed(1)), o.parent && o.parent.position.toArray().map(n=>+n.toFixed(1)), h[0].distance.toFixed(1)] : null); }); return JSON.stringify(out); }, process.argv[3])); }
  for (const v of views) {
    await p.evaluate(v => { const S = Parts3D.nextWorld.S; S.px = v[0]; S.pz = v[1]; S.yaw = v[2]; S.pitch = v[3]; S.auto = null; }, v);
    await p.evaluate(() => { window.__render = true; }); await p.waitForTimeout(2500); await p.screenshot({ path: "v" + (i++) + ".png" }); await p.evaluate(() => { window.__render = false; });
  }
  console.log(logs.filter(l => !/Hook/.test(l) && /REQ|NEXT|PAGEERR|nicht|sim/.test(l)).slice(-8).join("\n"));
  await b.close();
})();
