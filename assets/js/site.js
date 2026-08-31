/* 鼎烽机电商行 · 共用脚本 --------------------------------------------- */
window.DF = window.DF || {};
DF.TEL = '13690528818';
DF.ADDR = '佛山市南海区黄岐广佛五金城 9 号馆 20-21 号';
DF.NAME = '佛山市南海区鼎烽机电商行';

/* 顶栏 --------------------------------------------------------------- */
DF.nav = function (active) {
  var base = location.pathname.indexOf('/products/') > -1 ? '../' : '';
  var PROD = [['products/motors.html', '电机'],
              ['products/pumps.html', '水泵'],
              ['products/reducers.html', '减速机']];
  var inProd = PROD.some(function (x) { return x[1] === active });

  var h = '<a class="brand" href="' + base + 'index.html">' +
    '<span class="bname">鼎烽机电商行<i>DINGFENG</i></span>' +
    '<span class="bsub">上海人企集团 · 广佛总代理</span></a>' +
    '<button class="nburger" aria-label="菜单" aria-expanded="false">☰</button>' +
    '<nav class="nlinks">';

  h += '<a href="' + base + 'index.html"' + (active === '首页' ? ' aria-current="page"' : '') + '>首页</a>';

  h += '<div class="ndrop"><button class="ndtrig" aria-expanded="false" aria-haspopup="true"' +
       (inProd ? ' aria-current="page"' : '') + '>产品<svg viewBox="0 0 10 6" aria-hidden="true">' +
       '<path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" ' +
       'stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="nmenu">';
  PROD.forEach(function (x) {
    h += '<a href="' + base + x[0] + '"' + (x[1] === active ? ' aria-current="page"' : '') +
         '>' + x[1] + '</a>';
  });
  h += '</div></div>';

  [['guide.html', '选型知识'], ['about.html', '关于鼎烽'], ['contact.html', '联系我们']]
    .forEach(function (x) {
      h += '<a href="' + base + x[0] + '"' + (x[1] === active ? ' aria-current="page"' : '') +
           '>' + x[1] + '</a>';
    });
  h += '</nav>';

  var n = document.createElement('header');
  n.className = 'nav'; n.innerHTML = h;
  document.body.prepend(n);

  var b = n.querySelector('.nburger'), m = n.querySelector('.nlinks');
  b.addEventListener('click', function () {
    var o = m.classList.toggle('open');
    b.setAttribute('aria-expanded', String(o));
  });

  /* 产品下拉：桌面 hover（CSS）+ 键盘/触屏点击 */
  var dd = n.querySelector('.ndrop'), tg = n.querySelector('.ndtrig');
  tg.addEventListener('click', function (e) {
    e.stopPropagation();
    var o = dd.classList.toggle('open');
    tg.setAttribute('aria-expanded', String(o));
  });
  document.addEventListener('click', function (e) {
    if (!dd.contains(e.target)) { dd.classList.remove('open'); tg.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { dd.classList.remove('open'); tg.setAttribute('aria-expanded', 'false'); }
  });
};

/* 页脚 */
DF.foot = function () {
  var base = location.pathname.indexOf('/products/') > -1 ? '../' : '';
  var f = document.createElement('footer');
  f.className = 'foot';
  f.innerHTML = '<div class="wrap"><div class="foot-g">' +
    '<div><div class="fbrand">' + DF.NAME + '</div>' +
    '<div class="fline">深耕机电行业 20 年<br>上海人民企业集团（SRM 人企）广佛总代理<br>' +
    '主营 水泵 · 电机 · 减速机</div></div>' +
    '<div><h4>产品中心</h4><ul>' +
    '<li><a href="' + base + 'products/pumps.html">水泵</a></li>' +
    '<li><a href="' + base + 'products/motors.html">电机</a></li>' +
    '<li><a href="' + base + 'products/reducers.html">减速机</a></li>' +
    '<li><a href="' + base + 'guide.html">选型知识 / 常见问题</a></li></ul></div>' +
    '<div><h4>联系我们</h4><ul>' +
    '<li class="fline"><a href="tel:' + DF.TEL + '">' + DF.TEL + '</a></li>' +
    '<li>' + DF.ADDR + '</li>' +
    '<li><a href="#" data-wechat>微信扫码咨询</a></li>' +
    '<li><a href="' + base + 'contact.html">门店地址与营业时间</a></li></ul></div>' +
    '</div><div class="foot-b"><span>© ' + new Date().getFullYear() + ' ' + DF.NAME + '</span>' +
    '<span><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener nofollow">粤ICP备2026105272号</a></span>' +
    '<span>产品参数以实物为准</span></div></div>';
  document.body.appendChild(f);
};

/* 微信弹层 */
DF.modal = function () {
  var d = document.createElement('div');
  d.className = 'modal'; d.id = 'wechatModal';
  d.innerHTML = '<div class="modal-c" role="dialog" aria-modal="true" aria-label="联系鼎烽">' +
    '<button class="modal-x" aria-label="关闭">×</button>' +
    '<h3>直接联系我们</h3><p>报型号、说工况，当场给方案和价格</p>' +
    '<div class="qr" id="dfQr">微信二维码<br>待门店提供后放在<br>assets/wechat.png</div>' +
    '<a class="tel" href="tel:' + DF.TEL + '">' + DF.TEL + '</a>' +
    '<p style="margin:0">' + DF.ADDR + '</p></div>';
  document.body.appendChild(d);
  var img = new Image();
  img.onload = function () { var q = document.getElementById('dfQr'); q.innerHTML = ''; q.appendChild(img); };
  img.alt = '鼎烽机电微信二维码';
  img.src = (location.pathname.indexOf('/products/') > -1 ? '../' : '') + 'assets/wechat.png';
  function close() { d.classList.remove('open'); }
  d.addEventListener('click', function (e) { if (e.target === d) close(); });
  d.querySelector('.modal-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-wechat]');
    if (t) { e.preventDefault(); d.classList.add('open'); }
  });
};

