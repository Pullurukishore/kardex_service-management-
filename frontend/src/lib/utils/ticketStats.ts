import { Ticket, TicketStats, TicketStatus, Priority } from '@/types/ticket';

/**
 * Calculate ticket statistics from a list of tickets
 * This utility can be used by both server and client components
 */
export function calculateTicketStats(tickets: Ticket[]): TicketStats {
  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
    assigned: tickets.filter(t => 
      t.status === TicketStatus.ASSIGNED || t.status === TicketStatus.IN_PROGRESS
    ).length,
    closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
    critical: tickets.filter(t => t.priority === Priority.CRITICAL).length,
  };
}
