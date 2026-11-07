/* Television interactions: raycast hover → rack focus, click → project, keyboard + touch alternatives. */
(function () {
  var R = window.REA, U = R.utils, THREE = window.THREE;
  if (!THREE) return;
  var T = R.tv = { focus: null, enabled: false };
  var S, ray, ndc = new THREE.Vector2(), pointerActive = false, pointerType = 'mouse', leaveAt = 0, mouseXY = { x: 0, y: 0 };
  var label, labelTitle, labelMeta, labelHint, live, listEl, v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();
  var uF = new THREE.Vector2(.5, .5), uR = .6, uB = .3, uA = .15;

  T.init = function () {
    S = R.scene; ray = new THREE.Raycaster();
    label = U.$('#tvLabel'); labelTitle = U.$('.tv-title', label); labelMeta = U.$('.tv-meta', label); labelHint = U.$('.tv-hint', label); live = U.$('#tvLive');
    listEl = U.$('#tvIndex');
    S.tvs.forEach(function (tv) {
      var li = U.el('li'), b = U.el('button'); b.type = 'button'; b.dataset.id = tv.id; b.setAttribute('data-ui', '');
      b.innerHTML = '<span>' + (tv.meta.index || '··') + '</span>' + U.escape(tv.meta.title);
      b.addEventListener('focus', function () { if (T.enabled) T.setFocus(tv, true); });
      b.addEventListener('blur', function () { if (T.focus === tv && !pointerActive) T.clear(); });
      b.addEventListener('mouseenter', function () { if (T.enabled) T.setFocus(tv); });
      b.addEventListener('click', function () { T.open(tv, null); });
      li.appendChild(b); listEl.appendChild(li); tv.button = b;
    });
    addEventListener('pointermove', function (e) {
      pointerType = e.pointerType; mouseXY.x = e.clientX; mouseXY.y = e.clientY; ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      if (e.pointerType !== 'touch') pointerActive = true;
    }, { passive: true });
    addEventListener('pointerdown', function (e) { pointerType = e.pointerType; if (e.pointerType === 'touch') pointerActive = false; }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { pointerActive = false; });
    addEventListener('click', onClick);
    addEventListener('keydown', function (e) {
      if (!T.enabled) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var i = S.tvs.indexOf(T.focus); i = (i + (e.key === 'ArrowRight' ? 1 : -1) + S.tvs.length) % S.tvs.length; S.tvs[i].button.focus(); }
      if (e.key === 'Enter' && T.focus && document.activeElement === document.body) T.open(T.focus, null);
    });
  };

  function pick(x, y) {
    ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, S.camera);
    var hit = ray.intersectObjects(S.screenMeshes, false)[0]; return hit ? hit.object.userData.tv : null;
  }

  function onClick(e) {
    if (!T.enabled || e.target.closest('[data-ui]')) return;
    var tv = pick(e.clientX, e.clientY);
    if (pointerType === 'touch' || e.pointerType === 'touch' || (e.detail === 0 && !pointerActive)) {
      if (tv && tv === T.focus) T.open(tv, { x: e.clientX, y: e.clientY });
      else if (tv) T.setFocus(tv); else T.clear();
    } else if (tv) { T.setFocus(tv); T.open(tv, { x: e.clientX, y: e.clientY }); }
  }

  T.setFocus = function (tv, kb) {
    if (T.focus === tv) return;
    T.focus = tv; R.camera.setFocus(tv);
    S.tvs.forEach(function (o) { o.target = o === tv ? 2.15 : .3; o.mouse.hover = o === tv; });
    S.focusLight.position.set(tv.center.x, tv.center.y, tv.center.z + 1.3); S.focusLight.userData.target = 1.3;
    var m = tv.meta; labelTitle.textContent = m.title;
    labelMeta.textContent = m.status ? m.statusKind + ' · ' + m.status : (m.kind === 'identity' ? 'Computer Science student · Developer' : 'Experiments');
    labelHint.textContent = (pointerType === 'touch' ? 'TAP AGAIN TO OPEN' : 'CLICK TO OPEN') + ' →';
    label.classList.add('on'); label.dataset.id = tv.id;
    if (live) live.textContent = m.title + '. ' + (m.status ? m.statusKind + ': ' + m.status + '. ' : '') + 'Press Enter to open.';
  };
  T.clear = function () {
    if (!T.focus) return; T.focus = null; R.camera.setFocus(null);
    S.tvs.forEach(function (o) { o.target = .65; o.mouse.hover = false; o.mouse.x = o.mouse.y = .5; });
    if (S.focusLight) S.focusLight.userData.target = 0; label.classList.remove('on');
  };

  T.open = function (tv, origin) {
    if (!tv) return;
    if (!origin) { v1.copy(tv.center).project(S.camera); origin = { x: (v1.x * .5 + .5) * innerWidth, y: (-v1.y * .5 + .5) * innerHeight }; }
    T.enabled = false;
    R.portfolio.openCase(tv.id, { x: origin.x, y: origin.y, from: 'room', onClose: function () { T.enabled = true; if (tv.button) tv.button.focus({ preventScroll: true }); } });
  };

  T.enable = function (on) { T.enabled = on; U.$('#intro').classList.toggle('tv-live', on); if (!on) T.clear(); };

  T.update = function (dt, t) {
    if (!T.enabled || !S.room) { applyPost(dt); return; }
    /* hover picking (mouse only; touch picks on tap) */
    if (pointerActive && pointerType !== 'touch') {
      ray.setFromCamera(ndc, S.camera);
      var hit = ray.intersectObjects(S.screenMeshes, false)[0], tv = hit ? hit.object.userData.tv : null;
      if (tv) { leaveAt = 0; if (tv !== T.focus) T.setFocus(tv); var uv = hit.uv; tv.mouse.x = uv.x; tv.mouse.y = 1 - uv.y; }
      else if (T.focus && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('#tvIndex'))) { leaveAt = leaveAt || t; if (t - leaveAt > .35) { T.clear(); leaveAt = 0; } }
    }
    var fl = S.focusLight; if (fl) fl.intensity = U.damp(fl.intensity, fl.userData.target || 0, 5, dt);
    /* label follows the focused screen */
    if (T.focus) {
      v1.copy(T.focus.center); v1.y -= T.focus.h / 2 + .18; v1.project(S.camera);
      var x = U.clamp((v1.x * .5 + .5) * innerWidth, 110, innerWidth - 110), y = U.clamp((-v1.y * .5 + .5) * innerHeight, 70, innerHeight - 150);
      label.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,0)';
    }
    applyPost(dt);
  };

  /* screen-space focus mask for the depth-of-field pass */
  function applyPost(dt) {
    var u = S.post && S.post.uniforms; if (!u) return;
    var tv = T.focus, cam = S.camera, tf = new THREE.Vector2(.5, .5), tr = .62, tb = S.dofBase == null ? .3 : S.dofBase, ta = S.abBase == null ? .15 : S.abBase;
    if (tv && T.enabled) {
      v1.copy(tv.center).project(cam); tf.set(v1.x * .5 + .5, v1.y * .5 + .5);
      cam.matrixWorld.extractBasis(v2, v3, v1.set(0, 0, 0)); v1.copy(tv.center).addScaledVector(v3, tv.h / 2).project(cam);
      var dy = Math.abs((v1.y * .5 + .5) - tf.y); v1.copy(tv.center).addScaledVector(v2, tv.w / 2).project(cam);
      var dx = Math.abs((v1.x * .5 + .5) - tf.x) * (innerWidth / innerHeight);
      tr = Math.min(.55, Math.hypot(dx, dy) * 1.05 + .01); tb = 1.25; ta = 1.0;
    }
    uF.x = U.damp(uF.x, tf.x, 6, dt); uF.y = U.damp(uF.y, tf.y, 6, dt); uR = U.damp(uR, tr, 5, dt); uB = U.damp(uB, tb, 4, dt); uA = U.damp(uA, ta, 5, dt);
    u.uFocus.value.copy(uF); u.uFocusR.value = uR; u.uBlur.value = uB; u.uAb.value = uA;
  }
})();
