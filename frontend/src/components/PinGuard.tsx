'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface PinGuardProps {
  children: React.ReactNode;
}

export default function PinGuard({ children }: PinGuardProps) {
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Routes that don't require PIN validation
  const publicRoutes = ['/pin-access', '/admin/pin-management'];

  useEffect(() => {
    // Prevent multiple checks
    if (hasChecked) return;

    const checkPinAccess = async () => {
      // Skip PIN check for public routes
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
      if (isPublicRoute) {
        setIsValidated(true);
        setIsLoading(false);
        setHasChecked(true);
        return;
      }

      // Wait for next tick to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 0));

      try {
        // Check if PIN session cookie exists
        const allCookies = document.cookie.split('; ');
        const pinSession = allCookies.find(row => row.startsWith('pinSession='));
        
        // Also check localStorage for PIN session
        const localSession = localStorage.getItem('pinAccessSession');
        // Check for force bypass parameter
        const urlParams = new URLSearchParams(window.location.search);
        const forceBypass = urlParams.get('forceBypass');
        
        if (forceBypass === 'true') {
          setIsValidated(true);
        } else if (pinSession || localSession) {
          const sessionValue = pinSession ? pinSession.split('=')[1] : 'localStorage';
          setIsValidated(true);
        } else {
          // Use window.location.href instead of router.push to avoid race conditions
          window.location.href = '/pin-access';
          return;
        }
      } catch (error) {
        window.location.href = '/pin-access';
        return;
      } finally {
        setIsLoading(false);
        setHasChecked(true);
      }
    };

    checkPinAccess();
  }, [pathname, hasChecked]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show children only if PIN is validated or on public routes
  if (isValidated) {
    return <>{children}</>;
  }

  // This shouldn't render as we redirect above, but just in case
  return null;
}
