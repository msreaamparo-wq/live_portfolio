/* Camera rig. Modes:
   room    – cursor-led drift around a fixed vantage point, with look-at easing toward a focused TV
   journey – follows the authored fly-through curves (progress driven by journey.js)
   free    – parked at the end of the corridor, gentle parallax only */
(function () {
  var R = window.REA, U = R.utils, THREE = window.THREE;
  if (!THREE) return;
  var V = THREE.Vector3;
  var C = R.camera = { mode: 'room', jp: 0, focusTV: null, focusW: 0, motion: 0 };
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 }, S, cam, pos, look, posCurve, lookCurve, tmpP = new V(), tmpL = new V(), baseFov = 45;

  C.init = function () {
    S = R.scene; cam = S.camera; baseFov = cam.fov;
    pos = new V(0, 1.55, 8.4); look = new V(0, 1.7, 0);
    /* authored path: approach → fly-through the wall gap → fog corridor → clearing */
    posCurve = new THREE.CatmullRomCurve3([[0, 1.55, 8.4], [.85, 1.5, 5.6], [.9, 1.5, 2.8], [.2, 1.5, .9], [0, 1.5, -1.4], [0, 1.55, -8], [0, 1.6, -19], [0, 1.6, -30]].map(function (a) { return new V(a[0], a[1], a[2]); }), false, 'catmullrom', .4);
    lookCurve = new THREE.CatmullRomCurve3([[0, 1.7, 0], [0, 1.8, -.5], [0, 1.7, -1.5], [0, 1.6, -4], [0, 1.6, -8], [0, 1.6, -16], [0, 1.65, -28], [0, 1.7, -40]].map(function (a) { return new V(a[0], a[1], a[2]); }), false, 'catmullrom', .4);
    addEventListener('pointermove', function (e) { mouse.tx = (e.clientX / innerWidth) * 2 - 1; mouse.ty = -((e.clientY / innerHeight) * 2 - 1); }, { passive: true });
    /* tilt devices drift a little with the gyroscope when permitted (no prompt is forced) */
    addEventListener('deviceorientation', function (e) { if (matchMedia('(pointer: coarse)').matches && e.gamma != null && !R.camera.touched) { mouse.tx = U.clamp(e.gamma / 35, -1, 1) * .6; mouse.ty = U.clamp(((e.beta || 45) - 45) / -35, -1, 1) * .4; } });
    addEventListener('touchstart', function () { C.touched = true; }, { passive: true, once: true });
  };

  C.setMode = function (m) { C.mode = m; };
  C.setFocus = function (tv) { C.focusTV = tv; };

  C.update = function (dt, t) {
    mouse.x = U.damp(mouse.x, mouse.tx, 2.2, dt); mouse.y = U.damp(mouse.y, mouse.ty, 2.2, dt);
    var tp = tmpP, tl = tmpL, lam = 3, ll = 3.5;
    if (C.mode === 'room') {
      C.focusW = U.damp(C.focusW, C.focusTV ? 1 : 0, 2.6, dt);
      tp.set(mouse.x * 1.3, 1.55 + mouse.y * .35, 8.4);
      tl.set(mouse.x * 1.7, 1.7 + mouse.y * .7, 0);
      if (C.focusTV) {
        var F = C.focusTV.center, w = C.focusW;
        tl.lerp(F, w * .92);
        tp.x += F.x * .2 * w; tp.y += (F.y - 1.6) * .14 * w; tp.z -= 1.7 * w;
      }
    } else if (C.mode === 'journey') {
      var p = U.clamp(C.jp, 0, 1);
      posCurve.getPointAt(p, tp); lookCurve.getPointAt(p, tl); lam = 7; ll = 7;
    } else {
      posCurve.getPointAt(1, tp); lookCurve.getPointAt(1, tl); tp.x += mouse.x * .35; tp.y += mouse.y * .12; tl.x += mouse.x * .7; tl.y += mouse.y * .25; lam = 2.5; ll = 2.5;
    }
    pos.x = U.damp(pos.x, tp.x, lam, dt); pos.y = U.damp(pos.y, tp.y, lam, dt); pos.z = U.damp(pos.z, tp.z, lam, dt);
    look.x = U.damp(look.x, tl.x, ll, dt); look.y = U.damp(look.y, tl.y, ll, dt); look.z = U.damp(look.z, tl.z, ll, dt);
    cam.position.copy(pos); cam.lookAt(look);
    /* subtle roll + handheld breathing */
    cam.rotateZ(-mouse.x * .022 * (C.mode === 'room' ? 1 : .3) + Math.sin(t * 1.1) * .0025 + (C.mode === 'journey' ? Math.sin(t * 2.3) * .002 * (1 + C.motion * 2) : 0));
    /* speed-linked field of view */
    var fov = baseFov + C.motion * 9;
    if (Math.abs(fov - cam.fov) > .01) { cam.fov = U.damp(cam.fov, fov, 5, dt); cam.updateProjectionMatrix(); }
  };

  C.snap = function () { posCurve.getPointAt(1, pos); lookCurve.getPointAt(1, look); C.mode = 'free'; };
  C.setBaseFov = function (f) { baseFov = f; };
})();
