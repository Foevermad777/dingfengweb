/* 型号检索 / 工况选型 -------------------------------------------------- */
(function (DF) {
  var D = window.DF_DATA;
  if (!D || !D.series) return;            // 没加载水泵数据的页面直接跳过
  var SER = {}; D.series.forEach(function (s) { SER[s.id] = s });


  /* 检索 + 选型排序。q/h 同时给出时按“最小富余量”排序（工程选型逻辑）*/
  DF.search = function (f) {
    var kw = (f.kw || '').trim().toLowerCase().replace(/\s+/g, '');
    var q = f.flow, h = f.head, out = [];
    D.products.forEach(function (p) {
      if (f.series && p.seriesId !== f.series) return;
      if (kw && p.model.toLowerCase().replace(/\s+/g, '').indexOf(kw) < 0) return;
      if (f.volt && String(p.voltage || '').indexOf(f.volt) < 0) return;
      if (f.bore && String(p.bore || '') !== String(f.bore)) return;
      if (f.kwMin != null && !(p.kw >= f.kwMin)) return;
      if (f.kwMax != null && !(p.kw <= f.kwMax)) return;
      var score = 0;
      if (q != null) {
        if (p.flow == null || p.flow < q * 0.95) return;
        score += p.flow / q - 1;
      }
      if (h != null) {
        if (p.head == null || p.head < h * 0.95) return;
        score += p.head / h - 1;
      }
      out.push({ p: p, score: score });
    });
    var sized = (q != null || h != null);
    out.sort(function (a, b) {
      if (sized) return a.score - b.score;
      if (a.p.seriesId !== b.p.seriesId) return 0;
      return (a.p.kw || 0) - (b.p.kw || 0);
    });
    return { rows: out.map(function (x) { return x.p }), sized: sized };
  };

  /* 结果表 */
  DF.table = function (rows, opt) {
    opt = opt || {};
    var show = opt.limit || 60;
    var head = '<div class="tblbox"><div class="tblscroll"><table class="mt"><thead><tr>' +
      '<th>规格型号</th>' + (opt.hideSeries ? '' : '<th>系列</th>') +
      '<th>流量 m³/h</th><th>扬程 m</th><th>功率 kW</th><th>电压 V</th>' +
      '<th>转速 r/min</th><th>口径/配管</th><th>样本页</th><th></th></tr></thead><tbody>';
    var body = rows.slice(0, show).map(function (p) {
      return '<tr><td class="m">' + DF.esc(p.model) + '</td>' +
        (opt.hideSeries ? '' : '<td class="s">' + DF.esc(p.seriesName) + '</td>') +
        '<td class="n">' + DF.cell(p.flow) + '</td>' +
        '<td class="n">' + DF.cell(p.head) + '</td>' +
        '<td class="n">' + DF.cell(p.kw) + '</td>' +
        '<td class="n">' + DF.cell(p.voltage) + '</td>' +
        '<td class="n">' + DF.cell(p.rpm) + '</td>' +
        '<td class="n">' + DF.cell(p.bore) + '</td>' +
        '<td class="s">P' + DF.esc(p.page) + '</td>' +
        '<td><button class="askbtn" data-ask="' + DF.esc(DF.spec(p)) + '">复制型号并询价</button></td></tr>';
    }).join('');
    var foot = '</tbody></table></div>';
    if (rows.length > show) {
      foot += '<div class="more"><button class="btn btn-g" data-more="' + show + '">' +
        '还有 ' + (rows.length - show) + ' 条 · 显示更多</button></div>';
    }
    return head + body + foot + '</div>';
  };

  /* 复制给客户/我们看的一行规格 */
  DF.spec = function (p) {
    var b = [p.model];
    if (p.flow != null) b.push('流量' + p.flow + 'm³/h');
    if (p.head != null) b.push('扬程' + p.head + 'm');
    if (p.kw != null) b.push('功率' + p.kw + 'kW');
    if (p.voltage) b.push(p.voltage + 'V');
    if (p.bore) b.push('口径' + p.bore);
    return b.join(' · ') + '　【' + p.seriesName + '｜上海人民 SRM】';
  };

  /* 系列卡片 */
  DF.seriesCard = function (s, base) {
    base = base || '';
    var pic = s.images[0]
      ? '<img src="' + base + s.images[0] + '" alt="' + DF.esc(s.name) + '" loading="lazy">'
      : '<span class="none">产品图待补<br>门店实拍后替换</span>';
    return '<a class="scard" href="' + base + 'products/series.html?s=' + s.id + '">' +
      '<div class="pic">' + pic + '<span class="n">' + s.count + ' 型号</span></div>' +
      '<div class="bd"><h3>' + DF.esc(s.name) + '</h3>' +
      '<div class="codes">' + DF.esc(s.codes) + '</div>' +
      '<dl><dt>流量</dt><dd>' + DF.rng(s.flow, ' m³/h') + '</dd>' +
      '<dt>扬程</dt><dd>' + DF.rng(s.head, ' m') + '</dd>' +
      '<dt>功率</dt><dd>' + DF.rng(s.kw, ' kW') + '</dd></dl></div></a>';
  };
})(window.DF = window.DF || {});
