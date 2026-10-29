/**
 * CourtLink — générateur du document Word de documentation.
 * Recette de couverture R1 (design-system.md) + palette GO-1 Graphite Orange.
 * Exécution : node scripts/gen-doc-courtlink.js
 */
"use strict";

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableLayoutType, SectionType, TableOfContents, ExternalHyperlink,
} = require("docx");
const fs = require("fs");
const { content } = require("./doc-content.js");

/* ── Palette GO-1 (Graphite Orange — propositions, PRD) ── */
const PAL = {
  bg: "1A2330", accent: "D4875A",
  titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078",
  table: { headerBg: "D4875A", headerText: "FFFFFF", accentLine: "D4875A", innerLine: "DDD0C8", surface: "F8F0EB" },
  h1: "1A2330", h2: "9C5322", body: "000000",
};

const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

const FONT = { ascii: "Calibri", eastAsia: "Microsoft YaHei" };
const FONT_HEAD = { ascii: "Calibri", eastAsia: "SimHei" };

/* ── Helpers design-system (calcTitleLayout / calcCoverSpacing) ── */
function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([..."，。、；：！？", ..."的与和及之在于为", ..."-_—–·/", ..." \t"]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    lines = splitTitleLines(title, charsPerLine(minPt));
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, hasEnglishLabel = false,
    metaLineCount = 0, fixedHeight = 800, pageHeight = 16838, marginTop = 0, marginBottom = 0 } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight + metaHeight + fixedHeight + implicitParaHeight;
  const safeRemaining = Math.max(usableHeight - contentHeight, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  const midSpacing = Math.max(safeRemaining - topSpacing - bottomSpacing, 0);
  return { topSpacing, midSpacing, bottomSpacing };
}

/* ── Recette R1 : couverture pleine page, texte aligné à gauche ── */
function buildCoverR1(config) {
  const P = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join(" "), size: 18, color: P.accent, font: FONT_HEAD, characterSpacing: 30 })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true, color: P.titleColor, font: FONT_HEAD })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 800, line: 312 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor, font: FONT })],
    }));
  }
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: P.metaColor, font: FONT })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: P.footerColor, font: FONT }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: P.footerColor, font: FONT }),
    ],
  }));
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders,
        children,
      })],
    })],
  })];
}

/* ── Constructeurs de blocs du corps ── */
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160, line: 380, lineRule: "atLeast" },
    children: [new TextRun({ text, bold: true, size: 32, color: PAL.h1, font: FONT_HEAD })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120, line: 340, lineRule: "atLeast" },
    children: [new TextRun({ text, bold: true, size: 28, color: PAL.h2, font: FONT_HEAD })],
  });
}
function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 140, line: 312 },
    children: [new TextRun({ text, size: 24, color: PAL.body, font: FONT })],
  });
}
function tableTitle(text) {
  return new Paragraph({
    keepNext: true, spacing: { before: 200, after: 100, line: 312 },
    children: [new TextRun({ text, bold: true, size: 21, color: PAL.h1, font: FONT })],
  });
}
function dataTable({ headers, rows }) {
  const widths = headers.map((_, i) => Math.floor(100 / headers.length));
  widths[0] += 100 - widths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true, cantSplit: true,
    children: headers.map((text, i) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: PAL.table.headerBg },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      children: [new Paragraph({
        spacing: { line: 276 },
        children: [new TextRun({ text, bold: true, size: 21, color: PAL.table.headerText, font: FONT })],
      })],
    })),
  });
  const dataRows = rows.map((r, ri) => new TableRow({
    cantSplit: true,
    children: r.map((text, i) => new TableCell({
      shading: ri % 2 === 1 ? { type: ShadingType.CLEAR, fill: PAL.table.surface } : undefined,
      margins: { top: 70, bottom: 70, left: 120, right: 120 },
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      children: [new Paragraph({
        spacing: { line: 276 },
        children: [new TextRun({ text, size: 21, color: PAL.body, font: FONT })],
      })],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: PAL.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: PAL.table.accentLine },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: PAL.table.innerLine },
      insideVertical: NB,
    },
    rows: [headerRow, ...dataRows],
  });
}
function imageBlock({ path, caption, w, h }) {
  const buf = fs.readFileSync(path);
  const displayWidth = w > 800 ? 560 : 220;
  const displayHeight = Math.round(displayWidth * (h / w));
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 200, after: 80 },
      children: [new ImageRun({ data: buf, transformation: { width: displayWidth, height: displayHeight }, type: "png" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 240, line: 276 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: "777777", font: FONT })],
    }),
  ];
}

