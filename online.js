/* Online: leaderboard (Supabase table) + 1v1 battle rooms (Supabase Realtime broadcast/presence). */
(function () {
  'use strict';
  var A = window.App;
  function t(k) { return A.t(k); }
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function cfg() { return A.getConfig(); }
  function configured() { var c = cfg(); return !!(c.SUPABASE_URL && c.SUPABASE_ANON_KEY); }

  /* ---------- Supabase client (lazy) ---------- */
  var client = null, clientP = null;
  function loadSB() {
    if (client) return Promise.resolve(client);
    if (clientP) return clientP;
    clientP = new Promise(function (resolve, reject) {
      function make() {
        try { client = window.supabase.createClient(cfg().SUPABASE_URL, cfg().SUPABASE_ANON_KEY); resolve(client); }
        catch (e) { clientP = null; reject(e); }
      }
      if (window.supabase && window.supabase.createClient) return make();
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = make;
      s.onerror = function () { clientP = null; reject(new Error('load failed')); };
      document.head.appendChild(s);
    });
    return clientP;
  }

  /* ---------- leaderboard ---------- */
  var lbTab = 'daily', lbToken = 0, lbBound = false;
  function submitScore(o) {
    if (!configured()) return Promise.resolve('err');
    return loadSB().then(function (sb) {
      return sb.from('scores').insert({ mode: o.mode, diff: o.diff, day: o.day, name: o.name, secs: o.secs });
    }).then(function (r) {
      if (!r.error) return 'ok';
      if (r.error.code === '23505') return 'dup';
      return 'err';
    }).catch(function () { return 'err'; });
  }
  function listMessage(list, text) {
    list.innerHTML = '';
    var li = document.createElement('li'); li.className = 'lb-empty'; li.textContent = text; list.appendChild(li);
  }
  function renderBoard() {
    if (!lbBound) {
      lbBound = true;
      $$('#lb-tabs button').forEach(function (b) {
        b.addEventListener('click', function () { lbTab = b.getAttribute('data-lb'); renderBoard(); });
      });
    }
    $$('#lb-tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lb') === lbTab); });
    A.renderMyBest($('#lb-mine-grid'));
    var list = $('#lb-list');
    var nc = $('#lb-notcfg');
    if (!configured()) { nc.hidden = false; list.innerHTML = ''; return; }
    nc.hidden = true;
    listMessage(list, t('loading'));
    var token = ++lbToken;
    loadSB().then(function (sb) {
      var q = sb.from('scores').select('name,secs').order('secs', { ascending: true }).limit(30);
      if (lbTab === 'daily') q = q.eq('mode', 'daily').eq('day', SudokuCore.dailySeed());
      else q = q.eq('mode', 'solo').eq('diff', lbTab);
      return q;
    }).then(function (r) {
      if (token !== lbToken) return;
      if (r.error) throw r.error;
      var rows = r.data || [];
      if (!rows.length) { listMessage(list, t('empty')); return; }
      list.innerHTML = '';
      rows.forEach(function (row, i) {
        var li = document.createElement('li');
        var a = document.createElement('span'); a.className = 'rk'; a.textContent = i + 1;
        var b = document.createElement('span'); b.className = 'nm'; b.textContent = row.name;
        var c = document.createElement('span'); c.className = 'tm'; c.textContent = A.fmt(row.secs);
        li.appendChild(a); li.appendChild(b); li.appendChild(c); list.appendChild(li);
      });
    }).catch(function () { if (token === lbToken) listMessage(list, t('submitFail')); });
  }

  /* ---------- battle lobby ---------- */
  var L = { pub: false, quick: false, pubOn: false, ch: null, code: '', host: false, id: '', diff: 'medium', metas: [], inGame: false, myDone: false, mySecs: 0, cd: null, joinTimer: null, bound: false };
  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function randomCode() { var s = ''; for (var i = 0; i < 5; i++) s += ALPHA.charAt(Math.floor(Math.random() * ALPHA.length)); return s; }
  function randomId() { return Math.random().toString(36).slice(2, 10); }
  function myName() { return A.displayName(); }

  /* ---------- public lobby (open rooms + quick match) ---------- */
  var LB = { ch: null, id: randomId(), rooms: [], synced: false, p: null };
  function ensureLobby() {
    if (LB.ch) return Promise.resolve(LB.ch);
    if (LB.p) return LB.p;
    LB.p = loadSB().then(function (sb) {
      return new Promise(function (resolve) {
        var ch = sb.channel('sudoku-lobby', { config: { presence: { key: LB.id } } });
        LB.ch = ch;
        ch.on('presence', { event: 'sync' }, function () {
          var st = ch.presenceState(), out = [];
          Object.keys(st).forEach(function (k) { st[k].forEach(function (m) { if (m && m.code) out.push(m); }); });
          LB.rooms = out; LB.synced = true; renderRooms(); lobbyMatchCheck();
        });
        ch.subscribe(function (s) { if (s === 'SUBSCRIBED') resolve(ch); });
        setTimeout(function () { resolve(ch); }, 4000);
      });
    }).catch(function () { LB.p = null; return null; });
    return LB.p;
  }
  function closeLobby() { var ch = LB.ch; LB.ch = null; LB.p = null; LB.rooms = []; LB.synced = false; if (ch && client) { try { client.removeChannel(ch); } catch (e) {} } L.pubOn = false; }
  function publish() {
    if (L.pubOn || !L.ch || !L.host) return; L.pubOn = true;
    ensureLobby().then(function (ch) { if (ch && L.pubOn && L.ch) { try { ch.track({ code: L.code, diff: L.diff, name: myName(), id: L.id }); } catch (e) {} } });
  }
  function unpublish() { if (!L.pubOn) return; L.pubOn = false; if (LB.ch) { try { LB.ch.untrack(); } catch (e) {} } }
  function openRooms(diff) { return LB.rooms.filter(function (r) { return r.id !== L.id && (!diff || r.diff === diff); }); }
  function renderRooms() {
    var box = $('#on-rooms'); if (!box) return; box.innerHTML = '';
    var list = openRooms();
    if (!list.length) { var e = document.createElement('div'); e.className = 'muted center-note'; e.textContent = t('noPublic'); box.appendChild(e); return; }
    list.slice(0, 8).forEach(function (r) {
      var row = document.createElement('div'); row.className = 'room-row';
      var a = document.createElement('span'); a.className = 'rn'; a.textContent = (r.name || '?');
      var b = document.createElement('span'); b.className = 'rd'; b.textContent = t(r.diff);
      var c = document.createElement('button'); c.type = 'button'; c.className = 'btn primary small'; c.textContent = t('join');
      c.addEventListener('click', function () { joinChannel(r.code, false); });
      row.appendChild(a); row.appendChild(b); row.appendChild(c); box.appendChild(row);
    });
  }
  // two people quick-matching at once: the one with the larger code joins the other
  function lobbyMatchCheck() {
    if (!L.quick || !L.host || !L.ch || oppMeta()) return;
    var other = openRooms(L.diff).filter(function (r) { return r.code < L.code; }).sort(function (a, b) { return a.code < b.code ? -1 : 1; })[0];
    if (other) { A.toast(t('matched')); joinChannel(other.code, false); }
  }
  function quickMatch() {
    if (!configured()) { A.toast(t('notConfigured')); return; }
    setMsg(t('searching'));
    ensureLobby().then(function () {
      var wait = LB.synced ? 0 : 1200;
      setTimeout(function () {
        var r = openRooms(L.diff)[0] || openRooms()[0];
        setMsg('');
        if (r) { L.diff = r.diff; joinChannel(r.code, false); }
        else joinChannel(randomCode(), true, { pub: true, quick: true });
      }, wait);
    });
  }

  function setMsg(text) { var m = $('#on-msg'); m.hidden = !text; m.textContent = text || ''; }
  function showPanel(which) { $('#on-menu').hidden = which !== 'menu'; $('#on-lobby').hidden = which !== 'lobby'; }
  function setStatus(text, count) { var s = $('#on-status'); s.textContent = text; s.className = 'status' + (count ? ' count' : ''); }

  function oppMeta() {
    for (var i = 0; i < L.metas.length; i++) if (L.metas[i].id !== L.id) return L.metas[i];
    return null;
  }
  function updateLobbyUI() {
    if (!L.ch || L.cd || L.inGame) return;
    $('#on-roomcode').textContent = L.code;
    $('#on-roomdiff').textContent = t('chooseDiff') + ': ' + t(L.diff);
    var opp = oppMeta();
    if (L.host) {
      if (L.pub) { if (opp) unpublish(); else publish(); }
      if (opp) { setStatus('✓ ' + t('opponentJoined') + ': ' + (opp.name || ''), false); $('#on-start').hidden = false; }
      else { setStatus(t('waiting'), false); $('#on-start').hidden = true; }
    } else {
      $('#on-start').hidden = true;
      setStatus(t('waitHost'), false);
    }
  }

  function collectMetas() {
    var st = L.ch.presenceState(), out = [];
    Object.keys(st).forEach(function (k) { st[k].forEach(function (m) { out.push(m); }); });
    return out;
  }

  function leaveRoom() {
    clearInterval(L.cd); L.cd = null; clearTimeout(L.joinTimer);
    unpublish(); L.quick = false;
    var ch = L.ch; L.ch = null; L.inGame = false; L.myDone = false; L.metas = [];
    if (ch && client) { try { client.removeChannel(ch); } catch (e) {} }
    setMsg(''); setStatus('', false); $('#on-start').hidden = true; showPanel('menu');
  }

  function joinChannel(code, host, opts) {
    if (!configured()) { A.toast(t('notConfigured')); return; }
    leaveRoom();
    L.pub = !!(opts && opts.pub); L.quick = !!(opts && opts.quick);
    setMsg(t('connecting'));
    loadSB().then(function (sb) {
      L.id = randomId(); L.code = code; L.host = host;
      var ch = sb.channel('sudoku-room-' + code, { config: { broadcast: { self: false }, presence: { key: L.id } } });
      L.ch = ch;
      ch.on('presence', { event: 'sync' }, function () {
        if (L.ch !== ch) return;
        var before = oppMeta();
        L.metas = collectMetas();
        var opp = oppMeta();
        if (L.inGame && before && !opp) A.toast(t('oppLeft'));
        if (!L.host) { var h = L.metas.filter(function (m) { return m.host; })[0]; if (h && h.diff) L.diff = h.diff; }
        updateLobbyUI();
      });
      ch.on('broadcast', { event: 'start' }, function (m) { if (L.ch === ch) onStart(m.payload); });
      ch.on('broadcast', { event: 'progress' }, function (m) { if (L.ch === ch && L.inGame && m.payload) A.setOppProgress(m.payload.pct | 0); });
      ch.on('broadcast', { event: 'done' }, function (m) { if (L.ch === ch) onOppDone(m.payload || {}); });
      ch.subscribe(function (status) {
        if (L.ch !== ch) return;
        if (status === 'SUBSCRIBED') {
          ch.track({ id: L.id, host: host, name: myName(), diff: L.diff });
          if (host && window.Track) Track.log('battle_create', { mode: 'battle', diff: L.diff });
          setMsg(''); showPanel('lobby');
          $('#on-roomcode').textContent = code;
          $('#on-roomdiff').textContent = t('chooseDiff') + ': ' + t(L.diff);
          setStatus(host ? (L.quick ? t('searching') : t('waiting')) : t('connecting'), false);
          if (host && L.pub) publish();
          if (!host) L.joinTimer = setTimeout(checkJoin, 1600);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          leaveRoom(); setMsg(t('submitFail'));
        }
      });
    }).catch(function () { leaveRoom(); setMsg(t('submitFail')); });
  }

  function checkJoin() {
    if (!L.ch || L.host) return;
    L.metas = collectMetas();
    var hasHost = L.metas.some(function (m) { return m.host; });
    if (!hasHost) { leaveRoom(); setMsg(t('roomNotFound')); return; }
    if (L.metas.length > 2) { leaveRoom(); setMsg(t('roomFull')); return; }
    var h = L.metas.filter(function (m) { return m.host; })[0];
    if (h && h.diff) L.diff = h.diff;
    updateLobbyUI();
  }

  function send(event, payload) {
    if (L.ch) { try { L.ch.send({ type: 'broadcast', event: event, payload: payload }); } catch (e) {} }
  }

  function hostStart() {
    if (!L.host || !L.ch) return;
    if (!oppMeta()) { A.toast(t('waiting')); return; }
    var p = { seed: SudokuCore.randomSeed(), diff: L.diff };
    send('start', p);
    onStart(p);
  }

  function onStart(p) {
    if (!p || !p.seed) return;
    A.closeModal();
    clearInterval(L.cd);
    L.inGame = false; L.myDone = false;
    A.show('online'); showPanel('lobby');
    $('#on-start').hidden = true;
    $('#on-roomcode').textContent = L.code;
    $('#on-roomdiff').textContent = t('chooseDiff') + ': ' + t(p.diff);
    var n = 3;
    setStatus(String(n), true);
    L.cd = setInterval(function () {
      n--;
      if (n <= 0) {
        clearInterval(L.cd); L.cd = null; setStatus('', false);
        L.inGame = true;
        if (window.Track) Track.log('battle_start', { mode: 'battle', diff: p.diff });
        A.startBattleGame({
          seed: p.seed, diff: p.diff,
          onProgress: function (pct, mist) { send('progress', { id: L.id, pct: pct, mist: mist }); },
          onDone: onMyDone,
          onLeave: function () { leaveRoom(); A.show('home'); }
        });
      } else setStatus(String(n), true);
    }, 1000);
  }

  function resultButtons() {
    var b = [{ label: t('leave'), cls: 'ghost', onClick: function () { leaveRoom(); A.show('home'); } }];
    if (L.host) b.push({ label: t('rematch'), cls: 'primary', onClick: function () { hostStart(); } });
    return b;
  }
  function showResult(win, secs, oppSecs) {
    var body = [A.el('div', 'big-time', A.fmt(secs))];
    if (L.myDone && L.gain) body.push(A.el('div', 'gain', '+' + L.gain + ' 💎'));
    if (oppSecs !== undefined) body.push(t('opponent') + ': ' + A.fmt(oppSecs));
    if (!L.host) body.push(t('waitHost'));
    A.showInfo({ title: win ? t('youWon') : t('youLost'), body: body, buttons: resultButtons() });
  }
  function onMyDone(secs) {
    L.myDone = true; L.mySecs = secs; L.gain = A.awardBattle();
    send('done', { id: L.id, secs: secs });
    if (window.Track) Track.log('battle_win', { mode: 'battle', diff: L.diff, secs: secs });
    showResult(true, secs);
  }
  function onOppDone(p) {
    if (!L.inGame) return;
    var oppSecs = p.secs | 0;
    if (!L.myDone) { A.freeze(); showResult(false, oppSecs, oppSecs); }
    else if (oppSecs < L.mySecs) showResult(false, L.mySecs, oppSecs);
  }

  function openLobby() {
    var nc = $('#on-notcfg'); nc.hidden = configured();
    if (!L.bound) {
      L.bound = true;
      $$('#on-diffs button').forEach(function (b) {
        b.addEventListener('click', function () {
          L.diff = b.getAttribute('data-od');
          $$('#on-diffs button').forEach(function (x) { x.classList.toggle('on', x === b); });
        });
      });
      $('#on-create').addEventListener('click', function () { joinChannel(randomCode(), true, { pub: $('#on-pub').checked }); });
      $('#on-quick').addEventListener('click', quickMatch);
      $('#on-join').addEventListener('click', function () {
        var code = $('#on-code').value.trim().toUpperCase();
        if (!/^[A-Z0-9]{5}$/.test(code)) { A.toast(t('enterCode')); return; }
        joinChannel(code, false);
      });
      $('#on-code').addEventListener('input', function (e) { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
      $('#on-start').addEventListener('click', hostStart);
      $('#on-back').addEventListener('click', function () { leaveRoom(); closeLobby(); A.show('home'); });
      $('#on-share').addEventListener('click', function () {
        var link = location.origin + location.pathname + '?room=' + L.code, text = t('shareText').replace('{code}', L.code);
        if (navigator.share) navigator.share({ title: t('title'), text: text, url: link }).catch(function () {});
        else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text + ' ' + link).then(function () { A.toast(t('copied')); }, function () { window.prompt(t('copyLink'), link); });
        else window.prompt(t('copyLink'), link);
      });
      $('#on-copy').addEventListener('click', function () {
        var link = location.origin + location.pathname + '?room=' + L.code;
        function done() { A.toast(t('copied')); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, function () { window.prompt(t('copyLink'), link); });
        else window.prompt(t('copyLink'), link);
      });
    }
    if (!L.ch) { setMsg(''); showPanel('menu'); }
    if (configured()) { ensureLobby().then(renderRooms); renderRooms(); }
  }

  function handleUrl() {
    var m = /[?&]room=([A-Za-z0-9]{5})/.exec(location.search);
    if (!m) return;
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    var code = m[1].toUpperCase();
    A.show('online'); openLobby();
    $('#on-code').value = code;
    if (configured()) joinChannel(code, false);
  }

  window.Online = {
    configured: configured, submitScore: submitScore, renderBoard: renderBoard, openLobby: openLobby,
    refresh: function () { if (L.ch) updateLobbyUI(); }
  };
  handleUrl();
})();
