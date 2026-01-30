'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, BankAccount } from '@/lib/ar-api';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceRole } from '@/types/user.types';
import { 
  Plus, Building2, CreditCard, Check, X, Sparkles, 
  Search, Eye, Pencil, Trash2, Clock, Bell, TrendingUp,
  Hash, FileSpreadsheet, Landmark, Copy, ChevronRight,
  Grid3x3, List, Power, EyeOff
} from 'lucide-react';

// Color palette for vendor avatars - each vendor gets a consistent color based on name
const VENDOR_COLORS = [
  { bg: 'bg-gradient-to-br from-[#CE9F6B] to-[#976E44]', ring: 'ring-[#CE9F6B]/20' },
  { bg: 'bg-gradient-to-br from-[#82A094] to-[#4F6A64]', ring: 'ring-[#82A094]/20' },
  { bg: 'bg-gradient-to-br from-[#6F8A9D] to-[#546A7A]', ring: 'ring-[#6F8A9D]/20' },
  { bg: 'bg-gradient-to-br from-[#E17F70] to-[#C45C4D]', ring: 'ring-[#E17F70]/20' },
  { bg: 'bg-gradient-to-br from-[#7C9EB2] to-[#5A7A8C]', ring: 'ring-[#7C9EB2]/20' },
  { bg: 'bg-gradient-to-br from-[#A8B5A0] to-[#7A8B6F]', ring: 'ring-[#A8B5A0]/20' },
  { bg: 'bg-gradient-to-br from-[#D4A574] to-[#B8865A]', ring: 'ring-[#D4A574]/20' },
  { bg: 'bg-gradient-to-br from-[#8E9AAF] to-[#6B7A94]', ring: 'ring-[#8E9AAF]/20' },
];

// Get consistent color based on vendor name hash
const getVendorColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return VENDOR_COLORS[Math.abs(hash) % VENDOR_COLORS.length];
};

// Get initials from vendor name (max 2 characters)
const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

