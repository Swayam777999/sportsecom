const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const inputHtml = path.resolve(__dirname, '..', 'PEAKNXT_PROJECT_REPORT.html');
const outputPdf = path.resolve(__dirname, '..', 'PEAKNXT_PROJECT_REPORT.pdf');

console.log('Converting HTML to PDF...');
console.log('Input:', inputHtml);
console.log('Output:', outputPdf);

const args = [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${outputPdf}`,
  inputHtml
];

execFile(edgePath, args, (err) => {
  if (err) {
    console.error('Conversion error:', err.message);
    process.exit(1);
  }
  if (fs.existsSync(outputPdf)) {
    const size = fs.statSync(outputPdf).size;
    console.log('SUCCESS! PDF generated:', size, 'bytes');
  } else {
    console.error('PDF file was not created.');
  }
});
