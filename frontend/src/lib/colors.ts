/**
 * Kardex Company Color Palette
 * All colors used in the application must come from this palette.
 * 
 * Primary Colors (for large areas, headlines):
 * - Blues: Blue 1, Blue 2, Blue 3
 * - Greens: Green 1, Green 2, Green 3
 * 
 * Neutral Colors:
 * - Greys: Grey 1, Grey 2, Grey 3
 * - Silvers: Silver 1, Silver 2, Silver 3
 * 
 * Markup Colors (for highlights, CTAs):
 * - Reds: Red 1, Red 2, Red 3
 * - Sands: Sand 1, Sand 2, Sand 3
 */

// Primary Blues
export const KARDEX_BLUE_1 = '#96AEC2';
export const KARDEX_BLUE_2 = '#6F8A9D';
export const KARDEX_BLUE_3 = '#546A7A';

// Primary Greens
export const KARDEX_GREEN_1 = '#A2B9AF';
export const KARDEX_GREEN_2 = '#82A094';
export const KARDEX_GREEN_3 = '#4F6A64';

// Greys
export const KARDEX_GREY_1 = '#AEBFC3';
export const KARDEX_GREY_2 = '#A8ACA9';
export const KARDEX_GREY_3 = '#979796';

// Silvers
export const KARDEX_SILVER_1 = '#757777';
export const KARDEX_SILVER_2 = '#92A2A5';
export const KARDEX_SILVER_3 = '#5D6E73';

// Markup Reds
export const KARDEX_RED_1 = '#E17F70';
export const KARDEX_RED_2 = '#9E3B47';
export const KARDEX_RED_3 = '#75242D';

// Markup Sands
export const KARDEX_SAND_1 = '#EEC18F';
export const KARDEX_SAND_2 = '#CE9F6B';
export const KARDEX_SAND_3 = '#976E44';

// Semantic Color Mappings
export const KARDEX_COLORS = {
    // Primary actions
    primary: KARDEX_BLUE_1,
    primaryDark: KARDEX_BLUE_2,
    primaryDarker: KARDEX_BLUE_3,

    // Secondary/accent
    secondary: KARDEX_GREEN_1,
    secondaryDark: KARDEX_GREEN_2,
    secondaryDarker: KARDEX_GREEN_3,

    // Status colors
    success: KARDEX_GREEN_2,
    successLight: KARDEX_GREEN_1,
    successDark: KARDEX_GREEN_3,

    warning: KARDEX_SAND_1,
    warningDark: KARDEX_SAND_2,
    warningDarker: KARDEX_SAND_3,

    error: KARDEX_RED_1,
    errorDark: KARDEX_RED_2,
    errorDarker: KARDEX_RED_3,

    info: KARDEX_BLUE_1,
    infoDark: KARDEX_BLUE_2,

    // Neutral
    muted: KARDEX_GREY_1,
    mutedDark: KARDEX_GREY_2,
    mutedDarker: KARDEX_GREY_3,

    silver: KARDEX_SILVER_1,
    silverLight: KARDEX_SILVER_2,
    silverDark: KARDEX_SILVER_3,
};

// Chart Colors Array
export const KARDEX_CHART_COLORS = [
    KARDEX_BLUE_1,
    KARDEX_GREEN_1,
    KARDEX_BLUE_2,
    KARDEX_GREEN_2,
    KARDEX_BLUE_3,
    KARDEX_GREEN_3,
    KARDEX_SAND_1,
    KARDEX_RED_1,
];

// Priority Colors
export const KARDEX_PRIORITY_COLORS = {
    LOW: KARDEX_GREEN_1,
    MEDIUM: KARDEX_SAND_1,
    HIGH: KARDEX_RED_1,
    CRITICAL: KARDEX_RED_2,
};

// Status Colors
export const KARDEX_STATUS_COLORS = {
    DRAFT: KARDEX_GREY_3,
    OPEN: KARDEX_BLUE_1,
    ASSIGNED: KARDEX_SAND_2,
    IN_PROGRESS: KARDEX_SAND_1,
    QUOTED: KARDEX_BLUE_2,
    NEGOTIATION: KARDEX_SAND_2,
    RESOLVED: KARDEX_GREEN_2,
    WON: KARDEX_GREEN_2,
    CLOSED: KARDEX_GREEN_1,
    LOST: KARDEX_RED_1,
    ON_HOLD: KARDEX_SILVER_1,
    CANCELLED: KARDEX_GREY_3,
    ESCALATED: KARDEX_RED_2,
};

