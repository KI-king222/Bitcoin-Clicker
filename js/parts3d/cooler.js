/* parts3d/cooler.js — air tower vs AIO by tier */
(function(){
  function buildCoolerDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("cooler") : {tier:3,brand:""};
    var tier = info.tier||3;
    var g = new THREE.Group();
    var basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.035), mat(0xb87333, {metal:0.75, rough:0.3}));
    basePlate.position.z = 0.018; g.add(basePlate);
    if(tier >= 7){
      var pump = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.12,16), mat(0x1a1a1a,{rough:0.4}));
      pump.position.z = 0.1; g.add(pump);
      var logo = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.02,16), mat(0x333338,{metal:0.5,rough:0.3}));
      logo.position.z = 0.17; g.add(logo);
      for(var t=0;t<2;t++){
        var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.4,8), mat(0x222222));
        tube.position.set(-0.08+t*0.16, 0.25, 0.15); tube.rotation.x = 0.6; g.add(tube);
      }
    } else {
      var pipes = tier>=4 ? 4 : 2;
      for(var h=0;h<pipes;h++){
        var pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28+tier*0.02, 8), mat(0xc0a060, {metal:0.8, rough:0.25}));
        pipe.position.set(-0.1 + h*0.07, 0, 0.18); g.add(pipe);
      }
      var fins = 6 + tier;
      for(var f=0;f<fins;f++){
        var fin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.28), mat(0xa0a0a8,{metal:0.6,rough:0.3}));
        fin.position.set(0, -0.12 + f*0.04, 0.28); g.add(fin);
      }
      var fan = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.36), mat(0x1a1a1a));
      fan.position.set(0, 0.2, 0.28); g.add(fan);
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildCooler = buildCoolerDetailed;
})();
