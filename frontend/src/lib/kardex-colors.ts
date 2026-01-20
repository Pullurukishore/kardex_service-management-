/**
 * KARDEX OFFICIAL COMPANY COLOR PALETTE
 * =====================================
 * 
 * This file contains all approved Kardex brand colors.
 * Use ONLY these colors throughout the project for brand consistency.
 * 
 * Color usage guidelines:
 * - Blues: Headers, primary actions, large areas, links
 * - Greens: Success states, confirmations, secondary elements
 * - Greys: Neutral UI elements, borders, muted text
 * - Silvers: Subtle backgrounds, disabled states, secondary text
 * - Reds: Errors, warnings, destructive actions, critical alerts
 * - Sands: Warm accents, highlights, CTAs, pending states
 */

// ===================================
// PRIMARY COLORS - For large areas & headers
// ===================================

export const kardexBlue = {
    1: '#96AEC2', // Light blue - primary brand color
    2: '#6F8A9D', // Medium blue - secondary
    3: '#546A7A', // Dark blue - emphasis
} as const;

export const kardexGreen = {
    1: '#A2B9AF', // Light green
    2: '#82A094', // Medium green - success states
    3: '#4F6A64', // Dark green - emphasis
} as const;

export const kardexGrey = {
    1: '#AEBFC3', // Light grey
    2: '#92A2A5', // Medium grey
    3: '#5D6E73', // Dark grey
} as const;

export const kardexSilver = {
    1: '#ABACA9', // Light silver
    2: '#979796', // Medium silver
    3: '#757777', // Dark silver
} as const;

// ===================================
// MARKUP COLORS - For CTAs, alerts, highlights
// ===================================

export const kardexRed = {
    1: '#E17F70', // Light red - warnings, alerts
    2: '#9E3B47', // Medium red - errors
    3: '#75242D', // Dark red - critical
} as const;

export const kardexSand = {
    1: '#EEC1BF', // Light sand
    2: '#CE9F6B', // Medium sand - accent, pending
    3: '#976E44', // Dark sand - emphasis
} as const;

// ===================================
// SEMANTIC COLOR MAPPINGS
// ===================================

/** Colors for status indicators */
export const statusColors = {
    // Open/New states - Kardex Blue
    open: {
        bg: 'bg-[#96AEC2]/15',
        text: 'text-[#546A7A]',
        border: 'border-[#96AEC2]',
        solid: 'bg-[#96AEC2]',
    },

    // Success/Complete states - Kardex Green
    success: {
        bg: 'bg-[#82A094]/15',
        text: 'text-[#4F6A64]',
        border: 'border-[#82A094]',
        solid: 'bg-[#82A094]',
    },

    // Warning/Pending states - Kardex Sand
    warning: {
        bg: 'bg-[#CE9F6B]/15',
        text: 'text-[#976E44]',
        border: 'border-[#CE9F6B]',
        solid: 'bg-[#CE9F6B]',
    },

    // Error/Critical states - Kardex Red
    error: {
        bg: 'bg-[#E17F70]/15',
        text: 'text-[#75242D]',
        border: 'border-[#E17F70]',
        solid: 'bg-[#E17F70]',
    },

    // Info states - Kardex Grey
    info: {
        bg: 'bg-[#AEBFC3]/15',
        text: 'text-[#5D6E73]',
        border: 'border-[#92A2A5]',
        solid: 'bg-[#92A2A5]',
    },

    // Neutral/Disabled states - Kardex Silver
    neutral: {
        bg: 'bg-[#ABACA9]/15',
        text: 'text-[#757777]',
        border: 'border-[#979796]',
        solid: 'bg-[#979796]',
    },
} as const;

/** Colors for priority levels */
export const priorityColors = {
    LOW: {
        bg: 'bg-[#A2B9AF]/20',
        text: 'text-[#4F6A64]',
        border: 'border-[#82A094]',
        label: 'Low',
    },
    MEDIUM: {
        bg: 'bg-[#CE9F6B]/20',
        text: 'text-[#976E44]',
        border: 'border-[#CE9F6B]',
        label: 'Medium',
    },
    HIGH: {
        bg: 'bg-[#E17F70]/20',
        text: 'text-[#9E3B47]',
        border: 'border-[#E17F70]',
        label: 'High',
    },
    CRITICAL: {
        bg: 'bg-[#9E3B47]/20',
        text: 'text-[#75242D]',
        border: 'border-[#9E3B47]',
        label: 'Critical',
    },
} as const;

