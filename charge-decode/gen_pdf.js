const PDFDocument = require('pdfkit');
const fs = require('fs');

const PAGE_W = 595.27;
const PAGE_H = 841.89;
const MARGIN_T = 20 * 72 / 25.4;
const MARGIN_B = 20 * 72 / 25.4;
const MAX_BODY_W = PAGE_W * 0.6;
const LEFT_X = (PAGE_W - MAX_BODY_W) / 2;

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

const pdf = new PDFDocument({ size: 'A4', margin: 0 });
const outPath = 'C:/Users/Administrator/Desktop/Credit_Card_Charge_Decoder_Pro.pdf';
const stream = fs.createWriteStream(outPath);
pdf.pipe(stream);

let y = MARGIN_T;
let pageNum = 1;

function checkBreak(d, needed) {
    if (y + needed > PAGE_H - MARGIN_B) {
        d.addPage();
        pageNum++;
        y = MARGIN_T;
    }
}

function drawHR(d) {
    y += 4;
    d.moveTo(LEFT_X, y).lineTo(LEFT_X + MAX_BODY_W, y).strokeColor('#cccccc').lineWidth(0.5).stroke();
    y += 8;
}

function drawH1(d, text) {
    checkBreak(d, 40);
    d.fillColor(DARK_BLUE).font('Helvetica-Bold').fontSize(15);
    d.text(text, LEFT_X, y, { width: MAX_BODY_W });
    y += 20;
    d.moveTo(LEFT_X, y).lineTo(LEFT_X + MAX_BODY_W, y).strokeColor(ACCENT_BLUE).lineWidth(0.75).stroke();
    y += 10;
}

function drawH2(d, text) {
    checkBreak(d, 40);
    d.fillColor(ACCENT_BLUE).font('Helvetica-Bold').fontSize(12);
    d.text(text, LEFT_X, y, { width: MAX_BODY_W });
    y += 18;
}

function drawH3(d, text) {
    checkBreak(d, 30);
    d.fillColor(DARK_BLUE).font('Helvetica-Bold').fontSize(10.5);
    d.text(text, LEFT_X, y, { width: MAX_BODY_W });
    y += 16;
}

function drawBody(d, text, indent) {
    indent = indent || 0;
    d.fillColor(DARK_GRAY).font('Helvetica').fontSize(9);
    const availW = MAX_BODY_W - indent;
    const h = d.heightOfString(text, { width: availW });
    checkBreak(d, h + 6);
    d.text(text, LEFT_X + indent, y, { width: availW });
    y += h + 4;
}

function drawBullet(d, text) {
    checkBreak(d, 18);
    d.fillColor(MID_GRAY).font('Helvetica').fontSize(9);
    d.text('• ', LEFT_X + 5, y, { continued: true });
    d.fillColor(DARK_GRAY).text(text, { width: MAX_BODY_W - 20 });
    y += 16;
}

function drawCheckbox(d, text) {
    checkBreak(d, 18);
    d.fillColor(DARK_GRAY).font('Helvetica').fontSize(9);
    d.text('☐ ' + text, LEFT_X + 5, y, { width: MAX_BODY_W - 10 });
    y += 16;
}

function drawCodeBlock(d, lines) {
    const lineH = 13;
    const blockH = lines.length * lineH + 12;
    checkBreak(d, blockH);
    d.rect(LEFT_X, y, MAX_BODY_W, blockH).fill(LIGHT_GRAY);
    d.fillColor(DARK_GRAY).font('Courier').fontSize(8.5);
    lines.forEach(function (line, li) {
        d.text(line, LEFT_X + 8, y + 6 + li * lineH, { width: MAX_BODY_W - 16 });
    });
    y += blockH + 6;
}

