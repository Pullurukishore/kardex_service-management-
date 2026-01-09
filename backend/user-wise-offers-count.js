/**
 * User-wise Offers Count Report
 * 
 * This script reads the Excel file and generates a report of offer counts per user/sheet
 */

const XLSX = require('xlsx');
const path = require('path');

// Person sheets with zone mapping
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

function main() {
    console.log('========================================');
    console.log('   USER-WISE OFFERS COUNT REPORT');
    console.log('========================================\n');

    const workbookPath = path.join(__dirname, 'data', 'Repaired_2025_Zonewise_Open_Closed_Offer funnel_ on 04032025.xlsx');
    const workbook = XLSX.readFile(workbookPath);

    let totalOffers = 0;
    const userStats = [];
    const zoneStats = {};

    for (const { name: sheetName, zone } of personSheets) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            console.log(`⚠ Sheet "${sheetName}" not found`);
            continue;
        }

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

        if (headerRowIndex === -1) {
            console.log(`⚠ No header found in sheet "${sheetName}"`);
            continue;
        }

        // Column indices
        const regDateIndex = headers.findIndex(h => h && h.toString().includes('Reg Date'));
        const offerRefIndex = headers.findIndex(h => h && h.toString().includes('Offer Reference Number'));
        const offerValueIndex = headers.findIndex(h => h && h.toString().includes('Offer Value'));
        const poNumberIndex = headers.findIndex(h => h && h.toString().includes('PO Number'));
        const poValueIndex = headers.findIndex(h => h && h.toString().includes('PO Value'));

        let totalOfferValue = 0;
        let wonValue = 0;
        const uniqueOfferRefs = new Map(); // Map to track unique offers with their data

        // Count offers by unique offer reference number
        for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const slValue = row[0];

            // Get offer value and PO info
            const offerValue = offerValueIndex >= 0 ? row[offerValueIndex] : null;
            const poNumber = poNumberIndex >= 0 ? row[poNumberIndex] : null;
            const poValue = poValueIndex >= 0 ? row[poValueIndex] : null;

            // Count ALL rows with offer values (match Excel - don't require RegDate)
            if (!offerValue || typeof offerValue !== 'number' || offerValue <= 0) continue;

            // Get offer reference (auto-generate if missing)
            let offerRef = offerRefIndex >= 0 ? row[offerRefIndex] : null;
            if (!offerRef) {
                offerRef = `AUTO-${sheetName.toUpperCase()}-${slValue || i}`;
            }
            const refStr = String(offerRef).trim();

            // Group by offer reference, SUM values from all rows (match Excel)
            if (!uniqueOfferRefs.has(refStr)) {
                // First occurrence
                uniqueOfferRefs.set(refStr, {
                    offerValue: (offerValue && typeof offerValue === 'number') ? offerValue : 0,
                    isWon: (poNumber && poValue && poValue > 0),
                    poValue: (poValue && typeof poValue === 'number') ? poValue : 0
                });
            } else {
                // Duplicate row - SUM the values
                const existing = uniqueOfferRefs.get(refStr);
                if (offerValue && typeof offerValue === 'number') {
                    existing.offerValue += offerValue;
                }
                if (poValue && typeof poValue === 'number') {
                    existing.poValue += poValue;
                }
                // If any row shows won, mark as won
                if (poNumber && poValue && poValue > 0) {
                    existing.isWon = true;
                }
            }
        }

        // Calculate totals from unique offers
        let offerCount = uniqueOfferRefs.size;
        let wonCount = 0;
        for (const [ref, data] of uniqueOfferRefs) {
            totalOfferValue += data.offerValue;
            if (data.isWon) {
                wonCount++;
                wonValue += data.poValue;
            }
        }

        totalOffers += offerCount;

        const userStat = {
            name: sheetName,
            zone: zone,
            offerCount: offerCount,
            uniqueRefs: uniqueOfferRefs.size,
            totalOfferValue: totalOfferValue,
            wonCount: wonCount,
            wonValue: wonValue,
            conversionRate: offerCount > 0 ? ((wonCount / offerCount) * 100).toFixed(1) : '0.0'
        };
        userStats.push(userStat);

        // Zone aggregation
        if (!zoneStats[zone]) {
            zoneStats[zone] = { offerCount: 0, totalOfferValue: 0, wonCount: 0, wonValue: 0, users: [] };
        }
        zoneStats[zone].offerCount += offerCount;
        zoneStats[zone].totalOfferValue += totalOfferValue;
        zoneStats[zone].wonCount += wonCount;
        zoneStats[zone].wonValue += wonValue;
        zoneStats[zone].users.push(sheetName);
    }

    // Print User-wise Results
    console.log('┌──────────────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│                               USER-WISE OFFERS BREAKDOWN                                     │');
    console.log('├──────────┬────────┬─────────┬──────────────────┬───────────┬───────────────────┬────────────┤');
    console.log('│   User   │  Zone  │ Offers  │  Total Value (₹) │ Won Count │   Won Value (₹)   │ Conv. %    │');
    console.log('├──────────┼────────┼─────────┼──────────────────┼───────────┼───────────────────┼────────────┤');

    for (const stat of userStats) {
        const name = stat.name.padEnd(8);
        const zone = stat.zone.padEnd(6);
        const offers = String(stat.offerCount).padStart(5);
        const value = formatCurrency(stat.totalOfferValue).padStart(16);
        const won = String(stat.wonCount).padStart(6);
        const wonVal = formatCurrency(stat.wonValue).padStart(16);
        const conv = (stat.conversionRate + '%').padStart(8);
        console.log(`│ ${name} │ ${zone} │ ${offers}   │ ${value} │ ${won}    │ ${wonVal}  │ ${conv}   │`);
    }

    console.log('└──────────┴────────┴─────────┴──────────────────┴───────────┴───────────────────┴────────────┘');

    // Print Zone-wise Summary
    console.log('\n┌────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│                              ZONE-WISE SUMMARY                                     │');
    console.log('├─────────┬─────────┬──────────────────┬───────────┬───────────────────┬─────────────┤');
    console.log('│  Zone   │ Offers  │  Total Value (₹) │ Won Count │   Won Value (₹)   │  Conv. %    │');
    console.log('├─────────┼─────────┼──────────────────┼───────────┼───────────────────┼─────────────┤');

    for (const [zone, stats] of Object.entries(zoneStats)) {
        const zoneName = zone.padEnd(7);
        const offers = String(stats.offerCount).padStart(5);
        const value = formatCurrency(stats.totalOfferValue).padStart(16);
        const won = String(stats.wonCount).padStart(6);
        const wonVal = formatCurrency(stats.wonValue).padStart(16);
        const conv = (stats.offerCount > 0 ? ((stats.wonCount / stats.offerCount) * 100).toFixed(1) : '0.0').padStart(8);
        console.log(`│ ${zoneName} │ ${offers}   │ ${value} │ ${won}    │ ${wonVal}  │ ${conv}%    │`);
    }

    console.log('└─────────┴─────────┴──────────────────┴───────────┴───────────────────┴─────────────┘');

    // Grand Total
    const grandTotalValue = userStats.reduce((acc, s) => acc + s.totalOfferValue, 0);
    const grandWonCount = userStats.reduce((acc, s) => acc + s.wonCount, 0);
    const grandWonValue = userStats.reduce((acc, s) => acc + s.wonValue, 0);
    const grandConvRate = totalOffers > 0 ? ((grandWonCount / totalOffers) * 100).toFixed(1) : '0.0';

    console.log('\n========================================');
    console.log('            GRAND TOTAL');
    console.log('========================================');
    console.log(`  Total Offers:      ${totalOffers}`);
    console.log(`  Total Offer Value: ₹${formatCurrency(grandTotalValue)}`);
    console.log(`  Total Won:         ${grandWonCount}`);
    console.log(`  Total Won Value:   ₹${formatCurrency(grandWonValue)}`);
    console.log(`  Conversion Rate:   ${grandConvRate}%`);
    console.log('========================================\n');
}

function formatCurrency(value) {
    if (value >= 10000000) {
        return (value / 10000000).toFixed(2) + ' Cr';
    } else if (value >= 100000) {
        return (value / 100000).toFixed(2) + ' L';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + ' K';
    }
    return value.toFixed(0);
}

main();
