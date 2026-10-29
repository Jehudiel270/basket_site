#!/bin/bash
# CourtLink — audit responsive v3 : workspace réel via mode démo (localStorage).
set -u
cd /home/z/my-project
OUT=/home/z/my-project/scripts/responsive
mkdir -p "$OUT"

# 1. Redémarre le dev server en mode DEMO (store localStorage, pas d'auth requise)
pkill -f "next-server" 2>/dev/null; pkill -f "next dev" 2>/dev/null; sleep 1
source scripts/real-env.sh >/dev/null 2>&1 || true
export NEXT_PUBLIC_DATA_SOURCE=demo
nohup npm run dev > /home/z/my-project/dev-demo.log 2>&1 < /dev/null &
disown
for i in $(seq 1 45); do
  sleep 2
  C=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  [ "$C" = "200" ] && { echo "[serveur] prêt (~$((i*2))s) en mode demo"; break; }
done
[ "$C" = "200" ] || { echo "serveur KO"; exit 1; }

measure() { # $1 route → px d'overflow
  agent-browser open "http://localhost:3000/#$1" >/dev/null 2>&1
  agent-browser wait 1800 >/dev/null 2>&1
  agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tr -dc '0-9-'
}
offenders() {
  agent-browser eval "
    JSON.stringify([...document.querySelectorAll('body *')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.right > window.innerWidth + 2; })
      .slice(0, 6)
      .map(e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0,5).join('.') : '') + ' → right=' + Math.round(e.getBoundingClientRect().right))
    )" 2>/dev/null
}
check() { # $1 w $2 h $3 label $4 route
  agent-browser set viewport "$1" "$2" >/dev/null 2>&1
  local o; o=$(measure "$4")
  if [ "$o" = "0" ]; then echo "[$3 $1] $4 : OK"
  else echo "[$3 $1] $4 : ⚠️ +${o}px"; offenders | head -3
    agent-browser screenshot "$OUT/${3}-${4//\//_}.png" >/dev/null 2>&1
  fi
}

agent-browser set viewport 390 844 >/dev/null 2>&1

# ── Session ADMIN démo ──
agent-browser open "http://localhost:3000/#/demo" >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "localStorage.removeItem('courtlink-demo-v2'); location.reload(); 'ok'" >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "[...document.querySelectorAll('.card-court button')].map(b=>b.textContent.trim()).join('|')" 2>/dev/null
agent-browser eval "var bs=[...document.querySelectorAll('.card-court button')]; bs.length ? bs[bs.length-1].click() : null; 'clicked'" >/dev/null 2>&1
agent-browser wait 2000 >/dev/null 2>&1
echo "URL après clic admin : $(agent-browser eval "location.hash" 2>/dev/null)"

echo ""
echo "=== ADMIN mobile 390 ==="
for p in /admin /admin/utilisateurs /admin/organisations /admin/joueurs /admin/opportunites /admin/evenements /admin/moderation /admin/tickets /admin/facturation /admin/contenus /admin/notifications /admin/parametres /admin/journal /admin/admins; do
  check 390 844 adm "$p"
done

echo ""
echo "=== Admin mobile 360 (petit) ==="
for p in /admin /admin/admins /admin/facturation; do check 360 740 adm360 "$p"; done

echo ""
echo "=== ADMIN tablette 768 ==="
for p in /admin /admin/admins /admin/facturation /admin/utilisateurs; do check 768 1024 adm768 "$p"; done

# ── Session CLUB démo ──
agent-browser eval "localStorage.removeItem('courtlink-demo-v2'); location.hash='#/demo'; location.reload(); 'ok'" >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "var bs=[...document.querySelectorAll('.card-court button')]; bs[2] && bs[2].click(); 'club'" >/dev/null 2>&1
agent-browser wait 2000 >/dev/null 2>&1
echo "URL après clic club : $(agent-browser eval "location.hash" 2>/dev/null)"

echo ""
echo "=== CLUB mobile 390 ==="
for p in /app /app/recherche /app/pipeline /app/nouvelle-opportunite /app/comparaison /app/organisation /app/analytique; do
  check 390 844 club "$p"
done

# ── Session JOUEUR démo ──
agent-browser eval "localStorage.removeItem('courtlink-demo-v2'); location.hash='#/demo'; location.reload(); 'ok'" >/dev/null 2>&1
agent-browser wait 2500 >/dev/null 2>&1
agent-browser eval "var bs=[...document.querySelectorAll('.card-court button')]; bs[0] && bs[0].click(); 'joueur'" >/dev/null 2>&1
agent-browser wait 2000 >/dev/null 2>&1
echo "URL après clic joueur : $(agent-browser eval "location.hash" 2>/dev/null)"

echo ""
echo "=== JOUEUR mobile 390 ==="
for p in /app /app/profil /app/opportunites /app/candidatures /app/messages /app/abonnement /app/parametres; do
  check 390 844 j "$p"
done

echo ""
echo "=== Audit v3 terminé ==="
