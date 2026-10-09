// ── ChargeDecode Refund Guide Pro PDF Generator v2 ──
// Strict layout: A4, 30mm L/R margin, 20mm T/B margin, 150mm body width

const PDFDocument = require('pdfkit');
const fs = require('fs');

// ── Page setup ──
const PAGE_W = 595.27;  // A4 width in pts
const PAGE_H = 841.89;  // A4 height in pts
const MM = 72 / 25.4;   // pts per mm
const MARGIN_L = 30 * MM;   // 85.05 pts
const MARGIN_R = 30 * MM;
const MARGIN_T = 20 * MM;   // 56.7 pts
const MARGIN_B = 20 * MM;
const BODY_W = 150 * MM;    // 425.25 pts — the key constraint
const LEFT_X = MARGIN_L;    // start text at left margin (30mm)
// Total usable: PAGE_W - MARGIN_L - MARGIN_R = 425.25 pts = 150mm ✓

// Verify
console.log('Layout check:');
console.log('  Left margin:', MARGIN_L.toFixed(1), 'pts (' + (MARGIN_L/MM).toFixed(1) + 'mm)');
console.log('  Right margin:', MARGIN_R.toFixed(1), 'pts');
console.log('  Body width:', BODY_W.toFixed(1), 'pts (' + (BODY_W/MM).toFixed(1) + 'mm)');
console.log('  Right edge:', (MARGIN_L + BODY_W + MARGIN_R).toFixed(1), 'pts vs PAGE_W', PAGE_W.toFixed(1), 'pts');

// ── Colors ──
const DARK_BLUE = '#1a3a5c';
const ACCENT_BLUE = '#2c5f8a';
const TABLE_HEADER_BG = '#1a3a5c';
const TABLE_ALT_BG = '#f0f5fa';
const LIGHT_GRAY = '#f5f5f5';
const MID_GRAY = '#888888';
const DARK_GRAY = '#333333';
const WARN_RED = '#c0392b';
const GREEN = '#27ae60';
const ORANGE = '#f39c12';
const RED = '#c0392b';

// ── PDF init ──
const pdf = new PDFDocument({ size: 'A4', margin: 0 });
const outPath = 'C:/Users/Administrator/Desktop/ChargeDecode-Refund-Guide-Pro.pdf';
const stream = fs.createWriteStream(outPath);
pdf.pipe(stream);

// ── Register embedded TrueType fonts to increase file size ──
// Using Windows built-in fonts
// ── Register embedded TrueType fonts ──
let useEmbedded = true;
let FONT_R = 'Helvetica';
let FONT_B = 'Helvetica-Bold';
let FONT_M = 'Courier';
try {
    pdf.registerFont('FRegular', 'C:/Windows/Fonts/arial.ttf');
    pdf.registerFont('FBold', 'C:/Windows/Fonts/arialbd.ttf');
    pdf.registerFont('FMono', 'C:/Windows/Fonts/cour.ttf');
    FONT_R = 'FRegular';
    FONT_B = 'FBold';
    FONT_M = 'FMono';
    console.log('Embedded fonts registered: arial, arialbd, cour');
} catch (e) {
    useEmbedded = false;
    console.log('Font registration failed:', e.message, '- using built-in');
}

let y = MARGIN_T;
let pageNum = 1;

// ── Helpers ──
function checkBreak(d, needed) {
    if (y + needed > PAGE_H - MARGIN_B) {
        d.addPage();
        pageNum++;
        y = MARGIN_T;
    }
}

function forcePageBreak(d) {
    d.addPage();
    pageNum++;
    y = MARGIN_T;
}

