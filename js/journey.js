/* The continuous camera journey: approach → fly-through → fog corridor → reveal.
   Everything (camera, fog, light, particles, blur) is derived from ONE progress value, so there are no cuts. */
(function () {
  var R = window.REA, U = R.utils, THREE = window.THREE;
  if (!THREE) return;
  var J = R.journey = { running: false, done: false };
  var S, C, T, tl, st = { p: 0 }, html = document.documentElement, subtitle, hud;
  var FOG_A, FOG_B, FOG_C, tmp;

  var CAPTIONS = [[.9, 'Every screen is a project.'], [6.2, 'Walk through the noise.'], [10.5, 'Stay with the fog.'], [17, 'Something is assembling.']];

  function apply(p) {
    var sc = S.scene, u = S.post && S.post.uniforms;
    var a = U.smooth(U.map(p, .3, .55, 0, 1)), b = U.smooth(U.map(p, .84, 1, 0, 1));
    var motion = U.smooth(U.map(p, .15, .3, 0, 1)) * (1 - U.smooth(U.map(p, .3, .44, 0, 1)));
    sc.fog.density = p < .4 ? .06 : p < .86 ? U.lerp(.06, .1, U.smooth(U.map(p, .4, .6, 0, 1))) : U.lerp(.1, .036, b);
    tmp.copy(FOG_A).lerp(FOG_B, a).lerp(FOG_C, b); sc.fog.color.copy(tmp); sc.background.copy(tmp); S.renderer.setClearColor(tmp);
    S.backlight.material.opacity = Math.min(1, .12 * a + .9 * U.smooth(U.map(p, .5, .92, 0, 1)));
    S.beamMat.uniforms.uOpacity.value = .06 + .16 * a;
    S.screenGain = 1 - U.smooth(U.map(p, .28, .46, 0, 1));
    S.screensHidden = p > .5;
    S.dofBase = U.lerp(.3, 0, b); S.abBase = .15 + motion * .55;
    if (u) { u.uMotion.value = motion * .9; u.uExposure.value = 1 + .22 * b; u.uVig.value = U.lerp(.9, .6, b); }
    C.motion = motion;
    var g = U.smooth(U.map(p, .8, .985, 0, 1));
    S.gatherMat.uniforms.uGather.value = g; S.gatherMat.uniforms.uOpacity.value = U.smooth(U.map(p, .76, .84, 0, 1)) * (1 - U.smooth(U.map(p, .985, 1, 0, 1)) * .0);
  }

  function showCaption(text) {
    if (!subtitle) return; subtitle.textContent = text; subtitle.classList.remove('on'); void subtitle.offsetWidth; subtitle.classList.add('on');
  }

  function finalize(fast) {
    J.running = false; J.done = true; C.setMode('free');
    html.classList.remove('intro-on', 'journeying'); html.classList.add('revealed');
    if (subtitle) subtitle.classList.remove('on');
    window.gsap.to(S.gatherMat.uniforms.uOpacity, { value: 0, duration: fast ? .2 : 1.6, ease: 'power1.out', onComplete: function () { if (S.gather) S.gather.visible = false; } });
    setTimeout(function () {
      S.disposeRoom(); S.ambient = true; S.screensHidden = true;
      if (S.post) { S.post.uniforms.uMotion.value = 0; S.post.uniforms.uAb.value = 0; }
    }, fast ? 400 : 2200);
    setTimeout(function () { var i = U.$('#intro'); if (i) i.hidden = true; U.$('#stage').setAttribute('data-state', 'ambient'); }, fast ? 300 : 1800);
    R.main && R.main.afterIntro && R.main.afterIntro();
  }

  J.init = function () {
    S = R.scene; C = R.camera; T = R.tv;
    FOG_A = new THREE.Color(0x030303); FOG_B = new THREE.Color(0x26221e); FOG_C = new THREE.Color(0x8f8676); tmp = new THREE.Color();
    subtitle = U.$('#subtitle'); hud = U.$('#intro');
    apply(0);
    U.$('#enterBtn').addEventListener('click', J.start);
    U.$('#skipIntro').addEventListener('click', J.skip);
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && !J.done && !document.querySelector('.case.open')) J.skip(); });
  };

  J.start = function () {
    if (J.running || J.done) return;
    J.running = true; T.enable(false); html.classList.add('journeying');
    C.setMode('journey'); C.jp = 0; st.p = 0;
    var k = 1 / S.q.speed, gsap = window.gsap;
    tl = gsap.timeline({ onUpdate: function () { C.jp = st.p; apply(st.p); }, onComplete: function () { finalize(false); } });
    tl.to(st, { p: .2, duration: 4.6 * k, ease: 'power1.in' })                    /* A: approach */
      .to(st, { p: .43, duration: 2.8 * k, ease: 'none' })                         /* B: fly-through */
      .to(st, { p: .9, duration: 9.5 * k, ease: 'none' })                          /* C: fog corridor */
      .to(st, { p: 1, duration: 4.2 * k, ease: 'sine.out' });                      /* D: reveal */
    tl.call(function () { R.portfolio.reveal({}); }, null, tl.duration() - 2.6 * k);
    CAPTIONS.forEach(function (c) { tl.call(function () { showCaption(c[1]); }, null, c[0] * k); });
  };

  J.skip = function () {
    if (J.done) return;
    if (tl) tl.kill();
    st.p = 1; C.jp = 1; apply(1); C.snap(); C.setFocus(null); T.enable(false);
    var m = U.$('#stage'); if (m) m.setAttribute('data-state', 'ambient');
    R.portfolio.reveal({ fast: true });
    finalize(true);
  };
})();
