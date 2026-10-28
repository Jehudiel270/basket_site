# CourtLink — Branchement réel : FAIT ✅

Les 2 jeux de clés ont été reçus et **tout est branché, semé et testé en conditions réelles**.
Ce document remplace la liste « clés à fournir » — il reste le **push du repo** et le **déploiement Vercel**.

---

## 1. Ce qui a été fait (29 oct 2026)

| Étape | Résultat |
|---|---|
| `.env` réel écrit (Neon + Cloudinary) | ✅ clés hors repo git (`.env` retiré du suivi) |
| `prisma db push` → Neon | ✅ 24 tables créées (PostgreSQL, pooler + `pgbouncer=true`) |
| `bun prisma/seed.ts` → Neon | ✅ admin + 4 plans + 8 comptes démo + 24 joueurs, 8 organisations, 10 opportunités, 5 événements, 7 candidatures |
| Auth NextAuth réelle | ✅ login `club@demo.courtlink` sur la vraie base → session JWT (role=club) |
| Inscription réelle | ✅ `HTTP 201` → User + Player auto-créés en BDD, doublon → `409` |
| Mutations persistées | ✅ `toggleFavorite`, `updatePlayer` vérifiés par relecture en base |
| Sécurité serveur | ✅ sans session → `401` ; payload invalide → `400` ; ownership contrôlé |
| Upload Cloudinary | ✅ signature OK + **upload réel** → fichier servi sur `res.cloudinary.com/dmnhxis9e/…/courtlink/photos/…png` |
| **E2E complet** (`scripts/e2e-real.sh`) | ✅ **16/16** |

> Note technique : le paramètre `channel_binding=require` de l'URL Neon n'est pas
> supporté par le parseur Prisma — l'URL `.env` utilise `sslmode=require&pgbouncer=true`
> (recommandé par Neon pour le pooler + Prisma). Les 2 URLs « Neon Auth » fournies
> ne servent pas : l'authentification est NextAuth + bcrypt, indépendante.

## 2. État de la base Neon

- 9 comptes : `admin@courtlink.bj` (admin réel) + 8 comptes démo `*@demo.courtlink`
- Contenu de démonstration complet (24 joueurs, 8 organisations, 10 opportunités, 5 événements…)
- Comptes de test E2E supprimés après vérification

**Sécurité avant lancement public :**
1. Changer le mot de passe admin : re-semer avec `ADMIN_PASSWORD=nouveau bun prisma/seed.ts`, ou le changer en base
2. Changer les `demo1234` des comptes démo (ou désactiver ces comptes)
3. Les clés Neon/Cloudinary restent révocables depuis leurs dashboards respectifs

## 3. Push du repo — ce dont j'ai besoin

Le commit est prêt en local (`2d19f6a`, arborescence propre, **aucune clé dans l'historique**).
Pour pousser vers GitHub, il me faut :

1. **L'URL du repo** — créer un dépôt **vide** sur github.com
   (ex. `https://github.com/ton-pseudo/courtlink.git`, sans README ni .gitignore)
2. **Un Personal Access Token (PAT)** GitHub —
   Settings → Developer settings → Personal access tokens :
   - *Fine-grained* (recommandé) : accès limité à ce repo, permission **Contents: Read and write**
   - ou *Classic* avec le scope `repo`
3. *(optionnel)* ton pseudo GitHub + email pour signer les commits

Je ferai ensuite : `git remote add origin …` → `git push -u origin main`.
Tu peux **révoquer le token juste après** le push — il ne sert qu'une fois.

*Alternative sans token : je te prépare un bundle/zip du dépôt et tu pousses toi-même
depuis ta machine (`git push` avec ta propre session).*

## 4. Déploiement Vercel (après le push)

Importer le repo sur vercel.com puis définir les **5 variables d'environnement** :

```
DATABASE_URL              = postgresql://neondb_owner:…-pooler…neon.tech/neondb?sslmode=require&pgbouncer=true
NEXTAUTH_URL              = https://ton-domaine.vercel.app
NEXTAUTH_SECRET           = zRVcWnwpEosz8lP198ynoPQbd8GmQmPH1x7Dl3tSYyE=   (ou régénérer : openssl rand -base64 32)
NEXT_PUBLIC_DATA_SOURCE   = api
CLOUDINARY_CLOUD_NAME     = dmnhxis9e
CLOUDINARY_API_KEY        = 358323226916879
CLOUDINARY_API_SECRET     = iJLB823ilh0osfP3VCWf0ToMq7s
```

Aucune migration à lancer : la base est déjà poussée et semée.
