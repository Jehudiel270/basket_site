#!/bin/bash
# CourtLink — E2E complet sur la vraie base (Neon + Cloudinary).
# Usage : ADMIN_PASSWORD=... ADMIN_EMAIL=... bash scripts/e2e-real.sh
# (aucun mot de passe dans le code — fourni via l'environnement)
set -u
BASE=http://localhost:3000
JAR=/home/z/my-project/scripts/.e2e-cookies.txt
PASS=0; FAIL=0

ok()   { echo "  ✔ $1"; PASS=$((PASS+1)); }
ko()   { echo "  ✘ $1"; FAIL=$((FAIL+1)); }
jget() { node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const o=JSON.parse(d);console.log(o['$1']??'')}catch(e){console.log('')}})"; }

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@courtlink.bj}"
ADMIN_PWD="${ADMIN_PASSWORD:-}"
[ -z "$ADMIN_PWD" ] && { echo "✘ ADMIN_PASSWORD requis (aucun mot de passe dans le code)"; exit 1; }

rm -f "$JAR"

echo "── 1. Auth NextAuth — super admin (via ADMIN_PASSWORD) ──"
CSRF=$(curl -s -c "$JAR" $BASE/api/auth/csrf | jget csrfToken)
[ -n "$CSRF" ] && ok "csrfToken reçu" || ko "csrfToken manquant"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -c "$JAR" -X POST $BASE/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$CSRF&email=$(node -e "console.log(encodeURIComponent('$ADMIN_EMAIL'))")&password=$(node -e "console.log(encodeURIComponent(process.env.ADMIN_PASSWORD))")&json=true")
[ "$CODE" = "200" ] || [ "$CODE" = "302" ] && ok "login admin → HTTP $CODE" || ko "login admin → HTTP $CODE"

SESSION=$(curl -s -b "$JAR" $BASE/api/auth/session)
SROLE=$(echo "$SESSION" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).user?.role??'')}catch(e){console.log('')}})")
[ "$SROLE" = "admin" ] && ok "session réelle : role=$SROLE" || ko "session invalide : $SESSION"

echo "── 2. Nouvelles actions admin ──"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -X POST $BASE/api/actions/loadDemoData -H "Content-Type: application/json" -d '{}')
[ "$CODE" = "200" ] && ok "loadDemoData (idempotent) → HTTP $CODE" || ko "loadDemoData → HTTP $CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -X POST $BASE/api/actions/setDemoAccounts -H "Content-Type: application/json" -d '{"on":true}')
[ "$CODE" = "200" ] && ok "setDemoAccounts ON → HTTP $CODE" || ko "setDemoAccounts ON → HTTP $CODE"

SHORT=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -X POST $BASE/api/actions/resetUserPassword -H "Content-Type: application/json" -d '{"userId":"x","password":"court"}')
[ "$SHORT" = "400" ] || [ "$SHORT" = "404" ] && ok "resetUserPassword garde (mot de passe court / cible absente) → HTTP $SHORT" || ko "resetUserPassword → HTTP $SHORT (attendu 400/404)"

WRONG=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -X POST $BASE/api/actions/changeOwnPassword -H "Content-Type: application/json" -d '{"current":"pas-le-bon","next":"nouveau-mot-2026"}')
[ "$WRONG" = "403" ] && ok "changeOwnPassword mot de passe actuel incorrect → HTTP 403" || ko "changeOwnPassword → HTTP $WRONG (attendu 403)"

echo "── 3. Connexion démo sans mot de passe (route gardée) ──"
rm -f "$JAR"
DCODE=$(curl -s -c "$JAR" -o /tmp/dl.json -w "%{http_code}" -X POST $BASE/api/demo-login -H "Content-Type: application/json" -d '{"role":"club"}')
[ "$DCODE" = "200" ] && ok "demo-login club → HTTP 200 (session démo)" || ko "demo-login → HTTP $DCODE : $(cat /tmp/dl.json)"

