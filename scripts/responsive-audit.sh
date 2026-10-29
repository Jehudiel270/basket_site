#!/bin/bash
# CourtLink — audit responsive : rend chaque page clé en viewport mobile/tablette,
# mesure l'overflow horizontal et liste les éléments débordants.
# Tout se déroule dans UN SEUL appel bash (le sandbox tue les process détachés).

set -u
cd /home/z/my-project
OUT=/home/z/my-project/scripts/responsive
mkdir -p "$OUT"

# 1. Serveur
bash scripts/ensure-server.sh || exit 1

# 2. Audit
audit() { # $1 = largeur, $2 = hauteur, $3 = label, $4 = route
  agent-browser set viewport "$1" "$2" >/dev/null 2>&1
  agent-browser open "http://localhost:3000/#$4" >/dev/null 2>&1
  agent-browser wait 2500 >/dev/null 2>&1
  local ovf
  ovf=$(agent-browser eval "JSON.stringify({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})" 2>/dev/null)
  local sw cw
  sw=$(echo "$ovf" | sed -E 's/.*"sw":([0-9]+).*/\1/')
  cw=$(echo "$ovf" | sed -E 's/.*"cw":([0-9]+).*/\1/')
  local flag="OK"
  [ -n "$sw" ] && [ -n "$cw" ] && [ "$sw" -gt "$cw" ] 2>/dev/null && flag="OVERFLOW +$((sw-cw))px"
  echo "[$3 $1x$2] $4 → sw=$sw cw=$cw : $flag"
  if [ "$flag" != "OK" ]; then
    agent-browser eval "
      JSON.stringify(
        [...document.querySelectorAll('*')]
          .filter(e => { const r=e.getBoundingClientRect(); return r.right > document.documentElement.clientWidth + 1 || r.left < -1; })
          .slice(0,8)
          .map(e => e.tagName + '.' + String(e.className).split(' ').slice(0,6).join('.') + ' w=' + Math.round(e.getBoundingClientRect().width))
      )" 2>/dev/null | head -5
    agent-browser screenshot "$OUT/${3}-${4//\//_}.png" >/dev/null 2>&1
  fi
}

PAGES="/ /joueurs /organisations /opportunites /evenements /tarifs /connexion /inscription /aide /demo /fonctionnement-joueurs"

echo "=== MOBILE 390x844 (iPhone 14) ==="
for p in $PAGES; do audit 390 844 mob "$p"; done

echo ""
echo "=== PETIT MOBILE 360x740 ==="
for p in / /tarifs /connexion /demo; do audit 360 740 sm360 "$p"; done

echo ""
echo "=== TABLETTE 768x1024 ==="
for p in / /joueurs /tarifs; do audit 768 1024 tab "$p"; done

echo ""
echo "=== Audit terminé — captures dans $OUT ==="