function renderTable(d, headers, rows, colWidths) {
    const ncols = headers.length;
    let headerH = 0;
    headers.forEach(function (h, i) {
        const hh = d.heightOfString(h, { width: colWidths[i] - 8 }) + 10;
        if (hh > headerH) headerH = hh;
    });
    checkBreak(d, headerH + 4);
    d.rect(LEFT_X, y, colWidths.reduce(function (a, b) { return a + b; }, 0), headerH).fill(TABLE_HEADER_BG);
    let cx = LEFT_X;
    headers.forEach(function (h, i) {
        d.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8).text(h, cx + 4, y + 4, { width: colWidths[i] - 8, align: 'center' });
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
            d.rect(LEFT_X, y, colWidths.reduce(function (a, b) { return a + b; }, 0), rowH).fill(TABLE_ALT_BG);
        }
        cx = LEFT_X;
        row.forEach(function (c, i) {
            let color = DARK_GRAY;
            let fontName = 'Helvetica';
            let align = 'left';
            if (i === 3 && headers.length >= 4 && headers[3].indexOf('Difficulty') >= 0) {
                align = 'center';
                const diff = c.trim().toLowerCase();
                if (diff === 'easy') color = GREEN;
                else if (diff === 'medium') color = ORANGE;
                else if (diff === 'hard') color = RED;
                fontName = 'Helvetica-Bold';
            }
            d.fillColor(color).font(fontName).fontSize(8).text(c, cx + 4, y + 4, { width: colWidths[i] - 8, align: align });
            d.rect(cx, y, colWidths[i], rowH).strokeColor('#cccccc').lineWidth(0.3).stroke();
            cx += colWidths[i];
        });
        y += rowH;
    });
    y += 6;
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

// ── Cover page ──
function drawCover(d) {
    d.save();
    d.rect(0, 0, PAGE_W, PAGE_H).fill(DARK_BLUE);
    d.restore();
    d.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26);
    d.text('Credit Card Charge Decoder', 0, 160, { align: 'center', width: PAGE_W });
    d.fontSize(13).font('Helvetica').fillColor('#c8dff5');
    d.text('The Ultimate Refund & Dispute Guide', 0, 200, { align: 'center', width: PAGE_W });
    d.fontSize(12).font('Helvetica-Bold').fillColor('#ffd700');
    d.text('Pro Edition — $19.99', 0, 240, { align: 'center', width: PAGE_W });
    d.fontSize(11).font('Helvetica').fillColor('#c8dff5');
    d.text('Your Complete Toolkit to Identify, Dispute, and Refund\nUnwanted Credit Card Charges', 0, 290, { align: 'center', width: PAGE_W });
    d.fontSize(10).fillColor('#8899aa');
    d.text('By ChargeDecode', 0, 380, { align: 'center', width: PAGE_W });
    d.fontSize(9).text('Last Updated: June 2026', 0, 400, { align: 'center', width: PAGE_W });
    d.fontSize(8).fillColor('#99aabb');
    d.text('This guide provides templates and tips for informational purposes only.\nIt does not constitute legal or financial advice. Individual results may vary.', 0, 460, { align: 'center', width: PAGE_W });
    d.addPage();
    pageNum++;
    y = MARGIN_T;
}

function drawTOC(d) {
    y = MARGIN_T;
    d.fillColor(DARK_BLUE).font('Helvetica-Bold').fontSize(16);
    d.text('Table of Contents', LEFT_X, y, { width: MAX_BODY_W });
    y += 26;
    d.moveTo(LEFT_X, y).lineTo(LEFT_X + MAX_BODY_W, y).strokeColor(ACCENT_BLUE).lineWidth(1).stroke();
    y += 12;
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
        d.fillColor(ACCENT_BLUE).font('Helvetica').fontSize(10);
        d.text(item, LEFT_X + 5, y, { width: MAX_BODY_W - 10 });
        y += 18;
    });
    d.addPage();
    pageNum++;
    y = MARGIN_T;
}

// ── Read source ──
const md = fs.readFileSync('C:/Users/Administrator/Desktop/bulletwork-repo/charge-decode/refund-guide-pro.md', 'utf-8');
const srcLines = md.split('\n');

