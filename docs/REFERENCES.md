# Research references

Techniques studied and re-implemented from scratch. **No code or assets were copied.**

| Source | Technique | How it is used here |
|---|---|---|
| Codrops — Interactive WebGL Hover Effects (tympanus.net/codrops/2020/04/14/interactive-webgl-hover-effects/, demo code MIT) | Treat the renderer output as an image and displace/blur it in a screen-space shader | `scene.js` post pass: focus mask, blur, chromatic aberration, motion blur, grain |
| Codrops — WebGL gooey reveal (tympanus.net/codrops/?p=43947) | Mouse-driven shader uniforms, perspective-aware hover | Cursor → `uFocus` / TV `mouse` uniforms; panel tilt |
| three.js examples — depth of field, raycasting, fog, points (threejs.org/examples) | Raycast picking, exponential fog, additive points | `tv.js` picking, `FogExp2`, dust + gather particles |
| GSAP docs (gsap.com) | Timeline choreography | `journey.js` single-progress timeline |
| Awwwards / CodePen | General art direction (editorial grids, oversized type, horizontal galleries) | Browsed for direction only; nothing reused |

Not reused: Lenis (native scrolling kept for accessibility), ScrollTrigger (scroll motion uses a small rAF handler).
