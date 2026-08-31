/* products/motors.html 的页面脚本（从内联抽出，以满足 CSP script-src 'self'） */
DF.init('电机'); DF.foot();
var M = window.DF_MOTORS, R = M.rows;
document.getElementById('tN').textContent = R.length;

document.getElementById('hStats').innerHTML =
  [['功率范围', Math.min.apply(null,R.map(r=>r.kw)) + '–' + Math.max.apply(null,R.map(r=>r.kw)), 'kW'],
   ['机座号', '63–355', ''],
   ['极数', '2 / 4 / 6 / 8 / 10', '极'],
   ['型号', R.length, '个']]
  .map(x => '<div class="pstat"><b>' + x[1] + '</b><span>' + x[0] + (x[2] ? ' ' + x[2] : '') + '</span></div>').join('');

var frames = [];
R.forEach(function (r) { if (r.frame && frames.indexOf(r.frame) < 0) frames.push(r.frame) });
frames.sort(function (a, b) { return a - b });
var ffr = document.getElementById('ffr');
frames.forEach(function (f) {
  var n = R.filter(function (r) { return r.frame === f }).length;
  ffr.insertAdjacentHTML('beforeend', '<option value="' + f + '">' + f + ' 机座（' + n + '）</option>');
});

document.getElementById('brandWrap').innerHTML = ((window.DF_BRANDS || {}).motors || [])
  .map(function (b) { return '<div class="brand-c"><b>' + DF.esc(b.name) + '</b><span>' + DF.esc(b.note || '') + '</span></div>' }).join('')
  || '<div class="brand-c"><b>品牌清单待补</b><span>填 data/brands.js 即可显示</span></div>';
document.getElementById('types').innerHTML = ((window.DF_TYPES || {}).motors || [])
  .map(function (t) { return '<div class="brand-c"><b>' + t[0] + '</b><span>' + t[1] + '</span></div>' }).join('');
document.getElementById('asks').innerHTML = ['功率 kW', '转速 / 极数（2极 4极 6极）', '电压 220V 还是 380V',
  '机座号或轴径', '安装方式：卧式底脚 B3 / 立式法兰 B5 / B35', '使用环境：普通 / 户外 / 防爆 / 高温',
  '要不要变频、要不要刹车', '用在什么设备上']
  .map(function (t, i) { return '<div class="use"><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + t + '</span></div>' }).join('');

/* 检索 */
var pole = '', limit = 80, res = document.getElementById('res');
function val(id) { var v = document.getElementById(id).value.trim(); return v === '' ? null : parseFloat(v) }
function run() {
  var lo = val('fkw1'), hi = val('fkw2'), fr = document.getElementById('ffr').value;
  var kw = document.getElementById('fk').value.trim().toLowerCase().replace(/\s+/g, '');
  var rows = R.filter(function (r) {
    if (pole && String(r.poles) !== pole) return false;
    if (lo != null && !(r.kw >= lo)) return false;
    if (hi != null && !(r.kw <= hi)) return false;
    if (fr && r.frame !== fr) return false;
    if (kw && r.model.toLowerCase().replace(/\s+/g, '').indexOf(kw) < 0) return false;
    return true;
  }).sort(function (a, b) { return a.poles - b.poles || a.kw - b.kw });
  paint(rows);
}
function paint(rows) {
  var note = rows.some(function (r) { return r.note });
  var h = '<div class="res-h"><h2>型号参数</h2><span class="cnt">' + rows.length + ' 条</span></div>';
  if (!rows.length) {
    res.innerHTML = h + '<div class="tblbox"><div class="nores"><b>没有匹配的型号</b>' +
      '放宽条件试试，或直接打 13690528818，非标规格也能代订。</div></div>';
    return;
  }
  h += '<div class="tblbox"><div class="tblscroll"><table class="mt"><thead><tr>' +
    '<th>规格型号</th><th>功率 kW</th><th>电流 A</th><th>转速 r/min</th><th>极数</th>' +
    '<th>效率 %</th><th>功率因数</th><th>额定转矩 N·m</th>' +
    '<th>堵转转矩 Tst/TN</th><th>堵转电流 Ist/IN</th><th>最大转矩 Tmax/TN</th><th>噪声 dB(A)</th><th></th>' +
    '</tr></thead><tbody>';
  h += rows.slice(0, limit).map(function (r) {
    var spec = r.model + ' · ' + r.kw + 'kW · ' + r.rpm + 'r/min · ' + r.poles + '极 · ' +
      r.amp + 'A · 380V　【YE3 三相异步电动机 IE3】';
    return '<tr><td class="m">' + DF.esc(r.model) + (r.note ? ' <span class="chip rust" style="font-size:10px;padding:1px 6px">存疑</span>' : '') + '</td>' +
      '<td class="n">' + r.kw + '</td><td class="n">' + r.amp + '</td><td class="n">' + r.rpm + '</td>' +
      '<td class="n">' + r.poles + '</td><td class="n">' + r.eff + '</td><td class="n">' + r.pf + '</td>' +
      '<td class="n">' + r.nm + '</td><td class="n">' + r.tst + '</td><td class="n">' + r.ist + '</td>' +
      '<td class="n">' + r.tmax + '</td><td class="n">' + r.db + '</td>' +
      '<td><button class="askbtn" data-ask="' + DF.esc(spec) + '">复制型号并询价</button></td></tr>';
  }).join('');
  h += '</tbody></table></div>';
  if (rows.length > limit) h += '<div class="more"><button class="btn btn-g" id="more">还有 ' +
    (rows.length - limit) + ' 条 · 显示更多</button></div>';
  h += '</div>';
  if (note) h += '<p class="fnote" style="margin-top:10px"><b>标「存疑」的型号：</b>' +
    '厂家样本上这几个型号中间有一个字符印缺了（YE3-355 系列），我们照原样本录入未作猜测。' +
    '要订这几个规格请电话确认准确型号。</p>';
  res.innerHTML = h;
}
document.getElementById('poles').addEventListener('click', function (e) {
  var b = e.target.closest('.pbtn'); if (!b) return;
  pole = b.dataset.p; limit = 80;
  [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', String(x === b)) });
  run();
});
['fkw1', 'fkw2', 'fk'].forEach(function (i) {
  document.getElementById(i).addEventListener('input', function () { limit = 80; run() });
});
document.getElementById('ffr').addEventListener('change', function () { limit = 80; run() });
document.getElementById('fclr').addEventListener('click', function () {
  ['fkw1', 'fkw2', 'fk'].forEach(function (i) { document.getElementById(i).value = '' });
  document.getElementById('ffr').value = ''; pole = ''; limit = 80;
  [].forEach.call(document.getElementById('poles').children, function (x, j) {
    x.setAttribute('aria-pressed', String(j === 0));
  });
  run();
});
res.addEventListener('click', function (e) { if (e.target.closest('#more')) { limit += 120; run(); } });
DF.wireAsk();
run();
