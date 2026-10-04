/* parts3d/gpu.js — length X, slot height Y, thickness +Z; fans face +Y */
(function(){
  function buildGpuDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("gpu") : {tier:3,brand:""};
    var tier = info.tier||3;
    var brand = (info.brand||"").toLowerCase();
    var isNvidia = brand.indexOf("nvidia")>=0 || brand.indexOf("rtx")>=0 || brand.indexOf("gtx")>=0;
    var accent = isNvidia ? 0x76b900 : 0xed1c24;
    var g = new THREE.Group();
    var length = 1.10 + tier*0.035;
    var height = 0.22 + (tier>=7 ? 0.08 : 0.02);
    var depth = 0.32 + tier*0.012;
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(length, 0.11, 0.03), mat(0x0a3d1a, {rough:0.5}));
    pcb.position.set(0, 0, 0.02); g.add(pcb);
    for(var i=0;i<14;i++){
      var finger = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.008), mat(0xd4a017, {metal:0.9, rough:0.2}));
      finger.position.set(-length*0.4 + i*0.06, -0.02, 0.004); g.add(finger);
    }
    var back = new THREE.Mesh(new THREE.BoxGeometry(length*0.95, height*0.9, 0.02), mat(0x1a1e24, {metal:0.5, rough:0.35}));
    back.position.set(0, 0, depth*0.95); g.add(back);
    var shroud = new THREE.Mesh(new THREE.BoxGeometry(length*0.92, height, depth*0.7), mat(0x2a2e34, {rough:0.35, metal:0.25}));
    shroud.position.set(0.02, 0.02, depth*0.45); g.add(shroud);
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(length*0.85, 0.02, 0.02), mat(accent, {metal:0.4, rough:0.3}));
    stripe.position.set(0.02, height*0.45, depth*0.7); g.add(stripe);
    var fans = tier <= 3 ? 1 : (tier <= 7 ? 2 : 3);
    var fanR = 0.09 + tier*0.003;
    for(var f=0;f<fans;f++){
      var fx = 0;
      if(fans===2) fx = -0.22 + f*0.44;
      if(fans===3) fx = -0.32 + f*0.32;
      var fanG = new THREE.Group();
      fanG.position.set(fx, height*0.42, depth*0.45);
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
    if(tier >= 5){
      var pwr = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), mat(0x222222));
      pwr.position.set(length*0.3, height*0.2, depth*0.85); g.add(pwr);
    }
    if(tier >= 8){
      var pwr2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), mat(0x222222));
      pwr2.position.set(length*0.4, height*0.2, depth*0.85); g.add(pwr2);
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildGpu = buildGpuDetailed;
})();