/** Colors for ticket statuses */
export const ticketStatusColors = {
    OPEN: {
        bg: 'bg-[#96AEC2]/20',
        text: 'text-[#546A7A]',
        border: 'border-[#96AEC2]',
    },
    ASSIGNED: {
        bg: 'bg-[#6F8A9D]/20',
        text: 'text-[#546A7A]',
        border: 'border-[#6F8A9D]',
    },
    IN_PROGRESS: {
        bg: 'bg-[#CE9F6B]/20',
        text: 'text-[#976E44]',
        border: 'border-[#CE9F6B]',
    },
    WAITING_CUSTOMER: {
        bg: 'bg-[#EEC1BF]/20',
        text: 'text-[#976E44]',
        border: 'border-[#EEC1BF]',
    },
    RESOLVED: {
        bg: 'bg-[#A2B9AF]/20',
        text: 'text-[#4F6A64]',
        border: 'border-[#A2B9AF]',
    },
    CLOSED: {
        bg: 'bg-[#82A094]/20',
        text: 'text-[#4F6A64]',
        border: 'border-[#82A094]',
    },
    CANCELLED: {
        bg: 'bg-[#E17F70]/20',
        text: 'text-[#75242D]',
        border: 'border-[#E17F70]',
    },
    ESCALATED: {
        bg: 'bg-[#9E3B47]/20',
        text: 'text-[#75242D]',
        border: 'border-[#9E3B47]',
    },
    REOPENED: {
        bg: 'bg-[#96AEC2]/20',
        text: 'text-[#546A7A]',
        border: 'border-[#96AEC2]',
    },
} as const;

/** Colors for zones (use different shades for distinction) */
export const zoneColors = {
    NORTH: {
        bg: 'bg-[#96AEC2]/20',
        text: 'text-[#546A7A]',
        border: 'border-[#96AEC2]',
        solid: '#96AEC2',
    },
    SOUTH: {
        bg: 'bg-[#82A094]/20',
        text: 'text-[#4F6A64]',
        border: 'border-[#82A094]',
        solid: '#82A094',
    },
    EAST: {
        bg: 'bg-[#6F8A9D]/20',
        text: 'text-[#546A7A]',
        border: 'border-[#6F8A9D]',
        solid: '#6F8A9D',
    },
    WEST: {
        bg: 'bg-[#A2B9AF]/20',
        text: 'text-[#4F6A64]',
        border: 'border-[#A2B9AF]',
        solid: '#A2B9AF',
    },
} as const;

/** Chart/Graph color palette (for Recharts, Chart.js, etc.) */
export const chartColors = [
    '#96AEC2', // Blue 1
    '#82A094', // Green 2
    '#6F8A9D', // Blue 2
    '#A2B9AF', // Green 1
    '#546A7A', // Blue 3
    '#4F6A64', // Green 3
    '#CE9F6B', // Sand 2
    '#E17F70', // Red 1
    '#92A2A5', // Grey 2
    '#EEC1BF', // Sand 1
    '#9E3B47', // Red 2
    '#976E44', // Sand 3
] as const;

/** Gradient combinations for headers and cards */
export const gradients = {
    primary: 'bg-gradient-to-r from-[#96AEC2] via-[#6F8A9D] to-[#546A7A]',
    secondary: 'bg-gradient-to-r from-[#A2B9AF] via-[#82A094] to-[#4F6A64]',
    accent: 'bg-gradient-to-r from-[#EEC1BF] via-[#CE9F6B] to-[#976E44]',
    danger: 'bg-gradient-to-r from-[#E17F70] via-[#9E3B47] to-[#75242D]',
    neutral: 'bg-gradient-to-r from-[#AEBFC3] via-[#92A2A5] to-[#5D6E73]',
} as const;

