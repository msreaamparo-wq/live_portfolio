# Rea Amparo — The Cinematic Developer Experience

Static site: HTML + CSS + vanilla JS. Three.js r128 and GSAP 3.12.5 load from cdnjs.

## Run
Serve the folder over HTTP (or just open index.html):
    python3 -m http.server 8080   →  http://localhost:8080

URL switches: `?nointro` skip the intro · `?intro` force it even with a #hash.

## Structure
- `js/config.js` — all real content (projects, links, toolkit). **Set `email` here.**
- `js/scene.js` — TV room, silhouettes, fog corridor, particles, post-processing
- `js/camera.js` — cursor drift, focus, journey path
- `js/tv.js` — raycasting, hover/click, keyboard + touch alternatives
- `js/journey.js` — approach → fly-through → corridor → reveal (one progress value)
- `js/portfolio.js` — content rendering, hero reveal, case studies
- `js/effects.js` — previews, cursor, magnetic hover, scroll motion, constellation
- `js/github.js` — GitHub API with 1h cache + fallback
- `js/art.js` — procedural artwork per project (illustrative, not screenshots)
- `js/photo.js` — original embedded portrait (kept so it works from file://)

## Adding screenshots
Put images in `assets/projects/` and add `shots: [{src:'assets/projects/trace-1.png', alt:'…'}]` to the project in `config.js`.

## Fallbacks
No WebGL, no CDN, reduced motion, or a #section deep link → the portfolio shows directly. SKIP INTRO / Esc is always available.
