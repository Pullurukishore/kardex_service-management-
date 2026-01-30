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
  AlertCircle, User, Calendar, Copy, ExternalLink, Check,
  FileText, Download, Trash, Upload, Loader2, FileIcon,
  Eye, FileSpreadsheet, FileImage, File
} from 'lucide-react';

export default function BankAccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const isAdmin = user?.financeRole === FinanceRole.FINANCE_ADMIN;

  useEffect(() => {
    loadAccount();
    loadAttachments();
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

  const loadAttachments = async () => {
    try {
      const data = await arApi.getBankAccountAttachments(params.id as string);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await arApi.uploadBankAccountAttachment(params.id as string, file);
      await loadAttachments();
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      alert('Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await arApi.deleteBankAccountAttachment(attachmentId);
      await loadAttachments();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      alert('Failed to delete attachment');
    }
  };

  const handleDownload = async (attachmentId: string) => {
    arApi.downloadBankAccountAttachment(attachmentId);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="w-5 h-5" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getFileColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'text-blue-500 bg-blue-50';
    if (mimeType.includes('pdf')) return 'text-red-500 bg-red-50';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'text-emerald-500 bg-emerald-50';
    return 'text-slate-500 bg-slate-50';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <h2 className="text-xl font-bold text-[#546A7A] mb-2">Vendor Account Not Found</h2>
        <p className="text-[#92A2A5] mb-4">The requested vendor account could not be found.</p>
        <Link
          href="/finance/bank-accounts"
          className="inline-flex items-center gap-2 text-[#CE9F6B] hover:text-[#976E44] font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vendor Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none">
      {/* Header - Full Width with Gradient Background */}
      <div className="bg-gradient-to-r from-[#546A7A]/5 via-[#CE9F6B]/5 to-transparent rounded-3xl p-6 mb-8 border border-[#AEBFC3]/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link
              href="/finance/bank-accounts"
              className="group p-3.5 rounded-2xl bg-white border border-[#AEBFC3]/30 text-[#5D6E73] hover:text-[#CE9F6B] hover:border-[#CE9F6B]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight finance-gradient-text">
                  {account.vendorName}
                </h1>
                {account.isActive && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#82A094]/15 text-[#4F6A64] text-[10px] font-black uppercase tracking-widest border border-[#82A094]/30 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Active
                  </div>
                )}
              </div>
              {account.nickName && (
                <p className="text-[#CE9F6B] text-sm mt-2 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  "{account.nickName}"
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/finance/bank-accounts/${account.id}/edit`}
              className="finance-btn-primary finance-shimmer flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] text-white font-bold hover:shadow-xl hover:shadow-[#6F8A9D]/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">{isAdmin ? 'Administrative Edit' : 'Initiate Change Request'}</span>
              <span className="sm:hidden">Edit</span>
            </Link>
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#E17F70]/5 border border-[#E17F70]/20 text-[#E17F70] font-bold hover:bg-[#E17F70] hover:text-white hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Terminate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Details Card */}
        <div className="xl:col-span-3 space-y-6">
          {/* Status Card */}
          <div className={`finance-card-glow rounded-3xl p-8 border-2 ${
            account.isActive 
              ? 'bg-gradient-to-br from-[#82A094]/10 via-white to-[#82A094]/5 border-[#82A094]/30 shadow-2xl shadow-[#82A094]/10' 
              : 'bg-gradient-to-br from-[#AEBFC3]/10 via-white to-[#AEBFC3]/5 border-[#AEBFC3]/30 shadow-2xl'
          } animate-in fade-in zoom-in duration-500`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                  account.isActive 
                    ? 'bg-gradient-to-br from-[#82A094] to-[#4F6A64]' 
                    : 'bg-gradient-to-br from-[#AEBFC3] to-[#8A9A9E]'
                } shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500`}>
                  {account.isActive 
                    ? <CheckCircle2 className="w-10 h-10 text-white" /> 
                    : <XCircle className="w-10 h-10 text-white" />
                  }
                </div>
                <div>
                  <p className="text-[#92A2A5] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Operational Lifecycle</p>
                  <p className={`text-4xl font-black ${account.isActive ? 'text-[#4F6A64]' : 'text-[#92A2A5]'}`}>
                    {account.isActive ? 'Active' : 'Archived'}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#AEBFC3]/20 text-[#92A2A5] text-xs font-bold shadow-sm">
                  <Calendar className="w-4 h-4 text-[#CE9F6B]" />
                  Authored {formatDate(account.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white rounded-3xl border border-[#AEBFC3]/20 overflow-hidden shadow-2xl finance-card-glow">
            <div className="p-6 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#CE9F6B]/15 via-white to-transparent flex items-center justify-between">
              <h2 className="text-xl font-black text-[#546A7A] flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#CE9F6B]/10">
                  <Building2 className="w-6 h-6 text-[#CE9F6B]" />
                </div>
                Primary Bank Infrastructure
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#AEBFC3] bg-[#F8FAFB] px-3 py-1 rounded-full border border-[#AEBFC3]/20">Verified</span>
            </div>
            <div className="p-6 space-y-6">
              {/* Primary Details Grid - 3 columns on large screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-[#F8FAFB] border border-[#AEBFC3]/15 hover:shadow-lg hover:border-[#CE9F6B]/30 transition-all duration-300">
                  <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-3">
                    <Building2 className="w-4 h-4" />
                    Beneficiary Bank
                  </div>
                  <p className="text-[#546A7A] font-bold text-lg">{account.beneficiaryBankName}</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8FAFB] border border-[#AEBFC3]/15 hover:shadow-lg hover:border-[#CE9F6B]/30 transition-all duration-300">
                  <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-3">
                    <Hash className="w-4 h-4" />
                    IFSC Code
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[#CE9F6B] font-mono text-lg font-bold">{account.ifscCode}</p>
                    <button 
                      onClick={() => copyToClipboard(account.ifscCode, 'ifsc')}
                      className="p-2 rounded-xl hover:bg-[#CE9F6B]/10 text-[#92A2A5] hover:text-[#CE9F6B] transition-all"
                    >
                      {copied === 'ifsc' ? <Check className="w-4 h-4 text-[#82A094]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8FAFB] border border-[#AEBFC3]/15 hover:shadow-lg hover:border-[#CE9F6B]/30 transition-all duration-300">
                  <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-3">
                    <CreditCard className="w-4 h-4" />
                    Currency
                  </div>
                  <p className="text-[#546A7A] font-bold text-lg uppercase">{account.currency}</p>
                </div>
              </div>

              {/* Beneficiary Name - Full Width Highlight */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#CE9F6B]/8 to-[#CE9F6B]/3 border border-[#CE9F6B]/20 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-3">
                  <User className="w-4 h-4 text-[#CE9F6B]" />
                  Beneficiary Name
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[#546A7A] font-bold text-xl">{account.beneficiaryName || account.vendorName}</p>
                  <button 
                    onClick={() => copyToClipboard(account.beneficiaryName || account.vendorName, 'beneficiary')}
                    className="p-2 rounded-xl hover:bg-[#CE9F6B]/10 text-[#92A2A5] hover:text-[#CE9F6B] transition-all"
                  >
                    {copied === 'beneficiary' ? <Check className="w-4 h-4 text-[#82A094]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Account Number - Prominent Display */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#546A7A]/8 via-[#CE9F6B]/5 to-transparent border-2 border-[#CE9F6B]/25 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-3">
                  <CreditCard className="w-4 h-4" />
                  Account Number
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[#546A7A] font-mono text-2xl font-black tracking-widest">{account.accountNumber}</p>
                  <button 
                    onClick={() => copyToClipboard(account.accountNumber, 'account')}
                    className="p-2.5 rounded-xl bg-white border border-[#CE9F6B]/20 hover:bg-[#CE9F6B]/10 text-[#92A2A5] hover:text-[#CE9F6B] transition-all shadow-sm"
                  >
                    {copied === 'account' ? <Check className="w-5 h-5 text-[#82A094]" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Details Card */}
          <div className="bg-white rounded-3xl border border-[#AEBFC3]/20 overflow-hidden shadow-2xl finance-card-glow">
            <div className="p-6 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#6F8A9D]/10 via-[#6F8A9D]/5 to-transparent">
              <h2 className="text-xl font-black text-[#546A7A] flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#6F8A9D]/10">
                  <User className="w-6 h-6 text-[#6F8A9D]" />
                </div>
                Vendor Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-[#F8FAFB] border border-[#AEBFC3]/15 hover:shadow-lg hover:border-[#6F8A9D]/30 transition-all duration-300">
                <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-3">
                  <User className="w-4 h-4" />
                  Vendor Name
                </div>
                <p className="text-[#546A7A] font-bold text-lg">{account.vendorName}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8FAFB] border border-[#AEBFC3]/15 hover:shadow-lg hover:border-[#6F8A9D]/30 transition-all duration-300">
                <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-3">
                  <Hash className="w-4 h-4" />
                  Nick Name
                </div>
                <p className="text-[#546A7A] font-bold text-lg">{account.nickName || '—'}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8FAFB] border border-[#AEBFC3]/15 hover:shadow-lg hover:border-[#6F8A9D]/30 transition-all duration-300">
                <div className="flex items-center gap-2 text-[#92A2A5] text-sm mb-3">
                  <Mail className="w-4 h-4" />
                  Email ID
                </div>
                <p className="text-[#546A7A] font-bold text-lg break-all">{account.emailId || '—'}</p>
              </div>

              {account.isMSME && (
                <div className="sm:col-span-2 lg:col-span-3 p-5 rounded-2xl bg-gradient-to-r from-[#CE9F6B]/10 to-[#CE9F6B]/5 border border-[#CE9F6B]/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[#CE9F6B] text-sm mb-2 font-bold">
                        <Sparkles className="w-4 h-4" />
                        MSME Registered
                      </div>
                      <p className="text-[#546A7A] text-xs mb-1">Udyam Registration Number</p>
                      <p className="text-[#546A7A] font-mono text-xl font-black tracking-wider">{account.udyamRegNum}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(account.udyamRegNum || '', 'udyam')}
                      className="p-3 rounded-xl bg-white border border-[#CE9F6B]/20 text-[#CE9F6B] hover:bg-[#CE9F6B] hover:text-white transition-all shadow-sm"
                    >
                      {copied === 'udyam' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments Card */}
          <div className="bg-white rounded-3xl border border-[#AEBFC3]/20 overflow-hidden shadow-2xl finance-card-glow">
            <div className="p-6 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#82A094]/10 via-[#82A094]/5 to-transparent flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-black text-[#546A7A] flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#82A094]/10">
                  <FileText className="w-6 h-6 text-[#82A094]" />
                </div>
                Verification Documents
              </h2>
              <label className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white text-sm font-bold cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Add Document
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            <div className="p-6">
              {attachments.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-b from-[#F8FAFB] to-white rounded-2xl border-2 border-dashed border-[#AEBFC3]/30">
                  <FileIcon className="w-16 h-16 text-[#AEBFC3]/40 mx-auto mb-4" />
                  <p className="text-[#92A2A5] font-bold text-lg">No documents attached yet</p>
                  <p className="text-sm text-[#92A2A5] mt-2 max-w-xs mx-auto">Upload verification documents like cancelled cheques, bank statements, or authorization letters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {attachments.map((file) => (
                    <div key={file.id} className="group relative p-5 rounded-2xl bg-white border border-[#AEBFC3]/20 hover:border-[#82A094]/40 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 duration-300 ${getFileColor(file.mimeType)}`}>
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#546A7A] truncate" title={file.filename}>
                              {file.filename}
                            </p>
                            <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#AEBFC3]/10 text-[#92A2A5] text-[10px] font-bold uppercase tracking-tight">
                              {file.filename.split('.').pop()}
                            </span>
                          </div>
                          <p className="text-xs text-[#92A2A5] mt-2 font-medium">
                            {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 pt-4 border-t border-[#AEBFC3]/10">
                        <button 
                          onClick={() => handleDownload(file.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#82A094]/10 text-[#82A094] text-xs font-bold hover:bg-[#82A094] hover:text-white transition-all shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteAttachment(file.id)}
                            className="p-2.5 rounded-xl bg-[#F8FAFB] text-[#92A2A5] hover:text-[#E17F70] hover:bg-[#E17F70]/10 transition-all border border-transparent hover:border-[#E17F70]/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-5 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#CE9F6B]/5 to-transparent">
              <h3 className="font-bold text-[#546A7A]">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href={`/finance/bank-accounts/${account.id}/edit`}
                className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-gradient-to-r hover:from-[#CE9F6B]/10 hover:to-transparent text-[#5D6E73] hover:text-[#976E44] transition-all group"
              >
                <div className="p-2.5 bg-[#CE9F6B]/10 rounded-xl group-hover:bg-[#CE9F6B]/20 group-hover:scale-110 transition-all duration-300">
                  <Pencil className="w-4 h-4 text-[#CE9F6B]" />
                </div>
                <span className="font-semibold">{isAdmin ? 'Edit Details' : 'Request Changes'}</span>
              </Link>
              <Link
                href="/finance/bank-accounts/requests"
                className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-gradient-to-r hover:from-[#6F8A9D]/10 hover:to-transparent text-[#5D6E73] hover:text-[#6F8A9D] transition-all group"
              >
                <div className="p-2.5 bg-[#6F8A9D]/10 rounded-xl group-hover:bg-[#6F8A9D]/20 group-hover:scale-110 transition-all duration-300">
                  <Clock className="w-4 h-4 text-[#6F8A9D]" />
                </div>
                <span className="font-semibold">View Requests</span>
              </Link>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-5 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#82A094]/5 to-transparent">
              <h3 className="font-bold text-[#546A7A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#CE9F6B]" />
                Activity Timeline
              </h3>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#82A094] ring-4 ring-[#82A094]/20" />
                  <div className="flex-1 w-0.5 bg-gradient-to-b from-[#82A094]/40 to-[#CE9F6B]/40" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-bold text-[#546A7A]">Last Updated</p>
                  <p className="text-xs text-[#92A2A5] mt-1">{formatDate(account.updatedAt)}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#CE9F6B] ring-4 ring-[#CE9F6B]/20" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#546A7A]">Created</p>
                  <p className="text-xs text-[#92A2A5] mt-1">{formatDate(account.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Request History */}
          {account.changeRequests && account.changeRequests.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-5 border-b border-[#AEBFC3]/10 bg-gradient-to-r from-[#CE9F6B]/5 to-transparent">
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
                    className="block px-5 py-4 hover:bg-gradient-to-r hover:from-[#CE9F6B]/5 hover:to-transparent transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          request.status === 'APPROVED' ? 'bg-[#82A094]/15 text-[#4F6A64]' :
                          request.status === 'REJECTED' ? 'bg-[#E17F70]/15 text-[#E17F70]' :
                          'bg-[#CE9F6B]/15 text-[#976E44]'
                        }`}>
                          {request.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> :
                           request.status === 'REJECTED' ? <XCircle className="w-4 h-4" /> :
                           <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#546A7A]">{request.requestType}</p>
                          <p className="text-xs text-[#92A2A5] mt-0.5">{formatDate(request.requestedAt)}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
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
