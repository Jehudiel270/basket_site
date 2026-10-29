/**
 * CourtLink — encaissement des abonnements via FedaPay.
 *
 * FedaPay (https://fedapay.com) est l'agrégateur de paiement ouest-africain :
 * MTN MoMo, Moov Money, Orange Money, Wave et cartes Visa/Mastercard, en XOF (FCFA).
 *
 * Flux :
 *   1. POST /api/billing/checkout  → crée une transaction FedaPay + un lien de paiement
 *   2. Le client est redirigé vers la page de paiement sécurisée FedaPay
 *   3. Après paiement, FedaPay ramène l'utilisateur sur /fedapay/retour?transaction_id=…
 *   4. POST /api/billing/verify    → vérifie le statut réel et active l'abonnement
 *   5. POST /api/billing/webhook   → filet de sécurité serveur (transaction.approved)
 *
 * Variables d'environnement (aucune clé en dur dans le code) :
 *   FEDAPAY_SECRET_KEY      sk_sandbox_… ou sk_live_… (obligatoire pour activer le réel)
 *   FEDAPAY_ENVIRONMENT     "sandbox" (défaut) ou "live"
 *   FEDAPAY_WEBHOOK_SECRET  secret du webhook (recommandé en production)
 *   FEDAPAY_BASE_URL        URL publique de la plateforme (défaut : origine de la requête)
 *
 * Sans FEDAPAY_SECRET_KEY, la plateforme conserve le paiement simulé (démonstration).
 */
import crypto from 'node:crypto';
import { db } from '@/lib/db';

export interface FedapayConfig {
  secretKey: string;
  env: 'sandbox' | 'live';
  webhookSecret: string;
}

export function fedapayConfig(): FedapayConfig | null {
  const secretKey = (process.env.FEDAPAY_SECRET_KEY ?? '').trim();
  if (!secretKey) return null;
  const rawEnv = (process.env.FEDAPAY_ENVIRONMENT ?? 'sandbox').trim().toLowerCase();
  return {
    secretKey,
    env: rawEnv === 'live' ? 'live' : 'sandbox',
    webhookSecret: (process.env.FEDAPAY_WEBHOOK_SECRET ?? '').trim(),
  };
}

function apiBase(env: 'sandbox' | 'live'): string {
  return env === 'live' ? 'https://api.fedapay.com/v1' : 'https://sandbox-api.fedapay.com/v1';
}

async function fedapayFetch(cfg: FedapayConfig, path: string, method: 'GET' | 'POST', body?: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiBase(cfg.env)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.secretKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (json as { message?: string; error?: string }).message ?? (json as { error?: string }).error ?? `HTTP ${res.status}`;
    throw new Error(`FedaPay ${path} : ${detail}`);
  }
  return json as Record<string, unknown>;
}

const frDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export interface CheckoutInput {
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  planId: string;
  planName: string;
  planPrice: number;
  annual: boolean;
  origin: string;
}

export interface CheckoutOutput {
  transactionId: string;
  url: string;
  amount: number;
  invoice: string;
}

/**
 * Crée une transaction FedaPay + génère le lien de paiement sécurisé.
 * Enregistre localement un paiement « En attente » (id déterministe fpay-<tx>)
 * pour retrouver l'opération à la confirmation, sans modifier le schéma.
 */
