/* parts3d/sceneLayout.js — desk + case; PSU shroud with rear bay; mobo not covered */
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

    var top = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.12, 4.6), wood);
    top.position.set(0.5, -1.0, 0); g.add(top);
    var rim = new THREE.Mesh(new THREE.BoxGeometry(8.05, 0.04, 4.65), edge);
    rim.position.set(0.5, -0.95, 0); g.add(rim);

    var pad = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.01, 3.6), mat(0x1a222c, { rough:0.95 }));
    pad.position.set(2.5, -0.93, 0); g.add(pad);
    for(var gi=0; gi<9; gi++){
      var line = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.002, 0.01), mat(0x2a3440, { rough:1 }));
      line.position.set(2.5, -0.924, -1.5 + gi * 0.38); g.add(line);
    }
    var tray = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.35), mat(0x2a2e34, { metal:0.4, rough:0.4 }));
    tray.position.set(3.5, -0.90, 1.5); g.add(tray);

    [[-3.0,-1.9],[4.0,-1.9],[-3.0,1.9],[4.0,1.9]].forEach(function(c){
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.12), dark);
      leg.position.set(c[0], -1.42, c[1]); g.add(leg);
      var foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.18), mat(0x1a120c, { rough:0.9 }));
      foot.position.set(c[0], -1.82, c[1]); g.add(foot);
    });
    var brace = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.06, 0.06), dark);
    brace.position.set(0.5, -1.55, 0); g.add(brace);
    return g;
  }

  function buildFrameDetailed(){
    var g = new THREE.Group();
    var fmat = mat(0x2a2e34, { metal:0.55, rough:0.38 });
    var panel = mat(0x161a20, { rough:0.75, metal:0.15 });
    var accent = mat(0x3a4050, { metal:0.4, rough:0.35 });
    var shroudMat = mat(0x1e2228, { metal:0.35, rough:0.45 });

    var cx = -1.35, cy = 0.85, cz = 0;
    var halfW = 1.25, halfH = 1.80, halfD = 0.72;
    var xs = [cx - halfW, cx + halfW], zs = [cz - halfD, cz + halfD];
    var yTop = cy + halfH, yBot = cy - halfH;

    xs.forEach(function(x){ zs.forEach(function(z){
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.06, halfH * 2, 0.06), fmat);
      post.position.set(x, cy, z); g.add(post);
    }); });
    [yTop, yBot].forEach(function(y){
      xs.forEach(function(x){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, halfD * 2), fmat);
        rail.position.set(x, y, cz); g.add(rail);
      });
      zs.forEach(function(z){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, 0.06, 0.06), fmat);
        rail.position.set(cx, y, z); g.add(rail);
      });
    });

    /* Back panel with bottom window for PSU IEC */
    var backTopH = halfH * 2 - 0.95;
    var backTop = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.05, backTopH, 0.03), panel);
    backTop.position.set(cx, yBot + 0.95 + backTopH * 0.5, cz - halfD); g.add(backTop);
    var backSideW = 0.35;
    var backLeft = new THREE.Mesh(new THREE.BoxGeometry(backSideW, 0.90, 0.03), panel);
    backLeft.position.set(cx - halfW + backSideW * 0.5 + 0.02, yBot + 0.48, cz - halfD); g.add(backLeft);
    var backRight = new THREE.Mesh(new THREE.BoxGeometry(backSideW, 0.90, 0.03), panel);
    backRight.position.set(cx + halfW - backSideW * 0.5 - 0.02, yBot + 0.48, cz - halfD); g.add(backRight);
    var backBar = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.05, 0.06, 0.03), panel);
    backBar.position.set(cx, yBot + 0.95, cz - halfD); g.add(backBar);

    var bottom = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.05, 0.05, halfD * 2 - 0.05), panel);
    bottom.position.set(cx, yBot + 0.02, cz); g.add(bottom);

    /* PSU shroud BELOW mobo; rear bay OPEN so PSU is visible */
    var shroudY = yBot + 0.22;
    var shroudFront = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.15, 0.55, 0.04), shroudMat);
    shroudFront.position.set(cx, shroudY + 0.28, cz + halfD * 0.35); g.add(shroudFront);
    var shroudTop = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.15, 0.04, halfD * 0.85), shroudMat);
    shroudTop.position.set(cx, shroudY + 0.55, cz + halfD * 0.15); g.add(shroudTop);

    var bayDepth = halfD * 1.15;
    var bayZ = cz - halfD * 0.25;
    var leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.70, bayDepth), accent);
    leftWall.position.set(cx - halfW + 0.12, shroudY + 0.35, bayZ); g.add(leftWall);
    var rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.70, bayDepth), accent);
    rightWall.position.set(cx + halfW - 0.12, shroudY + 0.35, bayZ); g.add(rightWall);

    for(var si=0; si<2; si++){
      var rail = new THREE.Mesh(new THREE.BoxGeometry(halfW * 1.6, 0.03, 0.04), mat(0x555a62, { metal:0.6, rough:0.3 }));
      rail.position.set(cx, shroudY + 0.08 + si * 0.55, cz - halfD + 0.08); g.add(rail);
    }

    var bezel = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.1, 0.40, 0.04), fmat);
    bezel.position.set(cx, yBot + 0.22, cz + halfD + 0.01); g.add(bezel);
    var pwr = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), mat(0xc0c4c8, { metal:0.7 }));
    pwr.rotation.x = Math.PI/2;
    pwr.position.set(cx - 0.55, yBot + 0.28, cz + halfD + 0.03); g.add(pwr);
    var led = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10), glow(0x22d3ee, 1.4));
    led.rotation.x = Math.PI/2;
    led.position.set(cx - 0.38, yBot + 0.28, cz + halfD + 0.03); g.add(led);

    for(var v=0; v<10; v++){
      var vent = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.20, halfD * 1.5), mat(0x0a0c10, { rough:0.9 }));
      vent.position.set(cx - halfW - 0.01, yBot + 0.75 + v * 0.24, cz); g.add(vent);
    }

    var io = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.045, 0.40), mat(0x1a1e24, { metal:0.5 }));
    io.position.set(cx + 0.45, yTop - 0.03, cz + 0.15); g.add(io);

    var glassFrame = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.2, halfH * 1.6, 0.02), mat(0x1a2030, { metal:0.2, rough:0.15 }));
    glassFrame.position.set(cx, cy + 0.15, cz + halfD + 0.02);
    glassFrame.material.transparent = true;
    glassFrame.material.opacity = 0.12;
    g.add(glassFrame);

    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildTable = buildTableDetailed;
  window.Parts3D.buildFrame = buildFrameDetailed;
  window.Parts3D.LAYOUT = {
    benchMobo: [2.40, -0.90, 0.0],
    caseMobo:  [-1.35, 0.85, -0.50],
    gpu:       [-1.50, -0.12, -0.28],
    psu:       [-1.35, -0.72, -0.28],
    psuRotY:   Math.PI,
    camPrep:   { x: 1.4, y: 0.3, z: 11 },
    camCase:   { x: -0.9, y: 0.5, z: 9.5 }
  };
})();
