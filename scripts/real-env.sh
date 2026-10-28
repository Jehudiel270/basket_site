#!/bin/bash
# CourtLink — force les variables du .env réel (Neon + Cloudinary).
# Nécessaire car (1) le profil du sandbox exporte DATABASE_URL=sqlite en
# permanence (la variable de process a priorité sur le .env chez Prisma/Next)
# et (2) `source .env` casse sur les & de l'URL (interprétés par bash).
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|\#*) continue ;; esac
  key="${line%%=*}"
  value="${line#*=}"
  [ -z "$key" ] && continue
  export "$key=$value"
done < /home/z/my-project/.env
echo "[real-env] DATABASE_URL → ${DATABASE_URL:0:75}…"
echo "[real-env] CLOUDINARY_CLOUD_NAME → $CLOUDINARY_CLOUD_NAME"
