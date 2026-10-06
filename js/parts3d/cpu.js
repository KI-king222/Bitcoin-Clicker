/* parts3d/cpu.js — mesh keyed by part id (cpu-1 … cpu-10), not tier alone */
(function(){
  /* Visual profile per catalog id — stable if new SKUs are added later */
  var DESIGNS = {
    "cpu-1":  { family:"axiom", size:0.30, ihs:0.18, caps:4, dualDie:false, label:false, metal:0.55, sub:0x0a2a12, ihsCol:0xb8bcc0, logo:0x3a7abd },
    "cpu-2":  { family:"ember", size:0.32, ihs:0.19, caps:4, dualDie:false, label:false, metal:0.55, sub:0x1a2a0a, ihsCol:0xc0c0c0, logo:0xc62828 },
    "cpu-3":  { family:"axiom", size:0.34, ihs:0.20, caps:6, dualDie:false, label:false, metal:0.65, sub:0x0a2a12, ihsCol:0xc8ccd0, logo:0x1565c0 },
    "cpu-4":  { family:"ember", size:0.36, ihs:0.22, caps:6, dualDie:false, label:true,  metal:0.70, sub:0x1a300a, ihsCol:0xc8c8c8, logo:0xe53935 },
    "cpu-5":  { family:"axiom", size:0.38, ihs:0.24, caps:8, dualDie:false, label:true,  metal:0.75, sub:0x0c2818, ihsCol:0xd0d4d8, logo:0x0277bd },
    "cpu-6":  { family:"ember", size:0.40, ihs:0.25, caps:8, dualDie:false, label:true,  metal:0.78, sub:0x1a3d0a, ihsCol:0xc8c8c8, logo:0xed1c24 },
    "cpu-7":  { family:"axiom", size:0.42, ihs:0.27, caps:8, dualDie:false, label:true,  metal:0.82, sub:0x0a2a12, ihsCol:0xd4d8dc, logo:0x01579b },
    "cpu-8":  { family:"ember", size:0.44, ihs:0.28, caps:8, dualDie:true,  label:true,  metal:0.85, sub:0x1a3d0a, ihsCol:0xc8c8c8, logo:0xed1c24 },
    "cpu-9":  { family:"axiom", size:0.46, ihs:0.30, caps:8, dualDie:true,  label:true,  metal:0.88, sub:0x0a2a12, ihsCol:0xd8dce0, logo:0x0277bd },
    "cpu-10": { family:"ember", size:0.48, ihs:0.32, caps:8, dualDie:true,  label:true,  metal:0.90, sub:0x1a3d0a, ihsCol:0xc8c8c8, logo:0xed1c24 }
  };
  var FALLBACK = DESIGNS["cpu-3"];

  function buildCpuDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("cpu") : {id:"",tier:3,brand:""};
    var d = DESIGNS[info.id] || FALLBACK;
    var g = new THREE.Group();
    var size = d.size;
    var sub = new THREE.Mesh(new THREE.BoxGeometry(size, size, 0.018), mat(d.sub, {rough:0.65}));
    sub.position.z = 0.009; g.add(sub);
    var nCap = d.caps||8;
    for(var i=0;i<nCap;i++){
      var ang = (i/nCap)*Math.PI*2;
      var r = size*0.38;
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.02,6), mat(0x111111,{rough:0.4}));
      cap.rotation.x = Math.PI/2;
      cap.position.set(Math.cos(ang)*r, Math.sin(ang)*r, 0.02);
      g.add(cap);
    }
    var corner = size*0.42;
    [[-corner,-corner],[corner,-corner],[-corner,corner],[corner,corner]].forEach(function(c){
      var n = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), mat(0x080a0c));
      n.position.set(c[0], c[1], 0.01); g.add(n);
    });
    var ihsSize = d.ihs;
    var ihs = new THREE.Mesh(new THREE.BoxGeometry(ihsSize, ihsSize, 0.05), mat(d.ihsCol, {metal:d.metal, rough:0.15}));
    ihs.position.z = 0.04; g.add(ihs);
    var logo = new THREE.Mesh(new THREE.BoxGeometry(ihsSize*0.55, ihsSize*0.2, 0.004), mat(d.logo, {metal:0.3, rough:0.4}));
    logo.position.z = 0.068; g.add(logo);
    if(d.label){
      var strip = new THREE.Mesh(new THREE.BoxGeometry(ihsSize*0.7, 0.03, 0.003), mat(0x333333,{rough:0.5}));
      strip.position.set(0, -ihsSize*0.3, 0.068); g.add(strip);
    }
    if(d.dualDie){
      var die2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.006), mat(0x222222,{rough:0.3}));
      die2.position.set(ihsSize*0.28, ihsSize*0.28, 0.07); g.add(die2);
      var die3 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.005), mat(0x2a2a2a,{rough:0.3}));
      die3.position.set(-ihsSize*0.22, -ihsSize*0.18, 0.068); g.add(die3);
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildCpu = buildCpuDetailed;
  window.Parts3D.CPU_DESIGNS = DESIGNS;
})();
