/* index.html 的页面脚本（从内联抽出，以满足 CSP script-src 'self'） */
DF.init('首页');
document.getElementById('yr').textContent = new Date().getFullYear();

var D = window.DF_DATA;
var nMotor = (window.DF_MOTORS ? DF_MOTORS.rows.length : 0);
var nRed = (window.DF_REDUCERS ? DF_REDUCERS.series.reduce(function(a,s){return a+s.sizes.length},0) : 0);
document.getElementById('fN').textContent = D.products.length + nMotor;
document.getElementById('pN').textContent = D.products.length;
document.getElementById('mN').textContent = nMotor;
document.getElementById('rN').textContent = nRed;

/* 主推系列 —— 先按用量最大的四个系列做样例，改这一行即可换 */
var HOT = ['wq-sewage', 'rm-centrifugal', 'deepwell', 'stainless'];
var hot = document.getElementById('hot');
hot.innerHTML = HOT.map(function (id) {
  var s = D.series.filter(function (x) { return x.id === id })[0];
  if (!s) return '';
  var pic = s.images[0]
    ? '<img src="' + s.images[0] + '" alt="' + s.name + '" loading="lazy">'
    : '<span class="none">产品图待补</span>';
  return '<a class="hcard" href="products/series.html?s=' + s.id + '">' +
    '<div class="pic">' + pic + '<span class="n">' + s.count + ' 型号</span></div>' +
    '<div class="bd"><h3>' + s.name + '</h3>' +
    '<div class="codes">' + s.codes + '</div>' +
    '<dl><dt>流量</dt><dd>' + DF.rng(s.flow, ' m³/h') + '</dd>' +
    '<dt>扬程</dt><dd>' + DF.rng(s.head, ' m') + '</dd>' +
    '<dt>功率</dt><dd>' + DF.rng(s.kw, ' kW') + '</dd></dl></div></a>';
}).join('');

/* 斜切悬停 */
var split = document.getElementById('split');
var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
if (fine) {
  split.querySelectorAll('.wedge').forEach(function (w) {
    w.addEventListener('mouseenter', function () { split.dataset.h = w.dataset.i });
    w.addEventListener('focus', function () { split.dataset.h = w.dataset.i });
  });
  split.addEventListener('mouseleave', function () { delete split.dataset.h });
}

/* 翻页控制：一次手势 = 一屏，定时定距，不跟惯性走 */
var deck = document.getElementById('deck'), dots = document.getElementById('dots');
var btns = [].slice.call(dots.querySelectorAll('button'));
var screens = ['sc1', 'sc2', 'sc3', 'sc4'].map(function (i) { return document.getElementById(i) });
var cur = 0, busy = false, guard = false, guardT = 0, acc = 0, accT = 0;
var guardEnd = 0, lastT = -1e9, lastMag = 0;
var DUR = 560, WHEEL = 45, SWIPE = 58;
var QUIET = 90, MAXHOLD = 2500, GAP = 120, MINPUSH = 40;

var paged = window.matchMedia('(min-height:521px)');
var wasOn = null, wasH = 0;
function sync() {
  var on = paged.matches, h = deck.clientHeight;
  if (on === wasOn && h === wasH) return;
  wasOn = on; wasH = h;
  deck.classList.toggle('paged', on);
  if (!on) {                      /* 退出翻页模式：交还原生滚动，清掉所有锁 */
    if (raf) { cancelAnimationFrame(raf); raf = 0 }
    busy = false; guard = false; acc = 0; clearTimeout(guardT);
  } else if (h) {                 /* 进入/恢复翻页模式：就近落到整屏 */
    var i = Math.max(0, Math.min(screens.length - 1, Math.round(deck.scrollTop / h)));
    deck.scrollTop = screens[i].offsetTop; mark(i);
  }
}
sync();
(paged.addEventListener ? paged.addEventListener('change', sync) : paged.addListener(sync));
window.addEventListener('resize', sync);   /* 旋转屏幕 / 拉窗口高度时同步，别只等 mq */
window.addEventListener('orientationchange', sync);

function mark(i) {
  cur = i;
  btns.forEach(function (b, j) { b.setAttribute('aria-current', String(j === i)) });
  dots.classList.toggle('dark', i === 2);
  document.querySelector('.nav').classList.toggle('solid', i > 0);
}
mark(0);

/* easeInOutCubic —— 起步果断、落位稳，不拖尾 */
function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }

