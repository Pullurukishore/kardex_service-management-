'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Ticket, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface TicketFormHeaderProps {
  onBack: () => void;
  isSubmitting?: boolean;
}

export function TicketFormHeader({ onBack, isSubmitting = false }: TicketFormHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#9E3B47] via-[#976E44] to-[#75242D] p-6 sm:p-8 text-white shadow-2xl">
      {/* Animated background orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#CE9F6B]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[#E17F70]/15 rounded-full blur-2xl"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          {/* Icon container with glassmorphism */}
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-2 ring-white/30 shadow-xl">
              <Ticket className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-yellow-400 to-[#CE9F6B] flex items-center justify-center shadow-lg">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                NEW TICKET
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Support Ticket</h1>
            <p className="text-[#E17F70] mt-1 max-w-md">
              Submit a new support request with detailed information for faster resolution
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
