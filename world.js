/* World hex map data: rough continent outlines (lon,lat) -> land hexes. Stylised, not survey-accurate. */
(function (root) {
  'use strict';
  var POLYS = [
    // North America
    [[-168,65],[-165,68.5],[-156,71],[-141,69.5],[-125,70],[-110,68],[-95,68],[-85,69],[-82,66],[-90,64],[-94,59],[-92,57],[-85,55],[-80,52],[-79,57],[-77,62],[-70,61],[-65,60],[-61,56],[-56,52],[-60,47],[-66,45],[-70,43],[-70,41.5],[-74,40],[-76,37],[-76,35],[-81,31],[-80,26],[-82,26],[-83,29],[-85,30],[-90,29],[-94,29.5],[-97,27],[-97.5,22],[-96,19],[-94,18],[-91,19],[-90,21],[-87,21],[-88,16],[-84,15],[-83,11],[-80,9],[-78,8.5],[-80,7.5],[-83,8],[-86,11],[-88,13],[-92,14.5],[-96,15.7],[-102,18],[-105,20],[-106,23],[-109,26],[-112,29],[-114.5,31.5],[-117,32.5],[-121,35],[-124,40],[-124,46],[-123,48.5],[-128,51],[-133,55],[-138,59],[-146,61],[-152,59],[-158,57],[-163,55],[-158,58.5],[-162,60],[-165,62]],
    // Greenland
    [[-73,78],[-60,82],[-30,83],[-20,80],[-18,76],[-22,70],[-33,68],[-42,60],[-48,61],[-53,67],[-58,75]],
    // Baffin, Victoria, Ellesmere
    [[-80,64],[-72,70],[-62,67],[-65,62],[-72,62]],
    [[-118,70],[-105,73],[-101,70],[-110,68.5]],
    [[-90,77],[-75,83],[-62,82],[-80,77]],
    // South America
    [[-77,8],[-72,12],[-62,10.5],[-52,5],[-50,0],[-44,-2],[-35,-5],[-35,-9],[-39,-15],[-41,-22],[-48,-26],[-53,-34],[-58,-35],[-57,-38],[-62,-39],[-65,-42],[-66,-47],[-69,-51],[-68,-54],[-72,-53],[-75,-47],[-73,-38],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,-2],[-78,2]],
    // Cuba
    [[-85,22],[-80,23],[-74,20],[-78,20]],
    // Eurasia (with Black Sea / Persian Gulf notches)
    [[-9,37],[-9,43],[-2,43.5],[-1.5,46],[-4.5,48.5],[2,51],[5,53.5],[8,55],[10,57.5],[12,56],[12,54],[18,54.7],[21,57],[24,57.5],[23.5,59.5],[30,60],[23,60],[21,60.5],[21,65],[25,65.5],[22,66],[17.5,62],[19,60],[16,56.5],[13,55.5],[11,58.5],[5,59],[5,62],[14,67.5],[20,70],[28,71],[32,70],[41,67],[44,66],[53,68.5],[60,69],[68,69],[70,73],[80,73],[87,75.5],[100,77],[113,74],[128,73],[140,72],[160,70],[170,70],[180,68.5],[180,65],[178,64.5],[170,60],[163,60],[163,58],[160,54],[156,51],[155,57],[143,59],[137,54],[141,52],[140,48],[135,43],[130,42.5],[129,40],[127.5,39.5],[129,35],[126.5,34.5],[126,37.5],[125,39.5],[122,40],[121.5,38.5],[119,37.5],[122,37],[119,35],[121.5,31],[122,29.5],[120,26],[117,23],[113,22],[110,21],[108,21.5],[106,19],[109,15],[109,11.5],[105,8.7],[103,10.5],[100.5,13],[100,9],[103,5],[104,1.5],[101,3],[98.5,8],[98,14],[94.5,16],[94,19],[92,22],[88,21.5],[86,20],[80,15.5],[80,10],[77.5,8],[76,11],[73,17],[72.8,21],[70,21],[67,24.5],[62,25],[57,25.5],[56.5,27],[52,27.5],[50,30],[48,29.5],[50,26.5],[51.5,24.5],[56.5,24.5],[59,22.5],[55,17],[52,16],[45,13],[43,13],[39,21],[35,28],[34.5,29.5],[32,31],[34.5,31.5],[35.5,34],[36,36.5],[32,36.2],[28,36.7],[26.5,38.5],[26,40],[29,41],[35,42],[41,41],[41.5,43],[38,45],[35,45.5],[33,46],[30.5,46],[29.5,45],[28.5,44],[28,42],[27,40.8],[26,40.5],[24,40.5],[23,40],[24,38],[22,36.5],[21,38],[19.5,40.5],[19,42],[15,45],[13.5,45.5],[12.5,44],[16,41.5],[18.5,40],[16,38],[15.5,40],[12,41.5],[10,44],[8,44],[4,43.5],[3,42],[0,39],[-1,37.5],[-5,36]],
    // Africa
    [[-17,21],[-16,14.5],[-17,14.7],[-13,9],[-8,4.5],[-4,5],[2,6],[5,4.5],[9,4],[9.5,1],[12,-5],[13.5,-12],[12,-17],[15,-27],[18,-33],[20,-35],[26,-34],[32,-28.5],[35,-24],[35,-20],[40,-15],[40.5,-10],[39,-6],[41,-2],[46,2],[51,11.5],[44,11],[43,12.5],[39,16],[37,21],[35,25],[33,28],[32.5,30],[30,31],[25,32],[20,31],[15,32.5],[11,33.5],[10,37],[5,36.8],[-2,35.5],[-6,35.8],[-9.5,32],[-13,28]],
    // Madagascar
    [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
    // Australia
    [[114,-22],[122,-18],[129,-15],[131,-12],[136,-12],[137,-16],[141,-17],[142,-11],[146,-19],[153,-26],[153,-31],[150,-37],[146,-39],[141,-38],[135,-35],[130,-32],[124,-33],[116,-35],[115,-30]],
    // New Zealand
    [[172,-34.5],[178,-38],[175,-41.5],[172,-41],[174,-37]],
    [[172,-41],[174,-42],[169,-46.5],[167,-45.5]],
    // UK, Ireland, Iceland
    [[-5,50],[1.5,51],[1.5,53],[-2,56],[-2,58],[-5,58.6],[-6,56],[-3,54.5],[-4.5,53],[-5,51.5]],
    [[-10,52],[-6,52],[-6,54.5],[-8,55],[-10,54]],
    [[-24,64],[-14,64.5],[-14,66],[-22,66.5]],
    // Japan
    [[130,31],[131,34],[135,34.5],[140,35],[141.5,38],[142,41.5],[140.5,41],[141,45],[145,43.5],[144,42],[141,42],[139.5,40],[137,37],[133,35.5],[130.5,33.5]],
    // Indonesia / Philippines / New Guinea
    [[95,5.5],[98,4],[104,-1],[106,-6],[103,-5],[100,-2],[95,3]],
    [[105,-6.5],[114,-7.5],[114,-8.5],[106,-7.5]],
    [[109,1.5],[114,4.5],[118,6],[119,1],[116,-4],[111,-3],[109,-1]],
    [[131,-1],[138,-1.5],[144,-3.5],[150,-6],[147,-10],[141,-9],[137,-5],[132,-3]],
    [[120,18],[122.5,18],[124,13],[121,13.5]],
    [[122,7],[126,7],[126,9],[123,9]],
    // Novaya Zemlya
    [[52,71],[57,75],[68,77],[55,73]]
  ];
  var CASPIAN = [[47,45],[50,46.5],[53,45],[53,41],[54,37],[50,37],[49,40],[47.5,42]];

  // lon, lat, en, ru, zh, kk
  var CITIES = [
    [71.4,51.2,'Astana','Астана','阿斯塔纳','Астана'], [76.9,43.2,'Almaty','Алматы','阿拉木图','Алматы'], [37.6,55.8,'Moscow','Москва','莫斯科','Мәскеу'],
    [-0.1,51.5,'London','Лондон','伦敦','Лондон'], [2.3,48.9,'Paris','Париж','巴黎','Париж'], [13.4,52.5,'Berlin','Берлин','柏林','Берлин'], [-3.7,40.4,'Madrid','Мадрид','马德里','Мадрид'],
    [12.5,41.9,'Rome','Рим','罗马','Рим'], [29,41,'Istanbul','Стамбул','伊斯坦布尔','Стамбул'], [30.5,50.4,'Kyiv','Киев','基辅','Киев'], [31.2,30,'Cairo','Каир','开罗','Каир'],
    [3.4,6.5,'Lagos','Лагос','拉各斯','Лагос'], [36.8,-1.3,'Nairobi','Найроби','内罗毕','Найроби'], [28,-26,'Johannesburg','Йоханнесбург','约翰内斯堡','Йоханнесбург'], [18.4,-33.9,'Cape Town','Кейптаун','开普敦','Кейптаун'],
    [46.7,24.7,'Riyadh','Эр-Рияд','利雅得','Эр-Рияд'], [51.4,35.7,'Tehran','Тегеран','德黑兰','Тегеран'], [69.2,41.3,'Tashkent','Ташкент','塔什干','Ташкент'], [49.9,40.4,'Baku','Баку','巴库','Баку'],
    [77.2,28.6,'Delhi','Дели','德里','Дели'], [72.9,19.1,'Mumbai','Мумбаи','孟买','Мумбай'], [67,24.9,'Karachi','Карачи','卡拉奇','Карачи'], [82.9,55,'Novosibirsk','Новосибирск','新西伯利亚','Новосібір'],
    [116.4,39.9,'Beijing','Пекин','北京','Бейжің'], [121.5,31.2,'Shanghai','Шанхай','上海','Шанхай'], [139.7,35.7,'Tokyo','Токио','东京','Токио'], [127,37.6,'Seoul','Сеул','首尔','Сеул'],
    [131.9,43.1,'Vladivostok','Владивосток','符拉迪沃斯托克','Владивосток'], [100.5,13.8,'Bangkok','Бангкок','曼谷','Бангкок'], [106.8,-6.2,'Jakarta','Джакарта','雅加达','Джакарта'], [151.2,-33.9,'Sydney','Сидней','悉尼','Сидней'], [115.9,-32,'Perth','Перт','珀斯','Перт'],
    [-74,40.7,'New York','Нью-Йорк','纽约','Нью-Йорк'], [-118.2,34,'Los Angeles','Лос-Анджелес','洛杉矶','Лос-Анджелес'], [-79.4,43.7,'Toronto','Торонто','多伦多','Торонто'], [-99.1,19.4,'Mexico City','Мехико','墨西哥城','Мехико'],
    [-149.9,61.2,'Anchorage','Анкоридж','安克雷奇','Анкоридж'], [-21.9,64.1,'Reykjavik','Рейкьявик','雷克雅未克','Рейкьявик'], [-46.6,-23.5,'Sao Paulo','Сан-Паулу','圣保罗','Сан-Паулу'],
    [-58.4,-34.6,'Buenos Aires','Буэнос-Айрес','布宜诺斯艾利斯','Буэнос-Айрес'], [-77,-12,'Lima','Лима','利马','Лима'], [-74,4.7,'Bogota','Богота','波哥大','Богота']
  ];

  function inPoly(x, y, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }
  function mkPoly(rings, name) {
    var o = rings[0], x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (var i = 0; i < o.length; i++) { if (o[i][0] < x0) x0 = o[i][0]; if (o[i][0] > x1) x1 = o[i][0]; if (o[i][1] < y0) y0 = o[i][1]; if (o[i][1] > y1) y1 = o[i][1]; }
    return { rings: rings, name: name || '', x0: x0, x1: x1, y0: y0, y1: y1 };
  }
  function findLand(polys, lon, lat) {
    for (var i = 0; i < polys.length; i++) {
      var p = polys[i];
      if (lon < p.x0 || lon > p.x1 || lat < p.y0 || lat > p.y1) continue;
      if (!inPoly(lon, lat, p.rings[0])) continue;
      var hole = false;
      for (var h = 1; h < p.rings.length; h++) if (inPoly(lon, lat, p.rings[h])) { hole = true; break; }
      if (!hole) return p;
    }
    return null;
  }
  var FALLBACK = POLYS.map(function (r) { return mkPoly([r]); });

  /* TopoJSON (world-atlas) -> polygons */
  function decodeTopo(topo) {
    var tr = topo.transform, arcs = topo.arcs.map(function (a) {
      var x = 0, y = 0;
      return a.map(function (p) {
        if (tr) { x += p[0]; y += p[1]; return [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]]; }
        return [p[0], p[1]];
      });
    });
    function arc(i) { return i < 0 ? arcs[~i].slice().reverse() : arcs[i]; }
    function ring(idxs) { var pts = []; idxs.forEach(function (i, k) { var a = arc(i); pts = pts.concat(k ? a.slice(1) : a); }); return pts; }
    var key = topo.objects.countries ? 'countries' : Object.keys(topo.objects)[0], geoms = topo.objects[key].geometries || [], out = [];
    geoms.forEach(function (g) {
      var name = (g.properties && g.properties.name) || '';
      if (name === 'Antarctica') return;
      var polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
      polys.forEach(function (rs) { out.push(mkPoly(rs.map(ring), name)); });
    });
    return out;
  }

  var COLS = 60, ROWS = 28, DLON = 6, DLAT = 5.196, LAT0 = 82;
  function hexLonLat(col, row) { return [-180 + (col + 0.5 * (row & 1) + 0.5) * DLON, LAT0 - row * DLAT]; }

  function build(polys, useCaspian) {
    var hexes = [], byId = {};
    function land(lon, lat) { if (useCaspian && inPoly(lon, lat, CASPIAN)) return null; return findLand(polys, lon, lat); }
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var ll = hexLonLat(c, r), cnt = 0, cn = '', p0 = land(ll[0], ll[1]);
      if (p0) { cnt += 2; cn = p0.name; }
      for (var k = 0; k < 6; k++) {
        var a = Math.PI / 3 * k - Math.PI / 6, p = land(ll[0] + Math.cos(a) * 3.2, ll[1] + Math.sin(a) * 2.9);
        if (p) { cnt++; if (!cn) cn = p.name; }
      }
      if (cnt >= 4) {
        var id = r * COLS + c;
        var h = { id: id, col: c, row: r, lon: ll[0], lat: ll[1], city: -1, mount: false, cn: cn };
        hexes.push(h); byId[id] = h;
      }
    }
    CITIES.forEach(function (ct, i) {
      var best = null, bd = 1e9;
      hexes.forEach(function (h) {
        if (h.city >= 0) return;
        var dx = (h.lon - ct[0]) * Math.cos(ct[1] * Math.PI / 180), dy = h.lat - ct[1], d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = h; }
      });
      if (best && bd < 120) best.city = i;
    });
    hexes.forEach(function (h) {
      var x = (h.id * 2654435761) >>> 0;
      if (h.city < 0 && x % 9 === 0 && Math.abs(h.lat) < 62) h.mount = true;
    });
    return { hexes: hexes, byId: byId };
  }

  // odd-r offset neighbours
  function neighbors(col, row) {
    var odd = row & 1;
    var d = odd ? [[1,0],[1,-1],[0,-1],[-1,0],[0,1],[1,1]] : [[1,0],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1]];
    var out = [];
    for (var i = 0; i < 6; i++) {
      var c = col + d[i][0], r = row + d[i][1];
      if (c < 0) c += COLS; if (c >= COLS) c -= COLS;
      if (r >= 0 && r < ROWS) out.push(r * COLS + c);
    }
    return out;
  }

  var WM = { fallbackPolys: FALLBACK, COLS: COLS, ROWS: ROWS, hexes: [], byId: {}, CITIES: CITIES, neighbors: neighbors, real: false, decodeTopo: decodeTopo, build: build };
  function apply(polys, caspian, real) { var b = build(polys, caspian); WM.hexes = b.hexes; WM.byId = b.byId; WM.real = !!real; }
  apply(FALLBACK, true, false);

  // Real world map: world-atlas TopoJSON (cached after the first successful download).
  var URLS = ['https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json', 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json'];
  var CKEY = 'sdk_topo2';
  function useTopo(topo, applyNow) {
    try { var polys = decodeTopo(topo); if (polys.length < 60) return false; if (applyNow) apply(polys, false, true); return true; } catch (e) { return false; }
  }
  WM.ready = new Promise(function (resolve) {
    var cached = null; try { cached = JSON.parse(localStorage.getItem(CKEY)); } catch (e) {}
    if (cached && useTopo(cached, true)) { resolve(); return; }
    if (typeof fetch === 'undefined') { resolve(); return; }
    var finished = false, timer = setTimeout(function () { finished = true; resolve(); }, 7000);
    function tryUrl(i) {
      if (i >= URLS.length) { if (!finished) { finished = true; clearTimeout(timer); resolve(); } return; }
      fetch(URLS[i]).then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); }).then(function (topo) {
        if (!useTopo(topo, !finished)) throw new Error('bad');
        try { localStorage.setItem(CKEY, JSON.stringify(topo)); } catch (e) {}
        if (!finished) { finished = true; clearTimeout(timer); resolve(); }
      }).catch(function () { tryUrl(i + 1); });
    }
    tryUrl(0);
  });
  root.WorldMap = WM;
})(typeof window !== 'undefined' ? window : globalThis);
