/* parts3d/psu.js — 80+ badge color and fan size by tier */
(function(){
  function buildPsuDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("psu") : {tier:3,brand:""};
    var tier = info.tier||3;
    var g = new THREE.Group();
    var box = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.95, 1.15), mat(0x2a2e34, {metal:0.55, rough:0.35}));
    g.add(box);
    var label = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.01), mat(0x1a1d22, {rough:0.6}));
    label.position.set(0, 0.2, 0.58); g.add(label);
    var badgeCol = tier>=9?0xe5e4e2: tier>=7?0xffd700: tier>=4?0xc0c0c0: 0xcd7f32;
    var badge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.012), mat(badgeCol,{metal:0.7,rough:0.25}));
    badge.position.set(0.15, 0.35, 0.58); g.add(badge);
    var fanR = 0.18 + tier*0.008;
    var grille = new THREE.Mesh(new THREE.CylinderGeometry(fanR, fanR, 0.02, 20), mat(0x111111));
    grille.rotation.x = Math.PI/2; grille.position.z = 0.58; g.add(grille);
    for(var i=0;i<7;i++){
      var blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, fanR*0.9, 0.008), mat(0x444444));
      blade.position.z = 0.58; blade.rotation.z = (i/7)*Math.PI*2; g.add(blade);
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildPsu = buildPsuDetailed;
})();
