import { UserRole } from '@/types/user.types';

/**
 * Manual cookie helper as fallback when cookies-next fails
 */
export const manualGetCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue || null;
    }
    return null;
};

/**
 * Development localStorage token helper with expiration check
 */
export const getDevToken = (): string | null => {
    if (process.env.NODE_ENV !== 'development') return null;

    const token = localStorage.getItem('dev_accessToken');
    const expiry = localStorage.getItem('dev_tokenExpiry');

    if (!token || !expiry) return null;

    const expiryTime = parseInt(expiry);
    const now = Date.now();

    if (now > expiryTime) {
        localStorage.removeItem('dev_accessToken');
        localStorage.removeItem('dev_userRole');
        localStorage.removeItem('dev_rememberMe');
        localStorage.removeItem('dev_tokenExpiry');
        return null;
    }

    return token;
};

/**
 * Manual cookie setter with multiple compatibility fallbacks
 */
export const manualSetCookie = (name: string, value: string, options: any = {}) => {
    if (typeof document === 'undefined') return;

    const expires = options.maxAge
        ? new Date(Date.now() + options.maxAge * 1000)
        : (options.expires || null);

    let cookieString = `${name}=${value}; path=${options.path || '/'}`;
    if (expires) cookieString += `; expires=${expires.toUTCString()}`;
    if (options.maxAge) cookieString += `; max-age=${options.maxAge}`;
    if (options.secure) cookieString += `; secure`;
    if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;

    try {
        document.cookie = cookieString;

        // Check if cookie was set, if not use localStorage as absolute fallback
        setTimeout(() => {
            if (!document.cookie.includes(`${name}=`)) {
                localStorage.setItem(`cookie_${name}`, value);
            }
        }, 10);
    } catch (error) {
        localStorage.setItem(`cookie_${name}`, value);
    }
};

/**
 * Utility to safely convert unknown values to numbers
 */
export const coerceOptionalNumber = (value: unknown): number | null | undefined => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const parsed = typeof value === 'string' ? Number(value) : (value as number);
    return Number.isNaN(parsed as number) ? undefined : (parsed as number);
};

/**
 * Ensures user data has all required fields and normalized values
 */
export const getSafeUser = (userData: any): any => {
    if (!userData) return null;

    let userName = userData.name?.trim();
    if (!userName || userName === '' || userName === 'null' || userName === 'undefined' || userName === 'User') {
        userName = userData.email?.split('@')[0] || 'User';
    }

    return {
        ...userData,
        name: userName,
        isActive: userData.isActive ?? true,
        tokenVersion: userData.tokenVersion || '0',
        lastPasswordChange: userData.lastPasswordChange || new Date().toISOString(),
        zoneId: coerceOptionalNumber(userData.zoneId),
        customerId: coerceOptionalNumber(userData.customerId),
    };
};
