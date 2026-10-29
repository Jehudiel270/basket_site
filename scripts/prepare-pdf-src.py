#!/usr/bin/env python3
"""Prépare une copie du docx pour conversion PDF propre :
updateFields=true + pieds de page patchés, SANS placeholders de sommaire
(LibreOffice rafraîchit le champ lui-même → sommaire réel sans doublons).
Usage : python3 prepare-pdf-src.py <in.docx> <out.docx>
"""
import re
import shutil
import sys
import zipfile
import tempfile
import os

src, dst = sys.argv[1], sys.argv[2]
tmp = tempfile.mkdtemp()
with zipfile.ZipFile(src) as z:
    z.extractall(tmp)

# 1. settings.xml : updateFields on/off (env UPDATE_FIELDS=0 pour laisser les placeholders)
import os as _os
want = _os.environ.get("UPDATE_FIELDS", "1") == "1"
s_path = os.path.join(tmp, "word", "settings.xml")
with open(s_path, encoding="utf-8") as f:
    s = f.read()
if want:
    if "<w:updateFields/>" in s:
        s = s.replace("<w:updateFields/>", '<w:updateFields w:val="true"/>')
    elif "updateFields" not in s:
        s = re.sub(r"(<w:settings[^>]*>)", r'\1<w:updateFields w:val="true"/>', s, count=1)
    else:
        s = re.sub(r'<w:updateFields w:val="[^"]*"/>', '<w:updateFields w:val="true"/>', s)
else:
    s = re.sub(r'<w:updateFields(?: w:val="[^"]*")?/>', "", s)
with open(s_path, "w", encoding="utf-8") as f:
    f.write(s)
print(f"updateFields = {'true' if want else 'retiré (placeholders figés)'}")

# 2. Retirer pgNumType vides + patcher pieds de page
doc_path = os.path.join(tmp, "word", "document.xml")
with open(doc_path, encoding="utf-8") as f:
    doc = f.read()
doc, n = re.subn(r"<w:pgNumType/>", "", doc)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc)
print(f"pgNumType vides retirés : {n}")

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
    xml2, k = re.subn(r"(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)", rf"\1 PAGE \\* {fmt} \\* MERGEFORMAT \2", xml)
    if k:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(xml2)
        patched.append((fname, fmt))
print(f"pieds patchés : {patched}")

out = dst + ".tmp"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _d, files in os.walk(tmp):
        for file in files:
            full = os.path.join(root, file)
            z.write(full, os.path.relpath(full, tmp))
os.replace(out, dst)
shutil.rmtree(tmp)
print("OK →", dst)