DSTATE=$(curl -s -b "$JAR" $BASE/api/state)
DROLE=$(echo "$DSTATE" | jget role)
[ "$DROLE" = "club" ] && ok "état hydraté en rôle club depuis la base" || ko "état non hydraté : role=$DROLE"

echo "── 4. /api/state — snapshot depuis la base ──"
echo "$DSTATE" > /home/z/my-project/scripts/.e2e-state.json
NPLAYERS=$(node -e "const s=require('/home/z/my-project/scripts/.e2e-state.json');console.log((s.players??[]).length)")
NOPPS=$(node -e "const s=require('/home/z/my-project/scripts/.e2e-state.json');console.log((s.opportunities??[]).length)")
[ "${NPLAYERS:-0}" -ge 20 ] && ok "state.players = $NPLAYERS" || ko "state.players = $NPLAYERS"
[ "${NOPPS:-0}" -ge 5 ] && ok "state.opportunities = $NOPPS" || ko "state.opportunities = $NOPPS"

echo "── 5. Mutation réelle : toggleFavorite ──"
PID=$(node -e "const s=require('/home/z/my-project/scripts/.e2e-state.json');console.log(s.players[0].id)")
CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -X POST $BASE/api/actions/toggleFavorite \
  -H "Content-Type: application/json" -d "{\"playerId\":\"$PID\"}")
[ "$CODE" = "200" ] && ok "toggleFavorite → HTTP $CODE" || ko "toggleFavorite → HTTP $CODE"
echo "$PID" > /home/z/my-project/scripts/.e2e-pid.txt

echo "── 6. Sécurité : action SANS session ──"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/actions/toggleFavorite \
  -H "Content-Type: application/json" -d "{\"playerId\":\"$PID\"}")
[ "$CODE" = "401" ] && ok "sans session → HTTP 401 (bloqué)" || ko "sans session → HTTP $CODE (attendu 401)"

echo "── 7. Inscription réelle ──"
TS=$(date +%s)
EMAIL="e2e.real.$TS@courtlink.bj"
echo "$EMAIL" > /home/z/my-project/scripts/.e2e-email.txt
RCODE=$(curl -s -o /home/z/my-project/scripts/.e2e-reg.json -w "%{http_code}" -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"E2E Réel\",\"email\":\"$EMAIL\",\"password\":\"motdepasse2026\",\"role\":\"player\",\"country\":\"Bénin\",\"phone\":\"+229 97 00 00 00\"}")
[ "$RCODE" = "200" ] || [ "$RCODE" = "201" ] && ok "register → HTTP $RCODE" || { ko "register → HTTP $RCODE"; cat /home/z/my-project/scripts/.e2e-reg.json; }

DUP=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"E2E Réel\",\"email\":\"$EMAIL\",\"password\":\"motdepasse2026\",\"role\":\"player\"}")
[ "$DUP" = "409" ] && ok "email en double → HTTP 409" || ko "email en double → HTTP $DUP"

echo "── 8. Login du nouveau compte + ownership ──"
rm -f "$JAR"
CSRF2=$(curl -s -c "$JAR" $BASE/api/auth/csrf | jget csrfToken)
CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -c "$JAR" -X POST $BASE/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$CSRF2&email=$(node -e "console.log(encodeURIComponent('$EMAIL'))")&password=motdepasse2026&json=true")
[ "$CODE" = "200" ] || [ "$CODE" = "302" ] && ok "login nouveau compte → HTTP $CODE" || ko "login → HTTP $CODE"

MYPID=$( { source /home/z/my-project/scripts/real-env.sh >/dev/null 2>&1 && bun /home/z/my-project/scripts/get-player-id.ts "$EMAIL"; } 2>/dev/null | tail -1 )
if [[ "$MYPID" =~ ^[A-Za-z0-9_-]{10,}$ ]]; then ok "ligne Player auto-créée en BDD (id=$MYPID)"; else ko "profil Player absent en BDD (capturé: '$MYPID')"; fi

