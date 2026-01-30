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
import { Users, Plus, Loader2 } from 'lucide-react';

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomerName?: string;
  newContact: {
    name: string;
    email: string;
    phone: string;
  };
  setNewContact: (contact: any) => void;
  onConfirm: () => Promise<void>;
  isCreating: boolean;
}

export default function AddContactDialog({
  open,
  onOpenChange,
  selectedCustomerName,
  newContact,
  setNewContact,
  onConfirm,
  isCreating,
}: AddContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              Add New Contact
            </DialogTitle>
            <DialogDescription className="text-[#6F8A9D] mt-2 text-base">
              Create a new contact for <span className="font-semibold text-white">{selectedCustomerName}</span>
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6 space-y-5 bg-gradient-to-b from-[#AEBFC3]/10 to-white">
          <div className="space-y-2">
            <Label htmlFor="contactName" className="font-medium text-sm">Name <span className="text-[#E17F70]">*</span></Label>
            <Input
              id="contactName"
              value={newContact.name}
              onChange={(e) => setNewContact((prev: any) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter contact name"
              className="h-12 border-2 rounded-xl focus:border-[#6F8A9D] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="font-medium text-sm">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact((prev: any) => ({ ...prev, email: e.target.value }))}
              placeholder="contact@example.com"
              className="h-12 border-2 rounded-xl focus:border-[#6F8A9D] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="font-medium text-sm">Phone <span className="text-[#E17F70]">*</span></Label>
            <Input
              id="contactPhone"
              value={newContact.phone}
              onChange={(e) => setNewContact((prev: any) => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="h-12 border-2 rounded-xl focus:border-[#6F8A9D] transition-colors"
            />
          </div>
        </div>
        <div className="p-5 bg-[#AEBFC3]/10 border-t">
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setNewContact({ name: '', email: '', phone: '' });
              }}
              disabled={isCreating}
              className="px-6 h-12 rounded-xl border-2 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isCreating}
              className="px-6 h-12 rounded-xl bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] hover:from-[#546A7A] hover:to-[#546A7A] shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Contact
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
