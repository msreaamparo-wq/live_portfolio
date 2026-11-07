/* Interaction systems shared by the portfolio: live previews, custom cursor, magnetic hover,
   scroll-linked motion, and the tech constellation. All loops pause when off-screen. */
(function () {
  var R = window.REA, U = R.utils, F = R.fx = {}, html = document.documentElement, calm = U.reducedMotion();

  /* ───────── live artwork previews (canvas) ───────── */
  var previews = [], pRun = false, pLast = 0, pClock = 0;
  var pio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target._p.vis = e.isIntersecting; }); if (!pRun && previews.some(function (p) { return p.vis; })) startPreviews();
  }, { rootMargin: '120px' }) : null;

  F.preview = function (canvas, id) {
    var p = { c: canvas, x: canvas.getContext('2d'), id: id, vis: !pio, m: { x: .5, y: .5, hover: false }, off: Math.random() * 20 };
    canvas._p = p; previews.push(p);
    canvas.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); p.m.x = (e.clientX - r.left) / r.width; p.m.y = (e.clientY - r.top) / r.height; p.m.hover = true; });
    canvas.addEventListener('pointerleave', function () { p.m.hover = false; p.m.x = p.m.y = .5; });
    if (pio) pio.observe(canvas); else startPreviews();
    R.art.draw(id, p.x, canvas.width, canvas.height, p.off, p.m);   /* first frame immediately, also for reduced motion */
    return p;
  };
  F.unpreview = function (p) { if (!p) return; if (pio) pio.unobserve(p.c); previews.splice(previews.indexOf(p), 1); };
  function startPreviews() { if (pRun || calm) return; pRun = true; pLast = performance.now(); requestAnimationFrame(pLoop); }
  function pLoop(now) {
    var any = false; if (document.hidden) { pRun = false; return; }
    var dt = now - pLast;
    if (dt > 33) {
      pLast = now; pClock += dt / 1000;
      for (var i = 0; i < previews.length; i++) { var p = previews[i]; if (!p.vis) continue; any = true; R.art.draw(p.id, p.x, p.c.width, p.c.height, pClock + p.off, p.m); }
    } else any = true;
    if (any) requestAnimationFrame(pLoop); else pRun = false;
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) startPreviews(); });

  /* ───────── custom cursor + spotlight ───────── */
  F.cursor = function () {
    if (!U.finePointer() || calm) return;
    var el = U.$('.cursor'), lab = U.$('.cursor-label'), x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, hot = false;
    html.classList.add('has-cursor');
    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; el.classList.add('vis'); html.style.setProperty('--mx', tx + 'px'); html.style.setProperty('--my', ty + 'px'); }, { passive: true });
    document.addEventListener('mouseleave', function () { el.classList.remove('vis'); });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest && e.target.closest('a,button,[data-cursor],input,.chip');
      el.classList.toggle('hot', !!t); lab.textContent = t ? (t.getAttribute('data-cursor') || '') : '';
    });
    (function loop() {
      x += (tx - x) * .2; y += (ty - y) * .2;
      el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      el.classList.toggle('tv', !!(R.tv && R.tv.focus && R.tv.enabled));
      requestAnimationFrame(loop);
    })();
  };

  /* ───────── magnetic elements ───────── */
  F.magnet = function () {
    if (!U.finePointer() || calm) return;
    var els = U.$$('[data-magnet]'), px = 0, py = 0, queued = false;
    function run() {
      queued = false;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy), R0 = Math.max(r.width, r.height) * .9 + 40;
        if (d < R0) { var k = (1 - d / R0) * .35; el.style.transform = 'translate3d(' + dx * k + 'px,' + dy * k + 'px,0)'; el._m = 1; }
        else if (el._m) { el.style.transform = ''; el._m = 0; }
      });
    }
    addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; if (!queued) { queued = true; requestAnimationFrame(run); } }, { passive: true });
  };

  /* ───────── scroll-linked motion ───────── */
  F.scroll = function (ctx) {
    var hero = U.$('.hero'), l1 = U.$('.l1'), l2 = U.$('.l2'), strip = U.$('.strip-in'), words = U.$$('.statement .wd'), tlFill = U.$('.tl-fill'), tl = U.$('.timeline'),
      floats = U.$$('.float-tech span'), stmt = U.$('.statement'), queued = false;
    function frame() {
      queued = false; var y = scrollY, vh = innerHeight;
      html.style.setProperty('--sy', y.toFixed(1));
      if (hero && y < vh * 1.4) {
        var p = U.clamp(y / vh, 0, 1.4);
        if (l1) l1.style.transform = 'translate3d(' + (-p * 9).toFixed(2) + 'vw,0,0)';
        if (l2) l2.style.transform = 'translate3d(' + (p * 9).toFixed(2) + 'vw,0,0)';
        hero.style.setProperty('--hp', p.toFixed(3));
      }
      if (strip) strip.style.transform = 'translate3d(' + (-(y * .35) % 1200).toFixed(1) + 'px,0,0)';
      if (stmt && words.length) {
        var r = stmt.getBoundingClientRect(), pr = U.clamp((vh * .8 - r.top) / (r.height + vh * .35), 0, 1), n = Math.round(pr * words.length);
        for (var i = 0; i < words.length; i++) words[i].classList.toggle('lit', i < n);
      }
      if (tl && tlFill) { var tr = tl.getBoundingClientRect(); tlFill.style.transform = 'scaleY(' + U.clamp((vh * .55 - tr.top) / tr.height, 0, 1).toFixed(3) + ')'; }
      floats.forEach(function (f, i) { var d = (i % 3 + 1) * .05; f.style.transform = 'translate3d(0,' + (-y * d).toFixed(1) + 'px,0)'; });
      if (ctx && ctx.onScroll) ctx.onScroll(y);
    }
    function q() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
    addEventListener('scroll', q, { passive: true }); addEventListener('resize', q); frame();
  };

  /* ───────── tech constellation ───────── */
  F.constellation = function (canvas, groups) {
    var x = canvas.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2), W = 0, H = 0, nodes = [], hubs = [], mouse = { x: -999, y: -999 }, vis = false, running = false, hl = null, hover = null;
    var COLORS = ['#d89b3c', '#c4452d', '#ece4d4', '#9d9a92'];
    function layout() {
      var r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      var pos = W > 700 ? [[.2, .3], [.8, .3], [.26, .74], [.78, .72]] : [[.5, .13], [.5, .38], [.5, .63], [.5, .88]], rnd = U.rng(42);
      nodes = []; hubs = [];
      groups.forEach(function (g, gi) {
        var hub = { x: pos[gi][0] * W, y: pos[gi][1] * H, name: g.name, c: COLORS[gi], gi: gi }; hubs.push(hub);
        var rad = Math.min(W * (W > 700 ? .15 : .3), H * (W > 700 ? .24 : .1)) + 10;
        g.items.forEach(function (name, i) {
          nodes.push({ name: name, gi: gi, hub: hub, a: (i / g.items.length) * 6.283 + rnd(), r: rad * (.6 + rnd() * .55), s: (.05 + rnd() * .08) * (gi % 2 ? -1 : 1), x: 0, y: 0, ox: 0, oy: 0 });
        });
      });
    }
    function draw(t) {
      x.clearRect(0, 0, W, H); x.lineWidth = 1;
      hubs.forEach(function (h, i) { var n = hubs[(i + 1) % hubs.length]; x.strokeStyle = 'rgba(236,228,212,.07)'; x.beginPath(); x.moveTo(h.x, h.y); x.lineTo(n.x, n.y); x.stroke(); });
      var best = null, bd = 28;
      nodes.forEach(function (n) {
        var a = n.a + t * n.s, tx = n.hub.x + Math.cos(a) * n.r, ty = n.hub.y + Math.sin(a) * n.r * .78;
        var dx = mouse.x - tx, dy = mouse.y - ty, d = Math.hypot(dx, dy), pull = d < 150 ? (1 - d / 150) * .28 : 0;
        n.ox += (dx * pull - n.ox) * .12; n.oy += (dy * pull - n.oy) * .12; n.x = tx + n.ox; n.y = ty + n.oy;
        if (d < bd) { bd = d; best = n; }
      });
      hover = best;
      nodes.forEach(function (n, i) {
        var on = !hl || hl === n.name || hl === n.hub.name, c = COLORS[n.gi];
        x.globalAlpha = on ? 1 : .18; x.strokeStyle = c; x.lineWidth = 1;
        x.globalAlpha = (on ? .2 : .05); x.beginPath(); x.moveTo(n.hub.x, n.hub.y); x.lineTo(n.x, n.y); x.stroke();
        var nx = nodes[i + 1]; if (nx && nx.gi === n.gi) { x.beginPath(); x.moveTo(n.x, n.y); x.lineTo(nx.x, nx.y); x.stroke(); }
        x.globalAlpha = on ? 1 : .25; x.fillStyle = c; x.beginPath(); x.arc(n.x, n.y, (hover === n || hl === n.name) ? 5 : 3, 0, 7); x.fill();
        x.font = (hover === n || hl === n.name ? '600 ' : '400 ') + '11px ui-monospace,Menlo,Consolas,monospace'; x.fillStyle = (hover === n || hl === n.name) ? '#ece4d4' : 'rgba(236,228,212,.62)'; x.fillText(n.name, n.x + 8, n.y + 4);
      });
      hubs.forEach(function (h) { x.globalAlpha = !hl || hl === h.name ? 1 : .3; x.strokeStyle = h.c; x.lineWidth = 1.5; x.beginPath(); x.arc(h.x, h.y, 9, 0, 7); x.stroke(); x.fillStyle = h.c; x.beginPath(); x.arc(h.x, h.y, 3, 0, 7); x.fill();
        x.font = '600 11px ui-monospace,Menlo,Consolas,monospace'; x.fillStyle = h.c; x.textAlign = 'center'; x.fillText(h.name.toUpperCase(), h.x, h.y - 17); x.textAlign = 'left'; });
      x.globalAlpha = 1;
    }
    var t0 = performance.now(), last = 0;
    function loop(now) { if (!vis || document.hidden) { running = false; return; } requestAnimationFrame(loop); if (now - last < 30) return; last = now; draw((now - t0) / 1000); }
    function start() { if (running) return; running = true; requestAnimationFrame(loop); }
    layout(); draw(0);
    if (!calm && 'IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis) start(); }, { rootMargin: '80px' }).observe(canvas);
    canvas.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    addEventListener('resize', function () { layout(); if (calm) draw(0); });
    return { highlight: function (n) { hl = n; if (calm) draw(0); } };
  };
})();
