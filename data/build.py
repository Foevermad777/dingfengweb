# -*- coding: utf-8 -*-
import json, glob, os, re

SERIES = [
 (3,14,  "wq-sewage",   "无堵塞潜水排污泵", "WQ / JYWQ / WQG / WQ-S / WQX"),
 (15,25, "rm-centrifugal","离心泵",        "RM(H)L / RM(H)W"),
 (26,31, "pipeline",    "管道泵 · 自吸排污泵","BZ / ZW / LW / GW / YW"),
 (32,34, "td-circ",     "管道循环泵",      "TD"),
 (35,42, "submersible", "潜水泵 · 潜水电泵","QY / QDX / QX / QXN / QD"),
 (43,44, "home",        "家用智能泵",      "JET / WZB"),
 (45,51, "deepwell",    "深井潜水电泵",    "QJ(D) 不锈铁 / 不锈钢"),
 (52,67, "stainless",   "不锈钢电泵",      "QDX / WQ / JYWQ / QGWQ / SFX / SF / ZW / QSP"),
 (68,72, "hotwater-dc", "热水循环 · 屏蔽 · 直流泵","PH / PUN / PBG / ZQB"),
 (73,85, "fire",        "消防泵组 · 水带",  "XBD 立式单级 / 立式多级 / 卧式单级"),
 (86,90, "mud",         "泥浆泵 · 气动隔膜泵","泥浆泵 / QBY / SK 真空泵"),
]
def series_of(page):
    p=int(page)
    for lo,hi,sid,name,codes in SERIES:
        if lo<=p<=hi: return sid,name,codes
    return "other","其他","-"

MODEL_COLS  = {"规格型号","型号","消防泵组型号","规格型号(铸铁款)","规格型号(不锈钢款)"}
FLOW_COLS   = {"流量(m³/h)","额定流量(m³/h)","最大流量(m³/h)"}
HEAD_COLS   = {"扬程(m)","额定扬程(m)","最高扬程(m)","最大扬程(M)","最大扬程(米)"}
POWER_KW    = {"功率(kw)","电动机功率(Kw)","功率KW"}
POWER_W     = {"功率(W)","输入功率(W)"}
VOLT_COLS   = {"电压(V)"}
RPM_COLS    = {"同步转速(r/min)","额定转速(r/min)"}
BORE_COLS   = {"配管(mm)","口径(mm)","出水口径(mm)","配管Inch","口径","出水口径(寸)"}
LS_COLS     = {"额定流(l/s)","流量(L/S)"}
MPA_COLS    = {"额定压力(MPa)"}

def num(v):
    if isinstance(v,(int,float)): return float(v)
    if not isinstance(v,str): return None
    m=re.match(r'^\s*(\d+(?:\.\d+)?)',v.replace('，',',').split('-')[0])
    return float(m.group(1)) if m else None

products=[]; tables=[]
for f in sorted(glob.glob('raw/*.json')):
    d=json.load(open(f))
    page=d['catalogPage']; sid,sname,scodes=series_of(page)
    for ti,t in enumerate(d['tables']):
        cols=t['cols']; idx={c:i for i,c in enumerate(cols)}
        tid=f"{d['crop']}-{ti}"
        tables.append({"id":tid,"crop":d['crop'],"page":page,"seriesId":sid,"seriesName":sname,
                       "title":t['title'],"subtitle":t.get('subtitle',''),"cols":cols,"rows":t['rows'],
                       "remark":t.get('remark',''),"note":t.get('note','') or d.get('note','')})
        if t.get('kind')=='accessory': continue
        mcol=next((c for c in cols if c in MODEL_COLS),None)
        if not mcol: continue
        for r in t['rows']:
            g=lambda names:(next((r[idx[c]] for c in cols if c in names and idx[c]<len(r)),None))
            model=r[idx[mcol]]
            if not isinstance(model,str) or not model.strip(): continue
            pw=g(POWER_KW); pwW=g(POWER_W)
            kw=num(pw) if pw not in (None,'') else (num(pwW)/1000 if num(pwW) else None)
            products.append({
              "model":model.strip(),"tableId":tid,"page":page,
              "seriesId":sid,"seriesName":sname,"seriesCodes":scodes,
              "group":t['title'],"subtitle":t.get('subtitle',''),
              "flow":num(g(FLOW_COLS)),"head":num(g(HEAD_COLS)),"kw":kw,
              "flowLs":num(g(LS_COLS)),"mpa":num(g(MPA_COLS)),
              "voltage":g(VOLT_COLS),"rpm":num(g(RPM_COLS)),"bore":g(BORE_COLS),
            })

json.dump({"brand":"上海人民企业集团 SRM","source":"2022.11 人民样本",
           "series":[{"id":s,"name":n,"codes":c,"pageFrom":a,"pageTo":b} for a,b,s,n,c in SERIES],
           "tables":tables},open('catalog-tables.json','w'),ensure_ascii=False,indent=1)
json.dump(products,open('products.json','w'),ensure_ascii=False,indent=1)

from collections import Counter
c=Counter(p['seriesName'] for p in products)
print("产品条目：",len(products)," 参数表：",len(tables))
for a,b,s,n,cd in SERIES: print("  %-22s %4d 条" % (n, c.get(n,0)))
print("\n可筛选字段覆盖率：")
for k in ["flow","head","kw","rpm","bore","voltage"]:
    print("  %-8s %4d / %d" % (k, sum(1 for p in products if p[k] not in (None,'')), len(products)))
