import { Customer, CustomerStats } from '@/types/customer';

/**
 * Calculate customer statistics from a list of customers
 * This utility can be used by both server and client components
 */
export function calculateCustomerStats(customers: Customer[]): CustomerStats {
  return {
    total: customers.length,
    active: customers.filter(c => c.isActive).length,
    inactive: customers.filter(c => !c.isActive).length,
    totalAssets: customers.reduce((sum, c) => sum + (c._count?.assets || 0), 0),
    totalTickets: customers.reduce((sum, c) => sum + (c._count?.tickets || 0), 0)
  };
}