export default function BankAccountsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showInactive, setShowInactive] = useState(false);

  const isAdmin = user?.financeRole === FinanceRole.FINANCE_ADMIN;

  useEffect(() => {
    loadBankAccounts();
    loadPendingCount();
  }, [showInactive]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const data = await arApi.getBankAccounts({ activeOnly: !showInactive });
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCount = async () => {
    try {
      const stats = await arApi.getRequestStats();
      setPendingCount(stats.pending);
    } catch (error) {
      console.error('Failed to load pending count:', error);
    }
  };

  const handleToggleStatus = async (account: BankAccount, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !account.isActive;
    if (!confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this vendor account?`)) return;
    
    try {
      await arApi.updateBankAccount(account.id, { isActive: newStatus });
      await loadBankAccounts();
    } catch (error) {
      console.error('Failed to toggle bank account status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
      await arApi.deleteBankAccount(id);
      await loadBankAccounts();
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      alert('Failed to delete bank account');
    }
  };

  const filteredAccounts = accounts.filter(account => 
    !searchTerm || 
    account.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.nickName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber.includes(searchTerm) ||
    account.beneficiaryBankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Stats Cards Row - Compact Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Vendors - Brand Brown */}
        <div className="bg-[#B18E63] rounded-2xl p-4 text-white shadow-lg shadow-[#CE9F6B]/15 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-5 h-5" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">Total Vendors</p>
            <p className="text-2xl font-black tracking-tight">{loading ? '--' : accounts.length}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Active Vendors - Brand Green */}
        <div className="bg-[#718E85] rounded-2xl p-4 text-white shadow-lg shadow-[#82A094]/15 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Check className="w-5 h-5" />
            </div>
            <Sparkles className="w-5 h-5 opacity-40 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-0.5">Active Vendors</p>
            <p className="text-2xl font-black tracking-tight">{loading ? '--' : accounts.filter(a => a.isActive).length}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Vendor Banks - Premium White */}
        <div className="bg-white rounded-2xl p-4 border border-[#AEBFC3]/15 shadow-lg shadow-[#AEBFC3]/5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-[#6F8A9D]/5 flex items-center justify-center group-hover:bg-[#6F8A9D]/10 transition-colors duration-300 shadow-sm border border-[#6F8A9D]/10">
              <Hash className="w-5 h-5 text-[#6F8A9D]" />
            </div>
            <Landmark className="w-5 h-5 text-[#AEBFC3]/30" />
          </div>
          <div className="relative z-10">
            <p className="text-[#92A2A5] text-[10px] font-bold uppercase tracking-wider mb-0.5">Vendor Banks</p>
            <p className="text-2xl font-black tracking-tight text-[#546A7A]">
              {loading ? '--' : new Set(accounts.map(a => a.beneficiaryBankName)).size}
            </p>
          </div>
        </div>

        {/* Pending Requests - Interaction White */}
        <Link 
          href="/finance/bank-accounts/requests"
          className="bg-white rounded-2xl p-4 border border-[#AEBFC3]/15 shadow-lg shadow-[#AEBFC3]/5 hover:border-[#E17F70]/40 transition-all duration-300 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-[#E17F70]/5 flex items-center justify-center group-hover:bg-[#E17F70]/20 transition-colors duration-300 shadow-sm border border-[#E17F70]/10">
              <Clock className="w-5 h-5 text-[#E17F70]" />
            </div>
            {pendingCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#E17F70]/10 text-[#E17F70] text-[9px] font-black uppercase tracking-widest animate-pulse shadow-sm">
                Urgent
              </span>
            )}
          </div>
          <div className="relative z-10">
            <p className="text-[#92A2A5] text-[10px] font-bold uppercase tracking-wider mb-0.5 group-hover:text-[#E17F70] transition-colors duration-300">Requests</p>
            <p className="text-2xl font-black tracking-tight text-[#546A7A] group-hover:scale-105 transition-transform origin-left duration-300">
              {pendingCount}
            </p>
          </div>
        </Link>
      </div>

      {/* Header with Search and Actions */}
      <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center shadow-lg shadow-[#CE9F6B]/25">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#546A7A] flex items-center gap-2">
                All Vendor Accounts
                <Sparkles className="w-4 h-4 text-[#CE9F6B]" />
              </h2>
              <p className="text-[#92A2A5] text-sm mt-0.5">
                {loading ? 'Loading...' : `${filteredAccounts.length} vendors found`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[280px] flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#92A2A5]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search vendors..."
                  className="w-full pl-12 pr-4 py-3 bg-[#F8FAFB] border border-[#AEBFC3]/20 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
                />
              </div>

              {/* Show Inactive Toggle - Only for Admin */}
              {isAdmin && (
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all truncate whitespace-nowrap ${
                    showInactive 
                      ? 'bg-[#AEBFC3]/20 border-[#AEBFC3] text-[#546A7A] shadow-inner' 
                      : 'bg-white border-[#AEBFC3]/20 text-[#92A2A5] hover:border-[#CE9F6B]/30'
                  }`}
                  title={showInactive ? "Hide Inactive" : "Show Inactive"}
                >
                  <EyeOff className={`w-4 h-4 ${showInactive ? 'text-[#546A7A]' : 'text-[#AEBFC3]'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">
                    {showInactive ? 'Showing All' : 'Show Inactive'}
                  </span>
                </button>
              )}
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              {isAdmin && pendingCount > 0 && (
                <Link
                  href="/finance/bank-accounts/requests"
                  className="relative flex items-center gap-2 px-4 py-3 rounded-xl bg-[#E17F70]/10 border border-[#E17F70]/30 text-[#E17F70] font-semibold hover:bg-[#E17F70]/20 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  <span>{pendingCount}</span>
                </Link>
              )}
              
              {!isAdmin && (
                <Link
                  href="/finance/bank-accounts/requests"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#AEBFC3]/10 border border-[#AEBFC3]/30 text-[#5D6E73] font-medium hover:border-[#CE9F6B]/30 transition-all"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">My Requests</span>
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  href="/finance/bank-accounts/import"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#CE9F6B]/10 border border-[#CE9F6B]/30 text-[#976E44] font-semibold hover:bg-[#CE9F6B]/20 transition-all shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Bulk Import</span>
                </Link>
              )}
              
              <Link 
                href="/finance/bank-accounts/new"
                className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white font-semibold hover:from-[#4F6A64] hover:to-[#3D524D] transition-all duration-300 shadow-lg shadow-[#82A094]/25 hover:shadow-[#82A094]/40"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                <span className="hidden sm:inline">{isAdmin ? 'Add Account' : 'Request New'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Accounts Grid */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-[#546A7A]">
              {loading ? 'Loading vendors...' : `${filteredAccounts.length} Vendor Accounts`}
            </h3>
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#92A2A5]">
              <span className="w-2 h-2 rounded-full bg-[#82A094] animate-pulse" />
              {accounts.filter(a => a.isActive).length} Active
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 border-2 border-[#AEBFC3]/20 rounded-xl p-1 bg-white shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'grid' 
                  ? 'bg-[#CE9F6B] text-white shadow-md' 
                  : 'text-[#92A2A5] hover:text-[#546A7A] hover:bg-[#F8FAFB]'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'table' 
                  ? 'bg-[#CE9F6B] text-white shadow-md' 
                  : 'text-[#92A2A5] hover:text-[#546A7A] hover:bg-[#F8FAFB]'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
        </div>

        {loading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#AEBFC3]/20 p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#AEBFC3]/20 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 bg-[#AEBFC3]/20 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-[#AEBFC3]/15 rounded w-1/2" />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-10 bg-[#AEBFC3]/10 rounded-xl" />
                  <div className="h-10 bg-[#AEBFC3]/10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAccounts.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-3xl border-2 border-dashed border-[#AEBFC3]/30 p-12 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#CE9F6B]/20 to-[#CE9F6B]/5 flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-[#CE9F6B]/50" />
            </div>
            <h3 className="text-xl font-bold text-[#546A7A] mb-2">
              {searchTerm ? 'No matching vendors found' : 'No vendor accounts yet'}
            </h3>
            <p className="text-[#92A2A5] mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or clear the filter'
                : 'Add your first vendor account to start managing payments'}
            </p>
            <Link 
              href="/finance/bank-accounts/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add First Vendor
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          // Vendor Cards Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filteredAccounts.map((account) => {
              const vendorColor = getVendorColor(account.vendorName);
              const initials = getInitials(account.vendorName);
              
              return (
                <div 
                  key={account.id}
                  onClick={() => router.push(`/finance/bank-accounts/${account.id}`)}
                  className="group relative bg-white rounded-3xl border border-[#AEBFC3]/15 overflow-hidden shadow-md hover:shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Top Gradient Bar */}
                  <div className={`h-1.5 ${vendorColor.bg}`} />
                  
                  {/* Main Content */}
                  <div className="p-5">
                    {/* Header Row */}
                    <div className="flex items-start gap-4 mb-5">
                      {/* Initials Avatar */}
                      <div className={`relative w-16 h-16 shrink-0 rounded-2xl ${vendorColor.bg} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <span className="text-white font-black text-xl tracking-tight drop-shadow-sm">{initials}</span>
                        {/* Status dot */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white flex items-center justify-center ${account.isActive ? 'bg-[#82A094]' : 'bg-[#AEBFC3]'}`}>
                          {account.isActive ? <Check className="w-3 h-3 text-white" /> : <X className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </div>
                      
                      {/* Vendor Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="font-bold text-[#546A7A] text-lg leading-tight group-hover:text-[#976E44] transition-colors truncate" title={account.vendorName}>
                            {account.vendorName}
                          </h3>
                          {account.nickName && (
                            <span className="inline-flex px-2 py-0.5 rounded-lg bg-[#CE9F6B]/15 text-[#976E44] text-[10px] font-bold uppercase tracking-wider">
                              "{account.nickName}"
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#92A2A5] truncate" title={account.beneficiaryName || 'Same as vendor'}>
                          {account.beneficiaryName && account.beneficiaryName !== account.vendorName 
                            ? account.beneficiaryName
                            : 'Beneficiary same as vendor'}
                        </p>
                        {/* Tags Row */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-[#6F8A9D]/10 text-[#546A7A] font-bold text-[10px] uppercase tracking-wide">
                            {account.currency}
                          </span>
                          {account.isMSME && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#CE9F6B]/10 text-[#976E44] text-[10px] font-bold uppercase tracking-wide">
                              <Sparkles className="w-2.5 h-2.5" />
                              MSME
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                            account.isActive ? 'bg-[#82A094]/10 text-[#4F6A64]' : 'bg-[#AEBFC3]/10 text-[#92A2A5]'
                          }`}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Admin Quick Toggle */}
                      {isAdmin && (
                        <button
                          onClick={(e) => handleToggleStatus(account, e)}
                          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            account.isActive 
                              ? 'bg-[#82A094]/10 text-[#82A094] hover:bg-[#E17F70]/10 hover:text-[#E17F70]' 
                              : 'bg-[#AEBFC3]/10 text-[#92A2A5] hover:bg-[#82A094]/20 hover:text-[#82A094]'
                          }`}
                          title={account.isActive ? "Deactivate Vendor" : "Activate Vendor"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {/* Bank Details Card */}
                    <div className="bg-gradient-to-br from-[#F8FAFB] to-white rounded-2xl border border-[#AEBFC3]/10 p-4 space-y-3">
                      {/* Bank Row */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#6F8A9D]/10 flex items-center justify-center">
                          <Landmark className="w-4 h-4 text-[#6F8A9D]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-[#92A2A5] uppercase tracking-wider font-medium">Bank</p>
                          <p className="font-semibold text-[#546A7A] truncate text-sm">{account.beneficiaryBankName}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="shrink-0 px-2.5 py-1.5 rounded-xl bg-[#CE9F6B]/10 text-[#976E44] font-mono font-black text-xs tracking-wider" title="IFSC / SWIFT Code">
                            {account.ifscCode}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(account.ifscCode);
                              const btn = e.currentTarget;
                              btn.classList.add('!bg-[#82A094]/20', '!text-[#82A094]');
                              setTimeout(() => btn.classList.remove('!bg-[#82A094]/20', '!text-[#82A094]'), 1000);
                            }}
                            className="shrink-0 p-1.5 rounded-lg bg-white border border-[#AEBFC3]/20 hover:border-[#CE9F6B]/40 text-[#92A2A5] hover:text-[#CE9F6B] transition-all"
                            title="Copy IFSC / SWIFT Code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Account Number Row */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#AEBFC3]/15 group/copy">
                        <div className="w-8 h-8 rounded-lg bg-[#CE9F6B]/10 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-[#CE9F6B]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-[#92A2A5] uppercase tracking-wider font-medium">Account Number</p>
                          <p className="font-mono font-black text-[#546A7A] tracking-widest truncate text-sm" title={account.accountNumber}>
                            {account.accountNumber}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(account.accountNumber);
                            // Visual feedback
                            const btn = e.currentTarget;
                            btn.classList.add('!bg-[#82A094]/20', '!text-[#82A094]');
                            setTimeout(() => btn.classList.remove('!bg-[#82A094]/20', '!text-[#82A094]'), 1000);
                          }}
                          className="shrink-0 p-2.5 rounded-xl bg-[#F8FAFB] hover:bg-[#CE9F6B]/15 text-[#92A2A5] hover:text-[#CE9F6B] transition-all duration-200"
                          title="Copy Account Number"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="px-5 py-3 bg-gradient-to-r from-[#F8FAFB] to-transparent border-t border-[#AEBFC3]/10 flex items-center justify-between">
                    <span className="text-xs text-[#92A2A5] group-hover:text-[#CE9F6B] transition-colors">
                      Click to view details
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <Link
                        href={`/finance/bank-accounts/${account.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl hover:bg-[#6F8A9D]/15 text-[#92A2A5] hover:text-[#6F8A9D] transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/finance/bank-accounts/${account.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl hover:bg-[#CE9F6B]/15 text-[#92A2A5] hover:text-[#CE9F6B] transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDelete(account.id, e)}
                          className="p-2 rounded-xl hover:bg-[#E17F70]/15 text-[#92A2A5] hover:text-[#E17F70] transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronRight className="w-5 h-5 text-[#CE9F6B] ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Vendor Accounts Table View
          <div className="bg-white rounded-3xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#F8FAFB] border-b border-[#AEBFC3]/20">
                  <th className="px-6 py-4 text-[11px] font-black text-[#546A7A] uppercase tracking-widest text-center w-20">Avatar</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#546A7A] uppercase tracking-widest min-w-[200px]">Vendor Info</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#546A7A] uppercase tracking-widest">Bank Details</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#546A7A] uppercase tracking-widest">Account Number</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#546A7A] uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black text-[#546A7A] uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#AEBFC3]/10">
                {filteredAccounts.map((account) => {
                  const vendorColor = getVendorColor(account.vendorName);
                  const initials = getInitials(account.vendorName);
                  
                  return (
                    <tr 
                      key={account.id}
                      onClick={() => router.push(`/finance/bank-accounts/${account.id}`)}
                      className="group hover:bg-[#F8FAFB]/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-center">
                        <div className={`w-10 h-10 rounded-xl ${vendorColor.bg} flex items-center justify-center shadow-md mx-auto group-hover:scale-110 transition-transform`}>
                          <span className="text-white font-black text-xs">{initials}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#546A7A] group-hover:text-[#976E44] transition-colors">{account.vendorName}</span>
                          {account.nickName && (
                            <span className="text-[10px] font-bold text-[#CE9F6B] uppercase tracking-wide mt-0.5">"{account.nickName}"</span>
                          )}
                          <span className="text-xs text-[#92A2A5] mt-0.5 truncate max-w-[180px]">
                            {account.beneficiaryName && account.beneficiaryName !== account.vendorName 
                              ? account.beneficiaryName
                              : 'Same as vendor'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#546A7A]">{account.beneficiaryBankName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-black text-[#976E44] bg-[#CE9F6B]/10 px-1.5 py-0.5 rounded-md" title="IFSC / SWIFT Code">
                              {account.ifscCode}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(account.ifscCode);
                              }}
                              className="text-[#AEBFC3] hover:text-[#CE9F6B] transition-colors"
                              title="Copy IFSC / SWIFT Code"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm tracking-widest text-[#546A7A]">{account.accountNumber}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(account.accountNumber);
                            }}
                            className="text-[#AEBFC3] hover:text-[#CE9F6B] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            account.isActive 
                              ? 'bg-[#82A094]/10 text-[#4F6A64]' 
                              : 'bg-[#AEBFC3]/10 text-[#92A2A5]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${account.isActive ? 'bg-[#82A094]' : 'bg-[#AEBFC3]'}`} />
                            {account.isActive ? 'Active' : 'Inactive'}
                          </span>
                          
                          {isAdmin && (
                            <button
                              onClick={(e) => handleToggleStatus(account, e)}
                              className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded border transition-all ${
                                account.isActive 
                                  ? 'border-[#E17F70]/30 text-[#E17F70] hover:bg-[#E17F70]/10' 
                                  : 'border-[#82A094]/30 text-[#82A094] hover:bg-[#82A094]/10'
                              }`}
                            >
                              <Power className="w-2.5 h-2.5" />
                              {account.isActive ? 'Disable' : 'Enable'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/finance/bank-accounts/${account.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl hover:bg-[#6F8A9D]/10 text-[#AEBFC3] hover:text-[#6F8A9D] transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/finance/bank-accounts/${account.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl hover:bg-[#CE9F6B]/10 text-[#AEBFC3] hover:text-[#CE9F6B] transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {isAdmin && (
                            <button
                              onClick={(e) => handleDelete(account.id, e)}
                              className="p-2 rounded-xl hover:bg-[#E17F70]/10 text-[#AEBFC3] hover:text-[#E17F70] transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
