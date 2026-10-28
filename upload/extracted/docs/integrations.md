# Intégrations externes

## Neon Managed Better Auth

CourtLink réserve `NEON_AUTH_BASE_URL` à l’URL Better Auth de la branche Neon et `NEON_AUTH_COOKIE_SECRET` au secret de session côté serveur. L’application ne renvoie jamais ces valeurs; `server/api/auth-config.get.ts` ne retourne que leur présence.

Source officielle : [Neon — Migrate to Managed Better Auth](https://neon.tech/docs/guides/neon-auth).

## Neon PostgreSQL

`DATABASE_URL` est lu côté serveur. `server/api/neon-status.get.ts` exécute un `select 1 as connected` non destructif via `@neondatabase/serverless` lorsque la variable est configurée. Le mode de démonstration conserve les mutations dans `localStorage` afin de rester immédiatement testable sans schéma distant; le repository métier indique les entités à migrer vers Neon.

## Cloudinary

Les médias sont regroupés dans le dossier `courtlink`, avec les avatars dans `courtlink/avatars`. Les URLs publiques utilisent le cloud name depuis le runtime public; les clés et le secret restent privés. La signature d’upload est calculée côté serveur dans `server/api/cloudinary-signature.get.ts`.

Le dossier a été créé via l’Admin API officielle `POST /folders/:folder`, puis huit visuels basket ont été uploadés dans `courtlink/avatars`.

Source officielle : [Cloudinary — Admin API folders](https://cloudinary.com/documentation/admin_api_folders).
