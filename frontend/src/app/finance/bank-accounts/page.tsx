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
  Hash, MoreHorizontal
} from 'lucide-react';

export default function BankAccountsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const isAdmin = user?.financeRole === FinanceRole.FINANCE_ADMIN;

  useEffect(() => {
    loadBankAccounts();
    loadPendingCount();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const data = await arApi.getBankAccounts({ activeOnly: true });
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
    account.nickName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber.includes(searchTerm) ||
    account.beneficiaryBankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#CE9F6B] to-[#976E44] rounded-2xl p-5 text-white shadow-lg shadow-[#CE9F6B]/25">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-white/70 text-sm font-medium">Total Accounts</p>
          <p className="text-3xl font-bold">{loading ? '--' : accounts.length}</p>
        </div>

        <div className="bg-gradient-to-br from-[#82A094] to-[#4F6A64] rounded-2xl p-5 text-white shadow-lg shadow-[#82A094]/25">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
          </div>
          <p className="text-white/70 text-sm font-medium">Active Accounts</p>
          <p className="text-3xl font-bold">{loading ? '--' : accounts.filter(a => a.isActive).length}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#AEBFC3]/20 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#6F8A9D]/10 flex items-center justify-center">
              <Hash className="w-6 h-6 text-[#6F8A9D]" />
            </div>
          </div>
          <p className="text-[#92A2A5] text-sm font-medium">Unique Banks</p>
          <p className="text-3xl font-bold text-[#546A7A]">
            {loading ? '--' : new Set(accounts.map(a => a.beneficiaryBankName)).size}
          </p>
        </div>

        <Link 
          href="/finance/bank-accounts/requests"
          className="bg-white rounded-2xl p-5 border border-[#AEBFC3]/20 shadow-lg hover:border-[#E17F70]/40 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#E17F70]/10 flex items-center justify-center group-hover:bg-[#E17F70]/20 transition-colors">
              <Clock className="w-6 h-6 text-[#E17F70]" />
            </div>
            {pendingCount > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E17F70]/10 text-[#E17F70] text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#E17F70]" />
                {pendingCount}
              </span>
            )}
          </div>
          <p className="text-[#92A2A5] text-sm font-medium group-hover:text-[#E17F70] transition-colors">Pending Requests</p>
          <p className="text-3xl font-bold text-[#546A7A] group-hover:text-[#E17F70] transition-colors">{pendingCount}</p>
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
                All Bank Accounts
                <Sparkles className="w-4 h-4 text-[#CE9F6B]" />
              </h2>
              <p className="text-[#92A2A5] text-sm mt-0.5">
                {loading ? 'Loading...' : `${filteredAccounts.length} accounts found`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#92A2A5]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search accounts..."
                className="w-full pl-12 pr-4 py-3 bg-[#F8FAFB] border border-[#AEBFC3]/20 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 focus:bg-white transition-all"
              />
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

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-[#AEBFC3]/20 overflow-hidden shadow-lg">
        {/* Table Header */}
        <div className="hidden lg:grid lg:grid-cols-[2fr,1.5fr,1fr,1fr,auto] gap-4 px-6 py-4 bg-[#F8FAFB] border-b border-[#AEBFC3]/10 text-sm font-semibold text-[#5D6E73]">
          <div>Vendor Details</div>
          <div>Bank Information</div>
          <div>Account Number</div>
          <div>Status</div>
          <div className="text-right w-20">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#AEBFC3]/10">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#AEBFC3]/20 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 bg-[#AEBFC3]/20 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-[#AEBFC3]/20 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-[#CE9F6B]/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-[#CE9F6B]/50" />
              </div>
              <p className="text-[#92A2A5] font-medium mb-2">
                {searchTerm ? 'No matching bank accounts found' : 'No bank accounts configured'}
              </p>
              <Link 
                href="/finance/bank-accounts/new"
                className="inline-flex items-center gap-2 text-[#82A094] hover:text-[#4F6A64] text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add your first bank account
              </Link>
            </div>
          ) : (
            filteredAccounts.map((account) => (
              <div 
                key={account.id}
                onClick={() => router.push(`/finance/bank-accounts/${account.id}`)}
                className="group px-6 py-5 hover:bg-[#CE9F6B]/5 cursor-pointer transition-all"
              >
                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#546A7A] group-hover:text-[#976E44] transition-colors">
                          {account.vendorName}
                        </h3>
                        {account.nickName && (
                          <p className="text-sm text-[#CE9F6B]">"{account.nickName}"</p>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      account.isActive 
                        ? 'bg-[#82A094]/15 text-[#4F6A64]' 
                        : 'bg-[#AEBFC3]/10 text-[#92A2A5]'
                    }`}>
                      {account.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {account.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#92A2A5]">Bank:</span>
                      <span className="ml-2 text-[#546A7A] font-medium">{account.beneficiaryBankName}</span>
                    </div>
                    <div>
                      <span className="text-[#92A2A5]">A/C:</span>
                      <span className="ml-2 text-[#546A7A] font-mono">****{account.accountNumber.slice(-4)}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Table Row */}
                <div className="hidden lg:grid lg:grid-cols-[2fr,1.5fr,1fr,1fr,auto] gap-4 items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#546A7A] group-hover:text-[#976E44] transition-colors">
                        {account.vendorName}
                      </h3>
                      {account.nickName && (
                        <p className="text-sm text-[#CE9F6B]">"{account.nickName}"</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-[#546A7A]">{account.beneficiaryBankName}</p>
                    <p className="text-sm text-[#CE9F6B] font-mono">{account.ifscCode}</p>
                  </div>

                  <div className="font-mono text-[#546A7A] tracking-wide">
                    ****{account.accountNumber.slice(-4)}
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      account.isActive 
                        ? 'bg-[#82A094]/15 text-[#4F6A64]' 
                        : 'bg-[#AEBFC3]/10 text-[#92A2A5]'
                    }`}>
                      {account.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1 w-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/finance/bank-accounts/${account.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg hover:bg-[#6F8A9D]/10 text-[#92A2A5] hover:text-[#6F8A9D] transition-all"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/finance/bank-accounts/${account.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg hover:bg-[#CE9F6B]/10 text-[#92A2A5] hover:text-[#CE9F6B] transition-all"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(account.id, e)}
                        className="p-2 rounded-lg hover:bg-[#E17F70]/10 text-[#92A2A5] hover:text-[#E17F70] transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
