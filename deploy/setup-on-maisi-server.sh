#!/usr/bin/env bash
# 把鼎烽官网挂到 122.51.255.11（与 maisiie.cn 共存）
# 用法： ./setup-on-maisi-server.sh dingfeng.example.com
# 前置：该域名的 A 记录已解析到 122.51.255.11，且已完成 ICP 备案。
set -euo pipefail
DOMAIN="${1:?用法: $0 <鼎烽域名>  例: $0 dingfeng.com}"
STACK=/home/ubuntu/maisisystem
SITE=/home/ubuntu/dingfengweb
COMPOSE="docker compose -f docker-compose.prod.yml"
TS=$(date +%Y%m%d-%H%M%S)

cd "$STACK"
echo "▶ 1/6 备份配置 → ~/backup-$TS"
mkdir -p ~/backup-"$TS" && cp deploy/nginx.conf docker-compose.prod.yml ~/backup-"$TS"/

echo "▶ 2/6 挂载站点目录"
grep -q ':/srv/dingfeng:ro' docker-compose.prod.yml || \
  sed -i "s|      - ./apps/site/dist:/srv/site:ro|      - ./apps/site/dist:/srv/site:ro\n      - $SITE:/srv/dingfeng:ro|" docker-compose.prod.yml

echo "▶ 3/6 把域名加进 80 端口（供 certbot 走 HTTP-01 验证）"
grep -q "$DOMAIN" deploy/nginx.conf || \
  sed -i "s|^\(  server_name maisiie.cn www.maisiie.cn admin.maisiie.cn ds.maisiie.cn;\)|  server_name maisiie.cn www.maisiie.cn admin.maisiie.cn ds.maisiie.cn $DOMAIN www.$DOMAIN;|" deploy/nginx.conf

echo "▶ 4/6 重建 web 容器（maisiie.cn 会短暂中断约 2 秒）"
$COMPOSE up -d web && sleep 3

echo "▶ 5/6 申请证书"
$COMPOSE run --rm --entrypoint certbot certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" --agree-tos --register-unsafely-without-email --non-interactive --keep-until-expiring

echo "▶ 6/6 添加 HTTPS server 块并重载"
if ! grep -q '/srv/dingfeng' deploy/nginx.conf; then
cat >> deploy/nginx.conf <<NGINX

# —— 鼎烽机电商行官网 ——
server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  server_name $DOMAIN www.$DOMAIN;
  root /srv/dingfeng;
  # 自带证书路径与 TLS 参数：不 include tls.inc（那里写死了 maisiie.cn 的证书）
  ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers off;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 1d;
  ssl_session_tickets off;
  include /etc/nginx/conf.d/common.inc;
}
NGINX
fi
$COMPOSE exec web nginx -t && $COMPOSE exec web nginx -s reload
echo
echo "✅ 完成： https://$DOMAIN"
echo "   回滚： cp ~/backup-$TS/* 回原位后 $COMPOSE up -d web"
