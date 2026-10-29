#!/bin/bash
# Diagnostique la chaîne d'ancêtres qui s'étire sur /app/recherche (club, 390px)
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
agent-browser eval "var bs=[...document.querySelectorAll('.card-court button')]; bs[2] && bs[2].click(); 'club'" >/dev/null 2>&1
agent-browser wait 2200 >/dev/null 2>&1

echo "=== /app/recherche : chaîne des ancêtres ==="
agent-browser open "http://localhost:3000/#/app/recherche" >/dev/null 2>&1
agent-browser wait 2200 >/dev/null 2>&1
agent-browser eval "
(() => {
  let el = [...document.querySelectorAll('main.p-4 *')].filter(e => e.getBoundingClientRect().right > 392).pop();
  const chain = [];
  while (el && el !== document.body) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    chain.push(el.tagName + '.' + (typeof el.className === 'string' ? el.className.split(/\s+/).slice(0,7).join('.') : '') + ' w=' + Math.round(r.width) + ' minW=' + cs.minWidth + ' disp=' + cs.display);
    el = el.parentElement;
  }
  return JSON.stringify(chain, null, 1);
})()" 2>/dev/null

echo ""
echo "=== /app/recherche : coupables de largeur min ==="
agent-browser eval "
JSON.stringify([...document.querySelectorAll('main *')]
  .filter(e => e.scrollWidth > 390 && getComputedStyle(e).overflowX !== 'auto' && getComputedStyle(e).overflowX !== 'scroll')
  .slice(0, 10)
  .map(e => e.tagName + '.' + (typeof e.className === 'string' ? e.className.split(/\s+/).slice(0,6).join('.') : '') + ' sw=' + e.scrollWidth))" 2>/dev/null
