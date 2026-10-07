/* parts3d/sceneLayout.js — table is the foundation; case sits ON table; mobo prep space beside case */
(function(){
  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.5:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }
  function glow(c, i){
    return new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:i||1.0, roughness:0.4, metalness:0.1 });
  }

  function buildTableDetailed(){
    var g = new THREE.Group();
    var wood = mat(0x6b4428, { rough:0.82, metal:0.03 });
    var dark = mat(0x3a2818, { rough:0.88, metal:0.03 });
    var edge = mat(0x4a321c, { rough:0.75, metal:0.05 });

    var top = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.12, 4.2), wood);
    top.position.set(0.4, -1.0, 0); g.add(top);

    var rim = new THREE.Mesh(new THREE.BoxGeometry(7.25, 0.04, 4.25), edge);
    rim.position.set(0.4, -0.95, 0); g.add(rim);

    var pad = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.01, 3.4), mat(0x1a222c, { rough:0.95 }));
    pad.position.set(2.2, -0.93, 0); g.add(pad);
    for(var gi=0; gi<8; gi++){
      var line = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.002, 0.01), mat(0x2a3440, { rough:1 }));
      line.position.set(2.2, -0.924, -1.4 + gi * 0.4); g.add(line);
    }
    var tray = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.35), mat(0x2a2e34, { metal:0.4, rough:0.4 }));
    tray.position.set(3.2, -0.90, 1.4); g.add(tray);

    [[-2.8,-1.7],[3.6,-1.7],[-2.8,1.7],[3.6,1.7]].forEach(function(c){
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.12), dark);
      leg.position.set(c[0], -1.42, c[1]); g.add(leg);
      var foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.18), mat(0x1a120c, { rough:0.9 }));
      foot.position.set(c[0], -1.82, c[1]); g.add(foot);
    });

    var brace = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.06, 0.06), dark);
    brace.position.set(0.4, -1.55, 0); g.add(brace);

    return g;
  }

  function buildFrameDetailed(){
    var g = new THREE.Group();
    var fmat = mat(0x2a2e34, { metal:0.55, rough:0.38 });
    var panel = mat(0x161a20, { rough:0.75, metal:0.15 });
    var accent = mat(0x3a4050, { metal:0.4, rough:0.35 });

    var cx = -1.5, cy = 0.35, cz = 0;
    var xs = [cx - 0.95, cx + 0.95], zs = [cz - 0.52, cz + 0.52];
    var yTop = cy + 1.25, yBot = cy - 1.25;

    xs.forEach(function(x){ zs.forEach(function(z){
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.055, 2.5, 0.055), fmat);
      post.position.set(x, cy, z); g.add(post);
    }); });

    [yTop, yBot].forEach(function(y){
      xs.forEach(function(x){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 1.1), fmat);
        rail.position.set(x, y, cz); g.add(rail);
      });
      zs.forEach(function(z){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.055, 0.055), fmat);
        rail.position.set(cx, y, z); g.add(rail);
      });
    });

    var back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.45, 0.03), panel);
    back.position.set(cx, cy, cz - 0.53); g.add(back);

    var bottom = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.04, 1.05), panel);
    bottom.position.set(cx, yBot + 0.02, cz); g.add(bottom);

    var shelf = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.03, 0.9), accent);
    shelf.position.set(cx, yBot + 0.45, cz); g.add(shelf);

    var bezel = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.35, 0.04), fmat);
    bezel.position.set(cx, yBot + 0.2, cz + 0.54); g.add(bezel);

    var pwr = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), mat(0xc0c4c8, { metal:0.7 }));
    pwr.rotation.x = Math.PI/2;
    pwr.position.set(cx - 0.5, yBot + 0.25, cz + 0.56); g.add(pwr);
    var led = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 10), glow(0x22d3ee, 1.4));
    led.rotation.x = Math.PI/2;
    led.position.set(cx - 0.35, yBot + 0.25, cz + 0.56); g.add(led);

    for(var v=0; v<8; v++){
      var vent = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.8), mat(0x0a0c10, { rough:0.9 }));
      vent.position.set(cx - 0.97, yBot + 0.7 + v * 0.22, cz); g.add(vent);
    }

    var io = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.35), mat(0x1a1e24, { metal:0.5 }));
    io.position.set(cx + 0.4, yTop - 0.02, cz + 0.2); g.add(io);

    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildTable = buildTableDetailed;
  window.Parts3D.buildFrame = buildFrameDetailed;
  window.Parts3D.LAYOUT = {
    benchMobo: [2.15, -0.90, 0.0],
    caseMobo:  [-1.55, 0.15, -0.15],
    camPrep:   { x: 1.2, y: 0.3, z: 9.5 },
    camCase:   { x: -0.8, y: 0.4, z: 8.0 }
  };
})();
