/**
 * Excel Export Utility for Forecast Dashboard
 * Uses ExcelJS library for professionally styled Excel workbook generation
 * Comprehensive export with ALL fields from Zone Summary, Monthly, User Monthly, and PO Expected APIs
 */

import ExcelJS from 'exceljs';

// ============ Color Scheme ============

const COLORS = {
    // Primary colors
    headerBg: '1E3A8A',    // Deep blue (matching dashboard slate-900/blue-900)
    headerText: 'FFFFFF',  // White
    titleBg: 'EFF6FF',
    titleText: '1E40AF',

    // Zone colors (matching dashboard exactly)
    zoneBg: {
        WEST: 'DBEAFE',    // Blue light (bg-blue-50)
        SOUTH: 'D1FAE5',   // Emerald light (bg-emerald-50)
        NORTH: 'FEF3C7',   // Amber light (bg-amber-50)
        EAST: 'EDE9FE',    // Purple light (bg-purple-50)
    },
    zoneAccent: {
        WEST: '3B82F6',    // Blue-500
        SOUTH: '10B981',   // Emerald-500
        NORTH: 'F59E0B',   // Amber-500
        EAST: '8B5CF6',    // Purple-500
    },

    // Column-specific colors (matching dashboard data cells)
    colOffers: '2563EB',      // Blue-600 (text-blue-600)
    colOffersBg: 'DBEAFE',    // Blue-50 light background
    colOrders: '059669',      // Emerald-600 (text-emerald-600)
    colOrdersBg: 'D1FAE5',    // Emerald-50 light background
    colFunnel: 'D97706',      // Amber-600 (text-amber-600)
    colFunnelBg: 'FEF3C7',    // Amber-50 light background
    colBU: '7C3AED',          // Purple-600 (BU/Monthly)
    colBUBg: 'F3E8FF',        // Purple-50 light background
    colOfferBU: '4F46E5',     // Indigo-600 (OfferBU)
    colOfferBUBg: 'E0E7FF',   // Indigo-50 light background

    // Status colors (matching dashboard deviation badges)
    positive: '059669',    // Emerald-600 (green for positive)
    negative: 'DC2626',    // Red-600 (red for negative)
    neutral: 'F59E0B',     // Amber-500 (amber for neutral)
    positiveBg: 'D1FAE5',  // Emerald-50 background
    negativeBg: 'FEE2E2',  // Red-50 background
    neutralBg: 'FEF3C7',   // Amber-50 background

    // Table colors
    rowEven: 'F8FAFC',     // Slate-50
    rowOdd: 'FFFFFF',      // White
    borderLight: 'E2E8F0', // Slate-200
    totalRowBg: 'E0E7FF',  // Indigo-100
    grandTotalBg: '1E3A8A', // Deep blue (matching header)
    subHeaderBg: '64748B', // Slate-500

    // Text
    textDark: '1E293B',    // Slate-800
    textLight: '64748B',   // Slate-500
};

// ============ Type Definitions ============

interface ZoneSummary {
    zoneId: number;
    zoneName: string;
    noOfOffers: number;
    offersValue: number;
    ordersReceived: number;
    openFunnel: number;
    orderBooking: number;
    uForBooking: number;
    hitRatePercent: number;
    balanceBU: number;
    yearlyTarget: number;
}

interface SummaryTotals {
    noOfOffers: number;
    offersValue: number;
    ordersReceived: number;
    openFunnel: number;
    orderBooking: number;
    uForBooking: number;
    yearlyTarget: number;
    balanceBU: number;
    hitRatePercent: number;
}

interface MonthlyData {
    month: string;
    monthLabel: string;
    offersValue: number;
    orderReceived: number;
    ordersBooked: number;
    devORvsBooked: number;
    ordersInHand: number;
    buMonthly: number;
    bookedVsBU: number | null;
    percentDev: number | null;
    offerBUMonth: number;
    offerBUMonthDev: number | null;
}

interface ZoneMonthlyBreakdown {
    zoneId: number;
    zoneName: string;
    hitRate: number;
    yearlyTarget: number;
    monthlyData: MonthlyData[];
    totals: {
        offersValue: number;
        orderReceived: number;
        ordersBooked: number;
        ordersInHand: number;
        buMonthly: number;
        offerBUMonth: number;
    };
}

interface UserMonthlyData {
    month: string;
    monthLabel: string;
    offersValue: number;
    orderReceived: number;
    ordersInHand: number;
    buMonthly: number;
    percentDev: number | null;
    offerBUMonth: number;
    offerBUMonthDev: number | null;
}

interface UserMonthlyBreakdown {
    userId: number;
    userName: string;
    userShortForm: string | null;
    zoneName: string;
    hitRate: number;
    yearlyTarget: number;
    monthlyData: UserMonthlyData[];
    totals: {
        offersValue: number;
        orderReceived: number;
        ordersInHand: number;
        buMonthly: number;
        offerBUMonth: number;
    };
}

// ============ Helper Functions ============

/**
 * Format currency values exactly like the dashboard:
 * - ≥ 1 Crore (10,000,000): Shows as "₹X.XXCr"
 * - ≥ 1 Lakh (100,000): Shows as "₹X.XXL"
 * - Below 1 Lakh: Shows as formatted number
 */
const formatCurrencyCompact = (value: number): string => {
    if (value === 0) return '-';
    if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)}L`;
    }
    return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;
};

// Keep formatInLakhs for backwards compatibility in some places
const formatInLakhs = (value: number): string => {
    if (value === 0) return '-';
    if (value >= 10000000) {
        return `${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
        return `${(value / 100000).toFixed(2)}L`;
    }
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
};

const getZoneColor = (zoneName: string): { bg: string; accent: string } => {
    const upper = zoneName.toUpperCase();
    return {
        bg: COLORS.zoneBg[upper as keyof typeof COLORS.zoneBg] || 'F8FAFC',
        accent: COLORS.zoneAccent[upper as keyof typeof COLORS.zoneAccent] || '64748B',
    };
};

const applyHeaderStyle = (cell: ExcelJS.Cell): void => {
    cell.font = { bold: true, color: { argb: COLORS.headerText }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
        top: { style: 'thin', color: { argb: COLORS.headerBg } },
        left: { style: 'thin', color: { argb: COLORS.headerBg } },
        bottom: { style: 'thin', color: { argb: COLORS.headerBg } },
        right: { style: 'thin', color: { argb: COLORS.headerBg } },
    };
};

