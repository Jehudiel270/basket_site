#!/bin/bash
# Sonde /admin à 360px — offenders non filtrés
set -u
cd /home/z/my-project
source scripts/real-env.sh >/dev/null 2>&1 || true
export NEXT_PUBLIC_DATA_SOURCE=demo
C=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
if [ "$C" != "200" ]; then
  pkill -f "next-server" 2>/dev/null; pkill -f "next dev" 2>/dev/null; sleep 1
  nohup npm run dev > dev-demo.log 2>&1 < /dev/null & disown
  for i in $(seq 1 45); do sleep 2; C=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null); [ "$C" = "200" ] && break; done
fi
agent-browser set viewport 360 740 >/dev/null 2>&1
agent-browser open "http://localhost:3000/#/demo" >/dev/null 2>&1
agent-browser wait 2200 >/dev/null 2>&1
agent-browser eval "localStorage.removeItem('courtlink-demo-v2'); location.reload(); 'ok'" >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "var bs=[...document.querySelectorAll('.card-court button')]; bs[bs.length-1] && bs[bs.length-1].click(); 'admin'" >/dev/null 2>&1
agent-browser wait 2200 >/dev/null 2>&1
agent-browser open "http://localhost:3000/#/admin" >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1

echo "overflow total : $(agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tr -dc '0-9-')"
echo "=== offenders (12, sans img/svg/path/span) ==="
agent-browser eval "
JSON.stringify([...document.querySelectorAll('main *')]
  .filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.right > 362 && cs.overflowX !== 'auto' && !['IMG','PATH','SVG','SPAN','P','H2','H3'].includes(e.tagName); })
  .slice(0, 12)
  .map(e => e.tagName + '.' + (typeof e.className === 'string' ? e.className.trim().split(/\s+/).slice(0,6).join('.') : '') + ' right=' + Math.round(e.getBoundingClientRect().right)))" 2>/dev/null
