import { UserRole } from '@/types/user.types';

export function getRoleBasedRedirect(role?: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.EXPERT_HELPDESK:
      return '/expert/dashboard';
    case UserRole.SERVICE_PERSON:
      return '/service-person/dashboard';
    case UserRole.ZONE_USER:
      return '/zone/dashboard';
    case UserRole.EXTERNAL_USER:
      return '/external/tickets';  // External users only see tickets, not dashboard
    default:
      return '/dashboard';
  }
}

export function isRouteAccessible(route: string, userRole?: UserRole): boolean {
  // Public routes accessible to everyone
  const publicRoutes = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];
  if (publicRoutes.includes(route)) return true;

  // If no role is provided, only public routes are accessible
  if (!userRole) return false;

  // Common routes accessible to all authenticated users
  const commonAuthenticatedRoutes = ['/module-select', '/fsm', '/finance'];
  if (commonAuthenticatedRoutes.some(prefix => route.startsWith(prefix))) return true;

  // Role-based route access
  const roleRoutes: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: ['/admin', '/api/admin', '/admin/FSA', '/api/assets', '/api/customers', '/api/zone-users', '/api/tickets'],
    [UserRole.ZONE_MANAGER]: ['/zone-manager', '/api/zone-manager', '/zone', '/api/zone', '/api/tickets'],
    [UserRole.SERVICE_PERSON]: ['/service-person', '/api/service-person', '/api/tickets'],
    [UserRole.ZONE_USER]: ['/zone', '/api/zone', '/api/tickets'],
    [UserRole.EXPERT_HELPDESK]: ['/expert', '/api/expert', '/api/tickets', '/api/offers'],
    [UserRole.EXTERNAL_USER]: ['/external', '/api/external', '/api/tickets'],
  };

  // Get allowed routes for the user's role
  const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];

  // Check if the route starts with any of the allowed paths for the user's role
  return allowedRoutes.some(prefix => route.startsWith(prefix));
}

export function shouldRedirectToLogin(route: string): boolean {
  const publicRoutes = ['/auth/login', '/auth/forgot-password', '/auth/reset-password', '/_next', '/favicon.ico', '/api/auth', '/'];
  return !publicRoutes.some(publicRoute => route.startsWith(publicRoute));
}
