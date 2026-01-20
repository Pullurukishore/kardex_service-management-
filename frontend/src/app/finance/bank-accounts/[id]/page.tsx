'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { arApi, BankAccount, BankAccountChangeRequest } from '@/lib/ar-api';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceRole } from '@/types/user.types';
import { 
  ArrowLeft, Building2, Sparkles, Edit2, Trash2, 
  CreditCard, Mail, Hash, Clock, CheckCircle2, XCircle,
  AlertCircle, User, Calendar
} from 'lucide-react';

export default function BankAccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.financeRole === FinanceRole.FINANCE_ADMIN;

  useEffect(() => {
    loadAccount();
  }, [params.id]);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const data = await arApi.getBankAccountById(params.id as string);
      setAccount(data);
    } catch (error) {
      console.error('Failed to load bank account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
      await arApi.deleteBankAccount(params.id as string);
      router.push('/finance/bank-accounts');
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      alert('Failed to delete bank account');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#CE9F6B]/30 border-t-[#CE9F6B] rounded-full animate-spin" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-[#E17F70]/50 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#546A7A] mb-2">Bank Account Not Found</h2>
        <p className="text-[#92A2A5] mb-4">The requested bank account could not be found.</p>
        <Link
          href="/finance/bank-accounts"
          className="text-[#CE9F6B] hover:text-[#976E44] font-medium"
        >
          ← Back to Bank Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/finance/bank-accounts"
            className="p-2 rounded-xl bg-white border border-[#AEBFC3]/30 text-[#5D6E73] hover:text-[#546A7A] hover:border-[#CE9F6B]/30 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-2">
              {account.vendorName}
              <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
            </h1>
            {account.nickName && (
              <p className="text-[#CE9F6B] text-sm mt-1 font-medium">"{account.nickName}"</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/finance/bank-accounts/${account.id}/edit`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#CE9F6B]/10 border border-[#CE9F6B]/30 text-[#976E44] font-medium hover:bg-[#CE9F6B]/20 transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Link>
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E17F70]/10 border border-[#E17F70]/30 text-[#E17F70] font-medium hover:bg-[#E17F70]/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg">
        {/* Status Badge Header */}
        <div className={`px-6 py-4 border-b border-[#AEBFC3]/10 flex items-center justify-between ${
          account.isActive ? 'bg-[#82A094]/5' : 'bg-[#AEBFC3]/5'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#92A2A5] text-sm">Account Status</p>
              <div className={`flex items-center gap-2 font-semibold ${
                account.isActive ? 'text-[#4F6A64]' : 'text-[#92A2A5]'
              }`}>
                {account.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {account.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#92A2A5] text-sm">
              <User className="w-4 h-4" />
              Vendor Name
            </div>
            <p className="text-[#546A7A] font-medium text-lg">{account.vendorName}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#92A2A5] text-sm">
              <Hash className="w-4 h-4" />
              Nick Name
            </div>
            <p className="text-[#546A7A] font-medium text-lg">{account.nickName || '—'}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#92A2A5] text-sm">
              <Building2 className="w-4 h-4" />
              Beneficiary Bank
            </div>
            <p className="text-[#546A7A] font-medium text-lg">{account.beneficiaryBankName}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#92A2A5] text-sm">
              <CreditCard className="w-4 h-4" />
              Account Number
            </div>
            <p className="text-[#546A7A] font-mono text-lg">{account.accountNumber}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#92A2A5] text-sm">
              <Hash className="w-4 h-4" />
              IFSC Code
            </div>
            <p className="text-[#CE9F6B] font-mono text-lg">{account.ifscCode}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#92A2A5] text-sm">
              <Mail className="w-4 h-4" />
              Email ID
            </div>
            <p className="text-[#546A7A] font-medium text-lg">{account.emailId || '—'}</p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="px-6 py-4 border-t border-[#AEBFC3]/10 bg-[#AEBFC3]/5 flex items-center justify-between text-sm text-[#92A2A5]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Created: {formatDate(account.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Updated: {formatDate(account.updatedAt)}
          </div>
        </div>
      </div>

      {/* Change Request History */}
      {account.changeRequests && account.changeRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-[#AEBFC3]/10">
            <h2 className="text-lg font-semibold text-[#546A7A] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#CE9F6B]" />
              Change Request History
            </h2>
          </div>
          <div className="divide-y divide-[#AEBFC3]/10">
            {account.changeRequests.map((request: BankAccountChangeRequest) => (
              <div key={request.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    request.status === 'APPROVED' ? 'bg-[#82A094]/15 text-[#4F6A64]' :
                    request.status === 'REJECTED' ? 'bg-[#E17F70]/15 text-[#E17F70]' :
                    'bg-[#CE9F6B]/15 text-[#976E44]'
                  }`}>
                    {request.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> :
                     request.status === 'REJECTED' ? <XCircle className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-[#546A7A] font-medium">{request.requestType} Request</p>
                    <p className="text-[#92A2A5] text-sm">{formatDate(request.requestedAt)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  request.status === 'APPROVED' ? 'bg-[#82A094]/15 text-[#4F6A64]' :
                  request.status === 'REJECTED' ? 'bg-[#E17F70]/15 text-[#E17F70]' :
                  'bg-[#CE9F6B]/15 text-[#976E44]'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
