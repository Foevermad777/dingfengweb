/* products/series.html 的页面脚本（从内联抽出，以满足 CSP script-src 'self'） */
DF.init('水泵');
DF.foot();
DF.wireAsk();
var D = window.DF_DATA, C = window.DF_COPY;
var id = new URLSearchParams(location.search).get('s') || D.series[0].id;
var S = D.series.filter(function (x) { return x.id === id })[0] || D.series[0];
var K = C[S.id] || { tag: '', lead: '', uses: [], pick: '' };

document.title = S.name + ' · 上海人民 SRM 全型号参数 | 鼎烽机电商行';
document.getElementById('cbName').textContent = S.name;
document.getElementById('hName').textContent = S.name;

document.getElementById('hTags').innerHTML =
  '<span class="chip rust">上海人民 SRM · 广佛总代理</span>' +
  (K.tag ? '<span class="chip">' + DF.esc(K.tag) + '</span>' : '') +
  '<span class="chip">' + S.count + ' 个型号</span>' +
  '<span class="chip">样本 P' + S.pageFrom + '–' + S.pageTo + '</span>' +
  '<span class="chip">' + DF.esc(S.codes) + '</span>';

document.getElementById('hStats').innerHTML =
  [['流量', DF.rng(S.flow, ''), 'm³/h'], ['扬程', DF.rng(S.head, ''), 'm'],
   ['功率', DF.rng(S.kw, ''), 'kW'], ['子系列', S.subs.length, '个']]
  .filter(function (x) { return x[1] !== '—' })
  .map(function (x) {
    return '<div class="pstat"><b>' + x[1] + '</b><span>' + x[0] + ' ' + x[2] + '</span></div>';
  }).join('');

document.getElementById('lead').textContent = K.lead;
document.getElementById('uses').innerHTML = (K.uses || []).map(function (u, i) {
  return '<div class="use"><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + DF.esc(u) + '</span></div>';
}).join('');
document.getElementById('pick').innerHTML = K.pick
  ? '<b>选型要点　</b>' + DF.esc(K.pick) : '<b>选型要点　</b>拿不准直接打 13690528818，报工况我们帮你定。';

/* 图廊 */
var big = document.getElementById('galBig'), th = document.getElementById('galThumbs');
function showPic(i) {
  big.innerHTML = S.images.length
    ? '<img src="../' + S.images[i] + '" alt="' + DF.esc(S.name) + '">'
    : '<span class="none">这个系列的产品图待补<br>门店实拍后放进 assets/ 即可</span>';
  [].forEach.call(th.children, function (b, j) { b.setAttribute('aria-current', String(j === i)) });
}
th.innerHTML = S.images.length > 1 ? S.images.map(function (f) {
  return '<button type="button"><img src="../' + f + '" alt=""></button>';
}).join('') : '';
th.addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (b) showPic([].indexOf.call(th.children, b));
});
showPic(0);

/* 子系列 + 参数表 */
var tables = D.tables.filter(function (t) { return t.seriesId === S.id });
var byTitle = {};
tables.forEach(function (t) { (byTitle[t.title] = byTitle[t.title] || []).push(t) });

document.getElementById('subs').innerHTML = Object.keys(byTitle).map(function (title, i) {
  var ts = byTitle[title];
  var n = ts.reduce(function (a, t) { return a + t.rows.length }, 0);
  var pages = ts.map(function (t) { return 'P' + t.page }).join(' ');
  var body = ts.map(function (t) {
    var h = '<div class="tblscroll"><table class="mt"><thead><tr>' +
      t.cols.map(function (c) { return '<th>' + DF.esc(c) + '</th>' }).join('') +
      '<th></th></tr></thead><tbody>';
    h += t.rows.map(function (r) {
      var mi = t.cols.findIndex(function (c) { return /规格型号|^型号$|消防泵组型号/.test(c) });
      var model = mi >= 0 ? r[mi] : '';
      var line = t.cols.map(function (c, k) {
        return (r[k] === undefined || r[k] === null || r[k] === '') ? null : c + ' ' + r[k];
      }).filter(Boolean).join(' · ');
      return '<tr>' + t.cols.map(function (c, k) {
        var v = r[k], cls = (typeof v === 'number') ? 'n' : (k === mi ? 'm' : '');
        return '<td class="' + cls + '">' + DF.cell(v) + '</td>';
      }).join('') +
        (model ? '<td><button class="askbtn" data-ask="' + DF.esc(line + '　【' + S.name + '｜上海人民 SRM】') + '">复制并询价</button></td>' : '<td></td>') +
        '</tr>';
    }).join('');
    h += '</tbody></table></div>';
    if (t.subtitle) h = '<div class="srem"><b>' + DF.esc(t.subtitle) + '</b></div>' + h;
    if (t.remark) h += '<div class="srem"><b>样本原注　</b>' + DF.esc(t.remark) + '</div>';
    if (t.note) h += '<div class="snote"><b>存疑 · 已照原样本录入　</b>' + DF.esc(t.note) + '</div>';
    return h;
  }).join('');
  return '<details class="subitem"' + (i === 0 ? ' open' : '') + '>' +
    '<summary class="subitem-h"><span class="st">' + DF.esc(title) + '</span>' +
    '<span class="sn">' + n + ' 型号 · 样本 ' + pages + '</span>' +
    '<svg class="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<path d="M6 9l6 6 6-6"/></svg></summary>' +
    '<div class="subitem-b">' + body + '</div></details>';
}).join('');

document.getElementById('openAll').addEventListener('click', function () {
  var ds = document.querySelectorAll('#subs details');
  var anyClosed = [].some.call(ds, function (d) { return !d.open });
  [].forEach.call(ds, function (d) { d.open = anyClosed });
  this.textContent = anyClosed ? '全部收起' : '全部展开';
});
document.getElementById('filterLink').href = 'pumps.html?s=' + S.id;

/* 其他系列 */
document.getElementById('others').innerHTML = D.series
  .filter(function (x) { return x.id !== S.id }).slice(0, 4)
  .map(function (s) { return DF.seriesCard(s, '../').replace('href="../products/', 'href="') })
  .join('');
