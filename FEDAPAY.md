# CourtLink — Intégration FedaPay (paiement réel des abonnements)

Les abonnements CourtLink passent désormais par **FedaPay**, l'agrégateur de
paiement ouest-africain : MTN MoMo, Moov Money, Orange Money, Wave et cartes
Visa/Mastercard, facturés en **XOF (FCFA)**.

## 1. Variables d'environnement à ajouter sur Vercel

| Variable | Valeur | Obligatoire |
|----------|--------|-------------|
| `FEDAPAY_SECRET_KEY` | Clé secrète API : `sk_sandbox_…` (test) ou `sk_live_…` (production) — disponible dans **Paramètres → API** du tableau de bord FedaPay | ✅ Oui — sans elle, la plateforme reste en paiement simulé |
| `FEDAPAY_ENVIRONMENT` | `sandbox` ou `live` (défaut : `sandbox`) | Recommandé |
| `FEDAPAY_WEBHOOK_SECRET` | Secret du webhook créé dans FedaPay (**Paramètres → Webhooks**) | Recommandé en production |
| `FEDAPAY_BASE_URL` | URL publique de la plateforme, ex. `https://basketsite.vercel.app` (défaut : origine de la requête) | Optionnel |

> ⚠️ Ne jamais exposer `FEDAPAY_SECRET_KEY` côté client. La clé publique
> (`pk_…`) n'est pas nécessaire : tout se fait côté serveur.

## 2. Endpoints ajoutés

| Route | Rôle |
|-------|------|
| `POST /api/billing/checkout` | Crée la transaction FedaPay + renvoie l'URL de paiement sécurisée (montant relu côté serveur depuis la table `Plan`) |
| `POST /api/billing/verify` | Vérifie le statut réel d'une transaction (`transaction_id`) et active l'abonnement si approuvée |
| `POST /api/billing/webhook` | Reçoit les événements FedaPay signés (`transaction.approved`…) — filet de sécurité serveur |
| `GET /fedapay/retour` | Page de retour après paiement : vérifie la transaction et affiche le résultat |

## 3. Configuration du webhook FedaPay

Dans le tableau de bord FedaPay : **Paramètres → Webhooks → Ajouter**

- URL : `https://basketsite.vercel.app/api/billing/webhook`
- Événements : `transaction.approved`, `transaction.canceled`
- Copier le secret affiché dans `FEDAPAY_WEBHOOK_SECRET` (Vercel)

## 4. Comportement

- **Clés configurées** → le bouton « Payer » ouvre la page FedaPay
  (Mobile Money / cartes). Après paiement, l'utilisateur revient sur
  `/fedapay/retour?transaction_id=…`, la transaction est vérifiée et
  l'abonnement activé (facture, notification, journal d'audit).
- **Clés absentes** → la plateforme conserve son tunnel de démonstration
  simulé existant (aucune transaction réelle). Le mode est détecté
  automatiquement, sans intervention du client.
- Activation **idempotente** : retour navigateur + webhook ne créent jamais
  de doublon. Le paiement est stocké avec l'id déterministe `fpay-<txId>`,
  statut `En attente` → `Confirmé`.

## 5. Passage en production

1. Créer/valider le compte FedaPay (KYC) sur https://fedapay.com
2. Basculer `FEDAPAY_ENVIRONMENT=live` et `FEDAPAY_SECRET_KEY=sk_live_…`
3. Configurer le webhook avec l'URL de production + secret
4. Tester un paiement réel à petit montant (500 FCFA) puis vérifier :
   - facture « Confirmé » dans Espace → Abonnement ;
   - journal d'audit côté admin (Facturation) ;
   - événement visible dans le tableau de bord FedaPay.
