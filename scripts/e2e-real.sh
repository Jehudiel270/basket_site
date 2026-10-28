#!/bin/bash
# CourtLink — E2E complet sur la vraie base Neon + Cloudinary.
# Usage : bash scripts/e2e-real.sh
set -u
BASE=http://localhost:3000
JAR=/home/z/my-project/scripts/.e2e-cookies.txt
PASS=0; FAIL=0

ok()   { echo "  ✔ $1"; PASS=$((PASS+1)); }
ko()   { echo "  ✘ $1"; FAIL=$((FAIL+1)); }
jget() { node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const o=JSON.parse(d);console.log(o['$1']??'')}catch(e){console.log('')}})"; }

rm -f "$JAR"

echo "── 1. Auth NextAuth (club@demo.courtlink, mot de passe réel en BDD) ──"
CSRF=$(curl -s -c "$JAR" $BASE/api/auth/csrf | jget csrfToken)
[ -n "$CSRF" ] && ok "csrfToken reçu" || ko "csrfToken manquant"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -c "$JAR" -X POST $BASE/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$CSRF&email=club%40demo.courtlink&password=demo1234&json=true")
[ "$CODE" = "200" ] || [ "$CODE" = "302" ] && ok "login → HTTP $CODE" || ko "login → HTTP $CODE"

SESSION=$(curl -s -b "$JAR" $BASE/api/auth/session)
SNAME=$(echo "$SESSION" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).user?.name??'')}catch(e){console.log('')}})")
SROLE=$(echo "$SESSION" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).user?.role??'')}catch(e){console.log('')}})")
[ "$SROLE" = "club" ] && ok "session réelle : $SNAME (role=$SROLE)" || ko "session invalide : $SESSION"

echo "── 2. /api/state — snapshot depuis Neon ──"
STATE=$(curl -s -b "$JAR" $BASE/api/state)
echo "$STATE" > /home/z/my-project/scripts/.e2e-state.json
NPLAYERS=$(node -e "const s=require('/home/z/my-project/scripts/.e2e-state.json');console.log((s.players??[]).length)")
NOPPS=$(node -e "const s=require('/home/z/my-project/scripts/.e2e-state.json');console.log((s.opportunities??[]).length)")
[ "${NPLAYERS:-0}" -ge 20 ] && ok "state.players = $NPLAYERS (depuis Neon)" || ko "state.players = $NPLAYERS"
[ "${NOPPS:-0}" -ge 5 ] && ok "state.opportunities = $NOPPS" || ko "state.opportunities = $NOPPS"

echo "── 3. Mutation réelle : toggleFavorite ──"
PID=$(node -e "const s=require('/home/z/my-project/scripts/.e2e-state.json');console.log(s.players[0].id)")
CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -X POST $BASE/api/actions/toggleFavorite \
  -H "Content-Type: application/json" -d "{\"playerId\":\"$PID\"}")
[ "$CODE" = "200" ] && ok "toggleFavorite → HTTP $CODE" || ko "toggleFavorite → HTTP $CODE"
echo "$PID" > /home/z/my-project/scripts/.e2e-pid.txt

echo "── 4. Sécurité : action SANS session ──"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/actions/toggleFavorite \
  -H "Content-Type: application/json" -d "{\"playerId\":\"$PID\"}")
[ "$CODE" = "401" ] && ok "sans session → HTTP 401 (bloqué)" || ko "sans session → HTTP $CODE (attendu 401)"

echo "── 5. Inscription réelle sur Neon ──"
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

echo "── 6. Login du nouveau compte + ownership ──"
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

echo "── 7. Signature Cloudinary ──"
UP=$(curl -s -b "$JAR" -X POST $BASE/api/upload -H "Content-Type: application/json" -d '{"kind":"photos"}')
SIGN=$(echo "$UP" | jget signature)
[ -n "$SIGN" ] && ok "signature reçue (upload débloqué)" || { ko "pas de signature : $UP"; }

echo "── 8. Upload RÉEL vers Cloudinary ──"
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

echo ""
echo "════════ RÉSULTAT : $PASS OK / $FAIL ÉCHECS ════════"
exit $FAIL
