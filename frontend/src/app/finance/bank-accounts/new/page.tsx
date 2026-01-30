'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi } from '@/lib/ar-api';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceRole } from '@/types/user.types';
import { 
  ArrowLeft, Building2, Sparkles, Save, AlertCircle, 
  CheckCircle2, Mail, CreditCard, Hash, User, Loader2,
  Info, FileText, Upload, X, ArrowRight, Shield, Landmark,
  Globe, BadgeCheck, ChevronRight, Wallet
} from 'lucide-react';

/*
  KARDEX OFFICIAL COLOR PALETTE (18 Colors Only)
  
  Blues:   #96AEC2 (Blue 1), #6F8A9D (Blue 2), #546A7A (Blue 3)
  Greens:  #A2B9AF (Green 1), #82A094 (Green 2), #4F6A64 (Green 3)
  Greys:   #AEBFC3 (Grey 1), #92A2A5 (Grey 2), #5D6E73 (Grey 3)
  Silvers: #ABACA9 (Silver 1), #979796 (Silver 2), #757777 (Silver 3)
  Reds:    #E17F70 (Red 1), #9E3B47 (Red 2), #75242D (Red 3)
  Sands:   #EEC1BF (Sand 1), #CE9F6B (Sand 2), #976E44 (Sand 3)
*/

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
  gstNumber: string;
  panNumber: string;
  currency: string;
  otherCurrency?: string;
}

