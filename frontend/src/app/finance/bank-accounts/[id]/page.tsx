'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { arApi, BankAccount, BankAccountChangeRequest } from '@/lib/ar-api';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceRole } from '@/types/user.types';
import { 
  ArrowLeft, Building2, Sparkles, Pencil, Trash2, 
  CreditCard, Mail, Hash, Clock, CheckCircle2, XCircle,
  AlertCircle, User, Calendar, Copy, ExternalLink, Check
} from 'lucide-react';

export default function BankAccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
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
          className="inline-flex items-center gap-2 text-[#CE9F6B] hover:text-[#976E44] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bank Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/finance/bank-accounts"
            className="p-2.5 rounded-xl bg-white border border-[#AEBFC3]/30 text-[#5D6E73] hover:text-[#546A7A] hover:border-[#CE9F6B]/30 hover:shadow-lg transition-all"
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#CE9F6B] to-[#976E44] text-white font-semibold hover:from-[#976E44] hover:to-[#7A5837] transition-all shadow-lg shadow-[#CE9F6B]/25"
          >
            <Pencil className="w-4 h-4" />
            {isAdmin ? 'Edit' : 'Request Changes'}
          </Link>
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E17F70]/10 border border-[#E17F70]/30 text-[#E17F70] font-semibold hover:bg-[#E17F70]/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className={`rounded-2xl p-6 border ${
            account.isActive 
              ? 'bg-gradient-to-br from-[#82A094]/10 to-[#82A094]/5 border-[#82A094]/20' 
              : 'bg-gradient-to-br from-[#AEBFC3]/10 to-[#AEBFC3]/5 border-[#AEBFC3]/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  account.isActive 
                    ? 'bg-gradient-to-br from-[#82A094] to-[#4F6A64]' 
                    : 'bg-gradient-to-br from-[#AEBFC3] to-[#8A9A9E]'
                } shadow-lg`}>
                  {account.isActive 
                    ? <CheckCircle2 className="w-7 h-7 text-white" /> 
                    : <XCircle className="w-7 h-7 text-white" />
                  }
                </div>
                <div>
                  <p className="text-[#92A2A5] text-sm font-medium">Account Status</p>
                  <p className={`text-2xl font-bold ${account.isActive ? 'text-[#4F6A64]' : 'text-[#92A2A5]'}`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-[#92A2A5]">
                <div className="flex items-center gap-2 justify-end">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(account.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg">
            <div className="p-5 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#CE9F6B]/10 to-transparent">
              <h2 className="text-lg font-bold text-[#546A7A] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#CE9F6B]" />
                Bank Details
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl bg-[#F8FAFB] border border-[#AEBFC3]/10">
                  <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-2">
                    <Building2 className="w-4 h-4" />
                    Beneficiary Bank
                  </div>
                  <p className="text-[#546A7A] font-semibold text-lg">{account.beneficiaryBankName}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFB] border border-[#AEBFC3]/10">
                  <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-2">
                    <Hash className="w-4 h-4" />
                    IFSC Code
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[#CE9F6B] font-mono text-lg font-semibold">{account.ifscCode}</p>
                    <button 
                      onClick={() => copyToClipboard(account.ifscCode, 'ifsc')}
                      className="p-1.5 rounded-lg hover:bg-[#CE9F6B]/10 text-[#92A2A5] hover:text-[#CE9F6B] transition-all"
                    >
                      {copied === 'ifsc' ? <Check className="w-4 h-4 text-[#82A094]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-[#CE9F6B]/5 to-transparent border border-[#CE9F6B]/20">
                <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-2">
                  <CreditCard className="w-4 h-4" />
                  Account Number
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[#546A7A] font-mono text-xl font-bold tracking-wider">{account.accountNumber}</p>
                  <button 
                    onClick={() => copyToClipboard(account.accountNumber, 'account')}
                    className="p-1.5 rounded-lg hover:bg-[#CE9F6B]/10 text-[#92A2A5] hover:text-[#CE9F6B] transition-all"
                  >
                    {copied === 'account' ? <Check className="w-4 h-4 text-[#82A094]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Details Card */}
          <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg">
            <div className="p-5 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#6F8A9D]/10 to-transparent">
              <h2 className="text-lg font-bold text-[#546A7A] flex items-center gap-2">
                <User className="w-5 h-5 text-[#6F8A9D]" />
                Vendor Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-[#F8FAFB] border border-[#AEBFC3]/10">
                <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-2">
                  <User className="w-4 h-4" />
                  Vendor Name
                </div>
                <p className="text-[#546A7A] font-semibold text-lg">{account.vendorName}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFB] border border-[#AEBFC3]/10">
                <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-2">
                  <Hash className="w-4 h-4" />
                  Nick Name
                </div>
                <p className="text-[#546A7A] font-semibold text-lg">{account.nickName || '—'}</p>
              </div>

              <div className="md:col-span-2 p-4 rounded-xl bg-[#F8FAFB] border border-[#AEBFC3]/10">
                <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-2">
                  <Mail className="w-4 h-4" />
                  Email ID
                </div>
                <p className="text-[#546A7A] font-semibold text-lg">{account.emailId || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg">
            <div className="p-5 border-b border-[#AEBFC3]/10">
              <h3 className="font-bold text-[#546A7A]">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href={`/finance/bank-accounts/${account.id}/edit`}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#CE9F6B]/10 text-[#5D6E73] hover:text-[#976E44] transition-all group"
              >
                <div className="p-2 bg-[#CE9F6B]/10 rounded-lg group-hover:bg-[#CE9F6B]/20 transition-colors">
                  <Pencil className="w-4 h-4 text-[#CE9F6B]" />
                </div>
                <span className="font-medium">{isAdmin ? 'Edit Details' : 'Request Changes'}</span>
              </Link>
              <Link
                href="/finance/bank-accounts/requests"
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#6F8A9D]/10 text-[#5D6E73] hover:text-[#6F8A9D] transition-all group"
              >
                <div className="p-2 bg-[#6F8A9D]/10 rounded-lg group-hover:bg-[#6F8A9D]/20 transition-colors">
                  <Clock className="w-4 h-4 text-[#6F8A9D]" />
                </div>
                <span className="font-medium">View Requests</span>
              </Link>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg">
            <div className="p-5 border-b border-[#AEBFC3]/10">
              <h3 className="font-bold text-[#546A7A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#CE9F6B]" />
                Activity
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-[#82A094]" />
                  <div className="flex-1 w-px bg-[#AEBFC3]/20" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#546A7A]">Last Updated</p>
                  <p className="text-xs text-[#92A2A5]">{formatDate(account.updatedAt)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-[#CE9F6B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#546A7A]">Created</p>
                  <p className="text-xs text-[#92A2A5]">{formatDate(account.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Request History */}
          {account.changeRequests && account.changeRequests.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg">
              <div className="p-5 border-b border-[#AEBFC3]/10">
                <h3 className="font-bold text-[#546A7A] flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[#CE9F6B]" />
                  Recent Requests
                </h3>
              </div>
              <div className="divide-y divide-[#AEBFC3]/10">
                {account.changeRequests.slice(0, 5).map((request: BankAccountChangeRequest) => (
                  <Link 
                    key={request.id} 
                    href={`/finance/bank-accounts/requests/${request.id}`}
                    className="block px-5 py-4 hover:bg-[#CE9F6B]/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
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
                          <p className="text-sm font-medium text-[#546A7A]">{request.requestType}</p>
                          <p className="text-xs text-[#92A2A5]">{formatDate(request.requestedAt)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        request.status === 'APPROVED' ? 'bg-[#82A094]/15 text-[#4F6A64]' :
                        request.status === 'REJECTED' ? 'bg-[#E17F70]/15 text-[#E17F70]' :
                        'bg-[#CE9F6B]/15 text-[#976E44]'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
