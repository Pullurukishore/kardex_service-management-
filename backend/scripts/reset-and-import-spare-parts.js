const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const xml2js = require('xml2js');

const prisma = new PrismaClient();

// Configuration
const EXCEL_FILE_PATH = path.join(__dirname, '../data/BIS applicability analysis sheet (002) (1).xlsx');
const ADMIN_USER_ID = 1;

// Logging utility
const log = {
    info: (message) => console.log(`[INFO] ${message}`),
    success: (message) => console.log(`[SUCCESS] ✓ ${message}`),
    error: (message) => console.error(`[ERROR] ✗ ${message}`),
    warn: (message) => console.warn(`[WARN] ⚠ ${message}`)
};

// Statistics tracking
const stats = {
    deletedSpareParts: 0,
    deletedOfferSpareParts: 0,
    sparePartsCreated: 0,
    imagesAttached: 0,
    errorsCount: 0,
    totalRows: 0
};

/**
 * Delete all existing spare parts and their relations
 */
async function deleteAllSpareParts() {
    try {
        log.info('Starting deletion of existing spare parts...');

        // First, delete all OfferSparePart relations (junction table)
        const deletedOfferSpareParts = await prisma.offerSparePart.deleteMany({});
        stats.deletedOfferSpareParts = deletedOfferSpareParts.count;
        log.success(`Deleted ${deletedOfferSpareParts.count} offer-spare part relations`);

        // Then delete all spare parts
        const deletedSpareParts = await prisma.sparePart.deleteMany({});
        stats.deletedSpareParts = deletedSpareParts.count;
        log.success(`Deleted ${deletedSpareParts.count} spare parts`);

        return true;
    } catch (error) {
        log.error(`Failed to delete spare parts: ${error.message}`);
        throw error;
    }
}

/**
 * Extract embedded images from Excel file and map them to rows
 */
async function extractImagesFromExcel(excelPath) {
    const imageMap = new Map(); // Map of row number to image base64

    try {
        log.info('Extracting embedded images from Excel...');

        // Open the xlsx as a zip file
        const zip = new AdmZip(excelPath);
        const zipEntries = zip.getEntries();

        // Find drawing relationships file
        let drawingRelsContent = null;
        let drawingContent = null;
        const mediaFiles = new Map();

        for (const entry of zipEntries) {
            const entryName = entry.entryName;

            if (entryName.includes('xl/drawings/_rels/drawing1.xml.rels')) {
                drawingRelsContent = zip.readAsText(entry);
            } else if (entryName.includes('xl/drawings/drawing1.xml')) {
                drawingContent = zip.readAsText(entry);
            } else if (entryName.startsWith('xl/media/')) {
                // Store media files
                const fileName = path.basename(entryName);
                const imageBuffer = zip.readFile(entry);
                mediaFiles.set(fileName, imageBuffer);
            }
        }

        if (!drawingContent) {
            log.warn('No drawing1.xml found - images might not be embedded');
            return imageMap;
        }

        // Parse the relationships XML to get rId -> image file mapping
        const rIdToImage = new Map();
        if (drawingRelsContent) {
            const parser = new xml2js.Parser();
            const relsData = await parser.parseStringPromise(drawingRelsContent);
            const relationships = relsData.Relationships?.Relationship || [];

            for (const rel of relationships) {
                const rId = rel.$.Id;
                const target = rel.$.Target;
                if (target && target.includes('media/')) {
                    const imageName = path.basename(target);
                    rIdToImage.set(rId, imageName);
                }
            }
            log.info(`Found ${rIdToImage.size} image relationships`);
        }

        // Parse the drawing XML to get row -> rId mapping
        const parser = new xml2js.Parser({ explicitArray: false });
        const drawingData = await parser.parseStringPromise(drawingContent);

        // Navigate to two cell anchors (images anchored to cells)
        const wsDr = drawingData['xdr:wsDr'];
        if (!wsDr) {
            log.warn('No worksheet drawing data found');
            return imageMap;
        }

        // Get all twoCellAnchor elements
        let anchors = wsDr['xdr:twoCellAnchor'] || [];
        if (!Array.isArray(anchors)) {
            anchors = [anchors];
        }

        log.info(`Found ${anchors.length} anchor elements in drawing`);

        for (const anchor of anchors) {
            try {
                // Get the row from the "from" element
                const fromElement = anchor['xdr:from'];
                if (!fromElement) continue;

                const row = parseInt(fromElement['xdr:row'], 10);
                if (isNaN(row)) continue;

                // Get the picture element
                const pic = anchor['xdr:pic'];
                if (!pic) continue;

                const blipFill = pic['xdr:blipFill'];
                if (!blipFill) continue;

                const blip = blipFill['a:blip'];
                if (!blip) continue;

                // Get the embed attribute which contains the rId
                const rEmbed = blip.$?.['r:embed'];
                if (!rEmbed) continue;

                // Get the image file name from rId
                const imageName = rIdToImage.get(rEmbed);
                if (!imageName) continue;

                // Get the image buffer from media files
                const imageBuffer = mediaFiles.get(imageName);
                if (!imageBuffer) continue;

                // Convert to base64 data URL
                const ext = path.extname(imageName).toLowerCase().replace('.', '');
                const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                const base64 = imageBuffer.toString('base64');
                const dataUrl = `data:${mimeType};base64,${base64}`;

                // Map row (0-indexed in XML) to image
                // Row 2 in XML = data row 1 (after header at row 1)
                // So row index in XML - 1 = data row index
                imageMap.set(row, dataUrl);
            } catch (err) {
                // Skip problematic anchors
            }
        }

        log.success(`Extracted ${imageMap.size} images mapped to rows`);
        return imageMap;

    } catch (error) {
        log.error(`Failed to extract images: ${error.message}`);
        return imageMap;
    }
}

