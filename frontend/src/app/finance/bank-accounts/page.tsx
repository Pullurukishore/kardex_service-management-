'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, BankAccount } from '@/lib/ar-api';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceRole } from '@/types/user.types';
import { 
  Plus, Building2, CreditCard, Check, X, Sparkles, 
  Search, Eye, Edit2, Trash2, AlertCircle, Clock, Bell
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-2">
            Bank Accounts
            <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
          </h1>
          <p className="text-[#92A2A5] text-sm mt-1 font-medium">Manage vendor bank details</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Pending Requests Badge (Admin only) */}
          {isAdmin && pendingCount > 0 && (
            <Link
              href="/finance/bank-accounts/requests"
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E17F70]/10 border border-[#E17F70]/30 text-[#E17F70] font-semibold hover:border-[#E17F70]/50 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>{pendingCount} Pending</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E17F70] rounded-full animate-pulse" />
            </Link>
          )}
          
          {/* My Requests (User only) */}
          {!isAdmin && (
            <Link
              href="/finance/bank-accounts/requests"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#AEBFC3]/10 border border-[#AEBFC3]/30 text-[#5D6E73] font-medium hover:border-[#CE9F6B]/30 hover:text-[#976E44] transition-all"
            >
              <Clock className="w-4 h-4" />
              My Requests
            </Link>
          )}
          
          <Link 
            href="/finance/bank-accounts/new"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E17F70] to-[#9E3B47] text-white font-semibold hover:from-[#9E3B47] hover:to-[#75242D] transition-all duration-300 shadow-lg shadow-[#E17F70]/25 hover:shadow-[#E17F70]/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            {isAdmin ? 'Add Account' : 'Request New'}
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#92A2A5]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by vendor name, bank, account number..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-[#AEBFC3]/30 rounded-xl text-[#546A7A] placeholder-[#92A2A5] focus:outline-none focus:border-[#CE9F6B]/50 focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#AEBFC3]/20 p-6 animate-pulse shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="h-14 w-14 bg-[#AEBFC3]/20 rounded-xl" />
                <div className="h-6 w-16 bg-[#AEBFC3]/20 rounded-full" />
              </div>
              <div className="h-6 bg-[#AEBFC3]/20 rounded w-2/3 mb-3" />
              <div className="h-4 bg-[#AEBFC3]/20 rounded w-1/2 mb-2" />
              <div className="h-4 bg-[#AEBFC3]/20 rounded w-3/4" />
            </div>
          ))
        ) : filteredAccounts.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-[#CE9F6B]/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-[#CE9F6B]/50" />
            </div>
            <p className="text-[#92A2A5] font-medium mb-2">
              {searchTerm ? 'No matching bank accounts found' : 'No bank accounts configured'}
            </p>
            <Link 
              href="/finance/bank-accounts/new"
              className="text-[#82A094] hover:text-[#4F6A64] text-sm font-medium transition-colors"
            >
              Click here to add your first bank account →
            </Link>
          </div>
        ) : (
          filteredAccounts.map((account, index) => (
            <div 
              key={account.id}
              onClick={() => router.push(`/finance/bank-accounts/${account.id}`)}
              className="bg-white rounded-2xl border border-[#AEBFC3]/20 p-6 hover:border-[#CE9F6B]/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer shadow-lg"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#CE9F6B]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <Link
                  href={`/finance/bank-accounts/${account.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-[#AEBFC3]/10 hover:bg-[#6F8A9D]/20 text-[#5D6E73] hover:text-[#6F8A9D] transition-all"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  href={`/finance/bank-accounts/${account.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-[#AEBFC3]/10 hover:bg-[#CE9F6B]/20 text-[#5D6E73] hover:text-[#CE9F6B] transition-all"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(account.id, e)}
                    className="p-2 rounded-lg bg-[#AEBFC3]/10 hover:bg-[#E17F70]/20 text-[#5D6E73] hover:text-[#E17F70] transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg"
                >
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
                  account.isActive 
                    ? 'bg-[#82A094]/15 text-[#4F6A64] border-[#82A094]/30' 
                    : 'bg-[#AEBFC3]/10 text-[#92A2A5] border-[#AEBFC3]/20'
                }`}>
                  {account.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {account.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-[#546A7A] mb-1 relative z-10 group-hover:text-[#976E44] transition-colors line-clamp-1">
                {account.vendorName}
              </h3>
              {account.nickName && (
                <p className="text-[#CE9F6B] text-sm mb-3 relative z-10 font-medium">
                  "{account.nickName}"
                </p>
              )}
              
              <div className="space-y-2 relative z-10 pt-3 border-t border-[#AEBFC3]/10">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-[#92A2A5] flex-shrink-0" />
                  <span className="text-[#92A2A5]">Bank:</span>
                  <span className="text-[#546A7A] font-medium truncate">{account.beneficiaryBankName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#92A2A5] ml-6">A/C:</span>
                  <span className="text-[#546A7A] font-mono text-xs">
                    ****{account.accountNumber.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#92A2A5] ml-6">IFSC:</span>
                  <span className="text-[#CE9F6B] font-mono text-xs">{account.ifscCode}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
