#!/usr/bin/env python3
# Patch de src/components/public/Info.tsx : vraie connexion/inscription en mode api.
import io, sys

PATH = '/home/z/my-project/src/components/public/Info.tsx'
src = io.open(PATH, encoding='utf-8').read()

edits = [
    # imports
    (
        "import { navigate } from '@/lib/router';\nimport { useCourtLink } from '@/lib/store';",
        "import { signIn } from 'next-auth/react';\nimport { toast } from 'sonner';\nimport { navigate } from '@/lib/router';\nimport { useCourtLink } from '@/lib/store';",
    ),
    # ── LoginPage : état + soumission réelle ──
    (
        "export function LoginPage() {\n  const { login } = useCourtLink();\n  const [email, setEmail] = useState('');\n  const [pwd, setPwd] = useState('');",
        "export function LoginPage() {\n  const { login, dataSource } = useCourtLink();\n  const [email, setEmail] = useState('');\n  const [pwd, setPwd] = useState('');\n  const [busy, setBusy] = useState(false);\n  const [err, setErr] = useState('');\n\n  const submit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (dataSource === 'api') {\n      setBusy(true); setErr('');\n      const res = await signIn('credentials', { redirect: false, email, password: pwd });\n      setBusy(false);\n      if (res?.error) { setErr('E-mail ou mot de passe incorrect.'); return; }\n      navigate('/app');\n    } else {\n      login('player', 'S\\u00e8m\\u00e8vo Hountondji');\n    }\n  };",
    ),
    (
        "        <p className=\"mt-3 max-w-md text-sm leading-relaxed text-muted-foreground\">\n          Cette démonstration n'utilise pas d'authentification sécurisée : choisissez un compte de test à droite, ou saisissez n'importe quel identifiant pour le rôle visiteur avancé.\n        </p>",
        "        <p className=\"mt-3 max-w-md text-sm leading-relaxed text-muted-foreground\">\n          {dataSource === 'api'\n            ? 'Authentification réelle : mot de passe haché (bcrypt), session signée côté serveur. Aucun e-mail de vérification n\\u2019est requis.'\n            : \"Cette démonstration n'utilise pas d'authentification sécurisée : choisissez un compte de test à droite, ou saisissez n'importe quel identifiant pour le rôle visiteur avancé.\"}\n        </p>",
    ),
    (
        "        <form className=\"mt-8 max-w-md space-y-3\" onSubmit={e => { e.preventDefault(); login('player', 'Sèmèvo Hountondji'); }}>",
        "        {err && <p className=\"max-w-md rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400\">{err}</p>}\n        <form className=\"mt-8 max-w-md space-y-3\" onSubmit={submit}>",
    ),
    (
        "          <button type=\"submit\" className=\"btn-ball w-full\">Se connecter (compte joueur démo)</button>",
        "          <button type=\"submit\" disabled={busy} className=\"btn-ball w-full disabled:opacity-60\">{busy ? 'Connexion…' : dataSource === 'api' ? 'Se connecter' : 'Se connecter (compte joueur démo)'}</button>",
    ),
    # panneau démo : en mode api, passe par la vraie auth
    (
        "            {demoAccounts.map(a => (\n              <button key={a.role} onClick={() => { login(a.role, a.name); navigate(a.role === 'admin' ? '/admin' : '/app'); }}",
        "            {demoAccounts.map(a => (\n              <button key={a.role} onClick={() => {\n                if (dataSource === 'api') {\n                  signIn('credentials', { redirect: false, email: a.email, password: 'demo1234' }).then(res => {\n                    if (res?.error) toast.error('Compte démo absent de la base réelle — lancez bun prisma/seed.ts.');\n                    else navigate(a.role === 'admin' ? '/admin' : '/app');\n                  });\n                } else { login(a.role, a.name); navigate(a.role === 'admin' ? '/admin' : '/app'); }\n              }}}",
    ),
    (
        "          <h2 className=\"mb-1 flex items-center gap-2 font-display text-lg font-bold\"><Play size={16} className=\"text-[var(--ball)]\" /> Mode démonstration</h2>\n          <p className=\"mb-4 text-xs text-muted-foreground\">Un clic = connexion instantanée avec le rôle choisi. Le menu, les pages et les permissions s'adaptent.</p>",
        "          <h2 className=\"mb-1 flex items-center gap-2 font-display text-lg font-bold\"><Play size={16} className=\"text-[var(--ball)]\" /> {dataSource === 'api' ? 'Comptes de la base réelle' : 'Mode démonstration'}</h2>\n          <p className=\"mb-4 text-xs text-muted-foreground\">{dataSource === 'api' ? 'Comptes semés en base (mot de passe : demo1234) — la connexion passe par la vraie authentification. Changez ces mots de passe avant l\\u2019ouverture publique.' : \"Un clic = connexion instantanée avec le rôle choisi. Le menu, les pages et les permissions s'adaptent.\"}</p>",
    ),
    # ── RegisterPage : inscription réelle ──
    (
        "export function RegisterPage() {\n  const { login, settings } = useCourtLink();\n  const [role, setRole] = useState<Role>('player');\n  const [done, setDone] = useState(false);",
        "export function RegisterPage() {\n  const { login, settings, dataSource } = useCourtLink();\n  const [role, setRole] = useState<Role>('player');\n  const [done, setDone] = useState(false);\n  const [name, setName] = useState('');\n  const [email, setEmail] = useState('');\n  const [pwd, setPwd] = useState('');\n  const [country, setCountry] = useState('Bénin');\n  const [phone, setPhone] = useState('');\n  const [orgName, setOrgName] = useState('');\n  const [busy, setBusy] = useState(false);\n  const [err, setErr] = useState('');\n\n  const submit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (dataSource !== 'api') { login(role); setDone(true); return; }\n    setBusy(true); setErr('');\n    try {\n      const res = await fetch('/api/auth/register', {\n        method: 'POST', headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ name, email, password: pwd, role, country, phone: phone || undefined, orgName: role === 'club' ? orgName : undefined }),\n      });\n      const data = await res.json().catch(() => ({}));\n      if (!res.ok) { setBusy(false); setErr(data.error || 'Inscription impossible pour le moment.'); return; }\n      const li = await signIn('credentials', { redirect: false, email, password: pwd });\n      if (li?.error) { setBusy(false); setErr('Compte créé — connectez-vous.'); navigate('/connexion'); return; }\n      navigate('/app');\n    } catch {\n      setBusy(false);\n      setErr('Réseau indisponible — réessayez.');\n    }\n  };",
    ),
    (
        "      <form className=\"card-court mt-6 max-w-xl p-6\" onSubmit={e => { e.preventDefault(); login(role); setDone(true); }}>",
        "      {err && <p className=\"mt-4 max-w-xl rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400\">{err}</p>}\n      <form className=\"card-court mt-6 max-w-xl p-6\" onSubmit={submit}>",
    ),
    (
        "          <div>\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">Nom complet *</label>\n            <input required placeholder=\"Ex : Awa Ndiaye\" className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\" />\n          </div>\n          <div>\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">E-mail *</label>\n            <input required type=\"email\" placeholder=\"vous@exemple.bj\" className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\" />\n          </div>\n          <div>\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">Pays *</label>\n            <select className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\">\n              {['Bénin', \"Côte d'Ivoire\", 'Togo', 'Sénégal', 'Burkina Faso', 'Cameroun', 'Mali', 'Guinée', 'Nigéria', 'Ghana'].map(c => <option key={c}>{c}</option>)}\n            </select>\n          </div>\n          <div>\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">Téléphone</label>\n            <input placeholder=\"+229 …\" className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\" />\n          </div>\n          <div className=\"sm:col-span-2\">\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">Mot de passe *</label>\n            <input required type=\"password\" placeholder=\"8 caractères minimum\" minLength={8} className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\" />\n          </div>\n        </div>",
        "          <div>\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">Nom complet *</label>\n            <input required value={name} onChange={e => setName(e.target.value)} placeholder=\"Ex : Awa Ndiaye\" className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\" />\n          </div>\n          <div>\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">E-mail *</label>\n            <input required type=\"email\" value={email} onChange={e => setEmail(e.target.value)} placeholder=\"vous@exemple.bj\" className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\" />\n          </div>\n          <div>\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">Pays *</label>\n            <select value={country} onChange={e => setCountry(e.target.value)} className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\">\n              {['Bénin', \"Côte d'Ivoire\", 'Togo', 'Sénégal', 'Burkina Faso', 'Cameroun', 'Mali', 'Guinée', 'Nigéria', 'Ghana'].map(c => <option key={c}>{c}</option>)}\n            </select>\n          </div>\n          <div>\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">Téléphone</label>\n            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder=\"+229 …\" className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\" />\n          </div>\n          {role === 'club' && (\n            <div className=\"sm:col-span-2\">\n              <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">Nom de la structure *</label>\n              <input required value={orgName} onChange={e => setOrgName(e.target.value)} placeholder=\"Ex : Cotonou Hoopers Academy\" className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\" />\n            </div>\n          )}\n          <div className=\"sm:col-span-2\">\n            <label className=\"mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground\">Mot de passe *</label>\n            <input required type=\"password\" minLength={8} value={pwd} onChange={e => setPwd(e.target.value)} placeholder=\"8 caractères minimum\" className=\"h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]\" />\n          </div>\n        </div>",
    ),
    (
        "        <button type=\"submit\" className=\"btn-ball mt-5 w-full\">Créer mon compte {roleLabels[role]}</button>",
        "        <button type=\"submit\" disabled={busy} className=\"btn-ball mt-5 w-full disabled:opacity-60\">{busy ? 'Création…' : `Créer mon compte ${roleLabels[role]}`}</button>",
    ),
]

for i, (old, new) in enumerate(edits):
    if old not in src:
        print(f"ÉCHEC édition #{i} — motif introuvable :\n{old[:140]}")
        sys.exit(1)
    if src.count(old) != 1:
        print(f"ÉCHEC édition #{i} — non unique ({src.count(old)}).")
        sys.exit(1)
    src = src.replace(old, new)

io.open(PATH, 'w', encoding='utf-8').write(src)
print(f"OK — {len(edits)} éditions appliquées à Info.tsx.")
