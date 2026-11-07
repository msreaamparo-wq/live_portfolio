/* Boot: decides between the full cinematic experience and the plain portfolio, and wires them together. */
(function () {
  var R = window.REA, U = R.utils, html = document.documentElement, M = R.main = {};

  function plain(reason) {
    if (reason && window.console) console.info('[portfolio] cinematic intro skipped:', reason);
    html.classList.remove('intro-on', 'journeying'); html.classList.add('no-intro');
    var i = U.$('#intro'); if (i) i.hidden = true;
    var c = U.$('#stage'); if (c) c.hidden = true;
    R.portfolio.reveal({ instant: true });
  }

  M.afterIntro = function () {
    /* hand scroll back to the page and land at the top of the portfolio */
    window.scrollTo(0, 0);
    var h1 = U.$('.mega'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); h1.removeAttribute('tabindex'); }
    /* pause the 3D background once the hero is far off-screen */
    var stage = U.$('#stage');
    if ('IntersectionObserver' in window && R.scene.ready) {
      new IntersectionObserver(function (e) { if (e[0].isIntersecting) R.scene.resume(); else R.scene.pause(); }, { threshold: 0 }).observe(U.$('#top'));
    }
  };

  function boot() {
    R.portfolio.init();
    var params = location.search, replay = false;
    try { replay = sessionStorage.getItem('rea.replay') === '1'; sessionStorage.removeItem('rea.replay'); } catch (e) {}
    var deepLink = location.hash.length > 1 && location.hash !== '#top';
    if (U.reducedMotion()) return plain('prefers-reduced-motion');
    if (/[?&]nointro/.test(params)) return plain('?nointro');
    if (deepLink && !replay && !/[?&]intro/.test(params)) return plain('deep link');
    if (!window.THREE || !window.gsap) return plain('Three.js or GSAP did not load');
    if (!U.hasWebGL()) return plain('WebGL unavailable');
    try {
      if (document.fonts && document.fonts.load) document.fonts.load('900 40px Archivo');
      var q = U.quality();
      R.scene.init(U.$('#stage'), q); R.camera.init(); R.tv.init(); R.journey.init();
      R.tv.enable(true); R.scene.start();
      html.classList.add('intro-ready');
      /* if the scene stops rendering (context lost), never trap the visitor */
      U.$('#stage').addEventListener('webglcontextlost', function () { R.journey.skip(); });
    } catch (err) {
      if (window.console) console.error(err);
      try { R.scene.destroy(); } catch (e) {}
      plain('scene error');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
