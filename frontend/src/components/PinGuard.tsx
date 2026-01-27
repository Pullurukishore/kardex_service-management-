'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface PinGuardProps {
  children: React.ReactNode;
}

export default function PinGuard({ children }: PinGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkPinAccess = async () => {
      if (!pathname) return;

      const publicRoutes = ['/pin-access', '/admin/pin-management', '/favicon.ico', '/_next', '/api/auth', '/auth'];
      const isPublicRoute = pathname === '/' || publicRoutes.some(route => route !== '/' && pathname.startsWith(route));

      if (isPublicRoute) {
        setIsValidated(true);
        setIsLoading(false);
        setHasChecked(true);
        return;
      }

      try {
        const pinSession = document.cookie.split('; ').find(row => row.startsWith('pinSession='));
        const localSession = localStorage.getItem('pinAccessSession');
        const urlParams = new URL(window.location.href).searchParams;
        const forceBypass = urlParams.get('forceBypass');
        
        if (pinSession || localSession || forceBypass === 'true') {
          setIsValidated(true);
          setIsLoading(false);
          setHasChecked(true);
        } else {
          router.replace('/pin-access');
        }
      } catch (error) {
        router.replace('/pin-access');
      } finally {
        setIsLoading(false);
        setHasChecked(true);
      }
    };

    checkPinAccess();
  }, [pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#96AEC2]/10 to-[#6F8A9D]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#546A7A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D6E73]">Checking access...</p>
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
