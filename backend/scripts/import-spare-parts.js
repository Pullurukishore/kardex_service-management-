const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configuration & CLI arguments
const argv = process.argv.slice(2);
let excelFileArg = null;
let imagesDirArg = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--images' && i + 1 < argv.length) {
    imagesDirArg = path.resolve(argv[i + 1]);
    i++;
  } else if (!a.startsWith('--') && !excelFileArg) {
    excelFileArg = path.resolve(a);
  }
}
const EXCEL_FILE_PATH = excelFileArg || path.join(__dirname, '../data/BIS applicability analysis sheet (002) (1).xlsx');
const IMAGES_DIR = imagesDirArg || null;
const ADMIN_USER_ID = 1; // Default admin user ID for createdBy/updatedBy fields

// Logging utility
const log = {
  info: (message) => console.log(`[INFO] ${message}`),
  success: (message) => console.log(`[SUCCESS] ✓ ${message}`),
  error: (message) => console.error(`[ERROR] ✗ ${message}`),
  warn: (message) => console.warn(`[WARN] ⚠ ${message}`)
};

// Statistics tracking
const stats = {
  sparePartsCreated: 0,
  sparePartsDuplicate: 0,
  photosAdded: 0,
  errorsCount: 0,
  totalRows: 0,
  successCount: 0
};

/**
 * Validate required columns in Excel file
 */
function validateColumns(worksheet) {
  const requiredColumns = [
    'Product Name',
    'Part ID'
  ];

  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];

  // Normalize headers by trimming spaces
  const normalizedHeaders = headers.map(h => h ? h.toString().trim() : '');

  log.info(`Found headers: ${normalizedHeaders.slice(0, 5).join(', ')}...`);

  const missingColumns = requiredColumns.filter(col => {
    return !normalizedHeaders.some(h => h.toLowerCase() === col.toLowerCase());
  });

  if (missingColumns.length > 0) {
    log.error(`Missing required columns: ${missingColumns.join(', ')}`);
    log.info(`Available columns: ${normalizedHeaders.join(', ')}`);
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  log.info(`✓ All required columns found: ${requiredColumns.join(', ')}`);
  return true;
}

/**
 * Get column value with flexible matching
 */
function getColumnValue(row, columnName) {
  // Try exact match first
  if (row[columnName]) return row[columnName];

  // Try case-insensitive match
  const key = Object.keys(row).find(k => k.toLowerCase() === columnName.toLowerCase());
  if (key && row[key]) return row[key];

  return '';
}

/**
 * Clean and validate data
 */
function cleanData(row) {
  return {
    hsnCode: getColumnValue(row, 'HSN Code').toString().trim(),
    productName: getColumnValue(row, 'Product Name').toString().trim(),
    partId: getColumnValue(row, 'Part ID').toString().trim(),
    imageUrl: getColumnValue(row, 'Image and brochures of product').toString().trim(),
    useApplication: getColumnValue(row, '(Use/Application of product)').toString().trim(),
    modelSpec: getColumnValue(row, 'Model Specification').toString().trim(),
    manufacturingUnit: getColumnValue(row, 'Manufacturing Unit').toString().trim(),
    technicalSheet: getColumnValue(row, 'Ratings/Technical sheet').toString().trim()
  };
}

/**
 * Validate row data
 */
function validateRowData(data, rowIndex) {
  const errors = [];

  if (!data.productName) {
    errors.push(`Row ${rowIndex}: Product Name is required`);
  }

  if (!data.partId) {
    errors.push(`Row ${rowIndex}: Part ID is required`);
  }

  return errors;
}

/**
 * Create SparePart with photo
 */
async function createSparePart(data) {
  try {
    // Check if spare part with this part number already exists
    const existingSparePart = await prisma.sparePart.findUnique({
      where: {
        partNumber: data.partId
      }
    });

    if (existingSparePart) {
      log.warn(`Spare part with Part ID '${data.partId}' already exists. Skipping.`);
      stats.sparePartsDuplicate++;
      return null;
    }

    // Build description from available fields
    let description = '';
    if (data.hsnCode) description += `HSN Code: ${data.hsnCode}\n`;
    if (data.useApplication) description += `Use/Application: ${data.useApplication}\n`;
    if (data.modelSpec) description += `Model Specification: ${data.modelSpec}\n`;
    if (data.manufacturingUnit) description += `Manufacturing Unit: ${data.manufacturingUnit}`;

    // Create new spare part
    const sparePart = await prisma.sparePart.create({
      data: {
        name: data.productName,
        partNumber: data.partId,
        description: description.trim() || null,
        category: null, // To be added later
        basePrice: 0, // Price to be added later
        imageUrl: data.imageUrl || null, // Store image URL from Excel
        specifications: data.technicalSheet ? JSON.stringify({ technicalSheet: data.technicalSheet }) : null,
        status: 'ACTIVE',
        createdById: ADMIN_USER_ID,
        updatedById: ADMIN_USER_ID
      }
    });

    let logMsg = `Created: ${data.productName} (Part ID: ${data.partId})`;
    if (data.imageUrl) {
      logMsg += ` [Photo: ${data.imageUrl.substring(0, 50)}...]`;
      stats.photosAdded++;
    }
    log.success(logMsg);
    stats.sparePartsCreated++;
    return sparePart;

  } catch (error) {
    log.error(`Failed to create Spare Part '${data.productName}': ${error.message}`);
    throw error;
  }
}

/**
 * Attach images from a folder to sparePart.imageUrl
 */
