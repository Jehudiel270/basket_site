#!/usr/bin/env python3
"""Fix final /admin : piste mobile protégée + BarChart scrollable + top pays."""
import pathlib

LB = chr(91)
MM = 'min' + 'max(0,'
MOBILE = 'grid-cols-' + LB + MM + '1fr)' + ']'

# 1. AdminOverview : grille 3 colonnes protégée en mobile + top 6 pays
adm = pathlib.Path('/home/z/my-project/src/components/workspace/Admin.tsx')
t = adm.read_text()
old_grid = 'mt-6 grid gap-6 lg:grid-cols-3'
new_grid = 'mt-6 grid ' + MOBILE + ' gap-6 lg:grid-cols-3'
assert old_grid in t, 'grille admin introuvable'
t = t.replace(old_grid, new_grid)

old_data = "data={[...new Set(players.map(p => p.country))].map(c => ({ label: c.slice(0, 4), value: players.filter(p => p.country === c).length }))}"
new_data = "data={[...new Set(players.map(p => p.country))].map(c => ({ label: c.slice(0, 4), value: players.filter(p => p.country === c).length })).sort((a, b) => b.value - a.value).slice(0, 6)}"
assert old_data in t, 'data BarChart introuvable'
t = t.replace(old_data, new_data)
adm.write_text(t)
print('✔ Admin.tsx : grille protégée + top 6 pays')

# 2. BarChart : wrapper scrollable + gap mobile réduit
bits = pathlib.Path('/home/z/my-project/src/components/common/Bits.tsx')
b = bits.read_text()
old_bar = '''  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">'''
new_bar = '''  return (
    <div className="overflow-x-auto">
    <div className="flex items-end gap-2 md:gap-3" style={{ height, minWidth: 'min(100%, ' + Math.max(data.length * 56, 200) + 'px)' }}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">'''
assert old_bar in b, 'BarChart introuvable'
b = b.replace(old_bar, new_bar)
old_close = '''          <span className="max-w-full truncate text-[9px] uppercase tracking-wide text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}'''
new_close = '''          <span className="max-w-full truncate text-[9px] uppercase tracking-wide text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
    </div>
  );
}'''
assert old_close in b, 'fermeture BarChart introuvable'
b = b.replace(old_close, new_close)
bits.write_text(b)
print('✔ Bits.tsx : BarChart scrollable (largeur mini par barre, gap mobile)')
