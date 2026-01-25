'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi } from '@/lib/ar-api';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceRole } from '@/types/user.types';
import { 
  ArrowLeft, Building2, Sparkles, Save, AlertCircle, 
  CheckCircle2, Mail, CreditCard, Hash, User, Loader2,
  Info
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
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/finance/bank-accounts"
          className="p-2.5 rounded-xl bg-white border border-[#AEBFC3]/30 text-[#5D6E73] hover:text-[#546A7A] hover:border-[#CE9F6B]/30 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-2">
            {isAdmin ? 'Add New Bank Account' : 'Request New Bank Account'}
            <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
          </h1>
          <p className="text-[#92A2A5] text-sm mt-1 font-medium">
            {isAdmin ? 'Create a new vendor bank account' : 'Submit a request for a new bank account'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          {/* Info banner for non-admin */}
          {!isAdmin && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#6F8A9D]/10 border border-[#6F8A9D]/20 mb-6">
              <Info className="w-5 h-5 text-[#6F8A9D] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#5D6E73]">
                <p className="font-semibold text-[#6F8A9D] mb-1">Request Mode</p>
                <p>Your request will be reviewed by a Finance Admin. You'll be notified once it's processed.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#F8FAFB] to-white">
              <h2 className="text-lg font-bold text-[#546A7A] flex items-center gap-2">
                <User className="w-5 h-5 text-[#CE9F6B]" />
                Vendor Information
              </h2>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-[#E17F70]/10 border border-[#E17F70]/20 text-[#E17F70]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-[#82A094]/10 border border-[#82A094]/20 text-[#4F6A64]">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{success}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <User className="w-4 h-4 text-[#CE9F6B]" />
                    Vendor Name <span className="text-[#E17F70]">*</span>
                  </label>
                  <input
                    type="text"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                    placeholder="Enter vendor/company name"
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <Hash className="w-4 h-4 text-[#CE9F6B]" />
                    Nick Name
                  </label>
                  <input
                    type="text"
                    name="nickName"
                    value={formData.nickName}
                    onChange={handleChange}
                    placeholder="Short reference name"
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <Mail className="w-4 h-4 text-[#CE9F6B]" />
                    Email ID
                  </label>
                  <input
                    type="email"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    placeholder="vendor@company.com"
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#AEBFC3]/10 bg-gradient-to-r from-[#F8FAFB] to-white">
              <h2 className="text-lg font-bold text-[#546A7A] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#CE9F6B]" />
                Bank Details
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                  <Building2 className="w-4 h-4 text-[#CE9F6B]" />
                  Beneficiary Bank Name <span className="text-[#E17F70]">*</span>
                </label>
                <input
                  type="text"
                  name="beneficiaryBankName"
                  value={formData.beneficiaryBankName}
                  onChange={handleChange}
                  placeholder="e.g., State Bank of India"
                  className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <CreditCard className="w-4 h-4 text-[#CE9F6B]" />
                    Account Number <span className="text-[#E17F70]">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <Hash className="w-4 h-4 text-[#CE9F6B]" />
                    IFSC Code <span className="text-[#E17F70]">*</span>
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    placeholder="e.g., SBIN0001234"
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all font-mono uppercase"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#AEBFC3]/10 bg-[#F8FAFB] flex items-center gap-4">
              <Link
                href="/finance/bank-accounts"
                className="px-6 py-3 rounded-xl bg-white border border-[#AEBFC3]/30 text-[#5D6E73] font-semibold hover:bg-[#AEBFC3]/10 hover:text-[#546A7A] transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !!success}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white font-semibold hover:from-[#4F6A64] hover:to-[#3D524D] transition-all duration-300 shadow-lg shadow-[#82A094]/25 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview Card */}
          <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg sticky top-6">
            <div className="p-5 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#CE9F6B]/10 to-transparent">
              <h3 className="font-bold text-[#546A7A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#CE9F6B]" />
                Preview
              </h3>
            </div>
            <div className="p-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center mb-4 shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              
              <h4 className="text-lg font-bold text-[#546A7A] mb-1">
                {formData.vendorName || 'Vendor Name'}
              </h4>
              {formData.nickName && (
                <p className="text-sm text-[#CE9F6B] mb-3">"{formData.nickName}"</p>
              )}
              
              <div className="space-y-2 text-sm border-t border-[#AEBFC3]/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#92A2A5]">Bank:</span>
                  <span className="text-[#546A7A] font-medium">
                    {formData.beneficiaryBankName || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#92A2A5]">A/C:</span>
                  <span className="text-[#546A7A] font-mono text-xs">
                    {formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#92A2A5]">IFSC:</span>
                  <span className="text-[#CE9F6B] font-mono text-xs">
                    {formData.ifscCode || '-'}
                  </span>
                </div>
                {formData.emailId && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#92A2A5]">Email:</span>
                    <span className="text-[#546A7A] text-xs truncate max-w-[140px]">
                      {formData.emailId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-[#82A094]/5 rounded-2xl border border-[#82A094]/20 p-5">
            <h3 className="font-bold text-[#4F6A64] mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-[#5D6E73]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#82A094] mt-2 flex-shrink-0" />
                Ensure account number is accurate to avoid payment failures
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#82A094] mt-2 flex-shrink-0" />
                IFSC code should be 11 characters (4 alpha + 0 + 6 alphanumeric)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#82A094] mt-2 flex-shrink-0" />
                Nick name helps quickly identify the account
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