async function attachImages(imagesDir) {
  try {
    if (!imagesDir) return;
    if (!fs.existsSync(imagesDir)) {
      log.warn(`Images directory not found: ${imagesDir}. Skipping image attachment.`);
      return;
    }
    const imageFiles = fs.readdirSync(imagesDir).filter(f => /\.(jpe?g|png)$/i.test(f)).sort();
    if (imageFiles.length === 0) {
      log.warn(`No image files found in ${imagesDir}.`);
      return;
    }
    log.info(`Attaching ${imageFiles.length} images from ${imagesDir}...`);
    const spareParts = await prisma.sparePart.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true }
    });
    let updated = 0;
    for (let i = 0; i < imageFiles.length && i < spareParts.length; i++) {
      const imgPath = path.join(imagesDir, imageFiles[i]);
      const buffer = fs.readFileSync(imgPath);
      const ext = path.extname(imgPath).toLowerCase() === '.png' ? 'png' : 'jpeg';
      const dataUrl = `data:image/${ext};base64,${buffer.toString('base64')}`;
      await prisma.sparePart.update({ where: { id: spareParts[i].id }, data: { imageUrl: dataUrl } });
      updated++;
    }
    stats.photosAdded += updated;
    log.success(`Images attached to ${updated} spare parts`);
    if (imageFiles.length > spareParts.length) {
      log.warn(`Extra images (${imageFiles.length - spareParts.length}) were not used.`);
    }
  } catch (err) {
    log.error(`attachImages error: ${err.message}`);
  }
}

/**
 * Process a single row of data
 */
async function processRow(rowData, rowIndex) {
  try {
    // Skip empty rows
    if (!rowData || Object.keys(rowData).length === 0) {
      return false;
    }

    // Clean and validate data
    const data = cleanData(rowData);

    // Skip if product name is empty
    if (!data.productName) {
      return false;
    }

    const validationErrors = validateRowData(data, rowIndex);

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => log.error(error));
      stats.errorsCount++;
      return false;
    }

    // Create spare part
    await createSparePart(data);

    return true;

  } catch (error) {
    log.error(`Failed to process row ${rowIndex}: ${error.message}`);
    stats.errorsCount++;
    return false;
  }
}

/**
 * Main import function
 */
async function importSpareParts() {
  try {
    console.log('\n========================================');
    log.info('Starting Spare Parts import...');
    console.log('========================================\n');

    // Check if file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      throw new Error(`Excel file not found: ${EXCEL_FILE_PATH}`);
    }

    log.success(`Excel file found: ${EXCEL_FILE_PATH}`);

    // Read Excel file
    log.info(`Reading Excel file...`);
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    log.info(`Using sheet: ${sheetName}`);

    // Read raw data to detect header row
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Find the header row (the one with 'Product Name' and 'Part ID')
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (row && row.some(cell => cell && cell.toString().toLowerCase().includes('product name'))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('Could not find header row with "Product Name" column');
    }

    log.info(`Found headers at row ${headerRowIndex + 1}`);

    // Extract headers from the header row
    const headers = rawData[headerRowIndex].map(h => h ? h.toString().trim() : '');
    log.info(`Column headers: ${headers.join(', ')}`);

    // Validate required columns exist
    const requiredColumns = ['Product Name', 'Part ID'];
    const missingColumns = requiredColumns.filter(col =>
      !headers.some(h => h.toLowerCase() === col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    log.success(`All required columns found: ${requiredColumns.join(', ')}`);

    // Convert data rows to objects using the correct headers
    const dataRows = rawData.slice(headerRowIndex + 1);
    const jsonData = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index] !== undefined ? row[index] : '';
        }
      });
      return obj;
    }).filter(row => Object.keys(row).length > 0);

    stats.totalRows = jsonData.length;

    log.info(`Found ${stats.totalRows} rows to process\n`);

    // Verify admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { id: ADMIN_USER_ID }
    });

    if (!adminUser) {
      throw new Error(`Admin user with ID ${ADMIN_USER_ID} not found. Please update ADMIN_USER_ID in the script.`);
    }

    log.success(`Using admin user: ${adminUser.name || adminUser.email} (ID: ${ADMIN_USER_ID})\n`);

    // Process each row
    log.info('Processing rows...');
    for (let i = 0; i < jsonData.length; i++) {
      const success = await processRow(jsonData[i], i + 2); // +2 because Excel rows start at 1 and we skip header
      if (success) {
        stats.successCount++;
      }

      // Show progress every 50 rows
      if ((i + 1) % 50 === 0) {
        log.info(`Progress: ${i + 1}/${stats.totalRows} rows processed...`);
      }

      // Add small delay to avoid overwhelming the database
      if (i % 50 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Optional: attach images if folder provided
    if (IMAGES_DIR) {
      await attachImages(IMAGES_DIR);
    }

    // Print summary
    console.log('\n========================================');
    log.success('IMPORT COMPLETED!');
    console.log('========================================');
    log.info(`Total rows processed: ${stats.totalRows}`);
    log.success(`Spare parts created: ${stats.sparePartsCreated}`);
    log.success(`Photos imported: ${stats.photosAdded}`);
    log.warn(`Duplicates skipped: ${stats.sparePartsDuplicate}`);
    log.error(`Errors encountered: ${stats.errorsCount}`);
    log.success(`Successfully imported: ${stats.successCount}`);
    console.log('========================================\n');

  } catch (error) {
    log.error(`Import failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Cleanup function for graceful shutdown
 */
process.on('SIGINT', async () => {
  log.info('Received SIGINT, cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log.info('Received SIGTERM, cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the import
if (require.main === module) {
  importSpareParts().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  importSpareParts,
  createSparePart
};
