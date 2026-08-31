# 鼎烽官网 · 产品数据

数据来源：上海人民企业集团《2022.11 人民样本-确定版》（50 跨页 / 90 内页）。
原 PDF 为 CorelDRAW 导出，文字已转曲，**无文字层**，全部参数由逐页图像判读得到。

## 文件

| 文件 | 说明 |
|---|---|
| `raw/pNNx.json` | 67 份原始提取，一份对应样本的一个页栏（L=左页 R=右页），保留原表列头与行序 |
| `catalog-tables.json` | 合并后的 103 张参数表，带系列归属、原样本页码、原书注释与存疑标注 |
| `products.json` | 拍平的 2130 条可检索型号，含归一化的 flow/head/kw/rpm/bore/voltage 字段 |
| `images.json` | 从 PDF 提取的图片清单（47 张产品渲染图 + 42 张应用场景图） |

## 归一化字段

`products.json` 每条记录：

- `model` 规格型号（照原样本，未作修正）
- `seriesId` / `seriesName` / `seriesCodes` 十一大系列归属，按样本目录页码划分
- `group` 所属参数表标题　`page` 原样本页码　`tableId` 回溯到 catalog-tables.json
- `flow` 流量 m³/h　`head` 扬程 m　`kw` 功率 kW（W 已换算）
- `flowLs` 额定流 L/s（消防泵）　`mpa` 额定压力 MPa（消防泵）
- `voltage` 电压　`rpm` 同步转速　`bore` 口径/配管

字段覆盖率：kw 2108、head 1608、flow 1548、rpm 1478、voltage 1236、bore 1113（÷2130）。
不同系列表头不同，缺失即原样本该表无此列。

## 录入原则

**照原样本录入，不作推断修正。** 原样本自身矛盾处（型号与参数列对不上、序号断号、
标题沿用上表）一律保留原值，并在对应表的 `note` 字段标注，共 17 处。
上线前须由门店对照纸质样本确认——见 `../核对表.html`。