/* ── Assemblage du corps ── */
const bodyChildren = [];
for (const block of content) {
  if (block.h1) bodyChildren.push(h1(block.h1));
  else if (block.h2) bodyChildren.push(h2(block.h2));
  else if (block.p) bodyChildren.push(body(block.p));
  else if (block.table) { bodyChildren.push(tableTitle(block.table.title)); bodyChildren.push(dataTable(block.table)); }
  else if (block.image) bodyChildren.push(...imageBlock(block.image));
}

/* ── En-tête et pieds de page ── */
const pageHeader = () => new Header({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: PAL.table.innerLine, space: 4 } },
    children: [new TextRun({ text: "CourtLink — Documentation complète de la plateforme", size: 16, color: "888888", font: FONT })],
  })],
});
const pageNumFooter = () => new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888", font: FONT })],
  })],
});

/* ── Sommaire (section intermédiaire) ── */
const tocChildren = [
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 480, after: 360, line: 380, lineRule: "atLeast" },
    children: [new TextRun({ text: "Sommaire", bold: true, size: 32, color: PAL.h1, font: FONT_HEAD })],
  }),
  new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({
    spacing: { before: 200, line: 276 },
    children: [new TextRun({
      text: "Remarque : ce sommaire repose sur des codes de champ. Après toute modification du document, cliquez droit sur le sommaire puis « Mettre à jour les champs » pour actualiser les numéros de page.",
      italics: true, size: 18, color: "888888", font: FONT,
    })],
  }),
  /* Pas de PageBreak ici : la section corps est de type NEXT_PAGE (sinon page blanche) */
];

/* ── Document ── */
const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

const doc = new Document({
  creator: "CourtLink",
  title: "CourtLink — Documentation complète de la plateforme",
  description: "Fonctionnalités, abonnements FedaPay, sécurité et architecture de la plateforme CourtLink",
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 24, color: PAL.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: FONT_HEAD, size: 32, bold: true, color: PAL.h1 },
        paragraph: { spacing: { before: 400, after: 160, line: 380 } },
      },
      heading2: {
        run: { font: FONT_HEAD, size: 28, bold: true, color: PAL.h2 },
        paragraph: { spacing: { before: 280, after: 120, line: 340 } },
      },
    },
  },
  sections: [
    { /* Section 1 : couverture — marges 0, sans pied de page */
      properties: { page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCoverR1({
        title: "CourtLink — Documentation complète de la plateforme",
        subtitle: "Le réseau de confiance du basketball ouest-africain : fonctionnalités, abonnements FedaPay, sécurité et architecture technique",
        englishLabel: "COURTLINK · DOCUMENTATION OFFICIELLE",
        metaLines: [
          "Plateforme : https://basketsite.vercel.app",
          "Dépôt : github.com/Jehudiel270/basket_site",
          "Cotonou, Bénin — Octobre 2026",
        ],
        footerLeft: "CourtLink — Bénin & Afrique de l'Ouest",
        footerRight: "Octobre 2026",
        palette: PAL,
      }),
    },
    { /* Section 2 : sommaire — numérotation romaine */
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } },
      },
      headers: { default: pageHeader() },
      footers: { default: pageNumFooter() },
      children: tocChildren,
    },
    { /* Section 3 : corps — numérotation arabe repartant de 1 */
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      headers: { default: pageHeader() },
      footers: { default: pageNumFooter() },
      children: bodyChildren,
    },
  ],
});

const OUT = "/home/z/my-project/download/CourtLink-Documentation-complete.docx";
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("OK →", OUT, `(${Math.round(buf.length / 1024)} Ko)`);
});