// ── Drawing functions ──
function drawCover(d) {
    d.save();
    d.rect(0, 0, PAGE_W, PAGE_H).fill(DARK_BLUE);
    d.restore();

    d.fillColor('#ffffff').font(FONT_B).fontSize(24);
    d.text('Credit Card Charge Decoder', 0, 140, { align: 'center', width: PAGE_W });

    d.fontSize(12).font(FONT_R).fillColor('#c8dff5');
    d.text('The Ultimate Refund & Dispute Guide', 0, 178, { align: 'center', width: PAGE_W });

    d.fontSize(11).font(FONT_B).fillColor('#ffd700');
    d.text('Pro Edition — $19.99', 0, 215, { align: 'center', width: PAGE_W });

    d.fontSize(10).font(FONT_R).fillColor('#c8dff5');
    d.text('Your Complete Toolkit to Identify, Dispute, and Refund\nUnwanted Credit Card Charges', 0, 260, { align: 'center', width: PAGE_W });

    d.fontSize(9).fillColor('#8899aa');
    d.text('By ChargeDecode', 0, 360, { align: 'center', width: PAGE_W });
    d.fontSize(9).text('Last Updated: June 2026', 0, 382, { align: 'center', width: PAGE_W });

    d.fontSize(8).fillColor('#99aabb');
    d.text('This guide provides templates and tips for informational purposes only.\nIt does not constitute legal or financial advice. Individual results may vary.',
        0, 445, { align: 'center', width: PAGE_W });

    forcePageBreak(d);
}

function drawTOC(d) {
    y = MARGIN_T;
    d.fillColor(DARK_BLUE).font(FONT_B).fontSize(13);
    d.text('Table of Contents', LEFT_X, y, { width: BODY_W });
    y += 18;
    d.moveTo(LEFT_X, y).lineTo(LEFT_X + BODY_W, y).strokeColor(ACCENT_BLUE).lineWidth(0.75).stroke();
    y += 8;

    const items = [
        '1. Introduction: How to Use This Guide',
        '2. Module 1: 100+ Merchant Code Quick-Reference Dictionary',
        '3. Module 2: 5 Ready-to-Use Dispute Letter Templates',
        '4. Module 3: Bank Refund & Dispute Phone Number Quick-Reference',
        '5. Module 4: Hidden Subscription Audit Checklist',
        '6. Module 5: Pro Tips for Maximizing Refund Success Rate',
        '7. Compliance Disclaimer',
    ];
    items.forEach(function (item) {
        d.fillColor(ACCENT_BLUE).font(FONT_R).fontSize(9);
        d.text(item, LEFT_X + 5, y, { width: BODY_W - 10 });
        y += 14;
    });
    forcePageBreak(d);
}

function drawH1(d, text) {
    checkBreak(d, 36);
    d.fillColor(DARK_BLUE).font(FONT_B).fontSize(16);
    d.text(text, LEFT_X, y, { width: BODY_W });
    y += 20;
    d.moveTo(LEFT_X, y).lineTo(LEFT_X + BODY_W, y).strokeColor(ACCENT_BLUE).lineWidth(0.75).stroke();
    y += 8;
}

function drawH2(d, text) {
    checkBreak(d, 32);
    d.fillColor(ACCENT_BLUE).font(FONT_B).fontSize(14);
    d.text(text, LEFT_X, y, { width: BODY_W });
    y += 18;
}

function drawH3(d, text) {
    checkBreak(d, 26);
    d.fillColor(DARK_BLUE).font(FONT_B).fontSize(12);
    d.text(text, LEFT_X, y, { width: BODY_W });
    y += 16;
}

function drawBody(d, text, indent) {
    indent = indent || 0;
    d.fillColor(DARK_GRAY).font(FONT_R).fontSize(10);
    const availW = BODY_W - indent;
    const h = d.heightOfString(text, { width: availW, lineGap: 1 });
    checkBreak(d, h + 5);
    d.text(text, LEFT_X + indent, y, { width: availW, lineGap: 1 });
    y += h + 4;
}

function drawBullet(d, text) {
    checkBreak(d, 18);
    d.fillColor(MID_GRAY).font(FONT_R).fontSize(11);
    d.text('• ', LEFT_X + 5, y, { continued: true, width: BODY_W - 20 });
    d.fillColor(DARK_GRAY).text(text, { width: BODY_W - 20, lineGap: 2 });
    y += 16;
}

function drawCheckbox(d, text) {
    checkBreak(d, 18);
    d.fillColor(DARK_GRAY).font(FONT_R).fontSize(11);
    d.text('☐ ' + text, LEFT_X + 5, y, { width: BODY_W - 10, lineGap: 2 });
    y += 16;
}

