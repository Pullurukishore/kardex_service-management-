'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARCustomer, formatARCurrency } from '@/lib/ar-api';
import { Search, Plus, Users, ChevronLeft, ChevronRight, Building2, AlertTriangle, Eye, Edit2, Sparkles } from 'lucide-react';

export default function ARCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<ARCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, [search, page]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const result = await arApi.getCustomers({ search, page, limit: 20 });
      setCustomers(result.data);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotal(result.pagination?.total || result.data?.length || 0);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white shadow-md';
      case 'MEDIUM': return 'bg-gradient-to-r from-[#CE9F6B] to-[#976E44] text-white shadow-md';
      case 'HIGH': return 'bg-gradient-to-r from-[#E17F70] to-[#9E3B47] text-white shadow-md';
      case 'CRITICAL': return 'bg-gradient-to-r from-[#9E3B47] to-[#75242D] text-white shadow-md';
      default: return 'bg-[#AEBFC3]/15 text-[#5D6E73] border border-[#AEBFC3]/40';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Decorative Background */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-[#82A094]/10 to-[#4F6A64]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-tr from-[#A2B9AF]/10 to-[#82A094]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Premium Header - Teal/Green People Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4F6A64] via-[#82A094] to-[#A2B9AF] p-6 shadow-xl">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-12 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute -bottom-8 right-32 w-48 h-48 border-4 border-white rounded-full" />
          <div className="absolute top-8 left-1/3 w-16 h-16 border-2 border-white rounded-full" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Customer Master
                <span className="px-4 py-1.5 text-sm font-bold bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30">
                  {total} Total
                </span>
              </h1>
              <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Manage AR customer contacts and credit settings
              </p>
            </div>
          </div>
          <Link 
            href="/finance/ar/customers/new"
            className="group relative flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#4F6A64] font-bold hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus className="w-5 h-5" />
            <span className="relative">Add Customer</span>
            <Sparkles className="w-4 h-4 text-[#82A094]" />
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-[#82A094]/20 p-5 shadow-lg">
        <div className="relative max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#92A2A5] group-focus-within:text-[#82A094] transition-colors" />
          <input
            type="text"
            placeholder="Search by BP code or customer name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-gradient-to-r from-[#AEBFC3]/10 to-[#82A094]/5 border-2 border-[#AEBFC3]/30 text-[#546A7A] font-medium placeholder:text-[#92A2A5] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/10 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#82A094]/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#4F6A64] via-[#82A094] to-[#A2B9AF]">
                <th className="text-left py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">BP Code</th>
                <th className="text-left py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Customer Name</th>
                <th className="text-left py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Region</th>
                <th className="text-left py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Contact Person</th>
                <th className="text-center py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Risk Class</th>
                <th className="text-right py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Credit Limit</th>
                <th className="text-center py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AEBFC3]/15">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="bg-white">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-5 px-6">
                        <div 
                          className="h-5 bg-gradient-to-r from-[#AEBFC3]/30 to-[#82A094]/20 rounded-lg animate-pulse" 
                          style={{ width: `${60 + Math.random() * 40}%`, animationDelay: `${j * 0.1}s` }} 
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-[#82A094]/10 to-[#4F6A64]/10 border-2 border-[#82A094]/20 mb-5">
                      <Building2 className="w-12 h-12 text-[#82A094]" />
                    </div>
                    <div className="text-[#546A7A] font-semibold text-lg mb-2">No customers found</div>
                    <div className="text-[#92A2A5] text-sm">Try adjusting your search or add a new customer</div>
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => (
                  <tr 
                    key={customer.id} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#AEBFC3]/5'} hover:bg-gradient-to-r hover:from-[#82A094]/5 hover:to-[#4F6A64]/5 transition-all cursor-pointer group`}
                    onClick={() => router.push(`/finance/ar/customers/${customer.id}`)}
                  >
                    <td className="py-5 px-6">
                      <span className="text-[#82A094] font-bold text-sm bg-[#82A094]/10 px-3 py-1 rounded-lg">{customer.bpCode}</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[#546A7A] font-semibold group-hover:text-[#4F6A64]">{customer.customerName}</span>
                    </td>
                    <td className="py-5 px-6 text-[#5D6E73]">
                      {customer.region || <span className="text-[#AEBFC3]">-</span>}
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-[#5D6E73] font-medium">{customer.personInCharge || <span className="text-[#AEBFC3]">-</span>}</div>
                      {customer.emailId && (
                        <div className="text-xs text-[#82A094] mt-0.5">{customer.emailId}</div>
                      )}
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getRiskBadge(customer.riskClass)}`}>
                        {customer.riskClass === 'CRITICAL' && <AlertTriangle className="w-3 h-3" />}
                        {customer.riskClass}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <span className="text-[#546A7A] font-bold">
                        {customer.creditLimit ? formatARCurrency(customer.creditLimit) : <span className="text-[#AEBFC3]">-</span>}
                      </span>
                    </td>
                    <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/finance/ar/customers/${customer.id}`}
                          className="p-2.5 rounded-xl bg-[#82A094]/10 hover:bg-[#82A094]/20 text-[#5D6E73] hover:text-[#4F6A64] transition-all"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/finance/ar/customers/${customer.id}/edit`}
                          className="p-2.5 rounded-xl bg-[#CE9F6B]/10 hover:bg-[#CE9F6B]/20 text-[#5D6E73] hover:text-[#976E44] transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-5 border-t border-[#82A094]/15 bg-gradient-to-r from-[#82A094]/5 via-[#4F6A64]/5 to-transparent">
            <span className="text-sm text-[#5D6E73]">
              Showing <span className="text-[#546A7A] font-bold">{Math.min((page - 1) * 20 + 1, total)}</span> to <span className="text-[#546A7A] font-bold">{Math.min(page * 20, total)}</span> of <span className="text-[#82A094] font-bold">{total}</span> customers
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-gradient-to-r hover:from-[#82A094]/10 hover:to-[#4F6A64]/10 hover:border-[#82A094]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#4F6A64] to-[#82A094] rounded-xl shadow-lg">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-gradient-to-r hover:from-[#82A094]/10 hover:to-[#4F6A64]/10 hover:border-[#82A094]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
