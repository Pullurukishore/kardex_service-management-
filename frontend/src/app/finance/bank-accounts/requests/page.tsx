'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { arApi, BankAccountChangeRequest } from '@/lib/ar-api';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceRole } from '@/types/user.types';
import { 
  ArrowLeft, Sparkles, Clock, CheckCircle2, XCircle, 
  AlertCircle, Building2, Plus, Trash2, Edit2, Eye,
  MessageSquare, Loader2, ChevronDown
} from 'lucide-react';

export default function BankAccountRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BankAccountChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; requestId: string | null; notes: string }>({
    open: false,
    requestId: null,
    notes: ''
  });

  const isAdmin = user?.financeRole === FinanceRole.FINANCE_ADMIN;

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      let data: BankAccountChangeRequest[];
      if (isAdmin) {
        data = await arApi.getPendingRequests(filter === 'ALL' ? undefined : filter);
      } else {
        data = await arApi.getMyRequests();
        if (filter !== 'ALL') {
          data = data.filter(r => r.status === filter);
        }
      }
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this request?')) return;
    
    try {
      setProcessingId(id);
      await arApi.approveRequest(id);
      await loadRequests();
    } catch (error: any) {
      alert(error.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.requestId || !rejectModal.notes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setProcessingId(rejectModal.requestId);
      await arApi.rejectRequest(rejectModal.requestId, rejectModal.notes);
      setRejectModal({ open: false, requestId: null, notes: '' });
      await loadRequests();
    } catch (error: any) {
      alert(error.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'CREATE': return <Plus className="w-4 h-4" />;
      case 'UPDATE': return <Edit2 className="w-4 h-4" />;
      case 'DELETE': return <Trash2 className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getRequestColor = (type: string) => {
    switch (type) {
      case 'CREATE': return 'bg-[#82A094]/15 text-[#4F6A64] border-[#82A094]/30';
      case 'UPDATE': return 'bg-[#CE9F6B]/15 text-[#976E44] border-[#CE9F6B]/30';
      case 'DELETE': return 'bg-[#E17F70]/15 text-[#E17F70] border-[#E17F70]/30';
      default: return 'bg-[#AEBFC3]/15 text-[#5D6E73] border-[#AEBFC3]/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-[#82A094]/15 text-[#4F6A64]';
      case 'REJECTED': return 'bg-[#E17F70]/15 text-[#E17F70]';
      default: return 'bg-[#CE9F6B]/15 text-[#976E44]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/finance/bank-accounts"
            className="p-2 rounded-xl bg-white border border-[#AEBFC3]/30 text-[#5D6E73] hover:text-[#546A7A] hover:border-[#CE9F6B]/30 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-2">
              {isAdmin ? 'Pending Requests' : 'My Requests'}
              <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
            </h1>
            <p className="text-[#92A2A5] text-sm mt-1 font-medium">
              {isAdmin ? 'Review and approve bank account changes' : 'Track your submitted requests'}
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-white border border-[#AEBFC3]/30 text-[#546A7A] font-medium focus:outline-none focus:border-[#CE9F6B]/50 cursor-pointer shadow-sm"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#92A2A5] pointer-events-none" />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#AEBFC3]/20 p-6 animate-pulse shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#AEBFC3]/20 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-[#AEBFC3]/20 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-[#AEBFC3]/20 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-[#CE9F6B]/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-[#CE9F6B]/50" />
            </div>
            <p className="text-[#92A2A5] font-medium mb-2">No {filter.toLowerCase()} requests</p>
            <p className="text-[#AEBFC3] text-sm">
              {isAdmin ? 'All caught up! No pending requests to review.' : 'You haven\'t submitted any requests yet.'}
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <div 
              key={request.id} 
              className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden hover:border-[#CE9F6B]/30 transition-all shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getRequestColor(request.requestType)}`}>
                      {getRequestIcon(request.requestType)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-[#546A7A]">
                          {request.requestType === 'CREATE' ? 'New Account Request' :
                           request.requestType === 'UPDATE' ? 'Update Request' :
                           'Delete Request'}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <p className="text-[#92A2A5] text-sm mb-3">
                        Submitted on {formatDate(request.requestedAt)}
                        {request.requestedBy && ` by ${request.requestedBy.name || request.requestedBy.email}`}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {request.requestedData.vendorName && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#92A2A5]" />
                            <span className="text-[#546A7A]">{request.requestedData.vendorName}</span>
                          </div>
                        )}
                        {request.requestedData.beneficiaryBankName && (
                          <div className="text-[#92A2A5]">
                            Bank: <span className="text-[#546A7A]">{request.requestedData.beneficiaryBankName}</span>
                          </div>
                        )}
                        {request.requestedData.accountNumber && (
                          <div className="text-[#92A2A5]">
                            A/C: <span className="text-[#546A7A] font-mono">****{request.requestedData.accountNumber.slice(-4)}</span>
                          </div>
                        )}
                      </div>

                      {request.reviewNotes && (
                        <div className="mt-3 p-3 rounded-lg bg-[#AEBFC3]/10 border border-[#AEBFC3]/20">
                          <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-1">
                            <MessageSquare className="w-4 h-4" />
                            Admin Notes:
                          </div>
                          <p className="text-[#5D6E73] text-sm">{request.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isAdmin && request.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#82A094]/15 border border-[#82A094]/30 text-[#4F6A64] font-medium hover:bg-[#82A094]/20 transition-all disabled:opacity-50"
                      >
                        {processingId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectModal({ open: true, requestId: request.id, notes: '' })}
                        disabled={processingId === request.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E17F70]/15 border border-[#E17F70]/30 text-[#E17F70] font-medium hover:bg-[#E17F70]/20 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {request.bankAccountId && request.status !== 'PENDING' && (
                    <Link
                      href={`/finance/bank-accounts/${request.bankAccountId}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#AEBFC3]/10 border border-[#AEBFC3]/30 text-[#5D6E73] font-medium hover:bg-[#AEBFC3]/20 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-[#546A7A] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[#E17F70]" />
              Reject Request
            </h3>
            <p className="text-[#92A2A5] text-sm">
              Please provide a reason for rejecting this request.
            </p>
            <textarea
              value={rejectModal.notes}
              onChange={(e) => setRejectModal(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter rejection reason..."
              className="w-full h-32 px-4 py-3 bg-white border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#E17F70]/50 resize-none"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRejectModal({ open: false, requestId: null, notes: '' })}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#AEBFC3]/10 border border-[#AEBFC3]/30 text-[#5D6E73] font-medium hover:bg-[#AEBFC3]/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectModal.notes.trim() || processingId === rejectModal.requestId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E17F70] text-white font-semibold hover:bg-[#9E3B47] transition-all disabled:opacity-50"
              >
                {processingId === rejectModal.requestId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
