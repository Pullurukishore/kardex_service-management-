'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil as Edit, Save, Loader2 } from 'lucide-react';

interface EditOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOffer: any;
  onSave?: (data: any) => Promise<void>;
  isUpdating?: boolean;
}

export default function EditOfferDialog({ 
  open, 
  onOpenChange, 
  editingOffer,
  onSave,
  isUpdating = false
}: EditOfferDialogProps) {
  if (!editingOffer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 rounded-2xl border-0 shadow-2xl overflow-hidden max-w-md">
        <div className="bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Edit className="h-6 w-6 text-white" />
              </div>
              Edit Quick Details
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-2 text-base">
              Update basic information for <span className="font-semibold text-white">{editingOffer.offerReferenceNumber}</span>
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-5 bg-gradient-to-b from-[#AEBFC3]/10 to-white">
          <div className="space-y-2">
            <Label htmlFor="customer" className="font-medium text-sm text-[#546A7A]">
              Customer
            </Label>
            <Input
              id="customer"
              defaultValue={editingOffer.customer?.companyName || editingOffer.company}
              className="h-12 border-2 rounded-xl focus:border-[#6F8A9D] transition-colors"
              readOnly
            />
            <p className="text-[10px] text-[#979796]">Customer cannot be changed from quick edit</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value" className="font-medium text-sm text-[#546A7A]">
              Offer Value (₹)
            </Label>
            <Input
              id="value"
              type="number"
              defaultValue={editingOffer.offerValue}
              className="h-12 border-2 rounded-xl focus:border-[#6F8A9D] transition-colors"
            />
          </div>
        </div>

        <div className="p-5 bg-[#AEBFC3]/10 border-t">
          <DialogFooter className="gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
              className="px-6 h-12 rounded-xl border-2 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={() => onOpenChange(false)} 
              disabled={isUpdating}
              className="px-6 h-12 rounded-xl bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] hover:from-[#546A7A] hover:to-[#546A7A] shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
