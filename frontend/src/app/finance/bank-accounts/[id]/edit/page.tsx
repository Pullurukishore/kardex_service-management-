'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { arApi, BankAccount } from '@/lib/ar-api';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceRole } from '@/types/user.types';
import { 
  ArrowLeft, Building2, Sparkles, Save, AlertCircle, 
  CheckCircle2, Mail, CreditCard, Hash, User, Loader2,
  Info, ArrowRight
} from 'lucide-react';

interface FormData {
  vendorName: string;
  beneficiaryBankName: string;
  accountNumber: string;
  ifscCode: string;
  emailId: string;
  beneficiaryName: string;
  confirmAccountNumber: string;
  nickName: string;
  isMSME: boolean;
  udyamRegNum: string;
  currency: string;
  otherCurrency?: string;
}

export default function EditBankAccountPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [originalAccount, setOriginalAccount] = useState<BankAccount | null>(null);
  
  const isAdmin = user?.financeRole === FinanceRole.FINANCE_ADMIN;

  const [formData, setFormData] = useState<FormData>({
    vendorName: '',
    beneficiaryBankName: '',
    accountNumber: '',
    ifscCode: '',
    emailId: '',
    beneficiaryName: '',
    confirmAccountNumber: '',
    nickName: '',
    isMSME: false,
    udyamRegNum: '',
    currency: 'INR',
    otherCurrency: ''
  });

  useEffect(() => {
    loadAccount();
  }, [params.id]);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const data = await arApi.getBankAccountById(params.id as string);
      setOriginalAccount(data);
      setFormData({
        vendorName: data.vendorName,
        beneficiaryBankName: data.beneficiaryBankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        emailId: data.emailId || '',
        beneficiaryName: data.beneficiaryName || data.vendorName,
        confirmAccountNumber: data.accountNumber,
        nickName: data.nickName || '',
        isMSME: data.isMSME || false,
        udyamRegNum: data.udyamRegNum || '',
        currency: ['INR', 'EUR', 'USD'].includes(data.currency) ? data.currency : 'Other',
        otherCurrency: ['INR', 'EUR', 'USD'].includes(data.currency) ? '' : data.currency
      });
    } catch (error) {
      console.error('Failed to load bank account:', error);
      setError('Failed to load bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const val = type === 'checkbox' ? checked : value;
      const newData = { ...prev, [name]: val };
      
      // Default beneficiaryName to vendorName if it was matching or empty (and it's a new vendor name)
      if (name === 'vendorName' && (prev.beneficiaryName === prev.vendorName || prev.beneficiaryName === '')) {
        newData.beneficiaryName = value;
      }
      
      return newData;
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!formData.vendorName || !formData.beneficiaryBankName || 
          !formData.accountNumber || !formData.ifscCode) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }
      
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        setError('Account numbers do not match');
        setSaving(false);
        return;
      }

      const { confirmAccountNumber, otherCurrency, ...apiData } = formData;
      // Override currency if 'Other' is selected
      if (formData.currency === 'Other') {
        apiData.currency = formData.otherCurrency || 'Other';
      }

      if (isAdmin) {
        await arApi.updateBankAccount(params.id as string, apiData);
        setSuccess('Vendor account updated successfully!');
        setTimeout(() => router.push(`/finance/bank-accounts/${params.id}`), 1500);
      } else {
        await arApi.createBankAccountRequest({
          bankAccountId: params.id as string,
          requestType: 'UPDATE',
          requestedData: apiData
        });
        setSuccess('Update request submitted! Waiting for admin approval.');
        setTimeout(() => router.push('/finance/bank-accounts/requests'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = (field: keyof FormData) => {
    if (!originalAccount || field === 'confirmAccountNumber') return false;
    const originalValue = (originalAccount as any)[field] || '';
    return formData[field] !== originalValue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#CE9F6B]/30 border-t-[#CE9F6B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/finance/bank-accounts/${params.id}`}
          className="p-2.5 rounded-xl bg-white border border-[#AEBFC3]/30 text-[#5D6E73] hover:text-[#546A7A] hover:border-[#CE9F6B]/30 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-2">
            {isAdmin ? 'Edit Vendor Account' : 'Request Changes'}
            <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
          </h1>
          <p className="text-[#92A2A5] text-sm mt-1 font-medium">
            {originalAccount?.vendorName}
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
                <p>Your changes will be sent to a Finance Admin for approval before being applied.</p>
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
                <div className={`md:col-span-2 space-y-2 ${hasChanges('vendorName') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <User className="w-4 h-4 text-[#CE9F6B]" />
                    Vendor Name <span className="text-[#E17F70]">*</span>
                    {hasChanges('vendorName') && (
                      <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className={`space-y-2 ${hasChanges('nickName') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <Hash className="w-4 h-4 text-[#CE9F6B]" />
                    Nick Name
                    {hasChanges('nickName') && (
                      <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="nickName"
                    value={formData.nickName}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                  />
                </div>

                <div className={`space-y-2 ${hasChanges('emailId') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <Mail className="w-4 h-4 text-[#CE9F6B]" />
                    Email ID
                    {hasChanges('emailId') && (
                      <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                    )}
                  </label>
                  <input
                    type="email"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                  />
                </div>

                <div className={`md:col-span-2 flex flex-col gap-4 p-4 rounded-xl ${hasChanges('isMSME') || hasChanges('udyamRegNum') ? 'bg-[#CE9F6B]/5 border-[#CE9F6B]/30' : 'bg-[#F8FAFB] border-[#AEBFC3]/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.isMSME ? 'bg-[#CE9F6B]/20 text-[#CE9F6B]' : 'bg-[#AEBFC3]/20 text-[#5D6E73]'}`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#546A7A]">MSME Registered Vendor?</p>
                          {hasChanges('isMSME') && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#CE9F6B]/20 text-[#976E44] uppercase tracking-wider">Modified</span>
                          )}
                        </div>
                        <p className="text-xs text-[#92A2A5]">Is this vendor registered as a Micro, Small, or Medium Enterprise?</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="isMSME"
                        checked={formData.isMSME}
                        onChange={handleChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[#AEBFC3]/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CE9F6B]"></div>
                    </label>
                  </div>

                  {formData.isMSME && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                        Udyam Registration Number <span className="text-[#E17F70]">*</span>
                        {hasChanges('udyamRegNum') && (
                          <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="udyamRegNum"
                        value={formData.udyamRegNum}
                        onChange={handleChange}
                        placeholder="UDYAM-XX-00-0000000"
                        className={`w-full px-4 py-3.5 border rounded-xl text-[#546A7A] focus:outline-none focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all font-mono ${
                          hasChanges('udyamRegNum') ? 'bg-white border-[#CE9F6B]' : 'bg-white border-[#CE9F6B]/30'
                        }`}
                        required={formData.isMSME}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#AEBFC3]/10 bg-gradient-to-r from-[#F8FAFB] to-white">
              <h2 className="text-lg font-bold text-[#546A7A] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#CE9F6B]" />
                Vendor Bank Details
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`space-y-2 ${hasChanges('currency') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    Currency <span className="text-[#E17F70]">*</span>
                    {hasChanges('currency') && (
                      <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                    )}
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="INR">INR (Indian Rupee)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="Other">Other (Specify...)</option>
                  </select>
                </div>

                {(formData.currency === 'Other' || (originalAccount && !['INR', 'EUR', 'USD'].includes(originalAccount.currency))) && (
                  <div className={`space-y-2 animate-in fade-in slide-in-from-top-1 duration-200 ${hasChanges('currency') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                      Specify Currency <span className="text-[#E17F70]">*</span>
                      {hasChanges('currency') && formData.currency === 'Other' && (
                        <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="otherCurrency"
                      value={formData.otherCurrency}
                      onChange={handleChange}
                      placeholder="e.g., GBP, JPY, CAD"
                      className="w-full px-4 py-3.5 bg-white border border-[#CE9F6B]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B] focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all uppercase"
                      required={formData.currency === 'Other'}
                    />
                  </div>
                )}
              </div>

              <div className={`space-y-2 ${hasChanges('beneficiaryBankName') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                  <Building2 className="w-4 h-4 text-[#CE9F6B]" />
                  Beneficiary Bank Name <span className="text-[#E17F70]">*</span>
                  {hasChanges('beneficiaryBankName') && (
                    <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                  )}
                </label>
                <input
                  type="text"
                  name="beneficiaryBankName"
                  value={formData.beneficiaryBankName}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className={`space-y-2 ${hasChanges('beneficiaryName') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                  <User className="w-4 h-4 text-[#CE9F6B]" />
                  Beneficiary Name <span className="text-[#AEBFC3] font-normal text-xs ml-auto">(Defaults to Vendor Name)</span>
                  {hasChanges('beneficiaryName') && (
                    <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                  )}
                </label>
                <input
                  type="text"
                  name="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={handleChange}
                  placeholder="Name as per bank records"
                  className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`space-y-2 ${hasChanges('accountNumber') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <CreditCard className="w-4 h-4 text-[#CE9F6B]" />
                    Account Number <span className="text-[#E17F70]">*</span>
                    {hasChanges('accountNumber') && (
                      <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all font-mono"
                    required
                  />
                </div>

                <div className={`space-y-2 ${hasChanges('ifscCode') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <Hash className="w-4 h-4 text-[#CE9F6B]" />
                    IFSC Code <span className="text-[#E17F70]">*</span>
                    {hasChanges('ifscCode') && (
                      <span className="ml-auto text-xs text-[#CE9F6B] font-medium">Modified</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-[#F8FAFB] border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all font-mono uppercase"
                    required
                  />
                </div>

                <div className={`space-y-2 ${hasChanges('accountNumber') ? 'ring-2 ring-[#CE9F6B]/30 rounded-xl p-3 -m-3' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                    <CreditCard className="w-4 h-4 text-[#82A094]" />
                    Confirm Account Number <span className="text-[#E17F70]">*</span>
                  </label>
                  <input
                    type="text"
                    name="confirmAccountNumber"
                    value={formData.confirmAccountNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 bg-[#F8FAFB] border rounded-xl text-[#546A7A] focus:outline-none transition-all font-mono ${
                      formData.accountNumber !== formData.confirmAccountNumber
                        ? 'border-[#E17F70] ring-2 ring-[#E17F70]/10'
                        : 'border-[#AEBFC3]/30 focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white'
                    }`}
                    required
                  />
                  {formData.accountNumber !== formData.confirmAccountNumber && (
                    <p className="text-[10px] text-[#E17F70] font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Account numbers do not match
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#AEBFC3]/10 bg-[#F8FAFB] flex items-center gap-4">
              <Link
                href={`/finance/bank-accounts/${params.id}`}
                className="px-6 py-3 rounded-xl bg-white border border-[#AEBFC3]/30 text-[#5D6E73] font-semibold hover:bg-[#AEBFC3]/10 hover:text-[#546A7A] transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !!success}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#CE9F6B] to-[#976E44] text-white font-semibold hover:from-[#976E44] hover:to-[#7A5837] transition-all duration-300 shadow-lg shadow-[#CE9F6B]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isAdmin ? 'Save Changes' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Changes Preview */}
        <div className="space-y-6">
          {/* Changes Summary */}
          <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg sticky top-6">
            <div className="p-5 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#CE9F6B]/10 to-transparent">
              <h3 className="font-bold text-[#546A7A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#CE9F6B]" />
                Changes Preview
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {Object.keys(formData).map((key) => {
                const field = key as keyof FormData;
                const changed = hasChanges(field);
                if (!changed) return null;
                
                const labels: Record<string, string> = {
                  vendorName: 'Vendor Name',
                  nickName: 'Nick Name',
                  emailId: 'Email ID',
                  beneficiaryName: 'Beneficiary Name',
                  beneficiaryBankName: 'Bank Name',
                  accountNumber: 'Account No.',
                  ifscCode: 'IFSC Code'
                };

                return (
                  <div key={key} className="p-3 rounded-xl bg-[#CE9F6B]/5 border border-[#CE9F6B]/20">
                    <p className="text-xs font-semibold text-[#CE9F6B] mb-2">{labels[key]}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#92A2A5] line-through truncate max-w-[80px]">
                        {(originalAccount as any)?.[field] || '(empty)'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#CE9F6B] flex-shrink-0" />
                      <span className="text-[#546A7A] font-medium truncate">
                        {formData[field] || '(empty)'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {!Object.keys(formData).some(key => hasChanges(key as keyof FormData)) && (
                <div className="text-center py-6">
                  <p className="text-[#92A2A5] text-sm">No changes made yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Original Values */}
          <div className="bg-[#F8FAFB] rounded-2xl border border-[#AEBFC3]/20 p-5">
            <h3 className="font-bold text-[#5D6E73] mb-3 text-sm">Original Values</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#92A2A5]">Vendor:</span>
                <span className="text-[#546A7A] font-medium truncate max-w-[150px]">{originalAccount?.vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#92A2A5]">Bank:</span>
                <span className="text-[#546A7A] font-medium truncate max-w-[150px]">{originalAccount?.beneficiaryBankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#92A2A5]">A/C:</span>
                <span className="text-[#546A7A] font-mono text-xs">****{originalAccount?.accountNumber?.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#92A2A5]">IFSC:</span>
                <span className="text-[#CE9F6B] font-mono text-xs">{originalAccount?.ifscCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
