/* World Conquest: hex map where every conquest is a timed sudoku. */
(function () {
  'use strict';
  var C = SudokuCore, W = WorldMap, I = I18N;
  document.getElementById('w-hint').textContent = '…';
  W.ready.then(main);
  function main() {
  function $(s) { return document.querySelector(s); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- strings ---------- */
  var S = {
    zh: { mapReal: '地图：真实世界地图 ✓', mapSimple: '地图：简化版（真实地图下载失败）', mapRetry: '重新下载真实地图', mapLate: '真实地图已下载，重新打开后生效', wTitle: '世界征服', turnN: '第 {n} 回合', pickStart: '点击地图选择你的首都（双指缩放、拖动）', buildCap: '在这里建立首都', region: '区域', fort: '要塞', plain: '平原', mine: '我的领地', capital: '首都',
      attack: '进攻', timeLimit: '限时', reward: '奖励', notAdj: '只能进攻与你领地相邻的格子', cooling: '冷却中：还需 {n} 回合', upgrade: '升级', train: '练兵', progress: '占领 {a}/{b}',
      inf: '步兵', tank: '装甲', air: '空军', eng: '工程兵', infD: '6×6 时间 +20 秒 / 级', tankD: '9×9 时间 +45 秒 / 级', airD: '每次进攻 +1 个提示 / 级', engD: '答错少扣 2 秒 / 级',
      max: '已满级', notEnough: '资源不足', sdAttack: '进攻', sdTrain: '练兵', timeUp: '时间到！进攻失败', timeUpD: '该格冷却 2 回合后可再次进攻。', captured: '占领成功！', fast: '速度奖励 +50%', income: '本回合收入',
      retreat: '撤退？本次进攻将作废。', hint: '提示', back: '返回', erase: '擦除', notes: '笔记', worldWon: '你征服了全世界！', resetGame: '重新开始战争', confirmReset: '确定重新开始？进度将清空。',
      ok: '继续', home: '回首页', mistakes: '错误', lvl: '等级', untilEnd: '剩余', trainDone: '练兵完成', menu: '菜单', cancel: '取消', income2: '每回合收入', mistakePen: '答错 -{n} 秒', hintsLeft: '提示', mapReal: '真实地图', mapSimple: '简化地图（联网后刷新）' },
    en: { mapReal: 'Map: real world map ✓', mapSimple: 'Map: simplified (real map download failed)', mapRetry: 'Re-download real map', mapLate: 'Real map downloaded; reopen to use it', wTitle: 'World Conquest', turnN: 'Turn {n}', pickStart: 'Tap the map to choose your capital (drag, pinch to zoom)', buildCap: 'Build capital here', region: 'Region', fort: 'Fortress', plain: 'Plains', mine: 'My territory', capital: 'Capital',
      attack: 'Attack', timeLimit: 'Time limit', reward: 'Reward', notAdj: 'You can only attack hexes next to your territory', cooling: 'Cooling down: {n} turns', upgrade: 'Upgrade', train: 'Train', progress: 'Captured {a}/{b}',
      inf: 'Infantry', tank: 'Armor', air: 'Air force', eng: 'Engineers', infD: '6×6 time +20s / level', tankD: '9×9 time +45s / level', airD: '+1 hint per attack / level', engD: 'Mistake costs 2s less / level',
      max: 'MAX', notEnough: 'Not enough resources', sdAttack: 'Attack', sdTrain: 'Training', timeUp: "Time's up! Attack failed", timeUpD: 'This hex can be attacked again in 2 turns.', captured: 'Captured!', fast: 'Speed bonus +50%', income: 'Income this turn',
      retreat: 'Retreat? This attack will be cancelled.', hint: 'Hint', back: 'Back', erase: 'Erase', notes: 'Notes', worldWon: 'You conquered the world!', resetGame: 'Restart war', confirmReset: 'Restart? All progress will be erased.',
      ok: 'Continue', home: 'Home', mistakes: 'Mistakes', lvl: 'Lv', untilEnd: 'Left', trainDone: 'Training complete', menu: 'Menu', cancel: 'Cancel', income2: 'Income per turn', mistakePen: 'Mistake -{n}s', hintsLeft: 'Hints', mapReal: 'Real map', mapSimple: 'Simplified map (go online, refresh)' },
    ru: { mapReal: 'Карта: реальная ✓', mapSimple: 'Карта: упрощённая (не удалось загрузить реальную)', mapRetry: 'Загрузить реальную карту заново', mapLate: 'Реальная карта загружена; откройте заново', wTitle: 'Завоевание мира', turnN: 'Ход {n}', pickStart: 'Нажмите на карту, чтобы выбрать столицу (двигайте, щипок — масштаб)', buildCap: 'Основать столицу здесь', region: 'Регион', fort: 'Крепость', plain: 'Равнина', mine: 'Моя территория', capital: 'Столица',
      attack: 'Атаковать', timeLimit: 'Время', reward: 'Награда', notAdj: 'Атаковать можно только соседние с вашей территорией', cooling: 'Перезарядка: {n} ходов', upgrade: 'Улучшения', train: 'Тренировка', progress: 'Захвачено {a}/{b}',
      inf: 'Пехота', tank: 'Броня', air: 'Авиация', eng: 'Инженеры', infD: 'Время 6×6 +20 с / ур.', tankD: 'Время 9×9 +45 с / ур.', airD: '+1 подсказка за атаку / ур.', engD: 'Ошибка стоит на 2 с меньше / ур.',
      max: 'МАКС', notEnough: 'Не хватает ресурсов', sdAttack: 'Атака', sdTrain: 'Тренировка', timeUp: 'Время вышло! Атака провалена', timeUpD: 'Эту клетку можно атаковать снова через 2 хода.', captured: 'Захвачено!', fast: 'Бонус за скорость +50%', income: 'Доход за ход',
      retreat: 'Отступить? Эта атака будет отменена.', hint: 'Подсказка', back: 'Назад', erase: 'Стереть', notes: 'Заметки', worldWon: 'Вы завоевали мир!', resetGame: 'Начать войну заново', confirmReset: 'Начать заново? Прогресс будет удалён.',
      ok: 'Дальше', home: 'Домой', mistakes: 'Ошибки', lvl: 'Ур.', untilEnd: 'Осталось', trainDone: 'Тренировка завершена', menu: 'Меню', cancel: 'Отмена', income2: 'Доход за ход', mistakePen: 'Ошибка -{n} с', hintsLeft: 'Подсказки', mapReal: 'Реальная карта', mapSimple: 'Упрощённая карта (подключитесь и обновите)' },
    kk: { mapReal: 'Карта: нақты әлем картасы ✓', mapSimple: 'Карта: жеңілдетілген (нақты карта жүктелмеді)', mapRetry: 'Нақты картаны қайта жүктеу', mapLate: 'Нақты карта жүктелді; қайта ашыңыз', wTitle: 'Әлемді жаулау', turnN: '{n}-жүріс', pickStart: 'Астананы таңдау үшін картаны басыңыз (сүйреу, екі саусақпен масштаб)', buildCap: 'Осы жерге астана құру', region: 'Аймақ', fort: 'Бекініс', plain: 'Жазық', mine: 'Менің аумағым', capital: 'Астана',
      attack: 'Шабуыл', timeLimit: 'Уақыт', reward: 'Сыйлық', notAdj: 'Тек аумағыңызбен шектесетін аймаққа шабуылдауға болады', cooling: 'Күту: {n} жүріс', upgrade: 'Жақсарту', train: 'Жаттығу', progress: 'Жаулап алынды {a}/{b}',
      inf: 'Жаяу әскер', tank: 'Сауытты', air: 'Әуе күштері', eng: 'Инженерлер', infD: '6×6 уақыты +20 сек / деңгей', tankD: '9×9 уақыты +45 сек / деңгей', airD: 'Әр шабуылға +1 кеңес / деңгей', engD: 'Қателік 2 сек аз алады / деңгей',
      max: 'МАКС', notEnough: 'Ресурс жеткіліксіз', sdAttack: 'Шабуыл', sdTrain: 'Жаттығу', timeUp: 'Уақыт бітті! Шабуыл сәтсіз', timeUpD: 'Бұл аймаққа 2 жүрістен кейін қайта шабуылдауға болады.', captured: 'Жаулап алынды!', fast: 'Жылдамдық бонусы +50%', income: 'Осы жүрістегі табыс',
      retreat: 'Шегінесіз бе? Бұл шабуыл жойылады.', hint: 'Кеңес', back: 'Артқа', erase: 'Өшіру', notes: 'Жазба', worldWon: 'Сіз бүкіл әлемді жаулап алдыңыз!', resetGame: 'Соғысты қайта бастау', confirmReset: 'Қайта бастайсыз ба? Барлық прогресс өшеді.',
      ok: 'Жалғастыру', home: 'Басты бет', mistakes: 'Қате', lvl: 'Дең.', untilEnd: 'Қалды', trainDone: 'Жаттығу аяқталды', menu: 'Мәзір', cancel: 'Бас тарту', income2: 'Жүріс сайынғы табыс', mistakePen: 'Қате -{n} сек', hintsLeft: 'Кеңес', mapReal: 'Нақты карта', mapSimple: 'Жеңілдетілген карта (интернетке қосылып жаңартыңыз)' }
  };
  Object.keys(S).forEach(function (l) { if (I.T[l]) Object.assign(I.T[l], S[l]); });
  function t(k, v) { var s = I.t(k); if (v) for (var x in v) s = s.replace('{' + x + '}', v[x]); return s; }
  var LI = { en: 2, ru: 3, zh: 4, kk: 5 };
  function cityName(i) { return W.CITIES[i][LI[I.get()] || 2]; }

  /* ---------- state ---------- */
  var DEF = { v: 1, start: -1, owned: [], g: 0, s: 0, up: { inf: 0, tank: 0, air: 0, eng: 0 }, turn: 1, cd: {}, att: 0 };
  var st = Object.assign({}, DEF, LS.get('sdk_war', {}));
  st.up = Object.assign({}, DEF.up, st.up || {});
  st.owned = st.owned.filter(function (id) { return W.byId[id]; });
  if (st.start >= 0 && !W.byId[st.start]) { st.start = -1; st.owned = []; }
  var owned = {}; st.owned.forEach(function (id) { owned[id] = 1; });
  function save() { st.owned = Object.keys(owned).map(Number); LS.set('sdk_war', st); }
  function gems() { return (LS.get('sdk_stats', {}) || {}).gems || 0; }
  function addGems(n) { var s = LS.get('sdk_stats', {}) || {}; s.gems = Math.max(0, (s.gems || 0) + n); LS.set('sdk_stats', s); }

  var COST = { inf: ['g', [40, 90, 160, 260, 400]], tank: ['s', [3, 6, 10, 15, 22]], eng: ['g', [50, 100, 180, 300, 450]], air: ['d', [2, 4, 7]] };
  var ICON = { inf: '🪖', tank: '🛡️', air: '✈️', eng: '🔧' };
  function isFort(h) { return h.city >= 0 || h.mount; }
  function timeFor(h) { return isFort(h) ? 600 + 45 * st.up.tank : 240 + 20 * st.up.inf; }
  function penalty() { return Math.max(2, 10 - 2 * st.up.eng); }
  function rewardFor(h) { return isFort(h) ? { g: 60, s: 3, d: 1 } : { g: 20, s: 1, d: 0 }; }
  function income() { var n = 0; for (var id in owned) n += isFort(W.byId[id]) ? 6 : 2; return n; }
  function hexName(h) { return h.city >= 0 ? cityName(h.city) : (h.cn || t('region')) + ' ' + Math.abs(Math.round(h.lat)) + '°' + (h.lat >= 0 ? 'N' : 'S') + ' ' + Math.abs(Math.round(h.lon)) + '°' + (h.lon >= 0 ? 'E' : 'W'); }
  function adjacent(h) { return W.neighbors(h.col, h.row).some(function (id) { return owned[id]; }); }
  function cdLeft(h) { return Math.max(0, (st.cd[h.id] || 0) - st.turn); }
  var totalHex = W.hexes.length;

  /* ---------- map view ---------- */
  var cv = $('#map'), ctx = cv.getContext('2d');
  var SZ = 22, HW = Math.sqrt(3) * SZ, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var view = { x: 0, y: 0, k: 0.5 }, sel = null, vw = 0, vh = 0;
  var worldW = W.COLS * HW, worldH = W.ROWS * 1.5 * SZ + SZ * 2;
  function center(h) { return [(h.col + 0.5 * (h.row & 1) + 0.5) * HW, h.row * 1.5 * SZ + SZ]; }
  var CORN = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i - Math.PI / 6; CORN.push([Math.cos(a) * (SZ - 0.8), Math.sin(a) * (SZ - 0.8)]); }
  function resize() {
    var r = $('#mapwrap').getBoundingClientRect(); vw = r.width; vh = r.height;
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr); clamp(); draw();
  }
  function clamp() {
    var minK = Math.max(vw / worldW, vh / worldH) * 0.9; if (view.k < minK) view.k = minK; if (view.k > 2.6) view.k = 2.6;
    var ww = worldW * view.k, wh = worldH * view.k;
    view.x = ww <= vw ? (vw - ww) / 2 : Math.min(40, Math.max(vw - ww - 40, view.x));
    view.y = wh <= vh ? (vh - wh) / 2 : Math.min(40, Math.max(vh - wh - 40, view.y));
  }
  function focus(h, k) { var c = center(h); view.k = k || view.k; view.x = vw / 2 - c[0] * view.k; view.y = vh / 2 - c[1] * view.k; clamp(); draw(); }
  function hexPath(cx, cy) { ctx.beginPath(); for (var i = 0; i < 6; i++) { var x = cx + CORN[i][0], y = cy + CORN[i][1]; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); }
  /* real-geography base layer */
  function lonX(lon) { return (lon + 180) / W.DLON * HW; }
  function latY(lat) { return (W.LAT0 - lat) / W.DLAT * 1.5 * SZ + SZ; }
  var LC = {};
  function landColor(name) {
    if (LC[name]) return LC[name];
    var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return (LC[name] = 'hsl(' + (70 + h % 60) + ',' + (20 + (h >> 3) % 10) + '%,' + (27 + (h >> 5) % 9) + '%)');
  }
  var labelsCache = null;
  function countryLabels() {
    if (labelsCache) return labelsCache;
    var best = {};
    (W.polys || []).forEach(function (p) { if (!p.name) return; var a = (p.x1 - p.x0) * (p.y1 - p.y0); if (!best[p.name] || a > best[p.name].a) best[p.name] = { a: a, p: p }; });
    labelsCache = Object.keys(best).map(function (n) { var p = best[n].p; return { n: n, x: lonX((p.x0 + p.x1) / 2), y: latY((p.y0 + p.y1) / 2), w: (p.x1 - p.x0) / W.DLON * HW }; });
    return labelsCache;
  }
  function drawLand(x0, x1, y0, y1) {
    var polys = W.polys || [];
    for (var i = 0; i < polys.length; i++) {
      var p = polys[i];
      if (lonX(p.x1) < x0 || lonX(p.x0) > x1 || latY(p.y0) < y0 || latY(p.y1) > y1) continue;
      ctx.beginPath();
      for (var r = 0; r < p.rings.length; r++) {
        var ring = p.rings[r];
        for (var k = 0; k < ring.length; k++) { var x = lonX(ring[k][0]), y = latY(ring[k][1]); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
        ctx.closePath();
      }
      ctx.fillStyle = landColor(p.name || 'x'); ctx.fill('evenodd');
      ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(225,238,250,.4)'; ctx.stroke();
    }
  }
  function drawCountryNames() {
    if (!W.real) return;
    ctx.font = '600 ' + 12 + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(255,255,255,.38)';
    countryLabels().forEach(function (l) { if (l.w * view.k > 80) ctx.fillText(l.n.toUpperCase(), l.x, l.y); });
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    ctx.save(); ctx.translate(view.x, view.y); ctx.scale(view.k, view.k);
    var x0 = -view.x / view.k - SZ * 2, x1 = (vw - view.x) / view.k + SZ * 2, y0 = -view.y / view.k - SZ * 2, y1 = (vh - view.y) / view.k + SZ * 2;
    var started = st.start >= 0;
    var labels = [];
    drawLand(x0, x1, y0, y1);
    drawCountryNames();
    for (var n = 0; n < W.hexes.length; n++) {
      var h = W.hexes[n], c = center(h);
      if (c[0] < x0 || c[0] > x1 || c[1] < y0 || c[1] > y1) continue;
      var mine = owned[h.id], fort = isFort(h), canAtk = started && !mine && adjacent(h), cd = cdLeft(h);
      hexPath(c[0], c[1]);
      var fs = mine ? (fort ? 'rgba(59,134,214,.62)' : 'rgba(47,111,176,.55)') : (cd > 0 && canAtk ? 'rgba(60,60,60,.7)' : (fort ? 'rgba(150,100,50,.4)' : ''));
      if (fs) { ctx.fillStyle = fs; ctx.fill(); }
      ctx.lineWidth = mine ? 1.6 : 0.8; ctx.strokeStyle = mine ? '#8cc2ff' : 'rgba(255,255,255,.17)'; ctx.stroke();
      if (canAtk && cd === 0) { hexPath(c[0], c[1]); ctx.lineWidth = 2.2; ctx.strokeStyle = '#ff6b5f'; ctx.stroke(); }
      if (sel && sel.id === h.id) { hexPath(c[0], c[1]); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); }
      var ico = '';
      if (h.id === st.start) ico = '⚑'; else if (h.city >= 0) ico = '★'; else if (h.mount) ico = '▲';
      if (ico) { ctx.fillStyle = mine ? '#fff' : '#f2d27a'; ctx.font = (SZ * 0.9) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ico, c[0], c[1] + 1); }
      if (cd > 0 && canAtk) { ctx.fillStyle = '#ddd'; ctx.font = 'bold ' + (SZ * 0.7) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⏳' + cd, c[0], c[1]); }
      if (h.city >= 0 && view.k >= 0.85) labels.push([cityName(h.city), c[0], c[1] + SZ * 0.95]);
    }
    ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.fillStyle = '#fff';
    labels.forEach(function (l) { ctx.strokeText(l[0], l[1], l[2]); ctx.fillText(l[0], l[1], l[2]); });
    ctx.restore();
  }
  function hexAt(sx, sy) {
    var wx = (sx - view.x) / view.k, wy = (sy - view.y) / view.k, best = null, bd = SZ * SZ * 0.95;
    for (var n = 0; n < W.hexes.length; n++) { var h = W.hexes[n], c = center(h), dx = c[0] - wx, dy = c[1] - wy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = h; } }
    return best;
  }

  // pointer handling: drag, pinch, tap
  var ptrs = {}, drag = null, pinch = null;
  cv.addEventListener('pointerdown', function (e) {
    cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = { x: e.offsetX, y: e.offsetY };
    var ids = Object.keys(ptrs);
    if (ids.length === 1) drag = { sx: e.offsetX, sy: e.offsetY, vx: view.x, vy: view.y, moved: false };
    else if (ids.length === 2) { drag = null; var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: view.k, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, vx: view.x, vy: view.y }; }
  });
  cv.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return; ptrs[e.pointerId] = { x: e.offsetX, y: e.offsetY };
    var ids = Object.keys(ptrs);
    if (pinch && ids.length >= 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), nk = Math.min(2.6, Math.max(0.1, pinch.k * d / pinch.d));
      view.x = pinch.cx - (pinch.cx - pinch.vx) * nk / pinch.k; view.y = pinch.cy - (pinch.cy - pinch.vy) * nk / pinch.k; view.k = nk; clamp(); draw();
    } else if (drag) {
      var dx = e.offsetX - drag.sx, dy = e.offsetY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 7) drag.moved = true;
      if (drag.moved) { view.x = drag.vx + dx; view.y = drag.vy + dy; clamp(); draw(); }
    }
  });
  function up(e) {
    var was = drag; delete ptrs[e.pointerId];
    if (Object.keys(ptrs).length < 2) pinch = null;
    if (was && !was.moved && e.type === 'pointerup') tap(e.offsetX, e.offsetY);
    if (!Object.keys(ptrs).length) drag = null;
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) {
    e.preventDefault(); var nk = Math.min(2.6, Math.max(0.1, view.k * (e.deltaY < 0 ? 1.15 : 0.87)));
    view.x = e.offsetX - (e.offsetX - view.x) * nk / view.k; view.y = e.offsetY - (e.offsetY - view.y) * nk / view.k; view.k = nk; clamp(); draw();
  }, { passive: false });

  /* ---------- panel / map actions ---------- */
  function tap(x, y) { var h = hexAt(x, y); sel = h; draw(); renderPanel(); }
  function renderPanel() {
    var p = $('#panel');
    if (!sel) { p.hidden = true; return; }
    var h = sel, body = $('#p-body'), go = $('#p-go'); body.innerHTML = '';
    $('#p-title').textContent = hexName(h);
    $('#p-type').textContent = (h.id === st.start ? t('capital') + ' · ' : '') + (isFort(h) ? t('fort') + ' 9×9' : t('plain') + ' 6×6');
    p.hidden = false; go.hidden = false; go.className = 'btn primary'; go.disabled = false;
    if (st.start < 0) { go.textContent = t('buildCap'); go.className = 'btn green'; go.onclick = function () { build(h); }; return; }
    if (owned[h.id]) { go.hidden = true; var d = el('div'); d.innerHTML = '<b>' + t('mine') + '</b>'; body.appendChild(d); return; }
    var r = rewardFor(h), tl = timeFor(h);
    var l1 = el('div'); l1.innerHTML = t('timeLimit') + ': <b>' + fmt(tl) + '</b> · ' + t('reward') + ': <b>🪙' + r.g + ' ⚙️' + r.s + (r.d ? ' 💎' + r.d : '') + '</b>'; body.appendChild(l1);
    if (!adjacent(h)) { body.appendChild(el('div', '', t('notAdj'))); go.disabled = true; go.textContent = t('attack'); go.onclick = null; return; }
    var cd = cdLeft(h);
    if (cd > 0) { body.appendChild(el('div', '', t('cooling', { n: cd }))); go.disabled = true; }
    go.textContent = '⚔️ ' + t('attack'); go.onclick = function () { startSudoku({ kind: 'attack', hex: h }); };
  }
  function build(h) {
    st.start = h.id; owned[h.id] = 1; save(); sel = null; $('#panel').hidden = true; refresh(); focus(h, 1.1);
  }
  function fmt(s) { s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }

  function refresh() {
    $('#w-turn').textContent = t('turnN', { n: st.turn });
    $('#r-g').textContent = st.g; $('#r-s').textContent = st.s; $('#r-d').textContent = gems();
    var n = Object.keys(owned).length;
    $('#b-prog-fill').style.width = Math.max(1, n * 100 / totalHex) + '%';
    $('#b-prog-t').textContent = t('progress', { a: n, b: totalHex });
    $('#b-up-t').textContent = t('upgrade'); $('#b-train-t').textContent = t('train');
    $('#w-hint').textContent = st.start < 0 ? t('pickStart') : '';
    $('#w-map').textContent = W.real ? '🌍 ' + t('mapReal') : '⚠ ' + t('mapSimple');
    $('#w-map').className = 'mapnote' + (W.real ? '' : ' warn');
    $('#t-erase-t').textContent = t('erase'); $('#t-notes-t').textContent = t('notes');
    document.title = t('wTitle');
    draw();
  }

  /* ---------- modal / toast ---------- */
  function showModal(title, body, buttons) {
    $('#m-title').textContent = title; var b = $('#m-body'); b.innerHTML = '';
    body.forEach(function (n) { b.appendChild(typeof n === 'string' ? el('div', '', n) : n); });
    var a = $('#m-actions'); a.innerHTML = '';
    buttons.forEach(function (x) { var bt = el('button', 'btn ' + (x.cls || ''), x.label); bt.type = 'button'; bt.onclick = function () { closeModal(); if (x.fn) x.fn(); }; a.appendChild(bt); });
    $('#modal').hidden = false;
  }
  function closeModal() { $('#modal').hidden = true; }
  var toastT; function toast(m) { var e = $('#toast'); e.textContent = m; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('show'); }, 1800); }

  /* ---------- upgrades ---------- */
  function openUpgrades() {
    var body = [];
    ['inf', 'tank', 'eng', 'air'].forEach(function (k) {
      var lv = st.up[k], arr = COST[k][1], res = COST[k][0], maxed = lv >= arr.length, cost = maxed ? 0 : arr[lv];
      var have = res === 'g' ? st.g : res === 's' ? st.s : gems(), sym = res === 'g' ? '🪙' : res === 's' ? '⚙️' : '💎';
      var row = el('div', 'unit'); row.appendChild(el('div', 'ui', ICON[k]));
      var mid = el('div'); mid.appendChild(el('b', '', t(k) + ' · ' + t('lvl') + ' ' + lv)); mid.appendChild(el('small', '', t(k + 'D')));
      var bars = el('div', 'lv'); for (var i = 0; i < arr.length; i++) bars.appendChild(el('i', i < lv ? 'on' : '')); mid.appendChild(bars); row.appendChild(mid);
      var bt = el('button', 'btn' + (maxed ? '' : ' green'), maxed ? t('max') : sym + ' ' + cost); bt.type = 'button'; bt.disabled = maxed || have < cost;
      bt.onclick = function () {
        if (res === 'g') st.g -= cost; else if (res === 's') st.s -= cost; else addGems(-cost);
        st.up[k]++; save(); refresh(); openUpgrades();
      };
      row.appendChild(bt); body.push(row);
    });
    body.push(el('small', '', t('income2') + ': 🪙' + income()));
    showModal(t('upgrade'), body, [{ label: t('ok') }]);
  }

  /* ---------- sudoku ---------- */
  var G = null, cells = [], builtN = 0, timer = null;
  function bcls(g, i) { var r = g.ROW[i], c = g.COL[i], n = g.n; return 'cell' + ((c + 1) % g.bc === 0 && c !== n - 1 ? ' bR' : '') + ((r + 1) % g.br === 0 && r !== n - 1 ? ' bB' : ''); }
  function buildBoard(n) {
    if (builtN === n) return; builtN = n;
    var geo = C.geom(n), b = $('#board'), nc = n === 4 ? 2 : 3, nr = n === 9 ? 3 : 2;
    b.innerHTML = ''; cells = []; b.style.setProperty('--n', n);
    var nh = '<span class="n" style="grid-template-columns:repeat(' + nc + ',1fr);grid-template-rows:repeat(' + nr + ',1fr)">'; for (var k = 0; k < n; k++) nh += '<i></i>'; nh += '</span>';
    for (var i = 0; i < n * n; i++) { var d = document.createElement('div'); d.className = bcls(geo, i); d.setAttribute('data-i', i); d.innerHTML = '<span class="v"></span>' + nh; b.appendChild(d); cells.push({ el: d, v: d.firstChild, ns: d.lastChild.children }); }
    var pad = $('#pad'); pad.innerHTML = ''; pad.style.setProperty('--n', n);
    for (var q = 1; q <= n; q++) { var bt = el('button', 'pad-btn', String(q)); bt.type = 'button'; bt.setAttribute('data-n', q); pad.appendChild(bt); }
  }
  function startSudoku(o) {
    var n, diff, seed, limit = null;
    if (o.kind === 'train') { n = 4; diff = 'easy'; seed = 'train|' + Date.now(); }
    else { var f = isFort(o.hex); n = f ? 9 : 6; diff = f ? 'hard' : 'medium'; seed = 'war|' + o.hex.id + '|' + st.att; limit = timeFor(o.hex); }
    var gen = C.generate(seed, diff);
    G = { o: o, n: n, geo: C.geom(n), puz: gen.puzzle.split('').map(Number), sol: gen.solution.split('').map(Number), notes: [], sel: null, notesMode: false, mist: 0, hints: o.kind === 'train' ? 1 : st.up.air, limit: limit, deadline: limit ? Date.now() + limit * 1000 : null, over: false };
    G.cur = G.puz.slice(); G.notes = new Array(n * n).fill(0);
    for (var i = 0; i < n * n; i++) if (!G.puz[i]) { G.sel = i; break; }
    buildBoard(n); $('#screen-sd').hidden = false; $('#panel').hidden = true;
    $('#sd-title').textContent = (o.kind === 'train' ? '🎯 ' + t('sdTrain') + ' 4×4' : '⚔️ ' + hexName(o.hex) + ' · ' + n + '×' + n);
    $('#sd-info').textContent = o.kind === 'train' ? '' : t('mistakePen', { n: penalty() });
    $('#sd-time').hidden = !limit; $('#sd-time').classList.remove('low');
    renderSd(); clearInterval(timer); timer = setInterval(tickSd, 200); tickSd();
  }
  function remaining() { return G.deadline ? (G.deadline - Date.now()) / 1000 : Infinity; }
  function tickSd() {
    if (!G || G.over) return;
    var r = remaining();
    if (G.deadline) { $('#sd-time').textContent = fmt(Math.ceil(r)); $('#sd-time').classList.toggle('low', r <= 30); }
    if (G.deadline && r <= 0) failAttack();
  }
  function renderSd() {
    var g = G, n = g.n, geo = g.geo, sel = g.sel, sv = sel !== null ? g.cur[sel] : 0;
    for (var i = 0; i < n * n; i++) {
      var c = cells[i], v = g.cur[i], cls = bcls(geo, i);
      if (g.puz[i]) cls += ' given';
      if (sel !== null) { if (i === sel) cls += ' sel'; else if (geo.ROW[i] === geo.ROW[sel] || geo.COL[i] === geo.COL[sel] || geo.BOX[i] === geo.BOX[sel]) cls += ' peer'; if (i !== sel && sv && v === sv) cls += ' same'; }
      if (v && !g.puz[i] && v !== g.sol[i]) cls += ' err';
      c.el.className = cls; c.v.textContent = v || '';
      var nm = v ? 0 : g.notes[i]; for (var k = 0; k < n; k++) c.ns[k].textContent = (nm >> k) & 1 ? k + 1 : '';
    }
    $('#sd-mist').textContent = t('mistakes') + ': ' + g.mist;
    $('#t-notes').classList.toggle('on', g.notesMode);
    $('#t-hint').disabled = g.hints <= 0; $('#t-hint-t').textContent = t('hint') + ' ' + g.hints;
  }
  function inputSd(v) {
    if (!G || G.over || G.sel === null) return; var i = G.sel; if (G.puz[i] || v > G.n) return;
    if (v === 0) { G.cur[i] = 0; G.notes[i] = 0; }
    else if (G.notesMode) { if (G.cur[i]) return; G.notes[i] ^= 1 << (v - 1); }
    else {
      if (G.cur[i] === v) return; G.cur[i] = v; G.notes[i] = 0;
      if (v !== G.sol[i]) { G.mist++; if (G.deadline) { G.deadline -= penalty() * 1000; toast('-' + penalty() + 's'); } }
      var bit = 1 << (v - 1), geo = G.geo;
      for (var p = 0; p < G.n * G.n; p++) if (p !== i && (geo.ROW[p] === geo.ROW[i] || geo.COL[p] === geo.COL[i] || geo.BOX[p] === geo.BOX[i])) G.notes[p] &= ~bit;
    }
    renderSd(); tickSd();
    if (!G.over && G.cur.every(function (x, k) { return x === G.sol[k]; })) winAttack();
  }
  function hintSd() {
    if (!G || G.over || G.hints <= 0) return; var cand = [];
    for (var k = 0; k < G.n * G.n; k++) if (!G.puz[k] && G.cur[k] !== G.sol[k]) cand.push(k);
    if (!cand.length) return; var i = (G.sel !== null && cand.indexOf(G.sel) >= 0) ? G.sel : cand[Math.floor(Math.random() * cand.length)];
    G.cur[i] = G.sol[i]; G.notes[i] = 0; G.sel = i; G.hints--; renderSd();
    if (G.cur.every(function (x, k) { return x === G.sol[k]; })) winAttack();
  }
  function endSd() { G.over = true; clearInterval(timer); $('#screen-sd').hidden = true; }
  function gainRow(r, bonus) { var d = el('div', 'gainrow'); d.appendChild(el('span', '', '🪙+' + r.g)); if (r.s) d.appendChild(el('span', '', '⚙️+' + r.s)); if (r.d) d.appendChild(el('span', '', '💎+' + r.d)); return d; }
  function nextTurn() { var inc = income(); st.g += inc; st.turn++; return inc; }
  function winAttack() {
    var o = G.o, left = remaining(), frac = G.limit ? left / G.limit : 0; endSd();
    if (o.kind === 'train') { st.g += 12; save(); refresh(); showModal(t('trainDone'), [gainRow({ g: 12, s: 0, d: 0 })], [{ label: t('ok') }]); return; }
    var h = o.hex, r = Object.assign({}, rewardFor(h)), fast = frac >= 0.5;
    if (fast) r.g = Math.floor(r.g * 1.5);
    owned[h.id] = 1; delete st.cd[h.id]; st.g += r.g; st.s += r.s; if (r.d) addGems(r.d); st.att++;
    var inc = nextTurn(); save(); sel = null; $('#panel').hidden = true; refresh();
    var body = [el('div', 'big', '🏴'), hexName(h), gainRow(r)]; if (fast) body.push(t('fast')); body.push(t('income') + ': 🪙+' + inc);
    var won = Object.keys(owned).length >= totalHex;
    showModal(won ? t('worldWon') : t('captured'), body, [{ label: t('ok'), cls: 'green' }]);
  }
  function failAttack() {
    var h = G.o.hex; endSd(); st.cd[h.id] = st.turn + 3; st.att++; var inc = nextTurn(); save(); refresh(); renderPanel();
    showModal(t('timeUp'), [el('div', 'big', '⏳'), t('timeUpD'), t('income') + ': 🪙+' + inc], [{ label: t('ok') }]);
  }

  /* ---------- wiring ---------- */
  $('#board').addEventListener('click', function (e) { var c = e.target.closest ? e.target.closest('.cell') : null; if (!c || !G || G.over) return; G.sel = +c.getAttribute('data-i'); renderSd(); });
  $('#pad').addEventListener('click', function (e) { var b = e.target.closest ? e.target.closest('.pad-btn') : null; if (b) inputSd(+b.getAttribute('data-n')); });
  $('#t-erase').addEventListener('click', function () { inputSd(0); });
  $('#t-notes').addEventListener('click', function () { if (G && !G.over) { G.notesMode = !G.notesMode; renderSd(); } });
  $('#t-hint').addEventListener('click', hintSd);
  $('#sd-back').addEventListener('click', function () { if (!G || G.over) return; if (confirm(t('retreat'))) { endSd(); } });
  document.addEventListener('keydown', function (e) {
    if (!G || G.over || $('#screen-sd').hidden) return;
    if (e.key >= '1' && e.key <= String(G.n)) inputSd(+e.key); else if (e.key === '0' || e.key === 'Backspace') inputSd(0); else if (e.key === 'n') { G.notesMode = !G.notesMode; renderSd(); }
  });
  $('#b-up').addEventListener('click', openUpgrades);
  $('#b-train').addEventListener('click', function () { startSudoku({ kind: 'train' }); });
  $('#w-home').addEventListener('click', function () { location.href = './'; });
  $('#w-menu').addEventListener('click', function () {
    var body = [W.status.real ? t('mapReal') : t('mapSimple')];
    if (!W.status.real && W.status.errors.length) { var sm = el('small', '', W.status.errors.join(' | ')); sm.style.cssText = 'color:#8aa0b0;word-break:break-all'; body.push(sm); }
    showModal(t('menu'), body, [
      { label: t('mapRetry'), fn: function () { try { localStorage.removeItem('sdk_topo2'); } catch (e) {} location.reload(); } },
      { label: t('resetGame'), fn: function () { if (confirm(t('confirmReset'))) { st = JSON.parse(JSON.stringify(DEF)); owned = {}; sel = null; save(); $('#panel').hidden = true; refresh(); focusDefault(); } } },
      { label: t('cancel') }]);
  });
  W.onLate = function () { if (st.start < 0 && !Object.keys(owned).length) location.reload(); else toast(t('mapLate')); };
  window.addEventListener('resize', resize);
  function focusDefault() { var h = W.byId[st.start]; if (h) focus(h, 1); else { view.k = 1.0; var c = [lonX(67), latY(48)]; view.x = vw / 2 - c[0] * view.k; view.y = vh / 2 - c[1] * view.k; clamp(); draw(); } }
  resize(); refresh(); focusDefault();
  if (st.start >= 0) { var sh = W.byId[st.start]; if (sh) focus(sh, 1); }
  window.WarDebug = { screenOf: function (id) { var c = center(W.byId[id]); return [c[0] * view.k + view.x, c[1] * view.k + view.y]; }, focus: function (id, k) { focus(W.byId[id], k); }, st: function () { return st; }, owned: function () { return owned; }, hexes: W.hexes };
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
