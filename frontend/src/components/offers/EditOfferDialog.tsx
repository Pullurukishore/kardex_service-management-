'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EditOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingOffer: any
}

export default function EditOfferDialog({ open, onOpenChange, editingOffer }: EditOfferDialogProps) {
  if (!editingOffer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Offer</DialogTitle>
          <DialogDescription>
            Make changes to the offer details here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right">
              Customer
            </Label>
            <Input
              id="customer"
              defaultValue={editingOffer.customer?.companyName || editingOffer.company}
              className="col-span-3 border-[#92A2A5]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value
            </Label>
            <Input
              id="value"
              type="number"
              defaultValue={editingOffer.offerValue}
              className="col-span-3 border-[#92A2A5]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => onOpenChange(false)} className="bg-[#82A094] hover:bg-[#4F6A64]">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
