#!/usr/bin/env python3
"""Protège les pistes mobiles implicites des grilles de cartes joueurs."""
import pathlib

LB = chr(91)
MM = 'min' + 'max(0,'
MOBILE = 'grid-cols-' + LB + MM + '1fr)' + ']'

JOBS = [
    ('/home/z/my-project/src/components/workspace/ClubScout.tsx',
     'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
     'grid ' + MOBILE + ' gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'),
    ('/home/z/my-project/src/components/public/Players.tsx',
     'grid gap-5 sm:grid-cols-2 lg:grid-cols-4',
     'grid ' + MOBILE + ' gap-5 sm:grid-cols-2 lg:grid-cols-4'),
    ('/home/z/my-project/src/components/public/Players.tsx',
     'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
     'grid ' + MOBILE + ' gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'),
]
done = set()
for path, old, new in JOBS:
    if (path, old) in done:
        continue
    done.add((path, old))
    p = pathlib.Path(path)
    txt = p.read_text()
    n = txt.count(old)
    txt = txt.replace(old, new)
    p.write_text(txt)
    print(('✔' if n else '•'), path.split('/')[-1], '—', n, 'occurrence(s) :', new[:70])

print('\n— Vérification —')
for path in {j[0] for j in JOBS}:
    p = pathlib.Path(path)
    for i, l in enumerate(p.read_text().splitlines(), 1):
        if MM + '1fr)' in l and 'grid ' in l:
            print(f'{p.name}:{i} :: {l.strip()[:100]}'.replace(LB + MM, 'PROT['))
