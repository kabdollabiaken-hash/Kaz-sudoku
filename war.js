/* World Conquest: region-based wargame on the real world map. Coins/gems are shared with the sudoku game. */
(function () {
  'use strict';
  var W = WorldMap, I = I18N;
  function $(s) { return document.querySelector(s); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  $('#w-hint').textContent = '…';

  var S = {
    zh: { wTitle: '世界征服', turnOf: '第 {n}/{m} 回合', goal: '目标：占领 {a}/{b} 个国家 · 守住 {c}', attack: '进攻', endTurn: '结束回合', upgrade: '升级', recruit: '在此征兵', notEnough: '金币不足',
      u_inf: '步兵', u_tank: '装甲车', u_art: '火炮', u_air: '空军', hp: '兵力', mv: '移动', rg: '射程', atk: '攻击', def: '防御',
      moveHint: '点蓝色区域移动，点红色目标进攻', dmgEst: '预计伤害', counterEst: '预计反击', mine: '我方', neutral: '中立', empty: '无驻军', ownerP: '我方', ownerA: '红色帝国', ownerB: '金色联盟', ownerC: '紫色同盟', ownerN: '中立',
      captured: '占领 {c}！', destroyed: '击毁敌军！', dealt: '造成 {d} 点伤害', counter: '反击受创 {d}', ok: '继续', home: '回首页', cancel: '取消', menu: '菜单',
      restartWar: '重新开始战役', confirmReset: '确定重新开始？进度将清空。', turnEnd: '回合结束', evLost: '失去 {c}！', evKilled: '我方损失 {n} 支部队', evHit: '敌军进攻 {n} 次', evNone: '敌军按兵不动', income: '本回合收入',
      victory: '胜利！', victoryD: '你占领了足够多的国家。', defeat: '失败', defeatCap: '首都哈萨克斯坦失守。', defeatTime: '回合用完，目标未完成。', lvl: '等级', max: '已满级', recruited: '已征召', maxUnits: '部队数量已达上限', acted: '本回合已行动',
      upArm: '武器', upPlate: '护甲', upEcon: '经济', upArmD: '全军攻击 +1 / 级', upPlateD: '全军防御 +1 / 级', upEconD: '每回合收入 +20% / 级', region: '区域', needMap: '需要联网加载世界地图，请联网后刷新。', sudokuTip: '金币不够？回首页玩数独赚金币和钻石', tip: '提示' },
    en: { wTitle: 'World Conquest', turnOf: 'Turn {n}/{m}', goal: 'Goal: hold {a}/{b} countries · defend {c}', attack: 'Attack', endTurn: 'End turn', upgrade: 'Upgrade', recruit: 'Recruit here', notEnough: 'Not enough coins',
      u_inf: 'Infantry', u_tank: 'Armor', u_art: 'Artillery', u_air: 'Air force', hp: 'Strength', mv: 'Move', rg: 'Range', atk: 'Attack', def: 'Defense',
      moveHint: 'Tap a blue region to move, a red target to attack', dmgEst: 'Est. damage', counterEst: 'Est. counter', mine: 'Mine', neutral: 'Neutral', empty: 'No garrison', ownerP: 'You', ownerA: 'Red Empire', ownerB: 'Gold League', ownerC: 'Violet Pact', ownerN: 'Neutral',
      captured: 'Captured {c}!', destroyed: 'Enemy destroyed!', dealt: '{d} damage dealt', counter: 'Counter-attack: -{d}', ok: 'Continue', home: 'Home', cancel: 'Cancel', menu: 'Menu',
      restartWar: 'Restart campaign', confirmReset: 'Restart? All progress will be erased.', turnEnd: 'Turn over', evLost: 'Lost {c}!', evKilled: 'We lost {n} units', evHit: 'Enemy attacks: {n}', evNone: 'The enemy held position', income: 'Income this turn',
      victory: 'Victory!', victoryD: 'You hold enough countries.', defeat: 'Defeat', defeatCap: 'Your capital Kazakhstan has fallen.', defeatTime: 'Out of turns, goal not reached.', lvl: 'Lv', max: 'MAX', recruited: 'Recruited', maxUnits: 'Unit limit reached', acted: 'Already acted',
      upArm: 'Weapons', upPlate: 'Armor plating', upEcon: 'Economy', upArmD: 'All units attack +1 / level', upPlateD: 'All units defense +1 / level', upEconD: 'Income +20% per turn / level', region: 'Region', needMap: 'World map needs internet. Go online and refresh.', sudokuTip: 'Short on coins? Play sudoku on the home page', tip: 'Tip' },
    ru: { wTitle: 'Завоевание мира', turnOf: 'Ход {n}/{m}', goal: 'Цель: держать {a}/{b} стран · защитить {c}', attack: 'Атаковать', endTurn: 'Конец хода', upgrade: 'Улучшения', recruit: 'Нанять здесь', notEnough: 'Не хватает монет',
      u_inf: 'Пехота', u_tank: 'Бронетехника', u_art: 'Артиллерия', u_air: 'Авиация', hp: 'Сила', mv: 'Ход', rg: 'Дальность', atk: 'Атака', def: 'Защита',
      moveHint: 'Синий регион — движение, красная цель — атака', dmgEst: 'Ожид. урон', counterEst: 'Ожид. контрудар', mine: 'Моё', neutral: 'Нейтрал', empty: 'Нет гарнизона', ownerP: 'Вы', ownerA: 'Красная империя', ownerB: 'Золотая лига', ownerC: 'Фиолетовый пакт', ownerN: 'Нейтрал',
      captured: 'Захвачен {c}!', destroyed: 'Враг уничтожен!', dealt: 'Нанесено урона: {d}', counter: 'Контратака: -{d}', ok: 'Дальше', home: 'Домой', cancel: 'Отмена', menu: 'Меню',
      restartWar: 'Начать заново', confirmReset: 'Начать заново? Прогресс будет удалён.', turnEnd: 'Ход завершён', evLost: 'Потерян {c}!', evKilled: 'Потеряно частей: {n}', evHit: 'Атак врага: {n}', evNone: 'Враг не двигался', income: 'Доход за ход',
      victory: 'Победа!', victoryD: 'Вы держите достаточно стран.', defeat: 'Поражение', defeatCap: 'Столица Казахстан пала.', defeatTime: 'Ходы закончились.', lvl: 'Ур.', max: 'МАКС', recruited: 'Нанято', maxUnits: 'Лимит частей', acted: 'Уже действовал',
      upArm: 'Оружие', upPlate: 'Броня', upEcon: 'Экономика', upArmD: 'Атака всех +1 / ур.', upPlateD: 'Защита всех +1 / ур.', upEconD: 'Доход +20% / ур.', region: 'Регион', needMap: 'Нужен интернет для карты. Обновите страницу.', sudokuTip: 'Не хватает монет? Играйте в судоку', tip: 'Совет' },
    kk: { wTitle: 'Әлемді жаулау', turnOf: '{n}/{m}-жүріс', goal: 'Мақсат: {a}/{b} ел ұстау · {c} қорғау', attack: 'Шабуыл', endTurn: 'Жүрісті аяқтау', upgrade: 'Жақсарту', recruit: 'Осында жалдау', notEnough: 'Теңге жеткіліксіз',
      u_inf: 'Жаяу әскер', u_tank: 'Сауытты техника', u_art: 'Артиллерия', u_air: 'Әуе күштері', hp: 'Күш', mv: 'Жүріс', rg: 'Қашықтық', atk: 'Шабуыл', def: 'Қорғаныс',
      moveHint: 'Көк аймақ — жүру, қызыл нысана — шабуыл', dmgEst: 'Болжам зақым', counterEst: 'Болжам қарсы соққы', mine: 'Менікі', neutral: 'Бейтарап', empty: 'Гарнизон жоқ', ownerP: 'Сіз', ownerA: 'Қызыл империя', ownerB: 'Алтын одақ', ownerC: 'Күлгін келісім', ownerN: 'Бейтарап',
      captured: '{c} алынды!', destroyed: 'Жау жойылды!', dealt: '{d} зақым келтірілді', counter: 'Қарсы соққы: -{d}', ok: 'Жалғастыру', home: 'Басты бет', cancel: 'Бас тарту', menu: 'Мәзір',
      restartWar: 'Қайта бастау', confirmReset: 'Қайта бастайсыз ба? Прогресс өшеді.', turnEnd: 'Жүріс аяқталды', evLost: '{c} жоғалды!', evKilled: '{n} бөлімше жоғалды', evHit: 'Жау шабуылы: {n}', evNone: 'Жау орнында қалды', income: 'Осы жүрістегі табыс',
      victory: 'Жеңіс!', victoryD: 'Сіз жеткілікті ел ұстадыңыз.', defeat: 'Жеңіліс', defeatCap: 'Астана — Қазақстан қолдан кетті.', defeatTime: 'Жүріс бітті.', lvl: 'Дең.', max: 'МАКС', recruited: 'Жалданды', maxUnits: 'Бөлімше шегі', acted: 'Әрекет жасады',
      upArm: 'Қару', upPlate: 'Сауыт', upEcon: 'Экономика', upArmD: 'Барлығына шабуыл +1 / дең.', upPlateD: 'Барлығына қорғаныс +1 / дең.', upEconD: 'Табыс +20% / дең.', region: 'Аймақ', needMap: 'Карта үшін интернет керек. Жаңартыңыз.', sudokuTip: 'Теңге жетпей ме? Судоку ойнаңыз', tip: 'Кеңес' }
  };
  function t(k, v) { var s = (S[I.get()] || S.en)[k]; if (s === undefined) s = S.en[k]; if (s === undefined) s = k; if (v) for (var x in v) s = s.replace('{' + x + '}', v[x]); return s; }

  W.ready.then(main);

  function main() {
    var MAXTURN = 80, MAPV = 6, MAXU = 30, byId = W.byId, COLS = W.COLS;
    var HOME = 'Kazakhstan', START_ALLIES = ['Uzbekistan', 'Kyrgyzstan', 'Turkmenistan'];
    var OWN = { p: '#5d8fd3', a: '#c4604f', b: '#d3a640', c: '#8e6db8', n: '#cfc4a3' };
    var OWNN = { p: 'ownerP', a: 'ownerA', b: 'ownerB', c: 'ownerC', n: 'ownerN' };
    var UT = {
      inf: { mv: 1, rg: 1, atk: 4, def: 3, c: 40 },
      tank: { mv: 2, rg: 1, atk: 6, def: 4, c: 90 },
      art: { mv: 1, rg: 2, atk: 6, def: 1, c: 70 },
      air: { mv: 3, rg: 2, atk: 5, def: 2, c: 120 }
    };
    var UP = { arm: [150, 350, 700, 'g5'], plate: [150, 350, 700, 'g5'], econ: [120, 300, 600] };
    var UPN = { arm: 'upArm', plate: 'upPlate', econ: 'upEcon' }, UPI = { arm: '⚔️', plate: '🧱', econ: '💰' };

    if (!W.real || !W.hexes.length || !W.hexes.some(function (h) { return h.cn; })) {
      $('#w-hint').textContent = t('needMap'); $('#w-hint').style.pointerEvents = 'auto'; return;
    }

    /* ---------- regions (countries) from the hex grid ---------- */
    var R = {}, names = [];
    W.hexes.forEach(function (h) { if (!h.cn) return; if (!R[h.cn]) { R[h.cn] = { name: h.cn, hexes: [], nb: {}, mount: 0 }; names.push(h.cn); } R[h.cn].hexes.push(h); if (h.mount) R[h.cn].mount++; });
    function idRC(id) { return [id % COLS, Math.floor(id / COLS)]; }
    function link(a, b) { if (a === b || !R[a] || !R[b]) return; R[a].nb[b] = 1; R[b].nb[a] = 1; }
    W.hexes.forEach(function (h) {
      if (!h.cn) return;
      var n1 = W.neighbors(h.col, h.row), seen = {};
      n1.forEach(function (id) { seen[id] = 1; if (byId[id]) link(h.cn, byId[id].cn); });
      n1.forEach(function (id) { var rc = idRC(id); W.neighbors(rc[0], rc[1]).forEach(function (j) { if (!seen[j] && byId[j]) link(h.cn, byId[j].cn); }); });
    });
    // anchor = hex in the largest connected piece nearest its centre
    names.forEach(function (n) {
      var r = R[n], inR = {}, comp = {}, best = [];
      r.hexes.forEach(function (h) { inR[h.id] = h; });
      r.hexes.forEach(function (h) {
        if (comp[h.id]) return; var q = [h], list = []; comp[h.id] = 1;
        while (q.length) { var c = q.pop(); list.push(c); W.neighbors(c.col, c.row).forEach(function (id) { if (inR[id] && !comp[id]) { comp[id] = 1; q.push(inR[id]); } }); }
        if (list.length > best.length) best = list;
      });
      var ref = best[0], sx = 0, sy = 0;
      best.forEach(function (h) { var c = h.col; if (c - ref.col > COLS / 2) c -= COLS; else if (c - ref.col < -COLS / 2) c += COLS; sx += c; sy += h.row; });
      sx /= best.length; sy /= best.length; var bh = best[0], bd = 1e9;
      best.forEach(function (h) { var c = h.col; if (c - ref.col > COLS / 2) c -= COLS; else if (c - ref.col < -COLS / 2) c += COLS; var d = (c - sx) * (c - sx) + (h.row - sy) * (h.row - sy); if (d < bd) { bd = d; bh = h; } });
      r.anchor = bh; r.size = r.hexes.length; r.rough = r.mount / r.size >= 0.25;
    });
    // connect isolated groups so every region is reachable
    (function () {
      function comps() { var seen = {}, out = []; names.forEach(function (n) { if (seen[n]) return; var q = [n], l = []; seen[n] = 1; while (q.length) { var c = q.pop(); l.push(c); Object.keys(R[c].nb).forEach(function (m) { if (!seen[m]) { seen[m] = 1; q.push(m); } }); } out.push(l); }); return out; }
      function wd(a, b) { var dx = Math.abs(a.col - b.col); if (dx > COLS / 2) dx = COLS - dx; return dx * dx * 0.8 + (a.row - b.row) * (a.row - b.row); }
      for (var guard = 0; guard < 80; guard++) {
        var cs = comps(); if (cs.length < 2) break; cs.sort(function (a, b) { return b.length - a.length; });
        var main = cs[0], small = cs[1], bd = 1e9, ba, bb;
        small.forEach(function (a) { main.forEach(function (b) { var d = wd(R[a].anchor, R[b].anchor); if (d < bd) { bd = d; ba = a; bb = b; } }); });
        link(ba, bb);
      }
    })();
    var TOTAL = names.length, GOAL = Math.max(10, Math.round(TOTAL * 0.35));
    if (!R[HOME]) HOME = names.slice().sort(function (a, b) { return R[b].size - R[a].size; })[0];
    function rdist(a, b, lim) { if (a === b) return 0; var seen = {}, f = [a], d = 0; seen[a] = 1; while (f.length && d < lim) { d++; var nx = []; for (var i = 0; i < f.length; i++) { var ks = Object.keys(R[f[i]].nb); for (var j = 0; j < ks.length; j++) { var m = ks[j]; if (seen[m]) continue; if (m === b) return d; seen[m] = 1; nx.push(m); } } f = nx; } return 99; }

    /* ---------- state ---------- */
    var DEF = { map: MAPV, init: false, turn: 1, up: { arm: 0, plate: 0, econ: 0 }, units: [], own: {}, nid: 1, ai: { a: 60, b: 60, c: 60 }, res: '' };
    var saved = LS.get('sdk_war', {}) || {};
    var st = Object.assign({}, JSON.parse(JSON.stringify(DEF)), saved.map === MAPV ? saved : {});
    st.up = Object.assign({}, DEF.up, st.up || {});
    function newUnit(tp, side, reg, hp) { return { id: st.nid++, t: tp, s: side, r: reg, hp: hp || 10, moved: false, attacked: false }; }
    function initScenario() {
      st.units = []; st.own = {}; names.forEach(function (n) { st.own[n] = 'n'; });
      var taken = {};
      function give(n, side, tp) { if (!R[n] || taken[n]) return; taken[n] = 1; st.own[n] = side; st.units.push(newUnit(tp, side, n, 10)); }
      give(HOME, 'p', 'tank');
      var rest = START_ALLIES.filter(function (n) { return R[n] && !taken[n]; }), tps = ['inf', 'art', 'inf'];
      rest.forEach(function (n, i) { give(n, 'p', tps[i % 3]); });
      if (rest.length < 2) Object.keys(R[HOME].nb).slice(0, 2).forEach(function (n) { give(n, 'p', 'inf'); });
      // three AI blocs far apart from each other and from the player
      var seeds = [], cand = names.filter(function (n) { return R[n].size >= 3 && !taken[n]; });
      function far(n) { var m = 1e9, anchors = [R[HOME].anchor].concat(seeds.map(function (s) { return R[s].anchor; })); anchors.forEach(function (a) { var dx = Math.abs(a.col - R[n].anchor.col); if (dx > COLS / 2) dx = COLS - dx; m = Math.min(m, dx * dx * 0.8 + (a.row - R[n].anchor.row) * (a.row - R[n].anchor.row)); }); return m; }
      ['a', 'b', 'c'].forEach(function (f) {
        var best = null, bs = -1; cand.forEach(function (n) { if (taken[n]) return; var s = far(n); if (s > bs) { bs = s; best = n; } });
        if (!best) return; seeds.push(best);
        var q = [best], got = 0;
        while (q.length && got < 4) { var c = q.shift(); if (taken[c]) continue; give(c, f, got % 2 ? 'tank' : 'inf'); got++; Object.keys(R[c].nb).forEach(function (m) { if (!taken[m]) q.push(m); }); }
      });
      names.forEach(function (n) { if (!taken[n]) st.units.push(newUnit('inf', 'n', n, 6 + (R[n].size % 4))); });
      st.init = true; stats(function (s) { s.coins = (s.coins || 0) + 100; });
    }
    function stats(fn) { var s = LS.get('sdk_stats', {}) || {}; if (fn) { fn(s); LS.set('sdk_stats', s); } return s; }
    function coins() { return stats().coins || 0; } function gems() { return stats().gems || 0; }
    function save() { LS.set('sdk_war', st); }
    if (!st.init) initScenario();

    /* ---------- rules ---------- */
    function unitAt(n) { for (var i = 0; i < st.units.length; i++) if (st.units[i].r === n) return st.units[i]; return null; }
    function unitById(id) { for (var i = 0; i < st.units.length; i++) if (st.units[i].id === id) return st.units[i]; return null; }
    function countOwn(side) { var c = 0; for (var n in st.own) if (st.own[n] === side) c++; return c; }
    function hostile(a, b) { return a !== b; }
    function atkOf(u) { return UT[u.t].atk + (u.s === 'p' ? st.up.arm : 0); }
    function defOf(u) { return UT[u.t].def + (u.s === 'p' ? st.up.plate : 0) + (R[u.r].rough ? 2 : 0); }
    function est(a, d) {
      var dm = Math.max(1, Math.min(10, Math.round(atkOf(a) * (a.hp / 10) - defOf(d) * 0.4)));
      var melee = rdist(a.r, d.r, 2) <= 1, cd = 0;
      if (melee && d.hp - dm > 0) cd = Math.max(0, Math.min(8, Math.round(atkOf(d) * ((d.hp - dm) / 10) * 0.6 - defOf(a) * 0.3)));
      return { d: dm, c: cd, melee: melee };
    }
    function reach(u) {
      var out = {}, mv = UT[u.t].mv, seen = {}, f = [u.r]; seen[u.r] = 1;
      for (var s = 0; s < mv; s++) {
        var nx = [];
        f.forEach(function (n) { Object.keys(R[n].nb).forEach(function (m) {
          if (seen[m]) return; var o = unitAt(m);
          if (o && o.s !== u.s && u.t !== 'air') { seen[m] = 1; return; }
          seen[m] = 1; if (!o) out[m] = 1; if (!o || o.s === u.s || u.t === 'air') nx.push(m);
        }); });
        f = nx;
      }
      return out;
    }
    function targets(u) {
      var out = {}, rg = UT[u.t].rg;
      st.units.forEach(function (e) { if (e.s !== u.s && rdist(u.r, e.r, rg) <= rg) out[e.id] = 1; });
      return out;
    }
    function capture(n, side, loot) {
      var prev = st.own[n]; st.own[n] = side;
      if (side === 'p' && prev !== 'p' && loot) stats(function (s) { s.coins = (s.coins || 0) + 30; });
    }
    function resolve(a, d, ev) {
      var e = est(a, d), jit = Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0, dm = Math.max(1, Math.min(10, e.d + jit));
      d.hp -= dm; var killed = d.hp <= 0, cd = 0;
      if (killed) { st.units = st.units.filter(function (x) { return x.id !== d.id; }); if (e.melee) { a.r = d.r; capture(d.r, a.s, a.s === 'p'); } }
      else if (e.melee && e.c) { cd = e.c; a.hp -= cd; }
      a.attacked = true; a.moved = true;
      if (a.hp <= 0) st.units = st.units.filter(function (x) { return x.id !== a.id; });
      return { dm: dm, killed: killed, cd: cd, advanced: killed && e.melee };
    }

    /* ---------- view ---------- */
    var cv = $('#map'), ctx = cv.getContext('2d');
    var SZ = 22, HW = Math.sqrt(3) * SZ, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var view = { x: 0, y: 0, k: 1 }, vw = 0, vh = 0, selU = 0, selT = null, selR = null, moveSet = {}, atkSet = {};
    var worldW = W.COLS * HW, worldH = W.ROWS * 1.5 * SZ + SZ * 2;
    function center(h) { return [(h.col + 0.5 * (h.row & 1) + 0.5) * HW, h.row * 1.5 * SZ + SZ]; }
    function rc(n) { return center(R[n].anchor); }
    function lonX(lon) { return (lon + 180) / W.DLON * HW; }
    function latY(lat) { return (W.LAT0 - lat) / W.DLAT * 1.5 * SZ + SZ; }
    function resize() { var r = $('#mapwrap').getBoundingClientRect(); vw = r.width; vh = r.height; cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr); clamp(); draw(); }
    function clamp() {
      var minK = Math.max(vw / worldW, vh / worldH) * 0.9; if (view.k < minK) view.k = minK; if (view.k > 3.2) view.k = 3.2;
      var ww = worldW * view.k, wh = worldH * view.k;
      view.x = ww <= vw ? (vw - ww) / 2 : Math.min(40, Math.max(vw - ww - 40, view.x));
      view.y = wh <= vh ? (vh - wh) / 2 : Math.min(40, Math.max(vh - wh - 40, view.y));
    }
    function focusReg(n, k) { var c = rc(n); view.k = k || view.k; view.x = vw / 2 - c[0] * view.k; view.y = vh / 2 - c[1] * view.k; clamp(); draw(); }
    function polyPath(p) {
      ctx.beginPath();
      for (var r = 0; r < p.rings.length; r++) { var ring = p.rings[r]; for (var k = 0; k < ring.length; k++) { var x = lonX(ring[k][0]), y = latY(ring[k][1]); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); }
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function drawUnit(u, c, selected) {
      var col = u.s === 'p' ? '#2f7fd8' : u.s === 'n' ? '#8c8060' : u.s === 'a' ? '#d9473f' : u.s === 'b' ? '#e0a23a' : '#8e5fc0', r = SZ * 0.62, x = c[0], y = c[1] - 4;
      ctx.save(); if (u.s === 'p' && u.attacked) ctx.globalAlpha = 0.65;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.lineWidth = selected ? 3 : 1.6; ctx.strokeStyle = selected ? '#ffe066' : '#fff'; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff';
      if (u.t === 'inf') { ctx.beginPath(); ctx.arc(x, y - r * 0.38, r * 0.22, 0, 7); ctx.fill(); ctx.fillRect(x - r * 0.3, y - r * 0.1, r * 0.6, r * 0.62); }
      else if (u.t === 'tank') { ctx.fillRect(x - r * 0.55, y - r * 0.05, r * 1.1, r * 0.38); ctx.fillRect(x - r * 0.28, y - r * 0.35, r * 0.56, r * 0.32); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - r * 0.2); ctx.lineTo(x + r * 0.75, y - r * 0.38); ctx.stroke(); }
      else if (u.t === 'art') { ctx.beginPath(); ctx.arc(x - r * 0.12, y + r * 0.28, r * 0.22, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - r * 0.3, y + r * 0.2); ctx.lineTo(x + r * 0.6, y - r * 0.42); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(x, y - r * 0.6); ctx.lineTo(x + r * 0.2, y - r * 0.1); ctx.lineTo(x + r * 0.62, y + r * 0.15); ctx.lineTo(x + r * 0.2, y + r * 0.1); ctx.lineTo(x + r * 0.12, y + r * 0.5); ctx.lineTo(x, y + r * 0.38); ctx.lineTo(x - r * 0.12, y + r * 0.5); ctx.lineTo(x - r * 0.2, y + r * 0.1); ctx.lineTo(x - r * 0.62, y + r * 0.15); ctx.lineTo(x - r * 0.2, y - r * 0.1); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      var bw = 17, bh = 11, bx = x - bw / 2, by = y + r + 1;
      rr(bx, by, bw, bh, 3); ctx.fillStyle = 'rgba(30,34,40,.92)'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = '#c9d2da'; ctx.stroke();
      ctx.fillStyle = u.hp > 6 ? '#8ee08c' : u.hp > 3 ? '#f2d36b' : '#ff8a80'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(u.hp, x, by + bh / 2 + 0.5);
    }
    var visPolys = [];
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var g = ctx.createLinearGradient(0, 0, 0, vh); g.addColorStop(0, '#1f4a7a'); g.addColorStop(1, '#16365a'); ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh);
      ctx.save(); ctx.translate(view.x, view.y); ctx.scale(view.k, view.k);
      var x0 = -view.x / view.k - SZ * 2, x1 = (vw - view.x) / view.k + SZ * 2, y0 = -view.y / view.k - SZ * 2, y1 = (vh - view.y) / view.k + SZ * 2;
      var polys = W.polys || [], lw = 1.1 / view.k, sel = {};
      ctx.lineJoin = 'round';
      for (var i = 0; i < polys.length; i++) {
        var p = polys[i];
        if (lonX(p.x1) < x0 || lonX(p.x0) > x1 || latY(p.y0) < y0 || latY(p.y1) > y1) continue;
        var o = st.own[p.name] || 'n';
        polyPath(p); ctx.fillStyle = OWN[o]; ctx.fill('evenodd');
        if (moveSet[p.name]) { ctx.fillStyle = 'rgba(70,160,255,.55)'; ctx.fill('evenodd'); }
        ctx.lineWidth = lw; ctx.strokeStyle = 'rgba(25,40,70,.8)'; ctx.setLineDash([4 / view.k, 3 / view.k]); ctx.stroke(); ctx.setLineDash([]);
      }
      // highlights (selected / targets)
      for (var j = 0; j < polys.length; j++) {
        var q = polys[j], nm = q.name; if (!nm) continue;
        var ec = null, tg = unitAt(nm); if (tg && atkSet[tg.id]) ec = '#ff4d42'; else if (selR === nm || (selU && unitById(selU) && unitById(selU).r === nm)) ec = '#ffffff'; else if (moveSet[nm]) ec = '#9fd0ff';
        if (!ec) continue;
        polyPath(q); ctx.lineWidth = (ec === '#ff4d42' ? 3.2 : 2.4) / view.k; ctx.strokeStyle = ec; ctx.stroke();
        if (ec === '#ff4d42') { ctx.fillStyle = 'rgba(255,70,60,.25)'; ctx.fill('evenodd'); }
      }
      // names
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      var fs = Math.max(8, Math.min(13, 9 / Math.sqrt(view.k) * 1.2)); ctx.font = '600 ' + fs + 'px system-ui'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(15,25,40,.75)'; ctx.fillStyle = '#f4f1e6';
      names.forEach(function (n) { var c = rc(n); if (c[0] < x0 || c[0] > x1 || c[1] < y0 || c[1] > y1) return; if (view.k < 0.55 && R[n].size < 4) return; ctx.strokeText(n, c[0], c[1] + SZ * 0.95); ctx.fillText(n, c[0], c[1] + SZ * 0.95); });
      st.units.forEach(function (u) { var c = rc(u.r); if (c[0] < x0 || c[0] > x1 || c[1] < y0 || c[1] > y1) return; drawUnit(u, c, u.id === selU); });
      ctx.restore();
    }
    function regionAt(sx, sy) {
      var wx = (sx - view.x) / view.k, wy = (sy - view.y) / view.k, best = null, bd = SZ * SZ * 1.1;
      W.hexes.forEach(function (h) { if (!h.cn) return; var c = center(h), dx = c[0] - wx, dy = c[1] - wy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = h.cn; } });
      return best;
    }

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
        var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), nk = Math.min(3.2, Math.max(0.1, pinch.k * d / pinch.d));
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
      e.preventDefault(); var nk = Math.min(3.2, Math.max(0.1, view.k * (e.deltaY < 0 ? 1.15 : 0.87)));
      view.x = e.offsetX - (e.offsetX - view.x) * nk / view.k; view.y = e.offsetY - (e.offsetY - view.y) * nk / view.k; view.k = nk; clamp(); draw();
    }, { passive: false });

    /* ---------- selection / panel ---------- */
    function clearSel() { selU = 0; selT = null; selR = null; moveSet = {}; atkSet = {}; renderPanel(); draw(); }
    function selectUnit(u) {
      selU = u.id; selT = null; selR = u.r;
      moveSet = (!u.moved && !st.res) ? reach(u) : {}; atkSet = (!u.attacked && !st.res) ? targets(u) : {};
      renderPanel(); draw();
    }
    function tap(x, y) {
      if (st.res) return;
      var n = regionAt(x, y); if (!n) { clearSel(); return; }
      var u = unitAt(n), su = selU ? unitById(selU) : null;
      if (su && su.s === 'p') {
        if (moveSet[n] && !u) { moveUnit(su, n); return; }
        if (u && u.s !== 'p' && atkSet[u.id]) { selT = u.id; selR = n; renderPanel(); draw(); return; }
      }
      if (u && u.s === 'p') { selectUnit(u); return; }
      selU = 0; moveSet = {}; atkSet = {}; selT = u ? u.id : null; selR = n; renderPanel(); draw();
    }
    function moveUnit(u, n) {
      u.r = n; u.moved = true;
      if (st.own[n] !== 'p') { capture(n, 'p', true); toast(t('captured', { c: n }) + ' 🪙+30'); }
      save(); selectUnit(u); refresh(); checkEnd();
    }
    function statLine(tp) { var d = UT[tp]; return t('mv') + ' ' + d.mv + ' · ' + t('rg') + ' ' + d.rg + ' · ' + t('atk') + ' ' + d.atk + ' · ' + t('def') + ' ' + d.def; }
    function renderPanel() {
      var p = $('#panel'), body = $('#p-body'), go = $('#p-go');
      if (!selR && !selU) { p.hidden = true; return; }
      body.innerHTML = ''; go.hidden = true; go.disabled = false; p.hidden = false;
      var u = selU ? unitById(selU) : null, tg = selT ? unitById(selT) : null, n = selR || (u && u.r), o = st.own[n] || 'n';
      if (tg && u && atkSet[tg.id]) {
        var e = est(u, tg);
        $('#p-title').textContent = n + ' · ' + t('u_' + tg.t) + ' ' + tg.hp + '/10'; $('#p-type').textContent = t(OWNN[tg.s]);
        body.appendChild(el('div', '', t('dmgEst') + ': ~' + e.d + (e.melee ? ' · ' + t('counterEst') + ': ~' + e.c : '')));
        go.hidden = false; go.className = 'btn primary'; go.textContent = '⚔️ ' + t('attack');
        go.onclick = function () { doAttack(u, tg); }; return;
      }
      var occ = unitAt(n);
      $('#p-title').textContent = n + (occ ? ' · ' + t('u_' + occ.t) + ' ' + occ.hp + '/10' : ''); $('#p-type').textContent = t(OWNN[o]);
      if (occ) { body.appendChild(el('div', '', statLine(occ.t))); if (occ.s === 'p') body.appendChild(el('div', '', occ.attacked ? t('acted') : t('moveHint'))); }
      else body.appendChild(el('div', '', t('empty')));
      if (!occ && o === 'p') {
        body.appendChild(el('div', '', t('recruit')));
        var row = el('div', 'rbtns');
        ['inf', 'tank', 'art', 'air'].forEach(function (tp) { var d = UT[tp], b = el('button', 'btn small', t('u_' + tp) + ' 🪙' + d.c); b.type = 'button'; b.disabled = coins() < d.c; b.onclick = function () { recruit(tp, n); }; row.appendChild(b); });
        body.appendChild(row);
        if (coins() < 40) body.appendChild(el('div', '', '💡 ' + t('sudokuTip')));
      }
    }
    function recruit(tp, n) {
      var d = UT[tp]; if (unitAt(n)) return;
      if (st.units.filter(function (x) { return x.s === 'p'; }).length >= MAXU) { toast(t('maxUnits')); return; }
      if (coins() < d.c) { toast(t('notEnough')); return; }
      stats(function (s) { s.coins -= d.c; });
      var nu = newUnit(tp, 'p', n); nu.moved = true; nu.attacked = true; st.units.push(nu); save(); refresh(); toast(t('recruited') + ': ' + t('u_' + tp)); selectUnit(nu);
    }
    function doAttack(a, d) {
      var res = resolve(a, d), parts = [t('dealt', { d: res.dm })];
      if (res.killed) parts.push(t('destroyed')); if (res.advanced) parts.push(t('captured', { c: d.r }));
      if (res.cd) parts.push(t('counter', { d: res.cd }));
      save(); clearSel(); refresh();
      showModal(res.killed ? t('destroyed') : t('dealt', { d: res.dm }), [el('div', 'big', res.killed ? '💥' : '🎯')].concat(parts), [{ label: t('ok'), cls: 'green', fn: checkEnd }]);
    }

    /* ---------- HUD ---------- */
    function refresh() {
      $('#w-turn').textContent = t('turnOf', { n: Math.min(st.turn, MAXTURN), m: MAXTURN });
      $('#r-g').textContent = coins(); $('#r-d').textContent = gems();
      $('#w-hint').textContent = t('goal', { a: countOwn('p'), b: GOAL, c: HOME });
      $('#b-up-t').textContent = t('upgrade'); $('#b-end-t').textContent = t('endTurn');
      document.title = t('wTitle'); draw();
    }
    function showModal(title, body, buttons) {
      $('#m-title').textContent = title; var b = $('#m-body'); b.innerHTML = '';
      body.forEach(function (n) { b.appendChild(typeof n === 'string' ? el('div', '', n) : n); });
      var a = $('#m-actions'); a.innerHTML = '';
      buttons.forEach(function (x) { var bt = el('button', 'btn ' + (x.cls || ''), x.label); bt.type = 'button'; bt.onclick = function () { closeModal(); if (x.fn) x.fn(); }; a.appendChild(bt); });
      $('#modal').hidden = false;
    }
    function closeModal() { $('#modal').hidden = true; }
    var toastT; function toast(m) { var e = $('#toast'); e.textContent = m; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('show'); }, 2200); }

    function openUpgrades() {
      var body = [];
      ['arm', 'plate', 'econ'].forEach(function (k) {
        var lv = st.up[k], arr = UP[k], maxed = lv >= arr.length, c = maxed ? 0 : arr[lv], isG = typeof c === 'string', cost = isG ? +c.slice(1) : c;
        var have = isG ? gems() : coins(), sym = isG ? '💎' : '🪙';
        var row = el('div', 'unit'); row.appendChild(el('div', 'ui', UPI[k]));
        var mid = el('div'); mid.appendChild(el('b', '', t(UPN[k]) + ' · ' + t('lvl') + ' ' + lv)); mid.appendChild(el('small', '', t(UPN[k] + 'D')));
        var bars = el('div', 'lv'); for (var i = 0; i < arr.length; i++) bars.appendChild(el('i', i < lv ? 'on' : '')); mid.appendChild(bars); row.appendChild(mid);
        var bt = el('button', 'btn' + (maxed ? '' : ' green'), maxed ? t('max') : sym + ' ' + cost); bt.type = 'button'; bt.disabled = maxed || have < cost;
        bt.onclick = function () { stats(function (s) { if (isG) s.gems -= cost; else s.coins -= cost; }); st.up[k]++; save(); refresh(); openUpgrades(); };
        row.appendChild(bt); body.push(row);
      });
      body.push(el('small', '', '💡 ' + t('sudokuTip')));
      showModal(t('upgrade'), body, [{ label: t('ok') }]);
    }

    /* ---------- AI turns ---------- */
    function aiTurn(f, ev) {
      var mine = st.units.filter(function (u) { return u.s === f; });
      mine.forEach(function (u) {
        if (u.hp <= 0 || st.units.indexOf(u) < 0) return;
        // attack best target in range
        var best = null, bs = -1e9;
        st.units.forEach(function (e) { if (e.s === f) return; if (rdist(u.r, e.r, UT[u.t].rg) > UT[u.t].rg) return; var x = est(u, e); var sc = x.d * 2 - x.c + (e.s === 'p' ? 3 : 0) + (x.d >= e.hp ? 6 : 0); if (sc > bs) { bs = sc; best = e; } });
        if (best && (bs > 0 || best.s === 'p')) {
          var wasP = best.s === 'p', res = resolve(u, best); if (wasP) ev.hit++;
          return;
        }
        // move toward nearest non-owned region
        var reachSet = reach(u), bestN = null, bd = 1e9;
        Object.keys(reachSet).forEach(function (n) {
          var gain = st.own[n] === f ? 0 : 6; var d = 99; // distance from n to nearest foreign region
          var seen = {}, fr = [n], dd = 0; seen[n] = 1;
          while (fr.length && d === 99 && dd < 8) { dd++; var nx = []; fr.forEach(function (x) { Object.keys(R[x].nb).forEach(function (m) { if (seen[m]) return; seen[m] = 1; if (st.own[m] !== f) d = Math.min(d, dd); nx.push(m); }); }); fr = nx; }
          var sc = (st.own[n] === f ? 0 : -8) + d + (Math.random() * 0.5);
          if (sc < bd) { bd = sc; bestN = n; }
        });
        if (bestN && !(st.own[u.r] !== f && st.own[u.r] !== undefined && false)) {
          u.r = bestN; u.moved = true;
          if (st.own[bestN] !== f) { var was = st.own[bestN]; if (was === 'p') ev.lost.push(bestN); capture(bestN, f, false); }
        }
      });
      // income + recruit
      st.ai[f] = (st.ai[f] || 0) + 10 + 7 * countOwn(f);
      var cap = 4 + Math.floor(countOwn(f) * 1.1), cnt = st.units.filter(function (x) { return x.s === f; }).length, own = names.filter(function (n) { return st.own[n] === f && !unitAt(n); });
      own.sort(function (a, b) { return Object.keys(R[b].nb).filter(function (m) { return st.own[m] !== f; }).length - Object.keys(R[a].nb).filter(function (m) { return st.own[m] !== f; }).length; });
      for (var i = 0; i < own.length && cnt < cap; i++) { var tp = Math.random() < 0.65 ? 'inf' : Math.random() < 0.6 ? 'tank' : 'art'; if (st.ai[f] < UT[tp].c) break; st.ai[f] -= UT[tp].c; st.units.push(newUnit(tp, f, own[i], 10)); cnt++; }
    }
    function endTurn() {
      if (st.res || (modalOpen())) return;
      var ev = { hit: 0, lost: [], killed: 0 }, before = st.units.filter(function (u) { return u.s === 'p'; }).length;
      clearSel();
      if (st.turn >= 2) ['a', 'b', 'c'].forEach(function (f) { aiTurn(f, ev); });
      var after = st.units.filter(function (u) { return u.s === 'p'; }).length; ev.killed = Math.max(0, before - after);
      // a player region whose unit died stays owned until someone steps in; neutral units regenerate
      var cities = countOwn('p'), inc = Math.round((12 + 5 * cities) * (1 + 0.2 * st.up.econ));
      stats(function (s) { s.coins = (s.coins || 0) + inc; });
      st.units.forEach(function (u) { u.hp = Math.min(10, u.hp + (u.s === 'p' && st.own[u.r] === 'p' ? 2 : 1)); u.moved = false; u.attacked = false; });
      st.turn++; save(); refresh();
      var lines = [];
      if (ev.hit) lines.push(t('evHit', { n: ev.hit })); ev.lost.forEach(function (c) { lines.push('🏙️ ' + t('evLost', { c: c })); });
      if (ev.killed) lines.push(t('evKilled', { n: ev.killed })); if (!lines.length) lines.push(t('evNone'));
      lines.push(t('income') + ': 🪙+' + inc);
      showModal(t('turnEnd'), lines, [{ label: t('ok'), fn: checkEnd }]);
    }
    function modalOpen() { return !$('#modal').hidden; }
    function checkEnd() {
      if (st.res) return;
      var res = '', msg = '';
      if (st.own[HOME] !== 'p') { res = 'lose'; msg = t('defeatCap'); }
      else if (countOwn('p') >= GOAL) { res = 'win'; msg = t('victoryD'); }
      else if (st.turn > MAXTURN) { res = 'lose'; msg = t('defeatTime'); }
      if (!res) return;
      st.res = res; save(); refresh();
      showModal(res === 'win' ? t('victory') : t('defeat'), [el('div', 'big', res === 'win' ? '🏆' : '💀'), msg], [{ label: t('restartWar'), cls: res === 'win' ? 'green' : 'primary', fn: restartWar }, { label: t('home'), fn: function () { location.href = './'; } }]);
    }
    function restartWar() { st = JSON.parse(JSON.stringify(DEF)); initScenario(); save(); clearSel(); refresh(); focusDefault(); }

    $('#b-up').addEventListener('click', openUpgrades);
    $('#b-end').addEventListener('click', endTurn);
    $('#w-home').addEventListener('click', function () { location.href = './'; });
    $('#w-menu').addEventListener('click', function () {
      showModal(t('menu'), [t('wTitle')], [{ label: t('restartWar'), fn: function () { if (confirm(t('confirmReset'))) restartWar(); } }, { label: t('cancel') }]);
    });
    window.addEventListener('resize', resize);
    function focusDefault() { focusReg(HOME, 1.6); }
    resize(); refresh(); focusDefault(); checkEnd();
    window.WarDebug = { st: function () { return st; }, R: R, names: names, endTurn: endTurn, screenOf: function (n) { var c = rc(n); return [c[0] * view.k + view.x, c[1] * view.k + view.y]; }, focus: focusReg, total: TOTAL, goal: GOAL };
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
