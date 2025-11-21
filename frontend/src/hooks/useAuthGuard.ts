import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';

export const useAuthGuard = (requiredRoles?: UserRole | UserRole[], redirectPath = '/auth/login') => {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();
  const lastRedirectTime = useRef(0);

  useEffect(() => {
    if (isLoading) return;

    // Add cooldown to prevent rapid redirects
    const now = Date.now();
    if (now - lastRedirectTime.current < 5000) { // 5 second cooldown
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      lastRedirectTime.current = now;
      const callbackUrl = encodeURIComponent(window.location.pathname);
      router.push(`${redirectPath}?callbackUrl=${callbackUrl}`);
      return;
    }

    // Check roles if required
    if (requiredRoles && !hasPermission(requiredRoles)) {
      // Add cooldown for role-based redirects too
      lastRedirectTime.current = now;
      
      // Redirect to dashboard based on user role
      const getRoleBasedPath = (role?: UserRole): string => {
        switch (role) {
          case UserRole.ADMIN:
            return '/admin/dashboard';
          case UserRole.ZONE_USER:
            return '/zone/dashboard';
          case UserRole.SERVICE_PERSON:
            return '/service-person/dashboard';
          case UserRole.EXTERNAL_USER:
            return '/external/tickets';
          default:
            return '/';
        }
      };
      
      const defaultPath = getRoleBasedPath(user?.role);
      router.push(defaultPath);
    }
  }, [isAuthenticated, isLoading, requiredRoles, router, redirectPath, hasPermission, user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasPermission,
  };
};

export default useAuthGuard;
