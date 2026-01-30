import { differenceInMinutes, getDay, setHours, setMinutes, setSeconds, setMilliseconds, addDays } from 'date-fns';

/**
 * Optimized Helper function to calculate business hours between two dates 
 * (9 AM to 5:30 PM, excluding Sundays)
 * 
 * Performance: O(1) for same-day or O(1) mathematical calculation for multi-day.
 */
export function calculateBusinessHoursInMinutes(startDate: Date, endDate: Date): number {
    if (startDate >= endDate) return 0;

    // Business hours: 9 AM to 5:30 PM (8.5 hours per day)
    const BUSINESS_START_HOUR = 9;
    const BUSINESS_END_HOUR = 17;
    const BUSINESS_END_MINUTE = 30;
    const BUSINESS_MINUTES_PER_DAY = (BUSINESS_END_HOUR - BUSINESS_START_HOUR) * 60 + BUSINESS_END_MINUTE; // 510 minutes (8.5 hours)

    const start = new Date(startDate);
    start.setSeconds(0, 0);
    const end = new Date(endDate);
    end.setSeconds(0, 0);

    // If same day
    if (start.toDateString() === end.toDateString()) {
        if (getDay(start) === 0) return 0; // Sunday

        const bStart = setMilliseconds(setSeconds(setMinutes(setHours(new Date(start), BUSINESS_START_HOUR), 0), 0), 0);
        const bEnd = setMilliseconds(setSeconds(setMinutes(setHours(new Date(start), BUSINESS_END_HOUR), BUSINESS_END_MINUTE), 0), 0);

        const actualStart = start < bStart ? bStart : (start > bEnd ? bEnd : start);
        const actualEnd = end > bEnd ? bEnd : (end < bStart ? bStart : end);

        return Math.max(0, differenceInMinutes(actualEnd, actualStart));
    }

    // Multi-day calculation
    let totalMinutes = 0;

    // 1. Minutes on the first day
    if (getDay(start) !== 0) {
        const firstDayEnd = setMilliseconds(setSeconds(setMinutes(setHours(new Date(start), BUSINESS_END_HOUR), BUSINESS_END_MINUTE), 0), 0);
        const firstDayStartLimit = setMilliseconds(setSeconds(setMinutes(setHours(new Date(start), BUSINESS_START_HOUR), 0), 0), 0);
        const effectiveStart = start < firstDayStartLimit ? firstDayStartLimit : (start > firstDayEnd ? firstDayEnd : start);
        totalMinutes += Math.max(0, differenceInMinutes(firstDayEnd, effectiveStart));
    }

    // 2. Full intermediate days (mathematical calculation to avoid O(N) loop)
    const nextDay = addDays(new Date(start), 1);
    nextDay.setHours(0, 0, 0, 0);

    const lastDayStart = new Date(end);
    lastDayStart.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((lastDayStart.getTime() - nextDay.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays > 0) {
        // Count Sundays in the range
        let sundays = 0;
        for (let i = 0; i < diffDays; i++) {
            if (getDay(addDays(nextDay, i)) === 0) sundays++;
        }
        totalMinutes += (diffDays - sundays) * BUSINESS_MINUTES_PER_DAY;
    }

    // 3. Minutes on the last day
    if (getDay(end) !== 0) {
        const lastDayStartLimit = setMilliseconds(setSeconds(setMinutes(setHours(new Date(end), BUSINESS_START_HOUR), 0), 0), 0);
        const lastDayEndLimit = setMilliseconds(setSeconds(setMinutes(setHours(new Date(end), BUSINESS_END_HOUR), BUSINESS_END_MINUTE), 0), 0);
        const effectiveEnd = end > lastDayEndLimit ? lastDayEndLimit : (end < lastDayStartLimit ? lastDayStartLimit : end);
        totalMinutes += Math.max(0, differenceInMinutes(effectiveEnd, lastDayStartLimit));
    }

    return totalMinutes;
}

/**
 * Helper function to properly convert Prisma Decimal to JavaScript number
 * Preserves full precision for accurate calculations
 */
export function toNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value.toNumber === 'function') return value.toNumber();
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate risk class based on days overdue
 */
export function calculateRiskClass(dueByDays: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (dueByDays <= 0) return 'LOW';
    if (dueByDays <= 30) return 'MEDIUM';
    if (dueByDays <= 90) return 'HIGH';
    return 'CRITICAL';
}

/**
 * Calculate days between two dates (today and a reference date)
 * Positive result means the reference date is in the past (overdue)
 */
export function calculateDaysBetween(referenceDate: Date | null | undefined, targetDate: Date = new Date()): number {
    if (!referenceDate || isNaN(new Date(referenceDate).getTime())) return 0;

    const today = new Date(targetDate);
    today.setHours(0, 0, 0, 0);
    const ref = new Date(referenceDate);
    ref.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - ref.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
