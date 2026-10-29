#!/bin/bash
# CourtLink — création d'un compte super admin en production via les API existantes.
# Usage : SUPER_ADMIN_EMAIL=… SUPER_ADMIN_PASSWORD=… NEW_EMAIL=… NEW_PASSWORD=… NEW_NAME=… \
#          bash scripts/create-super-admin-prod.sh
# Aucune valeur de secret dans ce fichier.
set -u
BASE="https://basketsite.vercel.app"
cd /home/z/my-project

NEW_EMAIL="${NEW_EMAIL:?NEW_EMAIL requis}"
NEW_PASSWORD="${NEW_PASSWORD:?NEW_PASSWORD requis}"
NEW_NAME="${NEW_NAME:-Administrateur CourtLink}"
SUPER_ADMIN_EMAIL="${SUPER_ADMIN_EMAIL:-admin@courtlink.bj}"
SUPER_ADMIN_PASSWORD="${SUPER_ADMIN_PASSWORD:-$(git show 1468ad7:prisma/seed.ts 2>/dev/null | grep -o "ADMIN_PASSWORD || '[^']*'" | sed "s/.*|| '//; s/'//")}"
[ -z "$SUPER_ADMIN_PASSWORD" ] && { echo "✘ mot de passe du super admin existant indisponible"; exit 1; }

echo "1) Inscription du compte ${NEW_EMAIL} (rôle guardian, sans profil public)…"
REG=$(curl -s -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' \
  --data-binary @- <<JSON
{"name": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$NEW_NAME"),
 "email": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$NEW_EMAIL"),
 "password": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$NEW_PASSWORD"),
 "role": "guardian", "country": "Bénin"}
JSON
)
echo "$REG" | python3 -c "import sys,json; d=json.load(sys.stdin); print('   →', 'ok, userId:', d['userId']) if d.get('ok') else (print('   →', d.get('error','réponse inattendue')), exit(1))" || { echo "   réponse: inscrivez ce compte autrement"; }

NEW_ID=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('userId',''))" 2>/dev/null)
[ -z "$NEW_ID" ] && { echo "✘ pas de userId — arrêt (le compte existe peut-être déjà)"; exit 1; }

echo "2) Connexion avec le super admin existant (${SUPER_ADMIN_EMAIL})…"
rm -f /tmp/jar-sa.txt
CSRF=$(curl -s -c /tmp/jar-sa.txt "$BASE/api/auth/csrf" | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
CODE=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/jar-sa.txt -c /tmp/jar-sa.txt -X POST "$BASE/api/auth/callback/credentials" \
  -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "email=$SUPER_ADMIN_EMAIL" \
  --data-urlencode "password=$SUPER_ADMIN_PASSWORD" --data-urlencode "json=true")
grep -q "session-token" /tmp/jar-sa.txt && echo "   ✔ session super admin (HTTP $CODE)" || { echo "✘ connexion super admin impossible (HTTP $CODE)"; exit 1; }

echo "3) Élévation en rôle admin…"
A1=$(curl -s -b /tmp/jar-sa.txt -X POST "$BASE/api/actions/setStaffRole" -H 'Content-Type: application/json' \
  --data-binary @- <<JSON
{"userId": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$NEW_ID"), "role": "admin"}
JSON
)
echo "   → $A1"

echo "4) Attribution de la couronne super admin 👑…"
A2=$(curl -s -b /tmp/jar-sa.txt -X POST "$BASE/api/actions/setSuperAdmin" -H 'Content-Type: application/json' \
  --data-binary @- <<JSON
{"userId": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$NEW_ID"), "on": true}
JSON
)
echo "   → $A2"

echo "5) Vérification : connexion avec le NOUVEAU compte…"
rm -f /tmp/jar-new.txt
CSRF2=$(curl -s -c /tmp/jar-new.txt "$BASE/api/auth/csrf" | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
C2=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/jar-new.txt -c /tmp/jar-new.txt -X POST "$BASE/api/auth/callback/credentials" \
  -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0' \
  --data-urlencode "csrfToken=$CSRF2" --data-urlencode "email=$NEW_EMAIL" \
  --data-urlencode "password=$NEW_PASSWORD" --data-urlencode "json=true")
if grep -q "session-token" /tmp/jar-new.txt; then
  STATE=$(curl -s -b /tmp/jar-new.txt "$BASE/api/state")
  python3 - "$STATE" <<'EOF'
import sys, json
d = json.loads(sys.argv[1])
ok = d.get('role') == 'admin' and d.get('isSuperAdmin') is True
print(f"   HTTP 200 — role={d.get('role')}, isSuperAdmin={d.get('isSuperAdmin')} →", "✔ COMPTE SUPER ADMIN OPÉRATIONNEL" if ok else "✘ statut incorrect")
EOF
else
  echo "   ✘ connexion du nouveau compte échouée (HTTP $C2)"
fi
echo "— Terminé —"
