/* Live data from the public GitHub REST API (no keys, unauthenticated).
   Cached in localStorage for an hour; falls back to the stale cache, then to static content. */
(function () {
  var R = window.REA, U = R.utils, G = R.github = { repos: [], status: 'idle' };
  var KEY = 'rea.gh.v1', TTL = 60 * 60 * 1000, listeners = [];

  function readCache() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function writeCache(data) { try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), data: data })); } catch (e) {} }
  function slim(r) { return { name: r.name, description: r.description, language: r.language, url: r.html_url, updated: r.pushed_at || r.updated_at, fork: r.fork }; }

  G.onReady = function (fn) { if (G.status === 'ok' || G.status === 'fallback') fn(G); else listeners.push(fn); };
  function done(status) { G.status = status; listeners.splice(0).forEach(function (fn) { fn(G); }); }

  G.load = function () {
    var c = readCache();
    if (c && Date.now() - c.t < TTL) { G.repos = c.data; return done('ok'); }
    if (!window.fetch) { if (c) { G.repos = c.data; } return done(c ? 'ok' : 'fallback'); }
    var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { ctl && ctl.abort(); }, 6000);
    fetch('https://api.github.com/users/' + R.config.githubUser + '/repos?per_page=100&sort=pushed', { headers: { Accept: 'application/vnd.github+json' }, signal: ctl ? ctl.signal : undefined })
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (list) { G.repos = list.filter(function (r) { return !r.fork; }).map(slim); writeCache(G.repos); done('ok'); })
      .catch(function () { if (c) { G.repos = c.data; done('ok'); } else done('fallback'); })
      .then(function () { clearTimeout(to); });
  };

  G.find = function (url) { var n = url.split('/').pop(); return G.repos.filter(function (r) { return r.name.toLowerCase() === n.toLowerCase(); })[0] || null; };
  G.date = function (iso) { try { return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return ''; } };
})();
