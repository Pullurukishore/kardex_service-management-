import { cn } from '@/lib/utils';

type TicketStatus = string;

// Using Kardex Official Company Colors
// Blues: #96AEC2, #6F8A9D, #546A7A (open/info states)
// Greens: #A2B9AF, #82A094, #4F6A64 (success/complete states)
// Sands: #EEC1BF, #CE9F6B, #976E44 (pending/warning states)
// Reds: #E17F70, #9E3B47, #75242D (error/critical states)
// Greys: #AEBFC3, #92A2A5, #5D6E73 (neutral/disabled states)

const statusColors: Record<string, string> = {
  // Open states - Kardex Blue
  'OPEN': 'bg-[#96AEC2]/20 text-[#546A7A]',
  'REOPENED': 'bg-[#96AEC2]/20 text-[#546A7A]',
  
  // Assigned states - Kardex Blue 2
  'ASSIGNED': 'bg-[#6F8A9D]/20 text-[#546A7A]',
  
  // In Progress/Pending states - Kardex Sand
  'IN_PROGRESS': 'bg-[#CE9F6B]/20 text-[#976E44]',
  'WAITING_CUSTOMER': 'bg-[#EEC1BF]/20 text-[#976E44]',
  'ON_HOLD': 'bg-[#ABACA9]/20 text-[#757777]',
  
  // Onsite visit states - Kardex Blue 3
  'ONSITE_VISIT': 'bg-[#546A7A]/20 text-[#546A7A]',
  'ONSITE_VISIT_PLANNED': 'bg-[#546A7A]/20 text-[#546A7A]',
  'ONSITE_VISIT_STARTED': 'bg-[#6F8A9D]/20 text-[#546A7A]',
  'ONSITE_VISIT_REACHED': 'bg-[#6F8A9D]/25 text-[#546A7A]',
  'ONSITE_VISIT_IN_PROGRESS': 'bg-[#CE9F6B]/20 text-[#976E44]',
  'ONSITE_VISIT_RESOLVED': 'bg-[#82A094]/20 text-[#4F6A64]',
  'ONSITE_VISIT_PENDING': 'bg-[#EEC1BF]/20 text-[#976E44]',
  'ONSITE_VISIT_COMPLETED': 'bg-[#82A094]/25 text-[#4F6A64]',
  
  // PO/Spare Parts states - Kardex Sand 2
  'PO_NEEDED': 'bg-[#CE9F6B]/20 text-[#976E44]',
  'PO_REACHED': 'bg-[#CE9F6B]/25 text-[#976E44]',
  'PO_RECEIVED': 'bg-[#A2B9AF]/20 text-[#4F6A64]',
  'SPARE_PARTS_NEEDED': 'bg-[#CE9F6B]/20 text-[#976E44]',
  'SPARE_PARTS_BOOKED': 'bg-[#CE9F6B]/25 text-[#976E44]',
  'SPARE_PARTS_DELIVERED': 'bg-[#A2B9AF]/20 text-[#4F6A64]',
  
  // Closed/Complete states - Kardex Green
  'CLOSED_PENDING': 'bg-[#92A2A5]/20 text-[#5D6E73]',
  'CLOSED': 'bg-[#82A094]/20 text-[#4F6A64]',
  'RESOLVED': 'bg-[#A2B9AF]/20 text-[#4F6A64]',
  
  // Error/Cancel states - Kardex Red
  'CANCELLED': 'bg-[#E17F70]/20 text-[#75242D]',
  'ESCALATED': 'bg-[#9E3B47]/20 text-[#75242D]',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusColors[status as keyof typeof statusColors] || 'bg-[#AEBFC3]/20 text-[#5D6E73]'
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