/** Button variants using Kardex colors */
export const buttonColors = {
    primary: {
        bg: 'bg-[#6F8A9D] hover:bg-[#546A7A]',
        text: 'text-white',
    },
    secondary: {
        bg: 'bg-[#82A094] hover:bg-[#4F6A64]',
        text: 'text-white',
    },
    accent: {
        bg: 'bg-[#CE9F6B] hover:bg-[#976E44]',
        text: 'text-white',
    },
    danger: {
        bg: 'bg-[#E17F70] hover:bg-[#9E3B47]',
        text: 'text-white',
    },
    outline: {
        primary: 'border-[#96AEC2] text-[#546A7A] hover:bg-[#96AEC2]/10',
        secondary: 'border-[#82A094] text-[#4F6A64] hover:bg-[#82A094]/10',
        danger: 'border-[#E17F70] text-[#9E3B47] hover:bg-[#E17F70]/10',
    },
} as const;

/** Attendance/Status colors for service personnel */
export const attendanceColors = {
    CHECKED_IN: {
        bg: 'bg-[#82A094]/20',
        text: 'text-[#4F6A64]',
        border: 'border-[#82A094]',
        label: 'Checked In',
    },
    CHECKED_OUT: {
        bg: 'bg-[#92A2A5]/20',
        text: 'text-[#5D6E73]',
        border: 'border-[#92A2A5]',
        label: 'Checked Out',
    },
    ABSENT: {
        bg: 'bg-[#E17F70]/20',
        text: 'text-[#75242D]',
        border: 'border-[#E17F70]',
        label: 'Absent',
    },
    LATE: {
        bg: 'bg-[#CE9F6B]/20',
        text: 'text-[#976E44]',
        border: 'border-[#CE9F6B]',
        label: 'Late',
    },
    EARLY_CHECKOUT: {
        bg: 'bg-[#EEC1BF]/20',
        text: 'text-[#976E44]',
        border: 'border-[#EEC1BF]',
        label: 'Early Checkout',
    },
} as const;

/** Offer/Invoice status colors */
export const offerStatusColors = {
    DRAFT: {
        bg: 'bg-[#AEBFC3]/20',
        text: 'text-[#5D6E73]',
        border: 'border-[#92A2A5]',
    },
    SENT: {
        bg: 'bg-[#96AEC2]/20',
        text: 'text-[#546A7A]',
        border: 'border-[#96AEC2]',
    },
    ACCEPTED: {
        bg: 'bg-[#82A094]/20',
        text: 'text-[#4F6A64]',
        border: 'border-[#82A094]',
    },
    REJECTED: {
        bg: 'bg-[#E17F70]/20',
        text: 'text-[#75242D]',
        border: 'border-[#E17F70]',
    },
    EXPIRED: {
        bg: 'bg-[#CE9F6B]/20',
        text: 'text-[#976E44]',
        border: 'border-[#CE9F6B]',
    },
} as const;

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Get a status color configuration
 */
export function getStatusColor(status: keyof typeof statusColors) {
    return statusColors[status] || statusColors.neutral;
}

/**
 * Get achievement color based on percentage
 */
export function getAchievementColor(percentage: number): string {
    if (percentage >= 100) return `${statusColors.success.bg} ${statusColors.success.text}`;
    if (percentage >= 50) return `${statusColors.warning.bg} ${statusColors.warning.text}`;
    return `${statusColors.error.bg} ${statusColors.error.text}`;
}

/**
 * Get performance color based on score
 */
export function getPerformanceColor(score: number): { bg: string; text: string } {
    if (score >= 80) return { bg: 'bg-[#82A094]/20', text: 'text-[#4F6A64]' };
    if (score >= 60) return { bg: 'bg-[#CE9F6B]/20', text: 'text-[#976E44]' };
    return { bg: 'bg-[#E17F70]/20', text: 'text-[#75242D]' };
}

// Export all colors as a single object for easy access
export const kardexColors = {
    blue: kardexBlue,
    green: kardexGreen,
    grey: kardexGrey,
    silver: kardexSilver,
    red: kardexRed,
    sand: kardexSand,
} as const;

export default kardexColors;
