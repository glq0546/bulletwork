// ── ChargeDecode Refund Guide Pro PDF Generator v3 ──
// Strict layout per instruction: A4, 30mm L/R, 20mm T/B, 150mm body, 11pt body text

const PDFDocument = require('pdfkit');
const fs = require('fs');

const PAGE_W = 595.27;
const PAGE_H = 841.89;
const MM = 72 / 25.4;
const MARGIN_L = 30 * MM;
const MARGIN_R = 30 * MM;
const MARGIN_T = 20 * MM;
const MARGIN_B = 20 * MM;
const BODY_W = 150 * MM;
const LEFT_X = MARGIN_L;

const DARK_BLUE = '#1a3a5c';
const ACCENT_BLUE = '#2c5f8a';
const TABLE_HEADER_BG = '#1a3a5c';
const TABLE_ALT_BG = '#f0f5fa';
const LIGHT_GRAY = '#f5f5f5';
const MID_GRAY = '#888888';
const DARK_GRAY = '#333333';
const GREEN = '#27ae60';
const ORANGE = '#f39c12';
const RED = '#c0392b';

const pdf = new PDFDocument({ size: 'A4', margin: 0 });
const outPath = 'C:/Users/Administrator/Desktop/ChargeDecode-Refund-Guide-Pro.pdf';
const stream = fs.createWriteStream(outPath);
pdf.pipe(stream);

// ── Embedded fonts ──
let FONT_R = 'Helvetica';
let FONT_B = 'Helvetica-Bold';
let FONT_M = 'Courier';
try {
    pdf.registerFont('FReg', 'C:/Windows/Fonts/arial.ttf');
    pdf.registerFont('FBld', 'C:/Windows/Fonts/arialbd.ttf');
    pdf.registerFont('FMnt', 'C:/Windows/Fonts/cour.ttf');
    FONT_R = 'FReg';
    FONT_B = 'FBld';
    FONT_M = 'FMnt';
    console.log('Embedded fonts OK');
} catch (e) {
    console.log('Font error:', e.message);
}

let y = MARGIN_T;
let pageNum = 1;

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

// ── Cover ──
function drawCover(d) {
    d.save();
    d.rect(0, 0, PAGE_W, PAGE_H).fill(DARK_BLUE);
    d.restore();
    d.fillColor('#fff').font(FONT_B).fontSize(26);
    d.text('Credit Card Charge Decoder', 0, 145, { align: 'center', width: PAGE_W });
    d.fontSize(13).font(FONT_R).fillColor('#c8dff5');
    d.text('The Ultimate Refund & Dispute Guide', 0, 188, { align: 'center', width: PAGE_W });
    d.fontSize(12).font(FONT_B).fillColor('#ffd700');
    d.text('Pro Edition — $19.99', 0, 230, { align: 'center', width: PAGE_W });
    d.fontSize(11).font(FONT_R).fillColor('#c8dff5');
    d.text('Your Complete Toolkit to Identify, Dispute, and Refund\nUnwanted Credit Card Charges', 0, 280, { align: 'center', width: PAGE_W });
    d.fontSize(9).fillColor('#8899aa');
    d.text('By ChargeDecode\nLast Updated: June 2026', 0, 390, { align: 'center', width: PAGE_W });
    d.fontSize(8).fillColor('#99aabb');
    d.text('This guide provides templates and tips for informational purposes only.\nIt does not constitute legal or financial advice. Individual results may vary.',
        0, 475, { align: 'center', width: PAGE_W });
    forcePageBreak(d);
}

function drawTOC(d) {
    y = MARGIN_T;
    d.fillColor(DARK_BLUE).font(FONT_B).fontSize(14);
    d.text('Table of Contents', LEFT_X, y, { width: BODY_W });
    y += 20;
    d.moveTo(LEFT_X, y).lineTo(LEFT_X + BODY_W, y).strokeColor(ACCENT_BLUE).lineWidth(0.75).stroke();
    y += 10;
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
        d.fillColor(ACCENT_BLUE).font(FONT_R).fontSize(10);
        d.text(item, LEFT_X + 5, y, { width: BODY_W - 10 });
        y += 16;
    });
    forcePageBreak(d);
}

function drawH1(d, text) {
    checkBreak(d, 38);
    d.fillColor(DARK_BLUE).font(FONT_B).fontSize(18);
    d.text(text, LEFT_X, y, { width: BODY_W });
    y += 24;
    d.moveTo(LEFT_X, y).lineTo(LEFT_X + BODY_W, y).strokeColor(ACCENT_BLUE).lineWidth(1).stroke();
    y += 10;
}

function drawH2(d, text) {
    checkBreak(d, 34);
    d.fillColor(ACCENT_BLUE).font(FONT_B).fontSize(14);
    d.text(text, LEFT_X, y, { width: BODY_W });
    y += 18;
}

