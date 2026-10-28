#!/bin/bash
# CourtLink — test du flux super admin sur la vraie base.
# Usage : bash scripts/test-superadmin.sh
set -u
BASE=http://localhost:3000
JAR=/home/z/my-project/scripts/.sa-cookies.txt
PASS=0; FAIL=0
ok()  { echo "  ✔ $1"; PASS=$((PASS+1)); }
ko()  { echo "  ✘ $1"; FAIL=$((FAIL+1)); }
code() { curl -s -o "$1" -w "%{http_code}" "${@:2}"; }
jget() { node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const o=JSON.parse(d);console.log(o['$1']??'')}catch(e){console.log('')}})"; }
login() { # login <email> <password>
  rm -f "$JAR"
  local CSRF=$(curl -s -c "$JAR" $BASE/api/auth/csrf | jget csrfToken)
  curl -s -o /dev/null -w "%{http_code}" -b "$JAR" -c "$JAR" -X POST $BASE/api/auth/callback/credentials \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "csrfToken=$CSRF&email=$(node -e "console.log(encodeURIComponent('$1'))")&password=$2&json=true"
}
dbq() { { source /home/z/my-project/scripts/real-env.sh >/dev/null 2>&1 && bun -e "const{PrismaClient}=require('@prisma/client');const db=new PrismaClient();$1" ; } 2>/dev/null | tail -1; }

echo "── 0. Ids en base ──"
MID=$(dbq "db.user.findUnique({where:{email:'moderation@demo.courtlink'}}).then(u=>{console.log(u.id);return db.\$disconnect()})")
AID=$(dbq "db.user.findUnique({where:{email:'admin@courtlink.bj'}}).then(u=>{console.log(u.id);return db.\$disconnect()})")
[[ "$MID" =~ ^[A-Za-z0-9_-]{5,}$ ]] && ok "id modérateur : $MID" || { ko "id modérateur introuvable"; exit 1; }

echo "── 1. Super admin : admin@courtlink.bj ──"
C=$(login 'admin@courtlink.bj' 'courtlink-admin-2026')
[ "$C" = "200" ] || [ "$C" = "302" ] && ok "login super admin (HTTP $C)" || ko "login échoué (HTTP $C)"

STATE=$(curl -s -b "$JAR" $BASE/api/state)
ISA=$(echo "$STATE" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).isSuperAdmin)}catch(e){console.log('')}})")
NBSTAFF=$(echo "$STATE" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).staff.length)}catch(e){console.log('')}})")
[ "$ISA" = "true" ] && ok "state.isSuperAdmin = true" || ko "state.isSuperAdmin = $ISA"
[ "${NBSTAFF:-0}" -ge 3 ] && ok "state.staff = $NBSTAFF membres" || ko "state.staff = $NBSTAFF"

echo "── 2. Nommage : modérateur → admin ──"
C=$(code /dev/null -b "$JAR" -X POST $BASE/api/actions/setStaffRole -H "Content-Type: application/json" -d "{\"userId\":\"$MID\",\"role\":\"admin\"}")
[ "$C" = "200" ] && ok "setStaffRole → HTTP 200" || ko "setStaffRole → HTTP $C"
ROLE=$(dbq "db.user.findUnique({where:{email:'moderation@demo.courtlink'}}).then(u=>{console.log(u.role);return db.\$disconnect()})")
[ "$ROLE" = "admin" ] && ok "BDD : rôle mis à jour → admin" || ko "BDD : rôle = $ROLE"

echo "── 3. Super admin secondaire + retrait ──"
C=$(code /dev/null -b "$JAR" -X POST $BASE/api/actions/setSuperAdmin -H "Content-Type: application/json" -d "{\"userId\":\"$MID\",\"on\":true}")
[ "$C" = "200" ] && ok "setSuperAdmin on → HTTP 200" || ko "setSuperAdmin on → HTTP $C"
SA=$(dbq "db.user.findUnique({where:{email:'moderation@demo.courtlink'}}).then(u=>{console.log(u.isSuperAdmin);return db.\$disconnect()})")
[ "$SA" = "true" ] && ok "BDD : isSuperAdmin = true" || ko "BDD : isSuperAdmin = $SA"
C=$(code /dev/null -b "$JAR" -X POST $BASE/api/actions/setSuperAdmin -H "Content-Type: application/json" -d "{\"userId\":\"$MID\",\"on\":false}")
[ "$C" = "200" ] && ok "setSuperAdmin off (2 super admins restants) → HTTP 200" || ko "setSuperAdmin off → HTTP $C"

echo "── 4. Protections ──"
C=$(code /dev/null -b "$JAR" -X POST $BASE/api/actions/setSuperAdmin -H "Content-Type: application/json" -d "{\"userId\":\"$AID\",\"on\":true}")
[ "$C" = "400" ] && ok "auto-modification refusée → HTTP 400" || ko "auto-modification → HTTP $C (attendu 400)"
C=$(code /dev/null -X POST $BASE/api/actions/setStaffRole -H "Content-Type: application/json" -d "{\"userId\":\"$MID\",\"role\":\"admin\"}")
[ "$C" = "401" ] && ok "sans session → HTTP 401" || ko "sans session → HTTP $C"

echo "── 5. Admin NON super : refus 403 ──"
C=$(login 'admin@demo.courtlink' 'demo1234')
[ "$C" = "200" ] || [ "$C" = "302" ] && ok "login admin simple" || ko "login admin simple (HTTP $C)"
C=$(code /dev/null -b "$JAR" -X POST $BASE/api/actions/setStaffRole -H "Content-Type: application/json" -d "{\"userId\":\"$MID\",\"role\":\"moderator\"}")
[ "$C" = "403" ] && ok "admin simple → HTTP 403 (bloqué)" || ko "admin simple → HTTP $C (attendu 403)"
ISA2=$(curl -s -b "$JAR" $BASE/api/state | jget isSuperAdmin)
[ "$ISA2" = "false" ] && ok "state.isSuperAdmin = false pour l'admin simple" || ko "state.isSuperAdmin = $ISA2"

echo "── 6. Restauration ──"
login 'admin@courtlink.bj' 'courtlink-admin-2026' >/dev/null
C=$(code /dev/null -b "$JAR" -X POST $BASE/api/actions/setStaffRole -H "Content-Type: application/json" -d "{\"userId\":\"$MID\",\"role\":\"moderator\"}")
[ "$C" = "200" ] && ok "rôle modérateur restauré" || ko "restauration → HTTP $C"
ROLE=$(dbq "db.user.findUnique({where:{email:'moderation@demo.courtlink'}}).then(u=>{console.log(u.role);return db.\$disconnect()})")
[ "$ROLE" = "moderator" ] && ok "BDD : retour à moderator" || ko "BDD : $ROLE"

echo ""
echo "════════ SUPER ADMIN : $PASS OK / $FAIL ÉCHECS ════════"
rm -f "$JAR"
exit $FAIL
