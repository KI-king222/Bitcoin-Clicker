/* parts3d/gpu.js — if/else by part id (gpu-1 … gpu-10). Length + fan count obvious. */
(function(){
  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.45:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }

  function card(g, L, H, D, shroud, accent, fans, rgb){
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(L, 0.10, 0.02), mat(0x0a3d1a, { rough:0.6 }));
    pcb.position.set(0, 0, 0.01); g.add(pcb);
    var body = new THREE.Mesh(new THREE.BoxGeometry(L, H, D), mat(shroud, { metal:0.25, rough:0.5 }));
    body.position.set(0, 0, D/2 + 0.02); g.add(body);
    var strip = new THREE.Mesh(new THREE.BoxGeometry(L * 0.95, 0.03, 0.02), mat(accent, { metal:0.2 }));
    strip.position.set(0, H/2 - 0.02, D + 0.03); g.add(strip);
    if(rgb){
      var rgbM = new THREE.Mesh(new THREE.BoxGeometry(L * 0.9, 0.025, 0.015), mat(0x22d3ee, { metal:0 }));
      rgbM.position.set(0, -H/2 + 0.03, D + 0.03); g.add(rgbM);
    }
    var fanR = Math.min(0.12, H * 0.35);
    for(var i=0;i<fans;i++){
      var fx = -L/2 + L * ((i + 0.5) / fans);
      var ring = new THREE.Mesh(new THREE.CylinderGeometry(fanR, fanR, 0.04, 16), mat(0x111417, { metal:0.4 }));
      ring.rotation.x = Math.PI/2;
      ring.position.set(fx, 0, D + 0.04); g.add(ring);
      var hub = new THREE.Mesh(new THREE.CylinderGeometry(fanR*0.25, fanR*0.25, 0.05, 10), mat(0x333333, { metal:0.5 }));
      hub.rotation.x = Math.PI/2;
      hub.position.set(fx, 0, D + 0.05); g.add(hub);
    }
    var fingers = new THREE.Mesh(new THREE.BoxGeometry(L * 0.55, 0.04, 0.01), mat(0xc9a227, { metal:0.85 }));
    fingers.position.set(-L*0.15, -H/2 - 0.02, 0.005); g.add(fingers);
    if(fans >= 2){
      var pwr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.08), mat(0x111111, { metal:0.3 }));
      pwr.position.set(L/2 - 0.1, H/2 - 0.05, D*0.5); g.add(pwr);
    }
    if(fans >= 3){
      var pwr2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.08), mat(0x111111, { metal:0.3 }));
      pwr2.position.set(L/2 - 0.25, H/2 - 0.05, D*0.5); g.add(pwr2);
    }
  }

  function buildGpuDetailed(){
    var id = "";
    try {
      if(window.Parts3D && Parts3D.pickInfo) id = (Parts3D.pickInfo("gpu").id || "");
      if(!id && Parts3D._forceId && Parts3D._forceId.gpu) id = Parts3D._forceId.gpu;
      console.log("[HASHPOOL GPU]", id);
    } catch(e){}
    var g = new THREE.Group();

    if(id === "gpu-1"){
      card(g, 0.85, 0.18, 0.22, 0x3a4048, 0x76b900, 1, false);
    } else if(id === "gpu-2"){
      card(g, 0.95, 0.19, 0.24, 0x3a2828, 0xed1c24, 1, false);
    } else if(id === "gpu-3"){
      card(g, 1.10, 0.20, 0.26, 0x2a3038, 0x76b900, 1, false);
    } else if(id === "gpu-4"){
      card(g, 1.25, 0.24, 0.30, 0x2a1c1c, 0xed1c24, 2, false);
    } else if(id === "gpu-5"){
      card(g, 1.40, 0.28, 0.34, 0x1e2830, 0x76b900, 2, false);
    } else if(id === "gpu-6"){
      card(g, 1.50, 0.30, 0.36, 0x1a1212, 0xed1c24, 2, true);
    } else if(id === "gpu-7"){
      card(g, 1.65, 0.34, 0.40, 0x141c24, 0x76b900, 3, true);
    } else if(id === "gpu-8"){
      card(g, 1.75, 0.36, 0.42, 0x120c0c, 0xed1c24, 3, true);
    } else if(id === "gpu-9"){
      card(g, 1.90, 0.40, 0.46, 0x0e141c, 0x9acd32, 3, true);
    } else if(id === "gpu-10"){
      card(g, 2.10, 0.46, 0.52, 0x0a1018, 0x9acd32, 3, true);
      var gold = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.02, 0.54), mat(0xc9a227, { metal:0.9 }));
      gold.position.set(0, 0.24, 0.02); g.add(gold);
    } else {
      card(g, 1.10, 0.20, 0.26, 0x2a3038, 0x76b900, 1, false);
    }
    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildGpu = buildGpuDetailed;
})();
