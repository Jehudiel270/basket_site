# -*- coding: utf-8 -*-
"""Remplace AdminAdmins (page statique démo) par la vraie gestion d'équipe super admin."""
import io

PATH = '/home/z/my-project/src/components/workspace/Admin.tsx'
src = io.open(PATH, encoding='utf-8').read()

anchor = 'export function AdminAdmins() {'
assert src.count(anchor) == 1, "ancre AdminAdmins non unique"
head = src[:src.index(anchor)]

new_fn = '''export function AdminAdmins() {
  const { staff, isSuperAdmin, currentUserId, setStaffRole, setSuperAdmin } = useCourtLink();
  const roleLabels: Record<string, string> = { admin: 'Administrateur', moderator: 'Modérateur', support: 'Support', visitor: 'Accès retiré' };
  return (
    <div>
      <WorkspaceHeader
        title="Administrateurs & permissions"
        sub={isSuperAdmin
          ? 'Vous êtes super administrateur : vous nommez les administrateurs, les modérateurs, le support et les autres super administrateurs.'
          : 'Chaque administrateur dispose de permissions explicites. Seul un super administrateur peut nommer ou retirer des accès.'}
      />
      <div className="card-court overflow-x-auto p-6">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2">Membre</th><th className="pb-2">E-mail</th><th className="pb-2">Rôle</th><th className="pb-2">Super admin</th><th className="pb-2 text-right">{isSuperAdmin ? 'Actions' : 'État'}</th>
          </tr></thead>
          <tbody>
            {staff.map(m => (
              <tr key={m.id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 font-semibold">
                  {m.name}
                  {m.id === currentUserId && <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">vous</span>}
                </td>
                <td className="py-2.5 text-muted-foreground">{m.email}</td>
                <td className="py-2.5">
                  <span className={cn('chip',
                    m.role === 'admin' ? 'border-[var(--ball)]/50 text-[var(--ball)]'
                      : m.role === 'visitor' ? 'border-red-500/40 text-red-400'
                        : 'border-border text-muted-foreground')}>
                    {roleLabels[m.role] ?? m.role}
                  </span>
                </td>
                <td className="py-2.5">
                  {m.isSuperAdmin
                    ? <span className="chip border-amber-500/40 text-amber-400">★ Super admin</span>
                    : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="py-2.5 text-right">
                  {isSuperAdmin ? (
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={m.role}
                        disabled={m.id === currentUserId}
                        onChange={e => setStaffRole(m.id, e.target.value as StaffMember['role'])}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        aria-label={`Rôle de ${m.name}`}
                      >
                        <option value="admin">Administrateur</option>
                        <option value="moderator">Modérateur</option>
                        <option value="support">Support</option>
                        <option value="visitor">Retirer l'accès</option>
                      </select>
                      <button
                        disabled={m.id === currentUserId}
                        onClick={() => setSuperAdmin(m.id, !m.isSuperAdmin)}
                        className={cn('rounded-md border px-2 py-1 text-xs font-semibold disabled:opacity-40',
                          m.isSuperAdmin ? 'border-border text-muted-foreground hover:text-foreground' : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10')}
                      >
                        {m.isSuperAdmin ? 'Retirer le statut' : 'Nommer super admin'}
                      </button>
                    </div>
                  ) : (
                    <span className={cn('chip', m.role === 'visitor' ? 'border-red-500/40 text-red-400' : 'border-green-500/40 text-green-400')}>
                      {m.role === 'visitor' ? 'Sans accès' : 'Actif'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          Séparation des pouvoirs : un super administrateur ne peut pas modifier son propre statut, et le dernier
          super administrateur ne peut pas être rétrogradé (protection anti-blocage). Chaque décision est inscrite
          au journal d'audit et notifiée à la personne concernée. Le modérateur et le support n'ont jamais
          automatiquement accès aux fonctions d'administration (plans, paramètres, gestion des admins).
        </p>
      </div>
    </div>
  );
}
'''

out = head + new_fn
io.open(PATH, 'w', encoding='utf-8').write(out)
print('Admin.tsx : AdminAdmins remplacé (', len(out.splitlines()), 'lignes au total )')

# Vérifie que StaffMember est bien importé dans Admin.tsx (pour le cast e.target.value)
if 'StaffMember' not in head.split("from '@/lib/types'")[0]:
    print('NOTE : StaffMember non importé dans Admin.tsx — à ajouter')
