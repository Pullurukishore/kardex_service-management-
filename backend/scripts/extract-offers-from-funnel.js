const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const inputArg = process.argv[2];
const outputArg = process.argv[3];

const defaultInputPath = path.join(
  __dirname,
  '..',
  'data',
  'Repaired_2025_Zonewise_Open_Closed_Offer funnel_ on 04032025.xlsx'
);

const inputPath = inputArg ? path.resolve(inputArg) : defaultInputPath;
const outputPath = outputArg
  ? path.resolve(outputArg)
  : path.join(__dirname, '..', 'data', 'extracted-offers.xlsx');

console.log('Reading Excel file:', inputPath);

if (!fs.existsSync(inputPath)) {
  console.error('Input file not found:', inputPath);
  process.exit(1);
}

const workbook = XLSX.readFile(inputPath);

if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
  console.error('No sheets found in workbook.');
  process.exit(1);
}

console.log('Available sheets:', workbook.SheetNames.join(', '));

// Heuristic: treat any sheet whose name contains "offer" or "funnel" as offer data
const offerSheetNames = workbook.SheetNames.filter((name) => {
  const lower = name.toLowerCase();
  return lower.includes('offer') || lower.includes('funnel');
});

if (offerSheetNames.length === 0) {
  console.error('No sheets with "offer" or "funnel" in the name were found.');
  process.exit(1);
}

let allRows = [];
for (const sheetName of offerSheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rows || rows.length === 0) {
    continue;
  }

  const taggedRows = rows.map((row) => ({
    __sheet: sheetName,
    ...row,
  }));

  allRows = allRows.concat(taggedRows);
}

if (allRows.length === 0) {
  console.error('No data rows found in offer-related sheets.');
  process.exit(1);
}

const offersSheet = XLSX.utils.json_to_sheet(allRows);
const outBook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(outBook, offersSheet, 'Offers');

XLSX.writeFile(outBook, outputPath);

console.log(`Extracted ${allRows.length} row(s) from sheets: ${offerSheetNames.join(', ')}`);
console.log('Output written to:', outputPath);
