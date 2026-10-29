#!/bin/bash
# Sonde le min-content sur /app/profil (joueur démo, 390px)
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
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "http://localhost:3000/#/demo" >/dev/null 2>&1
agent-browser wait 2200 >/dev/null 2>&1
agent-browser eval "localStorage.removeItem('courtlink-demo-v2'); location.reload(); 'ok'" >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "var bs=[...document.querySelectorAll('.card-court button')]; bs[0] && bs[0].click(); 'joueur'" >/dev/null 2>&1
agent-browser wait 2200 >/dev/null 2>&1
agent-browser open "http://localhost:3000/#/app/profil" >/dev/null 2>&1
agent-browser wait 2200 >/dev/null 2>&1

echo "=== overflow global ==="
agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null

echo "=== éléments form intrinsèques larges (input/select/textarea/table/canvas + flex/gap rows) ==="
agent-browser eval "
JSON.stringify([...document.querySelectorAll('main input, main select, main textarea, main table, main canvas, main img')]
  .filter(e => e.getBoundingClientRect().right > 392)
  .slice(0, 12)
  .map(e => e.tagName + (e.type ? '['+e.type+']' : '') + '.' + String(e.className).split(/\s+/).slice(0,4).join('.') + ' w=' + Math.round(e.getBoundingClientRect().width) + ' sw=' + e.scrollWidth))" 2>/dev/null

echo "=== éléments non-scrollables les plus à droite ==="
agent-browser eval "
JSON.stringify([...document.querySelectorAll('main *')]
  .filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.right > 392 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll' && !['IMG','PATH','SVG','SPAN'].includes(e.tagName); })
  .slice(0, 12)
  .map(e => e.tagName + '.' + (typeof e.className === 'string' ? e.className.trim().split(/\s+/).slice(0,5).join('.') : '') + ' right=' + Math.round(e.getBoundingClientRect().right)))" 2>/dev/null
