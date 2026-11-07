/* 3D scene: television room, figures, fog corridor, particles, post-processing.
   Pure scene construction + render loop. Camera motion lives in camera.js,
   hover/click logic in tv.js, sequencing in journey.js. */
(function () {
  var R = window.REA, U = R.utils, THREE = window.THREE;
  if (!THREE) return;
  var S = R.scene = { ready: false, running: false, tvs: [], screenMeshes: [], roomDisp: [], keepDisp: [] };
  S.cur = S.keepDisp;

  /* ───────── shaders ───────── */
  var POST_VERT = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }';
  var POST_FRAG = [
    'precision highp float; varying vec2 vUv;',
    'uniform sampler2D tDiffuse; uniform vec2 uRes, uFocus; uniform float uTime,uBlur,uFocusR,uAb,uGrain,uVig,uMotion,uExposure;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'void main(){',
    ' vec2 uv=vUv; vec2 asp=vec2(uRes.x/uRes.y,1.);',
    ' vec2 toC=uv-.5;',
    /* radial "speed" blur toward the centre of frame (controlled motion blur) */
    ' vec3 col=vec3(0.); float tot=0.;',
    ' float m=smoothstep(uFocusR,uFocusR+.38,length((uv-uFocus)*asp));',   /* 0 in focus, 1 out of focus */
    ' float rad=m*uBlur*.011; float ang=h(uv*uRes+uTime)*6.2831;',
    ' for(int i=0;i<10;i++){ float fi=float(i);',
    '   float r=sqrt((fi+.5)/10.)*rad; float a=fi*2.39996+ang;',
    '   vec2 o=vec2(cos(a),sin(a))*r*vec2(1./asp.x,1.);',
    '   vec2 mo=-toC*uMotion*.06*(fi/9.);',
    '   col+=texture2D(tDiffuse,uv+o+mo).rgb; tot+=1.; }',
    ' col/=tot;',
    /* chromatic aberration, stronger toward edges and while focused */
    ' float ab=uAb*(.35+length(toC))*.007;',
    ' if(ab>.00001){ col.r=mix(col.r,texture2D(tDiffuse,uv+toC*ab*3.).r,.8); col.b=mix(col.b,texture2D(tDiffuse,uv-toC*ab*3.).b,.8); }',
    ' col*=uExposure;',
    ' col*=1.-uVig*dot(toC,toC)*2.4;',
    ' col+=(h(uv*uRes+fract(uTime)*91.)-.5)*uGrain;',
    ' gl_FragColor=vec4(col,1.); }'
  ].join('\n');

  var SCREEN_VERT = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }';
  var SCREEN_FRAG = [
    'precision mediump float; varying vec2 vUv; uniform sampler2D map; uniform float uTime,uBright,uAb,uAlpha,uSeed;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'void main(){',
    ' vec2 q=vUv-.5; q*=1.+dot(q,q)*.2; vec2 p=q+.5;',
    ' if(p.x<0.||p.x>1.||p.y<0.||p.y>1.){ gl_FragColor=vec4(0.,0.,0.,uAlpha); return; }',
    ' float roll=sin(p.y*3.+uTime*.7+uSeed)*.0012+step(.987,fract(p.y*.4-uTime*.11+uSeed))*.007;',
    ' float ab=uAb*.007+.0012;',
    ' vec3 col; col.r=texture2D(map,p+vec2(roll+ab,0.)).r; col.g=texture2D(map,p+vec2(roll,0.)).g; col.b=texture2D(map,p+vec2(roll-ab,0.)).b;',
    ' col*=.8+.2*sin(p.y*560.);',                                   /* scanlines */
    ' col*=1.+.05*sin(uTime*47.+uSeed)+.03*h(vec2(floor(uTime*24.),uSeed));', /* flicker */
    ' col*=1.-dot(q,q)*2.1;',                                       /* tube vignette */
    ' col+=vec3(.015,.012,.01);',
    ' gl_FragColor=vec4(col*uBright,uAlpha); }'
  ].join('\n');

  var BEAM_VERT = 'varying float vH; varying vec3 vN; uniform float uH; void main(){ vH=clamp(-position.y/uH,0.,1.); vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }';
  var BEAM_FRAG = 'precision mediump float; varying float vH; varying vec3 vN; uniform vec3 uColor; uniform float uOpacity,uTime; void main(){ float f=pow(abs(vN.z),1.6); float a=(1.-vH)*(1.-vH)*f*uOpacity*(.85+.15*sin(uTime*1.3+vH*6.)); gl_FragColor=vec4(uColor*a,a); }';

  var DUST_VERT = 'uniform float uTime,uSize; varying float vA; void main(){ vec3 p=position; p.x+=sin(uTime*.18+position.y*2.1+position.z)*.35; p.y+=sin(uTime*.14+position.x*1.3)*.25; p.z+=cos(uTime*.11+position.x)*.3; vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=uSize*(260./-mv.z); vA=smoothstep(.0,3.,-mv.z)*(.4+.6*fract(position.x*13.37+position.z*7.1)); }';
  var DUST_FRAG = 'precision mediump float; varying float vA; uniform float uOpacity; uniform vec3 uColor; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.0,d)*vA*uOpacity; gl_FragColor=vec4(uColor*a,a); }';

  var GATHER_VERT = [
    'attribute vec3 aTarget; attribute vec3 aStart; attribute float aSeed; uniform float uGather,uTime,uSize; varying float vA;',
    'void main(){ float g=clamp(uGather*1.35-aSeed*.35,0.,1.); g=g*g*(3.-2.*g);',
    ' vec3 swirl=aStart+vec3(sin(uTime*.4+aSeed*20.),cos(uTime*.3+aSeed*13.),sin(uTime*.2+aSeed*7.))*.5*(1.-g);',
    ' vec3 tgt=aTarget+vec3(sin(uTime*1.7+aSeed*30.),cos(uTime*1.3+aSeed*21.),0.)*.012;',
    ' vec3 p=mix(swirl,tgt,g); vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;',
    ' gl_PointSize=uSize*(260./-mv.z)*(.7+.6*g); vA=.35+.65*g; }'
  ].join('\n');
  var GATHER_FRAG = 'precision mediump float; varying float vA; uniform float uOpacity; uniform vec3 uColor; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.05,d)*vA*uOpacity; gl_FragColor=vec4(uColor*a,a); }';

  /* ───────── helpers ───────── */
  function track(o) { S.cur.push(o); return o; }
  function glowTexture(inner, outer) {
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');
    var g = x.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, inner); g.addColorStop(1, outer); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return track(new THREE.CanvasTexture(c));
  }
  function screenMaterial(tex, seed, alpha) {
    return track(new THREE.ShaderMaterial({
      vertexShader: SCREEN_VERT, fragmentShader: SCREEN_FRAG, fog: false, transparent: alpha < 1, side: alpha < 1 ? THREE.DoubleSide : THREE.FrontSide,
      depthWrite: alpha >= 1,
      uniforms: { map: { value: tex }, uTime: { value: 0 }, uBright: { value: .6 }, uAb: { value: 0 }, uAlpha: { value: alpha }, uSeed: { value: seed } }
    }));
  }
  function curvedPlane(w, h) {
    var g = new THREE.PlaneGeometry(w, h, 10, 8), p = g.attributes.position;
    for (var i = 0; i < p.count; i++) { var x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2); p.setZ(i, (1 - (x * x + y * y) * .5) * w * .035); }
    g.computeVertexNormals(); return track(g);
  }

  /* ───────── builders ───────── */
  function buildRoom(q) {
    var room = new THREE.Group(); S.room = room; S.cur = S.roomDisp;
    var dark = track(new THREE.MeshStandardMaterial({ color: 0x0b0a09, roughness: .95, metalness: 0 }));
    var floorMat = track(new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: .38, metalness: .55, transparent: true, opacity: .74, depthWrite: false }));
    var floor = new THREE.Mesh(track(new THREE.PlaneGeometry(60, 110)), floorMat); floor.rotation.x = -Math.PI / 2; floor.renderOrder = 0; floor.position.set(0, 0, -30); room.add(floor);
    var ceil = new THREE.Mesh(track(new THREE.PlaneGeometry(60, 110)), dark); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 7.5, -30); room.add(ceil);

    /* back wall with a slit the camera can fly through, and a lintel above it */
    var gap = 1.15, H = 7.5, L = 14;
    [[-1, 1], [1, 1]].forEach(function (s) {
      var m = new THREE.Mesh(track(new THREE.BoxGeometry(L, H, .6)), dark); m.position.set(s[0] * (gap + L / 2), H / 2, -.6); room.add(m);
    });
    var lintel = new THREE.Mesh(track(new THREE.BoxGeometry(gap * 2 + .02, H - 2.45, .6)), dark); lintel.position.set(0, 2.45 + (H - 2.45) / 2, -.6); room.add(lintel);

    buildTVs(room, q);
    buildFigure(room, q);
    buildCorridor(room, q);
    S.cur = S.keepDisp;
    return room;
  }

  function buildTVs(room, q) {
    var bodyMat = track(new THREE.MeshStandardMaterial({ color: 0x15130f, roughness: .55, metalness: .2 }));
    var backMat = track(new THREE.MeshStandardMaterial({ color: 0x0d0c0a, roughness: .8 }));
    var offMat = track(new THREE.MeshStandardMaterial({ color: 0x050505, roughness: .15, metalness: .8 }));
    var knobMat = track(new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: .4, metalness: .6 }));
    var halo = glowTexture('rgba(255,214,160,.55)', 'rgba(255,214,160,0)');
    var bodyGeo = track(new THREE.BoxGeometry(1, 1, 1));
    var knobGeo = track(new THREE.CylinderGeometry(.035, .035, .03, 10)); knobGeo.rotateX(Math.PI / 2);

    /* shared noise texture for filler sets */
    var nc = document.createElement('canvas'); nc.width = 96; nc.height = 72; var nctx = nc.getContext('2d');
    var noiseTex = track(new THREE.CanvasTexture(nc)); noiseTex.minFilter = THREE.LinearFilter; noiseTex.generateMipmaps = false;
    S.noise = { ctx: nctx, tex: noiseTex, mats: [screenMaterial(noiseTex, 1.3, 1), screenMaterial(noiseTex, 4.1, 1), screenMaterial(noiseTex, 7.7, 1)] };
    S.noise.mats[0].uniforms.uBright.value = .16; S.noise.mats[1].uniforms.uBright.value = .26; S.noise.mats[2].uniforms.uBright.value = .1;

    function addSet(spec, mat, portal) {
      var g = new THREE.Group(); g.position.set(spec.x, spec.y, spec.z || 0);
      var d = spec.w * .75, body = new THREE.Mesh(bodyGeo, bodyMat); body.scale.set(spec.w, spec.h, d); g.add(body);
      var back = new THREE.Mesh(bodyGeo, backMat); back.scale.set(spec.w * .72, spec.h * .72, d * .8); back.position.z = -d * .85; g.add(back);
      var sw = spec.w * .8, sh = spec.h * .78;
      var scr = new THREE.Mesh(curvedPlane(sw, sh), mat); scr.position.set(-spec.w * .045, spec.h * .01, d / 2 + .004); g.add(scr);
      if (q.tier !== 'low') { [.22, -.02].forEach(function (oy) { var k = new THREE.Mesh(knobGeo, knobMat); k.position.set(spec.w * .43, spec.h * (oy + .12), d / 2 + .012); g.add(k); }); }
      g.rotation.y = spec.ry || 0; room.add(g);
      return { g: g, scr: scr, d: d, sw: sw, sh: sh };
    }

    /* the seven portal sets: hand placed so they all sit near eye-level */
    var P = [
      ['trace', -2.5, 1.95, 1.8, 1.35, .02], ['cacao', 2.65, 2.15, 1.95, 1.45, .06], ['gnlr', -4.5, .85, 1.55, 1.15, -.1],
      ['archive', 4.75, .95, 1.45, 1.25, .02], ['void', -1.95, .75, 1.2, 1.0, -.05], ['identity', 1.95, .8, 1.3, 1.1, .05], ['code', 0, 3.15, 2.4, 1.15, 0]
    ];
    var meta = {}; REA.projects.forEach(function (p) { meta[p.id] = p; }); REA.extraScreens.forEach(function (p) { meta[p.id] = p; });
    var occupied = [];
    P.forEach(function (p, i) {
      var id = p[0], spec = { x: p[1], y: p[2], w: p[3], h: p[4], ry: p[5], z: (i % 3) * .08 };
      var cv = document.createElement('canvas'); cv.width = 320; cv.height = Math.round(320 * (p[4] / p[3])); var cx = cv.getContext('2d');
      var tex = track(new THREE.CanvasTexture(cv)); tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
      var mat = screenMaterial(tex, i * 2.37 + 1, 1);
      var set = addSet(spec, mat, true);
      var tv = {
        id: id, meta: meta[id], index: i, group: set.g, mesh: set.scr, mat: mat, tex: tex, canvas: cv, ctx: cx, w: set.sw, h: set.sh, kind: meta[id].kind || id,
        center: new THREE.Vector3(), bright: .65, target: .65, drawAt: 0, mouse: { x: .5, y: .5, hover: false }
      };
      set.scr.userData.tv = tv; set.g.updateMatrixWorld(true); set.scr.getWorldPosition(tv.center);
      var hl = new THREE.Mesh(track(new THREE.PlaneGeometry(spec.w * 2.1, spec.h * 2.1)), track(new THREE.MeshBasicMaterial({ map: halo, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
      hl.position.set(spec.x, spec.y, (spec.z || 0) + set.d / 2 + .25); room.add(hl); tv.halo = hl;
      if (q.post !== false) { /* floor reflection of the portal screens */
        var rm = screenMaterial(tex, i * 2.37 + 1, .5); rm.uniforms.uBright = mat.uniforms.uBright; rm.uniforms.uTime = mat.uniforms.uTime;
        var ref = new THREE.Mesh(set.scr.geometry, rm); ref.renderOrder = -1; ref.position.set(spec.x - spec.w * .045, -(spec.y + spec.h * .01), (spec.z || 0) + set.d / 2 + .004); ref.scale.y = -1; room.add(ref);
      }
      S.tvs.push(tv); S.screenMeshes.push(set.scr);
      occupied.push([spec.x - spec.w / 2 - .12, spec.x + spec.w / 2 + .12, spec.y - spec.h / 2 - .12, spec.y + spec.h / 2 + .12]);
    });

    /* fillers: seeded, different sizes / depths / states */
    var r = U.rng(11), rows = [.45, 1.6, 2.75, 3.9, 5.05];
    rows.forEach(function (ry) {
      [-1, 1].forEach(function (side) {
        var x = 1.35;
        while (x < 8.4) {
          var w = .85 + r() * 1.1, h = .7 + r() * .75, cx = side * (x + w / 2), cy = ry + h / 2 - .1;
          x += w + .1 + r() * .12;
          if (r() > q.fillers) continue;
          var hit = occupied.some(function (o) { return cx + w / 2 > o[0] && cx - w / 2 < o[1] && cy + h / 2 > o[2] && cy - h / 2 < o[3]; });
          if (hit) continue;
          var roll = r(), mat = roll < .36 ? offMat : S.noise.mats[(roll * 10 | 0) % 3];
          addSet({ x: cx, y: cy, w: w, h: h, z: -(r() * .35), ry: (r() - .5) * .1 }, mat, false);
        }
      });
    });

    /* a faint warm key light and cool fill; the focus light is moved to the chosen TV */
    var key = new THREE.PointLight(0xffc98a, .5, 16, 2); key.position.set(0, 2.4, 4.6); room.add(key); S.keyLight = key;
    var fill = new THREE.PointLight(0x6f8790, .25, 18, 2); fill.position.set(-5, 3.4, 3); room.add(fill);
    var fl = new THREE.PointLight(0xffd2a0, 0, 7, 2); room.add(fl); S.focusLight = fl;
    room.add(new THREE.AmbientLight(0x1a1816, .55));
  }

  function figureGeo() {
    var pts = [[.0, 0], [.2, 0], [.25, .35], [.19, .95], [.27, 1.36], [.3, 1.52], [.1, 1.6], [.0, 1.62]].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    return track(new THREE.LatheGeometry(pts, 14));
  }
  function buildFigure(room, q) {
    var g = new THREE.Group(), mat = track(new THREE.MeshStandardMaterial({ color: 0x040404, roughness: .95, metalness: 0 }));
    var body = new THREE.Mesh(figureGeo(), mat); g.add(body);
    var head = new THREE.Mesh(track(new THREE.SphereGeometry(.125, 14, 12)), mat); head.position.y = 1.78; g.add(head);
    var neck = new THREE.Mesh(track(new THREE.CylinderGeometry(.05, .06, .14, 8)), mat); neck.position.y = 1.66; g.add(neck);
    var armGeo = track(new THREE.CylinderGeometry(.045, .04, .7, 8)); armGeo.translate(0, -.35, 0);
    [-1, 1].forEach(function (s) { var a = new THREE.Mesh(armGeo, mat); a.position.set(s * .3, 1.5, 0); a.rotation.z = s * .06; g.add(a); });
    g.position.set(0, 0, 3.6); g.scale.setScalar(1.05); room.add(g); S.figure = g;
  }

  function buildCorridor(room, q) {
    var n = q.corridor, geo = figureGeo(), headGeo = track(new THREE.SphereGeometry(.125, 10, 8));
    var mat = track(new THREE.MeshBasicMaterial({ color: 0x020202 }));   /* basic + fog = true silhouettes */
    var r = U.rng(5), grp = new THREE.Group(); S.corridor = grp; S.corridorFigs = [];
    for (var side = -1; side <= 1; side += 2) for (var i = 0; i < n; i++) {
      var f = new THREE.Group(), s = .94 + r() * .16;
      var b = new THREE.Mesh(geo, mat); f.add(b); var hd = new THREE.Mesh(headGeo, mat); hd.position.y = 1.76; f.add(hd);
      f.position.set(side * (2.05 + r() * .2), 0, -9.5 - i * (24 / n) - r() * .5); f.scale.setScalar(s); f.rotation.y = side * -(.3 + r() * .25);
      f.userData.ph = r() * 6.28; grp.add(f); S.corridorFigs.push(f);
    }
    /* light shafts along the corridor */
    var H = 7.2, bg = new THREE.ConeGeometry(2.1, H, 20, 1, true); bg.translate(0, -H / 2, 0); track(bg);
    S.beamMat = track(new THREE.ShaderMaterial({ vertexShader: BEAM_VERT, fragmentShader: BEAM_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, uniforms: { uH: { value: H }, uColor: { value: new THREE.Color(0xffd9a8) }, uOpacity: { value: 0 }, uTime: { value: 0 } } }));
    S.beams = [];
    for (var k = 0; k < 6; k++) { var bm = new THREE.Mesh(bg, S.beamMat); bm.position.set(0, 7.4, -12 - k * 4.2); grp.add(bm); S.beams.push(bm); }
    /* beams over the TV wall: dusty light from above the figure */
    [[-1.2, 2.2], [1.6, 3.6]].forEach(function (p, i) { var bm = new THREE.Mesh(bg, S.beamMat); bm.position.set(p[0], 7.4, p[1]); bm.rotation.z = (i ? -1 : 1) * .12; room.add(bm); S.beams.push(bm); });
    room.add(grp);
  }

  function buildBacklight() {
    var tex = glowTexture('rgba(255,226,186,1)', 'rgba(255,226,186,0)');
    var m = new THREE.Mesh(track(new THREE.PlaneGeometry(46, 26)), track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
    m.position.set(0, 2.2, -48); S.scene.add(m); S.backlight = m;
  }

  function buildDust(q) {
    var n = q.dust, pos = new Float32Array(n * 3), r = U.rng(99);
    for (var i = 0; i < n; i++) { pos[i * 3] = (r() - .5) * 20; pos[i * 3 + 1] = r() * 6.5; pos[i * 3 + 2] = 12 - r() * 56; }
    var g = track(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = track(new THREE.ShaderMaterial({ vertexShader: DUST_VERT, fragmentShader: DUST_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uTime: { value: 0 }, uSize: { value: 1.5 * q.pixelRatio }, uOpacity: { value: .55 }, uColor: { value: new THREE.Color(0xe9dfcb) } } }));
    S.dust = new THREE.Points(g, mat); S.dust.frustumCulled = false; S.scene.add(S.dust);
  }

  /* Samples the name from a 2D canvas to get particle target positions */
  function buildGather(q) {
    var W = 1024, Hh = 256, c = document.createElement('canvas'); c.width = W; c.height = Hh; var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 190px Archivo,"Arial Black",Impact,sans-serif'; x.fillText('REA AMPARO', W / 2, Hh / 2 + 6);
    var d = x.getImageData(0, 0, W, Hh).data, pts = [], r = U.rng(3);
    for (var py = 0; py < Hh; py += 2) for (var px = 0; px < W; px += 2) if (d[(py * W + px) * 4 + 3] > 128 && r() < .95) pts.push([px, py]);
    var n = q.gather, tgt = new Float32Array(n * 3), st = new Float32Array(n * 3), sd = new Float32Array(n), pp = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var p = pts[(r() * pts.length) | 0] || [W / 2, Hh / 2];
      tgt[i * 3] = (p[0] / W - .5) * 9; tgt[i * 3 + 1] = (.5 - p[1] / Hh) * 2.25; tgt[i * 3 + 2] = (r() - .5) * .08;
      st[i * 3] = (r() - .5) * 22; st[i * 3 + 1] = (r() - .5) * 9; st[i * 3 + 2] = (r() - .2) * 14; sd[i] = r();
    }
    var g = track(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    g.setAttribute('aTarget', new THREE.BufferAttribute(tgt, 3)); g.setAttribute('aStart', new THREE.BufferAttribute(st, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
    var mat = track(new THREE.ShaderMaterial({ vertexShader: GATHER_VERT, fragmentShader: GATHER_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uGather: { value: 0 }, uTime: { value: 0 }, uSize: { value: 1.7 * q.pixelRatio }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color(0xf1e6d0) } } }));
    S.gather = new THREE.Points(g, mat); S.gather.frustumCulled = false; S.gather.position.set(0, 1.7, -38.5); S.scene.add(S.gather); S.gatherMat = mat;
  }

  /* ───────── post-processing ───────── */
  function buildPost(q) {
    var r = S.renderer, size = r.getDrawingBufferSize(new THREE.Vector2());
    S.rt = new THREE.WebGLRenderTarget(size.x, size.y, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false });
    S.postScene = new THREE.Scene(); S.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    S.post = new THREE.ShaderMaterial({ vertexShader: POST_VERT, fragmentShader: POST_FRAG, depthTest: false, depthWrite: false, uniforms: {
      tDiffuse: { value: S.rt.texture }, uRes: { value: size }, uFocus: { value: new THREE.Vector2(.5, .5) }, uTime: { value: 0 }, uBlur: { value: .3 }, uFocusR: { value: .6 },
      uAb: { value: .15 }, uGrain: { value: .07 }, uVig: { value: .9 }, uMotion: { value: 0 }, uExposure: { value: 1 } } });
    S.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), S.post));
  }

  /* ───────── public API ───────── */
  S.init = function (canvas, q) {
    S.q = q;
    S.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !q.post, powerPreference: 'high-performance', alpha: false });
    S.renderer.setPixelRatio(q.pixelRatio); S.renderer.setSize(innerWidth, innerHeight, false);
    S.renderer.setClearColor(0x030303, 1);
    S.scene = new THREE.Scene(); S.scene.background = new THREE.Color(0x030303); S.scene.fog = new THREE.FogExp2(0x030303, .06);
    S.camera = new THREE.PerspectiveCamera(innerWidth < 760 ? 58 : 45, innerWidth / innerHeight, .1, 140);
    S.camera.position.set(0, 1.55, 8.4);
    buildRoom(q); buildBacklight(); buildDust(q); buildGather(q);
    if (q.post) buildPost(q);
    S.noiseTick = 0; S.texCanvasLoss = false;
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); S.stop(); document.documentElement.classList.add('gl-lost'); });
    addEventListener('resize', S.resize); S.resize();
    S.ready = true;
  };

  S.resize = function () {
    if (!S.renderer) return;
    var w = innerWidth, h = innerHeight; S.renderer.setSize(w, h, false);
    S.camera.aspect = w / h; S.camera.fov = w < 760 ? 58 : 45; S.camera.updateProjectionMatrix();
    if (S.rt) { var s = S.renderer.getDrawingBufferSize(new THREE.Vector2()); S.rt.setSize(s.x, s.y); S.post.uniforms.uRes.value.copy(s); }
    if (S.gather) { var vis = 2 * 8.2 * Math.tan(S.camera.fov * Math.PI / 360) * S.camera.aspect; S.gather.scale.setScalar(Math.min(1, vis * .8 / 9)); }
  };

  /* draw animated artwork onto portal canvases (staggered, ~20fps) */
  function updateScreens(t, dt) {
    var hidden = S.screensHidden;
    for (var i = 0; i < S.tvs.length; i++) {
      var tv = S.tvs[i];
      tv.bright = U.damp(tv.bright, tv.target, 5, dt);
      tv.mat.uniforms.uTime.value = t; tv.mat.uniforms.uBright.value = tv.bright * (S.screenGain == null ? 1 : S.screenGain);
      tv.mat.uniforms.uAb.value = U.damp(tv.mat.uniforms.uAb.value, tv.target > 1.2 ? 1 : 0, 6, dt);
      tv.halo.material.opacity = U.clamp((tv.bright - .5) * .5, 0, .6) * (S.screenGain == null ? 1 : S.screenGain);
      if (!hidden && t - tv.drawAt > .05) { tv.drawAt = t; R.art.draw(tv.kind, tv.ctx, tv.canvas.width, tv.canvas.height, t + i * 3.1, tv.mouse); tv.tex.needsUpdate = true; }
    }
    S.noiseTick++;
    if (!hidden && S.noiseTick % 4 === 0) { R.art.noise(S.noise.ctx, 96, 72, t); S.noise.tex.needsUpdate = true; }
    for (var m = 0; m < 3; m++) S.noise.mats[m].uniforms.uTime.value = t;
  }

  S.update = function (dt, t) {
    var q = S.q, u = S.post && S.post.uniforms;
    if (S.room) {
      updateScreens(t, dt);
      if (S.figure) { S.figure.rotation.z = Math.sin(t * .5) * .004; S.figure.position.y = Math.sin(t * .8) * .006; }
      for (var i = 0; i < S.corridorFigs.length; i++) { var f = S.corridorFigs[i]; f.rotation.z = Math.sin(t * .35 + f.userData.ph) * .012; f.position.y = Math.sin(t * .5 + f.userData.ph) * .01; }
      S.beamMat.uniforms.uTime.value = t;
    }
    S.dust.material.uniforms.uTime.value = t; S.gatherMat.uniforms.uTime.value = t;
    if (u) { u.uTime.value = t; }
  };

  S.render = function () {
    var r = S.renderer;
    if (S.post) { r.setRenderTarget(S.rt); r.render(S.scene, S.camera); r.setRenderTarget(null); r.render(S.postScene, S.postCam); }
    else r.render(S.scene, S.camera);
  };

  /* Main loop. Pauses when the tab is hidden or the stage is flagged inactive. */
  var last = 0, clock = 0, frameCount = 0, fpsT = 0, slow = 0;
  S.loop = function (now) {
    if (!S.running) return;
    S.raf = requestAnimationFrame(S.loop);
    var dt = Math.min(.05, (now - last) / 1000 || .016); last = now; clock += dt;
    if (S.ambient && (frameCount++ & 1)) return;           /* ambient mode: render every other frame */
    R.camera.update(dt, clock); R.tv.update(dt, clock); S.update(dt, clock); S.render();
    /* adaptive quality: if the average frame time stays high, drop pixel ratio once */
    fpsT += dt; slow += dt > .034 ? 1 : 0;
    if (fpsT > 3) { if (slow / (fpsT / .016) > .5 && S.renderer.getPixelRatio() > 1) { S.renderer.setPixelRatio(Math.max(1, S.renderer.getPixelRatio() - .5)); S.resize(); } fpsT = 0; slow = 0; }
  };
  S.start = function () { if (S.running || !S.ready) return; S.running = true; last = performance.now(); S.raf = requestAnimationFrame(S.loop); };
  S.stop = function () { S.running = false; cancelAnimationFrame(S.raf); };
  document.addEventListener('visibilitychange', function () { if (!S.ready) return; if (document.hidden) S.stop(); else if (!S.paused) S.start(); });
  S.pause = function () { S.paused = true; S.stop(); };
  S.resume = function () { S.paused = false; S.start(); };

  /* Frees the TV room (geometry, textures, materials) once the journey is over. */
  S.disposeRoom = function () {
    if (!S.room) return;
    S.scene.remove(S.room);
    S.roomDisp.forEach(function (d) { if (d && d.dispose) d.dispose(); });
    S.roomDisp = []; S.room = null; S.tvs = []; S.screenMeshes = []; S.corridorFigs = []; S.figure = null; S.noise = null; S.focusLight = null;
    if (S.post) { S.post.uniforms.uMotion.value = 0; S.post.uniforms.uBlur.value = 0; }
  };

  S.destroy = function () {
    S.stop(); removeEventListener('resize', S.resize);
    S.disposeRoom();
    S.keepDisp.forEach(function (d) { if (d && d.dispose) d.dispose(); });
    [S.dust, S.gather, S.backlight].forEach(function (o) { if (o) { o.geometry.dispose(); o.material.dispose(); } });
    if (S.rt) S.rt.dispose(); if (S.renderer) { S.renderer.dispose(); }
    S.ready = false;
  };
})();