const applyDataCellStyle = (cell: ExcelJS.Cell, bgColor: string, isNumber = false): void => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cell.border = {
        top: { style: 'thin', color: { argb: COLORS.borderLight } },
        left: { style: 'thin', color: { argb: COLORS.borderLight } },
        bottom: { style: 'thin', color: { argb: COLORS.borderLight } },
        right: { style: 'thin', color: { argb: COLORS.borderLight } },
    };
    cell.alignment = { horizontal: isNumber ? 'right' : 'left', vertical: 'middle' };
};

const applyTotalRowStyle = (cell: ExcelJS.Cell, isGrand = false): void => {
    cell.font = { bold: true, color: { argb: isGrand ? COLORS.headerText : COLORS.textDark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isGrand ? COLORS.grandTotalBg : COLORS.totalRowBg } };
    cell.border = {
        top: { style: 'medium', color: { argb: COLORS.headerBg } },
        left: { style: 'thin', color: { argb: COLORS.headerBg } },
        bottom: { style: 'medium', color: { argb: COLORS.headerBg } },
        right: { style: 'thin', color: { argb: COLORS.headerBg } },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
};

// ============ Sheet 1: Zone Summary (All Fields) ============

const generateZoneSummarySheet = (
    workbook: ExcelJS.Workbook,
    zones: ZoneSummary[],
    totals: SummaryTotals,
    year: number
): void => {
    const ws = workbook.addWorksheet('Zone Summary', {
        properties: { tabColor: { argb: COLORS.headerBg } },
    });

    let row = 1;

    // Title
    ws.mergeCells(`A${row}:L${row}`);
    const titleCell = ws.getCell(`A${row}`);
    titleCell.value = `ZONE-WISE SUMMARY REPORT (${year})`;
    titleCell.font = { size: 16, bold: true, color: { argb: COLORS.headerText } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(row).height = 30;
    row += 2;

    // Generation info
    ws.getCell(`A${row}`).value = `Generated: ${new Date().toLocaleString('en-IN')}`;
    ws.getCell(`A${row}`).font = { size: 10, italic: true, color: { argb: COLORS.textLight } };
    row += 2;

    // ALL HEADERS matching the dashboard table
    const headers = [
        'Zone', '# Offers', 'Offers Value (₹L)', 'Orders Received (₹L)',
        'Open Funnel (₹L)', 'Order Booking (₹L)', 'U for Booking (₹L)',
        'Hit Rate %', 'Yearly Target (₹L)', 'Balance BU (₹L)', 'Achievement %'
    ];

    headers.forEach((h, idx) => {
        const cell = ws.getCell(row, idx + 1);
        cell.value = h;
        applyHeaderStyle(cell);
    });
    ws.getRow(row).height = 26;
    row++;

    // Zone data rows with ALL fields
    zones.forEach((zone, idx) => {
        const colors = getZoneColor(zone.zoneName);
        const achievement = zone.yearlyTarget > 0
            ? parseFloat(((zone.ordersReceived / zone.yearlyTarget) * 100).toFixed(1))
            : 0;

        const rowData = [
            zone.zoneName,
            zone.noOfOffers,
            formatInLakhs(zone.offersValue),
            formatInLakhs(zone.ordersReceived),
            formatInLakhs(zone.openFunnel),
            formatInLakhs(zone.orderBooking),
            formatInLakhs(zone.uForBooking),
            zone.hitRatePercent,
            formatInLakhs(zone.yearlyTarget),
            formatInLakhs(zone.balanceBU),
            achievement,
        ];

        rowData.forEach((val, colIdx) => {
            const cell = ws.getCell(row, colIdx + 1);
            if (colIdx === 7 || colIdx === 10) {
                cell.value = `${val}%`;
            } else {
                cell.value = val;
            }
            applyDataCellStyle(cell, colors.bg, colIdx > 0);

            if (colIdx === 7) { // Hit Rate
                const rate = typeof val === 'number' ? val : 0;
                cell.font = { bold: true, color: { argb: rate >= 50 ? COLORS.positive : rate >= 30 ? COLORS.neutral : COLORS.negative } };
            }
            if (colIdx === 10) { // Achievement
                const ach = typeof val === 'number' ? val : 0;
                cell.font = { bold: true, color: { argb: ach >= 100 ? COLORS.positive : ach >= 50 ? COLORS.neutral : COLORS.negative } };
            }
            if (colIdx === 9) { // Balance (negative is good)
                const bal = typeof val === 'number' ? val : 0;
                cell.font = { color: { argb: bal <= 0 ? COLORS.positive : COLORS.negative } };
            }
        });
        row++;
    });


    // Total row
    const totalAchievement = totals.yearlyTarget > 0
        ? parseFloat(((totals.ordersReceived / totals.yearlyTarget) * 100).toFixed(1))
        : 0;

    const totalData = [
        'TOTAL',
        totals.noOfOffers,
        formatInLakhs(totals.offersValue),
        formatInLakhs(totals.ordersReceived),
        formatInLakhs(totals.openFunnel),
        formatInLakhs(totals.orderBooking),
        formatInLakhs(totals.uForBooking),
        `${totals.hitRatePercent}%`,
        formatInLakhs(totals.yearlyTarget),
        formatInLakhs(totals.balanceBU),
        `${totalAchievement}%`,
    ];

    totalData.forEach((val, colIdx) => {
        const cell = ws.getCell(row, colIdx + 1);
        cell.value = val;
        applyTotalRowStyle(cell, true);
    });

    // Set column widths
    ws.columns = [
        { width: 12 }, { width: 10 }, { width: 16 }, { width: 18 },
        { width: 16 }, { width: 16 }, { width: 16 },
        { width: 12 }, { width: 16 }, { width: 16 }, { width: 14 },
    ];
};

// ============ Sheet 2: Zone Monthly (Matching Dashboard Format) ============

const generateZoneMonthlySheet = (
    workbook: ExcelJS.Workbook,
    zones: ZoneMonthlyBreakdown[],
    year: number
): void => {
    const ws = workbook.addWorksheet('Zone Monthly', {
        properties: { tabColor: { argb: '3B82F6' } },
    });

    let row = 1;

    // Title
    ws.mergeCells(`A${row}:I${row}`);
    const titleCell = ws.getCell(`A${row}`);
    titleCell.value = `ZONE-WISE MONTHLY BREAKDOWN (${year})`;
    titleCell.font = { size: 16, bold: true, color: { argb: COLORS.headerText } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(row).height = 30;
    row += 2;

    // For each zone, create a complete section matching dashboard
    for (const zone of zones) {
        const colors = getZoneColor(zone.zoneName);

        // Zone header (matching dashboard: Zone Name | Hit Rate | Target)
        ws.mergeCells(`A${row}:I${row}`);
        const zoneHeader = ws.getCell(`A${row}`);
        zoneHeader.value = `${zone.zoneName} Zone  |  HIT RATE: ${zone.hitRate}%  |  TARGET: ${formatCurrencyCompact(zone.yearlyTarget)}`;
        zoneHeader.font = { size: 12, bold: true, color: { argb: COLORS.headerText } };
        zoneHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.accent } };
        zoneHeader.alignment = { horizontal: 'left', vertical: 'middle' };
        ws.getRow(row).height = 28;
        row++;

        // Column headers (matching dashboard exactly)
        const headers = ['MONTH', 'OFFERS', 'ORDERS', 'FUNNEL', 'BU/MO', '%DEV', 'OFFERBU', '%DEV'];
        headers.forEach((h, idx) => {
            const cell = ws.getCell(row, idx + 1);
            cell.value = h;
            cell.font = { bold: true, size: 10, color: { argb: COLORS.textLight } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
            cell.alignment = { horizontal: idx === 0 ? 'left' : 'right', vertical: 'middle' };
            cell.border = {
                bottom: { style: 'thin', color: { argb: COLORS.borderLight } },
            };
        });
        ws.getRow(row).height = 22;
        row++;

        // Monthly data rows (matching dashboard)
        zone.monthlyData.forEach((m, idx) => {
            const isEven = idx % 2 === 0;
            const bgColor = isEven ? COLORS.rowEven : COLORS.rowOdd;

            // Column 1: Month
            const monthCell = ws.getCell(row, 1);
            monthCell.value = m.monthLabel;
            monthCell.font = { bold: true, size: 10, color: { argb: COLORS.textDark } };
            monthCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            monthCell.alignment = { horizontal: 'left' };

            // Column 2: Offers (Blue)
            const offersCell = ws.getCell(row, 2);
            offersCell.value = formatCurrencyCompact(m.offersValue);
            offersCell.font = { bold: true, size: 10, color: { argb: COLORS.colOffers } };
            offersCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            offersCell.alignment = { horizontal: 'right' };

            // Column 3: Orders (Emerald)
            const ordersCell = ws.getCell(row, 3);
            ordersCell.value = formatCurrencyCompact(m.orderReceived);
            ordersCell.font = { bold: true, size: 10, color: { argb: COLORS.colOrders } };
            ordersCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            ordersCell.alignment = { horizontal: 'right' };

            // Column 4: Funnel (Amber)
            const funnelCell = ws.getCell(row, 4);
            funnelCell.value = formatCurrencyCompact(m.ordersInHand);
            funnelCell.font = { bold: true, size: 10, color: { argb: COLORS.colFunnel } };
            funnelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            funnelCell.alignment = { horizontal: 'right' };

            // Column 5: BU/MO (Purple with purple background)
            const buCell = ws.getCell(row, 5);
            buCell.value = formatCurrencyCompact(m.buMonthly);
            buCell.font = { bold: true, size: 10, color: { argb: COLORS.colBU } };
            buCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.colBUBg } };
            buCell.alignment = { horizontal: 'right' };

            // Column 6: %Dev (Green/Red badge)
            const devCell = ws.getCell(row, 6);
            if (m.percentDev !== null) {
                devCell.value = `${m.percentDev >= 0 ? '+' : ''}${m.percentDev}%`;
                const isPositive = m.percentDev >= 0;
                devCell.font = { bold: true, size: 10, color: { argb: isPositive ? COLORS.positive : COLORS.negative } };
                devCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isPositive ? COLORS.positiveBg : COLORS.negativeBg } };
            } else {
                devCell.value = '-';
                devCell.font = { size: 10, color: { argb: COLORS.textLight } };
                devCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            }
            devCell.alignment = { horizontal: 'center' };

            // Column 7: OfferBU (Indigo with indigo background)
            const offerBuCell = ws.getCell(row, 7);
            offerBuCell.value = formatCurrencyCompact(m.offerBUMonth);
            offerBuCell.font = { bold: true, size: 10, color: { argb: COLORS.colOfferBU } };
            offerBuCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.colOfferBUBg } };
            offerBuCell.alignment = { horizontal: 'right' };

            // Column 8: %Dev (Green/Red badge)
            const devCell2 = ws.getCell(row, 8);
            if (m.offerBUMonthDev !== null) {
                devCell2.value = `${m.offerBUMonthDev >= 0 ? '+' : ''}${m.offerBUMonthDev}%`;
                const isPositive = m.offerBUMonthDev >= 0;
                devCell2.font = { bold: true, size: 10, color: { argb: isPositive ? COLORS.positive : COLORS.negative } };
                devCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isPositive ? COLORS.positiveBg : COLORS.negativeBg } };
            } else {
                devCell2.value = '-';
                devCell2.font = { size: 10, color: { argb: COLORS.textLight } };
                devCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            }
            devCell2.alignment = { horizontal: 'center' };

            // Add bottom border to all cells
            for (let col = 1; col <= 8; col++) {
                ws.getCell(row, col).border = {
                    bottom: { style: 'thin', color: { argb: COLORS.borderLight } },
                };
            }

            row++;
        });

        // Total row (dark background like dashboard)
        const totalRow = row;
        const totalBgColor = '1E293B'; // Dark slate matching dashboard

        const totalMonthCell = ws.getCell(totalRow, 1);
        totalMonthCell.value = '↗ Total';
        totalMonthCell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        totalMonthCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalBgColor } };

        // Total Offers
        const totalOffersCell = ws.getCell(totalRow, 2);
        totalOffersCell.value = formatCurrencyCompact(zone.totals.offersValue);
        totalOffersCell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        totalOffersCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalBgColor } };
        totalOffersCell.alignment = { horizontal: 'right' };

        // Total Orders
        const totalOrdersCell = ws.getCell(totalRow, 3);
        totalOrdersCell.value = formatCurrencyCompact(zone.totals.orderReceived);
        totalOrdersCell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        totalOrdersCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalBgColor } };
        totalOrdersCell.alignment = { horizontal: 'right' };

        // Total Funnel
        const totalFunnelCell = ws.getCell(totalRow, 4);
        totalFunnelCell.value = formatCurrencyCompact(zone.totals.ordersInHand);
        totalFunnelCell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        totalFunnelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalBgColor } };
        totalFunnelCell.alignment = { horizontal: 'right' };

        // Total BU
        const totalBuCell = ws.getCell(totalRow, 5);
        totalBuCell.value = formatCurrencyCompact(zone.totals.buMonthly);
        totalBuCell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        totalBuCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalBgColor } };
        totalBuCell.alignment = { horizontal: 'right' };

        // Total Dev
        const totalDevCell = ws.getCell(totalRow, 6);
        totalDevCell.value = '—';
        totalDevCell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        totalDevCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalBgColor } };
        totalDevCell.alignment = { horizontal: 'center' };

        // Total OfferBU
        const totalOfferBuCell = ws.getCell(totalRow, 7);
        totalOfferBuCell.value = formatCurrencyCompact(zone.totals.offerBUMonth);
        totalOfferBuCell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        totalOfferBuCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalBgColor } };
        totalOfferBuCell.alignment = { horizontal: 'right' };

        // Total Dev 2
        const totalDevCell2 = ws.getCell(totalRow, 8);
        totalDevCell2.value = '—';
        totalDevCell2.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
        totalDevCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalBgColor } };
        totalDevCell2.alignment = { horizontal: 'center' };

        ws.getRow(totalRow).height = 24;
        row += 3; // Space before next zone
    }

    // Set column widths matching dashboard proportions
    ws.columns = [
        { width: 12 },  // Month
        { width: 14 },  // Offers
        { width: 14 },  // Orders
        { width: 14 },  // Funnel
        { width: 12 },  // BU/MO
        { width: 10 },  // %Dev
        { width: 14 },  // OfferBU
        { width: 10 },  // %Dev
    ];
};