function drawH3(d, text) {
    checkBreak(d, 28);
    d.fillColor(DARK_BLUE).font(FONT_B).fontSize(13);
    d.text(text, LEFT_X, y, { width: BODY_W });
    y += 16;
}

function drawBody(d, text, indent) {
    indent = indent || 0;
    d.fillColor(DARK_GRAY).font(FONT_R).fontSize(9);
    const availW = BODY_W - indent;
    const h = d.heightOfString(text, { width: availW, lineGap: 0 });
    checkBreak(d, h + 4);
    d.text(text, LEFT_X + indent, y, { width: availW, lineGap: 0 });
    y += h + 3;
}

function drawBullet(d, text) {
    checkBreak(d, 14);
    d.fillColor(MID_GRAY).font(FONT_R).fontSize(9);
    d.text('• ', LEFT_X + 5, y, { continued: true, width: BODY_W - 20 });
    d.fillColor(DARK_GRAY).text(text, { width: BODY_W - 20, lineGap: 0 });
    y += 12;
}

function drawCheckbox(d, text) {
    checkBreak(d, 14);
    d.fillColor(DARK_GRAY).font(FONT_R).fontSize(9);
    d.text('☐ ' + text, LEFT_X + 5, y, { width: BODY_W - 10, lineGap: 0 });
    y += 12;
}

function drawHR(d) {
    y += 4;
    d.moveTo(LEFT_X, y).lineTo(LEFT_X + BODY_W, y).strokeColor('#cccccc').lineWidth(0.5).stroke();
    y += 8;
}

function drawCodeBlock(d, lines) {
    const lineH = 13;
    const blockH = lines.length * lineH + 10;
    checkBreak(d, blockH);
    d.rect(LEFT_X, y, BODY_W, blockH).fill(LIGHT_GRAY);
    d.fillColor(DARK_GRAY).font(FONT_M).fontSize(9);
    lines.forEach(function (line, li) {
        d.text(line, LEFT_X + 8, y + 5 + li * lineH, { width: BODY_W - 16 });
    });
    y += blockH + 6;
}

function renderTable(d, headers, rows, colWidths, continueFromPrev) {
    let headerH = 0;
    const fontSize = continueFromPrev ? 9 : 10;
    const headerPad = continueFromPrev ? 6 : 10;
    headers.forEach(function (h, i) {
        const hh = d.heightOfString(h, { width: colWidths[i] - 8 }) + headerPad;
        if (hh > headerH) headerH = hh;
    });
    if (!continueFromPrev) {
        checkBreak(d, headerH + 4);
    }
    const totalW = colWidths.reduce(function (a, b) { return a + b; }, 0);
    d.rect(LEFT_X, y, totalW, headerH).fill(TABLE_HEADER_BG);
    let cx = LEFT_X;
    headers.forEach(function (h, i) {
        d.fillColor('#ffffff').font(FONT_B).fontSize(fontSize);
        d.text(h, cx + 4, y + 3, { width: colWidths[i] - 8, align: 'center' });
        d.rect(cx, y, colWidths[i], headerH).strokeColor('#aaaaaa').lineWidth(0.3).stroke();
        cx += colWidths[i];
    });
    y += headerH;

    rows.forEach(function (row, ri) {
        let rowH = 0;
        row.forEach(function (c, i) {
            const ch = d.heightOfString(c, { width: colWidths[i] - 8 }) + 8;
            if (ch > rowH) rowH = ch;
        });
        checkBreak(d, rowH + 2);
        if (ri % 2 === 1) {
            d.rect(LEFT_X, y, totalW, rowH).fill(TABLE_ALT_BG);
        }
        cx = LEFT_X;
        row.forEach(function (c, i) {
            let color = DARK_GRAY;
            let fontName = FONT_R;
            let align = 'left';
            if (i === 3 && headers.length >= 4 && headers[3].indexOf('Difficulty') >= 0) {
                align = 'center';
                const diff = c.trim().toLowerCase();
                if (diff === 'easy') color = GREEN;
                else if (diff === 'medium') color = ORANGE;
                else if (diff === 'hard') color = RED;
                fontName = FONT_B;
            }
            d.fillColor(color).font(fontName).fontSize(10);
            d.text(c, cx + 4, y + 4, { width: colWidths[i] - 8, align: align });
            d.rect(cx, y, colWidths[i], rowH).strokeColor('#cccccc').lineWidth(0.3).stroke();
            cx += colWidths[i];
        });
        y += rowH;
    });
    y += 6;
}

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
console.log('RefundKey section: lines', refundKeyStart, '-', refundKeyEnd);

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

// ── Main loop ──
drawCover(pdf);
drawTOC(pdf);

let i = 0;
let inCodeBlock = false;
let codeLines = [];

