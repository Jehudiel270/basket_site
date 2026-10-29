#!/usr/bin/env python3
"""Reconstruit intégralement les lignes de grilles endommagées (contenu exact,
séquences [minmax construites par chr() pour éviter la couche qui avale [m)."""
import pathlib

LB = chr(91)
MM = 'min' + 'max(0,'
def cls(*tracks):
    return LB + '_'.join(MM + t + ')' for t in tracks) + ']'

L = LB  # raccourci
REPAIRS = {
    'Shared.tsx': {
        26: '      <div className="grid grid-cols-' + cls('1fr') + ' gap-4 grid-cols-' + cls('320px', '1fr') + '">',
        95: '      <div className="grid grid-cols-' + cls('1fr') + ' gap-6 grid-cols-' + cls('1.5fr', '1fr') + '">',
    },
    'ClubScout.tsx': {
        126: '        <div className="grid grid-cols-' + cls('1fr') + ' gap-2.5 md:grid-cols-' + cls('1.5fr', '1fr', '1fr', '1fr') + '">',
    },
    'PlayerSpace.tsx': {
        50: '      <div className="mt-6 grid grid-cols-' + cls('1fr') + ' gap-6 grid-cols-' + cls('1.6fr', '1fr') + '">',
        159: '      <div className="grid grid-cols-' + cls('1fr') + ' gap-6 grid-cols-' + cls('1.6fr', '1fr') + '">',
    },
    'Others.tsx': {
        404: '      <div className="grid grid-cols-' + cls('1fr') + ' gap-6 grid-cols-' + cls('1fr', '400px') + '">',
        587: "    <div className={cn(compact ? 'grid grid-cols-" + cls('1fr') + " gap-6 grid-cols-" + cls('1fr', '360px') + "' : '')}>",
    },
}

BASE = pathlib.Path('/home/z/my-project/src/components/workspace')
for fname, lines in REPAIRS.items():
    p = BASE / fname
    txt = p.read_text().splitlines(keepends=True)
    for ln, new in sorted(lines.items(), reverse=True):  # desc pour indexes stables
        old = txt[ln - 1].rstrip('\n')
        tail_ok = old.endswith('">') or old.endswith("')}>") or old.endswith('>') 
        txt[ln - 1] = new + '\n'
        print(f'{fname}:{ln} — ancienne fin : {old[-30:]!r} {"(déjà ok)" if tail_ok else "(RÉPARÉE)"}')
    p.write_text(''.join(txt))

print('\n— Vérification des fins de lignes (hex) —')
for fname, lines in REPAIRS.items():
    p = BASE / fname
    ls = p.read_text().splitlines()
    for ln in lines:
        tail = ls[ln - 1].rstrip()[-12:]
        print(f'{fname}:{ln} → …{tail!r}  contient minmax={"minmax(0," in ls[ln-1]} fermeture={"\">" in ls[ln-1] or "\')\">" in ls[ln-1]}')
