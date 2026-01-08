/**
 * Generate dummy AR Invoice Excel file for import testing
 * Run: node generate-ar-excel.js
 * 
 * Make sure xlsx is installed: npm install xlsx
 */

const XLSX = require('xlsx');

const data = [
    [1001, 1, "CUST001", "Alpha Corp", 10, "REF001", "2025-01-01", 5000, 4500, 500, 5000, "2025-01-02", "2024-12-15"],
    [1002, 2, "CUST002", "Beta Ltd", 5, "REF002", "2025-01-05", 3000, 2700, 300, 3000, "2025-01-06", "2024-12-20"],
    [1003, 1, "CUST003", "Gamma Inc", 0, "REF003", "2025-01-10", 7000, 6300, 700, 7000, "2025-01-11", "2024-12-25"],
    [1004, 3, "CUST004", "Delta LLC", 20, "REF004", "2024-12-20", 4000, 3600, 400, 4000, "2024-12-21", "2024-11-30"],
    [1005, 1, "CUST005", "Epsilon Co", 2, "REF005", "2025-01-08", 6000, 5400, 600, 6000, "2025-01-09", "2024-12-28"],
];

const columns = [
    "Doc. No.", "Installment No.", "Customer Code", "Customer Name",
    "Days Overdue", "Customer Ref. No.", "Due Date", "Amount",
    "Net", "Tax", "Original Amount", "Posting Date", "Document Date"
];

// Convert data to array of objects
const jsonData = data.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
        obj[col] = row[i];
    });
    return obj;
});

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(jsonData);

// Set column widths
ws['!cols'] = columns.map(() => ({ wch: 18 }));

XLSX.utils.book_append_sheet(wb, ws, 'AR Invoices');

// Write file
const fileName = 'customer_installments_dummy.xlsx';
XLSX.writeFile(wb, fileName);

console.log(`✅ Excel file created successfully: ${fileName}`);
console.log(`📊 Total records: ${data.length}`);