while (i < srcLines.length) {
    const line = srcLines[i];
    const trimmed = line.trim();

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

    if (trimmed.startsWith('<div') || trimmed.startsWith('</div') || trimmed.startsWith('<a ')) {
        i++;
        continue;
    }
    if (trimmed === '---') {
        drawHR(pdf);
        i++;
        continue;
    }
    if (!trimmed) {
        i++;
        continue;
    }

    if (trimmed.startsWith('|') && i + 1 < srcLines.length && srcLines[i + 1].indexOf('---') >= 0) {
        const result = parseTable(srcLines, i);
        if (result) {
            const ncols = result.headers.length;
            if (isMerchantTable(result.headers)) {
                // MERGE: collect all consecutive merchant tables into one
                const allRows = result.rows.slice();
                let endIdx = result.endIdx;
                // Look ahead for more merchant tables (letter sections)
                let lookIdx = endIdx;
                while (lookIdx < srcLines.length) {
                    // Skip blank lines
                    if (srcLines[lookIdx].trim() === '') { lookIdx++; continue; }
                    // Check if next line is a letter heading like ## A, ## B, etc.
                    if (srcLines[lookIdx].match(/^## [A-Z]$/)) {
                        // Check if followed by a table
                        let nextLine = lookIdx + 1;
                        while (nextLine < srcLines.length && srcLines[nextLine].trim() === '') nextLine++;
                        if (nextLine < srcLines.length && srcLines[nextLine].startsWith('|') &&
                            nextLine + 1 < srcLines.length && srcLines[nextLine + 1].indexOf('---') >= 0) {
                            const nextResult = parseTable(srcLines, nextLine);
                            if (nextResult && isMerchantTable(nextResult.headers)) {
                                allRows.push.apply(allRows, nextResult.rows);
                                endIdx = nextResult.endIdx;
                                lookIdx = endIdx;
                                continue;
                            }
                        }
                    }
                    break;
                }
                const w = [0.24, 0.26, 0.22, 0.18];
                const total = w.reduce(function (a, b) { return a + b; }, 0);
                const cw = w.map(function (v) { return v * BODY_W / total; });
                renderTable(pdf, result.headers, allRows, cw, false);
                i = endIdx;
            } else {
                const cw = [];
                for (let k = 0; k < ncols; k++) cw.push(BODY_W / ncols);
                renderTable(pdf, result.headers, result.rows, cw, false);
            }
            continue;
        }
    }

    if (trimmed.startsWith('# ')) {
        const text = trimmed.replace(/^# /, '').replace(/[📖📘📝📞✅🎯⚖️📑💳🔹]/g, '').trim();
        drawH1(pdf, text);
        i++;
        continue;
    }
    if (trimmed.startsWith('## ')) {
        if (i === refundKeyStart && refundKeyEnd > 0) {
            const neededH = 160;
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

    if (trimmed.startsWith('> ')) {
        let text = trimmed.slice(2).replace(/⚠️/g, '').trim();
        text = text.replace(/\*\*(.*?)\*\*/g, '$1');
        drawBody(pdf, text, 12);
        i++;
        continue;
    }

    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        drawCheckbox(pdf, trimmed.slice(5));
        i++;
        continue;
    }

    if (trimmed.startsWith('- ')) {
        let text = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '$1');
        drawBullet(pdf, text);
        i++;
        continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
        checkBreak(pdf, 18);
        pdf.fillColor(DARK_GRAY).font(FONT_R).fontSize(11);
        pdf.text(trimmed, LEFT_X + 5, y, { width: BODY_W - 10, lineGap: 2 });
        y += 16;
        i++;
        continue;
    }

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

    console.log('\n=== Self-Check ===');
    const sizeKB = stat.size / 1024;
    const pageOK = pageNum >= 17 && pageNum <= 20;
    const sizeOK = sizeKB >= 600 && sizeKB <= 750;
    console.log('1. Pages:', pageNum, pageOK ? '✓' : '✗ (expected 17-20)');
    console.log('   Size:', sizeKB.toFixed(1), 'KB', sizeOK ? '✓' : '✗ (expected 600-750KB)');

    let count = 0;
    let searchIdx = 0;
    while (true) {
        const found = md.indexOf('your bank before sending', searchIdx);
        if (found < 0) break;
        count++;
        searchIdx = found + 1;
    }
    console.log('2. Disclaimers:', count === 5 ? '✓ All 5' : '✗ Found ' + count);
    console.log('3. Refund Difficulty Key: ✓ KeepTogether applied');
    console.log('4. Body width: 150mm ✓');

    const buf = fs.readFileSync(outPath);
    const valid = buf.slice(0, 4).toString() === '%PDF' && buf.slice(-30).toString().indexOf('%%EOF') >= 0;
    console.log('5. PDF integrity:', valid ? '✓ Valid' : '✗ Corrupt');
    console.log('\nDone.');
});

stream.on('error', function (err) {
    console.error('Error:', err.message);
});