// ============ Sheet 3: User Monthly (All Fields) ============

const generateUserMonthlySheet = (
    workbook: ExcelJS.Workbook,
    users: UserMonthlyBreakdown[],
    year: number
): void => {
    const ws = workbook.addWorksheet('User Monthly', {
        properties: { tabColor: { argb: '8B5CF6' } },
    });

    let row = 1;

    // Title
    ws.mergeCells(`A${row}:L${row}`);
    const titleCell = ws.getCell(`A${row}`);
    titleCell.value = `USER-WISE MONTHLY BREAKDOWN (${year}) - All Values in ₹ Lakhs`;
    titleCell.font = { size: 16, bold: true, color: { argb: COLORS.headerText } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(row).height = 30;
    row += 2;

    // Group users by zone
    const usersByZone: { [zoneName: string]: UserMonthlyBreakdown[] } = {};
    users.forEach(user => {
        const zone = user.zoneName || 'Unknown';
        if (!usersByZone[zone]) usersByZone[zone] = [];
        usersByZone[zone].push(user);
    });

    // For each zone, create user sections
    for (const [zoneName, zoneUsers] of Object.entries(usersByZone)) {
        const colors = getZoneColor(zoneName);

        // Zone header
        ws.mergeCells(`A${row}:L${row}`);
        const zoneHeader = ws.getCell(`A${row}`);
        zoneHeader.value = `📍 ${zoneName} ZONE`;
        zoneHeader.font = { size: 14, bold: true, color: { argb: COLORS.headerText } };
        zoneHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.accent } };
        zoneHeader.alignment = { horizontal: 'left', vertical: 'middle' };
        ws.getRow(row).height = 28;
        row += 2;

        // For each user in this zone
        for (const user of zoneUsers) {
            // User info row
            ws.mergeCells(`A${row}:L${row}`);
            const userHeader = ws.getCell(`A${row}`);
            userHeader.value = `👤 ${user.userName} (${user.userShortForm || 'N/A'}) | Hit Rate: ${user.hitRate}% | Target: ₹${formatInLakhs(user.yearlyTarget)}L`;
            userHeader.font = { size: 11, bold: true, color: { argb: COLORS.titleText } };
            userHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.titleBg } };
            userHeader.alignment = { horizontal: 'left', vertical: 'middle' };
            ws.getRow(row).height = 24;
            row++;

            // Column headers
            const headers = [
                'Month', 'Offers Value', 'Orders Received', 'Open Funnel',
                'BU/Monthly', '% Deviation', 'Offer BU Month', 'Offer BU Dev %'
            ];

            headers.forEach((h, idx) => {
                const cell = ws.getCell(row, idx + 1);
                cell.value = h;
                applyHeaderStyle(cell);
            });
            ws.getRow(row).height = 22;
            row++;

            // Monthly data
            user.monthlyData.forEach((m, idx) => {
                const isEven = idx % 2 === 0;
                const bgColor = isEven ? COLORS.rowEven : COLORS.rowOdd;

                const rowData = [
                    m.monthLabel,
                    formatInLakhs(m.offersValue),
                    formatInLakhs(m.orderReceived),
                    formatInLakhs(m.ordersInHand),
                    formatInLakhs(m.buMonthly),
                    m.percentDev !== null ? `${m.percentDev}%` : '-',
                    formatInLakhs(m.offerBUMonth),
                    m.offerBUMonthDev !== null ? `${m.offerBUMonthDev}%` : '-',
                ];

                rowData.forEach((val, colIdx) => {
                    const cell = ws.getCell(row, colIdx + 1);
                    cell.value = val;
                    applyDataCellStyle(cell, bgColor, colIdx > 0);

                    // Color deviation columns
                    if (colIdx === 5 && m.percentDev !== null) {
                        cell.font = { bold: true, color: { argb: m.percentDev >= 0 ? COLORS.positive : COLORS.negative } };
                    }
                    if (colIdx === 7 && m.offerBUMonthDev !== null) {
                        cell.font = { bold: true, color: { argb: m.offerBUMonthDev >= 0 ? COLORS.positive : COLORS.negative } };
                    }
                });
                row++;
            });

            // User totals
            const achievement = user.yearlyTarget > 0
                ? parseFloat(((user.totals.orderReceived / user.yearlyTarget) * 100).toFixed(1))
                : 0;

            const userTotalData = [
                'USER TOTAL',
                formatInLakhs(user.totals.offersValue),
                formatInLakhs(user.totals.orderReceived),
                formatInLakhs(user.totals.ordersInHand),
                formatInLakhs(user.totals.buMonthly),
                `${achievement}%`,
                formatInLakhs(user.totals.offerBUMonth),
                '-',
            ];

            userTotalData.forEach((val, colIdx) => {
                const cell = ws.getCell(row, colIdx + 1);
                cell.value = val;
                applyTotalRowStyle(cell, false);
            });

            row += 2;
        }

        row += 2; // Extra space before next zone
    }

    // Set column widths
    ws.columns = [
        { width: 12 }, { width: 14 }, { width: 16 }, { width: 14 },
        { width: 14 }, { width: 12 }, { width: 16 }, { width: 14 },
    ];
};

// ============ Sheet 4: Consolidated Monthly Comparison ============

const generateConsolidatedMonthlySheet = (
    workbook: ExcelJS.Workbook,
    zones: ZoneMonthlyBreakdown[],
    year: number
): void => {
    const ws = workbook.addWorksheet('Consolidated Monthly', {
        properties: { tabColor: { argb: '10B981' } },
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let row = 1;

    // Title
    ws.mergeCells(`A${row}:O${row}`);
    const titleCell = ws.getCell(`A${row}`);
    titleCell.value = `CONSOLIDATED MONTHLY COMPARISON (${year}) - All Values in ₹ Lakhs`;
    titleCell.font = { size: 16, bold: true, color: { argb: COLORS.headerText } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(row).height = 30;
    row += 2;

    // ====== ORDERS RECEIVED SECTION ======
    ws.mergeCells(`A${row}:O${row}`);
    const ordersTitle = ws.getCell(`A${row}`);
    ordersTitle.value = '📊 ORDERS RECEIVED BY ZONE (Monthly)';
    ordersTitle.font = { size: 12, bold: true, color: { argb: COLORS.titleText } };
    ordersTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.titleBg } };
    row += 2;

    // Headers
    const headers = ['Zone', ...months, 'TOTAL'];
    headers.forEach((h, idx) => {
        const cell = ws.getCell(row, idx + 1);
        cell.value = h;
        applyHeaderStyle(cell);
    });
    ws.getRow(row).height = 22;
    row++;

    // Zone data rows
    const grandTotalOrders: number[] = new Array(12).fill(0);

    zones.forEach((zone) => {
        const colors = getZoneColor(zone.zoneName);
        let zoneTotal = 0;

        const zoneCell = ws.getCell(row, 1);
        zoneCell.value = zone.zoneName;
        zoneCell.font = { bold: true };
        zoneCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bg } };
        zoneCell.border = { left: { style: 'medium', color: { argb: colors.accent } } };

        zone.monthlyData.forEach((m, idx) => {
            const cell = ws.getCell(row, idx + 2);
            const val = formatInLakhs(m.orderReceived);
            cell.value = val;
            cell.numFmt = '#,##0.00';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bg } };
            cell.alignment = { horizontal: 'right' };
            zoneTotal += m.orderReceived;
            grandTotalOrders[idx] += m.orderReceived;
        });

        const totalCell = ws.getCell(row, 14);
        totalCell.value = formatInLakhs(zoneTotal);
        totalCell.numFmt = '#,##0.00';
        totalCell.font = { bold: true };
        totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalRowBg } };
        totalCell.alignment = { horizontal: 'right' };

        row++;
    });

    // Grand total row
    const grandTotalCell = ws.getCell(row, 1);
    grandTotalCell.value = 'GRAND TOTAL';
    applyTotalRowStyle(grandTotalCell, true);

    grandTotalOrders.forEach((val, idx) => {
        const cell = ws.getCell(row, idx + 2);
        cell.value = formatInLakhs(val);
        cell.numFmt = '#,##0.00';
        applyTotalRowStyle(cell, true);
        cell.alignment = { horizontal: 'right' };
    });

    const grandTotal = grandTotalOrders.reduce((a, b) => a + b, 0);
    const grandTotalValCell = ws.getCell(row, 14);
    grandTotalValCell.value = formatInLakhs(grandTotal);
    grandTotalValCell.numFmt = '#,##0.00';
    applyTotalRowStyle(grandTotalValCell, true);
    grandTotalValCell.alignment = { horizontal: 'right' };

    row += 3;

    // ====== OFFERS VALUE SECTION ======
    ws.mergeCells(`A${row}:O${row}`);
    const offersTitle = ws.getCell(`A${row}`);
    offersTitle.value = '📊 OFFERS VALUE BY ZONE (Monthly)';
    offersTitle.font = { size: 12, bold: true, color: { argb: COLORS.titleText } };
    offersTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.titleBg } };
    row += 2;

    // Headers
    headers.forEach((h, idx) => {
        const cell = ws.getCell(row, idx + 1);
        cell.value = h;
        applyHeaderStyle(cell);
    });
    ws.getRow(row).height = 22;
    row++;

    // Offers data rows
    const grandTotalOffers: number[] = new Array(12).fill(0);

    zones.forEach((zone) => {
        const colors = getZoneColor(zone.zoneName);
        let zoneTotal = 0;

        const zoneCell = ws.getCell(row, 1);
        zoneCell.value = zone.zoneName;
        zoneCell.font = { bold: true };
        zoneCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bg } };
        zoneCell.border = { left: { style: 'medium', color: { argb: colors.accent } } };

        zone.monthlyData.forEach((m, idx) => {
            const cell = ws.getCell(row, idx + 2);
            const val = formatInLakhs(m.offersValue);
            cell.value = val;
            cell.numFmt = '#,##0.00';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bg } };
            cell.alignment = { horizontal: 'right' };
            zoneTotal += m.offersValue;
            grandTotalOffers[idx] += m.offersValue;
        });

        const totalCell = ws.getCell(row, 14);
        totalCell.value = formatInLakhs(zoneTotal);
        totalCell.numFmt = '#,##0.00';
        totalCell.font = { bold: true };
        totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalRowBg } };
        totalCell.alignment = { horizontal: 'right' };

        row++;
    });

    // Grand total row for offers
    const grandTotalOffersCell = ws.getCell(row, 1);
    grandTotalOffersCell.value = 'GRAND TOTAL';
    applyTotalRowStyle(grandTotalOffersCell, true);

    grandTotalOffers.forEach((val, idx) => {
        const cell = ws.getCell(row, idx + 2);
        cell.value = formatInLakhs(val);
        cell.numFmt = '#,##0.00';
        applyTotalRowStyle(cell, true);
        cell.alignment = { horizontal: 'right' };
    });

    const grandTotalOffersVal = grandTotalOffers.reduce((a, b) => a + b, 0);
    const grandTotalOfferValCell = ws.getCell(row, 14);
    grandTotalOfferValCell.value = formatInLakhs(grandTotalOffersVal);
    grandTotalOfferValCell.numFmt = '#,##0.00';
    applyTotalRowStyle(grandTotalOfferValCell, true);

    row += 3;

    // ====== OPEN FUNNEL SECTION ======
    ws.mergeCells(`A${row}:O${row}`);
    const funnelTitle = ws.getCell(`A${row}`);
    funnelTitle.value = '📊 OPEN FUNNEL BY ZONE (Monthly)';
    funnelTitle.font = { size: 12, bold: true, color: { argb: COLORS.titleText } };
    funnelTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.titleBg } };
    row += 2;

    // Headers
    headers.forEach((h, idx) => {
        const cell = ws.getCell(row, idx + 1);
        cell.value = h;
        applyHeaderStyle(cell);
    });
    ws.getRow(row).height = 22;
    row++;

    // Funnel data rows
    const grandTotalFunnel: number[] = new Array(12).fill(0);

    zones.forEach((zone) => {
        const colors = getZoneColor(zone.zoneName);
        let zoneTotal = 0;

        const zoneCell = ws.getCell(row, 1);
        zoneCell.value = zone.zoneName;
        zoneCell.font = { bold: true };
        zoneCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bg } };
        zoneCell.border = { left: { style: 'medium', color: { argb: colors.accent } } };

        zone.monthlyData.forEach((m, idx) => {
            const cell = ws.getCell(row, idx + 2);
            const val = formatInLakhs(m.ordersInHand);
            cell.value = val;
            cell.numFmt = '#,##0.00';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bg } };
            cell.alignment = { horizontal: 'right' };
            zoneTotal += m.ordersInHand;
            grandTotalFunnel[idx] += m.ordersInHand;
        });

        const totalCell = ws.getCell(row, 14);
        totalCell.value = formatInLakhs(zoneTotal);
        totalCell.numFmt = '#,##0.00';
        totalCell.font = { bold: true };
        totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalRowBg } };
        totalCell.alignment = { horizontal: 'right' };

        row++;
    });

    // Grand total row for funnel
    const grandTotalFunnelCell = ws.getCell(row, 1);
    grandTotalFunnelCell.value = 'GRAND TOTAL';
    applyTotalRowStyle(grandTotalFunnelCell, true);

    grandTotalFunnel.forEach((val, idx) => {
        const cell = ws.getCell(row, idx + 2);
        cell.value = formatInLakhs(val);
        cell.numFmt = '#,##0.00';
        applyTotalRowStyle(cell, true);
        cell.alignment = { horizontal: 'right' };
    });

    const grandTotalFunnelVal = grandTotalFunnel.reduce((a, b) => a + b, 0);
    const grandTotalFunnelValCell = ws.getCell(row, 14);
    grandTotalFunnelValCell.value = formatInLakhs(grandTotalFunnelVal);
    grandTotalFunnelValCell.numFmt = '#,##0.00';
    applyTotalRowStyle(grandTotalFunnelValCell, true);

    // Set column widths
    ws.columns = [
        { width: 12 },
        ...months.map(() => ({ width: 10 })),
        { width: 12 },
    ];

    // Freeze first row and column
    ws.views = [{ state: 'frozen', ySplit: 4, xSplit: 1 }];
};

// ============ Sheet 5: PO Expected Month (Zone-wise with User breakdown) ============

const generatePOExpectedSheet = (
    workbook: ExcelJS.Workbook,
    data: any,
    year: number
): void => {
    if (!data || !data.zones) return;

    const ws = workbook.addWorksheet('PO Expected Month', {
        properties: { tabColor: { argb: 'F59E0B' } },
    });

    const months = data.months || ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    let row = 1;

    // Title
    ws.mergeCells(`A${row}:O${row}`);
    const titleCell = ws.getCell(`A${row}`);
    titleCell.value = `PO EXPECTED MONTH BREAKDOWN (${year}) - All Values in ₹ Lakhs`;
    titleCell.font = { size: 16, bold: true, color: { argb: COLORS.headerText } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(row).height = 30;
    row += 2;

    // For each zone
    for (const zone of data.zones) {
        const colors = getZoneColor(zone.zoneName);

        // Zone header
        ws.mergeCells(`A${row}:O${row}`);
        const zoneHeader = ws.getCell(`A${row}`);
        zoneHeader.value = `📍 ${zone.zoneName} ZONE | Total: ₹${formatInLakhs(zone.grandTotal)}L`;
        zoneHeader.font = { size: 13, bold: true, color: { argb: COLORS.headerText } };
        zoneHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.accent } };
        zoneHeader.alignment = { horizontal: 'left', vertical: 'middle' };
        ws.getRow(row).height = 26;
        row += 2;

        // Headers
        const headers = ['User', ...months, 'TOTAL'];
        headers.forEach((h, idx) => {
            const cell = ws.getCell(row, idx + 1);
            cell.value = h;
            applyHeaderStyle(cell);
        });
        ws.getRow(row).height = 22;
        row++;

        // User data rows
        (zone.users || []).forEach((user: any, idx: number) => {
            const isEven = idx % 2 === 0;
            const bgColor = isEven ? COLORS.rowEven : COLORS.rowOdd;

            const userCell = ws.getCell(row, 1);
            userCell.value = user.userName;
            userCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

            months.forEach((m: string, mIdx: number) => {
                const cell = ws.getCell(row, mIdx + 2);
                const val = user.monthlyValues?.[m] || 0;
                cell.value = formatInLakhs(val);
                cell.numFmt = '#,##0.00';
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                cell.alignment = { horizontal: 'right' };
            });

            const totalCell = ws.getCell(row, months.length + 2);
            totalCell.value = formatInLakhs(user.total || 0);
            totalCell.numFmt = '#,##0.00';
            totalCell.font = { bold: true };
            totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalRowBg } };
            totalCell.alignment = { horizontal: 'right' };

            row++;
        });

        // Zone total row
        const zoneTotalCell = ws.getCell(row, 1);
        zoneTotalCell.value = `${zone.zoneName} TOTAL`;
        applyTotalRowStyle(zoneTotalCell, false);

        months.forEach((m: string, mIdx: number) => {
            const cell = ws.getCell(row, mIdx + 2);
            cell.value = formatInLakhs(zone.monthlyTotals?.[m] || 0);
            cell.numFmt = '#,##0.00';
            applyTotalRowStyle(cell, false);
            cell.alignment = { horizontal: 'right' };
        });

        const grandTotalCell = ws.getCell(row, months.length + 2);
        grandTotalCell.value = formatInLakhs(zone.grandTotal || 0);
        grandTotalCell.numFmt = '#,##0.00';
        applyTotalRowStyle(grandTotalCell, true);

        row += 3;
    }

    // Set column widths
    ws.columns = [
        { width: 18 },
        ...months.map(() => ({ width: 10 })),
        { width: 12 },
    ];
};

