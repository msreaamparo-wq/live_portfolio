/* Procedural artwork for each project. Used on the CRT screens AND the project previews,
   so every project keeps one consistent visual identity. Nothing here depicts real results
   or screenshots — it is illustrative art direction. */
(function () {
  var R = window.REA, U = R.utils;
  var IV = '#ece4d4', AMB = '#d89b3c', RUST = '#c4452d', BK = '#0a0a0a';
  var art = R.art = {};

  function rnd(seed) { return U.rng(seed); }
  function mono(ctx, px, w) { ctx.font = (w || 500) + ' ' + px + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'; }
  function sans(ctx, px, w) { ctx.font = (w || 800) + ' ' + px + 'px Archivo, "Arial Black", Impact, sans-serif'; }

  /* ── TRACE: QR check-in + event panels + grid ── */
  var qr = (function () { var r = rnd(7), g = []; for (var i = 0; i < 21 * 21; i++) g.push(r() > 0.52); return g; })();
  art.trace = function (c, w, h, t, m) {
    c.fillStyle = '#0b0c0c'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(216,155,60,.13)'; c.lineWidth = 1;
    var gs = h / 12, off = (t * 8) % gs;
    for (var x = -off; x < w; x += gs) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (var y = 0; y < h; y += gs) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    var s = h * 0.56, cx = w * 0.34 + (m ? (m.x - .5) * 12 : 0), cy = h * 0.5 + (m ? (m.y - .5) * 10 : 0), cell = s / 21;
    c.fillStyle = IV;
    for (var i = 0; i < 21; i++) for (var j = 0; j < 21; j++) {
      var fin = (i < 7 && j < 7) || (i > 13 && j < 7) || (i < 7 && j > 13);
      if (fin) { var fi = i % 14 > 6 ? i - 14 : i, fj = j > 13 ? j - 14 : j; var edge = fi === 0 || fi === 6 || fj === 0 || fj === 6, core = fi >= 2 && fi <= 4 && fj >= 2 && fj <= 4; if (!(edge || core)) continue; }
      else if (!qr[i * 21 + j]) continue;
      c.fillRect(cx - s / 2 + i * cell, cy - s / 2 + j * cell, cell * 0.9, cell * 0.9);
    }
    var sy = cy - s / 2 + ((Math.sin(t * 1.6) + 1) / 2) * s;
    var gr = c.createLinearGradient(0, sy - 14, 0, sy + 14); gr.addColorStop(0, 'rgba(196,69,45,0)'); gr.addColorStop(.5, 'rgba(196,69,45,.9)'); gr.addColorStop(1, 'rgba(196,69,45,0)');
    c.fillStyle = gr; c.fillRect(cx - s / 2 - 8, sy - 14, s + 16, 28);
    c.strokeStyle = AMB; c.lineWidth = 2; var L = s * 0.12, bx = cx - s / 2 - 8, by = cy - s / 2 - 8, bs = s + 16;
    [[bx, by, 1, 1], [bx + bs, by, -1, 1], [bx, by + bs, 1, -1], [bx + bs, by + bs, -1, -1]].forEach(function (q) { c.beginPath(); c.moveTo(q[0], q[1] + L * q[3]); c.lineTo(q[0], q[1]); c.lineTo(q[0] + L * q[2], q[1]); c.stroke(); });
    var px = w * 0.62, pw = w * 0.32;
    mono(c, h * 0.06, 700); c.fillStyle = AMB; c.fillText('EVENT PANEL', px, h * 0.24);
    for (var k = 0; k < 4; k++) {
      var yy = h * 0.32 + k * h * 0.13; c.strokeStyle = 'rgba(236,228,212,.25)'; c.strokeRect(px, yy, pw, h * 0.09);
      c.fillStyle = k === ((t | 0) % 4) ? 'rgba(216,155,60,.55)' : 'rgba(236,228,212,.12)'; c.fillRect(px + 2, yy + 2, (pw - 4) * (0.35 + 0.5 * ((k * 37) % 10) / 10), h * 0.09 - 4);
    }
    mono(c, h * 0.05, 500); c.fillStyle = 'rgba(236,228,212,.6)'; c.fillText('QR · ROLE · LOCATION', px, h * 0.9);
    sans(c, h * 0.1); c.fillStyle = IV; c.fillText('TRACE', w * 0.06, h * 0.14);
  };

  /* ── Cacao Vision: pod, texture, classification brackets ── */
  art.cacao = function (c, w, h, t, m) {
    var g = c.createRadialGradient(w * .5, h * .5, 10, w * .5, h * .5, w * .7); g.addColorStop(0, '#2a1a12'); g.addColorStop(1, '#090605'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    var cx = w * .5 + (m ? (m.x - .5) * 18 : 0), cy = h * .5 + (m ? (m.y - .5) * 12 : 0), rx = w * .3, ry = h * .34;
    c.save(); c.translate(cx, cy); c.rotate(-0.35 + Math.sin(t * .4) * .03);
    var pg = c.createLinearGradient(-rx, 0, rx, 0); pg.addColorStop(0, '#6e3a14'); pg.addColorStop(.5, '#b5742a'); pg.addColorStop(1, '#4a2410');
    c.fillStyle = pg; c.beginPath(); c.moveTo(-rx, 0); c.quadraticCurveTo(0, -ry * 1.5, rx, 0); c.quadraticCurveTo(0, ry * 1.5, -rx, 0); c.fill();
    c.strokeStyle = 'rgba(30,14,6,.55)'; c.lineWidth = 2; for (var i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(-rx * .92, i * ry * .22); c.quadraticCurveTo(0, i * ry * .35, rx * .92, i * ry * .22); c.stroke(); }
    var r = rnd(21); c.fillStyle = 'rgba(8,5,4,.78)'; for (var k = 0; k < 9; k++) { c.beginPath(); c.ellipse((r() - .35) * rx * .9, (r() - .5) * ry * .8, 6 + r() * 22, 4 + r() * 14, r() * 3, 0, 7); c.fill(); }
    c.restore();
    var bw = rx * 2.25, bh = ry * 2.1, bx = cx - bw / 2, by = cy - bh / 2, L = 18; c.strokeStyle = RUST; c.lineWidth = 2;
    [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(function (q) { c.beginPath(); c.moveTo(q[0], q[1] + L * q[3]); c.lineTo(q[0], q[1]); c.lineTo(q[0] + L * q[2], q[1]); c.stroke(); });
    var sy = by + ((t * .5) % 1) * bh; c.fillStyle = 'rgba(236,228,212,.12)'; c.fillRect(bx, sy, bw, 2);
    mono(c, h * .052, 700); c.fillStyle = IV; c.fillText('BLACK POD ROT · SEVERITY', w * .05, h * .1);
    for (var s = 0; s < 4; s++) { c.fillStyle = s <= ((t * .6) | 0) % 4 ? RUST : 'rgba(236,228,212,.16)'; c.fillRect(w * .05 + s * (w * .06), h * .13, w * .05, 5); }
    mono(c, h * .045, 500); c.fillStyle = 'rgba(236,228,212,.55)'; c.fillText('RESEARCH · IN PROGRESS · ILLUSTRATIVE', w * .05, h * .94);
  };

  /* ── Gender-Neutral Language Recognizer: animated word replacement ── */
  var pairs = [['chairman', 'chairperson'], ['policeman', 'police officer'], ['mankind', 'humanity'], ['manpower', 'workforce'], ['he or she', 'they']];
  art.gnlr = function (c, w, h, t, m) {
    c.fillStyle = '#0e0d0c'; c.fillRect(0, 0, w, h);
    var cyc = 3.2, idx = ((t / cyc) | 0) % pairs.length, p = (t % cyc) / cyc, pr = pairs[idx];
    var a = U.smooth(U.map(p, .25, .55, 0, 1)), fade = U.smooth(U.map(p, .9, 1, 1, 0));
    c.globalAlpha = fade; sans(c, h * .17); c.textBaseline = 'middle';
    var ow = c.measureText(pr[0]).width, ox = (w - ow) / 2, oy = h * .42 + (m ? (m.y - .5) * 8 : 0);
    c.fillStyle = 'rgba(236,228,212,' + (1 - a * .75) + ')'; c.fillText(pr[0], ox, oy);
    c.strokeStyle = RUST; c.lineWidth = 3; c.beginPath(); c.moveTo(ox - 6, oy); c.lineTo(ox - 6 + (ow + 12) * a, oy); c.stroke();
    mono(c, h * .075, 700); var nw = c.measureText(pr[1]).width; c.fillStyle = AMB; c.globalAlpha = fade * a; c.fillText(pr[1], (w - nw) / 2, oy + h * .2 - (1 - a) * 10);
    c.globalAlpha = 1; mono(c, h * .045, 500); c.fillStyle = 'rgba(236,228,212,.5)'; c.textBaseline = 'alphabetic';
    c.fillText('EXAMPLE · WORD → ALTERNATIVE', w * .05, h * .94); c.fillText('FLASK · PYTHON', w * .7, h * .94);
    c.fillStyle = 'rgba(236,228,212,.1)'; for (var i = 0; i < 7; i++) c.fillRect(w * .08, h * .08 + i * 4, w * (.2 + ((i * 53) % 40) / 100), 2);
  };

  /* ── Our Little Archive: frames, timeline, map pin ── */
  art.archive = function (c, w, h, t, m) {
    c.fillStyle = '#12100d'; c.fillRect(0, 0, w, h);
    var mx = m ? (m.x - .5) : 0, my = m ? (m.y - .5) : 0;
    var fr = [[.2, .42, .24, -6, '#4a3b2a'], [.5, .38, .26, 4, '#2f3a3a'], [.78, .45, .22, -3, '#503326']];
    fr.forEach(function (f, i) {
      c.save(); c.translate(w * f[0] + mx * (i + 1) * 8, h * f[1] + Math.sin(t * .6 + i) * 3 + my * (i + 1) * 6); c.rotate(f[3] * Math.PI / 180);
      var fw = w * f[2], fh = fw * 1.15; c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(-fw / 2 + 5, -fh / 2 + 7, fw, fh);
      c.fillStyle = IV; c.fillRect(-fw / 2, -fh / 2, fw, fh);
      var gr = c.createLinearGradient(0, -fh / 2, 0, fh / 2); gr.addColorStop(0, f[4]); gr.addColorStop(1, '#1b1612'); c.fillStyle = gr; c.fillRect(-fw / 2 + 6, -fh / 2 + 6, fw - 12, fh * .76);
      c.fillStyle = 'rgba(216,155,60,.5)'; c.fillRect(-fw * .12, -fh / 2 - 6, fw * .24, 12); c.restore();
    });
    var ty = h * .8; c.strokeStyle = 'rgba(236,228,212,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(w * .08, ty); c.lineTo(w * .92, ty); c.stroke();
    for (var i = 0; i < 6; i++) { var x = w * (.12 + i * .15); c.fillStyle = i === ((t * .7) | 0) % 6 ? AMB : 'rgba(236,228,212,.4)'; c.beginPath(); c.arc(x, ty, i === ((t * .7) | 0) % 6 ? 5 : 3, 0, 7); c.fill(); }
    var px = w * .86, py = h * .16; c.fillStyle = RUST; c.beginPath(); c.arc(px, py, 7, 0, 7); c.fill(); c.beginPath(); c.moveTo(px - 6, py + 3); c.lineTo(px, py + 18); c.lineTo(px + 6, py + 3); c.fill();
    mono(c, h * .05, 500); c.fillStyle = 'rgba(236,228,212,.6)'; c.fillText('PHOTOS · DATES · NOTES · PLACES', w * .08, h * .93);
    sans(c, h * .085); c.fillStyle = IV; c.fillText('Our Little Archive', w * .06, h * .13);
  };

  /* ── Void Experience: simulated terminal + glitch ── */
  var voidLines = ['> boot sequence (simulated)', '> rendering visual effect', '> no device access', '> no user data read', '> browser only', '> 0x00 ... 0x7F', '> signal drift detected', '> this is theatre'];
  art.void = function (c, w, h, t, m) {
    c.fillStyle = '#050505'; c.fillRect(0, 0, w, h);
    mono(c, h * .062, 500); var n = 10, base = (t * 2.2) | 0;
    for (var i = 0; i < n; i++) { var ln = voidLines[(base + i) % voidLines.length]; c.fillStyle = i === n - 1 ? RUST : 'rgba(236,228,212,' + (.18 + i * .07) + ')'; c.fillText(ln, w * .06, h * .12 + i * h * .085); }
    var gl = (Math.sin(t * 7) > .86) || (m && m.hover);
    if (gl) { var r = rnd((t * 12) | 0); for (var k = 0; k < 6; k++) { var yy = r() * h, hh = 6 + r() * 24, dx = (r() - .5) * 60; c.fillStyle = k % 2 ? 'rgba(196,69,45,.5)' : 'rgba(236,228,212,.28)'; c.fillRect(Math.max(0, dx), yy, w - 40, hh * .5); } }
    sans(c, h * .24); c.fillStyle = IV; c.save(); c.translate(w * .55, h * .62); if (gl) c.translate((Math.random() - .5) * 8, 0); c.fillText('VOID', 0, 0); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(196,69,45,.5)'; c.fillText('VOID', gl ? 5 : 2, gl ? -3 : 0); c.restore();
    c.globalCompositeOperation = 'source-over';
    if (((t * 2) | 0) % 2) { c.fillStyle = RUST; c.fillRect(w * .06 + 3, h * .12 + n * h * .085, h * .035, h * .05); }
  };

  /* ── Developer identity ── */
  var portrait = null;
  art.identity = function (c, w, h, t, m) {
    c.fillStyle = '#0c0b0a'; c.fillRect(0, 0, w, h);
    if (!portrait && window.REA_IMG) { portrait = new Image(); portrait.src = window.REA_IMG; }
    if (portrait && portrait.complete && portrait.naturalWidth) {
      var ph = h * .86, pw = ph * 0.8; c.save(); c.globalAlpha = .85; c.filter = 'grayscale(1) contrast(1.15)';
      c.drawImage(portrait, w - pw - w * .05 + (m ? (m.x - .5) * 6 : 0), h * .07, pw, ph); c.restore(); c.filter = 'none';
      var fg = c.createLinearGradient(w * .4, 0, w * .75, 0); fg.addColorStop(0, '#0c0b0a'); fg.addColorStop(1, 'rgba(12,11,10,0)'); c.fillStyle = fg; c.fillRect(w * .4, 0, w * .4, h);
    }
    sans(c, h * .17); c.fillStyle = IV; c.fillText('REA', w * .06, h * .3); c.fillText('AMPARO', w * .06, h * .5);
    mono(c, h * .052, 600); c.fillStyle = AMB; ['COMPUTER SCIENCE STUDENT', 'DEVELOPER', 'CREATIVE TECHNOLOGIST'].forEach(function (s, i) { c.fillText(s, w * .06, h * .66 + i * h * .075); });
    c.fillStyle = RUST; c.fillRect(w * .06, h * .9, (w * .3) * ((Math.sin(t) + 1) / 2 * .6 + .4), 3);
  };

  /* ── Code experiments ── */
  var snippets = ['import torch', 'flutter run', 'flask run --debug', 'git commit -m "iterate"', 'SELECT * FROM memories;', 'model.eval()', 'const scene = new THREE.Scene();', 'pytest -q', 'firebase deploy', 'npm run dev', 'tflite_convert', 'for epoch in range(n):'];
  art.code = function (c, w, h, t, m) {
    c.fillStyle = '#080908'; c.fillRect(0, 0, w, h); mono(c, h * .055, 500);
    var lh = h * .08, rows = Math.ceil(h / lh) + 1, off = (t * 16) % lh, base = Math.floor(t * 16 / lh);
    for (var i = 0; i < rows; i++) {
      var s = snippets[(base + i) % snippets.length], y = i * lh - off + lh; var hot = i === 5;
      c.fillStyle = hot ? AMB : 'rgba(236,228,212,' + (.12 + (i / rows) * .35) + ')'; c.fillText(String((base + i) % 100).padStart(2, '0') + '  ' + s, w * .06 + (m ? (m.x - .5) * 6 : 0), y);
    }
    c.fillStyle = 'rgba(8,9,8,.0)'; sans(c, h * .1); c.fillStyle = 'rgba(196,69,45,.9)'; c.fillText('{ }', w * .78, h * .2);
  };

  art.noise = function (c, w, h, t) {
    var img = c.createImageData(w, h), d = img.data;
    for (var i = 0; i < d.length; i += 4) { var v = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    c.putImageData(img, 0, 0);
  };

  /* Draw art into a canvas by project/kind id */
  art.draw = function (id, ctx, w, h, t, m) { (art[id] || art.noise)(ctx, w, h, t, m); };
})();
