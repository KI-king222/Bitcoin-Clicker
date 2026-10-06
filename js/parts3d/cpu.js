/* parts3d/cpu.js — if/else by part id (cpu-1 … cpu-10). Obvious size/color differences. */
(function(){
  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.45:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }
  function box(sx, sy, sz, color, x, y, z, metal){
    var m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat(color, { metal: metal||0, rough: 0.4 }));
    m.position.set(x||0, y||0, z||0);
    return m;
  }
  function caps(g, r, n, col){
    for(var i=0;i<n;i++){
      var a = (i / n) * Math.PI * 2;
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8), mat(col, { metal:0.3 }));
      c.rotation.x = Math.PI/2;
      c.position.set(Math.cos(a)*r*0.85, Math.sin(a)*r*0.85, 0.02);
      g.add(c);
    }
  }

  function buildCpuDetailed(){
    var id = "";
    try {
      if(window.Parts3D && Parts3D.pickInfo) id = (Parts3D.pickInfo("cpu").id || "");
      if(!id && Parts3D._forceId && Parts3D._forceId.cpu) id = Parts3D._forceId.cpu;
      console.log("[HASHPOOL CPU]", id);
    } catch(e){}
    var g = new THREE.Group();

    if(id === "cpu-1"){
      g.add(box(0.34, 0.34, 0.016, 0x0a2810, 0, 0, 0.008));
      g.add(box(0.18, 0.18, 0.035, 0x9aa0a6, 0, 0, 0.03, 0.4));
    } else if(id === "cpu-2"){
      g.add(box(0.36, 0.36, 0.016, 0x1a3a0c, 0, 0, 0.008));
      g.add(box(0.20, 0.20, 0.038, 0xa8a8a8, 0, 0, 0.032, 0.5));
      g.add(box(0.06, 0.06, 0.01, 0xc62828, 0, 0, 0.055));
    } else if(id === "cpu-3"){
      g.add(box(0.40, 0.40, 0.018, 0x0c3018, 0, 0, 0.009));
      g.add(box(0.24, 0.24, 0.045, 0xb8bcc0, 0, 0, 0.036, 0.55));
      g.add(box(0.08, 0.04, 0.01, 0x1565c0, 0, 0.06, 0.06));
    } else if(id === "cpu-4"){
      g.add(box(0.44, 0.44, 0.018, 0x14380c, 0, 0, 0.009));
      g.add(box(0.28, 0.28, 0.048, 0xc0c0c0, 0, 0, 0.038, 0.65));
      caps(g, 0.18, 4, 0x222222);
      g.add(box(0.08, 0.04, 0.01, 0xed1c24, 0, 0.08, 0.065));
    } else if(id === "cpu-5"){
      g.add(box(0.48, 0.48, 0.02, 0x0a2814, 0, 0, 0.01));
      g.add(box(0.32, 0.32, 0.052, 0xd0d4d8, 0, 0, 0.04, 0.7));
      caps(g, 0.20, 6, 0x1a1a1a);
      g.add(box(0.10, 0.04, 0.012, 0x0277bd, 0, 0.1, 0.07));
    } else if(id === "cpu-6"){
      g.add(box(0.52, 0.52, 0.02, 0x1a400a, 0, 0, 0.01));
      g.add(box(0.16, 0.16, 0.05, 0xc8c8c8, -0.1, 0, 0.04, 0.75));
      g.add(box(0.16, 0.16, 0.05, 0xc8c8c8,  0.1, 0, 0.04, 0.75));
      caps(g, 0.22, 8, 0x111111);
      g.add(box(0.12, 0.04, 0.012, 0xff1744, 0, 0.14, 0.07));
    } else if(id === "cpu-7"){
      g.add(box(0.56, 0.56, 0.022, 0x082010, 0, 0, 0.011));
      g.add(box(0.18, 0.18, 0.055, 0xd4d8dc, -0.11, 0, 0.042, 0.8));
      g.add(box(0.18, 0.18, 0.055, 0xd4d8dc,  0.11, 0, 0.042, 0.8));
      caps(g, 0.24, 10, 0x0a0a0a);
      g.add(box(0.14, 0.05, 0.014, 0x01579b, 0, 0.16, 0.075));
    } else if(id === "cpu-8"){
      g.add(box(0.60, 0.60, 0.022, 0x1a4508, 0, 0, 0.011));
      g.add(box(0.20, 0.20, 0.06, 0xd8d8d8, -0.12, 0, 0.045, 0.85));
      g.add(box(0.20, 0.20, 0.06, 0xd8d8d8,  0.12, 0, 0.045, 0.85));
      caps(g, 0.26, 12, 0x080808);
      g.add(box(0.16, 0.05, 0.014, 0xed1c24, 0, 0.18, 0.08));
      g.add(box(0.62, 0.02, 0.01, 0xc9a227, 0, 0.30, 0.02, 0.9));
    } else if(id === "cpu-9"){
      g.add(box(0.64, 0.64, 0.024, 0x061a0c, 0, 0, 0.012));
      g.add(box(0.22, 0.22, 0.065, 0xe0e4e8, -0.13, 0, 0.048, 0.9));
      g.add(box(0.22, 0.22, 0.065, 0xe0e4e8,  0.13, 0, 0.048, 0.9));
      caps(g, 0.28, 12, 0x050505);
      g.add(box(0.18, 0.05, 0.015, 0x0277bd, 0, 0.20, 0.085));
      g.add(box(0.66, 0.02, 0.01, 0xc9a227, 0, 0.32, 0.02, 0.95));
      g.add(box(0.02, 0.66, 0.01, 0xc9a227, 0.32, 0, 0.02, 0.95));
    } else if(id === "cpu-10"){
      g.add(box(0.70, 0.70, 0.026, 0x1a4a08, 0, 0, 0.013));
      g.add(box(0.24, 0.24, 0.07, 0xf0f0f0, -0.14, 0, 0.05, 0.95));
      g.add(box(0.24, 0.24, 0.07, 0xf0f0f0,  0.14, 0, 0.05, 0.95));
      caps(g, 0.30, 12, 0x020202);
      g.add(box(0.20, 0.06, 0.016, 0xff1744, 0, 0.22, 0.09));
      g.add(box(0.72, 0.03, 0.012, 0xffd700, 0, 0.35, 0.025, 1));
      g.add(box(0.03, 0.72, 0.012, 0xffd700, 0.35, 0, 0.025, 1));
      g.add(box(0.72, 0.03, 0.012, 0xffd700, 0, -0.35, 0.025, 1));
      g.add(box(0.03, 0.72, 0.012, 0xffd700, -0.35, 0, 0.025, 1));
    } else {
      g.add(box(0.42, 0.42, 0.018, 0x0c3018, 0, 0, 0.009));
      g.add(box(0.26, 0.26, 0.045, 0xb8bcc0, 0, 0, 0.036, 0.55));
    }
    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildCpu = buildCpuDetailed;
})();