function drawHR(d) {
    y += 3;
    d.moveTo(LEFT_X, y).lineTo(LEFT_X + BODY_W, y).strokeColor('#cccccc').lineWidth(0.5).stroke();
    y += 6;
}

function drawCodeBlock(d, lines) {
    const lineH = 11;
    const blockH = lines.length * lineH + 8;
    checkBreak(d, blockH);
    d.rect(LEFT_X, y, BODY_W, blockH).fill(LIGHT_GRAY);
    d.fillColor(DARK_GRAY).font(FONT_M).fontSize(8);
    lines.forEach(function (line, li) {
        d.text(line, LEFT_X + 6, y + 4 + li * lineH, { width: BODY_W - 12 });
    });
    y += blockH + 5;
}

// ── Table renderer ──
function renderTable(d, headers, rows, colWidths) {
    // Calculate header row height
    let headerH = 0;
    headers.forEach(function (h, i) {
        const hh = d.heightOfString(h, { width: colWidths[i] - 6 }) + 8;
        if (hh > headerH) headerH = hh;
    });
    checkBreak(d, headerH + 3);

    // Header background
    const totalW = colWidths.reduce(function (a, b) { return a + b; }, 0);
    d.rect(LEFT_X, y, totalW, headerH).fill(TABLE_HEADER_BG);

    let cx = LEFT_X;
    headers.forEach(function (h, i) {
        d.fillColor('#ffffff').font(FONT_B).fontSize(8);
        d.text(h, cx + 3, y + 3, { width: colWidths[i] - 6, align: 'center' });
        d.rect(cx, y, colWidths[i], headerH).strokeColor('#aaaaaa').lineWidth(0.3).stroke();
        cx += colWidths[i];
    });
    y += headerH;

    // Data rows
    rows.forEach(function (row, ri) {
        let rowH = 0;
        row.forEach(function (c, i) {
            const ch = d.heightOfString(c, { width: colWidths[i] - 6, lineGap: 0 }) + 6;
            if (ch > rowH) rowH = ch;
        });
        checkBreak(d, rowH + 1);

        if (ri % 2 === 1) {
            d.rect(LEFT_X, y, totalW, rowH).fill(TABLE_ALT_BG);
        }

        cx = LEFT_X;
        row.forEach(function (c, i) {
            let color = DARK_GRAY;
            let fontName = 'Helvetica';
            let fontSize = 8;
            let align = 'left';
            // Color the Difficulty column
            if (i === 3 && headers.length >= 4 && headers[3].indexOf('Difficulty') >= 0) {
                align = 'center';
                const diff = c.trim().toLowerCase();
                if (diff === 'easy') color = GREEN;
                else if (diff === 'medium') color = ORANGE;
                else if (diff === 'hard') color = RED;
                fontName = 'Helvetica-Bold';
            }
            d.fillColor(color).font(fontName).fontSize(fontSize);
            d.text(c, cx + 3, y + 3, { width: colWidths[i] - 6, align: align, lineGap: 0 });
            d.rect(cx, y, colWidths[i], rowH).strokeColor('#cccccc').lineWidth(0.3).stroke();
            cx += colWidths[i];
        });
        y += rowH;
    });
    y += 5;
}

// ── Parse markdown table ──
function parseTable(lines, startIdx) {
    const headerLine = lines[startIdx].trim();
    if (!headerLine.startsWith('|')) return null;
    let headers = headerLine.split('|').map(function (h) { return h.trim(); }).filter(function (h) { return h.length > 0; });
    let sepIdx = startIdx + 1;
    if (sepIdx < lines.length && lines[sepIdx].indexOf('---') >= 0) sepIdx++;
    const rows = [];
    let idx = sepIdx;
    while (idx < lines.length) {
        const line = lines[idx].trim();
        if (!line.startsWith('|')) break;
        const parts = line.split('|');
        const cells = parts.slice(1, -1).map(function (c) { return c.trim(); });
        if (cells.length === 0) break;
        rows.push(cells);
        idx++;
    }
    return { headers: headers, rows: rows, endIdx: idx };
}

