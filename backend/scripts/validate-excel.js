const XLSX = require('xlsx');
const fs = require('fs');

const EXCEL_FILE_PATH = process.argv[2] || './data/import-data.xlsx';

function validateExcelFile() {
  try {
    // Check if file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      return false;
    }
    
    // Read Excel file
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get headers
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
    // Required columns
    const requiredColumns = [
      'Name of the Customer',
      'Place',
      'Department', 
      'Zone',
      'Serial Number'
    ];
    
    // Normalize headers by trimming spaces
    const normalizedHeaders = headers.map(h => h ? h.toString().trim() : '');
    
    let allColumnsValid = true;
    
    requiredColumns.forEach(col => {
      const found = normalizedHeaders.includes(col) || headers.includes(col);
      if (found) {
        } else {
        allColumnsValid = false;
      }
    });
    
    // Show actual headers
    headers.forEach((header, index) => {
      const isRequired = requiredColumns.includes(header);
      const status = isRequired ? '✅' : '⚠️';
      });
    
    // Get data preview
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    if (jsonData.length > 0) {
      jsonData.slice(0, 3).forEach((row, index) => {
        requiredColumns.forEach(col => {
          // Handle column names with potential trailing spaces
          let value = row[col];
          if (!value && row[col + ' ']) {
            value = row[col + ' '];
          }
          if (!value) {
            const trimmedKey = Object.keys(row).find(key => key.trim() === col);
            if (trimmedKey) value = row[trimmedKey];
          }
          value = value || '[EMPTY]';
          });
      });
    }
    
    // Validation summary
    if (allColumnsValid && jsonData.length > 0) {
      } else {
      if (!allColumnsValid) {
        }
      if (jsonData.length === 0) {
        }
    }
    return allColumnsValid && jsonData.length > 0;
    
  } catch (error) {
    return false;
  }
}

// Run validation
if (require.main === module) {
  const isValid = validateExcelFile();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateExcelFile };
