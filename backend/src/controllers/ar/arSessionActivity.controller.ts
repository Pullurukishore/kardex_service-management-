import { Request } from 'express';
import prisma from '../../config/db';

// Session action types
export type SessionAction = 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'SESSION_EXPIRED' | 'PASSWORD_RESET';

interface LogSessionParams {
    action: SessionAction;
    userId?: number | null;
    userName?: string | null;
    userEmail?: string | null;
    userRole?: string | null;
    financeRole?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, any>;
}

/**
 * Parse user agent string to get device info
 */
const parseUserAgent = (userAgent?: string): string => {
    if (!userAgent) return 'Unknown';

    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Detect browser
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    return `${browser} on ${os}`;
};

/**
 * Get IP address from request
 */
export const getIpFromRequest = (req: Request): string | null => {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket?.remoteAddress ||
        req.ip ||
        null;
};

/**
 * Log a session activity (login, logout, etc.)
 */
export const logSessionActivity = async (params: LogSessionParams) => {
    try {
        await prisma.aRSessionActivityLog.create({
            data: {
                action: params.action,
                userId: params.userId || null,
                userName: params.userName || null,
                userEmail: params.userEmail || null,
                userRole: params.userRole || null,
                financeRole: params.financeRole || null,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
                deviceInfo: parseUserAgent(params.userAgent || undefined),
                metadata: params.metadata || undefined
            }
        });
    } catch (error) {
        // Log error but don't throw - session logging should not break auth flow
        console.error('Failed to log session activity:', error);
    }
};

/**
 * Helper to extract session info from request for logging
 */
export const getSessionInfoFromRequest = (req: Request) => {
    return {
        ipAddress: getIpFromRequest(req),
        userAgent: req.headers['user-agent'] || null
    };
};
