"use client";

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface CreateTicketButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string; // Optional custom redirect path
}

export default function CreateTicketButton({ 
  variant = 'default', 
  size = 'default',
  className = '',
  children,
  redirectTo 
}: CreateTicketButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    // If custom redirect is provided, use it
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    // Auto-detect the correct route based on current path
    if (pathname.startsWith('/zone')) {
      router.push('/zone/tickets/create');
    } else if (pathname.startsWith('/admin')) {
      router.push('/admin/tickets/create');
    } else if (pathname.startsWith('/service-person')) {
      router.push('/service-person/tickets/create');
    } else {
      // Default fallback to admin
      router.push('/admin/tickets/create');
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleClick}
    >
      <Plus className="mr-2 h-4 w-4" />
      {children || 'New Ticket'}
    </Button>
  );
}