export async function createFedaPayCheckout(input: CheckoutInput): Promise<CheckoutOutput> {
  const cfg = fedapayConfig();
  if (!cfg) throw new Error('FedaPay n\u2019est pas configuré (FEDAPAY_SECRET_KEY manquante).');

  const amount = Math.round(input.annual ? input.planPrice * 10 : input.planPrice);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Montant invalide pour un paiement FedaPay.');

  const [firstname, ...rest] = input.userName.trim().split(/\s+/);
  const callbackUrl = `${input.origin.replace(/\/+$/, '')}/fedapay/retour`;

  const txRes = await fedapayFetch(cfg, '/transactions', 'POST', {
    description: `Abonnement CourtLink ${input.planName} (${input.annual ? 'annuel' : 'mensuel'})`,
    amount,
    currency: { iso: 'XOF' },
    callback_url: callbackUrl,
    customer: {
      firstname: firstname || 'Client',
      lastname: rest.join(' ') || 'CourtLink',
      email: input.userEmail,
      ...(input.userPhone
        ? { phone_number: { number: input.userPhone, country: 'bj' } }
        : {}),
    },
  });

  // Réponse tolérante : {"v1":"transaction","transaction":{…}} ou transaction à plat.
  const tx = (txRes.transaction ?? txRes) as { id?: number | string };
  if (!tx?.id) throw new Error('Réponse FedaPay inattendue (id de transaction absent).');

  const tokenRes = await fedapayFetch(cfg, `/transactions/${tx.id}/token`, 'POST');
  const url =
    (typeof tokenRes.url === 'string' && tokenRes.url) ||
    ((tokenRes.token as { url?: string } | undefined)?.url ?? '');
  if (!url) throw new Error('Lien de paiement FedaPay indisponible.');

  const invoice = `CL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  await db.payment.create({ data: {
    id: `fpay-${tx.id}`,
    userId: '', // renseigné par la route appelante
    user: input.userName,
    plan: input.planName,
    amount: `${amount.toLocaleString('fr-FR')} FCFA`,
    method: `FedaPay · ${input.annual ? 'annuel' : 'mensuel'} (${cfg.env === 'live' ? 'réel' : 'sandbox'})`,
    status: 'En attente',
    date: frDate(new Date()),
    invoice,
  } });

  return { transactionId: String(tx.id), url, amount, invoice };
}

/** Positionne le propriétaire du paiement en attente (séparé pour garder createFedaPayCheckout pur). */
export async function attachPendingOwner(transactionId: string, userId: string): Promise<void> {
  await db.payment.update({ where: { id: `fpay-${transactionId}` }, data: { userId } }).catch(() => undefined);
}

export interface FedapayTransactionStatus {
  id: string;
  status: 'approved' | 'pending' | 'declined' | 'canceled' | 'transferred' | 'refunded' | 'pre_approved' | 'deleted' | string;
  mode: string;
  amount: number;
}

/** Lit le statut réel d'une transaction auprès de FedaPay. */
export async function getFedaPayTransaction(transactionId: string): Promise<FedapayTransactionStatus> {
  const cfg = fedapayConfig();
  if (!cfg) throw new Error('FedaPay n\u2019est pas configuré.');
  const json = await fedapayFetch(cfg, `/transactions/${transactionId}`, 'GET');
  const tx = (json.transaction ?? json) as { id?: number | string; status?: string; mode?: string; amount?: number };
  return {
    id: String(tx.id ?? transactionId),
    status: tx.status ?? 'pending',
    mode: tx.mode ?? 'FedaPay',
    amount: Number(tx.amount ?? 0),
  };
}

/**
 * Active l'abonnement après un paiement FedaPay confirmé (idempotent).
 * Repart du paiement « En attente » local (fpay-<txId>) pour retrouver plan, montant et propriétaire.
 */
export async function activateSubscriptionFromFedaPay(
  transactionId: string,
  via: 'retour utilisateur' | 'webhook',
): Promise<{ ok: boolean; already?: boolean; reason?: string }> {
  const paymentId = `fpay-${transactionId}`;
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { ok: false, reason: 'Paiement introuvable pour cette transaction.' };
  if (payment.status === 'Confirmé') return { ok: true, already: true };

  const plan = await db.plan.findFirst({ where: { name: payment.plan } });
  if (!plan) return { ok: false, reason: 'Offre introuvable pour ce paiement.' };

  const annual = /annuel/i.test(payment.method);
  const renews = frDate(new Date(Date.now() + (annual ? 365 : 30) * 86_400_000));

  const realMode = via === 'webhook' ? 'FedaPay (réel)' : payment.method.replace(/\(en attente\)/i, '').replace('En attente', '').trim() || 'FedaPay (réel)';
  await db.payment.update({ where: { id: paymentId }, data: { status: 'Confirmé', method: realMode } });
  await db.user.update({ where: { id: payment.userId }, data: {
    subPlanId: plan.id,
    subStatus: 'Actif',
    subRenews: renews,
    subSince: frDate(new Date()),
  } });

  const tx = await getFedaPayTransaction(transactionId).catch(() => null);
  await db.auditLog.create({ data: {
    id: `l-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    time: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    actor: payment.user,
    action: `Abonnement ${plan.name} activé via FedaPay (${payment.invoice}, tx ${transactionId}${tx ? `, mode ${tx.mode}` : ''}, ${via})`,
    scope: 'Facturation',
  } });
  await db.notification.create({ data: {
    id: `n-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    userId: payment.userId,
    title: 'Abonnement activé',
    body: `${plan.name} est actif — paiement FedaPay confirmé (facture ${payment.invoice}). Renouvellement le ${renews}.`,
    time: 'À l\u2019instant',
    kind: 'success',
  } });

  return { ok: true };
}

/** Vérifie la signature X-FEDAPAY-SIGNATURE du webhook (HMAC-SHA256, format t=…,v1=…). */
export function verifyFedapaySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false;
  const safeEq = (a: string, b: string) => {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
  };
  try {
    const parts: Record<string, string> = {};
    for (const kv of header.split(',')) {
      const idx = kv.indexOf('=');
      if (idx > 0) parts[kv.slice(0, idx).trim()] = kv.slice(idx + 1).trim();
    }
    if (parts.t && parts.v1) {
      const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex');
      if (safeEq(expected, parts.v1.toLowerCase())) return true;
    }
    const direct = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return safeEq(direct, header.trim().toLowerCase());
  } catch {
    return false;
  }
}
