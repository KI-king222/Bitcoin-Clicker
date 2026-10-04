/* parts3d/cpu.js — detailed CPU by tier (Intel/AMD inspired) */
(function(){
  function buildCpuDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("cpu") : {tier:3,brand:""};
    var tier = info.tier||3;
    var brand = (info.brand||"").toLowerCase();
    var isAmd = brand.indexOf("amd")>=0 || brand.indexOf("ryzen")>=0;
    var g = new THREE.Group();
    var subCol = isAmd ? 0x1a3d0a : 0x0a2a12;
    var sub = new THREE.Mesh(new THREE.BoxGeometry(0.44 + tier*0.008, 0.44 + tier*0.008, 0.018), mat(subCol, {rough:0.65}));
    sub.position.z = 0.009; g.add(sub);
    for(var i=0;i<8;i++){
      var ang = (i/8)*Math.PI*2;
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.02,6), mat(0x111111,{rough:0.4}));
      cap.rotation.x = Math.PI/2;
      cap.position.set(Math.cos(ang)*0.18, Math.sin(ang)*0.18, 0.02);
      g.add(cap);
    }
    [[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]].forEach(function(c){
      var n = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), mat(0x080a0c));
      n.position.set(c[0], c[1], 0.01); g.add(n);
    });
    var ihsSize = 0.28 + tier*0.012;
    var ihsCol = isAmd ? 0xc8c8c8 : 0xd0d4d8;
    var ihs = new THREE.Mesh(new THREE.BoxGeometry(ihsSize, ihsSize, 0.05 + tier*0.002), mat(ihsCol, {metal:0.85, rough:0.15}));
    ihs.position.z = 0.04; g.add(ihs);
    var logo = new THREE.Mesh(new THREE.BoxGeometry(ihsSize*0.55, ihsSize*0.2, 0.004), mat(isAmd ? 0xed1c24 : 0x0071c5, {metal:0.3, rough:0.4}));
    logo.position.z = 0.068; g.add(logo);
    if(tier >= 6){
      var strip = new THREE.Mesh(new THREE.BoxGeometry(ihsSize*0.7, 0.03, 0.003), mat(0x333333,{rough:0.5}));
      strip.position.set(0, -ihsSize*0.3, 0.068); g.add(strip);
    }
    if(tier >= 9){
      var die2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.006), mat(0x222222,{rough:0.3}));
      die2.position.set(0.08, 0.08, 0.07); g.add(die2);
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildCpu = buildCpuDetailed;
})();