/**
 * Get column value with flexible matching
 */
function getColumnValue(row, columnName) {
    if (row[columnName]) return row[columnName];
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
 * Create SparePart with image
 */
async function createSparePart(data, imageDataUrl) {
    try {
        // Build description from available fields
        let description = '';
        if (data.hsnCode) description += `HSN Code: ${data.hsnCode}\n`;
        if (data.useApplication) description += `Use/Application: ${data.useApplication}\n`;
        if (data.modelSpec) description += `Model Specification: ${data.modelSpec}\n`;
        if (data.manufacturingUnit) description += `Manufacturing Unit: ${data.manufacturingUnit}`;

        // Use embedded image or URL from column
        const finalImageUrl = imageDataUrl || data.imageUrl || null;

        // Create new spare part
        const sparePart = await prisma.sparePart.create({
            data: {
                name: data.productName,
                partNumber: data.partId,
                description: description.trim() || null,
                category: null,
                basePrice: 0,
                imageUrl: finalImageUrl,
                specifications: data.technicalSheet ? JSON.stringify({ technicalSheet: data.technicalSheet }) : null,
                status: 'ACTIVE',
                createdById: ADMIN_USER_ID,
                updatedById: ADMIN_USER_ID
            }
        });

        const hasImage = finalImageUrl ? ' [with image]' : '';
        log.success(`Created: ${data.productName} (Part ID: ${data.partId})${hasImage}`);
        stats.sparePartsCreated++;
        if (finalImageUrl) stats.imagesAttached++;
        return sparePart;

    } catch (error) {
        log.error(`Failed to create Spare Part '${data.productName}': ${error.message}`);
        stats.errorsCount++;
        return null;
    }
}

/**
 * Import spare parts from Excel with embedded images
 */
async function importSpareParts() {
    try {
        // Check if file exists
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            throw new Error(`Excel file not found: ${EXCEL_FILE_PATH}`);
        }

        log.success(`Excel file found: ${EXCEL_FILE_PATH}`);

        // Extract embedded images
        const imageMap = await extractImagesFromExcel(EXCEL_FILE_PATH);

        // Read Excel file
        log.info(`Reading Excel data...`);
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
        log.info(`Column headers: ${headers.slice(0, 5).join(', ')}...`);

        // Validate required columns exist
        const requiredColumns = ['Product Name', 'Part ID'];
        const missingColumns = requiredColumns.filter(col =>
            !headers.some(h => h.toLowerCase() === col.toLowerCase())
        );

        if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        log.success(`All required columns found`);

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
            throw new Error(`Admin user with ID ${ADMIN_USER_ID} not found.`);
        }

        log.success(`Using admin user: ${adminUser.name || adminUser.email}\n`);

        // Process each row
        log.info('Creating spare parts...');
        for (let i = 0; i < jsonData.length; i++) {
            const rowData = jsonData[i];

            // Skip empty rows
            if (!rowData || Object.keys(rowData).length === 0) {
                continue;
            }

            // Clean data
            const data = cleanData(rowData);

            // Skip if product name or part ID is empty
            if (!data.productName || !data.partId) {
                continue;
            }

            // Get image for this row (Excel row = headerRowIndex + 1 + i + 1)
            // In drawing XML, rows are 0-indexed
            // Header is at row headerRowIndex (e.g., 0 or 1)
            // First data row starts at headerRowIndex + 1
            // The drawing XML row index for data row i is: headerRowIndex + 1 + i
            const excelRowIndex = headerRowIndex + 1 + i;
            const imageDataUrl = imageMap.get(excelRowIndex) || null;

            await createSparePart(data, imageDataUrl);

            // Show progress every 50 rows
            if ((i + 1) % 50 === 0) {
                log.info(`Progress: ${i + 1}/${stats.totalRows} rows processed...`);
            }

            // Add small delay to avoid overwhelming the database
            if (i % 50 === 0 && i > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return true;
    } catch (error) {
        log.error(`Import failed: ${error.message}`);
        throw error;
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('\n========================================');
        log.info('SPARE PARTS RESET & IMPORT (WITH IMAGES)');
        console.log('========================================\n');

        // Step 1: Delete all existing spare parts
        log.info('STEP 1: Deleting existing spare parts...');
        await deleteAllSpareParts();
        console.log('');

        // Step 2: Import from Excel with images
        log.info('STEP 2: Importing spare parts with embedded images...');
        await importSpareParts();
        console.log('');

        // Print summary
        console.log('========================================');
        log.success('OPERATION COMPLETED!');
        console.log('========================================');
        log.info(`Deleted offer-spare part relations: ${stats.deletedOfferSpareParts}`);
        log.info(`Deleted spare parts: ${stats.deletedSpareParts}`);
        log.info(`Total rows in Excel: ${stats.totalRows}`);
        log.success(`Spare parts created: ${stats.sparePartsCreated}`);
        log.success(`Images attached: ${stats.imagesAttached}`);
        log.error(`Errors encountered: ${stats.errorsCount}`);
        console.log('========================================\n');

    } catch (error) {
        log.error(`Operation failed: ${error.message}`);
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Handle signals for graceful shutdown
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

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { main, deleteAllSpareParts, importSpareParts };