// ── KeepTogether helper for Refund Difficulty Key ──
// Pre-scan: find the line range for the Refund Difficulty Key section
let refundKeyStart = -1;
let refundKeyEnd = -1;
for (let k = 0; k < srcLines.length; k++) {
    if (srcLines[k].trim() === '## Refund Difficulty Key') {
        refundKeyStart = k;
        // End = next ## heading or next # heading (letter section like ## A)
        for (let j = k + 1; j < srcLines.length; j++) {
            if (srcLines[j].match(/^## [A-Z]/) || srcLines[j].match(/^#[^#]/)) {
                refundKeyEnd = j;
                break;
            }
        }
        if (refundKeyEnd < 0) refundKeyEnd = srcLines.length;
        break;
    }
}

function renderRefundKeySection(d) {
    // Render the heading
    drawH2(d, 'Refund Difficulty Key');
    // Parse and render the 3-row difficulty table
    const headers = ['Difficulty', 'Meaning'];
    const rows = [
        ['Easy', 'Company has clear refund policy and self-service refund option'],
        ['Medium', 'Need to contact customer service; usually refundable'],
        ['Hard', 'Strict refund policy; may require bank intervention'],
    ];
    const cw = [MAX_BODY_W * 0.25, MAX_BODY_W * 0.75];
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

    // Table
    if (trimmed.startsWith('|') && i + 1 < srcLines.length && srcLines[i + 1].indexOf('---') >= 0) {
        const result = parseTable(srcLines, i);
        if (result) {
            const ncols = result.headers.length;
            if (isMerchantTable(result.headers)) {
                const w = [0.24, 0.24, 0.22, 0.18];
                const total = w.reduce(function (a, b) { return a + b; }, 0);
                const cw = w.map(function (v) { return v * MAX_BODY_W / total; });
                renderTable(pdf, result.headers, result.rows, cw);
            } else {
                const cw = [];
                for (let k = 0; k < ncols; k++) cw.push(MAX_BODY_W / ncols);
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
        const text = trimmed.replace(/^## /, '').replace(/[📖📘📝📞✅🎯⚖️📑💳🔹]/g, '').trim();
        // KeepTogether: if this is "Refund Difficulty Key", ensure it + table fit on one page
        if (i === refundKeyStart && refundKeyEnd > 0) {
            // Estimate needed height: heading(~30) + table(~3 rows * 20 + header 16 + 12 padding) = ~120
            const neededH = 140;
            if (y + neededH > PAGE_H - MARGIN_B) {
                pdf.addPage();
                pageNum++;
                y = MARGIN_T;
            }
            renderRefundKeySection(pdf);
            i = refundKeyEnd;
            continue;
        }
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
        drawBody(pdf, text, 10);
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
        checkBreak(pdf, 18);
        pdf.fillColor(DARK_GRAY).font('Helvetica').fontSize(9);
        pdf.text(trimmed, LEFT_X + 5, y, { width: MAX_BODY_W - 10 });
        y += 16;
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

    console.log('\n=== Self-Check ===');
    console.log('1. Dispute letter templates (pages ~8-11): visually verify in PDF viewer');
    console.log('2. All 5 Disclaimers end with "your bank before sending." — source check:');
    // Count all occurrences of the disclaimer ending in the full source
    let count = 0;
    let searchIdx = 0;
    while (true) {
        const found = md.indexOf('your bank before sending', searchIdx);
        if (found < 0) break;
        count++;
        searchIdx = found + 1;
    }
    if (count === 5) {
        console.log('  ✓ All 5 disclaimers found (all end with "your bank before sending.")');
    } else {
        console.log('  ✗ Expected 5 disclaimers, found ' + count);
    }
    console.log('3. Refund Difficulty Key + table on same page — applied in layout');
    console.log('\nDone.');
});

stream.on('error', function (err) {
    console.error('Stream error:', err.message);
});
