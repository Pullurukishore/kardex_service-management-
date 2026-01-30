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
import { HardDrive, Plus, Loader2 } from 'lucide-react';

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomerName?: string;
  newAsset: {
    assetName: string;
    machineSerialNumber: string;
    model: string;
  };
  setNewAsset: (asset: any) => void;
  onConfirm: () => Promise<void>;
  isCreating: boolean;
}

export default function AddAssetDialog({
  open,
  onOpenChange,
  selectedCustomerName,
  newAsset,
  setNewAsset,
  onConfirm,
  isCreating,
}: AddAssetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-[#6F8A9D] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
              Add New Asset
            </DialogTitle>
            <DialogDescription className="text-cyan-100 mt-2 text-base">
              Create a new asset for <span className="font-semibold text-white">{selectedCustomerName}</span>
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6 space-y-5 bg-gradient-to-b from-[#AEBFC3]/10 to-white">
          <div className="space-y-2">
            <Label htmlFor="assetName" className="font-medium text-sm">Asset Name / Machine ID <span className="text-[#E17F70]">*</span></Label>
            <Input
              id="assetName"
              value={newAsset.assetName}
              onChange={(e) => setNewAsset((prev: any) => ({ ...prev, assetName: e.target.value }))}
              placeholder="Enter machine ID or name"
              className="h-12 border-2 rounded-xl focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="machineSerialNumber" className="font-medium text-sm">Serial Number <span className="text-[#E17F70]">*</span></Label>
            <Input
              id="machineSerialNumber"
              value={newAsset.machineSerialNumber}
              onChange={(e) => setNewAsset((prev: any) => ({ ...prev, machineSerialNumber: e.target.value }))}
              placeholder="Enter serial number"
              className="h-12 border-2 rounded-xl focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assetModel" className="font-medium text-sm">Model</Label>
            <Input
              id="assetModel"
              value={newAsset.model}
              onChange={(e) => setNewAsset((prev: any) => ({ ...prev, model: e.target.value }))}
              placeholder="Enter model (optional)"
              className="h-12 border-2 rounded-xl focus:border-cyan-500 transition-colors"
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
                setNewAsset({ assetName: '', machineSerialNumber: '', model: '' });
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
              className="px-6 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-[#6F8A9D] hover:from-cyan-700 hover:to-[#546A7A] shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Asset
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
