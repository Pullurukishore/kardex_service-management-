/**
 * Import Offers from Excel to Database
 * 
 * This script reads offers from the Excel file and imports them to the database.
 * It creates Customer, Contact, and Asset records as needed.
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Load user mapping
const userMappingPath = path.join(__dirname, 'data', 'user-mapping.json');
const userMapping = JSON.parse(fs.readFileSync(userMappingPath, 'utf8'));

// Product type mapping from Excel to Prisma enum
// Includes typos, case variations, and abbreviations found in Excel
const productTypeMap = {
    // Contract variations
    'Contract': 'CONTRACT',
    'CONTRACT': 'CONTRACT',
    'Contarct': 'CONTRACT',
    'Ccontarct': 'CONTRACT',
    // SPP variations
    'SPP': 'SPP',
    'spp': 'SPP',
    // Relocation variations
    'Relocation': 'RELOCATION',
    'RELOCATION': 'RELOCATION',
    // Upgrade kit variations
    'Upgrade kit': 'UPGRADE_KIT',
    'Upgrade': 'UPGRADE_KIT',
    // Software
    'Software': 'SOFTWARE',
    // BD Charges & Spare
    'BD Charges': 'BD_CHARGES',
    'BD Spare': 'BD_SPARE',
    // Midlife Upgrade variations
    'Midlife Upgrade': 'MIDLIFE_UPGRADE',
    'MLU': 'MIDLIFE_UPGRADE',
    // Retrofit kit variations
    'Retrofit kit': 'RETROFIT_KIT',
    'RETROFIT': 'RETROFIT_KIT',
    // MC (Maintenance Contract - map to CONTRACT)
    'MC': 'CONTRACT'
};

// Lead status mapping
const leadStatusMap = {
    'Yes': 'YES',
    'No': 'NO'
};

// Month name to number mapping
const monthMap = {
    'January': '01', 'Januray': '01', 'Jan': '01',
    'February': '02', 'Febraury': '02', 'Feb': '02',
    'March': '03', 'Mar': '03',
    'April': '04', 'Apr': '04',
    'May': '05',
    'June': '06', 'Jun': '06',
    'July': '07', 'Jul': '07',
    'August': '08', 'Aug': '08',
    'September': '09', 'Sept': '09', 'Sep': '09',
    'October': '10', 'Oct': '10',
    'November': '11', 'Nov': '11',
    'December': '12', 'Dec': '12'
};

// Convert Excel date serial to JS Date
// ALL offers are 2025 - force year to 2025 for all dates
function excelDateToJS(excelDate) {
    if (!excelDate) return null;
    let date = null;

    if (typeof excelDate === 'string') {
        // Try parsing date string
        date = new Date(excelDate);
    } else if (typeof excelDate === 'number') {
        // Excel date serial number
        date = new Date((excelDate - 25569) * 86400 * 1000);
    }

    // Validate the date and force year to 2025
    if (date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        // Force ALL years to 2025 (all offers are 2025 offers)
        if (year !== 2025) {
            console.warn(`  ⚠ Year ${year} detected, normalizing to 2025`);
        }
        date.setFullYear(2025);
        return date;
    }
    return null;
}

// Convert month name to YYYY-MM format
// Year must be provided by caller based on offer data (e.g., from regDate)
function monthToYYYYMM(monthName, year) {
    if (!monthName) return null;
    if (!year) return null; // Year is required
    const monthStr = String(monthName).trim();
    const monthNum = monthMap[monthStr];
    if (monthNum) return `${year}-${monthNum}`;
    return null;
}

// Convert probability to percentage (0-100)
function probabilityToPercentage(prob) {
    if (!prob || typeof prob !== 'number') return null;
    if (prob <= 1) return Math.round(prob * 100);
    return Math.round(prob);
}

const personSheets = [
    { name: 'Yogesh', zone: 'WEST' },
    { name: 'Ashraf', zone: 'WEST' },
    { name: 'Rahul', zone: 'WEST' },
    { name: 'Minesh', zone: 'WEST' },
    { name: 'Gajendra', zone: 'SOUTH' },
    { name: 'Pradeep', zone: 'SOUTH' },
    { name: 'Sasi', zone: 'SOUTH' },
    { name: 'Vinay', zone: 'NORTH' },
    { name: 'Nitin', zone: 'NORTH' },
    { name: 'Pankaj', zone: 'EAST' }
];

// Check for dry-run mode
const isDryRun = process.argv.includes('--dry-run');

async function main() {
    console.log('========================================');
    console.log(isDryRun ? 'DRY RUN - Analyzing Offers from Excel' : 'Importing Offers from Excel');
    console.log('========================================\n');

    const workbookPath = path.join(__dirname, 'data', 'Repaired_2025_Zonewise_Open_Closed_Offer funnel_ on 04032025.xlsx');
    const workbook = XLSX.readFile(workbookPath);

    let totalReadFromExcel = 0;
    let totalUniqueOffers = 0;
    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const userStats = [];
    const globalOfferRefs = new Set(); // Track unique offers globally

    // Get admin user for createdBy/updatedBy (use first user or create system user)
    let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) {
        adminUser = await prisma.user.findFirst();
    }
    const adminId = adminUser?.id || 1;

    for (const { name: sheetName, zone } of personSheets) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Find header row
        let headerRowIndex = -1;
        let headers = [];

        for (let i = 0; i < Math.min(10, data.length); i++) {
            const row = data[i];
            if (row && row.includes('SL') && row.includes('Company')) {
                headerRowIndex = i;
                headers = row;
                break;
            }
        }

        if (headerRowIndex === -1) continue;

        // Column indices
        const getColIndex = (keyword) => headers.findIndex(h => h && h.toString().includes(keyword));
        const regDateIndex = getColIndex('Reg Date');
        const companyIndex = getColIndex('Company');
        const locationIndex = getColIndex('Location');
        const departmentIndex = getColIndex('Department');
        const contactNameIndex = getColIndex('Contact Person');
        const contactNumberIndex = getColIndex('Contact Number');
        const emailIndex = getColIndex('E-Mail');
        const machineSerialIndex = getColIndex('Machine Serial');
        const productTypeIndex = getColIndex('Product Type');
        const leadIndex = getColIndex('Lead');
        const offerRefIndex = getColIndex('Offer Reference Number');
        const offerDateIndex = getColIndex('Offer Reference Date');
        const offerValueIndex = getColIndex('Offer Value');
        const offerMonthIndex = getColIndex('Offer Month');
        const poExpectedMonthIndex = getColIndex('PO Expected');
        const probabilityIndex = getColIndex('Probabality');
        const poNumberIndex = getColIndex('PO Number');
        const poDateIndex = getColIndex('PO Date');
        const poValueIndex = getColIndex('PO Value');
        const poReceivedMonthIndex = getColIndex('PO Received Month');
        const openFunnelIndex = headers.findIndex(h => h && h.toString() === 'Open Funnel');
        const remarksIndex = headers.findIndex(h => h && h.toString() === 'Remarks');

        console.log(`\nProcessing ${sheetName} (${zone})...`);

        let sheetImported = 0;
        let sheetRead = 0;
        const sheetOfferRefs = new Set(); // Track unique offers per sheet

        // PASS 1: Collect all data per offer reference (sum values, collect machine serials)
        const offerDataMap = new Map(); // Map of offerRef -> aggregated data

        for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const slValue = row[0];
            const regDate = regDateIndex >= 0 ? row[regDateIndex] : null;
            const offerValueVal = offerValueIndex >= 0 ? row[offerValueIndex] : null;

            // Count ALL rows with offer values (match Excel - don't require RegDate)
            if (!offerValueVal || typeof offerValueVal !== 'number' || offerValueVal <= 0) continue;

            totalReadFromExcel++;
            sheetRead++;

            let offerRef = offerRefIndex >= 0 ? row[offerRefIndex] : null;

            // Auto-generate offer reference if missing
            if (!offerRef) {
                offerRef = `AUTO-${sheetName.toUpperCase()}-${slValue}`;
            }

            const offerRefStr = String(offerRef).trim();

            // Get row data (offerValueVal already declared above)
            const poValueVal = poValueIndex >= 0 ? row[poValueIndex] : null;
            const machineSerial = machineSerialIndex >= 0 ? row[machineSerialIndex] : null;

            // Group by offer reference, SUM values from all rows (match Excel)
            if (!offerDataMap.has(offerRefStr)) {
                // First occurrence - create new entry
                offerDataMap.set(offerRefStr, {
                    firstRow: row,
                    firstRegDate: regDate,
                    slValue: slValue,
                    offerValue: (offerValueVal && typeof offerValueVal === 'number') ? offerValueVal : 0,
                    poValue: (poValueVal && typeof poValueVal === 'number') ? poValueVal : 0,
                    machineSerials: new Set()
                });
            } else {
                // Duplicate row - SUM the values
                const existing = offerDataMap.get(offerRefStr);
                if (offerValueVal && typeof offerValueVal === 'number') {
                    existing.offerValue += offerValueVal;
                }
                if (poValueVal && typeof poValueVal === 'number') {
                    existing.poValue += poValueVal;
                }
            }

            // Collect machine serial
            if (machineSerial) {
                offerDataMap.get(offerRefStr).machineSerials.add(String(machineSerial).trim());
            }
        }

        console.log(`  Found ${offerDataMap.size} unique offers from ${sheetRead} rows`);

        // In dry-run mode, just count
        if (isDryRun) {
            for (const offerRefStr of offerDataMap.keys()) {
                if (!globalOfferRefs.has(offerRefStr)) {
                    globalOfferRefs.add(offerRefStr);
                    sheetOfferRefs.add(offerRefStr);
                    totalUniqueOffers++;
                    sheetImported++;
                    totalImported++;
                }
            }
            userStats.push({ name: sheetName, zone, read: sheetRead, imported: sheetImported, unique: offerDataMap.size });
            console.log(`  ✓ Would import ${sheetImported} unique offers`);
            continue;
        }

        // PASS 2: Import each unique offer with summed values
        for (const [offerRefStr, offerData] of offerDataMap) {
            const row = offerData.firstRow;
            const regDate = offerData.firstRegDate;
            const machineSerials = Array.from(offerData.machineSerials);

            // Track unique offers globally
            const isNewUniqueOffer = !globalOfferRefs.has(offerRefStr);
            if (isNewUniqueOffer) {
                globalOfferRefs.add(offerRefStr);
                sheetOfferRefs.add(offerRefStr);
                totalUniqueOffers++;
            }

            try {
                // Get user info
                const userData = userMapping[sheetName];
                if (!userData) {
                    console.error(`  ✗ User mapping not found for ${sheetName}`);
                    totalErrors++;
                    continue;
                }

                // Extract data from first row
                const companyName = companyIndex >= 0 ? String(row[companyIndex] || '').trim() : 'Unknown Company';
                const locationVal = locationIndex >= 0 ? String(row[locationIndex] || '').trim() : null;
                const department = departmentIndex >= 0 ? String(row[departmentIndex] || '').trim() : null;
                const contactName = contactNameIndex >= 0 ? String(row[contactNameIndex] || '').trim() : 'Unknown Contact';
                const contactNumber = contactNumberIndex >= 0 ? String(row[contactNumberIndex] || '').trim() : '0000000000';
                const emailVal = emailIndex >= 0 ? String(row[emailIndex] || '').trim() : null;

                // Find or create Customer
                let customer = await prisma.customer.findFirst({
                    where: { companyName: companyName, serviceZoneId: userData.zoneId }
                });

                if (!customer) {
                    customer = await prisma.customer.create({
                        data: {
                            companyName: companyName,
                            address: locationVal,
                            serviceZoneId: userData.zoneId,
                            createdById: adminId,
                            updatedById: adminId
                        }
                    });
                }

                // Find or create Contact
                let contact = await prisma.contact.findFirst({
                    where: { customerId: customer.id, phone: contactNumber }
                });

                if (!contact) {
                    contact = await prisma.contact.create({
                        data: {
                            name: contactName,
                            contactPersonName: contactName,
                            phone: contactNumber,
                            contactNumber: contactNumber,
                            email: emailVal,
                            customerId: customer.id
                        }
                    });
                }

                // Get other offer data (use SUMMED values from offerData)
                const productTypeVal = productTypeIndex >= 0 ? row[productTypeIndex] : null;
                const leadVal = leadIndex >= 0 ? row[leadIndex] : null;
                const offerDateVal = offerDateIndex >= 0 ? row[offerDateIndex] : null;
                const offerMonthVal = offerMonthIndex >= 0 ? row[offerMonthIndex] : null;
                const poExpectedVal = poExpectedMonthIndex >= 0 ? row[poExpectedMonthIndex] : null;
                const probabilityVal = probabilityIndex >= 0 ? row[probabilityIndex] : null;
                const poNumberVal = poNumberIndex >= 0 ? row[poNumberIndex] : null;
                const poDateVal = poDateIndex >= 0 ? row[poDateIndex] : null;
                const poReceivedMonthVal = poReceivedMonthIndex >= 0 ? row[poReceivedMonthIndex] : null;
                const openFunnelVal = openFunnelIndex >= 0 ? row[openFunnelIndex] : null;
                const remarksVal = remarksIndex >= 0 ? row[remarksIndex] : null;

                // Determine stage based on data
                let stage = 'INITIAL';
                if (poNumberVal && offerData.poValue > 0) {
                    stage = 'WON';
                } else if (probabilityVal && typeof probabilityVal === 'number' && probabilityVal > 0) {
                    stage = 'PROPOSAL_SENT';
                }

                // Extract year from registration date for month conversions
                let registrationDateJS = excelDateToJS(regDate);

                // If registrationDate is null (invalid parsing), create a default date in 2025
                if (!registrationDateJS) {
                    // Try to get month/day from the raw value, default to Jan 1, 2025
                    registrationDateJS = new Date(2025, 0, 1); // Jan 1, 2025
                }

                const offerYear = 2025; // Hardcoded to 2025 for all offers

                // Create or Update Offer (upsert) - using SUMMED values
                const offerDataForDb = {
                    offerReferenceNumber: offerRefStr,
                    offerReferenceDate: excelDateToJS(offerDateVal),
                    title: `Offer for ${companyName}`,
                    productType: productTypeMap[productTypeVal] || null,
                    lead: leadStatusMap[leadVal] || null,
                    registrationDate: registrationDateJS,
                    company: companyName,
                    location: locationVal,
                    department: department,
                    contactPersonName: contactName,
                    contactNumber: contactNumber,
                    email: emailVal,
                    machineSerialNumber: machineSerials[0] || null,
                    status: 'OPEN',
                    stage: stage,
                    customerId: customer.id,
                    contactId: contact.id,
                    zoneId: userData.zoneId,
                    assignedToId: userData.userId,
                    createdById: userData.userId,
                    updatedById: userData.userId,
                    offerValue: offerData.offerValue > 0 ? offerData.offerValue : null, // SUMMED value
                    // Use offerMonth from Excel, or derive from registrationDate if missing
                    offerMonth: monthToYYYYMM(offerMonthVal, offerYear) ||
                        (registrationDateJS ? `${offerYear}-${String(registrationDateJS.getMonth() + 1).padStart(2, '0')}` : null),
                    poExpectedMonth: monthToYYYYMM(poExpectedVal, offerYear),
                    probabilityPercentage: probabilityToPercentage(probabilityVal),
                    poNumber: poNumberVal ? String(poNumberVal) : null,
                    poDate: excelDateToJS(poDateVal),
                    poValue: offerData.poValue > 0 ? offerData.poValue : null, // SUMMED value
                    poReceivedMonth: monthToYYYYMM(poReceivedMonthVal, offerYear),
                    openFunnel: openFunnelVal ? openFunnelVal > 0 : true,
                    remarks: remarksVal ? String(remarksVal) : null,
                    updatedAt: new Date()
                };

                const offer = await prisma.offer.upsert({
                    where: { offerReferenceNumber: offerRefStr },
                    update: offerDataForDb,
                    create: {
                        ...offerDataForDb,
                        createdAt: registrationDateJS || new Date()
                    }
                });
                console.log(`  ✓ Imported offer: ${offerRefStr}`);

                // Create OfferAsset entries for each machine serial
                for (const serial of machineSerials) {
                    // Find or create Asset
                    let asset = await prisma.asset.findFirst({
                        where: { serialNo: serial }
                    });

                    if (!asset) {
                        asset = await prisma.asset.create({
                            data: {
                                machineId: serial,
                                serialNo: serial,
                                customerId: customer.id
                            }
                        });
                    }

                    // Link asset to offer (use upsert to handle duplicates)
                    await prisma.offerAsset.upsert({
                        where: {
                            offerId_assetId: {
                                offerId: offer.id,
                                assetId: asset.id
                            }
                        },
                        update: {},
                        create: {
                            offerId: offer.id,
                            assetId: asset.id
                        }
                    });
                }

                if (isNewUniqueOffer) {
                    sheetImported++;
                    totalImported++;
                }
            } catch (error) {
                console.error(`  ✗ Error importing offer ${offerRefStr}:`, error.message);
                totalErrors++;
            }
        }

        userStats.push({ name: sheetName, zone, read: sheetRead, imported: sheetImported, unique: sheetOfferRefs.size });
        console.log(`  ✓ Rows: ${sheetRead} | Unique Offers: ${sheetOfferRefs.size} | Imported: ${sheetImported}`);
    }

    console.log('\n========================================');
    console.log(isDryRun ? 'DRY RUN SUMMARY' : 'IMPORT SUMMARY');
    console.log('========================================');
    console.log('');
    console.log('USER-WISE BREAKDOWN:');
    console.log('┌──────────┬────────┬────────┬──────────┬──────────┐');
    console.log('│   User   │  Zone  │  Rows  │  Unique  │ Imported │');
    console.log('├──────────┼────────┼────────┼──────────┼──────────┤');
    for (const stat of userStats) {
        const name = stat.name.padEnd(8);
        const zone = stat.zone.padEnd(6);
        const read = String(stat.read).padStart(4);
        const unique = String(stat.unique).padStart(6);
        const imported = String(stat.imported).padStart(6);
        console.log(`│ ${name} │ ${zone} │ ${read}   │ ${unique}   │ ${imported}   │`);
    }
    console.log('└──────────┴────────┴────────┴──────────┴──────────┘');
    console.log('');
    console.log('TOTALS:');
    console.log(`  Total Rows in Excel:    ${totalReadFromExcel}`);
    console.log(`  Total Unique Offers:    ${totalUniqueOffers}`);
    console.log(`  ${isDryRun ? 'Would Import' : 'Imported'}:              ${totalImported}`);
    console.log(`  Errors:                 ${totalErrors}`);
    console.log('');
    console.log(`  Note: ${totalReadFromExcel - totalUniqueOffers} rows are duplicates (same offer ref = same offer)`);
    console.log('========================================');
    if (isDryRun) {
        console.log('\n💡 This was a DRY RUN. No changes were made.');
        console.log('   Run without --dry-run to actually import.');
    }
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
