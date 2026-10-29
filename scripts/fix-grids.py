#!/usr/bin/env python3
"""Répare et sécurise les grilles arbitraires de CourtLink (minmax(0,...))."""
import re, pathlib

BASE = pathlib.Path('/home/z/my-project/src/components/workspace')
FIXES = {
    'Shared.tsx': [
        ('grid grid-cols-inmax(0,1fr)] gap-6 lg:grid-cols-[1.5fr_1fr]',
         'grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'),
        ('grid gap-4 lg:grid-cols-[320px_1fr]',
         'grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]'),
    ],
    'PlayerSpace.tsx': [
        ('grid grid-cols-inmax(0,1fr)] gap-6 lg:grid-cols-inmax(0,1.6fr)_minmax(0,1fr)]',
         'grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]'),
        ('mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]',
         'mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]'),
    ],
    'Others.tsx': [
        ('grid gap-6 lg:grid-cols-[1fr_400px]',
         'grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]'),
        ("compact ? 'grid gap-6 lg:grid-cols-[1fr_360px]' : ''",
         "compact ? 'grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]' : ''"),
    ],
}

for fname, pairs in FIXES.items():
    p = BASE / fname
    txt = p.read_text()
    for old, new in pairs:
        if old in txt:
            txt = txt.replace(old, new)
            print(f"✔ {fname} : corrigé → {new[:60]}…")
        elif new in txt:
            print(f"• {fname} : déjà corrigé")
        else:
            print(f"✗ {fname} : INTROUVABLE → {old[:60]}…")
    p.write_text(txt)

# Vérification finale : aucune classe arbitraire non-minmax ne doit rester
print("\n— Vérification —")
bad = []
for f in BASE.glob('*.tsx'):
    for i, line in enumerate(f.read_text().splitlines(), 1):
        for m in re.finditer(r'grid-cols-\[([^\]]+)\]', line):
            val = m.group(1)
            if 'minmax' not in val and any(fr in val for fr in ('fr', 'px')):
                bad.append(f"{f.name}:{i} → grid-cols-[{val}]")
print('\n'.join(bad) if bad else '✔ Toutes les grilles arbitraires sont protégées (minmax(0,…))')
