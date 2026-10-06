/* parts3d/cpu.js — dramatic per-id meshes (Axiom≈Intel blue, Ember≈AMD red) */
(function(){
  var DESIGNS = {
    "cpu-1":  { family:"axiom", pcb:0.36, ihs:0.20, ihsH:0.04, caps:4, dualDie:false, label:false, pins:false, metal:0.45, sub:0x0d3a18, ihsCol:0xa8acb0, logo:0x4a90c8, bevel:false },
    "cpu-2":  { family:"ember", pcb:0.38, ihs:0.22, ihsH:0.042, caps:4, dualDie:false, label:false, pins:false, metal:0.50, sub:0x1a3a0c, ihsCol:0xb0b0b0, logo:0xc62828, bevel:false },
    "cpu-3":  { family:"axiom", pcb:0.42, ihs:0.26, ihsH:0.048, caps:6, dualDie:false, label:true,  pins:false, metal:0.60, sub:0x0a2a14, ihsCol:0xc4c8cc, logo:0x1565c0, bevel:false },
    "cpu-4":  { family:"ember", pcb:0.46, ihs:0.30, ihsH:0.052, caps:8, dualDie:false, label:true,  pins:true,  metal:0.70, sub:0x1a3d0a, ihsCol:0xc8c8c8, logo:0xed1c24, bevel:true },
    "cpu-5":  { family:"axiom", pcb:0.50, ihs:0.34, ihsH:0.055, caps:8, dualDie:false, label:true,  pins:true,  metal:0.78, sub:0x0a2812, ihsCol:0xd0d4d8, logo:0x0277bd, bevel:true },
    "cpu-6":  { family:"ember", pcb:0.54, ihs:0.36, ihsH:0.058, caps:8, dualDie:true,  label:true,  pins:true,  metal:0.82, sub:0x1a400a, ihsCol:0xcacaca, logo:0xff1744, bevel:true },
    "cpu-7":  { family:"axiom", pcb:0.58, ihs:0.40, ihsH:0.062, caps:10, dualDie:true, label:true,  pins:true,  metal:0.88, sub:0x082010, ihsCol:0xd8dce0, logo:0x01579b, bevel:true },
    "cpu-8":  { family:"ember", pcb:0.62, ihs:0.44, ihsH:0.066, caps:12, dualDie:true, label:true,  pins:true,  metal:0.92, sub:0x1a4508, ihsCol:0xd0d0d0, logo:0xed1c24, bevel:true },
    "cpu-9":  { family:"axiom", pcb:0.66, ihs:0.48, ihsH:0.070, caps:12, dualDie:true, label:true,  pins:true,  metal:0.95, sub:0x061a0c, ihsCol:0xe0e4e8, logo:0x0277bd, bevel:true },
    "cpu-10": { family:"ember", pcb:0.70, ihs:0.52, ihsH:0.075, caps:12, dualDie:true, label:true,  pins:true,  metal:0.98, sub:0x1a4a08, ihsCol:0xd8d8d8, logo:0xff1744, bevel:true }
  };
  var FALLBACK = DESIGNS["cpu-3"];

  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.5:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }

  function buildCpuDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("cpu") : {id:"",tier:3};
    var d = DESIGNS[info.id] || FALLBACK;
    var g = new THREE.Group();
    var pcb = d.pcb;
    var sub = new THREE.Mesh(new THREE.BoxGeometry(pcb, pcb, 0.02), mat(d.sub, {rough:0.7}));
    sub.position.z = 0.01; g.add(sub);
    var nCap = d.caps||6;
    for(var i=0;i<nCap;i++){
      var ang = (i/nCap)*Math.PI*2;
      var r = pcb*0.38;
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.014,0.014,0.022,6), mat(0x111111,{rough:0.4}));
      cap.rotation.x = Math.PI/2;
      cap.position.set(Math.cos(ang)*r, Math.sin(ang)*r, 0.022);
      g.add(cap);
    }
    var corner = pcb*0.42;
    [[-corner,-corner],[corner,-corner],[-corner,corner],[corner,corner]].forEach(function(c){
      var n = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.022), mat(0x080a0c));
      n.position.set(c[0], c[1], 0.012); g.add(n);
    });
    var ihs = new THREE.Mesh(new THREE.BoxGeometry(d.ihs, d.ihs, d.ihsH), mat(d.ihsCol, {metal:d.metal, rough:0.12}));
    ihs.position.z = 0.02 + d.ihsH*0.5; g.add(ihs);
    if(d.bevel){
      var rim = new THREE.Mesh(new THREE.BoxGeometry(d.ihs*1.04, d.ihs*1.04, 0.008), mat(0x888890, {metal:0.7, rough:0.25}));
      rim.position.z = 0.02; g.add(rim);
    }
    var logo = new THREE.Mesh(new THREE.BoxGeometry(d.ihs*0.55, d.ihs*0.18, 0.006), mat(d.logo, {metal:0.25, rough:0.35}));
    logo.position.z = 0.02 + d.ihsH + 0.004; g.add(logo);
    if(d.label){
      var strip = new THREE.Mesh(new THREE.BoxGeometry(d.ihs*0.75, d.ihs*0.08, 0.004), mat(0x2a2a2e,{rough:0.5}));
      strip.position.set(0, -d.ihs*0.32, 0.02 + d.ihsH + 0.003); g.add(strip);
    }
    if(d.dualDie){
      var die2 = new THREE.Mesh(new THREE.BoxGeometry(d.ihs*0.22, d.ihs*0.22, 0.008), mat(0x1a1a1a,{rough:0.3}));
      die2.position.set(d.ihs*0.28, d.ihs*0.28, 0.02 + d.ihsH + 0.006); g.add(die2);
      var die3 = new THREE.Mesh(new THREE.BoxGeometry(d.ihs*0.16, d.ihs*0.16, 0.006), mat(0x222228,{rough:0.3}));
      die3.position.set(-d.ihs*0.24, -d.ihs*0.20, 0.02 + d.ihsH + 0.005); g.add(die3);
    }
    if(d.pins){
      for(var px=-2;px<=2;px++) for(var py=-2;py<=2;py++){
        if(Math.abs(px)+Math.abs(py)>3) continue;
        var pin = new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.012,4), mat(0xC0A060,{metal:0.9,rough:0.2}));
        pin.position.set(px*0.06, py*0.06, -0.004); g.add(pin);
      }
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildCpu = buildCpuDetailed;
  window.Parts3D.CPU_DESIGNS = DESIGNS;
})();
