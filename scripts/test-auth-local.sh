#!/bin/bash
# Test local du nouveau code d'authentification (rate limiter + authorize).
set -u
cd /home/z/my-project
source scripts/real-env.sh 2>/dev/null || true

BASE="http://localhost:3000"

# S'assure que le serveur tourne
code=$(curl -s -o /dev/null -w '%{http_code}' $BASE/ 2>/dev/null)
if [ "$code" != "200" ]; then
  nohup npx next dev -p 3000 > /tmp/next-dev3.log 2>&1 &
  for i in $(seq 1 40); do
    code=$(curl -s -o /dev/null -w '%{http_code}' $BASE/ 2>/dev/null)
    [ "$code" = "200" ] && break; sleep 1
  done
fi
echo "serveur: HTTP $code"

# 1) Login avec le mot de passe par défaut d'origine (seed local ?)
PWD_ORIG="courtlink-admin-2026"
rm -f /tmp/jar-loc.txt
CSRF=$(curl -s -c /tmp/jar-loc.txt $BASE/api/auth/csrf | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
C1=$(curl -s -o /dev/null -w '%{http_code}' -b /tmp/jar-loc.txt -c /tmp/jar-loc.txt -X POST $BASE/api/auth/callback/credentials \
  -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "email=admin@courtlink.bj" \
  --data-urlencode "password=$PWD_ORIG" --data-urlencode "json=true")
grep -q "session-token" /tmp/jar-loc.txt && R1="✔ session créée" || R1="✘ rejeté"
echo "1) login local admin + mot de passe d'origine → HTTP $C1, $R1"

# 2) Vérifie le hash en base sqlite directement
HASH=$(npx tsx -e "
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
db.user.findUnique({ where: { email: 'admin@courtlink.bj' }, select: { id: true, email: true, role: true, isSuperAdmin: true, passwordHash: true } })
  .then(u => { if (!u) { console.log('ABSENT'); return; } console.log([u.role, u.isSuperAdmin, u.passwordHash.slice(0,7), u.passwordHash.length].join('|')); process.exit(0); });
" 2>/dev/null | tail -1)
echo "2) ligne admin sqlite → role|super|prefixe_bcrypt|longueur_hash = $HASH"

# 3) Le mot de passe d'origine correspond-il au hash local ?
if [[ "$HASH" == *"|admin|"* ]]; then
  MATCH=$(npx tsx -e "
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
db.user.findUnique({ where: { email: 'admin@courtlink.bj' } }).then(u => {
  console.log(bcrypt.compareSync('$PWD_ORIG', u.passwordHash) ? 'OUI' : 'NON');
});
" 2>/dev/null | tail -1)
  echo "3) bcrypt(mot de passe d'origine, hash local) = $MATCH"
fi
echo "— fini —"
