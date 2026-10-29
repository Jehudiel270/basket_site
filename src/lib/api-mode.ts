'use client';

/**
 * CourtLink — client « mode réel ».
 * isApiMode() : la source de données est pilotée par NEXT_PUBLIC_DATA_SOURCE
 * (voir .env). En mode "api", le store s'hydrate depuis /api/state et chaque
 * mutation est répliquée vers /api/actions/[action] (vraie base de données).
 */

export const isApiMode = (): boolean =>
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DATA_SOURCE === 'api';

/** POST vers le bus d'actions serveur. Silencieux en cas d'échec réseau. */
export async function pushAction(action: string, payload: unknown): Promise<boolean> {
  try {
    const res = await fetch(`/api/actions/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn(`[courtlink] action ${action} refusée (${res.status}) :`, data.error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[courtlink] action ${action} indisponible :`, e);
    return false;
  }
}

/** Comme pushAction, mais renvoie la réponse complète (données + erreurs) pour les actions interactives. */
export async function pushActionResult<T = Record<string, unknown>>(action: string, payload: unknown): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const res = await fetch(`/api/actions/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: (data as { error?: string }).error ?? `Erreur ${res.status}` };
    return { ok: true, status: res.status, data: data as T };
  } catch {
    return { ok: false, status: 0, error: 'Serveur indisponible.' };
  }
}

/** Charge le snapshot serveur complet (données scoppées par session). */
export async function fetchState<T>(): Promise<T | null> {
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (e) {
    console.warn('[courtlink] /api/state indisponible :', e);
    return null;
  }
}

export interface UploadResult { url: string; bytes: number; type: string }

/**
 * Upload réel d'un média vers Cloudinary (dossier courtlink/<kind>).
 * 1) récupère une signature côté serveur ; 2) envoie le fichier directement à Cloudinary.
 */
export async function uploadMedia(file: File, kind: 'photos' | 'videos' | 'documents'): Promise<UploadResult> {
  const signRes = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind }),
  });
  if (!signRes.ok) {
    const data = await signRes.json().catch(() => ({}));
    throw new Error(data.error || 'Upload indisponible.');
  }
  const { cloudName, apiKey, timestamp, signature, folder } = await signRes.json();

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);

  const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: form });
  if (!upRes.ok) {
    const err = await upRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Échec de l\u2019upload vers Cloudinary.');
  }
  const out = await upRes.json();
  return { url: out.secure_url as string, bytes: out.bytes as number, type: out.resource_type as string };
}
