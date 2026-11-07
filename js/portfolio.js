/* Portfolio layer: renders real content, the reveal sequence, project gallery, case studies, nav. */
(function () {
  var R = window.REA, U = R.utils, P = R.portfolio = {}, html = document.documentElement, calm = U.reducedMotion();
  var $ = U.$, $$ = U.$$, E = U.el, esc = U.escape, cfg = R.config, projects = R.projects, revealed = false;
  var rail, panels = [], constel, chapterPrev, chapterView, chapterIdx = -1, chapterCanvas;

  var CHAPTERS = [
    { k: 'Foundation', t: 'Computer Science', art: 'code', d: 'A Computer Science student who wants to understand how the system works underneath, not only how it looks on top.' },
    { k: 'Mobile', t: 'Mobile application development', art: 'trace', d: 'Flutter and Dart apps such as TRACE, an attendance system, and Our Little Archive, a shared memory journal.' },
    { k: 'Web', t: 'Web development', art: 'gnlr', d: 'Interfaces in HTML, CSS and JavaScript, and a Python and Flask application that suggests inclusive wording.' },
    { k: 'Backend', t: 'Backend integration', art: 'archive', d: 'Connecting front ends to real services: Firebase in TRACE, Supabase in Our Little Archive, Flask in the language tool.' },
    { k: 'Research', t: 'Computer vision research', art: 'cacao', d: 'Cacao Vision: classifying Black Pod Rot severity with CNNs and Bayesian hyperparameter optimization. Still in progress.' },
    { k: 'Experiments', t: 'Software development and experimentation', art: 'void', d: 'Visual experiments like Void Experience, and repositories kept honest about what is finished and what is still in progress.' }
  ];

  /* ───────── render ───────── */
  function renderProjects() {
    rail = $('#rail'); if (!rail) return;
    projects.forEach(function (p) {
      var a = E('article', 'panel'); a.dataset.id = p.id; a.style.setProperty('--accent', p.accent);
      a.innerHTML =
        '<div class="panel-media" data-cursor="Open"><canvas width="640" height="480" aria-hidden="true"></canvas><span class="panel-idx mono">' + p.index + '</span><i class="spot" aria-hidden="true"></i></div>' +
        '<div class="panel-info"><p class="meta mono"><span class="dot"></span>' + esc(p.statusKind) + ': ' + esc(p.status) + '</p>' +
        '<h3 class="panel-title">' + esc(p.title) + '</h3><p class="panel-desc">' + esc(p.desc) + '</p>' +
        '<ul class="tags">' + p.tech.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="panel-actions"><button type="button" class="cta open" data-magnet><span>Open case study</span><b aria-hidden="true">→</b></button>' +
        '<a class="link" href="' + p.repo + '" target="_blank" rel="noopener noreferrer">' + esc(p.repoLabel) + ' ↗</a>' +
        (p.demo ? '<a class="link" href="' + p.demo + '" target="_blank" rel="noopener noreferrer">Live demo ↗</a>' : '') + '</div>' +
        '<p class="gh-meta mono" data-repo="' + p.repo + '"></p></div>';
      rail.appendChild(a); panels.push(a);
      var media = $('.panel-media', a), cv = $('canvas', a), pv = R.fx.preview(cv, p.id), title = $('.panel-title', a);
      $('.open', a).addEventListener('click', function () { P.openCase(p.id, { from: 'gallery', trigger: this }); });
      media.addEventListener('click', function (e) { P.openCase(p.id, { x: e.clientX, y: e.clientY, from: 'gallery', trigger: $('.open', a) }); });
      media.addEventListener('pointermove', function (e) {
        var r = media.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        if (!calm) media.style.transform = 'rotateY(' + (px * 12).toFixed(2) + 'deg) rotateX(' + (-py * 10).toFixed(2) + 'deg) translateZ(18px)';
        media.style.setProperty('--sx', (px + .5) * 100 + '%'); media.style.setProperty('--sy', (py + .5) * 100 + '%');
      });
      media.addEventListener('pointerleave', function () { media.style.transform = ''; });
      a.addEventListener('pointerenter', function () { if (!calm) U.scramble(title, p.title, 520); });
    });
    var prev = $('#railPrev'), next = $('#railNext'), count = $('#railCount');
    function step(d) { var w = panels[0].getBoundingClientRect().width + 32; rail.scrollBy({ left: d * w, behavior: calm ? 'auto' : 'smooth' }); }
    prev.addEventListener('click', function () { step(-1); }); next.addEventListener('click', function () { step(1); });
    rail.addEventListener('keydown', function (e) { if (e.target !== rail) return; if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } });
    function update() {
      var rc = rail.getBoundingClientRect(), cx = rc.left + rc.width / 2, best = 0, bd = 1e9;
      panels.forEach(function (pn, i) {
        var r = pn.getBoundingClientRect(), o = U.clamp(((r.left + r.width / 2) - cx) / (rc.width * .65), -1, 1), d = Math.abs(o);
        pn.style.setProperty('--o', o.toFixed(3)); pn.style.setProperty('--a', d.toFixed(3)); if (d < bd) { bd = d; best = i; }
      });
      count.textContent = String(best + 1).padStart(2, '0') + ' / ' + String(panels.length).padStart(2, '0');
      prev.disabled = rail.scrollLeft < 8; next.disabled = rail.scrollLeft > rail.scrollWidth - rail.clientWidth - 8;
    }
    var q = false; rail.addEventListener('scroll', function () { if (!q) { q = true; requestAnimationFrame(function () { q = false; update(); }); } }, { passive: true });
    addEventListener('resize', update); update();
    if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .25 }); panels.forEach(function (pn) { io.observe(pn); }); }
    else panels.forEach(function (pn) { pn.classList.add('in'); });
  }

  function renderTimeline() {
    var ol = $('#timeline'); if (!ol) return;
    chapterCanvas = $('#chapterCanvas'); chapterView = $('#chapterView');
    CHAPTERS.forEach(function (c, i) {
      var li = E('li'); li.innerHTML = '<button type="button" class="tl-item" aria-pressed="false" data-cursor="View"><small class="mono">' + String(i + 1).padStart(2, '0') + ' · ' + esc(c.k) + '</small><span>' + esc(c.t) + '</span><em>' + esc(c.d) + '</em></button>';
      $('button', li).addEventListener('click', function () { setChapter(i); }); $('button', li).addEventListener('focus', function () { setChapter(i); }); ol.appendChild(li);
    });
    chapterPrev = R.fx.preview(chapterCanvas, CHAPTERS[0].art);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setChapter($$('.tl-item', ol).indexOf($('button', e.target))); }); }, { rootMargin: '-45% 0px -45% 0px' });
      $$('li', ol).forEach(function (li) { io.observe(li); });
    }
    setChapter(0);
  }
  function setChapter(i) {
    if (i < 0 || i === chapterIdx) return; chapterIdx = i; var c = CHAPTERS[i];
    $$('#timeline .tl-item').forEach(function (b, j) { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    chapterPrev.id = c.art; chapterView.classList.remove('swap'); void chapterView.offsetWidth; chapterView.classList.add('swap');
    $('#chapterTitle').textContent = c.t; $('#chapterKey').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(CHAPTERS.length).padStart(2, '0') + ' · ' + c.k;
    R.art.draw(c.art, chapterPrev.x, chapterCanvas.width, chapterCanvas.height, chapterPrev.off, chapterPrev.m);
  }

  function renderToolkit() {
    var host = $('#toolkitGroups'); if (!host) return;
    R.toolkit.forEach(function (g) {
      var s = E('section', 'tk-group'); s.innerHTML = '<h3>' + esc(g.name) + '</h3><ul class="chips">' + g.items.map(function (n) { return '<li><button type="button" class="chip" data-magnet aria-pressed="false" data-name="' + esc(n) + '">' + esc(n) + '</button></li>'; }).join('') + '</ul>'; host.appendChild(s);
    });
    constel = R.fx.constellation($('#constellation'), R.toolkit);
    var pinned = null;
    $$('.chip', host).forEach(function (b) {
      b.addEventListener('pointerenter', function () { constel.highlight(b.dataset.name); }); b.addEventListener('focus', function () { constel.highlight(b.dataset.name); });
      b.addEventListener('pointerleave', function () { constel.highlight(pinned); }); b.addEventListener('blur', function () { constel.highlight(pinned); });
      b.addEventListener('click', function () { pinned = pinned === b.dataset.name ? null : b.dataset.name; $$('.chip', host).forEach(function (o) { o.setAttribute('aria-pressed', o.dataset.name === pinned ? 'true' : 'false'); }); constel.highlight(pinned); });
    });
  }

  function applyGithub(G) {
    var count = G.repos.length || cfg.fallbackRepoCount;
    $$('[data-gh-count]').forEach(function (el) { el.textContent = count; });
    $$('.gh-meta').forEach(function (el) { var r = G.find(el.dataset.repo); el.textContent = r ? ((r.language ? r.language + ' · ' : '') + 'Updated ' + G.date(r.updated)) : ''; });
    var list = $('#ghList'), note = $('#ghNote'); if (!list) return; list.innerHTML = '';
    var rows = G.repos.slice(0, 8);
    if (G.status === 'ok' && rows.length) {
      rows.forEach(function (r) { var li = E('li'); li.innerHTML = '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(r.name) + '</b><span>' + esc(r.description || 'No description on GitHub.') + '</span><em class="mono">' + esc((r.language || '—') + ' · ' + G.date(r.updated)) + '</em></a>'; list.appendChild(li); });
      note.textContent = 'Public repositories, fetched from the GitHub API and cached for an hour.';
    } else {
      projects.forEach(function (p) { var li = E('li'); li.innerHTML = '<a href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(p.title) + '</b><span>' + esc(p.desc) + '</span><em class="mono">' + esc(p.tech.join(' · ')) + '</em></a>'; list.appendChild(li); });
      note.textContent = 'Live GitHub data is unavailable right now, so this shows the projects from this portfolio instead.';
    }
  }

  function renderContact() {
    var gh = $('#contactLinks'); if (!gh) return;
    if (cfg.email) { var a = E('a', 'big-link', '<span>Email</span><b>' + esc(cfg.email) + '</b>'); a.href = 'mailto:' + cfg.email; a.setAttribute('data-cursor', 'Write'); gh.appendChild(a); }
    var big = $$('.mega-contact .line'); var chars = [];
    big.forEach(function (l) { chars = chars.concat(U.splitChars(l)); });
    var box = $('.mega-contact');
    if (!calm && U.finePointer()) {
      box.addEventListener('pointermove', function (e) {
        chars.forEach(function (c) { var r = c.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy), k = Math.max(0, 1 - d / 220);
          c.style.transform = 'translate3d(' + (-dx * k * .12).toFixed(1) + 'px,' + (-dy * k * .12).toFixed(1) + 'px,0) scale(' + (1 + k * .22).toFixed(3) + ')'; c.style.color = k > .35 ? 'var(--amber)' : ''; });
      });
      box.addEventListener('pointerleave', function () { chars.forEach(function (c) { c.style.transform = ''; c.style.color = ''; }); });
    }
  }

  /* ───────── generic reveal-on-scroll ───────── */
  function bindReveals() {
    html.classList.add('rv');
    $$('.display').forEach(function (h) { var w = U.splitWords(h); w.forEach(function (s, i) { s.style.setProperty('--i', i); }); h.classList.add('split'); });
    $$('.statement').forEach(function (s) { U.splitWords(s); });
    var els = $$('[data-reveal],.display');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .2, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function bindNav() {
    var links = $$('.top nav a, .foot nav a'), sections = $$('main > section[id]');
    links.forEach(function (a) { a.addEventListener('click', function () { var id = a.getAttribute('href'); if (id && id.charAt(0) === '#') { var t = $(id); if (t) { t.setAttribute('tabindex', '-1'); setTimeout(function () { t.focus({ preventScroll: true }); }, 400); } } }); });
    if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { $$('.top nav a').forEach(function (a) { var on = a.getAttribute('href') === '#' + e.target.id; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); }); } }); }, { rootMargin: '-45% 0px -50% 0px' }); sections.forEach(function (s) { io.observe(s); }); }
    var bar = $('.top'); addEventListener('scroll', function () { bar.classList.toggle('solid', scrollY > 40); }, { passive: true });
    var rp = $('#replay'); if (rp) rp.addEventListener('click', function () { try { sessionStorage.setItem('rea.replay', '1'); } catch (e) {} history.replaceState(null, '', location.pathname); location.reload(); });
  }

  /* ───────── case studies ───────── */
  var caseEl, lastFocus, casePrev, curOpts;
  function caseData(id) {
    var p = projects.filter(function (x) { return x.id === id; })[0]; if (p) return { p: p, idx: projects.indexOf(p) };
    if (id === 'identity') return { x: { id: 'identity', kind: 'identity', title: 'Developer identity', eyebrow: 'Screen · Identity', status: null,
      problem: null, purpose: 'Computer Science student working across mobile and web development, backend integration and computer-vision research. I test ideas, improve the small details, and keep my repositories honest about what is finished and what is still in progress.', build: ['Mobile and web applications', 'Intelligent systems', 'Technology-driven experiences that solve real problems'], tech: ['Python', 'Dart', 'JavaScript', 'Flutter', 'PyTorch'], repo: cfg.github, repoLabel: 'GitHub profile', current: 'Based in the Philippines.' } };
    if (id === 'code') return { x: { id: 'code', kind: 'code', title: 'Code experiments', eyebrow: 'Screen · Experiments', status: null,
      problem: null, purpose: 'Small experiments and unfinished ideas live in my repositories. The code on this screen is decorative: it is not taken from any project.', build: ['Void Experience, a simulated hacked-screen visual', 'Computer vision experiments in Python', 'Mobile and web prototypes'], tech: ['Python', 'JavaScript', 'Flutter', 'Git'], repo: cfg.github, repoLabel: 'Browse repositories', current: 'Ongoing.' } };
    return null;
  }
  function buildCase(id) {
    var d = caseData(id), src = d.p || d.x, i = d.idx, total = projects.length, isP = !!d.p;
    var h = '<div class="case-top"><button type="button" class="case-close" id="caseClose" data-cursor="Close"><span aria-hidden="true">←</span><b id="caseBack"></b></button><p class="mono case-count">' + (isP ? 'Case study · ' + src.index + ' / 0' + total : esc(src.eyebrow)) + '</p></div>' +
      '<div class="case-grid"><header class="case-head"><h2 id="caseTitle" class="case-title">' + esc(src.title) + '</h2>' +
      (isP ? '<p class="chip-row"><span class="chip-static strong">' + esc(src.statusKind) + ': ' + esc(src.status) + '</span></p>' : '') +
      '<p class="case-lead">' + esc(isP ? src.desc : src.purpose) + '</p></header>' +
      '<div class="case-media"><canvas id="caseCanvas" width="960" height="720" aria-hidden="true"></canvas></div></div>' +
      '<div class="case-cols">' +
      (src.problem ? '<section><h3 class="mono">The problem</h3><p>' + esc(src.problem) + '</p></section>' : '') +
      (isP ? '<section><h3 class="mono">Purpose</h3><p>' + esc(src.purpose) + '</p></section>' : '<section><h3 class="mono">About</h3><p>' + esc(src.current) + '</p></section>') +
      '<section><h3 class="mono">Implementation</h3><ul class="bul">' + src.build.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></section>' +
      '<section><h3 class="mono">Technologies</h3><ul class="tags">' + src.tech.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></section>' +
      (isP ? '<section><h3 class="mono">Current status</h3><p>' + esc(src.current) + '</p></section>' : '') +
      '<section><h3 class="mono">Links</h3><p class="links"><a class="cta" href="' + esc(src.repo) + '" target="_blank" rel="noopener noreferrer"><span>' + esc(src.repoLabel) + '</span><b aria-hidden="true">↗</b></a>' + (src.demo ? ' <a class="link" href="' + esc(src.demo) + '" target="_blank" rel="noopener noreferrer">Live demo ↗</a>' : '') + '</p><p class="gh-meta mono" data-repo="' + esc(src.repo) + '"></p></section></div>';
    if (isP) {
      h += '<section class="shots"><h3 class="mono">Screenshots</h3>' + (src.shots && src.shots.length ? '<div class="shot-row">' + src.shots.map(function (s) { return '<figure><img loading="lazy" src="' + esc(s.src) + '" alt="' + esc(s.alt || src.title + ' screenshot') + '"></figure>'; }).join('') + '</div>' : '<p class="muted">No screenshots are included in this repository yet. Add images to <code>assets/projects/</code> and list them under <code>shots</code> in <code>js/config.js</code> and they will appear here. The artwork above is illustrative, not a screenshot.</p>') + '</section>';
      var pv = projects[(i + total - 1) % total], nx = projects[(i + 1) % total];
      h += '<nav class="case-nav" aria-label="Other projects"><button type="button" data-go="' + pv.id + '"><small class="mono">Previous</small><span>' + esc(pv.title) + '</span></button><button type="button" data-go="' + nx.id + '"><small class="mono">Next</small><span>' + esc(nx.title) + '</span></button></nav>';
    }
    return h;
  }
  function wireCase(id) {
    var inner = $('.case-inner', caseEl); inner.innerHTML = buildCase(id);
    $('#caseBack').textContent = curOpts.from === 'room' ? 'Back to the screens' : 'Back to projects';
    $('#caseClose').addEventListener('click', P.closeCase);
    $$('[data-go]', inner).forEach(function (b) { b.addEventListener('click', function () { var go = b.dataset.go; R.fx.unpreview(casePrev); wireCase(go); inner.scrollTop = 0; $('#caseClose').focus(); }); });
    var cv = $('#caseCanvas'), d = caseData(id), kind = d.p ? d.p.id : d.x.kind; casePrev = R.fx.preview(cv, kind);
    if (R.github.status !== 'idle') { var G = R.github; $$('.gh-meta', inner).forEach(function (el) { var r = G.find(el.dataset.repo); el.textContent = r ? ((r.language ? r.language + ' · ' : '') + 'Updated ' + G.date(r.updated)) : ''; }); }
  }
  P.openCase = function (id, opts) {
    if (!caseData(id)) return; curOpts = opts || {}; caseEl = $('#case'); lastFocus = document.activeElement;
    wireCase(id); caseEl.hidden = false; caseEl.classList.add('open'); html.classList.add('case-open'); $('.case-inner', caseEl).scrollTop = 0;
    var x = curOpts.x != null ? curOpts.x : innerWidth / 2, y = curOpts.y != null ? curOpts.y : innerHeight / 2, r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    if (!calm && caseEl.animate) caseEl.animate([{ clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' }, { clipPath: 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)' }], { duration: 850, easing: 'cubic-bezier(.7,0,.15,1)' });
    caseEl._x = x; caseEl._y = y; setTimeout(function () { var b = $('#caseClose'); b && b.focus({ preventScroll: true }); }, calm ? 0 : 500);
  };
  P.closeCase = function () {
    if (!caseEl || !caseEl.classList.contains('open')) return;
    var x = caseEl._x, y = caseEl._y, r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    function end() { caseEl.classList.remove('open'); caseEl.hidden = true; html.classList.remove('case-open'); R.fx.unpreview(casePrev); casePrev = null;
      var cb = curOpts.onClose; if (cb) cb(); else if (curOpts.trigger && document.contains(curOpts.trigger)) curOpts.trigger.focus({ preventScroll: true }); else if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true }); }
    if (!calm && caseEl.animate) { var a = caseEl.animate([{ clipPath: 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)' }, { clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' }], { duration: 650, easing: 'cubic-bezier(.7,0,.15,1)', fill: 'forwards' }); a.onfinish = function () { a.cancel(); end(); }; } else end();
  };
  function bindCase() {
    caseEl = $('#case');
    addEventListener('keydown', function (e) {
      if (!caseEl.classList.contains('open')) return;
      if (e.key === 'Escape') { e.stopPropagation(); P.closeCase(); }
      if (e.key === 'Tab') { var f = $$('a[href],button:not([disabled])', caseEl).filter(function (n) { return n.offsetParent !== null; }); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    }, true);
  }

  /* ───────── hero reveal: a deliberate sequence, not everything at once ───────── */
  P.reveal = function (opts) {
    if (revealed) return; revealed = true; opts = opts || {};
    html.classList.add('revealing');
    var inst = opts.instant || calm, fast = opts.fast, k = fast ? .22 : 1;
    if (inst) { html.classList.add('revealed-instant'); if (opts.instant) html.classList.remove('intro-on'); return; }
    var ease = 'cubic-bezier(.16,.8,.2,1)';
    function an(el, kf, o) { return el && el.animate ? el.animate(kf, { fill: 'both', easing: ease, duration: (o.d || 800) * k, delay: (o.delay || 0) * k }) : null; }
    var t = 0;
    an($('.top'), [{ transform: 'translateY(-110%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { d: 900, delay: 100 });
    /* 1 — the name materialises letter by letter out of the haze */
    var chars = $$('.mega .c'); chars.forEach(function (c, i) { an(c, [{ opacity: 0, transform: 'translate3d(0,.35em,-300px) rotateX(70deg) scale(1.2)', filter: 'blur(18px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { d: 1100, delay: 250 + i * 85 + Math.random() * 120 }); });
    t = 250 + chars.length * 85 + 500;
    an($('.hero-rule'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { d: 1200, delay: t - 600 });
    /* 2 — role lines wipe in through masks */
    $$('.roles li span').forEach(function (s, i) { an(s, [{ transform: 'translateY(115%)' }, { transform: 'none' }], { d: 800, delay: t + i * 150 }); }); t += 450;
    /* 3 — the introduction, word by word */
    $$('.lead .wd').forEach(function (w, i) { an(w, [{ opacity: 0, transform: 'translateY(.6em)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { d: 700, delay: t + i * 28 }); }); t += 350;
    /* 4 — portrait develops, then actions and numbers */
    an($('.portrait'), [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { d: 1400, delay: 500 });
    an($('.portrait img'), [{ transform: 'scale(1.35)', filter: 'grayscale(1) brightness(.4)' }, { transform: 'scale(1)', filter: 'grayscale(.85) brightness(.95)' }], { d: 1800, delay: 500 });
    $$('.hero .actions, .hero .nums, .scroll-cue, .hero .kicker').forEach(function (e, i) { an(e, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { d: 800, delay: t + 200 + i * 140 }); });
  };

  /* ───────── init ───────── */
  P.init = function () {
    var h1 = $('.mega'); $$('.mega .line').forEach(function (l) { U.splitChars(l); l.removeAttribute('aria-label'); l.setAttribute('aria-hidden', 'true'); });
    if (h1) h1.setAttribute('aria-label', 'Rea Amparo');
    U.splitWords($('.lead'));
    renderProjects(); renderTimeline(); renderToolkit(); renderContact(); bindReveals(); bindNav(); bindCase();
    R.fx.scroll(); R.fx.cursor(); R.fx.magnet();
    R.github.onReady(applyGithub); R.github.load();
  };
})();
