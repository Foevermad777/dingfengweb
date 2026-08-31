# -*- coding: utf-8 -*-
"""把 data/raw/*.json 打包成站点直接可加载的 data/catalog.js（可直接编辑）"""
import json, glob, os, re, collections

C=json.load(open('data/catalog-tables.json'))
P=json.load(open('data/products.json'))
IM=json.load(open('data/images.json'))
CUT={c['file']:c['cutout'] for c in json.load(open('data/cutouts.json'))}

# ---- 每个页栏(左/右页)的样本页码 ----
side_page={}
for f in glob.glob('data/raw/*.json'):
    d=json.load(open(f)); side_page[(d['crop'][:3], d['crop'][3])]=int(d['catalogPage'])
# 同一跨页只识别到一侧时，另一侧按 ±1 推
for (sp,sd),pg in list(side_page.items()):
    other='L' if sd=='R' else 'R'
    if (sp,other) not in side_page:
        side_page[(sp,other)] = pg-1 if sd=='R' else pg+1

def series_of(page):
    for s in C['series']:
        if s['pageFrom']<=page<=s['pageTo']: return s['id']
    return None

# ---- 产品图归属系列（只认有参数表的跨页；封面/目录页不参与） ----
by_ser=collections.defaultdict(list)
for m in IM:
    if m['kind']!='product': continue
    pg=side_page.get((m['spread'], m['side']))
    if pg is None: continue                       # 封面 / 目录 / 分隔页
    sid=series_of(pg)
    if sid: by_ser[sid].append(CUT.get(m['file'], m['file']))
scenes=[m['file'].replace('.png','.jpg') for m in IM if m['kind']=='scene']


# ---- 人工指定的补充图（原样本中该系列自身页面无产品图时用）----
EXTRA={
  "deepwell":["assets/cutout/p41-360-462.png","assets/cutout/p41-461-426.png"],
}
for k,v in EXTRA.items():
    for f in v:
        if f not in by_ser[k]: by_ser[k].append(f)

# ---- 系列聚合：参数区间 + 子系列 ----
ser=[]
for s in C['series']:
    ps=[p for p in P if p['seriesId']==s['id']]
    ts=[t for t in C['tables'] if t['seriesId']==s['id']]
    def rng(k):
        v=[p[k] for p in ps if p.get(k) is not None]
        return [min(v),max(v)] if v else None
    subs=[]
    seen=set()
    for t in ts:
        key=t['title']
        if key in seen: continue
        seen.add(key)
        rows=sum(len(x['rows']) for x in ts if x['title']==key)
        subs.append({"title":key,"rows":rows,
                     "pages":sorted({x['page'] for x in ts if x['title']==key})})
    ser.append({
      "id":s['id'],"name":s['name'],"codes":s['codes'],
      "pageFrom":s['pageFrom'],"pageTo":s['pageTo'],
      "count":len(ps),"tables":len(ts),
      "flow":rng('flow'),"head":rng('head'),"kw":rng('kw'),
      "subs":subs,"images":sorted(by_ser.get(s['id'],[]),key=lambda f:0 if '/cutout/' in f else 1)[:6],
    })

bundle={
 "meta":{"brand":"上海人民企业集团 SRM 人企","source":"2022.11 人民样本-确定版",
         "note":"参数照原样本录入，未作推断修正；以实物为准。"},
 "series":ser,"tables":C['tables'],"products":P,"scenes":scenes,
}
os.makedirs('data',exist_ok=True)
js="/* 鼎烽机电商行 · 产品数据\n   改这一个文件即可增删产品。结构见 data/README.md */\nwindow.DF_DATA = "
js+=json.dumps(bundle,ensure_ascii=False,separators=(',',':'))
js+=";\n"
open('data/catalog.js','w').write(js)
print("data/catalog.js  %.0f KB"%(len(js)/1024))
for s in ser:
    print("  %-16s %4d型号 %2d子系列 %d张图  流量%s 扬程%s 功率%s"%(
      s['name'],s['count'],len(s['subs']),len(s['images']),
      s['flow'],s['head'],s['kw']))
