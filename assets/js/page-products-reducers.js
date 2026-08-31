/* products/reducers.html 的页面脚本（从内联抽出，以满足 CSP script-src 'self'） */
DF.init('减速机'); DF.foot(); DF.wireAsk();
var RD = window.DF_REDUCERS, S = RD.series;

var allSizes = S.reduce(function (a, s) { return a + s.sizes.length }, 0);
var allRatios = S.reduce(function (a, s) {
  return a + s.sizes.reduce(function (b, z) { return b + z.ratios.length }, 0)
}, 0);
document.getElementById('szN').textContent = allSizes;
document.getElementById('hStats').innerHTML =
  [[allSizes, '四大系列机型'], [allRatios, '可选速比'], [S.length + RD.others.length, '产品系列'], ['96%', '最高效率']]
  .map(function (x) { return '<div class="pstat"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>' }).join('');

/* 四大系列卡片 */
document.getElementById('main').innerHTML = S.map(function (s) {
  var rs = s.sizes.reduce(function (a, z) { return a.concat(z.ratios) }, []);
  return '<div class="rc"><div class="pic">' +
    '<img src="../assets/reducers/' + s.id + '.jpg" alt="' + DF.esc(s.name) + '" loading="lazy">' +
    '<span class="n">' + s.sizes.length + ' 机型</span></div>' +
    '<div class="bd"><h3>' + DF.esc(s.name) + '</h3>' +
    '<div class="en">' + DF.esc(s.en) + ' · 样本 P' + s.page + '</div>' +
    '<p>' + DF.esc(s.lead) + '</p>' +
    '<div class="ratio">速比 ' + Math.min.apply(null, rs) + ' – ' + Math.max.apply(null, rs) + '</div>' +
    '<div class="models">' + s.sizes.map(function (z) {
      return '<span class="mchip">' + z.model + '</span>' }).join('') + '</div></div></div>';
}).join('');

/* 传动比查询 */
var cur = S[0].id;
document.getElementById('rtabs').innerHTML = S.map(function (s) {
  return '<button class="rtab" data-s="' + s.id + '" aria-pressed="' + (s.id === cur) + '">' +
    s.id.toUpperCase() + ' 系列</button>';
}).join('');
function paintRatios() {
  var s = S.filter(function (x) { return x.id === cur })[0];
  document.getElementById('rTitle').textContent = s.name.replace(/系列.*/, '系列') + '实际传动比';
  document.getElementById('rbody').innerHTML = s.sizes.map(function (z) {
    var hi = z.high || [], ns = (z.nonstd || []).concat(z.special || []);
    return '<div class="rrow"><div class="mm">' + z.model +
      '<small>' + z.ratios.length + ' 档速比</small></div><div class="rats">' +
      z.ratios.map(function (r) {
        var cls = 'rat' + (hi.indexOf(r) > -1 ? ' hi' : '') + (ns.indexOf(r) > -1 ? ' ns' : '');
        var spec = z.model + ' 速比 ' + r + '　【' + s.name + '｜华德曼】';
        return '<span class="' + cls + '" data-ask="' + DF.esc(spec) + '">' +
          (hi.indexOf(r) > -1 ? '△' : '') + r + '</span>';
      }).join('') + '</div></div>';
  }).join('');
}
document.getElementById('rtabs').addEventListener('click', function (e) {
  var b = e.target.closest('.rtab'); if (!b) return;
  cur = b.dataset.s;
  [].forEach.call(this.children, function (x) { x.setAttribute('aria-pressed', String(x === b)) });
  paintRatios();
});
paintRatios();

/* 其他系列 */
document.getElementById('others').innerHTML = RD.others.map(function (o) {
  var img = o.id === 't' ? '<img src="../assets/reducers/t.jpg" alt="' + DF.esc(o.name) + '" loading="lazy">'
    : '<span class="none">产品图待补<br>门店实拍后替换</span>';
  return '<div class="rc"><div class="pic">' + img +
    '<span class="n">样本 P' + o.page + '</span></div>' +
    '<div class="bd"><h3>' + DF.esc(o.name) + '</h3>' +
    '<div class="en">' + DF.esc(o.en) + '</div>' +
    '<p>' + DF.esc(o.lead) + '</p>' +
    '<div class="models" style="border:none;padding-top:6px">' +
    '<span class="chip soon">型号明细待补 · 可电话询价</span></div></div></div>';
}).join('');

/* 选型 */
document.getElementById('pick').innerHTML = '<b style="color:var(--blue-ink)">选型公式　</b>' + DF.esc(RD.meta.pick);
document.getElementById('asks').innerHTML = ['配多大功率的电机 kW', '速比 i（或输入 / 输出转速）',
  '需要的输出扭矩 N·m', '输出轴形式：实心轴 / 空心轴 / 带键',
  '安装方式：卧式 / 立式 / 法兰 / 底脚', '机型号（如 R87、K107、NMRV63）',
  '是否要连电机做一体机', '用在什么设备、每天开多久、有没有冲击']
  .map(function (t, i) { return '<div class="use"><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + t + '</span></div>' }).join('');
document.getElementById('brandWrap').innerHTML = ((window.DF_BRANDS || {}).reducers || [])
  .map(function (b) { return '<div class="brand-c"><b>' + DF.esc(b.name) + '</b><span>' + DF.esc(b.note || '') + '</span></div>' }).join('')
  || '<div class="brand-c"><b>品牌清单待补</b><span>填 data/brands.js 即可显示</span></div>';
document.getElementById('types').innerHTML = ((window.DF_TYPES || {}).reducers || [])
  .map(function (t) { return '<div class="brand-c"><b>' + t[0] + '</b><span>' + t[1] + '</span></div>' }).join('');
