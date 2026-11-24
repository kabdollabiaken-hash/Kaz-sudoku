/* Sudoku app: UI, game state, settings, stats. Online features live in online.js. */
(function () {
  'use strict';
  var C = SudokuCore, I = I18N;
  function t(k) { return I.t(k); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  function newPlayerId() {
    var al = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 4; i++) s += al.charAt(Math.floor(Math.random() * al.length));
    return 'Player-' + s;
  }
  var settings = Object.assign({ theme: 'dark', themeSet: false, showErrors: true, name: '', playerId: '' }, LS.get('sdk_settings', {}));
  if (!settings.themeSet) settings.theme = 'dark';
  if (!settings.playerId) { settings.playerId = newPlayerId(); LS.set('sdk_settings', settings); }
  function displayName() { return (settings.name || '').trim().slice(0, 20) || settings.playerId; }
  function ico(id, cls) { return '<svg class="ic ' + (cls || '') + '"><use href="#' + id + '"/></svg>'; }
  var stats = Object.assign({ wins: { easy: 0, medium: 0, hard: 0 }, best: {}, streak: 0, lastDaily: '', dailyDone: {} }, LS.get('sdk_stats', {}));
  function saveSettings() { LS.set('sdk_settings', settings); }
  function saveStats() { LS.set('sdk_stats', stats); }

  var G = null;          // current game
  var current = 'home';  // current screen
  var cells = [];
  var deferredPrompt = null;

  /* ---------- helpers ---------- */
  function fmt(secs) {
    var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    var mm = (m < 10 ? '0' : '') + m, ss = (s < 10 ? '0' : '') + s;
    return h ? h + ':' + mm + ':' + ss : mm + ':' + ss;
  }
  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ---------- modal ---------- */
  function closeModal() { $('#modal').classList.remove('open'); }
  function showInfo(o) {
    $('#modal-title').textContent = o.title || '';
    var body = $('#modal-body'); body.innerHTML = '';
    (o.body || []).forEach(function (n) {
      if (typeof n === 'string') body.appendChild(el('p', '', n)); else body.appendChild(n);
    });
    var act = $('#modal-actions'); act.innerHTML = '';
    (o.buttons || []).forEach(function (b) {
      var x = el('button', 'btn ' + (b.cls || 'ghost'), b.label); x.type = 'button';
      x.onclick = function () { closeModal(); if (b.onClick) b.onClick(); };
      act.appendChild(x);
    });
    $('#modal').classList.add('open');
  }

  /* ---------- theme ---------- */
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    var th = settings.theme === 'auto' ? (mq && mq.matches ? 'dark' : 'light') : settings.theme;
    document.documentElement.setAttribute('data-theme', th);
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', th === 'dark' ? '#0c1020' : '#eef1f9');
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);

  /* ---------- screens ---------- */
  function show(name) {
    current = name;
    $$('.screen').forEach(function (s) { s.classList.toggle('active', s.id === 'screen-' + name); });
    var scr = $('#screen-' + name); if (scr) scr.scrollTop = 0;
    if (name === 'home') renderHome();
    if (name === 'board' && window.Online) window.Online.renderBoard();
  }

  /* ---------- stats / home ---------- */
  function computeStreak() {
    var today = C.dailySeed(), y = C.dailySeed(Date.now() - 86400000);
    return (stats.lastDaily === today || stats.lastDaily === y) ? stats.streak : 0;
  }
  function statBox(label, value, icon, color) {
    var d = el('div', 'stat');
    if (icon) { d.innerHTML = ico(icon); d.firstChild.style.color = color || 'var(--muted)'; }
    d.appendChild(el('b', '', value)); d.appendChild(el('span', '', label)); return d;
  }
  function renderHome() {
    $('#lang-label').textContent = I.LANGS.filter(function (l) { return l[0] === I.get(); })[0][1];
    var sv = LS.get('sdk_save', null);
    var cont = $('#btn-continue');
    if (sv) {
      cont.hidden = false;
      $('#cont-text').innerHTML = '<span class="g1">' + t('continueGame') + ' · ' + (sv.mode === 'daily' ? t('daily') : t(sv.diff)) + '</span><span class="g2">' + ico('i-timer') + fmt(Math.floor(sv.ms / 1000)) + '</span>';
    } else cont.hidden = true;
    var today = C.dailySeed();
    var done = stats.dailyDone[today] !== undefined;
    $('#daily-sub').textContent = today;
    $('#daily-check').hidden = !done;
    var g = $('#stats-grid'); g.innerHTML = '';
    var total = stats.wins.easy + stats.wins.medium + stats.wins.hard;
    g.appendChild(statBox(t('wins'), String(total), 'i-check', '#8fa3c8'));
    g.appendChild(statBox(t('streak'), String(computeStreak()), 'i-flame', '#ff8a4c'));
    g.appendChild(statBox(t('best') + ' · ' + t('medium'), stats.best.medium !== undefined ? fmt(stats.best.medium) : '00:00', 'i-timer', '#9aa5c0'));
    updateInstallBtn();
  }
  function renderMyBest(container) {
    container.innerHTML = '';
    ['easy', 'medium', 'hard'].forEach(function (d) {
      container.appendChild(statBox(t(d), stats.best[d] !== undefined ? fmt(stats.best[d]) : '–'));
    });
  }

  /* ---------- game core ---------- */
  function makeGame(mode, diff, seed) {
    var gen = C.generate(seed, diff);
    var g = {
      mode: mode, diff: diff, seed: seed,
      puz: gen.puzzle.split('').map(Number), sol: gen.solution.split('').map(Number),
      notes: new Array(81).fill(0), hist: [], sel: null, notesMode: false,
      mist: 0, hints: 0, ms: 0, last: Date.now(), finished: false, paused: false, replay: false
    };
    g.cur = g.puz.slice();
    return g;
  }
  function firstEmpty(g) { for (var i = 0; i < 81; i++) if (!g.puz[i]) return i; return null; }

  function enterGame(g) {
    G = g; G.last = Date.now();
    if (G.sel === null) G.sel = firstEmpty(G);
    $('#battle-bar').hidden = G.mode !== 'battle';
    $('#g-pause').hidden = G.mode === 'battle';
    $('#g-restart').hidden = G.mode === 'battle';
    $('#g-pause').innerHTML = ico(G.paused ? 'i-play' : 'i-pause');
    $('#pause-overlay').hidden = !G.paused;
    setBattleBars(0, 0);
    show('game');
    renderAll();
  }

  function newGame(diff) {
    var seed = C.randomSeed();
    var g = makeGame('solo', diff, seed);
    enterGame(g); save();
  }
  function startDaily(replay) {
    var g = makeGame('daily', 'medium', C.dailySeed());
    g.replay = !!replay;
    enterGame(g); save();
  }
  function startBattleGame(o) {
    var g = makeGame('battle', o.diff, o.seed);
    g.battle = o;
    enterGame(g);
  }

  function save() {
    if (!G || G.finished || G.mode === 'battle') return;
    tick();
    LS.set('sdk_save', {
      mode: G.mode, diff: G.diff, seed: G.seed, cur: G.cur.join(''), notes: G.notes,
      mist: G.mist, hints: G.hints, ms: G.ms, replay: G.replay
    });
  }
  function loadSave() {
    var s = LS.get('sdk_save', null); if (!s) return;
    var g = makeGame(s.mode, s.diff, s.seed);
    g.cur = String(s.cur).split('').map(Number);
    g.notes = s.notes || g.notes; g.mist = s.mist || 0; g.hints = s.hints || 0; g.ms = s.ms || 0; g.replay = !!s.replay;
    enterGame(g);
  }

  /* timer */
  function running() { return G && !G.finished && !G.paused && current === 'game'; }
  function tick() {
    if (!G) return;
    var now = Date.now();
    if (running()) G.ms += now - G.last;
    G.last = now;
  }
  setInterval(function () {
    if (!G) return;
    tick();
    $('#g-timer').textContent = fmt(Math.floor(G.ms / 1000));
  }, 250);

  function setPaused(p) {
    if (!G || G.finished || G.mode === 'battle') return;
    tick(); G.paused = p;
    $('#pause-overlay').hidden = !p;
    $('#g-pause').innerHTML = ico(p ? 'i-play' : 'i-pause');
    if (p) save();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && G && !G.finished && current === 'game') { if (G.mode === 'battle') tick(); else setPaused(true); }
    else if (G) G.last = Date.now();
  });
  window.addEventListener('pagehide', function () { save(); });

  /* moves */
  function peersOf(i, fn) {
    for (var p = 0; p < 81; p++) {
      if (p !== i && (C.ROW[p] === C.ROW[i] || C.COL[p] === C.COL[i] || C.BOX[p] === C.BOX[i])) fn(p);
    }
  }
  function place(i, v, force) {
    var ch = [];
    ch.push([i, G.cur[i], G.notes[i]]);
    G.cur[i] = v; G.notes[i] = 0;
    if (v && !force && v !== G.sol[i]) G.mist++;
    if (v) {
      var bit = 1 << (v - 1);
      peersOf(i, function (p) {
        if (G.notes[p] & bit) { ch.push([p, G.cur[p], G.notes[p]]); G.notes[p] &= ~bit; }
      });
    }
    pushHist(ch);
  }
  function pushHist(ch) { G.hist.push(ch); if (G.hist.length > 400) G.hist.shift(); }

  function input(v) {
    if (!G || G.finished || G.paused || G.sel === null) return;
    var i = G.sel;
    if (G.puz[i]) return;
    if (v === 0) {
      if (G.cur[i] === 0 && G.notes[i] === 0) return;
      pushHist([[i, G.cur[i], G.notes[i]]]); G.cur[i] = 0; G.notes[i] = 0;
    } else if (G.notesMode) {
      if (G.cur[i] !== 0) return;
      pushHist([[i, G.cur[i], G.notes[i]]]); G.notes[i] ^= (1 << (v - 1));
    } else {
      if (G.cur[i] === v) return;
      place(i, v, false);
    }
    afterMove();
  }
  function undo() {
    if (!G || G.finished || G.paused || !G.hist.length) return;
    var ch = G.hist.pop();
    for (var k = ch.length - 1; k >= 0; k--) { G.cur[ch[k][0]] = ch[k][1]; G.notes[ch[k][0]] = ch[k][2]; }
    G.sel = ch[0][0];
    afterMove(true);
  }
  function hint() {
    if (!G || G.finished || G.paused) return;
    if (G.mode === 'battle') { toast(t('noHintsBattle')); return; }
    var i = G.sel;
    if (i === null || G.puz[i] || G.cur[i] === G.sol[i]) {
      var cand = [];
      for (var k = 0; k < 81; k++) if (!G.puz[k] && G.cur[k] !== G.sol[k]) cand.push(k);
      if (!cand.length) return;
      i = cand[Math.floor(Math.random() * cand.length)];
    }
    place(i, G.sol[i], true);
    G.hints++; G.sel = i;
    afterMove();
  }
  function restart() {
    if (!G || G.mode === 'battle') return;
    if (!confirm(t('confirmRestart'))) return;
    G.cur = G.puz.slice(); G.notes = new Array(81).fill(0); G.hist = [];
    G.mist = 0; G.hints = 0; G.ms = 0; G.last = Date.now();
    G.finished = false; G.paused = false; G.notesMode = false; G.sel = firstEmpty(G);
    $('#pause-overlay').hidden = true;
    $('#g-pause').innerHTML = ico('i-pause');
    renderAll(); save();
  }
  function isSolved() { for (var i = 0; i < 81; i++) if (G.cur[i] !== G.sol[i]) return false; return true; }
  function progressPct() {
    var total = 0, ok = 0;
    for (var i = 0; i < 81; i++) if (!G.puz[i]) { total++; if (G.cur[i] === G.sol[i]) ok++; }
    return total ? Math.round(ok * 100 / total) : 100;
  }
  function afterMove(noWinCheck) {
    renderAll();
    if (G.mode === 'battle') {
      var p = progressPct();
      setBattleBars(p, null);
      if (G.battle && G.battle.onProgress) G.battle.onProgress(p, G.mist);
    } else save();
    if (!noWinCheck && isSolved()) finish();
  }

  function finish() {
    tick(); G.finished = true;
    var secs = Math.floor(G.ms / 1000);
    G.score = secs + 30 * G.hints;
    renderAll();
    if (G.mode === 'battle') { if (G.battle && G.battle.onDone) G.battle.onDone(secs); return; }
    LS.del('sdk_save');
    var today = C.dailySeed();
    var counts = !G.replay;
    if (counts) {
      stats.wins[G.diff] = (stats.wins[G.diff] || 0) + 1;
      if (stats.best[G.diff] === undefined || G.score < stats.best[G.diff]) stats.best[G.diff] = G.score;
      if (G.mode === 'daily' && G.seed === today && stats.dailyDone[today] === undefined) {
        var y = C.dailySeed(Date.now() - 86400000);
        stats.streak = stats.lastDaily === y ? stats.streak + 1 : 1;
        stats.lastDaily = today; stats.dailyDone[today] = G.score;
      }
      saveStats();
    }
    showWin(counts);
  }

  function showWin(counts) {
    var body = [];
    body.push(el('div', 'big-time', fmt(G.score)));
    body.push(t('mistakes') + ': ' + G.mist + (G.hints ? ' · ' + t('hintsUsed') + ': ' + G.hints + ' (+' + (30 * G.hints) + 's)' : ''));
    var canSubmit = counts && window.Online && window.Online.configured();
    if (canSubmit) {
      var msg = el('p', '', '');
      var retry = el('button', 'btn ghost', t('submit')); retry.type = 'button'; retry.hidden = true;
      body.push(msg); body.push(retry);
      var dayVal = (G.mode === 'daily' && G.seed === C.dailySeed()) ? G.seed : null;
      var modeVal = dayVal ? 'daily' : 'solo';
      var diffVal = G.diff, scoreVal = G.score, name = displayName();
      var send = function () {
        retry.hidden = true; msg.textContent = t('loading');
        window.Online.submitScore({ mode: modeVal, diff: diffVal, day: dayVal, name: name, secs: scoreVal }).then(function (r) {
          if (r === 'ok' || r === 'dup') msg.textContent = '✓ ' + t('submitted') + ' · ' + name;
          else { msg.textContent = t('submitFail'); retry.hidden = false; }
        });
      };
      retry.onclick = send; send();
    }
    var d = G.diff, mode = G.mode;
    var buttons = [{ label: t('home'), cls: 'ghost', onClick: function () { show('home'); } }];
    if (mode === 'solo') buttons.push({ label: t('again'), cls: 'primary', onClick: function () { newGame(d); } });
    showInfo({ title: t('win'), body: body, buttons: buttons });
  }

  /* ---------- rendering ---------- */
  function buildBoard() {
    var b = $('#board');
    for (var i = 0; i < 81; i++) {
      var d = document.createElement('div');
      var r = C.ROW[i], c = C.COL[i];
      d.className = 'cell' + (c % 3 === 2 && c !== 8 ? ' bR' : '') + (r % 3 === 2 && r !== 8 ? ' bB' : '');
      d.setAttribute('data-i', i);
      d.innerHTML = '<span class="v"></span><span class="n"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
      b.appendChild(d);
      cells.push({ el: d, v: d.firstChild, ns: d.lastChild.children });
    }
    b.addEventListener('click', function (e) {
      var c = e.target.closest ? e.target.closest('.cell') : null;
      if (!c || !G || G.paused) return;
      G.sel = +c.getAttribute('data-i'); renderAll();
    });
    var pad = $('#pad');
    for (var n = 1; n <= 9; n++) {
      var bt = document.createElement('button');
      bt.type = 'button'; bt.className = 'pad-btn'; bt.setAttribute('data-n', n);
      bt.innerHTML = '<span class="d">' + n + '</span><span class="r"></span>';
      pad.appendChild(bt);
    }
    pad.addEventListener('click', function (e) {
      var b2 = e.target.closest ? e.target.closest('.pad-btn') : null;
      if (b2 && !b2.disabled) input(+b2.getAttribute('data-n'));
    });
  }

  function renderAll() {
    if (!G) return;
    var sel = G.sel, selVal = sel !== null ? G.cur[sel] : 0;
    var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 81; i++) {
      var c = cells[i], v = G.cur[i], cls = 'cell' + (C.COL[i] % 3 === 2 && C.COL[i] !== 8 ? ' bR' : '') + (C.ROW[i] % 3 === 2 && C.ROW[i] !== 8 ? ' bB' : '');
      if (G.puz[i]) cls += ' given';
      if (sel !== null) {
        if (i === sel) cls += ' sel';
        else if (C.ROW[i] === C.ROW[sel] || C.COL[i] === C.COL[sel] || C.BOX[i] === C.BOX[sel]) cls += ' peer';
        if (i !== sel && selVal && v === selVal) cls += ' same';
      }
      if (settings.showErrors && v && !G.puz[i] && v !== G.sol[i]) cls += ' err';
      if (v && v === G.sol[i]) counts[v]++;
      c.el.className = cls;
      c.v.textContent = v ? v : '';
      var nm = v ? 0 : G.notes[i];
      for (var k = 0; k < 9; k++) c.ns[k].textContent = (nm >> k) & 1 ? k + 1 : '';
    }
    var pads = $$('.pad-btn');
    for (var n = 1; n <= 9; n++) {
      var rem = 9 - counts[n];
      pads[n - 1].querySelector('.r').textContent = rem > 0 ? rem : '';
      pads[n - 1].disabled = rem <= 0 || G.finished;
    }
    $('#g-mist').textContent = G.mist;
    $('#g-hintct').textContent = G.mode === 'battle' ? '' : t('hint') + ': ' + G.hints;
    $('#g-title').textContent = G.mode === 'daily' ? t('daily') + ' · ' + G.seed : (G.mode === 'battle' ? t('online') + ' · ' : '') + (G.mode === 'daily' ? '' : t(G.diff));
    $('#t-notes').classList.toggle('on', G.notesMode);
    $('#t-undo').disabled = !G.hist.length;
    $('#t-hint').disabled = G.mode === 'battle';
    $('#g-timer').textContent = fmt(Math.floor(G.ms / 1000));
  }

  function setBattleBars(you, opp) {
    if (you !== null) { $('#bb-you').style.width = you + '%'; $('#bb-you-pct').textContent = you + '%'; }
    if (opp !== null) { $('#bb-opp').style.width = opp + '%'; $('#bb-opp-pct').textContent = opp + '%'; }
  }

  /* ---------- settings ---------- */
  function renderSettings() {
    var lg = $('#set-lang'); lg.innerHTML = '';
    I.LANGS.forEach(function (l) {
      var b = el('button', l[0] === I.get() ? 'on' : '', l[1]); b.type = 'button';
      b.onclick = function () { setLang(l[0]); renderSettings(); };
      lg.appendChild(b);
    });
    $$('#set-theme button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-th') === settings.theme); });
    $('#set-errors').checked = !!settings.showErrors;
    $('#set-name').value = settings.name || '';
    $('#set-name').placeholder = settings.playerId;
    $('#set-pid').textContent = settings.playerId;
  }
  function setLang(l) {
    I.set(l); I.apply(); renderHome(); if (G) renderAll();
    if (window.Online && window.Online.refresh) window.Online.refresh();
  }

  /* ---------- install ---------- */
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function isStandalone() { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
  function updateInstallBtn() { $('#btn-install').hidden = isStandalone() || !(deferredPrompt || isIOS); }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredPrompt = e; updateInstallBtn(); });
  window.addEventListener('appinstalled', function () { deferredPrompt = null; updateInstallBtn(); });

  /* ---------- events ---------- */
  function bind() {
    $$('.btn.diff').forEach(function (b) {
      b.addEventListener('click', function () {
        if (LS.get('sdk_save', null) && !confirm(t('confirmNew'))) return;
        newGame(b.getAttribute('data-diff'));
      });
    });
    $('#btn-continue').addEventListener('click', loadSave);
    $('#btn-daily').addEventListener('click', function () {
      var today = C.dailySeed();
      var sv = LS.get('sdk_save', null);
      if (sv && sv.mode === 'daily' && sv.seed === today) { loadSave(); return; }
      if (stats.dailyDone[today] !== undefined) {
        showInfo({
          title: t('dailyDone'), body: [el('div', 'big-time', fmt(stats.dailyDone[today]))],
          buttons: [{ label: t('ok'), cls: 'ghost' }, { label: t('again'), cls: 'primary', onClick: function () { startDaily(true); } }]
        });
        return;
      }
      if (sv && !confirm(t('confirmNew'))) return;
      startDaily(false);
    });
    $('#btn-online').addEventListener('click', function () { show('online'); if (window.Online) window.Online.openLobby(); });
    $('#btn-board').addEventListener('click', function () { show('board'); });
    $('#lb-back').addEventListener('click', function () { show('home'); });
    $('#btn-lang').addEventListener('click', function () {
      var idx = 0; I.LANGS.forEach(function (l, k) { if (l[0] === I.get()) idx = k; });
      setLang(I.LANGS[(idx + 1) % I.LANGS.length][0]);
    });
    $('#btn-settings').addEventListener('click', function () { renderSettings(); $('#modal-settings').classList.add('open'); });
    $('#set-close').addEventListener('click', function () { $('#modal-settings').classList.remove('open'); });
    $('#modal-settings').addEventListener('click', function (e) { if (e.target.id === 'modal-settings') e.target.classList.remove('open'); });
    $$('#set-theme button').forEach(function (b) {
      b.addEventListener('click', function () { settings.theme = b.getAttribute('data-th'); settings.themeSet = true; saveSettings(); applyTheme(); renderSettings(); });
    });
    $('#set-errors').addEventListener('change', function (e) { settings.showErrors = e.target.checked; saveSettings(); if (G) renderAll(); });
    $('#set-name').addEventListener('input', function (e) { settings.name = e.target.value.slice(0, 20); saveSettings(); });
    $('#btn-install').addEventListener('click', function () {
      if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(function () { deferredPrompt = null; updateInstallBtn(); }); }
      else if (isIOS) showInfo({ title: t('install'), body: [t('iosInstall')], buttons: [{ label: t('ok'), cls: 'primary' }] });
    });

    $('#g-back').addEventListener('click', function () {
      if (!G) { show('home'); return; }
      if (G.mode === 'battle' && !G.finished) {
        if (confirm(t('confirmNew'))) { if (G.battle && G.battle.onLeave) G.battle.onLeave(); }
        return;
      }
      if (G.mode === 'battle') { if (G.battle && G.battle.onLeave) G.battle.onLeave(); return; }
      save(); show('home');
    });
    $('#g-pause').addEventListener('click', function () { setPaused(!G.paused); });
    $('#g-restart').addEventListener('click', restart);
    $('#btn-restart').addEventListener('click', restart);
    $('#btn-resume').addEventListener('click', function () { setPaused(false); });
    $('#t-undo').addEventListener('click', undo);
    $('#t-erase').addEventListener('click', function () { input(0); });
    $('#t-notes').addEventListener('click', function () { if (G) { G.notesMode = !G.notesMode; renderAll(); } });
    $('#t-hint').addEventListener('click', hint);

    document.addEventListener('keydown', function (e) {
      if (current !== 'game' || !G || e.target.tagName === 'INPUT') return;
      if (e.key >= '1' && e.key <= '9') { input(+e.key); e.preventDefault(); }
      else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') { input(0); e.preventDefault(); }
      else if (e.key === 'n' || e.key === 'N') { G.notesMode = !G.notesMode; renderAll(); }
      else if (e.key === 'h' || e.key === 'H') hint();
      else if (e.key === 'z' || e.key === 'Z') undo();
      else if (e.key.indexOf('Arrow') === 0 && G.sel !== null && !G.paused) {
        var r = C.ROW[G.sel], c = C.COL[G.sel];
        if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
        if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
        if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
        if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
        G.sel = r * 9 + c; renderAll(); e.preventDefault();
      }
    });
  }

  /* ---------- public API for online.js ---------- */
  window.App = {
    t: t, show: show, toast: toast, showInfo: showInfo, closeModal: closeModal, fmt: fmt, el: el,
    startBattleGame: startBattleGame,
    setOppProgress: function (p) { setBattleBars(null, p); },
    freeze: function () { if (G) { tick(); G.finished = true; renderAll(); } },
    getSettings: function () { return settings; },
    displayName: displayName,
    saveSettings: saveSettings,
    renderMyBest: renderMyBest,
    getConfig: function () { return window.SUDOKU_CONFIG || {}; }
  };

  /* ---------- init ---------- */
  buildBoard(); bind(); applyTheme(); I.apply(); renderHome();
})();
