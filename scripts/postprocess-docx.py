#!/usr/bin/env python3
"""Post-traitement docx CourtLink :
1. Retire les <w:pgNumType/> vides (confondent WPS sur la couverture)
2. Patache les pieds de page : 1er pied PAGE → \\* ROMAN, suivants → \\* arabic
"""
import re
import shutil
import sys
import zipfile
import tempfile
import os

path = sys.argv[1]
tmp = tempfile.mkdtemp()

with zipfile.ZipFile(path) as z:
    z.extractall(tmp)

# 2. document.xml : retirer pgNumType vides + reconstruire proprement le champ TOC
doc_path = os.path.join(tmp, "word", "document.xml")
with open(doc_path, encoding="utf-8") as f:
    doc = f.read()
doc, n_removed = re.subn(r"<w:pgNumType/>", "", doc)
print(f"pgNumType vides retirés : {n_removed}")

# ── Chirurgie du champ TOC injecté par add_toc_placeholders :
#    l'entrée 1 est dupliquée (hyperlink+PAGEREF vide) et le fldChar end ferme
#    le champ après 2 entrées seulement → les suivantes resteraient hors champ
#    et Word les dupliquerait au rafraîchissement.
#    Reconstruction : en-tête de champ (begin+instr+separate) + 36 entrées + end.
m_toc = re.search(r"<w:instrText[^>]*>[^<]*TOC[^<]*</w:instrText>", doc)
i_instr = m_toc.start() if m_toc else -1
if i_instr != -1:
    i_begin = doc.rfind("fldCharType=\"begin\"", 0, i_instr)
    p_start = doc.rfind("<w:p>", 0, i_begin)
    i_sep_close = doc.find("</w:r>", doc.find("fldCharType=\"separate\"", i_begin)) + len("</w:r>")
    p1_end = doc.find("</w:p>", i_sep_close) + len("</w:p>")
    i_gloss = doc.rfind("10.2 Glossaire")
    p_last_end = doc.find("</w:p>", i_gloss) + len("</w:p>")
    if -1 not in (i_begin, p_start, i_sep_close, p1_end, i_gloss, p_last_end) and p_last_end > p1_end:
        region = doc[p_start:p_last_end]
        # a) supprimer l'entrée 1 dupliquée : l'élément <w:hyperlink> complet après le separate
        #    (le paragraphe d'en-tête du champ le contient ; on garde son </w:p>)
        h_start = region.find("<w:hyperlink", i_sep_close - p_start)
        h_end = region.find("</w:hyperlink>", h_start) + len("</w:hyperlink>") if h_start != -1 else -1
        if h_start != -1 and h_end != -1:
            region2 = region[:h_start] + region[h_end:]
        else:
            region2 = region
        # b) retirer le fldChar end mal placé (fermait le champ après 2 entrées)
        m_end = re.search(r"<w:r>(?:(?!</w:r>).)*?fldCharType=\"end\"(?:(?!</w:r>).)*?</w:r>", region2, re.S)
        end_run = m_end.group(0) if m_end else '<w:r><w:fldChar w:fldCharType="end"/></w:r>'
        region2 = region2[:m_end.start()] + region2[m_end.end():] if m_end else region2
        # c) refermer le champ après la dernière entrée
        last_close = region2.rfind("</w:p>")
        region2 = region2[:last_close] + end_run + region2[last_close:]
        doc = doc[:p_start] + region2 + doc[p_last_end:]
        print("champ TOC reconstruit (36 entrées + end final)")
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc)

# 2. Pieds de page : premier footer avec PAGE → ROMAN, suivants → arabic
word_dir = os.path.join(tmp, "word")
footers = sorted(f for f in os.listdir(word_dir) if re.match(r"footer\d+\.xml$", f))
patched = []
for fname in footers:
    fpath = os.path.join(word_dir, fname)
    with open(fpath, encoding="utf-8") as f:
        xml = f.read()
    if "PAGE" not in xml:
        continue
    fmt = "ROMAN" if not patched else "arabic"
    xml2, n = re.subn(
        r"(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)",
        rf"\1 PAGE \\* {fmt} \\* MERGEFORMAT \2",
        xml,
    )
    if n:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(xml2)
        patched.append((fname, fmt, n))

print(f"pieds de page patchés : {patched}")

# Rezip
out = path + ".tmp"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _dirs, files in os.walk(tmp):
        for file in files:
            full = os.path.join(root, file)
            rel = os.path.relpath(full, tmp)
            z.write(full, rel)
os.replace(out, path)
shutil.rmtree(tmp)
print("OK — post-traitement terminé")
