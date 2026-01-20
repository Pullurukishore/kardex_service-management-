// Helper to format numbers with commas
export const formatNumber = (num: number | string) => {
  const number = typeof num === 'string' ? parseFloat(num) || 0 : num;
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Kardex Company Colors
// Blues: #96AEC2 (Blue 1), #6F8A9D (Blue 2), #546A7A (Blue 3)
// Greens: #A2B9AF (Green 1), #82A094 (Green 2), #4F6A64 (Green 3)
// Sands: #EEC18F (Sand 1), #CE9F6B (Sand 2), #976E44 (Sand 3)
// Reds: #E17F70 (Red 1), #9E3B47 (Red 2), #75242D (Red 3)
// Greys: #AEBFC3 (Grey 1), #A8ACA9 (Grey 2), #979796 (Grey 3)
// Silvers: #757777 (Silver 1), #92A2A5 (Silver 2), #5D6E73 (Silver 3)

// Get status color for badges
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open': return 'bg-[#96AEC2]/20 text-[#546A7A]';           // Blue 1
    case 'in_progress': return 'bg-[#EEC18F]/20 text-[#976E44]';   // Sand 1
    case 'waiting_customer': return 'bg-[#CE9F6B]/20 text-[#976E44]'; // Sand 2
    case 'resolved': case 'closed': return 'bg-[#82A094]/20 text-[#4F6A64]'; // Green 2
    case 'assigned': return 'bg-[#6F8A9D]/20 text-[#546A7A]';      // Blue 2
    default: return 'bg-[#979796]/20 text-[#757777]';              // Grey 3
  }
};

// Get priority color for badges
export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical': return 'bg-[#9E3B47]/20 text-[#75242D]';      // Red 2
    case 'high': return 'bg-[#E17F70]/20 text-[#9E3B47]';          // Red 1
    case 'medium': return 'bg-[#EEC18F]/20 text-[#976E44]';        // Sand 1
    case 'low': return 'bg-[#A2B9AF]/20 text-[#4F6A64]';           // Green 1
    default: return 'bg-[#979796]/20 text-[#757777]';              // Grey 3
  }
};

// Format date for display
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format time duration
export const formatDuration = (hours: number, minutes: number) => {
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);
  return parts.join(' ');
};

// Format change percentage
export const formatChange = (change: number, isPositive: boolean) => {
  if (change === 0) return 'No change';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change}% vs last period`;
};

// Get status badge color (duplicate for compatibility)
export const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open': return 'bg-[#96AEC2]/20 text-[#546A7A]';           // Blue 1
    case 'in_progress': return 'bg-[#EEC18F]/20 text-[#976E44]';   // Sand 1
    case 'waiting_customer': return 'bg-[#CE9F6B]/20 text-[#976E44]'; // Sand 2
    case 'resolved':
    case 'closed': return 'bg-[#82A094]/20 text-[#4F6A64]';        // Green 2
    case 'assigned': return 'bg-[#6F8A9D]/20 text-[#546A7A]';      // Blue 2
    default: return 'bg-[#979796]/20 text-[#757777]';              // Grey 3
  }
};

// Get priority badge color (duplicate for compatibility)
export const getPriorityBadgeColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical': return 'bg-[#9E3B47]/20 text-[#75242D]';      // Red 2
    case 'high': return 'bg-[#E17F70]/20 text-[#9E3B47]';          // Red 1
    case 'medium': return 'bg-[#EEC18F]/20 text-[#976E44]';        // Sand 1
    case 'low': return 'bg-[#A2B9AF]/20 text-[#4F6A64]';           // Green 1
    default: return 'bg-[#979796]/20 text-[#757777]';              // Grey 3
  }
};
