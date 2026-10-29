#!/usr/bin/env python3
"""V2 — répare les grilles arbitraires en construisant 'minmax' par concaténation
(l'écriture littérale '[minmax' est corrompue par l'outil d'édition)."""
import re, pathlib

BASE = pathlib.Path('/home/z/my-project/src/components/workspace')
MM = 'mi' + 'nmax(0,'   # évite la séquence littérale corrompue
def gcol(*tracks):       # ex: gcol('1.6fr','1fr') → 'grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]'
    return 'grid-cols-[' + '_'.join(MM + t + ')' for t in tracks) + ']'
MOBILE = gcol('1fr')     # colonne unique protégée pour le mobile

# état actuel → attendu (par fichier, recherches par regex)
JOBS = [
    ('Shared.tsx',   r'grid grid-cols-\S*inmax\S* gap-6 lg:grid-cols-\[1\.5fr_1fr\]',
     f'{MOBILE} gap-6 {gcol("1.5fr","1fr")}'),
    ('Shared.tsx',   r'grid grid-cols-\S*inmax\S* gap-4 lg:grid-cols-\S*320px\S*',
     f'{MOBILE} gap-4 {gcol("320px","1fr")}'),
    ('PlayerSpace.tsx', r'grid grid-cols-\S*inmax\S* gap-6 lg:grid-cols-\S*1\.6fr\S*',
     f'{MOBILE} gap-6 {gcol("1.6fr","1fr")}'),
    ('PlayerSpace.tsx', r'mt-6 grid grid-cols-\S*inmax\S* gap-6 lg:grid-cols-\S*1\.6fr\S*',
     f'mt-6 {MOBILE} gap-6 {gcol("1.6fr","1fr")}'),
    ('Others.tsx',   r'grid grid-cols-\S*inmax\S* gap-6 lg:grid-cols-\S*400px\S*',
     f'{MOBILE} gap-6 {gcol("1fr","400px")}'),
    ('Others.tsx',   r"compact \? 'grid grid-cols-\S*inmax\S* gap-6 lg:grid-cols-\S*360px\S*' : ''",
     f"compact ? '{MOBILE} gap-6 {gcol('1fr','360px')}' : ''"),
    ('ClubScout.tsx', r'grid gap-2\.5 md:grid-cols-\[1\.5fr_1fr_1fr_1fr\]',
     f'{MOBILE} gap-2.5 md:{gcol("1.5fr","1fr","1fr","1fr")}'),
]

for fname, pattern, repl in JOBS:
    p = BASE / fname
    txt = p.read_text()
    txt2, n = re.subn(pattern, repl, txt)
    if n:
        p.write_text(txt2)
        print(f'✔ {fname} : {n} remplacement(s) — {repl[:70]}…')
    else:
        print(f'• {fname} : pattern absent (déjà propre ?) — {pattern[:60]}')

print('\n— Vérification finale —')
bad = []
for f in BASE.glob('*.tsx'):
    for i, line in enumerate(f.read_text().splitlines(), 1):
        for m in re.finditer(r'grid-cols-\[([^\]]+)\]', line):
            val = m.group(1)
            if MM not in val and re.search(r'\d+(fr|px)', val):
                bad.append(f'{f.name}:{i} → grid-cols-[{val}]')
print('\n'.join(bad) if bad else 'OK — toutes les grilles arbitraires protégées')

# Sanity : plus aucune occurrence corrompue 'inmax'
print('\n— Occurrences corrompues restantes —')
left = [f'{f.name}:{i}' for f in BASE.glob('*.tsx') for i, l in enumerate(f.read_text().splitlines(), 1) if 'inmax' in l]
print('\n'.join(left) if left else 'OK — aucune corruption')
