#!/usr/bin/env bash
# ============================================================
# 鼎烽官网 · 挂到 maisiie.cn 的子域名下（与现有站点共存）
#
# 用法：./setup-subdomain.sh dingfeng.maisiie.cn
#
# 前置条件（缺一不可）：
#   1. 该子域名在 DNSPod 里已加 A 记录 → 122.51.255.11，且已生效
#   2. 站点文件已在 /home/ubuntu/dingfengweb
#
# 做法：把子域名并入现有那张 SAN 证书（maisiie.cn 那张），
#      鼎烽的 server 块与其它域名写法完全一致，直接 include tls.inc。
#      这样证书续期、TLS 参数都沿用现有机制，不引入第二套。
#
# 回滚：cp ~/backup-<时间戳>/* 回原位，再 docker compose ... up -d web
# ============================================================
set -euo pipefail

SUB="${1:?用法: $0 <子域名>   例: $0 dingfeng.maisiie.cn}"
STACK=/home/ubuntu/maisisystem
SITE=/home/ubuntu/dingfengweb
COMPOSE="docker compose -f docker-compose.prod.yml"
TS=$(date +%Y%m%d-%H%M%S)
BK=~/backup-"$TS"

cd "$STACK"

echo "▶ 0/6 前置检查"
[ -f "$SITE/index.html" ] || { echo "✗ $SITE 里没有 index.html"; exit 1; }
RESOLVED=$(getent ahostsv4 "$SUB" 2>/dev/null | awk '{print $1}' | sort -u | head -1)
if [ -z "$RESOLVED" ]; then
  echo "✗ $SUB 还没有 DNS 记录。请先在 DNSPod 加一条 A 记录指向 122.51.255.11，生效后再跑。"
  exit 1
fi
echo "  $SUB → $RESOLVED"

echo "▶ 1/6 备份 → $BK"
mkdir -p "$BK" && cp deploy/nginx.conf docker-compose.prod.yml "$BK"/

echo "▶ 2/6 挂载站点目录到容器"
if grep -q ':/srv/dingfeng:ro' docker-compose.prod.yml; then
  echo "  已存在，跳过"
else
  sed -i "s|      - ./apps/site/dist:/srv/site:ro|      - ./apps/site/dist:/srv/site:ro\n      - $SITE:/srv/dingfeng:ro|" docker-compose.prod.yml
  echo "  已加入 $SITE → /srv/dingfeng (只读)"
fi

echo "▶ 3/6 把子域名加进 80 端口的 server_name（certbot HTTP-01 验证要走这里）"
if grep -qE "^\s*server_name .*\b${SUB//./\\.}\b" deploy/nginx.conf; then
  echo "  已存在，跳过"
else
  sed -i "s|^\(  server_name maisiie\.cn www\.maisiie\.cn admin\.maisiie\.cn ds\.maisiie\.cn\);|\1 $SUB;|" deploy/nginx.conf
  grep -n "server_name.*$SUB" deploy/nginx.conf | head -1 | sed 's/^/  /'
fi

echo "▶ 4/6 重建 web 容器（maisiie.cn 会短暂中断约 2 秒）"
$COMPOSE up -d web
sleep 3
$COMPOSE exec -T web nginx -t

echo "▶ 5/6 扩展现有 SAN 证书，把子域名并进去"
$COMPOSE run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --cert-name maisiie.cn \
  -d maisiie.cn -d www.maisiie.cn -d admin.maisiie.cn -d ds.maisiie.cn -d "$SUB" \
  --expand --agree-tos --register-unsafely-without-email --non-interactive

echo "▶ 6/6 加 HTTPS server 块并重载"
if grep -q '/srv/dingfeng' deploy/nginx.conf; then
  echo "  已存在，跳过"
else
cat >> deploy/nginx.conf <<NGINX

# —— 鼎烽机电商行官网（静态站，文件在宿主机 /home/ubuntu/dingfengweb）——
server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  server_name $SUB;
  root /srv/dingfeng;
  include /etc/nginx/conf.d/tls.inc;
  include /etc/nginx/conf.d/common.inc;
}
NGINX
fi
$COMPOSE exec -T web nginx -t && $COMPOSE exec -T web nginx -s reload

echo
echo "✅ 完成"
echo "   鼎烽：  https://$SUB"
echo "   原有：  https://maisiie.cn  https://admin.maisiie.cn  https://ds.maisiie.cn"
echo "   备份：  $BK"
echo
echo "   自检："
curl -sS -o /dev/null -w "   https://$SUB  ->  HTTP %{http_code}\n" "https://$SUB/" || true
curl -sS -o /dev/null -w "   https://maisiie.cn   ->  HTTP %{http_code}\n" "https://maisiie.cn/" || true
