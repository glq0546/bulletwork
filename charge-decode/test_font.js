var PDFDocument = require('pdfkit');
var fs = require('fs');

var outPath = 'C:/Users/Administrator/Desktop/test_embed.pdf';
var doc = new PDFDocument({ size: 'A4' });

// Register embedded font
doc.registerFont('EmbedFont', 'C:/Windows/Fonts/cour.ttf');

// Use the embedded font for all text
doc.font('EmbedFont').fontSize(12).text('This is a test with embedded font.', 50, 50);
doc.font('EmbedFont').fontSize(12).text('Second line of text.', 50, 70);

var stream = fs.createWriteStream(outPath);
doc.pipe(stream);
doc.end();

stream.on('finish', function () {
    var s = fs.statSync(outPath);
    console.log('File size:', s.size, 'bytes (' + (s.size / 1024).toFixed(1) + ' KB)');
    // Check if font is embedded
    var buf = fs.readFileSync(outPath);
    var content = buf.toString();
    console.log('Has /FontFile:', content.indexOf('/FontFile') >= 0);
    console.log('Has /FontDescriptor:', content.indexOf('/FontDescriptor') >= 0);
});
