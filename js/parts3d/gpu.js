/* parts3d/gpu.js — mesh keyed by part id (gpu-1 … gpu-10), not tier alone */
(function(){
  /* Visual profile per catalog id — stable if new SKUs are added later */
  var DESIGNS = {
    "gpu-1":  { fans:1, length:1.05, height:0.20, depth:0.30, accent:0x76b900, shroud:0x2a2e34, dualPwr:false, rgb:false, thick:false },
    "gpu-2":  { fans:1, length:1.10, height:0.22, depth:0.32, accent:0xed1c24, shroud:0x2a2020, dualPwr:false, rgb:false, thick:false },
    "gpu-3":  { fans:1, length:1.18, height:0.24, depth:0.34, accent:0x76b900, shroud:0x252a30, dualPwr:false, rgb:false, thick:false },
    "gpu-4":  { fans:2, length:1.25, height:0.26, depth:0.36, accent:0xed1c24, shroud:0x2a1e1e, dualPwr:false, rgb:false, thick:false },
    "gpu-5":  { fans:2, length:1.32, height:0.28, depth:0.38, accent:0x76b900, shroud:0x222830, dualPwr:true,  rgb:false, thick:false },
    "gpu-6":  { fans:2, length:1.38, height:0.30, depth:0.40, accent:0xed1c24, shroud:0x281818, dualPwr:true,  rgb:true,  thick:false },
    "gpu-7":  { fans:3, length:1.45, height:0.32, depth:0.42, accent:0x76b900, shroud:0x1a222a, dualPwr:true,  rgb:true,  thick:true  },
    "gpu-8":  { fans:3, length:1.52, height:0.34, depth:0.44, accent:0xed1c24, shroud:0x1a1212, dualPwr:true,  rgb:true,  thick:true  },
    "gpu-9":  { fans:3, length:1.58, height:0.36, depth:0.46, accent:0x76b900, shroud:0x121820, dualPwr:true,  rgb:true,  thick:true  },
    "gpu-10": { fans:3, length:1.68, height:0.40, depth:0.50, accent:0x76b900, shroud:0x0e141c, dualPwr:true,  rgb:true,  thick:true  }
  };
  var FALLBACK = DESIGNS["gpu-3"];

  function buildGpuDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("gpu") : {id:"",tier:3,brand:""};
    var d = DESIGNS[info.id] || FALLBACK;
    var g = new THREE.Group();
    var length = d.length, height = d.height, depth = d.depth;
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(length, 0.11, 0.03), mat(0x0a3d1a, {rough:0.5}));
    pcb.position.set(0, 0, 0.02); g.add(pcb);
    for(var i=0;i<14;i++){
      var finger = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.008), mat(0xd4a017, {metal:0.9, rough:0.2}));
      finger.position.set(-length*0.4 + i*0.06, -0.02, 0.004); g.add(finger);
    }
    var back = new THREE.Mesh(new THREE.BoxGeometry(length*0.95, height*0.9, 0.02), mat(0x1a1e24, {metal:0.5, rough:0.35}));
    back.position.set(0, 0, depth*0.95); g.add(back);
    var shroudH = d.thick ? height*1.15 : height;
    var shroud = new THREE.Mesh(new THREE.BoxGeometry(length*0.92, shroudH, depth*0.7), mat(d.shroud, {rough:0.35, metal:0.25}));
    shroud.position.set(0.02, 0.02, depth*0.45); g.add(shroud);
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(length*0.85, 0.02, 0.02), mat(d.accent, {metal:0.4, rough:0.3}));
    stripe.position.set(0.02, shroudH*0.45, depth*0.7); g.add(stripe);
    if(d.rgb){
      var rgb = new THREE.Mesh(new THREE.BoxGeometry(length*0.7, 0.015, 0.015), mat(0x66ccff, {metal:0.2, rough:0.4}));
      rgb.position.set(0.02, -shroudH*0.35, depth*0.72); g.add(rgb);
    }
    var fans = d.fans||1;
    var fanR = 0.09 + fans*0.008;
    for(var f=0;f<fans;f++){
      var fx = 0;
      if(fans===2) fx = -0.22 + f*0.44;
      if(fans===3) fx = -0.32 + f*0.32;
      var fanG = new THREE.Group();
      fanG.position.set(fx, shroudH*0.42, depth*0.45);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(fanR, 0.012, 8, 18), mat(0x1a1d22, {rough:0.4}));
      ring.rotation.x = Math.PI/2;
      fanG.add(ring);
      var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.02,10), mat(0xc0c0c0,{metal:0.65}));
      fanG.add(hub);
      for(var b=0;b<7;b++){
        var blade = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.008, fanR*0.85), mat(0x12151a));
        blade.rotation.y = (b/7)*Math.PI*2;
        fanG.add(blade);
      }
      g.add(fanG);
    }
    var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, height+0.06, depth*0.55), mat(0x555555,{metal:0.6,rough:0.3}));
    bracket.position.set(-length*0.48, 0, depth*0.35); g.add(bracket);
    if(d.dualPwr){
      var pwr = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), mat(0x222222));
      pwr.position.set(length*0.3, height*0.2, depth*0.85); g.add(pwr);
      var pwr2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), mat(0x222222));
      pwr2.position.set(length*0.42, height*0.2, depth*0.85); g.add(pwr2);
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildGpu = buildGpuDetailed;
  window.Parts3D.GPU_DESIGNS = DESIGNS;
})();