/* 型号一键复制 */
DF.copyable = function (root) {
  (root || document).addEventListener('click', function (e) {
    var b = e.target.closest('.copy'); if (!b) return;
    var txt = b.dataset.copy || b.textContent.trim();
    var done = function () {
      var old = b.innerHTML;
      b.classList.add('done'); b.innerHTML = '已复制 ✓';
      setTimeout(function () { b.classList.remove('done'); b.innerHTML = old; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function () { fallback(txt, done); });
    } else fallback(txt, done);
  });
  function fallback(t, cb) {
    var a = document.createElement('textarea');
    a.value = t; a.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); cb(); } catch (err) { }
    document.body.removeChild(a);
  }
};


/* 通用工具 */
DF.esc = function (t) {
  return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
};
DF.cell = function (v) { return (v === null || v === undefined || v === '') ? '—' : DF.esc(v) };

/* 「复制型号并询价」：写剪贴板 + 弹微信/电话 */
DF.wireAsk = function (root) {
  (root || document).addEventListener('click', function (e) {
    var b = e.target.closest('[data-ask]'); if (!b) return;
    var txt = b.dataset.ask;
    var ok = function () {
      var old = b.textContent;
      b.textContent = '已复制 ✓ 正在打开…';
      setTimeout(function () {
        b.textContent = old;
        var m = document.getElementById('wechatModal');
        if (m) m.classList.add('open');
      }, 480);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok, ok);
    } else {
      var a = document.createElement('textarea');
      a.value = txt; a.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(a); a.select();
      try { document.execCommand('copy') } catch (x) { }
      document.body.removeChild(a); ok();
    }
  });
};

DF.init = function (active) { DF.nav(active); DF.modal(); DF.copyable(); };
DF.num = function (v) { return v === null || v === undefined ? '—' : String(v); };
DF.rng = function (r, u) { return !r ? '—' : (r[0] === r[1] ? r[0] + u : r[0] + '–' + r[1] + u); };
