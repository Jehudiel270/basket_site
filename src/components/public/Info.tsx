'use client';

import { useState } from 'react';
import {
  ChevronLeft, User, Building2, Radar, CalendarDays, ShieldCheck, Headset,
  Crown, HeartHandshake, Search, Upload, Check, Mail, MessageSquare, Send,
  Flag, KeyRound, Smartphone, FileText, Scale, Eye, Lock, AlertTriangle, Play, RefreshCw, Target,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { demoAccounts, roleLabels } from '@/lib/permissions';
import type { Role } from '@/lib/types';
import { SectionHead } from '@/components/common/Bits';
import { cn } from '@/lib/utils';

/* ── Connexion avec comptes démo ── */
export function LoginPage() {
  const { login, dataSource } = useCourtLink();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dataSource === 'api') {
      setBusy(true); setErr('');
      const res = await signIn('credentials', { redirect: false, email, password: pwd });
      setBusy(false);
      if (res?.error) { setErr('E-mail ou mot de passe incorrect.'); return; }
      navigate('/app');
    } else {
      login('player', 'S\u00e8m\u00e8vo Hountondji');
    }
  };

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-6xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-2">
      <div className="flex flex-col justify-center">
        <button onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
        <h1 className="font-display text-3xl font-black md:text-4xl">Connexion</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {dataSource === 'api'
            ? 'Authentification réelle : mot de passe haché (bcrypt), session signée côté serveur. Aucun e-mail de vérification n\u2019est requis.'
            : "Cette démonstration n'utilise pas d'authentification sécurisée : choisissez un compte de test à droite, ou saisissez n'importe quel identifiant pour le rôle visiteur avancé."}
        </p>
        {err && <p className="max-w-md rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">{err}</p>}
        <form className="mt-8 max-w-md space-y-3" onSubmit={submit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adresse e-mail</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="vous@exemple.bj" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mot de passe</label>
            <input value={pwd} onChange={e => setPwd(e.target.value)} type="password" required placeholder="••••••••" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-muted-foreground"><input type="checkbox" className="accent-[var(--ball)]" defaultChecked /> Rester connecté (démo)</label>
            <button type="button" onClick={() => navigate('/recuperation')} className="text-[var(--ball)] hover:underline">Mot de passe oublié ?</button>
          </div>
          <button type="submit" disabled={busy} className="btn-ball w-full disabled:opacity-60">{busy ? 'Connexion…' : dataSource === 'api' ? 'Se connecter' : 'Se connecter (compte joueur démo)'}</button>
        </form>
        <p className="mt-5 text-sm text-muted-foreground">
          Pas encore de compte ? <button onClick={() => navigate('/inscription')} className="font-semibold text-[var(--ball)] hover:underline">Créer un compte</button>
        </p>
      </div>

      <div>
        <div className="card-court p-5">
          <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold"><Play size={16} className="text-[var(--ball)]" /> {dataSource === 'api' ? 'Comptes de la base réelle' : 'Mode démonstration'}</h2>
          <p className="mb-4 text-xs text-muted-foreground">{dataSource === 'api' ? 'Comptes semés en base (mot de passe : demo1234) — la connexion passe par la vraie authentification. Changez ces mots de passe avant l\u2019ouverture publique.' : "Un clic = connexion instantanée avec le rôle choisi. Le menu, les pages et les permissions s'adaptent."}</p>
          <div className="grid gap-2">
            {demoAccounts.map(a => (
              <button key={a.role} onClick={() => {
                if (dataSource === 'api') {
                  signIn('credentials', { redirect: false, email: a.email, password: 'demo1234' }).then(res => {
                    if (res?.error) toast.error('Compte démo absent de la base réelle — lancez bun prisma/seed.ts.');
                    else navigate(a.role === 'admin' ? '/admin' : '/app');
                  });
                } else { login(a.role, a.name); navigate(a.role === 'admin' ? '/admin' : '/app'); }
              }}
                className="group flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-all hover:border-[var(--ball)] hover:bg-[color-mix(in_oklch,var(--ball)_6%,transparent)]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--ball)_14%,transparent)] font-display text-xs font-bold text-[var(--ball)]">
                  {a.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{roleLabels[a.role]}</span>
                  <span className="block truncate text-xs text-muted-foreground">{a.note}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ball)] opacity-0 transition-opacity group-hover:opacity-100">Entrer</span>
              </button>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--amber-glow)]/40 bg-[color-mix(in_oklch,var(--amber-glow)_8%,transparent)] p-3 text-[11px] leading-relaxed text-muted-foreground">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[var(--amber-glow)]" />
            Le changement de rôle est explicitement réservé à la démonstration. En production, l'authentification sera sécurisée (2FA, sessions, RBAC serveur).
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Inscription avec choix de rôle ── */
export function RegisterPage() {
  const { login, settings, dataSource } = useCourtLink();
  const [role, setRole] = useState<Role>('player');
  const [done, setDone] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [country, setCountry] = useState('Bénin');
  const [phone, setPhone] = useState('');
  const [orgName, setOrgName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dataSource !== 'api') { login(role); setDone(true); return; }
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pwd, role, country, phone: phone || undefined, orgName: role === 'club' ? orgName : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setBusy(false); setErr(data.error || 'Inscription impossible pour le moment.'); return; }
      const li = await signIn('credentials', { redirect: false, email, password: pwd });
      if (li?.error) { setBusy(false); setErr('Compte créé — connectez-vous.'); navigate('/connexion'); return; }
      navigate('/app');
    } catch {
      setBusy(false);
      setErr('Réseau indisponible — réessayez.');
    }
  };

  const roleCards: { role: Role; icon: typeof User; desc: string }[] = [
    { role: 'player', icon: User, desc: 'Profil sportif, stats, vidéos, candidatures' },
    { role: 'guardian', icon: HeartHandshake, desc: 'Gérer un joueur mineur et ses consentements' },
    { role: 'club', icon: Building2, desc: 'Recruter, publier des offres, gérer un effectif' },
    { role: 'scout', icon: Radar, desc: 'Scouter, évaluer, comparer des profils' },
    { role: 'organizer', icon: CalendarDays, desc: 'Créer combines, tournois et camps' },
  ];

  if (done) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-green-400 pop-in"><Check size={32} /></span>
        <h1 className="font-display text-2xl font-black">Compte de démonstration créé !</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Vous êtes connecté comme <strong>{roleLabels[role]}</strong>. En production, un e-mail de vérification serait envoyé ; les comptes club/scout passeraient d'abord par la vérification documentaire.
        </p>
        <div className="mt-6 flex gap-2">
          <button onClick={() => navigate(role === 'admin' ? '/admin' : '/app')} className="btn-ball">Ouvrir mon espace</button>
          <button onClick={() => navigate('/')} className="btn-ghosty">Explorer le site</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <h1 className="font-display text-3xl font-black md:text-4xl">Créer mon compte</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Choisissez d'abord votre rôle : il détermine votre espace de travail et vos permissions. Un même compte = un rôle (les rôles multiples arrivent en production).
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {roleCards.map(r => (
          <button key={r.role} onClick={() => setRole(r.role)}
            className={cn('card-court flex items-start gap-3 p-4 text-left !translate-y-0', role === r.role && 'border-[var(--ball)] bg-[color-mix(in_oklch,var(--ball)_8%,transparent)]')}>
            <r.icon size={20} className={cn('mt-0.5', role === r.role ? 'text-[var(--ball)]' : 'text-muted-foreground')} />
            <span>
              <span className="block font-display text-sm font-bold">{roleLabels[r.role]}</span>
              <span className="block text-xs text-muted-foreground">{r.desc}</span>
            </span>
            {role === r.role && <Check size={16} className="ml-auto text-[var(--ball)]" />}
          </button>
        ))}
      </div>

      {err && <p className="mt-4 max-w-xl rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">{err}</p>}
      <form className="card-court mt-6 max-w-xl p-6" onSubmit={submit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nom complet *</label>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Awa Ndiaye" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail *</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.bj" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pays *</label>
            <select value={country} onChange={e => setCountry(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
              {['Bénin', "Côte d'Ivoire", 'Togo', 'Sénégal', 'Burkina Faso', 'Cameroun', 'Mali', 'Guinée', 'Nigéria', 'Ghana'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Téléphone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+229 …" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
          </div>
          {role === 'club' && (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nom de la structure *</label>
              <input required value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Ex : Cotonou Hoopers Academy" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mot de passe *</label>
            <input required type="password" minLength={8} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="8 caractères minimum" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
          </div>
        </div>
        {['club', 'scout', 'organizer'].includes(role) && (
          <div className="mt-4 rounded-lg border border-[var(--ball)]/30 bg-[color-mix(in_oklch,var(--ball)_6%,transparent)] p-3.5 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Prochaine étape (production) :</strong> votre structure devra soumettre ses documents de vérification (registre, ligue, licences). Non vérifié, vous ne pourrez pas vous présenter comme club reconnu ni publier d'opportunité.
          </div>
        )}
        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs text-muted-foreground">
          <input required type="checkbox" className="mt-0.5 accent-[var(--ball)]" />
          J'accepte les <button type="button" onClick={() => navigate('/conditions')} className="text-[var(--ball)] underline">conditions d'utilisation</button> et la <button type="button" onClick={() => navigate('/confidentialite')} className="text-[var(--ball)] underline">politique de confidentialité</button>.
        </label>
        <button type="submit" disabled={busy} className="btn-ball mt-5 w-full disabled:opacity-60">{busy ? 'Création…' : `Créer mon compte ${roleLabels[role]}`}</button>
        <p className="mt-3 text-center text-xs text-muted-foreground">Déjà inscrit ? <button type="button" onClick={() => navigate('/connexion')} className="text-[var(--ball)] hover:underline">Se connecter</button></p>
      </form>
    </div>
  );
}

/* ── Récupération de compte ── */
export function ForgotPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4">
      {!sent ? (
        <>
          <h1 className="font-display text-3xl font-black">Récupérer mon compte</h1>
          <p className="mt-3 text-sm text-muted-foreground">Saisissez votre e-mail ou votre numéro : nous vous envoyons un code de réinitialisation (simulé dans la démo).</p>
          <form className="mt-6 space-y-3" onSubmit={e => { e.preventDefault(); setSent(true); }}>
            <input required placeholder="vous@exemple.bj ou +229 97 …" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
            <button type="submit" className="btn-ball w-full"><Send size={15} /> Envoyer le code</button>
          </form>
          <button onClick={() => navigate('/connexion')} className="mt-4 text-sm text-muted-foreground hover:text-[var(--ball)]">← Retour à la connexion</button>
        </>
      ) : (
        <div className="text-center">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--ball)_15%,transparent)] text-[var(--ball)] pop-in"><KeyRound size={28} /></span>
          <h1 className="font-display text-2xl font-black">Code envoyé (simulation)</h1>
          <p className="mt-3 text-sm text-muted-foreground">Dans la production : SMS + e-mail, code valable 10 minutes, et obligation de re-définir un mot de passe fort.</p>
          <button onClick={() => navigate('/connexion')} className="btn-ball mt-6">Revenir à la connexion</button>
        </div>
      )}
    </div>
  );
}

