/* parts3d/sceneLayout.js — real ATX layout: no shroud, rear I/O panel, PSU bottom rear */
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
    var darkPanel = mat(0x0e1014, { rough:0.7, metal:0.2 });
    var accent = mat(0x3a4050, { metal:0.4, rough:0.35 });
    var meshMat = mat(0x1a1e24, { metal:0.45, rough:0.35 });

    var cx = -1.35, cy = 0.85, cz = 0;
    var halfW = 1.25, halfH = 1.80, halfD = 0.72;
    var xs = [cx - halfW, cx + halfW], zs = [cz - halfD, cz + halfD];
    var yTop = cy + halfH, yBot = cy - halfH;

    xs.forEach(function(x){ zs.forEach(function(z){
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.055, halfH * 2, 0.055), fmat);
      post.position.set(x, cy, z); g.add(post);
    }); });
    [yTop, yBot].forEach(function(y){
      xs.forEach(function(x){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, halfD * 2), fmat);
        rail.position.set(x, y, cz); g.add(rail);
      });
      zs.forEach(function(z){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, 0.055, 0.055), fmat);
        rail.position.set(cx, y, z); g.add(rail);
      });
    });

    var bottom = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.04, 0.04, halfD * 2 - 0.04), panel);
    bottom.position.set(cx, yBot + 0.02, cz); g.add(bottom);

    var rz = cz - halfD - 0.01;

    var topVent = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.1, 0.35, 0.04), meshMat);
    topVent.position.set(cx, yTop - 0.25, rz); g.add(topVent);
    for(var tv=0; tv<6; tv++){
      var slit = new THREE.Mesh(new THREE.BoxGeometry(halfW * 1.7, 0.025, 0.02), darkPanel);
      slit.position.set(cx, yTop - 0.12 - tv * 0.05, rz - 0.02); g.add(slit);
    }

    var ioShield = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.15, 0.05), mat(0x0a0c10, { metal:0.3, rough:0.5 }));
    ioShield.position.set(cx - 0.55, cy + 0.55, rz); g.add(ioShield);
    var portColors = [0x111111, 0x222222, 0x8b0000, 0x8b0000, 0x1a1a1a, 0x1a1a1a, 0xc9a227, 0xc9a227];
    for(var ip=0; ip<8; ip++){
      var po = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.04), mat(portColors[ip], { metal:0.4 }));
      po.position.set(cx - 0.55 + (ip%2)*0.18 - 0.08, cy + 0.95 - Math.floor(ip/2)*0.22, rz - 0.03);
      g.add(po);
    }

    for(var es=0; es<7; es++){
      var slotY = cy - 0.15 - es * 0.18;
      var bracket = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.14, 0.04), mat(0x2a2e34, { metal:0.5, rough:0.35 }));
      bracket.position.set(cx + 0.15, slotY, rz); g.add(bracket);
      var opening = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 0.03), darkPanel);
      opening.position.set(cx + 0.15, slotY, rz - 0.02); g.add(opening);
    }
    for(var gp=0; gp<3; gp++){
      var gport = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.05), mat(0x1a1a1a, { metal:0.6 }));
      gport.position.set(cx - 0.2 + gp * 0.18, cy - 0.15, rz - 0.04); g.add(gport);
    }

    var fanCut = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.03, 24), meshMat);
    fanCut.rotation.x = Math.PI/2;
    fanCut.position.set(cx + 0.55, cy + 0.7, rz); g.add(fanCut);
    var fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 12), mat(0x333333, { metal:0.4 }));
    fanHub.rotation.x = Math.PI/2;
    fanHub.position.set(cx + 0.55, cy + 0.7, rz - 0.01); g.add(fanHub);

    var psuWin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.04), meshMat);
    psuWin.position.set(cx, yBot + 0.42, rz); g.add(psuWin);
    for(var hg=0; hg<5; hg++){
      var hline = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.02), darkPanel);
      hline.position.set(cx, yBot + 0.55 + hg * 0.08, rz - 0.02); g.add(hline);
    }
    var iecCut = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.03), darkPanel);
    iecCut.position.set(cx - 0.25, yBot + 0.28, rz - 0.02); g.add(iecCut);

    var rearFillL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.03), panel);
    rearFillL.position.set(cx - halfW + 0.2, cy - 0.4, rz + 0.01); g.add(rearFillL);

    var leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.04, halfH * 2 - 0.1, halfD * 2 - 0.1), panel);
    leftPanel.position.set(cx - halfW, cy, cz); g.add(leftPanel);
    for(var lv=0; lv<8; lv++){
      var lvent = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.9), darkPanel);
      lvent.position.set(cx - halfW - 0.02, yBot + 0.9 + lv * 0.28, cz); g.add(lvent);
    }

    var rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.04, halfH * 2 - 0.1, halfD * 2 - 0.1), panel);
    rightPanel.position.set(cx + halfW, cy, cz); g.add(rightPanel);
    for(var dc=0; dc<5; dc++){
      var cage = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 1.0), accent);
      cage.position.set(cx + halfW - 0.25, yTop - 0.5 - dc * 0.35, cz); g.add(cage);
    }
    var sled = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.7), mat(0x2a2e34, { metal:0.4 }));
    sled.position.set(cx + halfW - 0.4, yBot + 0.55, cz + 0.15); g.add(sled);

    var bezel = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.1, 0.45, 0.05), fmat);
    bezel.position.set(cx, yBot + 0.25, cz + halfD + 0.02); g.add(bezel);
    var pwr = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), mat(0xc0c4c8, { metal:0.7 }));
    pwr.rotation.x = Math.PI/2;
    pwr.position.set(cx - 0.5, yBot + 0.28, cz + halfD + 0.05); g.add(pwr);
    var led = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10), glow(0x22d3ee, 1.4));
    led.rotation.x = Math.PI/2;
    led.position.set(cx - 0.32, yBot + 0.28, cz + halfD + 0.05); g.add(led);

    var glass = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.25, halfH * 1.7, 0.02), mat(0x1a2030, { metal:0.15, rough:0.12 }));
    glass.position.set(cx, cy + 0.2, cz + halfD + 0.03);
    glass.material.transparent = true;
    glass.material.opacity = 0.08;
    g.add(glass);

    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildTable = buildTableDetailed;
  window.Parts3D.buildFrame = buildFrameDetailed;
  window.Parts3D.LAYOUT = {
    benchMobo: [2.40, -0.90, 0.0],
    caseMobo:  [-1.35, 0.85, -0.35],
    gpu:       [-1.40, -0.15, -0.15],
    psu:       [-1.35, -0.70, -0.15],
    psuRotY:   Math.PI,
    camPrep:   { x: 1.4, y: 0.3, z: 11 },
    camCase:   { x: -0.6, y: 0.4, z: 9.0 }
  };
})();
