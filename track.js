/* Anonymous usage statistics -> Supabase (insert-only `events` table, see stats.sql).
   Sends only: random Player-ID, event name, mode, difficulty, language, platform, play time.
   Silent no-op when config.js has no Supabase keys. */
(function (root) {
  'use strict';
  var QKEY = 'sdk_evq';

  function cfg() { return root.SUDOKU_CONFIG || {}; }
  function configured() { var c = cfg(); return !!(c.SUPABASE_URL && c.SUPABASE_ANON_KEY); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function readQ() { try { return JSON.parse(lsGet(QKEY) || '[]'); } catch (e) { return []; } }
  function writeQ(q) { lsSet(QKEY, JSON.stringify(q.slice(-100))); }
  function pid() {
    try { return (JSON.parse(lsGet('sdk_settings') || '{}').playerId) || ''; } catch (e) { return ''; }
  }
  function platform() {
    var ua = navigator.userAgent || '';
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
    return 'desktop';
  }
  function standalone() {
    return !!((root.matchMedia && root.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true);
  }
  function referrer() {
    var src = '';
    try { src = new URLSearchParams(location.search).get('src') || ''; } catch (e) {}
    if (!src) {
      try { src = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
      if (src && src === location.hostname) src = '';
    }
    return (src || 'direct').slice(0, 60);
  }

  var flushing = false;
  function flush() {
    if (!configured() || flushing) return;
    var q = readQ();
    if (!q.length) return;
    flushing = true;
    var batch = q.slice(0, 50), c = cfg();
    var headers = { 'apikey': c.SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
    if (/^eyJ/.test(c.SUPABASE_ANON_KEY)) headers.Authorization = 'Bearer ' + c.SUPABASE_ANON_KEY;
    fetch(String(c.SUPABASE_URL).replace(/\/+$/, '') + '/rest/v1/events', {
      method: 'POST', headers: headers, body: JSON.stringify(batch), keepalive: true
    }).then(function (r) {
      // success, or a rejected batch (4xx except rate limit): drop it so it cannot block the queue
      if (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 429)) writeQ(readQ().slice(batch.length));
      flushing = false;
      if (r.ok && readQ().length) flush();
    }).catch(function () { flushing = false; });
  }

  function log(ev, p) {
    if (!configured()) return;
    var id = pid();
    if (!id) return;
    p = p || {};
    var q = readQ();
    q.push({
      pid: id, ev: ev,
      mode: p.mode || null, diff: p.diff || null,
      lang: (document.documentElement.lang || '').slice(0, 5) || null,
      plat: platform(), pwa: standalone(),
      secs: typeof p.secs === 'number' ? Math.max(0, Math.min(100000, Math.round(p.secs))) : null,
      ref: p.ref || null
    });
    writeQ(q);
    flush();
  }

  // one 'open' per 30 minutes; the very first open also carries the traffic source
  function open() {
    var now = Date.now(), last = parseInt(lsGet('sdk_last_open') || '0', 10);
    if (now - last < 30 * 60 * 1000) { flush(); return; }
    lsSet('sdk_last_open', String(now));
    var first = !lsGet('sdk_ref_sent');
    if (first) lsSet('sdk_ref_sent', '1');
    log('open', first ? { ref: referrer() } : {});
  }

  root.addEventListener('online', flush);
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
  root.Track = { log: log, open: open, flush: flush };
})(window);
