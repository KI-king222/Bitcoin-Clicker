/* parts3d/gpu.js — dramatic per-id meshes (Quanta≈NVIDIA green, Ember≈AMD red) */
(function(){
  var DESIGNS = {
    "gpu-1":  { fans:1, L:0.85, H:0.18, D:0.28, accent:0x76b900, shroud:0x3a4048, dualPwr:0, rgb:false, thick:false, vents:2, backplate:false },
    "gpu-2":  { fans:1, L:0.95, H:0.20, D:0.30, accent:0xed1c24, shroud:0x3a2828, dualPwr:0, rgb:false, thick:false, vents:2, backplate:false },
    "gpu-3":  { fans:1, L:1.10, H:0.22, D:0.34, accent:0x76b900, shroud:0x2a3038, dualPwr:0, rgb:false, thick:false, vents:3, backplate:false },
    "gpu-4":  { fans:2, L:1.25, H:0.26, D:0.38, accent:0xed1c24, shroud:0x2a1c1c, dualPwr:1, rgb:false, thick:false, vents:4, backplate:true },
    "gpu-5":  { fans:2, L:1.40, H:0.30, D:0.42, accent:0x76b900, shroud:0x1e2830, dualPwr:1, rgb:false, thick:true,  vents:5, backplate:true },
    "gpu-6":  { fans:2, L:1.50, H:0.32, D:0.44, accent:0xed1c24, shroud:0x1a1212, dualPwr:1, rgb:true,  thick:true,  vents:5, backplate:true },
    "gpu-7":  { fans:3, L:1.65, H:0.36, D:0.48, accent:0x76b900, shroud:0x141c24, dualPwr:2, rgb:true,  thick:true,  vents:6, backplate:true },
    "gpu-8":  { fans:3, L:1.75, H:0.38, D:0.50, accent:0xed1c24, shroud:0x120c0c, dualPwr:2, rgb:true,  thick:true,  vents:6, backplate:true },
    "gpu-9":  { fans:3, L:1.90, H:0.42, D:0.54, accent:0x76b900, shroud:0x0e141c, dualPwr:2, rgb:true,  thick:true,  vents:7, backplate:true },
    "gpu-10": { fans:3, L:2.10, H:0.48, D:0.60, accent:0x9acd32, shroud:0x0a1018, dualPwr:2, rgb:true,  thick:true,  vents:8, backplate:true }
  };
  var FALLBACK = DESIGNS["gpu-3"];

  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.5:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }

  function buildGpuDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("gpu") : {id:""};
    var d = DESIGNS[info.id] || FALLBACK;
    var g = new THREE.Group();
    var L = d.L, H = d.H, D = d.D;
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(L, 0.12, 0.028), mat(0x0a3d1a, {rough:0.55}));
    pcb.position.set(0, 0, 0.018); g.add(pcb);
    for(var i=0;i<16;i++){
      var finger = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.09, 0.008), mat(0xd4a017, {metal:0.92, rough:0.18}));
      finger.position.set(-L*0.42 + i*0.055, -0.02, 0.004); g.add(finger);
    }
    if(d.backplate){
      var bp = new THREE.Mesh(new THREE.BoxGeometry(L*0.96, H*0.95, 0.018), mat(0x1a1e24, {metal:0.55, rough:0.3}));
      bp.position.set(0, 0.01, D*0.98); g.add(bp);
    }
    var sH = d.thick ? H*1.25 : H;
    var shroud = new THREE.Mesh(new THREE.BoxGeometry(L*0.92, sH, D*0.72), mat(d.shroud, {rough:0.32, metal:0.28}));
    shroud.position.set(0.02, 0.03, D*0.48); g.add(shroud);
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(L*0.88, 0.025, 0.022), mat(d.accent, {metal:0.45, rough:0.25}));
    stripe.position.set(0.02, sH*0.48, D*0.72); g.add(stripe);
    if(d.rgb){
      var rgb = new THREE.Mesh(new THREE.BoxGeometry(L*0.75, 0.018, 0.018), mat(0x66ccff, {metal:0.15, rough:0.4}));
      rgb.position.set(0.02, -sH*0.38, D*0.74); g.add(rgb);
      var rgb2 = new THREE.Mesh(new THREE.BoxGeometry(L*0.5, 0.012, 0.012), mat(d.accent, {metal:0.2, rough:0.35}));
      rgb2.position.set(0.02, sH*0.1, D*0.78); g.add(rgb2);
    }
    var fans = d.fans||1;
    var fanR = fans===1 ? 0.10 : (fans===2 ? 0.11 : 0.105);
    for(var f=0;f<fans;f++){
      var fx = 0;
      if(fans===2) fx = -0.28 + f*0.56;
      if(fans===3) fx = -0.40 + f*0.40;
      var fanG = new THREE.Group();
      fanG.position.set(fx, sH*0.42, D*0.48);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(fanR, 0.014, 8, 20), mat(0x12151a, {rough:0.4}));
      ring.rotation.x = Math.PI/2; fanG.add(ring);
      var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.028,0.022,10), mat(0xc8c8c8,{metal:0.7,rough:0.25}));
      fanG.add(hub);
      for(var b=0;b<9;b++){
        var blade = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.008, fanR*0.9), mat(0x0e1014));
        blade.rotation.y = (b/9)*Math.PI*2;
        fanG.add(blade);
      }
      g.add(fanG);
    }
    var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.045, H+0.08, D*0.55), mat(0x666666,{metal:0.65,rough:0.28}));
    bracket.position.set(-L*0.48, 0.02, D*0.35); g.add(bracket);
    for(var p=0;p<(d.dualPwr||0);p++){
      var pwr = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.055), mat(0x1a1a1a));
      pwr.position.set(L*0.28 + p*0.12, H*0.22, D*0.88); g.add(pwr);
    }
    for(var v=0;v<(d.vents||2);v++){
      var vent = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.08), mat(0x0a0a0c));
      vent.position.set(L*0.35, -sH*0.2 + v*0.04, D*0.85); g.add(vent);
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildGpu = buildGpuDetailed;
  window.Parts3D.GPU_DESIGNS = DESIGNS;
})();
