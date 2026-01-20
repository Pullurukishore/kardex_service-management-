'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Loader2, Ticket, Send, ShieldCheck, AlertCircle } from 'lucide-react';

interface TicketFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  isFormValid: boolean;
}

export function TicketFormActions({ isSubmitting, onCancel, isFormValid }: TicketFormActionsProps) {
  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-slate-50 to-[#AEBFC3]/20 overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#E17F70] via-[#CE9F6B] to-[#E17F70]"></div>
      
      <CardContent className="p-6">
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Validation status */}
          <div className="flex items-center gap-3">
            {isFormValid ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#A2B9AF]/10 border border-[#A2B9AF] rounded-lg">
                <ShieldCheck className="h-4 w-4 text-[#4F6A64]" />
                <span className="text-sm font-medium text-[#4F6A64]">Ready to submit</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#CE9F6B]/10 border border-[#CE9F6B]/50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-[#976E44]" />
                <span className="text-sm font-medium text-[#976E44]">Please complete all required fields</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="hover:bg-[#AEBFC3]/20 border-[#92A2A5] shadow-sm transition-all duration-200 hover:scale-[1.02]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !isFormValid}
              className="bg-gradient-to-r from-[#9E3B47] via-[#976E44] to-[#9E3B47] hover:from-red-700 hover:via-orange-700 hover:to-[#75242D] shadow-lg hover:shadow-xl text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="relative mr-2">
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  </div>
                  Creating Ticket...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create Ticket
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
