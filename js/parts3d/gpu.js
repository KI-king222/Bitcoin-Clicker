/* parts3d/gpu.js — fan count and length by tier, NVIDIA/AMD accents */
(function(){
  function buildGpuDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("gpu") : {tier:3,brand:""};
    var tier = info.tier||3;
    var brand = (info.brand||"").toLowerCase();
    var isNvidia = brand.indexOf("nvidia")>=0 || brand.indexOf("rtx")>=0 || brand.indexOf("gtx")>=0;
    var accent = isNvidia ? 0x76b900 : 0xed1c24;
    var g = new THREE.Group();
    var length = 1.05 + tier*0.04;
    var height = 0.18 + (tier>=7?0.06:0);
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(length, 0.11, 0.03), mat(0x0a3d1a, {rough:0.5}));
    pcb.position.set(0, 0, 0.02); g.add(pcb);
    for(var i=0;i<12;i++){
      var finger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.008), mat(0xd4a017, {metal:0.9, rough:0.2}));
      finger.position.set(-length*0.35 + i*0.06, 0, 0.002); g.add(finger);
    }
    var back = new THREE.Mesh(new THREE.BoxGeometry(length*0.95, height, 0.02), mat(0x1a1e24, {metal:0.5, rough:0.35}));
    back.position.set(0, 0, 0.05); g.add(back);
    var shroud = new THREE.Mesh(new THREE.BoxGeometry(length*0.92, height*0.95, 0.14 + tier*0.01), mat(0x2a2e34, {rough:0.4}));
    shroud.position.set(0, 0, 0.14); g.add(shroud);
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(length*0.85, 0.02, 0.01), mat(accent, {metal:0.4, rough:0.3}));
    stripe.position.set(0, height*0.35, 0.22); g.add(stripe);
    var fans = tier <= 3 ? 1 : (tier <= 7 ? 2 : 3);
    var fanR = 0.09 + tier*0.004;
    for(var f=0;f<fans;f++){
      var fx = -length*0.28 + f*(length*0.28);
      var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.02,10), mat(0x111111));
      hub.rotation.x = Math.PI/2; hub.position.set(fx, 0, 0.22); g.add(hub);
      var ring = new THREE.Mesh(new THREE.CylinderGeometry(fanR, fanR, 0.01, 16), mat(0x333333,{rough:0.5}));
      ring.rotation.x = Math.PI/2; ring.position.set(fx, 0, 0.215); g.add(ring);
      for(var b=0;b<5;b++){
        var blade = new THREE.Mesh(new THREE.BoxGeometry(0.015, fanR*0.85, 0.004), mat(0x888888,{rough:0.4}));
        blade.position.set(fx, 0, 0.22);
        blade.rotation.z = (b/5)*Math.PI*2;
        g.add(blade);
      }
    }
    var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, height+0.05, 0.2), mat(0x555555,{metal:0.6,rough:0.3}));
    bracket.position.set(-length*0.5, 0, 0.1); g.add(bracket);
    if(tier >= 5){
      var pwr = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), mat(0x222222));
      pwr.position.set(length*0.35, height*0.3, 0.2); g.add(pwr);
    }
    if(tier >= 8){
      var pwr2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.05), mat(0x222222));
      pwr2.position.set(length*0.42, height*0.3, 0.2); g.add(pwr2);
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildGpu = buildGpuDetailed;
})();