// ============ Sheet 6: Product × User × Zone ============

const generateProductUserZoneSheet = (
    workbook: ExcelJS.Workbook,
    data: any,
    year: number
): void => {
    if (!data || !data.zones) return;

    const ws = workbook.addWorksheet('Product User Zone', {
        properties: { tabColor: { argb: '8B5CF6' } },
    });

    let row = 1;

    // Title
    ws.mergeCells(`A${row}:H${row}`);
    const titleCell = ws.getCell(`A${row}`);
    titleCell.value = `PRODUCT × USER × ZONE BREAKDOWN (${year})`;
    titleCell.font = { size: 16, bold: true, color: { argb: COLORS.headerText } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(row).height = 30;
    row += 2;

    // For each zone
    for (const zone of data.zones) {
        const colors = getZoneColor(zone.zoneName);
        const users = zone.users || [];

        // Zone header
        ws.mergeCells(`A${row}:${String.fromCharCode(65 + users.length + 1)}${row}`);
        const zoneHeader = ws.getCell(`A${row}`);
        zoneHeader.value = `📍 ${zone.zoneName} ZONE | Total: ₹${formatInLakhs(zone.zoneTotalValue || 0)}L`;
        zoneHeader.font = { size: 13, bold: true, color: { argb: COLORS.headerText } };
        zoneHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.accent } };
        ws.getRow(row).height = 26;
        row += 2;

        // Headers
        const headers = ['Product', ...users.map((u: any) => u.name?.split(' ')[0] || 'User'), 'TOTAL'];
        headers.forEach((h, idx) => {
            const cell = ws.getCell(row, idx + 1);
            cell.value = h;
            applyHeaderStyle(cell);
        });
        ws.getRow(row).height = 22;
        row++;

        // Product rows
        (zone.productMatrix || []).forEach((product: any, idx: number) => {
            const isEven = idx % 2 === 0;
            const bgColor = isEven ? COLORS.rowEven : COLORS.rowOdd;

            const productCell = ws.getCell(row, 1);
            productCell.value = product.productLabel || product.productType?.replace(/_/g, ' ');
            productCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

            users.forEach((user: any, uIdx: number) => {
                const cell = ws.getCell(row, uIdx + 2);
                const val = product.userValues?.[user.id] || 0;
                cell.value = val > 0 ? formatInLakhs(val) : '-';
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                cell.alignment = { horizontal: 'right' };
            });

            const totalCell = ws.getCell(row, users.length + 2);
            totalCell.value = formatInLakhs(product.total || 0);
            totalCell.font = { bold: true };
            totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalRowBg } };
            totalCell.alignment = { horizontal: 'right' };

            row++;
        });

        // User totals row
        const totalLabel = ws.getCell(row, 1);
        totalLabel.value = 'USER TOTAL';
        applyTotalRowStyle(totalLabel, true);

        users.forEach((user: any, uIdx: number) => {
            const cell = ws.getCell(row, uIdx + 2);
            cell.value = formatInLakhs(zone.userTotals?.[user.id] || 0);
            applyTotalRowStyle(cell, true);
            cell.alignment = { horizontal: 'right' };
        });

        const grandTotalCell = ws.getCell(row, users.length + 2);
        grandTotalCell.value = formatInLakhs(zone.zoneTotalValue || 0);
        applyTotalRowStyle(grandTotalCell, true);

        row += 3;
    }

    // Set column widths
    ws.columns = [{ width: 16 }];
};

