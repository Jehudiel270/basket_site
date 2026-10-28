# CourtLink — Clés à fournir pour le lancement réel

Le code serveur est **prêt et testé** : authentification réelle, base de données,
bus d'actions sécurisé, upload média. Il ne manque que **2 jeux de clés**.

---

## 1. Neon — la vraie base de données (obligatoire)

1. Créer un compte gratuit sur **https://neon.tech** (aucune carte bancaire).
2. Créer un projet (ex. `courtlink`) — région suggérée : `Europe (Frankfurt)`.
3. Ouvrir **Dashboard → Connection Details** et copier la **pooled connection string**.
   Elle ressemble à :
   ```
   postgresql://courtlink_user:xxxxxxxx@ep-xxxx-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   ⚠️ Prendre celle marquée **« pooled »** (avec `-pooler` dans le nom d'hôte) —
   c'est la bonne pour Next.js/Vercel.

**À m'envoyer :** cette chaîne complète `postgresql://…`.

## 2. Cloudinary — upload photos & vidéos (obligatoire)

1. Créer un compte gratuit sur **https://cloudinary.com** (aucune carte bancaire).
2. Dashboard → **Settings → Access Keys** (ou la page d'accueil du dashboard).
3. Récupérer les 3 valeurs :
   - `Cloud name`
   - `API Key`
   - `API Secret`

**À m'envoyer :** ces 3 valeurs.

📌 **Dossier « courtlink »** : c'est déjà géré dans le code — chaque upload
(foto/vidéo/document) est signé côté serveur avec le dossier `courtlink/photos`,
`courtlink/videos` ou `courtlink/documents`. Après le premier upload, le dossier
apparaît dans la **Media Library**. Si vous voulez le voir tout de suite :
Media Library → « Create folder » → nommer `courtlink` (facultatif).

## 3. Ce que je génère moi-même (rien à fournir)

| Variable | Rôle | Statut |
|---|---|---|
| `NEXTAUTH_SECRET` | Signature des sessions | ✅ déjà généré dans `.env` |
| `NEXTAUTH_URL` | URL publique | `http://localhost:3000` ici, à changer sur Vercel |
| `DATABASE_URL` local | Sandbox (SQLite) | ✅ déjà configuré et seedé |

## 4. Ce que je ferai à réception des clés (≈ 10 minutes)

1. Écrire les clés dans `.env` (jamais commité — `.gitignore` ligne 34).
2. `prisma db push` → création des 24 tables dans Neon.
3. `bun prisma/seed.ts` → admin réel + plans (+ comptes démo si vous voulez).
4. Vérification E2E complète sur la vraie base (inscription, connexion, pipeline, upload).
5. Guide Vercel : `vercel` → ajouter les mêmes variables d'environnement → déployer.

## 5. Sécurité des clés

- Elles transitent uniquement par cette conversation et finissent dans `.env`
  (jamais dans le code ni le dépôt git).
- Après mise en ligne, vous pourrez **faire tourner** les clés Cloudinary et
  Neon depuis leurs dashboards respectifs (Rotate/Reset) pour plus de sûreté.

## 6. État actuel du mode réel (déjà vérifié en sandbox)

| Test | Résultat |
|---|---|
| Inscription réelle (email + mot de passe bcrypt) | ✅ compte + profil créés en base |
| Connexion (session JWT signée) | ✅ |
| Modification de profil → écriture en base | ✅ |
| Pipeline de recrutement → statut + historique en base | ✅ |
| Protections : 401 sans session, 409 doublon, 400 validation | ✅ |
| Upload Cloudinary | 🟡 prêt — attend les clés |
| Base Neon de production | 🟡 prête — attend `DATABASE_URL` |
