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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Pencil as Edit, 
  CheckCircle, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  Package,
  TrendingUp,
  AlertCircle,
  Loader2,
  IndianRupee,
} from 'lucide-react';

interface OfferUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: any;
  updateData: any;
  setUpdateData: (updater: any) => void;
  onUpdate: () => Promise<void>;
  updating: boolean;
  allStages: any[];
  stageInfo: Record<string, any>;
}

export default function OfferUpdateDialog({
  open,
  onOpenChange,
  offer,
  updateData,
  setUpdateData,
  onUpdate,
  updating,
  allStages,
  stageInfo,
}: OfferUpdateDialogProps) {
  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-[#6F8A9D] via-[#6F8A9D] to-[#6F8A9D] p-6 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Edit className="h-5 w-5 text-white" />
              </div>
              Update Offer Details
            </DialogTitle>
            <DialogDescription className="text-[#96AEC2] mt-1">
              Update offer information for <span className="font-semibold text-white">{offer?.offerReferenceNumber}</span>
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6 bg-gradient-to-b from-[#AEBFC3]/10 to-white">
          {/* Stage-specific context banner */}
          {updateData.stage && stageInfo[updateData.stage] && (
            <div className={`
              p-4 rounded-xl border-l-4 shadow-sm
              ${stageInfo[updateData.stage].color === 'blue' ? 'bg-gradient-to-r from-[#96AEC2]/10 to-[#96AEC2]/20/50 border-[#6F8A9D]' : ''}
              ${stageInfo[updateData.stage].color === 'indigo' ? 'bg-gradient-to-r from-[#96AEC2]/10 to-[#96AEC2]/20/50 border-[#6F8A9D]' : ''}
              ${stageInfo[updateData.stage].color === 'amber' ? 'bg-gradient-to-r from-[#EEC1BF]/10 to-[#EEC1BF]/20/50 border-[#CE9F6B]' : ''}
              ${stageInfo[updateData.stage].color === 'purple' ? 'bg-gradient-to-r from-[#96AEC2]/10 to-[#96AEC2]/20/50 border-[#6F8A9D]' : ''}
              ${stageInfo[updateData.stage].color === 'green' ? 'bg-gradient-to-r from-[#A2B9AF]/10 to-[#A2B9AF]/20/50 border-[#82A094]' : ''}
              ${stageInfo[updateData.stage].color === 'teal' ? 'bg-gradient-to-r from-[#A2B9AF]/10 to-[#A2B9AF]/20/50 border-teal-500' : ''}
              ${stageInfo[updateData.stage].color === 'red' ? 'bg-gradient-to-r from-[#E17F70]/10 to-red-100/50 border-[#9E3B47]' : ''}
            `}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <span className="text-3xl">{stageInfo[updateData.stage].icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#546A7A] text-lg">
                    {allStages.find(s => s.key === updateData.stage)?.label || updateData.stage} Stage
                  </h4>
                  <p className="text-sm text-[#5D6E73] mt-1 leading-relaxed">
                    {stageInfo[updateData.stage].description}
                  </p>
                  {stageInfo[updateData.stage].requiresAllFields && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#9E3B47] font-medium bg-[#E17F70]/10 px-3 py-1.5 rounded-lg w-fit">
                      <AlertCircle className="h-3.5 w-3.5" />
                      All fields marked with * are required
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Stage Selection Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#AEBFC3]/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#546A7A]/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-[#546A7A]" />
              </div>
              <Label className="text-[#546A7A] font-semibold">Stage <span className="text-[#E17F70]">*</span></Label>
            </div>
            <Select 
              value={updateData.stage} 
              onValueChange={(value) => setUpdateData((prev: any) => ({ ...prev, stage: value }))}
            >
              <SelectTrigger className="h-12 text-base font-medium border-2 border-[#92A2A5] hover:border-indigo-300 focus:border-[#6F8A9D] transition-colors rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allStages.map(stage => (
                  <SelectItem key={stage.key} value={stage.key} className="py-3">
                    <div className="flex items-center gap-2">
                      <span>{stageInfo[stage.key]?.icon || '📄'}</span>
                      <span className="font-medium">{stage.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Offer Title Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#AEBFC3]/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#96AEC2]/20 rounded-lg">
                <FileText className="h-4 w-4 text-[#546A7A]" />
              </div>
              <Label className="text-[#546A7A] font-semibold">Offer Title <span className="text-[#E17F70]">*</span></Label>
            </div>
            <Input 
              value={updateData.title}
              onChange={(e) => setUpdateData((prev: any) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter offer title"
              className="h-12 text-base border-2 border-[#92A2A5] hover:border-[#96AEC2] focus:border-[#6F8A9D] transition-colors rounded-xl"
            />
          </div>

          {/* Offer Reference Date */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#AEBFC3]/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#6F8A9D]/20 rounded-lg">
                <Calendar className="h-4 w-4 text-[#546A7A]" />
              </div>
              <Label className="text-[#546A7A] font-semibold">
                Offer Reference Date {updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && <span className="text-[#E17F70]">*</span>}
              </Label>
            </div>
            <Input 
              type="date"
              value={updateData.offerReferenceDate}
              onChange={(e) => setUpdateData((prev: any) => ({ ...prev, offerReferenceDate: e.target.value }))}
              className={`h-12 text-base border-2 transition-colors rounded-xl ${
                updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && !updateData.offerReferenceDate 
                  ? 'border-[#E17F70] hover:border-red-400' 
                  : 'border-[#92A2A5] hover:border-[#6F8A9D] focus:border-[#6F8A9D]'
              }`}
            />
          </div>

          {/* Financial Details Grid */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#AEBFC3]/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#A2B9AF]/20 rounded-lg">
                <IndianRupee className="h-4 w-4 text-[#4F6A64]" />
              </div>
              <Label className="text-[#546A7A] font-semibold">Financial Details</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#5D6E73]">
                  Offer Value (₹) {updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && <span className="text-[#E17F70]">*</span>}
                </Label>
                <Input 
                  type="number"
                  value={updateData.offerValue}
                  onChange={(e) => setUpdateData((prev: any) => ({ ...prev, offerValue: e.target.value }))}
                  placeholder="Enter amount"
                  className={`h-11 border-2 transition-colors rounded-lg ${
                    updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && !updateData.offerValue 
                      ? 'border-[#E17F70]' 
                      : 'border-[#92A2A5] hover:border-[#82A094] focus:border-[#82A094]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-[#5D6E73]">
                  Win Probability (%) {updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && <span className="text-[#E17F70]">*</span>}
                </Label>
                <Select
                  value={updateData.probabilityPercentage}
                  onValueChange={(value) => setUpdateData((prev: any) => ({ ...prev, probabilityPercentage: value }))}
                >
                  <SelectTrigger className={`h-11 border-2 transition-colors rounded-lg ${
                    updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && !updateData.probabilityPercentage 
                      ? 'border-[#E17F70]' 
                      : 'border-[#92A2A5] hover:border-[#82A094] focus:border-[#82A094]'
                  }`}>
                    <SelectValue placeholder="Select probability" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => (
                      <SelectItem key={value} value={value.toString()}>{value}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#AEBFC3]/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#CE9F6B]/20 rounded-lg">
                <Clock className="h-4 w-4 text-[#976E44]" />
              </div>
              <Label className="text-[#546A7A] font-semibold">Timeline</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#5D6E73]">
                  Offer Month {updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && <span className="text-[#E17F70]">*</span>}
                </Label>
                <Input 
                  type="month"
                  value={updateData.offerMonth}
                  onChange={(e) => setUpdateData((prev: any) => ({ ...prev, offerMonth: e.target.value }))}
                  className={`h-11 border-2 transition-colors rounded-lg ${
                    updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && !updateData.offerMonth 
                      ? 'border-[#E17F70]' 
                      : 'border-[#92A2A5] hover:border-amber-300 focus:border-[#CE9F6B]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-[#5D6E73]">
                  PO Expected Month {updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && <span className="text-[#E17F70]">*</span>}
                </Label>
                <Input 
                  type="month"
                  value={updateData.poExpectedMonth}
                  onChange={(e) => setUpdateData((prev: any) => ({ ...prev, poExpectedMonth: e.target.value }))}
                  className={`h-11 border-2 transition-colors rounded-lg ${
                    updateData.stage && stageInfo[updateData.stage]?.requiresAllFields && !updateData.poExpectedMonth 
                      ? 'border-[#E17F70]' 
                      : 'border-[#92A2A5] hover:border-amber-300 focus:border-[#CE9F6B]'
                  }`}
                />
              </div>
            </div>
          </div>
          
          {(updateData.stage === 'PO_RECEIVED' || updateData.stage === 'WON') && (
            <div className="bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/10 rounded-xl p-5 border-2 border-[#A2B9AF] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-[#A2B9AF]/100 rounded-lg shadow-sm">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#4F6A64] text-lg">Purchase Order Details</h3>
                  <p className="text-xs text-[#4F6A64]">Complete PO information to close this deal</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4F6A64]">PO Number <span className="text-[#E17F70]">*</span></Label>
                  <Input 
                    value={updateData.poNumber}
                    onChange={(e) => setUpdateData((prev: any) => ({ ...prev, poNumber: e.target.value }))}
                    placeholder="Enter PO number"
                    className={`h-11 bg-white border-2 transition-colors rounded-lg ${
                      !updateData.poNumber ? 'border-[#E17F70]' : 'border-[#A2B9AF] hover:border-green-400 focus:border-[#82A094]'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4F6A64]">PO Date <span className="text-[#E17F70]">*</span></Label>
                  <Input 
                    type="date"
                    value={updateData.poDate}
                    onChange={(e) => setUpdateData((prev: any) => ({ ...prev, poDate: e.target.value }))}
                    className={`h-11 bg-white border-2 transition-colors rounded-lg ${
                      !updateData.poDate ? 'border-[#E17F70]' : 'border-[#A2B9AF] hover:border-green-400 focus:border-[#82A094]'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#4F6A64]">PO Value (₹) <span className="text-[#E17F70]">*</span></Label>
                <Input 
                  type="number"
                  value={updateData.poValue}
                  onChange={(e) => setUpdateData((prev: any) => ({ ...prev, poValue: e.target.value }))}
                  placeholder="Enter PO value"
                  className={`h-11 bg-white border-2 transition-colors rounded-lg ${
                    !updateData.poValue ? 'border-[#E17F70]' : 'border-[#A2B9AF] hover:border-green-400 focus:border-[#82A094]'
                  }`}
                />
                <p className="text-xs text-[#4F6A64] flex items-center gap-1.5 mt-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Actual purchase order value received from customer
                </p>
              </div>
            </div>
          )}

          {updateData.stage === 'LOST' && (
            <div className="bg-gradient-to-br from-[#E17F70]/10 to-[#EEC1BF]/10 rounded-xl p-5 border-2 border-[#E17F70] shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 bg-[#E17F70]/100 rounded-lg shadow-sm">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#75242D] text-lg">Reason for Loss <span className="text-[#E17F70]">*</span></h3>
                  <p className="text-xs text-[#9E3B47] mt-1">
                    Document why this deal was lost to improve future proposals
                  </p>
                </div>
              </div>
              <Textarea
                value={updateData.remarks}
                onChange={(e) => setUpdateData((prev: any) => ({ ...prev, remarks: e.target.value }))}
                placeholder="Document why the deal was lost: competitor won, pricing issues, customer delayed, requirements changed, budget constraints, etc."
                rows={5}
                className="resize-none bg-white border-2 border-[#E17F70] hover:border-[#E17F70] focus:border-red-400 rounded-xl"
              />
            </div>
          )}
          
          {(updateData.stage === 'NEGOTIATION' || updateData.stage === 'FINAL_APPROVAL' || updateData.stage === 'PROPOSAL_SENT') && (
            <div className="space-y-4">
              {offer.stageRemarks && offer.stageRemarks.filter((r: any) => {
                if (r.stage !== updateData.stage) return false;
                try {
                  const parsed = JSON.parse(r.remarks);
                  if (parsed.quoteData) return false;
                } catch (e) {}
                return true;
              }).length > 0 && (
                <div className="bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/10 p-4 border-2 border-[#546A7A] rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-[#546A7A]/100 rounded-lg">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-bold text-[#546A7A]">Previous Activity for {allStages.find(s => s.key === updateData.stage)?.label}</p>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {offer.stageRemarks
                      .filter((r: any) => {
                        if (r.stage !== updateData.stage) return false;
                        try {
                          const parsed = JSON.parse(r.remarks);
                          if (parsed.quoteData) return false;
                        } catch (e) {}
                        return true;
                      })
                      .slice(0, 3)
                      .map((r: any) => (
                        <div key={r.id} className="bg-white p-3 rounded-lg border border-[#96AEC2]/20 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-[#546A7A]" />
                              <p className="text-xs text-[#546A7A] font-semibold">
                                {new Date(r.createdAt).toLocaleDateString('en-IN', { 
                                  day: 'numeric', 
                                  month: 'short',
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                            {r.createdBy?.name && (
                              <div className="flex items-center gap-1 bg-[#546A7A]/20 px-2 py-0.5 rounded-full">
                                <User className="h-3 w-3 text-[#546A7A]" />
                                <span className="text-xs font-medium text-[#546A7A]">{r.createdBy.name}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-[#5D6E73] leading-relaxed line-clamp-2">{r.remarks}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/10 p-5 rounded-xl border-2 border-[#96AEC2] shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#96AEC2]/100 rounded-lg shadow-sm">
                    {updateData.stage === 'NEGOTIATION' && <span className="text-lg">💬</span>}
                    {updateData.stage === 'FINAL_APPROVAL' && <span className="text-lg">✅</span>}
                    {updateData.stage === 'PROPOSAL_SENT' && <span className="text-lg">📋</span>}
                  </div>
                  <Label className="text-[#546A7A] font-bold text-base">
                    {updateData.stage === 'NEGOTIATION' && 'Add Negotiation Notes'}
                    {updateData.stage === 'FINAL_APPROVAL' && 'Add Approval Notes'}
                    {updateData.stage === 'PROPOSAL_SENT' && 'Add Proposal Notes'}
                  </Label>
                </div>
                <Textarea
                  value={updateData.remarks}
                  onChange={(e) => setUpdateData((prev: any) => ({ ...prev, remarks: e.target.value }))}
                  placeholder={
                    updateData.stage === 'NEGOTIATION' 
                      ? 'Document discussion points, pricing negotiations, customer objections, competitor info, etc.'
                      : updateData.stage === 'FINAL_APPROVAL'
                      ? 'Document decision makers, approval timeline, final terms, conditions, commitments, etc.'
                      : 'Add any notes about this stage...'
                  }
                  rows={4}
                  className="resize-none bg-white border-2 border-[#96AEC2] hover:border-[#96AEC2] focus:border-[#6F8A9D] rounded-xl shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-[#AEBFC3]/10 border-t border-[#92A2A5] rounded-b-2xl">
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={updating}
              className="px-6 h-11 text-base font-medium border-2 hover:bg-[#AEBFC3]/20 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={onUpdate} 
              disabled={updating}
              className="px-8 h-11 text-base font-semibold bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] hover:from-[#546A7A] hover:to-[#546A7A] shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Offer
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