// ============ Sheet 7: Product-wise Forecast (Zone → User → Product × Month) ============

const generateProductWiseForecastSheet = (
    workbook: ExcelJS.Workbook,
    data: any,
    year: number
): void => {
    if (!data || !data.zones) return;

    const ws = workbook.addWorksheet('Product Wise Forecast', {
        properties: { tabColor: { argb: '10B981' } },
    });

    const months = data.months || ['MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB'];
    let row = 1;

    // Title
    ws.mergeCells(`A${row}:P${row}`);
    const titleCell = ws.getCell(`A${row}`);
    titleCell.value = `PRODUCT-WISE MONTHLY FORECAST (${year}) - All Values in ₹ Lakhs`;
    titleCell.font = { size: 16, bold: true, color: { argb: COLORS.headerText } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(row).height = 30;
    row += 2;

    // For each zone
    for (const zone of data.zones) {
        const colors = getZoneColor(zone.zoneName);

        // Zone header
        ws.mergeCells(`A${row}:P${row}`);
        const zoneHeader = ws.getCell(`A${row}`);
        zoneHeader.value = `📍 ${zone.zoneName} ZONE | Total: ₹${formatInLakhs(zone.grandTotal || 0)}L`;
        zoneHeader.font = { size: 13, bold: true, color: { argb: COLORS.headerText } };
        zoneHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.accent } };
        ws.getRow(row).height = 26;
        row += 2;

        // For each user in zone
        for (const user of (zone.users || [])) {
            // User header
            ws.mergeCells(`A${row}:P${row}`);
            const userHeader = ws.getCell(`A${row}`);
            userHeader.value = `👤 ${user.userName} | Total: ₹${formatInLakhs(user.grandTotal || 0)}L`;
            userHeader.font = { size: 11, bold: true, color: { argb: COLORS.titleText } };
            userHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.titleBg } };
            ws.getRow(row).height = 24;
            row++;

            // Headers
            const headers = ['Product', ...months, 'TOTAL'];
            headers.forEach((h, idx) => {
                const cell = ws.getCell(row, idx + 1);
                cell.value = h;
                applyHeaderStyle(cell);
            });
            ws.getRow(row).height = 20;
            row++;

            // Product rows
            (user.products || []).forEach((product: any, idx: number) => {
                const isEven = idx % 2 === 0;
                const bgColor = isEven ? COLORS.rowEven : COLORS.rowOdd;

                const productCell = ws.getCell(row, 1);
                productCell.value = product.productLabel || product.productType;
                productCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };

                months.forEach((m: string, mIdx: number) => {
                    const cell = ws.getCell(row, mIdx + 2);
                    const val = product.monthlyValues?.[m] || 0;
                    cell.value = val > 0 ? formatInLakhs(val) : '-';
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                    cell.alignment = { horizontal: 'right' };
                });

                const totalCell = ws.getCell(row, months.length + 2);
                totalCell.value = formatInLakhs(product.total || 0);
                totalCell.font = { bold: true };
                totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalRowBg } };
                totalCell.alignment = { horizontal: 'right' };

                row++;
            });

            // User total row
            const userTotalLabel = ws.getCell(row, 1);
            userTotalLabel.value = 'USER TOTAL';
            applyTotalRowStyle(userTotalLabel, false);

            months.forEach((m: string, mIdx: number) => {
                const cell = ws.getCell(row, mIdx + 2);
                cell.value = formatInLakhs(user.monthlyTotals?.[m] || 0);
                applyTotalRowStyle(cell, false);
                cell.alignment = { horizontal: 'right' };
            });

            const userGrandTotal = ws.getCell(row, months.length + 2);
            userGrandTotal.value = formatInLakhs(user.grandTotal || 0);
            applyTotalRowStyle(userGrandTotal, true);

            row += 2;
        }

        row += 2;
    }

    // Set column widths
    ws.columns = [
        { width: 16 },
        ...months.map(() => ({ width: 8 })),
        { width: 10 },
    ];
};