/* ── Fonctionnement joueurs ── */
export function HowPlayerPage() {
  const steps = [
    { icon: User, t: 'Créez votre profil sportif', d: 'Photo, nationalité, taille, postes, main dominante, club actuel, historique d\'équipes et formation scolaire. 10 minutes chrono.' },
    { icon: Upload, t: 'Ajoutez stats et vidéos', d: 'Moyennes par saison et compétition (points, rebonds, passes, % de tir) + liens de highlights. Un profil avec vidéo reçoit 3× plus de consultations.' },
    { icon: Eye, t: 'Choisissez votre visibilité', d: 'Public, membres connectés ou privé. Les joueurs mineurs sont protégés : coordonnées masquées et consentement du tuteur obligatoire.' },
    { icon: Target, t: 'Postulez aux opportunités', d: 'Contrats, essais, camps, bourses. Suivez chaque candidature dans votre pipeline personnel : de « Nouveau » à « Retenu ».' },
    { icon: MessageSquare, t: 'Discutez en direct', d: 'Messagerie intégrée avec les clubs et scouts vérifiés. Notifications à chaque évolution de votre dossier.' },
    { icon: Search, t: 'Suivez vos consultations', d: 'Voyez combien de recruteurs ont vu votre profil et vos vidéos, et les clubs qui vous suivent.' },
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <div className="relative overflow-hidden rounded-3xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/academy.jpg" alt="Entraînement de basketball" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,9,8,0.95)] to-[rgba(10,9,8,0.4)]" />
        <div className="relative z-10 p-8 md:p-12">
          <span className="chip border-[var(--ball)]/50 text-[var(--ball)]">Parcours joueur</span>
          <h1 className="mt-3 max-w-lg font-display text-3xl font-black text-white md:text-4xl">Votre talent mérite un profil qui dit vrai.</h1>
          <p className="mt-3 max-w-md text-sm text-white/70">Gratuit pour toujours. Créez, complétez, postulez — et laissez les recruteurs venir à vous.</p>
          <button onClick={() => navigate('/inscription')} className="btn-ball mt-6">Créer mon profil gratuit</button>
        </div>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.t} className="card-court p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--ball)_14%,transparent)] text-[var(--ball)]"><s.icon size={18} /></span>
              <span className="font-score text-sm text-[var(--ball)]">0{i + 1}</span>
            </div>
            <h3 className="font-display text-base font-bold">{s.t}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-[var(--ball)]/30 bg-[color-mix(in_oklch,var(--ball)_6%,transparent)] p-6">
        <h2 className="font-display text-lg font-bold">Ce que CourtLink n'est pas</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          CourtLink n'est pas un agent licencié, n'est affilié à aucune fédération et ne garantit ni sélection, ni bourse, ni contrat. La plateforme met en relation : la décision finale appartient toujours aux clubs et académies. En cas de comportement suspect, signalez immédiatement via la page <button onClick={() => navigate('/signaler')} className="text-[var(--ball)] underline">Signaler</button>.
        </p>
      </div>
    </div>
  );
}

