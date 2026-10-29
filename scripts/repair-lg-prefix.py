#!/usr/bin/env python3
"""Rajoute le préfixe lg: sur la 2e déclaration grid-cols des 6 lignes réparées."""
import pathlib

LB = chr(91)
MM = 'min' + 'max(0,'
def cls(*ts): return LB + '_'.join(MM + t + ')' for t in ts) + ']'

JOBS = {
    ('Shared.tsx', 26):      '      <div className="grid grid-cols-' + cls('1fr') + ' gap-4 lg:grid-cols-' + cls('320px', '1fr') + '">',
    ('Shared.tsx', 95):      '      <div className="grid grid-cols-' + cls('1fr') + ' gap-6 lg:grid-cols-' + cls('1.5fr', '1fr') + '">',
    ('PlayerSpace.tsx', 50): '      <div className="mt-6 grid grid-cols-' + cls('1fr') + ' gap-6 lg:grid-cols-' + cls('1.6fr', '1fr') + '">',
    ('PlayerSpace.tsx', 159):'      <div className="grid grid-cols-' + cls('1fr') + ' gap-6 lg:grid-cols-' + cls('1.6fr', '1fr') + '">',
    ('Others.tsx', 404):     '      <div className="grid grid-cols-' + cls('1fr') + ' gap-6 lg:grid-cols-' + cls('1fr', '400px') + '">',
    ('Others.tsx', 587):     "    <div className={cn(compact ? 'grid grid-cols-" + cls('1fr') + " gap-6 lg:grid-cols-" + cls('1fr', '360px') + "' : '')}>",
}
# ClubScout:126 garde md: (déjà correct)

BASE = pathlib.Path('/home/z/my-project/src/components/workspace')
for (fname, ln), new in JOBS.items():
    p = BASE / fname
    lines = p.read_text().splitlines(keepends=True)
    lines[ln - 1] = new + '\n'
    p.write_text(''.join(lines))
    print(f'✔ {fname}:{ln}')

print('\n— Contrôle final (préfixes + fermetures) —')
all_ok = True
for (fname, ln), new in JOBS.items():
    cur = (BASE / fname).read_text().splitlines()[ln - 1].rstrip()
    ok = ('lg:grid-cols-' in cur) and (cur.endswith('">') or cur.endswith("')}>"))
    all_ok &= ok
    print(f'{fname}:{ln} → lg:={"lg:grid-cols-" in cur} fermée={cur.endswith(chr(34) + ">") or cur.endswith(")}>")} {"OK" if ok else "KO"}')
print('TOUT OK' if all_ok else 'RESTE DES KO')
