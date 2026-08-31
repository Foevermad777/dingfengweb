# -*- coding: utf-8 -*-
import json, html, re
D=json.load(open('data/catalog-tables.json'))
SER=D['series']; TB=D['tables']
TB.sort(key=lambda t:(int(t['page']), t['id']))

pages={}
for t in TB: pages.setdefault(t['page'],[]).append(t)
order=sorted(pages,key=lambda p:int(p))
sname={s['id']:s['name'] for s in SER}
scodes={s['id']:s['codes'] for s in SER}

flagged=[t for t in TB if t.get('note')]
total_rows=sum(len(t['rows']) for t in TB)
ser_pages={}
for p in order:
    sid=pages[p][0]['seriesId']; ser_pages.setdefault(sid,[]).append(p)
ser_rows={}
for t in TB: ser_rows[t['seriesId']]=ser_rows.get(t['seriesId'],0)+len(t['rows'])

def e(x): return html.escape(str(x)) if x is not None else ''
def cell(v):
    if v is None or v=='': return '<td class="empty">—</td>'
    s=str(v)
    num = bool(re.fullmatch(r'-?\d+(\.\d+)?', s))
    return '<td class="%s">%s</td>'%('n' if num else 'x', e(s))

out=[]
A=out.append
A('<title>人民样本核对表</title>')
A('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
A('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">')
A('''<style>
:root{
 --ground:#FBFCFD; --panel:#FFFFFF; --sunk:#F0F4F8; --rule:#D6DEE6; --rule-soft:#E7ECF1;
 --ink:#16202B; --ink-2:#4A5A6B; --ink-3:#7C8B9A;
 --navy:#17427E; --navy-soft:#E8EFF9; --on-navy:#FFFFFF; --flag:#AF4517; --flag-soft:#FBEDE5; --ok:#1E6B48;
 --shadow:0 1px 2px rgba(22,32,43,.06),0 4px 14px rgba(22,32,43,.05);
 --sans:"IBM Plex Sans","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;
 --mono:"IBM Plex Mono","PingFang SC","Microsoft YaHei",ui-monospace,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
 --ground:#0E151C; --panel:#151E27; --sunk:#1B2731; --rule:#2C3A47; --rule-soft:#222E39;
 --ink:#E4EBF2; --ink-2:#9FB0BF; --ink-3:#71828F;
 --navy:#78A6E4; --navy-soft:#17273D; --on-navy:#0E151C; --flag:#E39068; --flag-soft:#31201A; --ok:#5FBE92;
 --shadow:0 1px 2px rgba(0,0,0,.4),0 4px 14px rgba(0,0,0,.3);
}}
:root[data-theme="dark"]{
 --ground:#0E151C; --panel:#151E27; --sunk:#1B2731; --rule:#2C3A47; --rule-soft:#222E39;
 --ink:#E4EBF2; --ink-2:#9FB0BF; --ink-3:#71828F;
 --navy:#78A6E4; --navy-soft:#17273D; --on-navy:#0E151C; --flag:#E39068; --flag-soft:#31201A; --ok:#5FBE92;
 --shadow:0 1px 2px rgba(0,0,0,.4),0 4px 14px rgba(0,0,0,.3);
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);
 font-size:15px;line-height:1.6;-webkit-text-size-adjust:100%}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px 96px}

header.top{padding:40px 0 26px;border-bottom:1px solid var(--rule)}
.eyebrow{font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;
 color:var(--ink-3);margin:0 0 10px}
h1{font-size:clamp(26px,4.2vw,36px);line-height:1.2;margin:0 0 10px;font-weight:600;
 letter-spacing:-.01em;text-wrap:balance}
.lede{margin:0;color:var(--ink-2);max-width:60ch}
.lede b{color:var(--ink);font-weight:600}

.stats{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.stat{background:var(--panel);border:1px solid var(--rule);border-radius:9px;padding:11px 15px;
 min-width:104px;box-shadow:var(--shadow)}
.stat .k{font-family:var(--mono);font-size:22px;font-weight:600;line-height:1.1;
 font-variant-numeric:tabular-nums}
.stat .l{font-size:11.5px;color:var(--ink-3);margin-top:3px}
.stat.warn .k{color:var(--flag)} .stat.done .k{color:var(--ok)}

.bar{position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--ground) 92%,transparent);
 backdrop-filter:blur(10px);border-bottom:1px solid var(--rule);margin-top:26px}
.bar-in{max-width:1180px;margin:0 auto;padding:10px 20px;display:flex;gap:10px;align-items:center;
 flex-wrap:wrap}
button.t{font:inherit;font-size:13px;background:var(--panel);color:var(--ink-2);
 border:1px solid var(--rule);border-radius:7px;padding:6px 13px;cursor:pointer}
button.t:hover{border-color:var(--navy);color:var(--ink)}
button.t[aria-pressed="true"]{background:var(--navy);border-color:var(--navy);color:var(--on-navy)}
button.t:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid var(--navy);outline-offset:2px}
.prog{margin-left:auto;display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--ink-3)}
.track{width:120px;height:6px;background:var(--sunk);border-radius:3px;overflow:hidden}
.fill{height:100%;background:var(--ok);width:0;transition:width .25s}

nav.idx{margin:26px 0 8px;display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:8px}
nav.idx a{display:flex;justify-content:space-between;gap:10px;align-items:baseline;
 text-decoration:none;color:var(--ink);background:var(--panel);border:1px solid var(--rule);
 border-radius:8px;padding:9px 13px;font-size:13.5px}
nav.idx a:hover{border-color:var(--navy);background:var(--navy-soft)}
nav.idx .c{font-family:var(--mono);font-size:11.5px;color:var(--ink-3);font-variant-numeric:tabular-nums;
 white-space:nowrap}

.flagbox{margin:26px 0 0;background:var(--flag-soft);border:1px solid var(--flag);
 border-left-width:4px;border-radius:9px;padding:16px 18px}
.flagbox h2{margin:0 0 4px;font-size:15px;font-weight:600;color:var(--flag)}
.flagbox p{margin:0 0 10px;font-size:13.5px;color:var(--ink-2)}
.flagbox ol{margin:0;padding-left:20px;font-size:13.5px;color:var(--ink-2)}
.flagbox li{margin:5px 0}
.flagbox a{color:var(--flag);font-weight:600;text-decoration:none;font-family:var(--mono);font-size:12.5px}
.flagbox a:hover{text-decoration:underline}

h2.ser{font-size:13px;font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;
 color:var(--navy);margin:46px 0 0;padding-bottom:8px;border-bottom:2px solid var(--navy);
 display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
h2.ser .cn{font-family:var(--sans);font-size:17px;letter-spacing:0;text-transform:none;
 font-weight:600;color:var(--ink)}
h2.ser .rt{font-size:11.5px;color:var(--ink-3);font-variant-numeric:tabular-nums}

section.pg{margin-top:20px;background:var(--panel);border:1px solid var(--rule);border-radius:11px;
 box-shadow:var(--shadow);overflow:hidden;scroll-margin-top:64px}
section.pg.checked{opacity:.55}
section.pg.checked .ph{background:color-mix(in srgb,var(--ok) 9%,var(--panel))}
.ph{display:flex;align-items:center;gap:13px;padding:13px 17px;background:var(--sunk);
 border-bottom:1px solid var(--rule)}
.pnum{font-family:var(--mono);font-weight:600;font-size:12.5px;color:var(--on-navy);background:var(--navy);
 border-radius:6px;padding:4px 9px;white-space:nowrap;letter-spacing:.02em}
.ptitles{flex:1;min-width:0}
.ptitles .t{font-size:14px;font-weight:600;line-height:1.4}
.ptitles .s{font-size:12px;color:var(--ink-3);margin-top:1px}
label.chk{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--ink-2);
 cursor:pointer;white-space:nowrap;user-select:none}
label.chk input{width:17px;height:17px;accent-color:var(--ok);cursor:pointer}

.tbl{padding:2px 0 0}
.tbl-h{padding:14px 17px 8px;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
.tbl-h .tt{font-size:13.5px;font-weight:600;line-height:1.45}
.tbl-h .ct{font-family:var(--mono);font-size:11px;color:var(--ink-3);
 background:var(--sunk);border-radius:5px;padding:2px 7px;white-space:nowrap}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
table{border-collapse:collapse;width:100%;min-width:max-content;font-size:13px}
th{background:var(--sunk);color:var(--ink-2);font-weight:600;font-size:11.5px;
 text-align:left;padding:8px 12px;border-bottom:1px solid var(--rule);white-space:nowrap;
 position:sticky;top:0}
td{padding:6px 12px;border-bottom:1px solid var(--rule-soft);white-space:nowrap}
td.n{font-family:var(--mono);font-variant-numeric:tabular-nums;text-align:right}
td.x{font-family:var(--mono);font-size:12.5px}
td.empty{color:var(--ink-3);text-align:center}
tbody tr:hover td{background:var(--sunk)}
tbody tr:last-child td{border-bottom:none}

.note,.remark{margin:0;padding:10px 17px;font-size:12.5px;line-height:1.6;border-top:1px solid var(--rule-soft)}
.note{background:var(--flag-soft);color:var(--ink-2);border-left:3px solid var(--flag)}
.note b{color:var(--flag)}
.remark{color:var(--ink-3);background:var(--sunk)}
.remark b{color:var(--ink-2);font-weight:600}

footer{margin-top:56px;padding-top:22px;border-top:1px solid var(--rule);
 font-size:12.5px;color:var(--ink-3)}
footer b{color:var(--ink-2)}
body.only-flag section.pg:not(.has-flag){display:none}
body.only-flag h2.ser{display:none}
body.only-flag nav.idx{display:none}
@media (max-width:640px){
 .wrap{padding:0 13px 72px} .ph{flex-wrap:wrap;gap:9px}
 .ptitles{flex-basis:100%;order:3} nav.idx{grid-template-columns:1fr}
 .prog{margin-left:0;width:100%}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>''')

A('<div class="wrap">')
A('<header class="top">')
A('<p class="eyebrow">佛山市南海区鼎烽机电商行 · 官网数据准备</p>')
A('<h1>人民样本核对表</h1>')
A('<p class="lede">上海人民企业集团《2022.11 人民样本》共 90 个内页，'
  '文件是 CorelDRAW 导出的曲线，<b>没有可复制的文字层</b>，所有参数由逐页图像识别得来。'
  '下表按<b>样本页码</b>排列，请拿纸质样本对照翻查——尤其是标为存疑的条目。'
  '每页核对完打勾，进度自动保存在这台设备上。</p>')
A('<div class="stats">')
A('<div class="stat"><div class="k">%d</div><div class="l">型号记录</div></div>'%total_rows)
A('<div class="stat"><div class="k">%d</div><div class="l">参数表</div></div>'%len(TB))
A('<div class="stat"><div class="k">%d</div><div class="l">样本页</div></div>'%len(order))
A('<div class="stat warn"><div class="k">%d</div><div class="l">存疑待确认</div></div>'%len(flagged))
A('<div class="stat done"><div class="k" id="doneN">0</div><div class="l">已核对页</div></div>')
A('</div></header>')

A('<div class="bar"><div class="bar-in">')
A('<button class="t" id="bAll" aria-pressed="true">全部页面</button>')
A('<button class="t" id="bFlag" aria-pressed="false">只看存疑项 (%d)</button>'%len(flagged))
A('<button class="t" id="bReset">清空勾选</button>')
A('<div class="prog"><div class="track"><div class="fill" id="fill"></div></div><span id="progT">0 / %d</span></div>'%len(order))
A('</div></div>')

A('<nav class="idx">')
for s in SER:
    ps=ser_pages.get(s['id'],[])
    if not ps: continue
    A('<a href="#s-%s"><span>%s</span><span class="c">P%s–%s · %d条</span></a>'
      %(s['id'],e(s['name']),ps[0],ps[-1],ser_rows.get(s['id'],0)))
A('</nav>')

A('<div class="flagbox"><h2>%d 处需要你确认</h2>'%len(flagged))
A('<p>这些是原样本自身前后不一致、或编号断号的地方。我一律<b>照原样本录入</b>，没有替你改。请对照纸质样本确认后告诉我怎么处理。</p><ol>')
for t in flagged:
    A('<li><a href="#p-%s">样本 P%s</a> · %s：%s</li>'%(t['page'],t['page'],e(t['title'][:26]),e(t['note'])))
A('</ol></div>')

cur=None
for p in order:
    ts=pages[p]; sid=ts[0]['seriesId']
    if sid!=cur:
        cur=sid
        A('<h2 class="ser" id="s-%s"><span class="cn">%s</span>'
          '<span class="rt">%s · 共 %d 条型号</span></h2>'
          %(sid,e(sname[sid]),e(scodes[sid]),ser_rows.get(sid,0)))
    hasflag=any(t.get('note') for t in ts)
    n=sum(len(t['rows']) for t in ts)
    A('<section class="pg%s" id="p-%s" data-p="%s">'%(' has-flag' if hasflag else '',p,p))
    A('<div class="ph"><span class="pnum">P%s</span>'%p)
    A('<div class="ptitles"><div class="t">%s</div><div class="s">%d 个型号 · %d 张表</div></div>'
      %(e(ts[0]['title']),n,len(ts)))
    A('<label class="chk"><input type="checkbox" data-p="%s"> 已核对</label></div>'%p)
    for t in ts:
        A('<div class="tbl"><div class="tbl-h"><span class="tt">%s</span>'%e(t['title']))
        if t.get('subtitle'): A('<span class="ct">%s</span>'%e(t['subtitle']))
        A('<span class="ct">%d 行</span></div>'%len(t['rows']))
        A('<div class="scroll"><table><thead><tr>')
        for c in t['cols']: A('<th>%s</th>'%e(c))
        A('</tr></thead><tbody>')
        for r in t['rows']:
            A('<tr>'+''.join(cell(r[i] if i<len(r) else None) for i in range(len(t['cols'])))+'</tr>')
        A('</tbody></table></div>')
        if t.get('note'):   A('<p class="note"><b>存疑 · 已照原样本录入</b>　%s</p>'%e(t['note']))
        if t.get('remark'): A('<p class="remark"><b>样本原注</b>　%s</p>'%e(t['remark']))
        A('</div>')
    A('</section>')

A('<footer><b>数据来源</b>　上海人民企业集团《2022.11 人民样本-确定版》，共 50 个跨页 / 90 个内页。'
  '<br><b>提取方式</b>　按表格矢量边框定位后裁切放大，逐表人工判读；型号、参数一律照原样本录入，'
  '不作推断修正。原样本内部矛盾之处已单独标出。'
  '<br><b>注意</b>　水泵参数错配会造成事故，本表须经门店确认后方可上线。</footer>')
A('</div>')

A('''<script>
const K='dfjd-check-v1';
const load=()=>{try{return new Set(JSON.parse(localStorage.getItem(K)||'[]'))}catch(e){return new Set()}};
const save=s=>{try{localStorage.setItem(K,JSON.stringify([...s]))}catch(e){}};
let set=load();
const boxes=[...document.querySelectorAll('input[type=checkbox][data-p]')];
const total=boxes.length;
function paint(){
  boxes.forEach(b=>{const on=set.has(b.dataset.p);b.checked=on;
    b.closest('section').classList.toggle('checked',on)});
  const n=boxes.filter(b=>set.has(b.dataset.p)).length;
  document.getElementById('doneN').textContent=n;
  document.getElementById('progT').textContent=n+' / '+total;
  document.getElementById('fill').style.width=(total?n/total*100:0)+'%';
}
boxes.forEach(b=>b.addEventListener('change',()=>{
  b.checked?set.add(b.dataset.p):set.delete(b.dataset.p);save(set);paint();}));
const bAll=document.getElementById('bAll'),bFlag=document.getElementById('bFlag');
function mode(flag){document.body.classList.toggle('only-flag',flag);
  bAll.setAttribute('aria-pressed',String(!flag));bFlag.setAttribute('aria-pressed',String(flag));}
bAll.onclick=()=>mode(false); bFlag.onclick=()=>mode(true);
document.getElementById('bReset').onclick=()=>{if(confirm('清空全部核对勾选？')){set=new Set();save(set);paint();}};
paint();
</script>''')

open('核对表.html','w').write('\n'.join(out))
print('生成 核对表.html  %.0f KB'%(len('\n'.join(out))/1024))
