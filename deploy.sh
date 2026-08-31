#!/usr/bin/env bash
# 鼎烽官网 · 部署脚本
# 用法：./deploy.sh user@host:/网站根目录
#   例：./deploy.sh root@122.51.255.11:/www/wwwroot/dingfeng
# 只同步网站真正需要的文件，内部文件（核对表、构建脚本、原始数据）不上传。
set -euo pipefail
TARGET="${1:?用法: ./deploy.sh user@host:/path/to/webroot}"

rsync -avz --delete \
  --exclude '.git' --exclude '.gitignore' --exclude '.claude' \
  --exclude '.DS_Store' --exclude '**/.DS_Store' \
  --exclude '核对表.html' \
  --exclude 'build_check.py' --exclude 'build_data.py' \
  --exclude 'serve.py' --exclude 'deploy.sh' \
  --exclude 'data/raw' \
  --exclude 'README.md' \
  ./ "$TARGET"

echo
echo "✅ 已同步到 $TARGET"
echo "   记得确认 web 服务器根目录指向该路径，且 index.html 为默认首页。"
