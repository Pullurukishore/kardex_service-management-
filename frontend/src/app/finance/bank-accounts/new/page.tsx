'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi } from '@/lib/ar-api';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceRole } from '@/types/user.types';
import { 
  ArrowLeft, Building2, Sparkles, Save, AlertCircle, 
  CheckCircle2, Mail, CreditCard, Hash, User, Loader2
} from 'lucide-react';

interface FormData {
  vendorName: string;
  beneficiaryBankName: string;
  accountNumber: string;
  ifscCode: string;
  emailId: string;
  nickName: string;
}

export default function NewBankAccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const isAdmin = user?.financeRole === FinanceRole.FINANCE_ADMIN;

  const [formData, setFormData] = useState<FormData>({
    vendorName: '',
    beneficiaryBankName: '',
    accountNumber: '',
    ifscCode: '',
    emailId: '',
    nickName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.vendorName || !formData.beneficiaryBankName || 
          !formData.accountNumber || !formData.ifscCode) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (isAdmin) {
        await arApi.createBankAccount(formData);
        setSuccess('Bank account created successfully!');
        setTimeout(() => router.push('/finance/bank-accounts'), 1500);
      } else {
        await arApi.createBankAccountRequest({
          requestType: 'CREATE',
          requestedData: formData
        });
        setSuccess('Request submitted! Waiting for admin approval.');
        setTimeout(() => router.push('/finance/bank-accounts/requests'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/finance/bank-accounts"
          className="p-2 rounded-xl bg-white border border-[#AEBFC3]/30 text-[#5D6E73] hover:text-[#546A7A] hover:border-[#CE9F6B]/30 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-2">
            {isAdmin ? 'Add Bank Account' : 'Request New Account'}
            <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
          </h1>
          <p className="text-[#92A2A5] text-sm mt-1 font-medium">
            {isAdmin ? 'Create a new vendor bank account' : 'Submit a request for a new bank account'}
          </p>
        </div>
      </div>

      {/* Info banner for non-admin */}
      {!isAdmin && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#6F8A9D]/10 border border-[#6F8A9D]/20">
          <AlertCircle className="w-5 h-5 text-[#6F8A9D] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#5D6E73]">
            <p className="font-medium text-[#6F8A9D] mb-1">Change Request Mode</p>
            <p>Your request will be sent to a Finance Admin for approval. You'll be notified once it's processed.</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#AEBFC3]/20 p-6 space-y-6 shadow-lg">
        
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-[#E17F70]/10 border border-[#E17F70]/20 text-[#E17F70]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-[#82A094]/10 border border-[#82A094]/20 text-[#4F6A64]">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#5D6E73]">
            <User className="w-4 h-4" />
            Vendor Name <span className="text-[#E17F70]">*</span>
          </label>
          <input
            type="text"
            name="vendorName"
            value={formData.vendorName}
            onChange={handleChange}
            placeholder="Enter vendor/company name"
            className="w-full px-4 py-3 bg-white border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#5D6E73]">
            <Hash className="w-4 h-4" />
            Nick Name
          </label>
          <input
            type="text"
            name="nickName"
            value={formData.nickName}
            onChange={handleChange}
            placeholder="Short reference name (optional)"
            className="w-full px-4 py-3 bg-white border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#5D6E73]">
            <Building2 className="w-4 h-4" />
            Beneficiary Bank Name <span className="text-[#E17F70]">*</span>
          </label>
          <input
            type="text"
            name="beneficiaryBankName"
            value={formData.beneficiaryBankName}
            onChange={handleChange}
            placeholder="e.g., State Bank of India"
            className="w-full px-4 py-3 bg-white border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5D6E73]">
              <CreditCard className="w-4 h-4" />
              Account Number <span className="text-[#E17F70]">*</span>
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter account number"
              className="w-full px-4 py-3 bg-white border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5D6E73]">
              <Hash className="w-4 h-4" />
              IFSC Code <span className="text-[#E17F70]">*</span>
            </label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="e.g., SBIN0001234"
              className="w-full px-4 py-3 bg-white border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all font-mono uppercase"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#5D6E73]">
            <Mail className="w-4 h-4" />
            Email ID
          </label>
          <input
            type="email"
            name="emailId"
            value={formData.emailId}
            onChange={handleChange}
            placeholder="vendor@company.com (optional)"
            className="w-full px-4 py-3 bg-white border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-[#AEBFC3]/10">
          <Link
            href="/finance/bank-accounts"
            className="px-6 py-3 rounded-xl bg-[#AEBFC3]/10 border border-[#AEBFC3]/30 text-[#5D6E73] font-medium hover:bg-[#AEBFC3]/20 hover:text-[#546A7A] transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !!success}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white font-semibold hover:from-[#A2B9AF] hover:to-[#82A094] transition-all duration-300 shadow-lg shadow-[#82A094]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isAdmin ? 'Create Account' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