export default function NewBankAccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  
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
    gstNumber: '',
    panNumber: '',
    currency: 'INR',
    otherCurrency: ''
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track active step based on filled fields
  useEffect(() => {
    if (formData.vendorName && formData.beneficiaryBankName && formData.accountNumber && formData.ifscCode) {
      setActiveStep(3);
    } else if (formData.vendorName) {
      setActiveStep(2);
    } else {
      setActiveStep(1);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const val = type === 'checkbox' ? checked : value;
      const newData = { ...prev, [name]: val };
      
      if (name === 'vendorName' && (prev.beneficiaryName === prev.vendorName || prev.beneficiaryName === '')) {
        newData.beneficiaryName = value;
      }
      
      return newData;
    });
    setError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

      // Smart Mandatory Validation for GST/PAN (only for INR)
      if (formData.currency === 'INR') {
        if (!formData.gstNumber) {
          setError('GST Number is required for INR transactions');
          setLoading(false);
          return;
        }
        if (!formData.panNumber) {
          setError('PAN Number is required for INR transactions');
          setLoading(false);
          return;
        }
      }
      
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        setError('Account numbers do not match');
        setLoading(false);
        return;
      }

      if (isAdmin) {
        const { confirmAccountNumber, otherCurrency, ...apiData } = formData;
        if (formData.currency === 'Other') {
            apiData.currency = formData.otherCurrency || 'Other';
        }
        const account = await arApi.createBankAccount(apiData);
        
        if (selectedFiles.length > 0) {
          for (const file of selectedFiles) {
            await arApi.uploadBankAccountAttachment(account.id, file);
          }
        }
        
        setSuccess('Vendor account created successfully!');
        setTimeout(() => router.push(`/finance/bank-accounts/${account.id}`), 1500);
      } else {
        const { confirmAccountNumber, otherCurrency, ...apiData } = formData;
        if (formData.currency === 'Other') {
            apiData.currency = formData.otherCurrency || 'Other';
        }
        const request = await arApi.createBankAccountRequest({
          requestType: 'CREATE',
          requestedData: apiData
        });
        
        if (selectedFiles.length > 0) {
          for (const file of selectedFiles) {
            await arApi.uploadBankAccountAttachment(request.id, file);
          }
        }
        
        setSuccess('Request submitted! Waiting for admin approval.');
        setTimeout(() => router.push('/finance/bank-accounts/requests'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Vendor Details', icon: User, description: 'Basic information' },
    { id: 2, title: 'Bank Account', icon: Landmark, description: 'Banking details' },
    { id: 3, title: 'Documents', icon: FileText, description: 'Verification' },
  ];

  const getCompletionPercentage = () => {
    let filled = 0;
    const required = ['vendorName', 'beneficiaryBankName', 'accountNumber', 'ifscCode', 'confirmAccountNumber'];
    required.forEach(field => {
      if (formData[field as keyof FormData]) filled++;
    });
    return Math.round((filled / required.length) * 100);
  };

  return (
    <div className="w-full min-h-screen">
      {/* Premium Header - Kardex Blue Gradient */}
      <div 
        className={`relative overflow-hidden rounded-3xl mb-8 transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        style={{ background: 'linear-gradient(135deg, #546A7A 0%, #6F8A9D 50%, #546A7A 100%)' }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(206,159,107,0.2) 0%, transparent 70%)' }}
          />
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(150,174,194,0.2) 0%, transparent 70%)', animationDelay: '1s' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
          />
        </div>
        
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <Link
                href="/finance/bank-accounts"
                className="group p-3.5 rounded-2xl border transition-all duration-300"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="p-2.5 rounded-xl shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #CE9F6B 0%, #976E44 100%)', boxShadow: '0 8px 20px rgba(206,159,107,0.3)' }}
                  >
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    style={{ background: 'rgba(206,159,107,0.2)', color: '#EEC1BF', borderColor: 'rgba(206,159,107,0.3)' }}
                  >
                    {isAdmin ? 'Direct Creation' : 'Approval Required'}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                  {isAdmin ? 'Add Vendor Account' : 'Request Vendor Account'}
                </h1>
                <p className="text-sm md:text-base flex items-center gap-2" style={{ color: '#AEBFC3' }}>
                  <Shield className="w-4 h-4" style={{ color: '#CE9F6B' }} />
                  {isAdmin ? 'Create a verified vendor bank account' : 'Submit for administrative verification'}
                </p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="lg:text-right">
              <div 
                className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl border"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="relative">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                    <circle 
                      cx="32" cy="32" r="28" 
                      stroke="url(#kardexGradient)" 
                      strokeWidth="4" 
                      fill="none" 
                      strokeLinecap="round"
                      strokeDasharray={`${(getCompletionPercentage() / 100) * 176} 176`}
                      className="transition-all duration-700"
                    />
                    <defs>
                      <linearGradient id="kardexGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#CE9F6B" />
                        <stop offset="100%" stopColor="#976E44" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white">
                    {getCompletionPercentage()}%
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Completion</p>
                  <p className="text-white font-bold">Step {activeStep} of 3</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step Indicators */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep >= step.id;
              const isCurrent = activeStep === step.id;
              
              return (
                <div 
                  key={step.id}
                  className="relative p-4 rounded-2xl transition-all duration-500"
                  style={{ 
                    background: isCurrent 
                      ? 'linear-gradient(135deg, rgba(206,159,107,0.2) 0%, rgba(151,110,68,0.1) 100%)' 
                      : isActive 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isCurrent ? 'rgba(206,159,107,0.3)' : isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-xl transition-all duration-500"
                      style={{ 
                        background: isCurrent 
                          ? 'linear-gradient(135deg, #CE9F6B 0%, #976E44 100%)' 
                          : isActive 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(255,255,255,0.05)',
                        boxShadow: isCurrent ? '0 8px 20px rgba(206,159,107,0.3)' : 'none'
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: isCurrent ? 'white' : isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: isCurrent ? 'white' : isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                        {step.title}
                      </p>
                      <p className="text-xs" style={{ color: isCurrent ? '#EEC1BF' : 'rgba(255,255,255,0.3)' }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info banner for non-admin */}
      {!isAdmin && (
        <div 
          className={`flex items-start gap-4 p-6 rounded-2xl border mb-8 transition-all duration-500 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ background: 'linear-gradient(135deg, rgba(150,174,194,0.1) 0%, rgba(111,138,157,0.05) 100%)', borderColor: 'rgba(150,174,194,0.3)' }}
        >
          <div className="p-3 rounded-xl border" style={{ background: 'rgba(150,174,194,0.1)', borderColor: 'rgba(150,174,194,0.2)' }}>
            <Info className="w-6 h-6" style={{ color: '#6F8A9D' }} />
          </div>
          <div>
            <p className="font-bold text-lg mb-1" style={{ color: '#546A7A' }}>Administrative Review Required</p>
            <p style={{ color: '#5D6E73' }}>
              Your submission will undergo a verification process by the Finance Administration team. 
              Please ensure all bank details and attachments are accurate to facilitate swift approval.
            </p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className={`transition-all duration-500 delay-200 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Error/Success Messages */}
        {error && (
          <div 
            className="flex items-center gap-3 p-5 rounded-2xl border mb-6"
            style={{ background: 'rgba(225,127,112,0.1)', borderColor: 'rgba(225,127,112,0.3)' }}
          >
            <div className="p-2 rounded-xl" style={{ background: 'rgba(225,127,112,0.15)' }}>
              <AlertCircle className="w-5 h-5" style={{ color: '#E17F70' }} />
            </div>
            <span className="font-medium" style={{ color: '#9E3B47' }}>{error}</span>
          </div>
        )}

        {success && (
          <div 
            className="flex items-center gap-3 p-5 rounded-2xl border mb-6"
            style={{ background: 'rgba(130,160,148,0.1)', borderColor: 'rgba(130,160,148,0.3)' }}
          >
            <div className="p-2 rounded-xl" style={{ background: 'rgba(130,160,148,0.15)' }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: '#82A094' }} />
            </div>
            <span className="font-medium" style={{ color: '#4F6A64' }}>{success}</span>
          </div>
        )}

        {/* Step 1: Vendor Information */}
        <div className="bg-white rounded-3xl border overflow-hidden mb-8" style={{ borderColor: 'rgba(174,191,195,0.3)', boxShadow: '0 10px 40px rgba(84,106,122,0.1)' }}>
          <div 
            className="p-6 border-b flex items-center justify-between"
            style={{ background: 'linear-gradient(90deg, #F8FAFB 0%, white 100%)', borderColor: 'rgba(174,191,195,0.2)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #CE9F6B 0%, #976E44 100%)', boxShadow: '0 8px 20px rgba(206,159,107,0.2)' }}
              >
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#546A7A' }}>Vendor Information</h2>
                <p className="text-sm" style={{ color: '#92A2A5' }}>Basic details about the vendor</p>
              </div>
            </div>
            <span 
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border"
              style={{ background: '#F8FAFB', color: '#92A2A5', borderColor: 'rgba(174,191,195,0.3)' }}
            >
              Step 01
            </span>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {/* Vendor Name */}
              <div className="md:col-span-2 xl:col-span-1 space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                  <User className="w-4 h-4" style={{ color: '#CE9F6B' }} />
                  Vendor Name <span style={{ color: '#E17F70' }}>*</span>
                </label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  placeholder="Enter vendor/company name"
                  className="w-full px-5 py-4 rounded-2xl text-lg font-medium transition-all focus:outline-none"
                  style={{ 
                    background: '#F8FAFB', 
                    border: '2px solid #AEBFC3', 
                    color: '#546A7A'
                  }}
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                  <Hash className="w-4 h-4" style={{ color: '#CE9F6B' }} />
                  Nick Name
                </label>
                <input
                  type="text"
                  name="nickName"
                  value={formData.nickName}
                  onChange={handleChange}
                  placeholder="Short reference name"
                  className="w-full px-5 py-4 rounded-2xl font-medium transition-all focus:outline-none"
                  style={{ background: '#F8FAFB', border: '2px solid #AEBFC3', color: '#546A7A' }}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                  <Mail className="w-4 h-4" style={{ color: '#CE9F6B' }} />
                  Email ID
                </label>
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  placeholder="vendor@company.com"
                  className="w-full px-5 py-4 rounded-2xl font-medium transition-all focus:outline-none"
                  style={{ background: '#F8FAFB', border: '2px solid #AEBFC3', color: '#546A7A' }}
                />
              </div>


            </div>

            {/* MSME Toggle */}
            <div 
              className="mt-8 p-6 rounded-3xl border"
              style={{ background: 'linear-gradient(135deg, #F8FAFB 0%, rgba(174,191,195,0.1) 100%)', borderColor: 'rgba(174,191,195,0.3)' }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-4 rounded-2xl transition-all duration-500"
                    style={{ 
                      background: formData.isMSME 
                        ? 'linear-gradient(135deg, #CE9F6B 0%, #976E44 100%)' 
                        : '#AEBFC3',
                      boxShadow: formData.isMSME ? '0 10px 30px rgba(206,159,107,0.3)' : 'none',
                      transform: formData.isMSME ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    <Sparkles className={`w-6 h-6 ${formData.isMSME ? 'animate-pulse' : ''}`} style={{ color: formData.isMSME ? 'white' : '#5D6E73' }} />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: '#546A7A' }}>MSME Registered Vendor?</p>
                    <p className="text-sm" style={{ color: '#92A2A5' }}>Enable for Micro, Small, or Medium Enterprises</p>
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
                  <div 
                    className="w-16 h-8 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-7 after:transition-all"
                    style={{ 
                      background: formData.isMSME 
                        ? 'linear-gradient(90deg, #CE9F6B 0%, #976E44 100%)' 
                        : '#AEBFC3'
                    }}
                  />
                </label>
              </div>

              {formData.isMSME && (
                <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                    <CreditCard className="w-4 h-4" style={{ color: '#CE9F6B' }} />
                    Udyam Registration Number <span style={{ color: '#E17F70' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="udyamRegNum"
                    value={formData.udyamRegNum}
                    onChange={handleChange}
                    placeholder="UDYAM-XX-00-0000000"
                    className="w-full px-5 py-4 rounded-2xl font-mono font-bold text-lg tracking-widest transition-all focus:outline-none"
                    style={{ background: 'white', border: '2px solid #CE9F6B', color: '#546A7A' }}
                    required={formData.isMSME}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Bank & Currency Details */}
        <div className="bg-white rounded-3xl border overflow-hidden mb-8" style={{ borderColor: 'rgba(174,191,195,0.3)', boxShadow: '0 10px 40px rgba(84,106,122,0.1)' }}>
          <div 
            className="p-6 border-b flex items-center justify-between"
            style={{ background: 'linear-gradient(90deg, #F8FAFB 0%, white 100%)', borderColor: 'rgba(174,191,195,0.2)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6F8A9D 0%, #546A7A 100%)', boxShadow: '0 8px 20px rgba(111,138,157,0.2)' }}
              >
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#546A7A' }}>Bank & Currency Details</h2>
                <p className="text-sm" style={{ color: '#92A2A5' }}>Account and routing information</p>
              </div>
            </div>
            <span 
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border"
              style={{ background: '#F8FAFB', color: '#92A2A5', borderColor: 'rgba(174,191,195,0.3)' }}
            >
              Step 02
            </span>
          </div>

          <div className="p-8 space-y-8">
            {/* Currency Selection */}
            <div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-3xl border"
              style={{ background: 'linear-gradient(135deg, rgba(150,174,194,0.1) 0%, rgba(111,138,157,0.05) 100%)', borderColor: 'rgba(150,174,194,0.2)' }}
            >
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                  <Globe className="w-4 h-4" style={{ color: '#6F8A9D' }} />
                  Settlement Currency <span style={{ color: '#E17F70' }}>*</span>
                </label>
                <div className="relative">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-2xl font-bold appearance-none cursor-pointer transition-all focus:outline-none"
                    style={{ background: 'white', border: '2px solid #96AEC2', color: '#546A7A' }}
                    required
                  >
                    <option value="INR">🇮🇳 INR — Indian Rupee</option>
                    <option value="EUR">🇪🇺 EUR — Euro</option>
                    <option value="USD">🇺🇸 USD — US Dollar</option>
                    <option value="Other">🌐 OTHER — Specify Code</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#96AEC2' }}>
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              {formData.currency === 'Other' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                  <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                    Specify ISO Code <span style={{ color: '#E17F70' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="otherCurrency"
                    value={formData.otherCurrency}
                    onChange={handleChange}
                    placeholder="e.g., GBP, JPY"
                    className="w-full px-5 py-4 rounded-2xl uppercase tracking-widest font-bold text-lg transition-all focus:outline-none"
                    style={{ background: 'white', border: '2px solid #96AEC2', color: '#546A7A' }}
                    required={formData.currency === 'Other'}
                  />
                </div>
              )}
            </div>

            {/* Tax Details - Conditional UI for INR */}
            <div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-3xl border"
              style={{ background: 'linear-gradient(135deg, rgba(206,159,107,0.08) 0%, rgba(151,110,68,0.04) 100%)', borderColor: 'rgba(206,159,107,0.2)' }}
            >
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                  <Shield className="w-4 h-4" style={{ color: '#CE9F6B' }} />
                  GST Number {formData.currency === 'INR' && <span className="text-[#E17F70]">*</span>}
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-5 py-4 rounded-2xl font-mono font-bold uppercase transition-all focus:outline-none"
                  style={{ background: 'white', border: '2px solid #AEBFC3', color: '#546A7A' }}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                  <BadgeCheck className="w-4 h-4" style={{ color: '#CE9F6B' }} />
                  PAN Number {formData.currency === 'INR' && <span className="text-[#E17F70]">*</span>}
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  className="w-full px-5 py-4 rounded-2xl font-mono font-bold uppercase transition-all focus:outline-none"
                  style={{ background: 'white', border: '2px solid #AEBFC3', color: '#546A7A' }}
                />
              </div>
            </div>
            {/* Bank Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                  <Building2 className="w-4 h-4" style={{ color: '#6F8A9D' }} />
                  Beneficiary Bank Name <span style={{ color: '#E17F70' }}>*</span>
                </label>
                <input
                  type="text"
                  name="beneficiaryBankName"
                  value={formData.beneficiaryBankName}
                  onChange={handleChange}
                  placeholder="e.g., State Bank of India"
                  className="w-full px-5 py-4 rounded-2xl font-medium transition-all focus:outline-none"
                  style={{ background: '#F8FAFB', border: '2px solid #AEBFC3', color: '#546A7A' }}
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider" style={{ color: '#5D6E73' }}>
                  <User className="w-4 h-4" style={{ color: '#6F8A9D' }} />
                  Beneficiary Name
                  <span className="ml-auto text-[10px] font-medium normal-case tracking-normal" style={{ color: '#92A2A5' }}>As per bank records</span>
                </label>
                <input
                  type="text"
                  name="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={handleChange}
                  placeholder="Full name as per bank records"
                  className="w-full px-5 py-4 rounded-2xl font-medium transition-all focus:outline-none"
                  style={{ background: '#F8FAFB', border: '2px solid #AEBFC3', color: '#546A7A' }}
                />
              </div>
            </div>

            {/* Account Details Card - Dark Kardex Theme */}
            <div 
              className="rounded-3xl p-8 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #546A7A 0%, #4F6A64 100%)' }}
            >
              {/* Card Background Effects */}
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(206,159,107,0.15) 0%, transparent 70%)' }}
                />
                <div 
                  className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-2xl"
                  style={{ background: 'radial-gradient(circle, rgba(150,174,194,0.15) 0%, transparent 70%)' }}
                />
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <CreditCard className="w-5 h-5" style={{ color: '#CE9F6B' }} />
                    </div>
                    <span className="font-bold uppercase tracking-wider text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Account Details</span>
                  </div>
                  <BadgeCheck className="w-6 h-6" style={{ color: '#82A094' }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Account Number <span style={{ color: '#E17F70' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter account number"
                      className="w-full px-5 py-4 rounded-2xl font-mono font-bold text-lg tracking-wider transition-all focus:outline-none"
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        border: '2px solid rgba(255,255,255,0.2)', 
                        color: 'white' 
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      IFSC / SWIFT Code <span style={{ color: '#E17F70' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      placeholder="e.g., SBIN0001234 or SWIFT-BIC"
                      className="w-full px-5 py-4 rounded-2xl font-mono font-black text-lg tracking-widest uppercase transition-all focus:outline-none"
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        border: '2px solid rgba(255,255,255,0.2)', 
                        color: '#CE9F6B' 
                      }}
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Confirm Account Number <span style={{ color: '#E17F70' }}>*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="confirmAccountNumber"
                        value={formData.confirmAccountNumber}
                        onChange={handleChange}
                        placeholder="Re-type account number for verification"
                        className="w-full px-5 py-4 rounded-2xl font-mono font-bold text-lg tracking-wider transition-all focus:outline-none"
                        style={{ 
                          background: formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                            ? 'rgba(225,127,112,0.2)'
                            : 'rgba(255,255,255,0.1)',
                          border: `2px solid ${formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber ? '#E17F70' : 'rgba(255,255,255,0.2)'}`,
                          color: formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber ? '#EEC1BF' : 'white'
                        }}
                        required
                      />
                      {formData.confirmAccountNumber && formData.accountNumber === formData.confirmAccountNumber && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <CheckCircle2 className="w-6 h-6" style={{ color: '#82A094' }} />
                        </div>
                      )}
                      {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-bounce">
                          <AlertCircle className="w-6 h-6" style={{ color: '#E17F70' }} />
                        </div>
                      )}
                    </div>
                    {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                      <p className="text-sm font-medium flex items-center gap-2 mt-2" style={{ color: '#E17F70' }}>
                        <X className="w-4 h-4" />
                        Account numbers must match
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Verification Documents */}
        <div className="bg-white rounded-3xl border overflow-hidden mb-8" style={{ borderColor: 'rgba(174,191,195,0.3)', boxShadow: '0 10px 40px rgba(84,106,122,0.1)' }}>
          <div 
            className="p-6 border-b flex items-center justify-between"
            style={{ background: 'linear-gradient(90deg, #F8FAFB 0%, white 100%)', borderColor: 'rgba(174,191,195,0.2)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #82A094 0%, #4F6A64 100%)', boxShadow: '0 8px 20px rgba(130,160,148,0.2)' }}
              >
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#546A7A' }}>Verification Documents</h2>
                <p className="text-sm" style={{ color: '#92A2A5' }}>Upload supporting documents</p>
              </div>
            </div>
            <span 
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border"
              style={{ background: '#F8FAFB', color: '#92A2A5', borderColor: 'rgba(174,191,195,0.3)' }}
            >
              Step 03
            </span>
          </div>
          
          <div className="p-8">
            <label 
              className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-3xl cursor-pointer transition-all group relative overflow-hidden"
              style={{ borderColor: '#AEBFC3', background: '#F8FAFB' }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, rgba(130,160,148,0.05) 0%, rgba(79,106,100,0.05) 100%)' }}
              />
              <div className="flex flex-col items-center justify-center py-8 relative">
                <div 
                  className="p-4 rounded-2xl transition-colors mb-4"
                  style={{ background: 'rgba(130,160,148,0.15)' }}
                >
                  <Upload className="w-10 h-10" style={{ color: '#4F6A64' }} />
                </div>
                <p className="text-lg font-bold mb-1" style={{ color: '#546A7A' }}>Drop files here or click to upload</p>
                <p style={{ color: '#92A2A5' }}>PDF, JPG, PNG, etc. (Max 20MB per file)</p>
              </div>
              <input type="file" className="hidden" multiple onChange={handleFileSelect} />
            </label>

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 rounded-2xl border group transition-all"
                    style={{ background: '#F8FAFB', borderColor: 'rgba(174,191,195,0.3)' }}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(130,160,148,0.15)' }}
                      >
                        <FileText className="w-6 h-6" style={{ color: '#4F6A64' }} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate" style={{ color: '#546A7A' }} title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs" style={{ color: '#92A2A5' }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 rounded-xl transition-all"
                      style={{ color: '#92A2A5' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Section */}
        <div 
          className="rounded-3xl border p-8"
          style={{ background: 'linear-gradient(135deg, #F8FAFB 0%, rgba(174,191,195,0.1) 100%)', borderColor: 'rgba(174,191,195,0.3)' }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Tips */}
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(206,159,107,0.15)' }}>
                <Info className="w-5 h-5" style={{ color: '#CE9F6B' }} />
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: '#546A7A' }}>Quick Tips</p>
                <ul className="text-sm space-y-1" style={{ color: '#5D6E73' }}>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#CE9F6B' }} />
                    Double-check account number to avoid payment failures
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#CE9F6B' }} />
                    IFSC: 4 letters + 0 + 6 alphanumeric (11 chars total)
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/finance/bank-accounts"
                className="px-8 py-4 rounded-2xl font-bold border-2 transition-all"
                style={{ background: 'white', borderColor: '#AEBFC3', color: '#5D6E73' }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !!success}
                className="flex items-center justify-center gap-3 px-10 py-4 rounded-2xl text-white font-black uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{ 
                  background: 'linear-gradient(135deg, #6F8A9D 0%, #546A7A 100%)',
                  boxShadow: '0 10px 30px rgba(111,138,157,0.3)'
                }}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : success ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                )}
                {isAdmin ? 'Create Vendor Account' : 'Submit for Approval'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
