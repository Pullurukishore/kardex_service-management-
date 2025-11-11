import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import ServicePersonDashboardClientFixed from './components/ServicePersonDashboardClientFixed';

// Page metadata for SEO and browser tabs
export const metadata: Metadata = {
  title: 'Dashboard | Service Person | KardexCare',
  description: 'Service person dashboard for managing attendance, activities, and tickets',
  robots: 'noindex, nofollow', // Prevent indexing of authenticated pages
};

// Disable static generation for this page (always server-side render)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Type definitions for better type safety
interface AttendanceData {
  isCheckedIn: boolean;
  attendance?: {
    id: number;
    userId: number;
    checkInAt: string;
    checkOutAt?: string | null;
    status: string;
    totalHours?: number;
  };
  currentActivity?: any;
  stats?: any;
}

interface DashboardData {
  attendance: AttendanceData | null;
}

/**
 * Checks if a JWT token is expired by decoding its payload
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
function isTokenExpired(token: string): boolean {
  try {
    // Decode JWT payload (second part of token)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token has expired (with 1 minute buffer)
    return payload.exp ? payload.exp < (now + 60) : true;
  } catch (error) {
    // If we can't decode the token, assume it's invalid
    return true;
  }
}

/**
 * Fetches service person dashboard data from the backend
 * Implements retry logic for transient failures
 * @param token - Valid JWT authentication token
 * @param retryCount - Current retry attempt (default: 0)
 * @returns Dashboard data or null if fetch fails
 */
async function getServicePersonDashboardData(
  token: string,
  retryCount: number = 0
): Promise<DashboardData | null> {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000; // 1 second

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

    // Fetch attendance status with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const attendanceResponse = await fetch(`${apiUrl}/attendance/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-Source': 'dashboard-ssr',
      },
      cache: 'no-store',
      signal: controller.signal,
      next: { revalidate: 0 }, // Always fetch fresh data
    });

    clearTimeout(timeoutId);

    // Handle authentication errors (token expired/invalid)
    if (attendanceResponse.status === 401) {
      console.error('[Dashboard SSR] Authentication failed - Token expired or invalid');
      redirect('/auth/login');
    }

    // Handle forbidden access
    if (attendanceResponse.status === 403) {
      console.error('[Dashboard SSR] Access forbidden - Insufficient permissions');
      redirect('/auth/login');
    }

    // Handle server errors with retry logic
    if (attendanceResponse.status >= 500) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`[Dashboard SSR] Server error (${attendanceResponse.status}), retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return getServicePersonDashboardData(token, retryCount + 1);
      }
      console.error(`[Dashboard SSR] Server error after ${MAX_RETRIES} retries`);
      return null;
    }

    // Handle other non-OK responses
    if (!attendanceResponse.ok) {
      console.error(`[Dashboard SSR] Failed to fetch attendance status: ${attendanceResponse.status}`);
      return null;
    }

    const attendanceData: AttendanceData = await attendanceResponse.json();
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Dashboard SSR] Attendance data fetched successfully:', {
        isCheckedIn: attendanceData?.isCheckedIn,
        status: attendanceData?.attendance?.status,
        hasActivity: !!attendanceData?.currentActivity,
      });
    }
    
    return {
      attendance: attendanceData
    };
  } catch (error: any) {
    // Handle network errors with retry
    if (error.name === 'AbortError') {
      console.error('[Dashboard SSR] Request timeout');
    } else if (retryCount < MAX_RETRIES && error.message?.includes('fetch')) {
      console.warn(`[Dashboard SSR] Network error, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return getServicePersonDashboardData(token, retryCount + 1);
    } else {
      console.error('[Dashboard SSR] Data fetch error:', error.message || error);
    }
    return null;
  }
}

/**
 * Premium loading component for better UX during page transitions
 * Shows while the server is fetching data
 */
function PremiumLoader() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden"
      role="status"
      aria-label="Loading dashboard"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Triple-ring loading spinner */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        <div className="relative" aria-hidden="true">
          <div className="w-24 h-24 border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin"></div>
          <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-blue-300 border-l-purple-300 rounded-full animate-spin animate-reverse"></div>
          <div className="absolute inset-4 w-8 h-8 border-4 border-transparent border-t-blue-200 border-r-purple-200 rounded-full animate-spin"></div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">KardexCare</h2>
          <p className="text-blue-200 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Service Person Dashboard Page - Server Component
 * 
 * Features:
 * - Server-side authentication and authorization
 * - Token expiration detection before fetch
 * - Automatic retry logic for transient failures
 * - Comprehensive error handling
 * - Type-safe data fetching
 * - Security headers and validation
 * 
 * @returns Service person dashboard page
 */
export default async function ServicePersonDashboardPage() {
  // Server-side authentication check
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const accessToken = cookieStore.get('accessToken')?.value;
  const userRole = cookieStore.get('userRole')?.value;

  // Use accessToken as primary, fallback to token for backwards compatibility
  const authToken = accessToken || token;

  // Validate authentication
  if (!authToken) {
    console.error('[Dashboard SSR] No authentication token found');
    redirect('/auth/login');
  }

  // Validate role authorization
  if (userRole !== 'SERVICE_PERSON') {
    console.error('[Dashboard SSR] Invalid role for service person dashboard:', userRole);
    redirect('/auth/login');
  }

  // Check token expiration BEFORE making API calls
  if (isTokenExpired(authToken)) {
    console.error('[Dashboard SSR] Token has expired, redirecting to login');
    redirect('/auth/login');
  }

  // Fetch initial data (includes retry logic and error handling)
  const dashboardData = await getServicePersonDashboardData(authToken);

  // Even if data fetch fails, render the page with null data
  // Client component will handle the fallback state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden w-full max-w-full relative">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <ServicePersonDashboardClientFixed 
          initialAttendanceData={dashboardData?.attendance ?? null} 
        />
      </div>
    </div>
  );
}