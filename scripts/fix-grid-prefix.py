#!/usr/bin/env python3
"""Répare le préfixe 'grid' perdu — séquences construites par chr() pour
échapper à la couche d'affichage qui avale le motif [m."""
import pathlib, re

LB = chr(91)          # [
MINMAX = chr(109) + chr(105) + chr(110) + chr(109) + chr(97) + chr(120)  # m i n m a x
TARGET = LB + MINMAX  # [minmax

BASE = pathlib.Path('/home/z/my-project/src/components/workspace')
count = 0
for f in sorted(BASE.glob('*.tsx')):
    txt = t0 = f.read_text()
    txt = txt.replace('"' + TARGET, '"grid ' + TARGET)   # className="grid-cols-[minmax…
    txt = txt.replace("'" + TARGET, "'grid " + TARGET)   # cn('grid-cols-[minmax…
    txt = txt.replace('mt-6 ' + TARGET, 'mt-6 grid ' + TARGET)
    if txt != t0:
        f.write_text(txt)
        count += 1
        print('restaure grid :', f.name)

# Vérif : chaque grid-cols-[minmax doit être précédé de 'grid ' (ou breakpoint)
bad = []
for f in BASE.glob('*.tsx'):
    for i, l in enumerate(f.read_text().splitlines(), 1):
        for m in re.finditer(re.escape(TARGET), l):
            pre = l[:m.start()].rstrip()
            ok = pre.endswith('grid') or pre.endswith('"') is False and pre.endswith("'") is False
            # préfixe attendu : …grid / …grid-cols-[minmax (2e occurrence lg) / md: lg: etc.
            good = (pre.endswith('grid') or pre.endswith('md:') or pre.endswith('sm:')
                    or pre.endswith('lg:') or pre.endswith('xl:') or pre.endswith('!') )
            # 2e+ occurrences dans la même classe = breakpoint variants (md:grid-cols-[minmax…)
            if not good and not re.search(r'(md|sm|lg|xl):' + re.escape(TARGET), l):
                bad.append(f'{f.name}:{i} :: {l.strip()[:90]}')
print('fichiers réparés :', count)
print('anomalies :')
print('\n'.join(bad) if bad else '  aucune')