MUT=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -X POST $BASE/api/actions/updatePlayer \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$MYPID\",\"patch\":{\"city\":\"Porto-Novo\",\"bio\":\"Test E2E sur Neon\"}}")
[ "$MUT" = "200" ] && ok "updatePlayer (auto-ownership) → HTTP 200" || ko "updatePlayer → HTTP $MUT"

PATCHBACK=$( { source /home/z/my-project/scripts/real-env.sh >/dev/null 2>&1 && bun /home/z/my-project/scripts/check-player.ts "$EMAIL"; } 2>/dev/null | tail -1 )
echo "$PATCHBACK" | rg -q 'Porto-Novo' && ok "patch relu en BDD → $PATCHBACK" || ko "patch non persisté : $PATCHBACK"

BAD=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -X POST $BASE/api/actions/updatePlayer \
  -H "Content-Type: application/json" -d '{}')
[ "$BAD" = "400" ] && ok "payload invalide → HTTP 400 (garde propre)" || ko "payload invalide → HTTP $BAD (attendu 400)"

echo "── 9. Signature Cloudinary ──"
UP=$(curl -s -b "$JAR" -X POST $BASE/api/upload -H "Content-Type: application/json" -d '{"kind":"photos"}')
SIGN=$(echo "$UP" | jget signature)
[ -n "$SIGN" ] && ok "signature reçue (upload débloqué)" || { ko "pas de signature : $UP"; }

echo "── 10. Upload RÉEL vers Cloudinary ──"
if [ -n "$SIGN" ]; then
  TSUP=$(echo "$UP" | jget timestamp)
  APIKEY=$(echo "$UP" | jget apiKey)
  CLOUD=$(echo "$UP" | jget cloudName)
  FOLDER=$(echo "$UP" | jget folder)
  node -e "require('fs').writeFileSync('/home/z/my-project/scripts/.e2e-test.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64'))"
  CRES=$(curl -s -X POST "https://api.cloudinary.com/v1_1/$CLOUD/image/upload" \
    -F "file=@/home/z/my-project/scripts/.e2e-test.png" \
    -F "api_key=$APIKEY" -F "timestamp=$TSUP" -F "signature=$SIGN" -F "folder=$FOLDER")
  CURL_=$(echo "$CRES" | jget secure_url)
  [ -n "$CURL_" ] && ok "Cloudinary OK → $CURL_" || ko "upload Cloudinary échoué : $CRES"
else
  ko "upload Cloudinary non testé (pas de signature)"
fi

echo "── 11. Fermeture des accès démo (état final sécurisé) ──"
rm -f "$JAR"
CSRF3=$(curl -s -c "$JAR" $BASE/api/auth/csrf | jget csrfToken)
curl -s -o /dev/null -b "$JAR" -c "$JAR" -X POST $BASE/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$CSRF3&email=$(node -e "console.log(encodeURIComponent('$ADMIN_EMAIL'))")&password=$(node -e "console.log(encodeURIComponent(process.env.ADMIN_PASSWORD))")&json=true"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -X POST $BASE/api/actions/setDemoAccounts -H "Content-Type: application/json" -d '{"on":false}')
[ "$CODE" = "200" ] && ok "setDemoAccounts OFF → HTTP $CODE" || ko "setDemoAccounts OFF → HTTP $CODE"
rm -f "$JAR"
LOCKED=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/demo-login -H "Content-Type: application/json" -d '{"role":"club"}')
[ "$LOCKED" = "403" ] && ok "demo-login après fermeture → HTTP 403 (verrouillé)" || ko "demo-login après fermeture → HTTP $LOCKED (attendu 403)"

echo ""
echo "════════ RÉSULTAT : $PASS OK / $FAIL ÉCHECS ════════"
exit $FAIL
