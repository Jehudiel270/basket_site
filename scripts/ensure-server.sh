#!/bin/bash
# CourtLink — garantit que le dev server tourne avec la vraie env (Neon).
# Le sandbox peut tuer les processus détachés entre deux appels shell.
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
if [ "$CODE" = "200" ]; then
  echo "[ensure-server] déjà en route (HTTP 200)"
  exit 0
fi
source /home/z/my-project/scripts/real-env.sh
cd /home/z/my-project
nohup npm run dev > /home/z/my-project/dev.log 2>&1 < /dev/null &
disown
for i in $(seq 1 40); do
  sleep 2
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  if [ "$CODE" = "200" ]; then echo "[ensure-server] prêt après ~$((i*2))s"; exit 0; fi
done
echo "[ensure-server] ÉCHEC du démarrage" >&2
exit 1