var raf = 0, dest = 0, slow = window.matchMedia('(prefers-reduced-motion:reduce)');
function land() {          /* 落位：无论动画走完还是被打断，都停在整屏上 */
  if (raf) { cancelAnimationFrame(raf); raf = 0 }
  deck.scrollTop = screens[dest].offsetTop;
  busy = false; acc = 0; arm();
}
function go(i, force) {
  i = Math.max(0, Math.min(screens.length - 1, i));
  if (!paged.matches || i === cur) return;
  if (busy) { if (!force) return; cancelAnimationFrame(raf); raf = 0; }
  var from = deck.scrollTop, d = screens[i].offsetTop - from;
  dest = i; mark(i);
  if (!d) { busy = false; return; }
  if (slow.matches || document.hidden) { land(); return; }
  busy = true;
  var t0 = null;
  raf = requestAnimationFrame(function step(t) {
    if (document.hidden) { land(); return }
    if (t0 === null) t0 = t;
    var k = Math.min(1, (t - t0) / DUR);
    deck.scrollTop = from + d * ease(k);
    if (k < 1) raf = requestAnimationFrame(step); else { raf = 0; land() }
  });
}
/* 切走标签页时 rAF 会停摆，回来时直接落位，避免卡在半屏 */
document.addEventListener('visibilitychange', function () { if (busy) land() });
/* 换页落位后设一道静默闸：只拦惯性余波，不拦真手势。
   余波的特征是「连续 + 只衰减」，凡不符合的都当成新手势立刻放行 */
function arm() {
  guard = true; guardEnd = performance.now() + MAXHOLD;
  clearTimeout(guardT); guardT = setTimeout(release, QUIET);
}
function release() { guard = false; acc = 0; clearTimeout(guardT); }
function coast(ts, mag, gap, prev) {
  if (gap > GAP) return false;                    /* 中间有停顿 —— 新手势 */
  if (mag > prev * 1.15 + 4) return false;        /* 力度回升 —— 又推了一把 */
  if (mag >= prev && mag >= MINPUSH) return false;/* 力度不衰减 —— 滚轮在持续输入 */
  if (ts >= guardEnd) return false;               /* 兜底，闸门不会无限期挂着 */
  return true;
}
/* 屏内还有可滚内容时（如主推系列），让内层先滚 */
function inner(e, dy) {
  for (var n = e.target; n && n !== deck; n = n.parentElement) {
    if (n.scrollHeight - n.clientHeight > 2 && getComputedStyle(n).overflowY !== 'visible') {
      if (dy > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
      if (dy < 0 && n.scrollTop > 1) return true;
    }
  }
  return false;
}

deck.addEventListener('wheel', function (e) {
  if (!paged.matches) return;
  var dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
  if (inner(e, dy)) return;
  e.preventDefault();
  var ts = e.timeStamp, mag = Math.abs(dy), gap = ts - lastT, prev = lastMag;
  lastT = ts; lastMag = mag;                      /* 动画期间也要记，落位后好做比较 */
  if (busy) return;
  if (guard) {
    if (coast(ts, mag, gap, prev)) {
      clearTimeout(guardT); guardT = setTimeout(release, QUIET); return;
    }
    release();
  }
  if (ts - accT > 220) acc = 0;
  accT = ts;
  acc += dy;
  if (Math.abs(acc) >= WHEEL) { var d = acc > 0 ? 1 : -1; acc = 0; go(cur + d); }
}, { passive: false });

var ty = 0, tmoved = 0, tactive = false;
deck.addEventListener('touchstart', function (e) {
  if (!paged.matches || e.touches.length > 1) return;
  ty = e.touches[0].clientY; tmoved = 0; tactive = !busy;
}, { passive: true });
deck.addEventListener('touchmove', function (e) {
  if (!paged.matches || !tactive) return;
  tmoved = ty - e.touches[0].clientY;
  if (inner(e, tmoved)) { tactive = false; return; }
  e.preventDefault();
}, { passive: false });
deck.addEventListener('touchend', function () {
  if (!tactive) return;
  tactive = false;
  if (Math.abs(tmoved) >= SWIPE) go(cur + (tmoved > 0 ? 1 : -1));
});

document.addEventListener('keydown', function (e) {
  if (!paged.matches || e.target.closest('input,textarea,select')) return;
  var k = e.key;
  if (k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(cur + 1) }
  else if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); go(cur - 1) }
  else if (k === 'Home') { e.preventDefault(); go(0) }
  else if (k === 'End') { e.preventDefault(); go(screens.length - 1) }
});

btns.forEach(function (b, j) { b.addEventListener('click', function () { go(j, true) }) });