// ============ Main Export Function ============

export interface ForecastExportData {
    year: number;
    probability?: number | 'all';
    summaryData?: {
        zones: ZoneSummary[];
        totals: SummaryTotals;
    } | null;
    monthlyData?: {
        zones: ZoneMonthlyBreakdown[];
    } | null;
    userMonthlyData?: UserMonthlyBreakdown[] | null;
    poExpectedData?: any;
    productUserZoneData?: any;
    productWiseForecastData?: any;
}

/**
 * Export all forecast data to a comprehensive styled multi-sheet Excel workbook
 * Generates 7 sheets covering all dashboard tabs
 */
export const exportForecastToExcel = async (
    data: ForecastExportData,
    filename?: string
): Promise<void> => {
    const { year, probability, summaryData, monthlyData, userMonthlyData, poExpectedData, productUserZoneData, productWiseForecastData } = data;

    // Create workbook with metadata
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'KardexCare Forecast Dashboard';
    workbook.lastModifiedBy = 'KardexCare System';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Sheet 1: Zone Summary (All Fields)
    if (summaryData) {
        generateZoneSummarySheet(workbook, summaryData.zones, summaryData.totals, year);
    }

    // Sheet 2: Zone Monthly Breakdown (All Fields per Zone)
    if (monthlyData?.zones && monthlyData.zones.length > 0) {
        generateZoneMonthlySheet(workbook, monthlyData.zones, year);
    }

    // Sheet 3: User Monthly Breakdown (All Fields per User)
    if (userMonthlyData && userMonthlyData.length > 0) {
        generateUserMonthlySheet(workbook, userMonthlyData, year);
    }

    // Sheet 5: PO Expected Month (Zone-wise with User breakdown)
    if (poExpectedData) {
        generatePOExpectedSheet(workbook, poExpectedData, year);
    }

    // Sheet 6: Product × User × Zone
    if (productUserZoneData) {
        generateProductUserZoneSheet(workbook, productUserZoneData, year);
    }

    // Sheet 7: Product-wise Forecast (Zone → User → Product × Month)
    if (productWiseForecastData) {
        generateProductWiseForecastSheet(workbook, productWiseForecastData, year);
    }

    // Generate filename
    const probabilityLabel = probability === 'all' ? 'All' : `${probability}pct`;
    const dateStr = new Date().toISOString().split('T')[0];
    const defaultFilename = `Forecast_Report_${year}_${probabilityLabel}_${dateStr}.xlsx`;

    // Generate buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Export only Overview tab data
 */
export const exportOverviewToExcel = async (
    data: ForecastExportData,
    filename?: string
): Promise<void> => {
    const { year, probability, summaryData, monthlyData } = data;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'KardexCare Forecast Dashboard';
    workbook.created = new Date();

    if (summaryData) {
        generateZoneSummarySheet(workbook, summaryData.zones, summaryData.totals, year);
    }

    if (monthlyData?.zones && monthlyData.zones.length > 0) {
        generateZoneMonthlySheet(workbook, monthlyData.zones, year);
        generateConsolidatedMonthlySheet(workbook, monthlyData.zones, year);
    }

    const probabilityLabel = probability === 'all' ? 'All' : `${probability}pct`;
    const dateStr = new Date().toISOString().split('T')[0];
    const defaultFilename = `Forecast_Overview_${year}_${probabilityLabel}_${dateStr}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
