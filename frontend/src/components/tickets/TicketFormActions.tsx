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
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-slate-50 to-gray-100 overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-500 to-rose-500"></div>
      
      <CardContent className="p-6">
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Validation status */}
          <div className="flex items-center gap-3">
            {isFormValid ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Ready to submit</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Please complete all required fields</span>
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
              className="hover:bg-gray-100 border-gray-300 shadow-sm transition-all duration-200 hover:scale-[1.02]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !isFormValid}
              className="bg-gradient-to-r from-red-600 via-orange-600 to-rose-600 hover:from-red-700 hover:via-orange-700 hover:to-rose-700 shadow-lg hover:shadow-xl text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
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