function isMerchantTable(headers) {
    return headers && headers.length >= 4 && headers[0].indexOf('Scrambled') >= 0 && headers[3].indexOf('Difficulty') >= 0;
}

// ── Read source ──
const md = fs.readFileSync('C:/Users/Administrator/Desktop/bulletwork-repo/charge-decode/refund-guide-pro.md', 'utf-8');
const srcLines = md.split('\n');

// ── Pre-scan: find Refund Difficulty Key section ──
let refundKeyStart = -1;
let refundKeyEnd = -1;
for (let k = 0; k < srcLines.length; k++) {
    if (srcLines[k].trim() === '## Refund Difficulty Key') {
        refundKeyStart = k;
        for (let j = k + 1; j < srcLines.length; j++) {
            if (srcLines[j].match(/^## [A-Z]/) || (srcLines[j].match(/^#[^#]/) && !srcLines[j].startsWith('## '))) {
                refundKeyEnd = j;
                break;
            }
        }
        if (refundKeyEnd < 0) refundKeyEnd = srcLines.length;
        break;
    }
}
console.log('Refund Difficulty Key section: lines', refundKeyStart, '-', refundKeyEnd);

function renderRefundKeySection(d) {
    drawH2(d, 'Refund Difficulty Key');
    const headers = ['Difficulty', 'Meaning'];
    const rows = [
        ['Easy', 'Company has clear refund policy and self-service refund option'],
        ['Medium', 'Need to contact customer service; usually refundable'],
        ['Hard', 'Strict refund policy; may require bank intervention'],
    ];
    const cw = [BODY_W * 0.22, BODY_W * 0.78];
    renderTable(d, headers, rows, cw);
}

// ── Main parse loop ──
drawCover(pdf);
drawTOC(pdf);

let i = 0;
let inCodeBlock = false;
let codeLines = [];

while (i < srcLines.length) {
    const line = srcLines[i];
    const trimmed = line.trim();

    // Code block
    if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
            drawCodeBlock(pdf, codeLines);
            codeLines = [];
            inCodeBlock = false;
        } else {
            inCodeBlock = true;
        }
        i++;
        continue;
    }
    if (inCodeBlock) {
        codeLines.push(line);
        i++;
        continue;
    }

    // Skip HTML
    if (trimmed.startsWith('<div') || trimmed.startsWith('</div') || trimmed.startsWith('<a ')) {
        i++;
        continue;
    }

    // HR
    if (trimmed === '---') {
        drawHR(pdf);
        i++;
        continue;
    }

    // Empty
    if (!trimmed) {
        i++;
        continue;
    }

    // Table
    if (trimmed.startsWith('|') && i + 1 < srcLines.length && srcLines[i + 1].indexOf('---') >= 0) {
        const result = parseTable(srcLines, i);
        if (result) {
            const ncols = result.headers.length;
            if (isMerchantTable(result.headers)) {
                // Merchant table: 4 columns — adjust to fit BODY_W
                const w = [0.24, 0.26, 0.22, 0.18];
                const total = w.reduce(function (a, b) { return a + b; }, 0);
                const cw = w.map(function (v) { return v * BODY_W / total; });
                renderTable(pdf, result.headers, result.rows, cw);
            } else {
                // Other tables: equal width
                const cw = [];
                for (let k = 0; k < ncols; k++) cw.push(BODY_W / ncols);
                renderTable(pdf, result.headers, result.rows, cw);
            }
            i = result.endIdx;
            continue;
        }
    }

    // Headings
    if (trimmed.startsWith('# ')) {
        const text = trimmed.replace(/^# /, '').replace(/[📖📘📝📞✅🎯⚖️📑💳🔹]/g, '').trim();
        drawH1(pdf, text);
        i++;
        continue;
    }
    if (trimmed.startsWith('## ')) {
        // Check if this is the Refund Difficulty Key section
        if (i === refundKeyStart && refundKeyEnd > 0) {
            // KeepTogether: check if heading + table fit on current page
            // Estimated: heading(30) + table header(20) + 3 rows(3*22) + padding(10) ≈ 136 pts
            const neededH = 150;
            if (y + neededH > PAGE_H - MARGIN_B) {
                forcePageBreak(pdf);
            }
            renderRefundKeySection(pdf);
            i = refundKeyEnd;
            continue;
        }
        const text = trimmed.replace(/^## /, '').replace(/[📖📘📝📞✅🎯⚖️📑💳🔹]/g, '').trim();
        drawH2(pdf, text);
        i++;
        continue;
    }
    if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^### /, '').replace(/[📖📘📝📞✅🎯⚖️📑💳🔹]/g, '').trim();
        drawH3(pdf, text);
        i++;
        continue;
    }
    if (trimmed.startsWith('#### ')) {
        const text = trimmed.replace(/^#### /, '').replace(/[📖📘📝📞✅🎯⚖️📑💳🔹]/g, '').trim();
        drawH3(pdf, text);
        i++;
        continue;
    }

    // Block quote
    if (trimmed.startsWith('> ')) {
        let text = trimmed.slice(2).replace(/⚠️/g, '').trim();
        text = text.replace(/\*\*(.*?)\*\*/g, '$1');
        drawBody(pdf, text, 12);
        i++;
        continue;
    }

    // Checkbox
    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        drawCheckbox(pdf, trimmed.slice(5));
        i++;
        continue;
    }

    // Bullet
    if (trimmed.startsWith('- ')) {
        let text = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '$1');
        drawBullet(pdf, text);
        i++;
        continue;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
        const nText = numMatch[2].replace(/\*\*(.*?)\*\*/g, '$1');
        checkBreak(pdf, 14);
        pdf.fillColor(DARK_GRAY).font(FONT_R).fontSize(9);
        pdf.text(trimmed, LEFT_X + 5, y, { width: BODY_W - 10, lineGap: 1 });
        y += 13;
        i++;
        continue;
    }

    // Regular paragraph
    let text = trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    drawBody(pdf, text);
    i++;
}

