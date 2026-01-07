const XLSX = require('xlsx');
const path = require('path');

const workbookPath = path.join(__dirname, 'data', 'Repaired_2025_Zonewise_Open_Closed_Offer funnel_ on 04032025.xlsx');
const workbook = XLSX.readFile(workbookPath);

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

const statusCounts = { INITIAL: 0, PROPOSAL_SENT: 0, PO_RECEIVED: 0 };
const allOffers = [];

console.log('========================================');
console.log('Reading Offers (Rows WITH Reg Date = Unique Offer)');
console.log('========================================\n');

personSheets.forEach(({ name: sheetName, zone }) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Get expected count from header
    let expectedCount = 0;
    for (let i = 0; i < Math.min(10, data.length); i++) {
        const row = data[i];
        if (row) {
            for (let j = 0; j < Math.min(row.length, 20); j++) {
                if (row[j] === 'Total Offers' && row[j + 1] && typeof row[j + 1] === 'number') {
                    expectedCount = row[j + 1];
                    break;
                }
            }
        }
    }

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

    if (headerRowIndex === -1) return;

    // Column indices
    const getColIndex = (keyword) => headers.findIndex(h => h && h.toString().includes(keyword));
    const regDateIndex = getColIndex('Reg Date');
    const companyIndex = getColIndex('Company');
    const locationIndex = getColIndex('Location');
    const contactNameIndex = getColIndex('Contact Person');
    const contactNumberIndex = getColIndex('Contact Number');
    const emailIndex = getColIndex('E-Mail');
    const machineSerialIndex = getColIndex('Machine Serial');
    const productTypeIndex = getColIndex('Product Type');
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

    let sheetOfferCount = 0;

    // Read rows - count only rows WITH Reg Date (unique offers)
    for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const slValue = row[0];
        const regDate = regDateIndex >= 0 ? row[regDateIndex] : null;

        // ONLY count if row has a Reg Date (unique offer)
        if (!regDate) continue;
        if (typeof slValue !== 'number' || slValue <= 0) continue;

        sheetOfferCount++;

        // Determine status
        const poNumber = poNumberIndex >= 0 ? row[poNumberIndex] : null;
        const poValue = poValueIndex >= 0 ? row[poValueIndex] : null;
        const probability = probabilityIndex >= 0 ? row[probabilityIndex] : null;

        let status = 'INITIAL';
        if (poNumber && poValue && poValue > 0) {
            status = 'PO_RECEIVED';
        } else if (probability && typeof probability === 'number' && probability > 0) {
            status = 'PROPOSAL_SENT';
        }

        statusCounts[status]++;

        // Collect all machine serials for this offer
        const machineSerials = [];
        let j = i;
        while (j < data.length) {
            const currentRow = data[j];
            if (!currentRow || currentRow.length === 0) break;

            const currentRegDate = regDateIndex >= 0 ? currentRow[regDateIndex] : null;
            if (j > i && currentRegDate) break;

            const machineSerial = machineSerialIndex >= 0 ? currentRow[machineSerialIndex] : null;
            if (machineSerial) machineSerials.push(machineSerial);
            j++;
        }

        allOffers.push({
            slNo: slValue,
            salesPerson: sheetName,
            zone: zone,
            regDate: regDate,
            company: companyIndex >= 0 ? row[companyIndex] : null,
            location: locationIndex >= 0 ? row[locationIndex] : null,
            contactName: contactNameIndex >= 0 ? row[contactNameIndex] : null,
            contactNumber: contactNumberIndex >= 0 ? row[contactNumberIndex] : null,
            email: emailIndex >= 0 ? row[emailIndex] : null,
            machineSerials: machineSerials,
            assetCount: machineSerials.length,
            productType: productTypeIndex >= 0 ? row[productTypeIndex] : null,
            offerReference: offerRefIndex >= 0 ? row[offerRefIndex] : null,
            offerDate: offerDateIndex >= 0 ? row[offerDateIndex] : null,
            offerValue: offerValueIndex >= 0 ? row[offerValueIndex] : null,
            offerMonth: offerMonthIndex >= 0 ? row[offerMonthIndex] : null,
            poExpectedMonth: poExpectedMonthIndex >= 0 ? row[poExpectedMonthIndex] : null,
            probability: probability,
            poNumber: poNumber,
            poDate: poDateIndex >= 0 ? row[poDateIndex] : null,
            poValue: poValue,
            poReceivedMonth: poReceivedMonthIndex >= 0 ? row[poReceivedMonthIndex] : null,
            openFunnel: openFunnelIndex >= 0 ? row[openFunnelIndex] : null,
            remarks: remarksIndex >= 0 ? row[remarksIndex] : null,
            status: status
        });
    }

    const match = sheetOfferCount === expectedCount ? '✓' : `(found: ${sheetOfferCount}, expected: ${expectedCount})`;
    console.log(`${sheetName} (${zone}): ${sheetOfferCount} offers ${match}`);
});

console.log('\n========================================');
console.log('TOTAL SUMMARY');
console.log('========================================');
console.log(`Total Offers Found: ${allOffers.length}`);
console.log('');
console.log('By Zone:');
const zones = ['WEST', 'SOUTH', 'NORTH', 'EAST'];
zones.forEach(z => {
    const count = allOffers.filter(o => o.zone === z).length;
    console.log(`  ${z}: ${count}`);
});
console.log('');
console.log('By Status:');
console.log(`  INITIAL:       ${statusCounts.INITIAL}`);
console.log(`  PROPOSAL_SENT: ${statusCounts.PROPOSAL_SENT}`);
console.log(`  PO_RECEIVED:   ${statusCounts.PO_RECEIVED}`);
console.log('');
console.log('Multi-asset offers:');
const multiAsset = allOffers.filter(o => o.assetCount > 1);
console.log(`  ${multiAsset.length} offers have multiple machines`);
console.log('');
console.log('NOTE: Nitin sheet is missing 33 offers in Excel data (has 40, expected 73)');
console.log('========================================');

// Export
const fs = require('fs');
fs.writeFileSync(
    path.join(__dirname, 'data', 'offers-export.json'),
    JSON.stringify(allOffers, null, 2)
);
console.log('\n✓ Exported to data/offers-export.json');
