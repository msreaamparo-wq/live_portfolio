/* Small shared helpers. No DOM side effects. */
(function () {
  var R = window.REA = window.REA || {};
  var U = R.utils = {};

  U.$ = function (s, r) { return (r || document).querySelector(s); };
  U.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  U.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };
  /* Frame-rate independent smoothing: lambda ~ 2 (slow) .. 10 (snappy) */
  U.damp = function (a, b, lambda, dt) { return U.lerp(a, b, 1 - Math.exp(-lambda * dt)); };
  U.smooth = function (t) { t = U.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  U.map = function (v, a, b, c, d) { return c + (d - c) * U.clamp((v - a) / (b - a), 0, 1); };

  /* Seeded PRNG so the wall is identical on every visit */
  U.rng = function (seed) {
    var s = seed >>> 0;
    return function () {
      s += 0x6D2B79F5; var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  U.reducedMotion = function () {
    return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  U.finePointer = function () {
    return window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  };

  U.hasWebGL = function () {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  };

  /* Picks scene quality from viewport + hardware hints */
  U.quality = function () {
    var w = Math.min(innerWidth, innerHeight * 2), mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
    var coarse = matchMedia('(pointer: coarse)').matches;
    var tier = 'high';
    if (innerWidth < 760 || coarse) tier = 'low';
    else if (innerWidth < 1100 || mem <= 4 || cores <= 4) tier = 'mid';
    var dpr = Math.min(window.devicePixelRatio || 1, tier === 'high' ? 1.75 : tier === 'mid' ? 1.25 : 1);
    return {
      tier: tier, pixelRatio: dpr, post: tier !== 'low', dust: tier === 'high' ? 1400 : tier === 'mid' ? 700 : 260,
      gather: tier === 'high' ? 5000 : tier === 'mid' ? 3000 : 1400, corridor: tier === 'low' ? 7 : tier === 'mid' ? 11 : 14,
      fillers: tier === 'low' ? 0.55 : 1, speed: tier === 'low' ? 0.7 : 1, w: w
    };
  };

  /* Wrap characters of an element in spans (keeps accessible label on the parent) */
  U.splitChars = function (el) {
    var text = el.textContent;
    el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
    el.textContent = '';
    var out = [];
    text.split(/(\s+)/).forEach(function (w) {
      if (!w) return;
      if (!w.trim()) { el.appendChild(document.createTextNode(' ')); return; }
      var word = document.createElement('span'); word.className = 'w'; word.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < w.length; i++) {
        var c = document.createElement('span'); c.className = 'c'; c.textContent = w[i]; word.appendChild(c); out.push(c);
      }
      el.appendChild(word);
    });
    return out;
  };
  U.splitWords = function (el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var out = [];
    text.split(' ').forEach(function (w, i, a) {
      var s = document.createElement('span'); s.className = 'wd'; s.setAttribute('aria-hidden', 'true'); s.textContent = w;
      el.appendChild(s); out.push(s); if (i < a.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return out;
  };

  /* Text scramble — used on hover for kinetic headings */
  var GL = '!<>-_\\/[]{}=+*^?#01';
  U.scramble = function (el, finalText, duration) {
    if (U.reducedMotion()) { el.textContent = finalText; return; }
    cancelAnimationFrame(el._sc);
    var start = performance.now(), d = duration || 600, n = finalText.length;
    (function step(now) {
      var p = U.clamp((now - start) / d, 0, 1), s = '';
      for (var i = 0; i < n; i++) {
        var ch = finalText[i];
        s += (ch === ' ' || p > i / n + 0.15) ? ch : GL[(Math.random() * GL.length) | 0];
      }
      el.textContent = s;
      if (p < 1) el._sc = requestAnimationFrame(step); else el.textContent = finalText;
    })(start);
  };

  U.el = function (tag, cls, html) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e;
  };
  U.escape = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
})();
