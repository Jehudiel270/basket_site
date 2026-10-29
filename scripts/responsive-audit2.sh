#!/bin/bash
# CourtLink — audit responsive v2 : mesure numérique fiable + workspace démo.
set -u
cd /home/z/my-project
OUT=/home/z/my-project/scripts/responsive
mkdir -p "$OUT"

bash scripts/ensure-server.sh >/dev/null 2>&1 || { echo "serveur KO"; exit 1; }

# Mesure fiable : renvoie un NOMBRE brut (overflow en px, 0 = aucun)
measure() { # $1 route
  agent-browser open "http://localhost:3000/#$1" >/dev/null 2>&1
  agent-browser wait 2200 >/dev/null 2>&1
  local r
  r=$(agent-browser eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tr -dc '0-9-')
  echo "${r:-ERR}"
}

# Liste les éléments qui débordent
offenders() {
  agent-browser eval "
    JSON.stringify([...document.querySelectorAll('body *')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.right > window.innerWidth + 2; })
      .slice(0, 6)
      .map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0,5).join('.') : '') + ' → right=' + Math.round(e.getBoundingClientRect().right))
    )" 2>/dev/null
}

audit() { # $1 w $2 h $3 label $4 route
  agent-browser set viewport "$1" "$2" >/dev/null 2>&1
  local o; o=$(measure "$4")
  if [ "$o" = "0" ]; then
    echo "[$3 $1x$2] $4 : OK"
  elif [ "$o" = "ERR" ]; then
    echo "[$3 $1x$2] $4 : ERREUR DE MESURE"
  else
    echo "[$3 $1x$2] $4 : ⚠️ OVERFLOW +${o}px"
    offenders | head -3
    agent-browser screenshot "$OUT/${3}-${4//\//_}.png" >/dev/null 2>&1
  fi
}

# ── Connexion démo (mode localStorage, sans serveur d'auth) ──
demo_login() { # $1 role-cible depuis /demo
  agent-browser set viewport 390 844 >/dev/null 2>&1
  agent-browser open "http://localhost:3000/#/demo" >/dev/null 2>&1
  agent-browser wait 2000 >/dev/null 2>&1
  # Stocke l'état démo directement (équivalent login(role) du store)
  agent-browser eval "localStorage.setItem('courtlink-demo', JSON.stringify({state:{role:'admin',loggedIn:true,dataSource:'demo'},version:0}));'ok'" >/dev/null 2>&1
  agent-browser reload >/dev/null 2>&1
  agent-browser wait 2000 >/dev/null 2>&1
}

echo "=== Clé localStorage du store ? ==="
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "http://localhost:3000/#/" >/dev/null 2>&1
agent-browser wait 2000 >/dev/null 2>&1
agent-browser eval "JSON.stringify(Object.keys(localStorage).filter(k=>k.includes('court')||k.includes('demo')))" 2>/dev/null

echo ""
echo "=== ADMIN (workspace, mobile 390) ==="
demo_login
for p in /admin /admin/utilisateurs /admin/admins /admin/journal /admin/parametres /admin/facturation; do
  agent-browser open "http://localhost:3000/#$p" >/dev/null 2>&1
  agent-browser wait 2200 >/dev/null 2>&1
  o=$(measure "$p")
  if [ "$o" = "0" ]; then echo "[mob 390] $p : OK"; else
    echo "[mob 390] $p : ⚠️ OVERFLOW +${o}px"; offenders | head -3
    agent-browser screenshot "$OUT/mob-admin-${p//\//_}.png" >/dev/null 2>&1
  fi
done

echo ""
echo "=== Pages publiques revérif (mesure corrigée) ==="
for p in / /joueurs /opportunites /tarifs /demo; do audit 390 844 mob "$p"; done
for p in / /tarifs; do audit 360 740 s360 "$p"; done
