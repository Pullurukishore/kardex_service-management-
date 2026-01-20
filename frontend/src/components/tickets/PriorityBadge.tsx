import { Priority } from '@/types/ticket';
import { cn } from '@/lib/utils';

// Using Kardex Official Company Colors
// Greens: #A2B9AF, #82A094, #4F6A64 (low priority - success tone)
// Sands: #EEC1BF, #CE9F6B, #976E44 (medium priority - warning tone)
// Reds: #E17F70, #9E3B47, #75242D (high/critical priority - danger tone)

const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: 'bg-[#A2B9AF]/20 text-[#4F6A64]',
  [Priority.MEDIUM]: 'bg-[#CE9F6B]/20 text-[#976E44]',
  [Priority.HIGH]: 'bg-[#E17F70]/20 text-[#9E3B47]',
  [Priority.CRITICAL]: 'bg-[#9E3B47]/20 text-[#75242D]',
};

const priorityLabels: Record<Priority, string> = {
  [Priority.LOW]: 'Low',
  [Priority.MEDIUM]: 'Medium',
  [Priority.HIGH]: 'High',
  [Priority.CRITICAL]: 'Critical',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        priorityColors[priority as keyof typeof priorityColors] || 'bg-[#AEBFC3]/20 text-[#5D6E73]'
      )}
    >
      {priorityLabels[priority as keyof typeof priorityLabels] || priority}
    </span>
  );
}
