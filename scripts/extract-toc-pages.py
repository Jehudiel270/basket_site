#!/usr/bin/env python3
"""Passe 1 : extrait le numéro de page réel de chaque titre depuis le PDF
généré sans placeholders, et produit le JSON d'entrées pour add_toc_placeholders.
Usage : python3 extract-toc-pages.py <pdf> <fresh.docx> <out.json>
"""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

import fitz

pdf_path, docx_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

# 1. Titres H1/H2 dans l'ordre du document
with zipfile.ZipFile(docx_path) as z:
    root = ET.fromstring(z.read("word/document.xml"))
headings = []
for p in root.iter(f"{W}p"):
    style = p.find(f"{W}pPr/{W}pStyle")
    if style is None:
        continue
    val = style.get(f"{W}val", "")
    if val not in ("Heading1", "Heading2"):
        continue
    text = "".join(t.text or "" for t in p.iter(f"{W}t")).strip()
    if text:
        headings.append((1 if val == "Heading1" else 2, text))

# 2. Offset du corps : première page contenant un « 1 » isolé (pied de page arabe)
d = fitz.open(pdf_path)
body_start = None
for i in range(1, d.page_count):
    lines = [ln.strip() for ln in d[i].get_text().splitlines() if ln.strip()]
    if "1" in lines:
        body_start = i
        break
if body_start is None:
    body_start = 2
print(f"corps = PDF index {body_start} (page numérotée 1)")

pages_text = [re.sub(r"\s+", " ", d[i].get_text()) for i in range(d.page_count)]

entries, cursor = [], body_start  # recherche en ordre du document, jamais en arrière
for level, text in headings:
    needle = re.sub(r"\s+", " ", text)
    page_found = None
    for i in range(cursor, d.page_count):
        if needle in pages_text[i]:
            page_found = i
            break
    if page_found is None:  # filet de sécurité : recherche globale
        for i in range(body_start, d.page_count):
            if needle in pages_text[i]:
                page_found = i
                break
    if page_found is None:
        print(f"⚠️ introuvable : {text}")
        page_found = cursor
    cursor = page_found  # les titres suivants sont au même endroit ou après
    entries.append({"level": level, "text": text, "page": str(page_found - body_start + 1)})

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(entries, f, ensure_ascii=False)
print(f"{len(entries)} entrées extraites → {out_path}")
for e in entries[:6]:
    print("  ", e)