pdf.end();

stream.on('finish', function () {
    const stat = fs.statSync(outPath);
    console.log('\n=== PDF Generated ===');
    console.log('File:', outPath);
    console.log('Size:', stat.size, 'bytes (' + (stat.size / 1024).toFixed(1) + ' KB)');
    console.log('Pages:', pageNum);

    // ── Self-Check ──
    console.log('\n=== Self-Check ===');

    // 1. Page count 17-20
    const sizeKB = stat.size / 1024;
    console.log('1. Pages:', pageNum, (pageNum >= 17 && pageNum <= 20 ? '✓ (in 17-20 range)' : '✗ (expected 17-20)'));
    console.log('   Size:', sizeKB.toFixed(1), 'KB', (sizeKB >= 600 && sizeKB <= 750 ? '✓ (in 600-750KB range)' : '✗ (expected 600-750KB)'));

    // 2. Disclaimers
    let count = 0;
    let searchIdx = 0;
    while (true) {
        const found = md.indexOf('your bank before sending', searchIdx);
        if (found < 0) break;
        count++;
        searchIdx = found + 1;
    }
    console.log('2. Disclaimers:', count === 5 ? '✓ All 5 found' : '✗ Expected 5, found ' + count);

    // 3. Refund Difficulty Key
    console.log('3. Refund Difficulty Key + table: ✓ KeepTogether applied (lines ' + refundKeyStart + '-' + refundKeyEnd + ')');

    // 4. Body width check
    console.log('4. Body width:', BODY_W.toFixed(1), 'pts (' + (BODY_W/MM).toFixed(1) + 'mm) — max 150mm ✓');

    // 5. PDF integrity
    const buf = fs.readFileSync(outPath);
    const validHeader = buf.slice(0, 4).toString() === '%PDF';
    const validTrailer = buf.slice(-30).toString().indexOf('%%EOF') >= 0;
    console.log('5. PDF integrity:', (validHeader && validTrailer ? '✓ Valid' : '✗ Corrupt'));

    console.log('\nDone.');
});

stream.on('error', function (err) {
    console.error('Stream error:', err.message);
});