// Helper function to get Tailwind-compatible background class
export const getKardexBgClass = (color: string, opacity: number = 100) => {
    return `bg-[${color}]${opacity < 100 ? `/${opacity}` : ''}`;
};

// Helper function to get Tailwind-compatible text class
export const getKardexTextClass = (color: string) => {
    return `text-[${color}]`;
};

// Helper function to get Tailwind-compatible border class
export const getKardexBorderClass = (color: string, opacity: number = 100) => {
    return `border-[${color}]${opacity < 100 ? `/${opacity}` : ''}`;
};

// Badge color mappings
export const getStatusBadgeClasses = (status: string): string => {
    const colorMap: Record<string, string> = {
        'OPEN': `bg-[${KARDEX_RED_1}]/20 text-[${KARDEX_RED_2}] border-[${KARDEX_RED_1}]/30`,
        'ASSIGNED': `bg-[${KARDEX_SAND_2}]/20 text-[${KARDEX_SAND_3}] border-[${KARDEX_SAND_2}]/30`,
        'IN_PROGRESS': `bg-[${KARDEX_SAND_1}]/20 text-[${KARDEX_SAND_3}] border-[${KARDEX_SAND_1}]/30`,
        'RESOLVED': `bg-[${KARDEX_GREEN_2}]/20 text-[${KARDEX_GREEN_3}] border-[${KARDEX_GREEN_2}]/30`,
        'CLOSED': `bg-[${KARDEX_GREEN_1}]/20 text-[${KARDEX_GREEN_3}] border-[${KARDEX_GREEN_1}]/30`,
        'ON_HOLD': `bg-[${KARDEX_GREY_3}]/20 text-[${KARDEX_SILVER_1}] border-[${KARDEX_GREY_3}]/30`,
        'ESCALATED': `bg-[${KARDEX_RED_2}]/20 text-[${KARDEX_RED_3}] border-[${KARDEX_RED_2}]/30`,
        'WON': `bg-[${KARDEX_GREEN_2}]/20 text-[${KARDEX_GREEN_3}] border-[${KARDEX_GREEN_2}]/30`,
        'LOST': `bg-[${KARDEX_RED_1}]/20 text-[${KARDEX_RED_2}] border-[${KARDEX_RED_1}]/30`,
    };
    return colorMap[status] || `bg-[${KARDEX_GREY_3}]/20 text-[${KARDEX_SILVER_1}] border-[${KARDEX_GREY_3}]/30`;
};

export const getPriorityBadgeClasses = (priority: string): string => {
    const colorMap: Record<string, string> = {
        'LOW': `bg-[${KARDEX_GREEN_1}]/20 text-[${KARDEX_GREEN_3}] border-[${KARDEX_GREEN_1}]/30`,
        'MEDIUM': `bg-[${KARDEX_SAND_1}]/20 text-[${KARDEX_SAND_3}] border-[${KARDEX_SAND_1}]/30`,
        'HIGH': `bg-[${KARDEX_SAND_2}]/20 text-[${KARDEX_SAND_3}] border-[${KARDEX_SAND_2}]/30`,
        'CRITICAL': `bg-[${KARDEX_RED_1}]/20 text-[${KARDEX_RED_2}] border-[${KARDEX_RED_1}]/30`,
    };
    return colorMap[priority] || `bg-[${KARDEX_GREY_3}]/20 text-[${KARDEX_SILVER_1}] border-[${KARDEX_GREY_3}]/30`;
};

// Gradient definitions
export const KARDEX_GRADIENTS = {
    primary: `from-[${KARDEX_BLUE_1}] to-[${KARDEX_BLUE_2}]`,
    primaryDark: `from-[${KARDEX_BLUE_2}] to-[${KARDEX_BLUE_3}]`,
    secondary: `from-[${KARDEX_GREEN_1}] to-[${KARDEX_GREEN_2}]`,
    secondaryDark: `from-[${KARDEX_GREEN_2}] to-[${KARDEX_GREEN_3}]`,
    warning: `from-[${KARDEX_SAND_1}] to-[${KARDEX_SAND_2}]`,
    error: `from-[${KARDEX_RED_1}] to-[${KARDEX_RED_2}]`,
    silver: `from-[${KARDEX_SILVER_2}] to-[${KARDEX_SILVER_3}]`,
};

export default KARDEX_COLORS;
