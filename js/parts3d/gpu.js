/* parts3d/gpu.js — high-detail if/else by id gpu-1..gpu-10 */
(function(){
  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.45:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }
  function glow(c,i){
    return new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:i||1.1, roughness:0.35, metalness:0.1 });
  }

  function fan(g, x, y, z, r){
    var ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 24), mat(0x12151a, { rough:0.4, metal:0.35 }));
    ring.rotation.x = Math.PI/2; ring.position.set(x,y,z); g.add(ring);
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(r*0.22, r*0.22, 0.03, 12), mat(0xc8c8c8, { metal:0.75, rough:0.2 }));
    hub.position.set(x,y,z); g.add(hub);
    for(var b=0;b<11;b++){
      var blade = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.006, r*0.85), mat(0x0e1014, { rough:0.5 }));
      blade.position.set(x, y, z);
      blade.rotation.y = (b/11)*Math.PI*2;
      g.add(blade);
    }
  }

  function card(g, L, H, D, shroud, accent, fans, rgb, backplate, dualPwr){
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(L, 0.11, 0.025), mat(0x0a3d1a, { rough:0.55 }));
    pcb.position.set(0, 0, 0.015); g.add(pcb);
    for(var i=0;i<18;i++){
      var finger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.008), mat(0xd4a017, { metal:0.92, rough:0.15 }));
      finger.position.set(-L*0.4 + i*0.05, -H*0.15, 0.004); g.add(finger);
    }
    if(backplate){
      var bp = new THREE.Mesh(new THREE.BoxGeometry(L*0.96, H*0.92, 0.02), mat(0x1a1e24, { metal:0.55, rough:0.28 }));
      bp.position.set(0, 0.02, D*0.95); g.add(bp);
      var bpLogo = new THREE.Mesh(new THREE.BoxGeometry(L*0.25, 0.04, 0.01), mat(accent, { metal:0.4 }));
      bpLogo.position.set(0, 0.05, D*0.97); g.add(bpLogo);
    }
    var body = new THREE.Mesh(new THREE.BoxGeometry(L*0.94, H, D*0.7), mat(shroud, { metal:0.28, rough:0.32 }));
    body.position.set(0.02, 0.04, D*0.42); g.add(body);
    var strip = new THREE.Mesh(new THREE.BoxGeometry(L*0.88, 0.022, 0.02), mat(accent, { metal:0.45, rough:0.25 }));
    strip.position.set(0.02, H*0.42, D*0.72); g.add(strip);
    if(rgb){
      var rgbM = new THREE.Mesh(new THREE.BoxGeometry(L*0.75, 0.018, 0.016), glow(0x66ccff, 1.3));
      rgbM.position.set(0.02, -H*0.35, D*0.74); g.add(rgbM);
      var rgb2 = new THREE.Mesh(new THREE.BoxGeometry(L*0.4, 0.012, 0.012), glow(accent, 1.0));
      rgb2.position.set(0.02, H*0.08, D*0.76); g.add(rgb2);
    }
    var fanR = fans===1 ? 0.11 : (fans===2 ? 0.105 : 0.10);
    for(var f=0;f<fans;f++){
      var fx = 0;
      if(fans===2) fx = -0.26 + f*0.52;
      if(fans===3) fx = -0.38 + f*0.38;
      if(fans===1) fx = 0.05;
      fan(g, fx, H*0.38, D*0.48, fanR);
    }
    var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, H+0.1, D*0.5), mat(0x777777, { metal:0.7, rough:0.25 }));
    bracket.position.set(-L*0.48, 0.03, D*0.3); g.add(bracket);
    for(var p=0;p<3;p++){
      var port = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.06), mat(0x0a0c0e));
      port.position.set(-L*0.51, -0.05+p*0.08, D*0.15); g.add(port);
    }
    for(var pw=0; pw<dualPwr; pw++){
      var pwr = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.06), mat(0x1a1a1a, { metal:0.2 }));
      pwr.position.set(L*0.25 + pw*0.13, H*0.25, D*0.85); g.add(pwr);
      var pins = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.02), mat(0xc9a227, { metal:0.8 }));
      pins.position.set(L*0.25 + pw*0.13, H*0.25, D*0.89); g.add(pins);
    }
    for(var v=0; v<6; v++){
      var fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.12), mat(0x8a9098, { metal:0.6, rough:0.3 }));
      fin.position.set(L*0.3, -H*0.15 + v*0.04, D*0.7); g.add(fin);
    }
  }

  function buildGpuDetailed(){
    var id = "";
    try {
      if(window.Parts3D && Parts3D.pickInfo) id = (Parts3D.pickInfo("gpu").id || "");
      if(!id && Parts3D._forceId && Parts3D._forceId.gpu) id = Parts3D._forceId.gpu;
    } catch(e){}
    var g = new THREE.Group();
    var n = parseInt((id.split("-")[1]||"3"), 10) || 3;
    var isGreen = (n % 2 === 1);
    var accent = isGreen ? 0x76b900 : 0xed1c24;
    var shroud = isGreen ? 0x1e2830 : 0x1a1212;
    var L = 0.75 + n * 0.13;
    var H = 0.16 + n * 0.028;
    var D = 0.20 + n * 0.032;
    var fans = n <= 3 ? 1 : (n <= 6 ? 2 : 3);
    var rgb = n >= 6;
    var bp = n >= 4;
    var pwr = n <= 3 ? 0 : (n <= 6 ? 1 : 2);

    if(id === "gpu-10"){
      L = 2.05; H = 0.45; D = 0.55; fans = 3; rgb = true; bp = true; pwr = 2; accent = 0x9acd32; shroud = 0x0a1018;
    }
    card(g, L, H, D, shroud, accent, fans, rgb, bp, pwr);
    if(n >= 10){
      var gold = new THREE.Mesh(new THREE.BoxGeometry(L+0.04, 0.02, D*0.9), mat(0xc9a227, { metal:0.9, rough:0.2 }));
      gold.position.set(0, H*0.5, D*0.4); g.add(gold);
    }
    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildGpu = buildGpuDetailed;
})();
