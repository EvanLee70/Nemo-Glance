#!/bin/sh
# VM에 도커가 없어 네이티브 바이너리로 돌린다. 없으면 내려받고, 있으면 바로 실행.
set -e
cd "$(dirname "$0")"
if [ ! -x ./glance ]; then
  curl -fsSL -o glance.tar.gz https://github.com/glanceapp/glance/releases/download/v0.8.5/glance-linux-amd64.tar.gz
  tar -xzf glance.tar.gz glance
  chmod +x glance
  rm -f glance.tar.gz
fi
exec ./glance --config glance.yml
