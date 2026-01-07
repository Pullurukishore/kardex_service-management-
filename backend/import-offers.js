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
const productTypeMap = {
    'Contract': 'CONTRACT',
    'SPP': 'SPP',
    'Relocation': 'RELOCATION',
    'Upgrade kit': 'UPGRADE_KIT',
    'Software': 'SOFTWARE',
    'BD Charges': 'BD_CHARGES',
    'BD Spare': 'BD_SPARE',
    'Midlife Upgrade': 'MIDLIFE_UPGRADE',
    'Retrofit kit': 'RETROFIT_KIT'
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
function excelDateToJS(excelDate) {
    if (!excelDate) return null;
    if (typeof excelDate === 'string') {
        // Try parsing date string
        const date = new Date(excelDate);
        if (!isNaN(date.getTime())) return date;
        return null;
    }
    if (typeof excelDate === 'number') {
        // Excel date serial number
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date;
    }
    return null;
}

// Convert month name to YYYY-MM format
function monthToYYYYMM(monthName, year = 2025) {
    if (!monthName) return null;
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

async function main() {
    console.log('========================================');
    console.log('Importing Offers from Excel');
    console.log('========================================\n');

    const workbookPath = path.join(__dirname, 'data', 'Repaired_2025_Zonewise_Open_Closed_Offer funnel_ on 04032025.xlsx');
    const workbook = XLSX.readFile(workbookPath);

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

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

        // Read offers
        for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const slValue = row[0];
            const regDate = regDateIndex >= 0 ? row[regDateIndex] : null;

            // Only process rows with Reg Date (unique offers)
            if (!regDate) continue;
            if (typeof slValue !== 'number' || slValue <= 0) continue;

            const offerRef = offerRefIndex >= 0 ? row[offerRefIndex] : null;
            if (!offerRef) continue;

            const offerRefStr = String(offerRef).trim();

            // Check if offer already exists
            const existingOffer = await prisma.offer.findUnique({
                where: { offerReferenceNumber: offerRefStr }
            });

            if (existingOffer) {
                totalSkipped++;
                continue;
            }

            try {
                // Get user info
                const userData = userMapping[sheetName];
                if (!userData) {
                    console.error(`  ✗ User mapping not found for ${sheetName}`);
                    totalErrors++;
                    continue;
                }

                // Extract data
                const companyName = companyIndex >= 0 ? String(row[companyIndex] || '').trim() : 'Unknown Company';
                const locationVal = locationIndex >= 0 ? String(row[locationIndex] || '').trim() : null;
                const department = departmentIndex >= 0 ? String(row[departmentIndex] || '').trim() : null;
                const contactName = contactNameIndex >= 0 ? String(row[contactNameIndex] || '').trim() : 'Unknown Contact';
                const contactNumber = contactNumberIndex >= 0 ? String(row[contactNumberIndex] || '').trim() : '0000000000';
                const emailVal = emailIndex >= 0 ? String(row[emailIndex] || '').trim() : null;

                // Collect all UNIQUE machine serials for this offer (use Set to deduplicate)
                const machineSerialSet = new Set();
                let j = i;
                while (j < data.length) {
                    const currentRow = data[j];
                    if (!currentRow || currentRow.length === 0) break;

                    const currentRegDate = regDateIndex >= 0 ? currentRow[regDateIndex] : null;
                    if (j > i && currentRegDate) break;

                    const machineSerial = machineSerialIndex >= 0 ? currentRow[machineSerialIndex] : null;
                    if (machineSerial) machineSerialSet.add(String(machineSerial).trim());
                    j++;
                }
                const machineSerials = Array.from(machineSerialSet);

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

                // Get other offer data
                const productTypeVal = productTypeIndex >= 0 ? row[productTypeIndex] : null;
                const leadVal = leadIndex >= 0 ? row[leadIndex] : null;
                const offerDateVal = offerDateIndex >= 0 ? row[offerDateIndex] : null;
                const offerValueVal = offerValueIndex >= 0 ? row[offerValueIndex] : null;
                const offerMonthVal = offerMonthIndex >= 0 ? row[offerMonthIndex] : null;
                const poExpectedVal = poExpectedMonthIndex >= 0 ? row[poExpectedMonthIndex] : null;
                const probabilityVal = probabilityIndex >= 0 ? row[probabilityIndex] : null;
                const poNumberVal = poNumberIndex >= 0 ? row[poNumberIndex] : null;
                const poDateVal = poDateIndex >= 0 ? row[poDateIndex] : null;
                const poValueVal = poValueIndex >= 0 ? row[poValueIndex] : null;
                const poReceivedMonthVal = poReceivedMonthIndex >= 0 ? row[poReceivedMonthIndex] : null;
                const openFunnelVal = openFunnelIndex >= 0 ? row[openFunnelIndex] : null;
                const remarksVal = remarksIndex >= 0 ? row[remarksIndex] : null;

                // Determine stage based on data
                let stage = 'INITIAL';
                if (poNumberVal && poValueVal && poValueVal > 0) {
                    stage = 'WON';
                } else if (probabilityVal && typeof probabilityVal === 'number' && probabilityVal > 0) {
                    stage = 'PROPOSAL_SENT';
                }

                // Create Offer
                const offer = await prisma.offer.create({
                    data: {
                        offerReferenceNumber: offerRefStr,
                        offerReferenceDate: excelDateToJS(offerDateVal),
                        title: `Offer for ${companyName}`,
                        productType: productTypeMap[productTypeVal] || null,
                        lead: leadStatusMap[leadVal] || null,
                        registrationDate: excelDateToJS(regDate),
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
                        offerValue: offerValueVal ? parseFloat(offerValueVal) : null,
                        offerMonth: monthToYYYYMM(offerMonthVal),
                        poExpectedMonth: monthToYYYYMM(poExpectedVal),
                        probabilityPercentage: probabilityToPercentage(probabilityVal),
                        poNumber: poNumberVal ? String(poNumberVal) : null,
                        poDate: excelDateToJS(poDateVal),
                        poValue: poValueVal ? parseFloat(poValueVal) : null,
                        poReceivedMonth: monthToYYYYMM(poReceivedMonthVal),
                        openFunnel: openFunnelVal ? openFunnelVal > 0 : true,
                        remarks: remarksVal ? String(remarksVal) : null,
                        createdAt: excelDateToJS(regDate) || new Date('2025-01-01'),
                        updatedAt: excelDateToJS(regDate) || new Date('2025-01-01')
                    }
                });

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

                sheetImported++;
                totalImported++;
            } catch (error) {
                console.error(`  ✗ Error importing offer ${offerRefStr}:`, error.message);
                totalErrors++;
            }
        }

        console.log(`  ✓ Imported ${sheetImported} offers`);
    }

    console.log('\n========================================');
    console.log('IMPORT SUMMARY');
    console.log('========================================');
    console.log(`  Total Imported: ${totalImported}`);
    console.log(`  Total Skipped (already exists): ${totalSkipped}`);
    console.log(`  Total Errors: ${totalErrors}`);
    console.log('========================================');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
