#!/bin/bash
# Contrôle visuel final : captures home + tarifs + connexion (mobile) + vérif overflow public
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
agent-browser eval "localStorage.removeItem('courtlink-demo-v2'); 'ok'" >/dev/null 2>&1
for p in / /joueurs /opportunites /tarifs /connexion /evenements; do
  agent-browser open "http://localhost:3000/#$p" >/dev/null 2>&1
  agent-browser wait 2000 >/dev/null 2>&1
  o=$(agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tr -dc '0-9-')
  echo "$p → overflow=${o:-ERR}"
done
agent-browser open "http://localhost:3000/#/" >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1
agent-browser screenshot /home/z/my-project/scripts/responsive/final-home-mobile.png >/dev/null 2>&1
agent-browser open "http://localhost:3000/#/tarifs" >/dev/null 2>&1
agent-browser wait 2000 >/dev/null 2>&1
agent-browser screenshot /home/z/my-project/scripts/responsive/final-tarifs-mobile.png >/dev/null 2>&1
echo "captures OK"
