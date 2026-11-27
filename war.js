/* World Conquest: hex wargame on the real world map. Every attack is a timed sudoku. */
(function () {
  'use strict';
  var C = SudokuCore, W = WorldMap, I = I18N;
  function $(s) { return document.querySelector(s); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  $('#w-hint').textContent = '…';
  W.ready.then(main);

  /* ---------- strings ---------- */
  var S = {
    zh: { wTitle: '世界征服', turnOf: '第 {n}/{m} 回合', objective: '目标：占领 {c}（{a}/{b}）', attack: '进攻', endTurn: '结束回合', upgrade: '升级', train: '练兵', recruit: '在此征兵', notEnough: '资源不足',
      u_inf: '步兵', u_tank: '装甲车', u_art: '火炮', u_air: '空军', hp: '兵力', mv: '移动', rg: '射程', atk: '攻击', def: '防御',
      moveHint: '点蓝色格子移动，点红色目标进攻', sudokuInfo: '需解 {n}×{n} 数独，限时 {t}', dmgEst: '胜利后预计伤害', mine: '我方', enemyCity: '敌方城市', neutralCity: '中立城市', myCity: '我方城市', mountain: '山地（防御+2）', plain: '平原', terrainCity: '要塞（防御+2）',
      captured: '占领 {c}！', destroyed: '击毁敌军！', dealt: '造成 {d} 点伤害', counter: '反击受创 {d}', timeUp: '时间到！进攻失败', fast: '速度奖励', ok: '继续', home: '回首页', back: '返回',
      hint: '提示', erase: '擦除', notes: '笔记', mistakes: '错误', mistakePen: '答错 -{n} 秒', retreat: '撤退？本次进攻将作废。', trainDone: '练兵完成', menu: '菜单', cancel: '取消',
      restartWar: '重新开始战役', confirmReset: '确定重新开始？进度将清空。', enemyPhase: '敌军行动', evHit: '敌军攻击，我方受创 {n} 次', evLost: '失去 {c}！', evKilled: '我方损失 {n} 支部队', evSpawn: '敌军增援 {n} 支', evNone: '敌军按兵不动', turnEnd: '回合结束',
      victory: '胜利！', victoryD: '你守住了阿斯塔纳并夺回全部城市。', defeat: '失败', defeatCap: '首都阿斯塔纳失守。', defeatTime: '30 回合内没有完成目标。', mapReal: '真实地图', mapSimple: '简化地图（联网后刷新）', lvl: '等级', max: '已满级', income: '本回合收入',
      upInf: '步兵训练', upTank: '装甲科技', upEng: '工程兵', upAir: '空军', upArm: '武器', upPlate: '护甲',
      upInfD: '6×6 数独时间 +20 秒 / 级', upTankD: '9×9 数独时间 +45 秒 / 级', upEngD: '答错少扣 2 秒 / 级', upAirD: '每次进攻 +1 个提示 / 级', upArmD: '全军攻击 +1 / 级', upPlateD: '全军防御 +1 / 级',
      recruited: '已征召', maxUnits: '部队数量已达上限', acted: '本回合已行动' },
    en: { wTitle: 'World Conquest', turnOf: 'Turn {n}/{m}', objective: 'Goal: capture {c} ({a}/{b})', attack: 'Attack', endTurn: 'End turn', upgrade: 'Upgrade', train: 'Train', recruit: 'Recruit here', notEnough: 'Not enough resources',
      u_inf: 'Infantry', u_tank: 'Armor', u_art: 'Artillery', u_air: 'Air force', hp: 'Strength', mv: 'Move', rg: 'Range', atk: 'Attack', def: 'Defense',
      moveHint: 'Tap a blue hex to move, a red target to attack', sudokuInfo: 'Solve a {n}×{n} sudoku, time {t}', dmgEst: 'Damage on win', mine: 'Mine', enemyCity: 'Enemy city', neutralCity: 'Neutral city', myCity: 'Friendly city', mountain: 'Mountain (defense +2)', plain: 'Plains', terrainCity: 'Fortress (defense +2)',
      captured: 'Captured {c}!', destroyed: 'Enemy destroyed!', dealt: '{d} damage dealt', counter: 'Counter-attack: -{d}', timeUp: "Time's up! Attack failed", fast: 'Speed bonus', ok: 'Continue', home: 'Home', back: 'Back',
      hint: 'Hint', erase: 'Erase', notes: 'Notes', mistakes: 'Mistakes', mistakePen: 'Mistake -{n}s', retreat: 'Retreat? This attack will be cancelled.', trainDone: 'Training complete', menu: 'Menu', cancel: 'Cancel',
      restartWar: 'Restart campaign', confirmReset: 'Restart? All progress will be erased.', enemyPhase: 'Enemy phase', evHit: 'Enemy attacked: {n} hits on us', evLost: 'Lost {c}!', evKilled: 'We lost {n} units', evSpawn: 'Enemy reinforcements: {n}', evNone: 'The enemy held position', turnEnd: 'Turn over',
      victory: 'Victory!', victoryD: 'You held Astana and retook every city.', defeat: 'Defeat', defeatCap: 'The capital, Astana, has fallen.', defeatTime: 'Goal not reached within 30 turns.', mapReal: 'Real map', mapSimple: 'Simplified map (go online, refresh)', lvl: 'Lv', max: 'MAX', income: 'Income this turn',
      upInf: 'Infantry training', upTank: 'Armor tech', upEng: 'Engineers', upAir: 'Air force', upArm: 'Weapons', upPlate: 'Armor plating',
      upInfD: '6×6 sudoku time +20s / level', upTankD: '9×9 sudoku time +45s / level', upEngD: 'Mistakes cost 2s less / level', upAirD: '+1 hint per attack / level', upArmD: 'All units attack +1 / level', upPlateD: 'All units defense +1 / level',
      recruited: 'Recruited', maxUnits: 'Unit limit reached', acted: 'Already acted' },
    ru: { wTitle: 'Завоевание мира', turnOf: 'Ход {n}/{m}', objective: 'Цель: захватить {c} ({a}/{b})', attack: 'Атаковать', endTurn: 'Конец хода', upgrade: 'Улучшения', train: 'Тренировка', recruit: 'Нанять здесь', notEnough: 'Не хватает ресурсов',
      u_inf: 'Пехота', u_tank: 'Бронетехника', u_art: 'Артиллерия', u_air: 'Авиация', hp: 'Сила', mv: 'Ход', rg: 'Дальность', atk: 'Атака', def: 'Защита',
      moveHint: 'Синяя клетка — движение, красная цель — атака', sudokuInfo: 'Решите судоку {n}×{n}, время {t}', dmgEst: 'Урон при победе', mine: 'Моё', enemyCity: 'Город врага', neutralCity: 'Нейтральный город', myCity: 'Мой город', mountain: 'Горы (защита +2)', plain: 'Равнина', terrainCity: 'Крепость (защита +2)',
      captured: 'Захвачен {c}!', destroyed: 'Враг уничтожен!', dealt: 'Нанесено урона: {d}', counter: 'Контратака: -{d}', timeUp: 'Время вышло! Атака провалена', fast: 'Бонус за скорость', ok: 'Дальше', home: 'Домой', back: 'Назад',
      hint: 'Подсказка', erase: 'Стереть', notes: 'Заметки', mistakes: 'Ошибки', mistakePen: 'Ошибка -{n} с', retreat: 'Отступить? Эта атака будет отменена.', trainDone: 'Тренировка завершена', menu: 'Меню', cancel: 'Отмена',
      restartWar: 'Начать кампанию заново', confirmReset: 'Начать заново? Прогресс будет удалён.', enemyPhase: 'Ход врага', evHit: 'Враг атаковал: ударов по нам — {n}', evLost: 'Потерян {c}!', evKilled: 'Потеряно частей: {n}', evSpawn: 'Подкрепление врага: {n}', evNone: 'Враг не двигался', turnEnd: 'Ход завершён',
      victory: 'Победа!', victoryD: 'Вы удержали Астану и вернули все города.', defeat: 'Поражение', defeatCap: 'Столица Астана пала.', defeatTime: 'Цель не выполнена за 30 ходов.', mapReal: 'Реальная карта', mapSimple: 'Упрощённая карта (подключитесь и обновите)', lvl: 'Ур.', max: 'МАКС', income: 'Доход за ход',
      upInf: 'Подготовка пехоты', upTank: 'Бронетехнологии', upEng: 'Инженеры', upAir: 'Авиация', upArm: 'Оружие', upPlate: 'Броня',
      upInfD: 'Время судоку 6×6 +20 с / ур.', upTankD: 'Время судоку 9×9 +45 с / ур.', upEngD: 'Ошибка стоит на 2 с меньше / ур.', upAirD: '+1 подсказка за атаку / ур.', upArmD: 'Атака всех частей +1 / ур.', upPlateD: 'Защита всех частей +1 / ур.',
      recruited: 'Нанято', maxUnits: 'Достигнут лимит частей', acted: 'Уже действовал' },
    kk: { wTitle: 'Әлемді жаулау', turnOf: '{n}/{m}-жүріс', objective: 'Мақсат: {c} алу ({a}/{b})', attack: 'Шабуыл', endTurn: 'Жүрісті аяқтау', upgrade: 'Жақсарту', train: 'Жаттығу', recruit: 'Осында жалдау', notEnough: 'Ресурс жеткіліксіз',
      u_inf: 'Жаяу әскер', u_tank: 'Сауытты техника', u_art: 'Артиллерия', u_air: 'Әуе күштері', hp: 'Күш', mv: 'Жүріс', rg: 'Қашықтық', atk: 'Шабуыл', def: 'Қорғаныс',
      moveHint: 'Көк ұяшық — жүру, қызыл нысана — шабуыл', sudokuInfo: '{n}×{n} судоку шешіңіз, уақыт {t}', dmgEst: 'Жеңгендегі зақым', mine: 'Менікі', enemyCity: 'Жау қаласы', neutralCity: 'Бейтарап қала', myCity: 'Менің қалам', mountain: 'Тау (қорғаныс +2)', plain: 'Жазық', terrainCity: 'Бекініс (қорғаныс +2)',
      captured: '{c} алынды!', destroyed: 'Жау жойылды!', dealt: '{d} зақым келтірілді', counter: 'Қарсы соққы: -{d}', timeUp: 'Уақыт бітті! Шабуыл сәтсіз', fast: 'Жылдамдық бонусы', ok: 'Жалғастыру', home: 'Басты бет', back: 'Артқа',
      hint: 'Кеңес', erase: 'Өшіру', notes: 'Жазба', mistakes: 'Қате', mistakePen: 'Қате -{n} сек', retreat: 'Шегінесіз бе? Бұл шабуыл жойылады.', trainDone: 'Жаттығу аяқталды', menu: 'Мәзір', cancel: 'Бас тарту',
      restartWar: 'Жорықты қайта бастау', confirmReset: 'Қайта бастайсыз ба? Барлық прогресс өшеді.', enemyPhase: 'Жау жүрісі', evHit: 'Жау шабуылдады: бізге {n} соққы', evLost: '{c} жоғалды!', evKilled: '{n} бөлімше жоғалды', evSpawn: 'Жауға қосымша күш: {n}', evNone: 'Жау орнында қалды', turnEnd: 'Жүріс аяқталды',
      victory: 'Жеңіс!', victoryD: 'Сіз Астананы сақтап, барлық қаланы қайтардыңыз.', defeat: 'Жеңіліс', defeatCap: 'Астана қаласы жау қолына өтті.', defeatTime: '30 жүріс ішінде мақсат орындалмады.', mapReal: 'Нақты карта', mapSimple: 'Жеңілдетілген карта (интернетке қосылып жаңартыңыз)', lvl: 'Дең.', max: 'МАКС', income: 'Осы жүрістегі табыс',
      upInf: 'Жаяу әскер даярлығы', upTank: 'Сауыт технологиясы', upEng: 'Инженерлер', upAir: 'Әуе күштері', upArm: 'Қару', upPlate: 'Сауыт',
      upInfD: '6×6 судоку уақыты +20 сек / дең.', upTankD: '9×9 судоку уақыты +45 сек / дең.', upEngD: 'Қателік 2 сек аз алады / дең.', upAirD: 'Әр шабуылға +1 кеңес / дең.', upArmD: 'Барлық бөлімше шабуылы +1 / дең.', upPlateD: 'Барлық бөлімше қорғанысы +1 / дең.',
      recruited: 'Жалданды', maxUnits: 'Бөлімше шегіне жетті', acted: 'Бүгін әрекет жасады' }
  };
  Object.keys(S).forEach(function (l) { if (I.T[l]) Object.assign(I.T[l], S[l]); });
  function t(k, v) { var s = I.t(k); if (v) for (var x in v) s = s.replace('{' + x + '}', v[x]); return s; }
  var LI = { en: 2, ru: 3, zh: 4, kk: 5 };
  function cityName(i) { return W.CITIES[i][LI[I.get()] || 2]; }

  function main() {
    var MAXTURN = 30, MAPV = 5;
    var byId = W.byId;
    function cid(name) { for (var i = 0; i < W.CITIES.length; i++) if (W.CITIES[i][2] === name) return i; return -1; }
    function cityHex(name) { var i = cid(name); for (var n = 0; n < W.hexes.length; n++) if (W.hexes[n].city === i) return W.hexes[n]; return null; }
    var PLAYER_CITIES = ['Astana', 'Karaganda', 'Aktobe', 'Atyrau'], ENEMY_CITIES = ['Almaty', 'Tashkent', 'Shymkent'];

    /* ---------- unit rules ---------- */
    var UT = {
      inf: { mv: 1, rg: 1, atk: 4, def: 3, g: 30, s: 0 },
      tank: { mv: 2, rg: 1, atk: 6, def: 4, g: 60, s: 3 },
      art: { mv: 1, rg: 2, atk: 6, def: 1, g: 50, s: 2 },
      air: { mv: 3, rg: 1, atk: 5, def: 2, g: 80, s: 4 }
    };
    var UP = { inf: ['g', [40, 90, 160, 260, 400]], tank: ['s', [3, 6, 10, 15, 22]], eng: ['g', [50, 100, 180, 300, 450]], air: ['d', [2, 4, 7]], arm: ['s', [4, 8, 14, 22]], plate: ['s', [4, 8, 14, 22]] };
    var UPN = { inf: 'upInf', tank: 'upTank', eng: 'upEng', air: 'upAir', arm: 'upArm', plate: 'upPlate' };
    var UPI = { inf: '🪖', tank: '🛡️', eng: '🔧', air: '✈️', arm: '⚔️', plate: '🧱' };
    var MAXU = 14;

    /* ---------- state ---------- */
    var DEF = { map: MAPV, init: false, turn: 1, g: 80, s: 3, up: { inf: 0, tank: 0, eng: 0, air: 0, arm: 0, plate: 0 }, units: [], city: {}, nid: 1, att: 0, res: '' };
    var saved = LS.get('sdk_war', {}) || {};
    var st = Object.assign({}, JSON.parse(JSON.stringify(DEF)), saved.map === MAPV ? saved : {});
    st.up = Object.assign({}, DEF.up, st.up || {});
    function newUnit(tp, side, hexId) { return { id: st.nid++, t: tp, s: side, h: hexId, hp: 10, moved: false, attacked: false }; }
    function initScenario() {
      st.units = []; st.city = {};
      var P = { Astana: ['inf', 'tank', 'art'], Karaganda: ['inf', 'tank'], Aktobe: ['inf'], Atyrau: ['inf', 'air'] };
      var E = { Almaty: ['inf', 'tank'], Tashkent: ['inf', 'art', 'tank'], Shymkent: ['inf', 'tank', 'air'] };
      function place(list, side) {
        Object.keys(list).forEach(function (cn) {
          var h = cityHex(cn); if (!h) return; st.city[h.id] = side;
          var spots = [h.id].concat(W.neighbors(h.col, h.row).filter(function (id) { return byId[id]; })), k = 0;
          list[cn].forEach(function (tp) { while (k < spots.length && st.units.some(function (u) { return u.h === spots[k]; })) k++; if (k < spots.length) st.units.push(newUnit(tp, side, spots[k])); });
        });
      }
      place(P, 'p'); place(E, 'e'); st.init = true;
    }
    if (!st.init) initScenario();
    function save() { LS.set('sdk_war', st); }
    function gems() { return (LS.get('sdk_stats', {}) || {}).gems || 0; }
    function addGems(n) { var s = LS.get('sdk_stats', {}) || {}; s.gems = Math.max(0, (s.gems || 0) + n); LS.set('sdk_stats', s); }

    function isFort(h) { return h.city >= 0 || h.mount; }
    function unitAt(id) { for (var i = 0; i < st.units.length; i++) if (st.units[i].h === id) return st.units[i]; return null; }
    function unitById(id) { for (var i = 0; i < st.units.length; i++) if (st.units[i].id === id) return st.units[i]; return null; }
    function landNb(h) { return W.neighbors(h.col, h.row).filter(function (id) { return byId[id]; }); }
    function cube(h) { var x = h.col - (h.row - (h.row & 1)) / 2; return [x, -x - h.row, h.row]; }
    function dist(a, b) { var p = cube(a), q = cube(b); return Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2])); }
    function atkOf(u) { return UT[u.t].atk + (u.s === 'p' ? st.up.arm : 0); }
    function defOf(u) { return UT[u.t].def + (u.s === 'p' ? st.up.plate : 0) + (isFort(byId[u.h]) ? 2 : 0); }
    function timeFor(h) { return isFort(h) ? 600 + 45 * st.up.tank : 240 + 20 * st.up.inf; }
    function penalty() { return Math.max(2, 10 - 2 * st.up.eng); }
    function ownedCities(side) { var n = 0; for (var id in st.city) if (st.city[id] === side) n++; return n; }
    function fmt(s) { s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
    function hexName(h) { return h.city >= 0 ? cityName(h.city) : (h.cn || '') + ' ' + Math.abs(Math.round(h.lat)) + '°' + (h.lat >= 0 ? 'N' : 'S') + ' ' + Math.abs(Math.round(h.lon)) + '°' + (h.lon >= 0 ? 'E' : 'W'); }
    function estDamage(a, tg, fast) {
      var f = Math.max(0.4, a.hp / 10), d = Math.round(atkOf(a) * f - defOf(tg) * 0.35) + (fast ? 2 : 0);
      return Math.max(2, Math.min(10, d));
    }

    /* movement / targeting */
    function reach(u) {
      var out = {}, front = [byId[u.h]], seen = {}; seen[u.h] = 1;
      for (var step = 0; step < UT[u.t].mv; step++) {
        var nxt = [];
        front.forEach(function (h) { landNb(h).forEach(function (id) { if (seen[id]) return; seen[id] = 1; if (unitAt(id)) return; out[id] = 1; nxt.push(byId[id]); }); });
        front = nxt;
      }
      return out;
    }
    function targets(u) {
      var out = {}, rg = UT[u.t].rg, hu = byId[u.h];
      st.units.forEach(function (e) { if (e.s !== u.s) { var d = dist(hu, byId[e.h]); if (d >= 1 && d <= rg) out[e.id] = 1; } });
      return out;
    }

    /* ---------- map view ---------- */
    var cv = $('#map'), ctx = cv.getContext('2d');
    var SZ = 22, HW = Math.sqrt(3) * SZ, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var view = { x: 0, y: 0, k: 1 }, vw = 0, vh = 0, selU = 0, selT = 0, selH = null, moveSet = {}, atkSet = {};
    var worldW = W.COLS * HW, worldH = W.ROWS * 1.5 * SZ + SZ * 2;
    function center(h) { return [(h.col + 0.5 * (h.row & 1) + 0.5) * HW, h.row * 1.5 * SZ + SZ]; }
    var CORN = []; for (var ci = 0; ci < 6; ci++) { var an = Math.PI / 3 * ci - Math.PI / 6; CORN.push([Math.cos(an) * (SZ - 0.8), Math.sin(an) * (SZ - 0.8)]); }
    function resize() { var r = $('#mapwrap').getBoundingClientRect(); vw = r.width; vh = r.height; cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr); clamp(); draw(); }
    function clamp() {
      var minK = Math.max(vw / worldW, vh / worldH) * 0.9; if (view.k < minK) view.k = minK; if (view.k > 2.6) view.k = 2.6;
      var ww = worldW * view.k, wh = worldH * view.k;
      view.x = ww <= vw ? (vw - ww) / 2 : Math.min(40, Math.max(vw - ww - 40, view.x));
      view.y = wh <= vh ? (vh - wh) / 2 : Math.min(40, Math.max(vh - wh - 40, view.y));
    }
    function focus(h, k) { var c = center(h); view.k = k || view.k; view.x = vw / 2 - c[0] * view.k; view.y = vh / 2 - c[1] * view.k; clamp(); draw(); }
    function hexPath(cx, cy) { ctx.beginPath(); for (var i = 0; i < 6; i++) { var x = cx + CORN[i][0], y = cy + CORN[i][1]; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); }
    function lonX(lon) { return (lon + 180) / W.DLON * HW; }
    function latY(lat) { return (W.LAT0 - lat) / W.DLAT * 1.5 * SZ + SZ; }
    var LC = {}, PAL = ['#6f9361', '#8c9c5c', '#a89b63', '#7b9b90', '#a08a68', '#6f8fae', '#9d8294', '#86a06e', '#b09a72', '#75a3a0'];
    function landColor(name) { if (LC[name]) return LC[name]; var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return (LC[name] = PAL[h % PAL.length]); }
    var bg = null, bgOk = false;
    (function () {
      var urls = ['https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=BlueMarble_ShadedRelief_Bathymetry&STYLES=&SRS=EPSG:4326&BBOX=-180,-62,180,84&WIDTH=2880&HEIGHT=1168&FORMAT=image/jpeg',
        'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=BlueMarble_NextGeneration&STYLES=&SRS=EPSG:4326&BBOX=-180,-62,180,84&WIDTH=2880&HEIGHT=1168&FORMAT=image/jpeg'], k = 0;
      function tryNext() { if (k >= urls.length) return; var im = new Image(); im.crossOrigin = 'anonymous'; im.onload = function () { bg = im; bgOk = true; refresh(); }; im.onerror = tryNext; im.src = urls[k++]; }
      tryNext();
    })();
    var labelsCache = null;
    function countryLabels() {
      if (labelsCache) return labelsCache; var best = {};
      (W.polys || []).forEach(function (p) { if (!p.name) return; var a = (p.x1 - p.x0) * (p.y1 - p.y0); if (!best[p.name] || a > best[p.name].a) best[p.name] = { a: a, p: p }; });
      labelsCache = Object.keys(best).map(function (n) { var p = best[n].p; return { n: n, x: lonX((p.x0 + p.x1) / 2), y: latY((p.y0 + p.y1) / 2), w: (p.x1 - p.x0) / W.DLON * HW }; });
      return labelsCache;
    }
    function drawLand(x0, x1, y0, y1) {
      var polys = W.polys || [];
      if (bgOk) { ctx.fillStyle = '#0d2a44'; ctx.fillRect(0, 0, worldW, worldH); ctx.drawImage(bg, lonX(-180), latY(84), lonX(180) - lonX(-180), latY(-62) - latY(84)); }
      for (var i = 0; i < polys.length; i++) {
        var p = polys[i];
        if (lonX(p.x1) < x0 || lonX(p.x0) > x1 || latY(p.y0) < y0 || latY(p.y1) > y1) continue;
        ctx.beginPath();
        for (var r = 0; r < p.rings.length; r++) { var ring = p.rings[r]; for (var k = 0; k < ring.length; k++) { var x = lonX(ring[k][0]), y = latY(ring[k][1]); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); }
        if (!bgOk) { ctx.fillStyle = landColor(p.name || 'x'); ctx.fill('evenodd'); } ctx.lineWidth = 1; ctx.strokeStyle = bgOk ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.55)'; ctx.stroke();
      }
    }
    function drawCountryNames() {
      if (!W.real) return;
      ctx.font = '600 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = bgOk ? 'rgba(255,255,255,.75)' : 'rgba(20,30,20,.5)';
      countryLabels().forEach(function (l) { if (l.w * view.k > 80) ctx.fillText(l.n.toUpperCase(), l.x, l.y); });
    }
    function drawUnit(u, c, selected) {
      var col = u.s === 'p' ? '#2f7fd8' : '#d9473f', r = SZ * 0.64, x = c[0], y = c[1] - 2;
      ctx.save(); if (u.s === 'p' && u.attacked) ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.lineWidth = selected ? 3 : 1.6; ctx.strokeStyle = selected ? '#ffe066' : '#fff'; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff';
      if (u.t === 'inf') { ctx.beginPath(); ctx.arc(x, y - r * 0.38, r * 0.22, 0, 7); ctx.fill(); ctx.fillRect(x - r * 0.3, y - r * 0.1, r * 0.6, r * 0.62); }
      else if (u.t === 'tank') { ctx.fillRect(x - r * 0.55, y - r * 0.05, r * 1.1, r * 0.38); ctx.fillRect(x - r * 0.28, y - r * 0.35, r * 0.56, r * 0.32); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - r * 0.2); ctx.lineTo(x + r * 0.75, y - r * 0.38); ctx.stroke(); }
      else if (u.t === 'art') { ctx.beginPath(); ctx.arc(x - r * 0.12, y + r * 0.28, r * 0.22, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - r * 0.3, y + r * 0.2); ctx.lineTo(x + r * 0.6, y - r * 0.42); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(x, y - r * 0.6); ctx.lineTo(x + r * 0.2, y - r * 0.1); ctx.lineTo(x + r * 0.62, y + r * 0.15); ctx.lineTo(x + r * 0.2, y + r * 0.1); ctx.lineTo(x + r * 0.12, y + r * 0.5); ctx.lineTo(x, y + r * 0.38); ctx.lineTo(x - r * 0.12, y + r * 0.5); ctx.lineTo(x - r * 0.2, y + r * 0.1); ctx.lineTo(x - r * 0.62, y + r * 0.15); ctx.lineTo(x - r * 0.2, y - r * 0.1); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      var bw = r * 1.6, by = y + r + 2; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - bw / 2, by, bw, 4);
      ctx.fillStyle = u.hp > 6 ? '#59d46b' : u.hp > 3 ? '#f2c14e' : '#ee5a50'; ctx.fillRect(x - bw / 2, by, bw * u.hp / 10, 4);
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, vw, vh);
      ctx.save(); ctx.translate(view.x, view.y); ctx.scale(view.k, view.k);
      var x0 = -view.x / view.k - SZ * 2, x1 = (vw - view.x) / view.k + SZ * 2, y0 = -view.y / view.k - SZ * 2, y1 = (vh - view.y) / view.k + SZ * 2;
      drawLand(x0, x1, y0, y1); drawCountryNames();
      var labels = [], vis = [];
      for (var n = 0; n < W.hexes.length; n++) {
        var h = W.hexes[n], c = center(h);
        if (c[0] < x0 || c[0] > x1 || c[1] < y0 || c[1] > y1) continue;
        vis.push([h, c]);
        hexPath(c[0], c[1]);
        var fs = '';
        if (moveSet[h.id]) fs = 'rgba(70,150,255,.5)'; else if (h.mount) fs = bgOk ? '' : 'rgba(150,100,50,.4)';
        if (fs) { ctx.fillStyle = fs; ctx.fill(); }
        ctx.lineWidth = moveSet[h.id] ? 1.6 : 0.6; ctx.strokeStyle = moveSet[h.id] ? '#8fc4ff' : bgOk ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.22)'; ctx.stroke();
        if (selH && selH.id === h.id) { hexPath(c[0], c[1]); ctx.lineWidth = 2.6; ctx.strokeStyle = '#fff'; ctx.stroke(); }
        if (h.mount) { ctx.fillStyle = 'rgba(245,225,170,.9)'; ctx.font = (SZ * 0.8) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('▲', c[0], c[1] + 1); }
        if (h.city >= 0) {
          var ow = st.city[h.id];
          ctx.fillStyle = ow === 'p' ? '#6fb6ff' : ow === 'e' ? '#ff6b61' : '#f2d27a'; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 2;
          ctx.font = (SZ * 1.15) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('★', c[0], c[1] + 1); ctx.fillText('★', c[0], c[1] + 1);
          if (view.k >= 0.8) labels.push([cityName(h.city), c[0], c[1] + SZ * 0.95]);
        }
      }
      ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.fillStyle = '#fff';
      labels.forEach(function (l) { ctx.strokeText(l[0], l[1], l[2]); ctx.fillText(l[0], l[1], l[2]); });
      // attack targets
      st.units.forEach(function (u) { if (atkSet[u.id]) { var c = center(byId[u.h]); hexPath(c[0], c[1]); ctx.lineWidth = 3; ctx.strokeStyle = '#ff4d42'; ctx.stroke(); } });
      st.units.forEach(function (u) { var h = byId[u.h], c = center(h); if (c[0] < x0 || c[0] > x1 || c[1] < y0 || c[1] > y1) return; drawUnit(u, c, u.id === selU || u.id === selT); });
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

    /* ---------- selection & panel ---------- */
    function clearSel() { selU = 0; selT = 0; selH = null; moveSet = {}; atkSet = {}; renderPanel(); draw(); }
    function selectUnit(u) {
      selU = u.id; selT = 0; selH = byId[u.h];
      moveSet = (!u.moved && !st.res) ? reach(u) : {}; atkSet = (!u.attacked && !st.res) ? targets(u) : {};
      renderPanel(); draw();
    }
    function tap(x, y) {
      if (st.res) return;
      var h = hexAt(x, y); if (!h) { clearSel(); return; }
      var u = unitAt(h.id), su = selU ? unitById(selU) : null;
      if (su && su.s === 'p') {
        if (moveSet[h.id] && !u) { moveUnit(su, h); return; }
        if (u && u.s === 'e' && atkSet[u.id]) { selT = u.id; selH = h; renderPanel(); draw(); return; }
      }
      if (u && u.s === 'p') { selectUnit(u); return; }
      selU = 0; moveSet = {}; atkSet = {}; selT = u && u.s === 'e' ? u.id : 0; selH = h; renderPanel(); draw();
    }
    function moveUnit(u, h) {
      u.h = h.id; u.moved = true;
      if (h.city >= 0 && st.city[h.id] !== 'p') {
        st.city[h.id] = 'p'; st.g += 50; st.s += 2; addGems(1);
        toast(t('captured', { c: cityName(h.city) }) + ' 🪙+50 ⚙️+2 💎+1');
      }
      save(); selectUnit(u); refresh(); checkEnd();
    }
    function statLine(tp) { var d = UT[tp]; return t('mv') + ' ' + d.mv + ' · ' + t('rg') + ' ' + d.rg + ' · ' + t('atk') + ' ' + d.atk + ' · ' + t('def') + ' ' + d.def; }
    function terrainText(h) { return h.city >= 0 ? t('terrainCity') : h.mount ? t('mountain') : t('plain'); }
    function renderPanel() {
      var p = $('#panel'), body = $('#p-body'), go = $('#p-go');
      if (!selH && !selU) { p.hidden = true; return; }
      body.innerHTML = ''; go.hidden = true; go.disabled = false; p.hidden = false;
      var h = selH, u = selU ? unitById(selU) : null, tg = selT ? unitById(selT) : null;
      if (tg && u) {
        $('#p-title').textContent = t('u_' + tg.t) + ' · ' + t('hp') + ' ' + tg.hp + '/10'; $('#p-type').textContent = terrainText(byId[tg.h]);
        var f = isFort(byId[tg.h]), n = f ? 9 : 6;
        body.appendChild(el('div', '', t('sudokuInfo', { n: n, t: fmt(timeFor(byId[tg.h])) })));
        body.appendChild(el('div', '', t('dmgEst') + ': ~' + estDamage(u, tg, false) + ' – ' + estDamage(u, tg, true)));
        go.hidden = false; go.className = 'btn primary'; go.textContent = '⚔️ ' + t('attack'); go.onclick = function () { startSudoku({ kind: 'attack', u: u.id, tg: tg.id }); };
        return;
      }
      if (u) {
        $('#p-title').textContent = t('u_' + u.t) + ' · ' + t('hp') + ' ' + u.hp + '/10'; $('#p-type').textContent = terrainText(byId[u.h]);
        body.appendChild(el('div', '', statLine(u.t))); body.appendChild(el('div', '', u.attacked ? t('acted') : t('moveHint')));
        return;
      }
      var en = h ? unitAt(h.id) : null;
      $('#p-title').textContent = en ? t('u_' + en.t) + ' · ' + t('hp') + ' ' + en.hp + '/10' : hexName(h);
      $('#p-type').textContent = h.city >= 0 ? (st.city[h.id] === 'p' ? t('myCity') : st.city[h.id] === 'e' ? t('enemyCity') : t('neutralCity')) : terrainText(h);
      if (en) { body.appendChild(el('div', '', statLine(en.t))); return; }
      if (h.city >= 0 && st.city[h.id] === 'p') {
        body.appendChild(el('div', '', t('recruit')));
        var row = el('div', 'rbtns');
        ['inf', 'tank', 'art', 'air'].forEach(function (tp) {
          var d = UT[tp], b = el('button', 'btn small', t('u_' + tp) + ' 🪙' + d.g + (d.s ? ' ⚙️' + d.s : '')); b.type = 'button';
          b.disabled = st.g < d.g || st.s < d.s; b.onclick = function () { recruit(tp, h); }; row.appendChild(b);
        });
        body.appendChild(row);
      } else body.appendChild(el('div', '', hexName(h)));
    }
    function recruit(tp, h) {
      var d = UT[tp];
      if (unitAt(h.id)) return;
      if (st.units.filter(function (x) { return x.s === 'p'; }).length >= MAXU) { toast(t('maxUnits')); return; }
      if (st.g < d.g || st.s < d.s) { toast(t('notEnough')); return; }
      st.g -= d.g; st.s -= d.s; var nu = newUnit(tp, 'p', h.id); nu.moved = true; nu.attacked = true; st.units.push(nu);
      save(); refresh(); toast(t('recruited') + ': ' + t('u_' + tp)); selectUnit(nu);
    }

    /* ---------- HUD ---------- */
    function enemyCityNames() { return ENEMY_CITIES.map(function (n) { return cityName(cid(n)); }).join(', '); }
    function refresh() {
      $('#w-turn').textContent = t('turnOf', { n: Math.min(st.turn, MAXTURN), m: MAXTURN });
      $('#r-g').textContent = st.g; $('#r-s').textContent = st.s; $('#r-d').textContent = gems();
      var cap = 0; ENEMY_CITIES.forEach(function (n) { var h = cityHex(n); if (h && st.city[h.id] === 'p') cap++; });
      $('#w-hint').textContent = t('objective', { c: enemyCityNames(), a: cap, b: ENEMY_CITIES.length });
      $('#b-up-t').textContent = t('upgrade'); $('#b-train-t').textContent = t('train'); $('#b-end-t').textContent = t('endTurn');
      $('#t-erase-t').textContent = t('erase'); $('#t-notes-t').textContent = t('notes');
      $('#w-map').textContent = W.real ? '🌍 ' + t('mapReal') : '⚠ ' + t('mapSimple'); $('#w-map').className = 'mapnote' + (W.real ? '' : ' warn');
      document.title = t('wTitle'); draw();
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
    var toastT; function toast(m) { var e = $('#toast'); e.textContent = m; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('show'); }, 2200); }

    /* ---------- upgrades ---------- */
    function openUpgrades() {
      var body = [];
      ['arm', 'plate', 'inf', 'tank', 'eng', 'air'].forEach(function (k) {
        var lv = st.up[k], arr = UP[k][1], res = UP[k][0], maxed = lv >= arr.length, cost = maxed ? 0 : arr[lv];
        var have = res === 'g' ? st.g : res === 's' ? st.s : gems(), sym = res === 'g' ? '🪙' : res === 's' ? '⚙️' : '💎';
        var row = el('div', 'unit'); row.appendChild(el('div', 'ui', UPI[k]));
        var mid = el('div'); mid.appendChild(el('b', '', t(UPN[k]) + ' · ' + t('lvl') + ' ' + lv)); mid.appendChild(el('small', '', t(UPN[k] + 'D')));
        var bars = el('div', 'lv'); for (var i = 0; i < arr.length; i++) bars.appendChild(el('i', i < lv ? 'on' : '')); mid.appendChild(bars); row.appendChild(mid);
        var bt = el('button', 'btn' + (maxed ? '' : ' green'), maxed ? t('max') : sym + ' ' + cost); bt.type = 'button'; bt.disabled = maxed || have < cost;
        bt.onclick = function () { if (res === 'g') st.g -= cost; else if (res === 's') st.s -= cost; else addGems(-cost); st.up[k]++; save(); refresh(); openUpgrades(); };
        row.appendChild(bt); body.push(row);
      });
      showModal(t('upgrade'), body, [{ label: t('ok') }]);
    }

    /* ---------- sudoku combat ---------- */
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
      var n, diff, seed, limit = null, title;
      if (o.kind === 'train') { n = 4; diff = 'easy'; seed = 'train|' + Date.now(); title = '🎯 ' + t('train') + ' 4×4'; }
      else { var tg = unitById(o.tg), th = byId[tg.h], f = isFort(th); n = f ? 9 : 6; diff = f ? 'hard' : 'medium'; seed = 'war|' + tg.id + '|' + st.att; limit = timeFor(th); title = '⚔️ ' + t('u_' + unitById(o.u).t) + ' → ' + t('u_' + tg.t) + ' · ' + n + '×' + n; }
      var gen = C.generate(seed, diff);
      G = { o: o, n: n, geo: C.geom(n), puz: gen.puzzle.split('').map(Number), sol: gen.solution.split('').map(Number), notes: [], sel: null, notesMode: false, mist: 0, hints: o.kind === 'train' ? 1 : st.up.air, limit: limit, deadline: limit ? Date.now() + limit * 1000 : null, over: false };
      G.cur = G.puz.slice(); G.notes = new Array(n * n).fill(0);
      for (var i = 0; i < n * n; i++) if (!G.puz[i]) { G.sel = i; break; }
      buildBoard(n); $('#screen-sd').hidden = false; $('#panel').hidden = true;
      $('#sd-title').textContent = title; $('#sd-info').textContent = o.kind === 'train' ? '' : t('mistakePen', { n: penalty() });
      $('#sd-time').hidden = !limit; $('#sd-time').classList.remove('low');
      renderSd(); clearInterval(timer); timer = setInterval(tickSd, 200); tickSd();
    }
    function remaining() { return G.deadline ? (G.deadline - Date.now()) / 1000 : Infinity; }
    function tickSd() {
      if (!G || G.over) return; var r = remaining();
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
      $('#sd-mist').textContent = t('mistakes') + ': ' + g.mist; $('#t-notes').classList.toggle('on', g.notesMode);
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
    function gainRow(parts) { var d = el('div', 'gainrow'); parts.forEach(function (x) { d.appendChild(el('span', '', x)); }); return d; }

    function winAttack() {
      var o = G.o, left = remaining(), frac = G.limit ? left / G.limit : 0; endSd();
      if (o.kind === 'train') { st.g += 12; save(); refresh(); showModal(t('trainDone'), [gainRow(['🪙+12'])], [{ label: t('ok') }]); return; }
      var a = unitById(o.u), tg = unitById(o.tg); if (!a || !tg) { clearSel(); return; }
      var fast = frac >= 0.5, d = estDamage(a, tg, fast), killed;
      tg.hp -= d; killed = tg.hp <= 0; st.att++;
      var parts = [t('dealt', { d: d })];
      if (killed) { st.units = st.units.filter(function (x) { return x.id !== tg.id; }); st.g += 15; st.s += 1; parts.push(t('destroyed')); }
      a.attacked = true; a.moved = true;
      save(); clearSel(); refresh();
      var rew = killed ? ['🪙+15', '⚙️+1'] : [];
      var body = [el('div', 'big', killed ? '💥' : '🎯'), parts.join(' · ')]; if (rew.length) body.push(gainRow(rew)); if (fast) body.push('⚡ ' + t('fast'));
      showModal(killed ? t('destroyed') : t('dealt', { d: d }), body, [{ label: t('ok'), cls: 'green', fn: checkEnd }]);
    }
    function failAttack() {
      var o = G.o; endSd();
      var a = unitById(o.u), tg = unitById(o.tg); if (!a || !tg) { clearSel(); return; }
      var ranged = dist(byId[a.h], byId[tg.h]) > 1, cd = ranged ? 0 : Math.max(1, Math.round(defOf(tg) * 0.5));
      a.hp -= cd; a.attacked = true; a.moved = true; st.att++;
      if (a.hp <= 0) st.units = st.units.filter(function (x) { return x.id !== a.id; });
      save(); clearSel(); refresh();
      showModal(t('timeUp'), [el('div', 'big', '⏳'), cd ? t('counter', { d: cd }) : ''].filter(Boolean), [{ label: t('ok'), fn: checkEnd }]);
    }

    /* ---------- enemy turn ---------- */
    function enemyTurn(ev) {
      var goals = {}, frontier = [];
      st.units.forEach(function (u) { if (u.s === 'p') goals[u.h] = 1; });
      Object.keys(st.city).forEach(function (id) { if (st.city[id] === 'p') goals[id] = 1; });
      var dmap = {}; Object.keys(goals).forEach(function (id) { dmap[id] = 0; frontier.push(byId[id]); });
      while (frontier.length) { var nx = []; frontier.forEach(function (h) { landNb(h).forEach(function (id) { if (dmap[id] === undefined) { dmap[id] = dmap[h.id] + 1; nx.push(byId[id]); } }); }); frontier = nx; }
      st.units.filter(function (u) { return u.s === 'e'; }).forEach(function (e) {
        if (e.hp <= 0) return;
        function tryAttack() {
          var best = null, hh = byId[e.h];
          st.units.forEach(function (p) { if (p.s === 'p' && p.hp > 0) { var d = dist(hh, byId[p.h]); if (d >= 1 && d <= UT[e.t].rg && (!best || p.hp < best.hp)) best = p; } });
          if (!best) return false;
          var d = Math.max(1, Math.round(atkOf(e) * (e.hp / 10) - defOf(best) * 0.35)); best.hp -= d; ev.hit++;
          var ranged = dist(hh, byId[best.h]) > 1;
          if (best.hp > 0 && !ranged) { var cb = Math.max(1, Math.round(atkOf(best) * (best.hp / 10) * 0.5 - defOf(e) * 0.2)); e.hp -= cb; }
          return true;
        }
        if (!tryAttack()) {
          for (var s = 0; s < UT[e.t].mv; s++) {
            var cur = byId[e.h], bestId = null, bd = dmap[e.h] === undefined ? 1e9 : dmap[e.h];
            landNb(cur).forEach(function (id) { if (unitAt(id)) return; var dv = dmap[id] === undefined ? 1e9 : dmap[id]; if (dv < bd) { bd = dv; bestId = id; } });
            if (bestId === null) break;
            e.h = bestId; var hx = byId[bestId];
            if (hx.city >= 0 && st.city[bestId] !== 'e') { if (st.city[bestId] === 'p') ev.lost.push(cityName(hx.city)); st.city[bestId] = 'e'; }
            if (tryAttack()) break;
          }
        }
      });
      var before = st.units.filter(function (u) { return u.s === 'p'; }).length;
      st.units = st.units.filter(function (u) { return u.hp > 0; });
      ev.killed = before - st.units.filter(function (u) { return u.s === 'p'; }).length;
    }
    function endTurn() {
      if (st.res || (G && !G.over)) return;
      var ev = { hit: 0, lost: [], killed: 0, spawn: 0 };
      clearSel(); if (st.turn >= 2) enemyTurn(ev);
      // enemy reinforcements every 3 turns
      if (st.turn % 3 === 0 && st.units.filter(function (u) { return u.s === 'e'; }).length < 10) {
        Object.keys(st.city).forEach(function (id) { if (st.city[id] === 'e' && !unitAt(+id)) { st.units.push(newUnit(st.turn % 2 ? 'inf' : 'tank', 'e', +id)); ev.spawn++; } });
      }
      // player upkeep
      var cities = ownedCities('p'), inc = 10 + 8 * cities, gi = Math.floor(cities / 2);
      st.g += inc; st.s += gi;
      st.units.forEach(function (u) { if (u.s === 'p') { var onCity = byId[u.h].city >= 0 && st.city[u.h] === 'p'; u.hp = Math.min(10, u.hp + (onCity ? 3 : 1)); u.moved = false; u.attacked = false; } else u.hp = Math.min(10, u.hp + 1); });
      st.turn++; save(); refresh();
      var lines = [];
      if (ev.hit) lines.push(t('evHit', { n: ev.hit })); ev.lost.forEach(function (c) { lines.push('🏙️ ' + t('evLost', { c: c })); });
      if (ev.killed) lines.push(t('evKilled', { n: ev.killed })); if (ev.spawn) lines.push(t('evSpawn', { n: ev.spawn })); if (!lines.length) lines.push(t('evNone'));
      lines.push(t('income') + ': 🪙+' + inc + (gi ? ' ⚙️+' + gi : ''));
      showModal(t('turnEnd'), lines, [{ label: t('ok'), fn: checkEnd }]);
    }
    function checkEnd() {
      if (st.res) return;
      var cap = 0; ENEMY_CITIES.forEach(function (n) { var h = cityHex(n); if (h && st.city[h.id] === 'p') cap++; });
      var astana = cityHex('Astana'), res = '', msg = '';
      if (astana && st.city[astana.id] !== 'p') { res = 'lose'; msg = t('defeatCap'); }
      else if (cap >= ENEMY_CITIES.length) { res = 'win'; msg = t('victoryD'); }
      else if (st.turn > MAXTURN) { res = 'lose'; msg = t('defeatTime'); }
      if (!res) return;
      st.res = res; save(); refresh();
      showModal(res === 'win' ? t('victory') : t('defeat'), [el('div', 'big', res === 'win' ? '🏆' : '💀'), msg], [{ label: t('restartWar'), cls: res === 'win' ? 'green' : 'primary', fn: restartWar }, { label: t('home'), fn: function () { location.href = './'; } }]);
    }
    function restartWar() { st = JSON.parse(JSON.stringify(DEF)); initScenario(); save(); clearSel(); refresh(); focusDefault(); }

    /* ---------- wiring ---------- */
    $('#board').addEventListener('click', function (e) { var c = e.target.closest ? e.target.closest('.cell') : null; if (!c || !G || G.over) return; G.sel = +c.getAttribute('data-i'); renderSd(); });
    $('#pad').addEventListener('click', function (e) { var b = e.target.closest ? e.target.closest('.pad-btn') : null; if (b) inputSd(+b.getAttribute('data-n')); });
    $('#t-erase').addEventListener('click', function () { inputSd(0); });
    $('#t-notes').addEventListener('click', function () { if (G && !G.over) { G.notesMode = !G.notesMode; renderSd(); } });
    $('#t-hint').addEventListener('click', hintSd);
    $('#sd-back').addEventListener('click', function () { if (!G || G.over) return; if (confirm(t('retreat'))) endSd(); });
    document.addEventListener('keydown', function (e) {
      if (!G || G.over || $('#screen-sd').hidden) return;
      if (e.key >= '1' && e.key <= String(G.n)) inputSd(+e.key); else if (e.key === '0' || e.key === 'Backspace') inputSd(0); else if (e.key === 'n') { G.notesMode = !G.notesMode; renderSd(); }
    });
    $('#b-up').addEventListener('click', openUpgrades);
    $('#b-train').addEventListener('click', function () { startSudoku({ kind: 'train' }); });
    $('#b-end').addEventListener('click', function () { if (!G || G.over) endTurn(); });
    $('#w-home').addEventListener('click', function () { location.href = './'; });
    $('#w-menu').addEventListener('click', function () {
      showModal(t('menu'), [t('wTitle')], [
        { label: t('restartWar'), fn: function () { if (confirm(t('confirmReset'))) restartWar(); } },
        { label: t('cancel') }]);
    });
    window.addEventListener('resize', resize);
    function focusDefault() { var h = cityHex('Astana'); if (h) focus(h, 1.1); }
    resize(); refresh(); focusDefault(); checkEnd();
    window.WarDebug = { screenOf: function (id) { var c = center(byId[id]); return [c[0] * view.k + view.x, c[1] * view.k + view.y]; }, focus: function (id, k) { focus(byId[id], k); }, st: function () { return st; }, cityHex: cityHex, unitAt: unitAt, endTurn: endTurn, hexes: W.hexes };
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
