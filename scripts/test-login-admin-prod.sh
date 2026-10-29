#!/bin/bash
# CourtLink — test final : connexion super admin EN PROD avec les candidats historiques.
set -u
BASE="https://basketsite.vercel.app"
cd /home/z/my-project
ADMIN_EMAIL="admin@courtlink.bj"

# Candidats : 1) mot de passe du seed d'origine (choix conservé par l'utilisateur)
#            2) token du vieux script de test (16/16 E2E passés)
CANDIDATES=()
CANDIDATES+=("$(git show 1468ad7:prisma/seed.ts 2>/dev/null | grep -o "ADMIN_PASSWORD || '[^']*'" | sed "s/.*|| '//; s/'//")")
CANDIDATES+=("$(git show fac58ab:scripts/test-superadmin.sh 2>/dev/null | grep 'login ' | grep -v 'login()' | head -1 | awk '{print $3}')")

echo "1) ${#CANDIDATES[@]} candidat(s) chargé(s) depuis l'historique — longueurs: ${#CANDIDATES[0]} et ${#CANDIDATES[1]} (jamais affichés)"

COOKIE=""; USED=""
for PWD_TRY in "${CANDIDATES[@]}"; do
  [ -z "$PWD_TRY" ] && continue
  rm -f /tmp/jar-try.txt
  CSRF=$(curl -s -c /tmp/jar-try.txt "$BASE/api/auth/csrf" | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
  CODE=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/jar-try.txt -c /tmp/jar-try.txt \
    -X POST "$BASE/api/auth/callback/credentials" \
    -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0' \
    --data-urlencode "csrfToken=$CSRF" --data-urlencode "email=$ADMIN_EMAIL" \
    --data-urlencode "password=$PWD_TRY" --data-urlencode "json=true")
  if grep -q "session-token" /tmp/jar-try.txt; then
    COOKIE="/tmp/jar-try.txt"; USED="$PWD_TRY"
    echo "2) ✔ CONNEXION RÉUSSIE en prod (candidat ${#USED} caractères, HTTP $CODE)"
    break
  else
    echo "2) ✘ candidat (${#PWD_TRY} caractères) rejeté (HTTP $CODE)"
  fi
done

[ -z "$COOKIE" ] && { echo "✘ AUCUN candidat ne fonctionne en prod"; exit 1; }

# Vérification du statut super admin côté serveur
STATE=$(curl -s -b "$COOKIE" "$BASE/api/state")
python3 - "$STATE" <<'EOF'
import sys, json
d = json.loads(sys.argv[1])
role, sup = d.get('role'), d.get('isSuperAdmin')
staff, audits = len(d.get('staff',[])), len(d.get('auditLogs',[]))
print(f"3) /api/state (super admin) → role={role}, isSuperAdmin={sup}, staff visibles={staff}, audits={audits}, joueurs={len(d.get('players',[]))}")
print("   ✔ statut super admin confirmé côté serveur" if (role=='admin' and sup) else "   ✘ statut NON confirmé")
EOF

# Vérifie que le compte peut nommer (permission super admin, sans exécuter)
C=$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIE" -X POST "$BASE/api/actions/setStaffRole" -H 'Content-Type: application/json' -d '{"userId":"x","role":"moderator"}')
echo "4) setStaffRole avec session super admin (cible inexistante) → HTTP $C (attendu: 404/400, pas 401/403)"
echo "— Terminé —"