/* ── Fonctionnement clubs ── */
export function HowClubPage() {
  const steps = [
    { icon: Building2, t: 'Faites vérifier votre structure', d: 'Registre de commerce, attestation de ligue, licences du staff. Le badge vérifié s\'affiche sur toutes vos annonces.' },
    { icon: Search, t: 'Recherchez avec précision', d: 'Filtres multicritères : poste, taille, catégorie d\'âge, pays, club, statistiques, disponibilité, niveau de vérification.' },
    { icon: Radar, t: 'Évaluez et comparez', d: 'Listes de présélection, comparateur de profils, rapports de scouting structurés et notes privées — rien n\'est visible par les joueurs.' },
    { icon: Send, t: 'Pilotez votre pipeline', d: 'Nouveau → À examiner → Présélectionné → Contacté → Essai → Retenu. Chaque changement notifie le joueur instantanément.' },
    { icon: CalendarDays, t: 'Organisez et analysez', d: 'Publiez des opportunités datées, invitez à des essais et suivez vos analytics de recrutement.' },
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <div className="relative overflow-hidden rounded-3xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/club-hq.jpg" alt="Installation de club" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,9,8,0.95)] to-[rgba(10,9,8,0.4)]" />
        <div className="relative z-10 p-8 md:p-12">
          <span className="chip border-[var(--ball)]/50 text-[var(--ball)]">Parcours club · scout · académie</span>
          <h1 className="mt-3 max-w-lg font-display text-3xl font-black text-white md:text-4xl">Recrutez mieux, avec des données qui disent vrai.</h1>
          <p className="mt-3 max-w-md text-sm text-white/70">Effectifs vérifiés, pipeline structuré, scouting confidentiel — plan Club Pro à partir de 25 000 FCFA (démo).</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => navigate('/inscription')} className="btn-ball">Créer un compte structure</button>
            <button onClick={() => navigate('/tarifs')} className="btn-ghosty border-white/25 text-white">Voir les offres</button>
          </div>
        </div>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {steps.map((s, i) => (
          <div key={s.t} className="card-court p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--ball)_14%,transparent)] text-[var(--ball)]"><s.icon size={18} /></span>
              <span className="font-score text-sm text-[var(--ball)]">0{i + 1}</span>
            </div>
            <h3 className="font-display text-base font-bold">{s.t}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Aide & FAQ ── */
export function FaqPage() {
  const cats = [
    {
      title: 'Comptes & rôles', icon: User, items: [
        { q: 'Quels rôles existent sur CourtLink ?', a: 'Huit rôles : joueur, parent/tuteur, club/académie, recruteur/scout, organisateur d\'événements, modérateur, support et administrateur. Chaque rôle a son menu, ses pages et ses permissions propres.' },
        { q: 'Comment obtenir le badge « vérifié » ?', a: 'Déposez vos documents depuis votre espace (acte de naissance + certificat médical + attestation de club pour les joueurs ; registre + attestation de ligue pour les structures). Un modérateur statue en 48 h ouvrées (démonstration instantanée).' },
        { q: 'Puis-je changer de rôle plus tard ?', a: 'En production, une demande de rôle supplémentaire sera possible avec justificatifs. Dans cette démo, reconnectez-vous avec un autre compte de test.' },
      ],
    },
    {
      title: 'Données & protection des mineurs', icon: ShieldCheck, items: [
        { q: 'Comment les mineurs sont-ils protégés ?', a: 'Un joueur mineur doit être rattaché à un tuteur légal. Les coordonnées sont masquées, tout contact passe par une demande de consentement, et le tuteur contrôle la visibilité du profil et peut signaler tout comportement suspect.' },
        { q: 'Qui peut voir mes statistiques ?', a: 'Vous choisissez : public, membres connectés ou privé. Les évaluations confidentielles des scouts ne sont jamais visibles des joueurs.' },
        { q: 'Où sont stockées mes données ?', a: 'Dans cette démonstration : localStorage de votre navigateur. En production : base PostgreSQL hébergée, chiffrement au repos, export et suppression sur demande.' },
      ],
    },
    {
      title: 'Recrutement & opportunités', icon: TargetIcon, items: [
        { q: 'CourtLink garantit-il un contrat ?', a: 'Non. La plateforme facilite la découverte et la mise en relation. Aucune sélection, bourse ou rémunération n\'est garantie, et CourtLink n\'agit pas comme agent licencié.' },
        { q: 'Comment publier une opportunité ?', a: 'Seules les structures vérifiées peuvent publier. Depuis l\'espace club : Publier une opportunité → critères, conditions, dates → l\'annonce apparaît immédiatement dans l\'annuaire public.' },
        { q: 'Que signifie le pipeline de recrutement ?', a: 'Les statuts d\'une candidature côté club : Nouveau, À examiner, Présélectionné, Contacté, Essai proposé, Retenu, Refusé. Le joueur voit ces statuts évoluer en temps réel.' },
      ],
    },
    {
      title: 'Paiement & abonnement', icon: Smartphone, items: [
        { q: 'Les paiements sont-ils réels ?', a: 'Non — entièrement simulés. Le paiement réel en FCFA (Mobile Money, carte, virement) sera intégré avant le lancement commercial.' },
        { q: 'Puis-je résilier à tout moment ?', a: 'Oui, depuis votre espace Abonnement. L\'accès repasse au plan Découverte gratuit, sans perte de vos données.' },
      ],
    },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <h1 className="font-display text-3xl font-black md:text-4xl">Centre d'aide & FAQ</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Les réponses aux questions les plus fréquentes. Pour tout le reste, le support répond en moins de 24 h ouvrées.</p>
      <div className="mt-8 space-y-8">
        {cats.map(c => (
          <section key={c.title}>
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--ball)_14%,transparent)] text-[var(--ball)]"><c.icon size={17} /></span>
              {c.title}
            </h2>
            <div className="space-y-2.5">
              {c.items.map(i => (
                <details key={i.q} className="card-court !translate-y-0 p-4 [&[open]]:border-[var(--ball)]/40">
                  <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden"><span className="mr-2 text-[var(--ball)]">+</span>{i.q}</summary>
                  <p className="mt-2.5 pl-5 text-sm leading-relaxed text-muted-foreground">{i.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="card-court mt-10 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h3 className="font-display text-lg font-bold">Pas trouvé votre réponse ?</h3>
          <p className="text-sm text-muted-foreground">Ouvrez un ticket : réponse garantie sous 24 h ouvrées.</p>
        </div>
        <button onClick={() => navigate('/contact')} className="btn-ball"><Mail size={15} /> Contacter le support</button>
      </div>
    </div>
  );
}
function TargetIcon(props: React.SVGProps<SVGSVGElement>) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.5"/></svg>; }

/* ── Contact ── */
export function ContactPage() {
  const { createTicket } = useCourtLink();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', topic: 'Question générale', body: '' });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <h1 className="font-display text-3xl font-black md:text-4xl">Contact & support</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Une question, un bug, une demande de partenariat ? Écrivez-nous : votre message crée un ticket suivi dans le centre de support.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form className="card-court p-6" onSubmit={e => { e.preventDefault(); createTicket(form.body.slice(0, 60) || 'Message de contact', form.topic, form.body); setSent(true); }}>
          {sent ? (
            <div className="py-8 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400 pop-in"><Check size={26} /></span>
              <h3 className="font-display text-xl font-bold">Message envoyé !</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Votre ticket est visible dans le centre de support (connectez-vous avec le rôle Support pour voir la réponse simulée).</p>
              <button type="button" onClick={() => { setSent(false); setForm({ name: '', email: '', topic: 'Question générale', body: '' }); }} className="btn-ghosty mt-5"><RefreshCw size={14} /> Envoyer un autre message</button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nom *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
                </div>
              </div>
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sujet</label>
                <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
                  {['Question générale', 'Problème technique', 'Facturation', 'Vérification de compte', 'Partenariat', 'Presse'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message *</label>
                <textarea required rows={5} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Décrivez votre demande (20 caractères minimum)…" className="w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-[var(--ball)]" />
              </div>
              <button type="submit" className="btn-ball mt-4 w-full"><Send size={15} /> Envoyer mon message</button>
            </>
          )}
        </form>
        <div className="space-y-4">
          <div className="card-court p-5">
            <h3 className="mb-3 font-display text-base font-bold">Autres canaux</h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2.5 text-muted-foreground"><Mail size={15} className="text-[var(--ball)]" /> support@courtlink.demo</p>
              <p className="flex items-center gap-2.5 text-muted-foreground"><MessageSquare size={15} className="text-[var(--ball)]" /> Chat en direct (bientôt)</p>
              <p className="flex items-center gap-2.5 text-muted-foreground"><Smartphone size={15} className="text-[var(--ball)]" /> WhatsApp Business (bientôt)</p>
              <p className="flex items-center gap-2.5 text-muted-foreground"><FileText size={15} className="text-[var(--ball)]" /> Cotonou, Bénin — siège fictif de démonstration</p>
            </div>
          </div>
          <div className="card-court p-5">
            <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold"><Flag size={15} className="text-destructive" /> Urgence & sécurité</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Pour signaler un comportement inquiétant impliquant un mineur, utilisez la page <button onClick={() => navigate('/signaler')} className="font-semibold text-[var(--ball)] underline">Signaler</button> — traitement prioritaire sous 2 h.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Signaler ── */
export function ReportPage() {
  const { submitReport } = useCourtLink();
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <h1 className="font-display text-3xl font-black md:text-4xl">Signaler un contenu ou un comportement</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Signalements traités par l'équipe de modération. Les cas impliquant des mineurs sont prioritaires. Votre identité reste confidentielle vis-à-vis de la personne signalée.
      </p>
      {sent ? (
        <div className="card-court mt-8 p-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400 pop-in"><Check size={26} /></span>
          <h2 className="font-display text-xl font-bold">Signalement transmis</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Il apparaît immédiatement dans la file de modération. Un accusé de réception vous sera notifié.</p>
          <button onClick={() => setSent(false)} className="btn-ghosty mt-5">Faire un autre signalement</button>
        </div>
      ) : (
        <form className="card-court mt-8 p-6" onSubmit={e => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          submitReport(String(fd.get('target')), String(fd.get('reason')), String(fd.get('details')));
          setSent(true);
        }}>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cible du signalement *</label>
              <input name="target" required placeholder="Nom du profil, du compte ou du contenu" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motif *</label>
              <select name="reason" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
                {['Contact non sollicité vers un mineur', 'Usurpation d\'identité', 'Statistiques ou documents falsifiés', 'Contenu inapproprié', 'Comportement abusif ou harcèlement', 'Arnaque ou promesse de paiement', 'Autre'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Détails *</label>
              <textarea name="details" required rows={5} minLength={20} placeholder="Décrivez les faits : qui, quoi, où, quand. Captures d'écran bienvenues (liens)." className="w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-[var(--ball)]" />
            </div>
            <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <input required type="checkbox" className="mt-0.5 accent-[var(--ball)]" />
              Je certifie que ces informations sont exactes. Un faux signalement délibéré est une violation des conditions d'utilisation.
            </label>
            <button type="submit" className="btn-ball w-full"><Flag size={15} /> Transmettre à la modération</button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Confidentialité ── */
export function PrivacyPage() {
  const sections = [
    { icon: Lock, t: '1. Données collectées', b: 'CourtLink collecte uniquement les données nécessaires au service : identité déclarée, données sportives (taille, postes, statistiques), contenus publiés (photos, vidéos), et données d\'usage (consultations de profil). Aucune donnée sensible de santé n\'est stockée au-delà du certificat médical attesté par un tiers.' },
    { icon: Eye, t: '2. Finalités d\'utilisation', b: 'Vos données servent à : afficher votre profil selon votre visibilité choisie, mettre en relation joueurs et recruteurs, notifier les évolutions de candidatures, et améliorer la qualité des données (vérification). Elles ne sont jamais revendues à des tiers.' },
    { icon: ShieldCheck, t: '3. Protection des mineurs', b: 'Tout compte de joueur mineur (moins de 18 ans) doit être rattaché à un tuteur légal identifié. Le tuteur approuve la création du profil, contrôle la visibilité, reçoit les demandes de contact et peut suspendre le profil à tout moment. Les coordonnées des mineurs ne sont jamais publiques ; la messagerie est filtrée et journalisée.' },
    { icon: Scale, t: '4. Droits des utilisateurs', b: 'Conformément à la réglementation applicable (dont la loi 2017-20 portant code du numérique en République du Bénin et le RGPD pour les utilisateurs européens) : accès, rectification, suppression, portabilité et opposition. Dans la démonstration, la réinitialisation des données démo efface tout le localStorage.' },
    { icon: AlertTriangle, t: '5. Conservation & sécurité', b: 'Prototype : données stockées uniquement dans le localStorage de votre navigateur, supprimables via « Réinitialiser la démo ». Production visée : chiffrement au repos, journalisation des accès administrateurs, hébergement conforme, purge des comptes inactifs après 24 mois.' },
    { icon: FileText, t: '6. Cookies & traceurs', b: 'La démonstration n\'utilise aucun cookie tiers ni traceur publicitaire. Seul le stockage local des préférences de démonstration est utilisé. La version production affichera un bandeau de consentement conforme.' },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <h1 className="font-display text-3xl font-black md:text-4xl">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-muted-foreground">Version de démonstration — document à finaliser avec un conseil juridique avant tout lancement commercial.</p>
      <div className="mt-8 space-y-4">
        {sections.map(s => (
          <section key={s.t} className="card-court p-6">
            <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold"><s.icon size={17} className="text-[var(--ball)]" /> {s.t}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.b}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ── Conditions ── */
export function TermsPage() {
  const sections = [
    { t: 'Article 1 — Objet', b: 'Les présentes conditions régissent l\'utilisation du prototype CourtLink, plateforme de mise en relation entre joueurs de basketball, clubs, académies, recruteurs et organisateurs d\'événements, principalement destinée au Bénin et à l\'Afrique de l\'Ouest francophone.' },
    { t: 'Article 2 — Nature de la plateforme', b: 'CourtLink est un intermédiaire technique de découverte et de mise en relation. La plateforme : n\'est pas un agent sportif licencié ; n\'est affiliée à aucune fédération nationale ou internationale sans partenariat explicite et documenté ; ne garantit aucune sélection, bourse, contrat, rémunération ou issue de recrutement.' },
    { t: 'Article 3 — Comptes et vérification', b: 'Chaque utilisateur est responsable de l\'exactitude des informations publiées. Les comptes d\'organisations et de recruteurs doivent passer par une vérification documentaire avant de publier des opportunités ou de se présenter comme structure reconnue. Toute usurpation entraîne la suspension immédiate du compte.' },
    { t: 'Article 4 — Comportements interdits', b: 'Sont interdits : la falsification de statistiques ou de documents ; le contact non sollicité et répété de mineurs en contournant le consentement parental ; les promesses de sélection ou de paiement contre rémunération ; le harcèlement, les discriminations ; la collecte automatisée de données (scraping) ; la revente d\'accès.' },
    { t: 'Article 5 — Modération et sanctions', b: 'L\'équipe de modération peut : demander des corrections, masquer temporairement un contenu, suspendre un compte, et transmettre aux autorités compétentes tout signalement grave, notamment ceux impliquant la sécurité des mineurs. Chaque décision est justifiée et journalisée.' },
    { t: 'Article 6 — Abonnements et paiement', b: 'Les abonnements (démonstration) donnent accès à des fonctionnalités : visibilité, outils de recherche, gestion. Ils n\'achètent jamais une sélection sportive. Les prix affichés sont des valeurs de démonstration ; le paiement réel sera opéré en FCFA via des prestataires locaux avant lancement commercial, avec droit de rétractation applicable.' },
    { t: 'Article 7 — Responsabilité', b: 'CourtLink ne peut être tenu responsable des relations conclues entre utilisateurs (essais, contrats, transferts), ni de l\'exactitude des contenus fournis par les utilisateurs. Les décisions sportives relèvent exclusivement des clubs et organisations.' },
    { t: 'Article 8 — Évolution des conditions', b: 'Ces conditions de démonstration seront remplacées par des conditions définitives validées juridiquement avant tout lancement commercial. Les utilisateurs seront notifiés de toute modification substantielle.' },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <h1 className="font-display text-3xl font-black md:text-4xl">Conditions d'utilisation</h1>
      <p className="mt-2 text-sm text-muted-foreground">Version de démonstration — 8 articles.</p>
      <div className="mt-8 space-y-4">
        {sections.map(s => (
          <section key={s.t} className="card-court p-6">
            <h2 className="mb-2 font-display text-lg font-bold">{s.t}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.b}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">Dernière mise à jour : octobre 2026 (prototype).</p>
    </div>
  );
}
