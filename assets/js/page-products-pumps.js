/* products/pumps.html 的页面脚本（从内联抽出，以满足 CSP script-src 'self'） */
DF.init('水泵');
DF.foot();
DF.wireAsk();
var D = window.DF_DATA;

/* 页头统计 */
document.getElementById('tN').textContent = D.products.length;
function span(k, u) {
  var v = D.products.map(function (p) { return p[k] }).filter(function (x) { return x != null });
  return v.length ? Math.min.apply(null, v) + '–' + Math.max.apply(null, v) : '—';
}
document.getElementById('s1').textContent = span('flow');
document.getElementById('s2').textContent = span('head');
document.getElementById('s3').textContent = span('kw');

/* 下拉选项 */
var fs = document.getElementById('fs');
D.series.forEach(function (s) {
  fs.insertAdjacentHTML('beforeend', '<option value="' + s.id + '">' + s.name + '（' + s.count + '）</option>');
});
var fb = document.getElementById('fb');
var bores = {};
D.products.forEach(function (p) { if (p.bore) bores[p.bore] = (bores[p.bore] || 0) + 1 });
Object.keys(bores).sort(function (a, b) {
  var na = parseFloat(a), nb = parseFloat(b);
  if (!isNaN(na) && !isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b));
}).forEach(function (k) {
  fb.insertAdjacentHTML('beforeend', '<option value="' + DF.esc(k) + '">' + DF.esc(k) + '（' + bores[k] + '）</option>');
});

/* 系列卡片 */
document.getElementById('sgrid').innerHTML =
  D.series.map(function (s) { return DF.seriesCard(s, '../') }).join('')
    .replace(/href="\.\.\/products\//g, 'href="');

/* 检索 */
var res = document.getElementById('res'), browse = document.getElementById('browse');
var limit = 60, last = null;
function val(id) { var v = document.getElementById(id).value.trim(); return v === '' ? null : parseFloat(v) }
function collect() {
  return {
    flow: val('fq'), head: val('fh'), kwMin: val('fkw1'), kwMax: val('fkw2'),
    volt: document.getElementById('fv').value, bore: document.getElementById('fb').value,
    series: document.getElementById('fs').value, kw: document.getElementById('fk').value
  };
}
function active(f) {
  return f.flow != null || f.head != null || f.kwMin != null || f.kwMax != null ||
    f.volt || f.bore || f.series || (f.kw && f.kw.trim());
}
function run(scroll) {
  var f = collect();
  if (!active(f)) { res.innerHTML = ''; browse.style.display = ''; return; }
  var r = DF.search(f); last = r; limit = 60;
  browse.style.display = 'none';
  paint(r, f);
  if (scroll) res.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function paint(r, f) {
  var why = r.sized
    ? '按「刚好够用、富余最小」排序' + (f.flow != null ? '，流量 ≥ ' + f.flow : '') + (f.head != null ? '，扬程 ≥ ' + f.head : '')
    : '按条件筛选';
  var h = '<div class="res-h"><h2>可选型号</h2>' +
    '<span class="cnt">' + r.rows.length + ' 条 · ' + why + '</span>' +
    '<button class="btn btn-g clr" id="back">← 返回系列浏览</button></div>';
  h += r.rows.length
    ? DF.table(r.rows, { limit: limit })
    : '<div class="tblbox"><div class="nores"><b>这个工况没有直接匹配的型号</b>' +
      '放宽一点条件试试，或者直接打 13690528818，我们从别的系列里给你配。</div></div>';
  res.innerHTML = h;
}
document.getElementById('fgo').addEventListener('click', function () { run(true) });
document.getElementById('fclr').addEventListener('click', function () {
  ['fq', 'fh', 'fkw1', 'fkw2', 'fk'].forEach(function (i) { document.getElementById(i).value = '' });
  ['fv', 'fb', 'fs'].forEach(function (i) { document.getElementById(i).value = '' });
  res.innerHTML = ''; browse.style.display = '';
});
['fv', 'fb', 'fs'].forEach(function (i) {
  document.getElementById(i).addEventListener('change', function () { run(false) });
});
document.getElementById('fk').addEventListener('input', function () { run(false) });
document.getElementById('finder').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') { e.preventDefault(); run(true) }
});
document.querySelectorAll('[data-q]').forEach(function (c) {
  c.addEventListener('click', function () {
    document.getElementById('fq').value = c.dataset.q;
    document.getElementById('fh').value = c.dataset.h;
    run(true);
  });
});
res.addEventListener('click', function (e) {
  if (e.target.closest('#back')) {
    res.innerHTML = ''; browse.style.display = '';
    document.getElementById('fclr').click();
    return;
  }
  if (e.target.closest('[data-more]')) { limit += 100; paint(last, collect()); }
});

/* 支持 ?s=xxx 直接进系列，?q=&h= 直接选型 */
var Q = new URLSearchParams(location.search);
if (Q.get('s')) { document.getElementById('fs').value = Q.get('s'); }
if (Q.get('q')) { document.getElementById('fq').value = Q.get('q'); }
if (Q.get('h')) { document.getElementById('fh').value = Q.get('h'); }
if (Q.get('s') || Q.get('q') || Q.get('h')) run(false);
