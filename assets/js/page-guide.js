/* guide.html 的页面脚本（从内联抽出，以满足 CSP script-src 'self'） */
DF.init('选型知识');
DF.foot();
var links = [].slice.call(document.querySelectorAll('#toc a'));
var arts = links.map(function (a) { return document.querySelector(a.getAttribute('href')) });
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (e.intersectionRatio > 0) {
      var i = arts.indexOf(e.target);
      links.forEach(function (a, j) { a.classList.toggle('on', j === i) });
    }
  });
}, { rootMargin: '-80px 0px -70% 0px' });
arts.forEach(function (a) { io.observe(a) });
