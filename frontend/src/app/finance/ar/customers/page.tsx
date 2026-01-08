'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARCustomer, formatARCurrency } from '@/lib/ar-api';
import { Search, Plus, Users, ChevronLeft, ChevronRight, Building2, AlertTriangle, Eye, Edit2 } from 'lucide-react';

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

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'HIGH': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'CRITICAL': return 'bg-red-600/20 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent flex items-center gap-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            Customers
            <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/30 text-cyan-300 rounded-full border border-cyan-500/50">
              {total}
            </span>
          </h1>
          <p className="text-cyan-200/60 text-sm mt-1 font-medium">Manage AR customer master data</p>
        </div>
        <Link 
          href="/finance/ar/customers/new"
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
          Add Customer
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-cyan-500/20 transition-all duration-300">
        <div className="relative max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search by BP code or customer name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-500/20 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-transparent">
                <th className="text-left py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">BP Code</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Customer Name</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Region</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Contact Person</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Risk Class</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Credit Limit</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-4 px-6">
                        <div 
                          className="h-4 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded animate-pulse" 
                          style={{ width: `${60 + Math.random() * 40}%`, animationDelay: `${j * 0.1}s` }} 
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Building2 className="w-14 h-14 text-white/10 mx-auto mb-4" />
                    <div className="text-white/40 font-medium">No customers found</div>
                    <div className="text-white/25 text-sm mt-1">Try adjusting your search or add a new customer</div>
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => (
                  <tr 
                    key={customer.id} 
                    className="border-b border-white/5 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-transparent transition-all duration-200 group"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="py-4 px-6">
                      <span className="text-cyan-400 font-semibold group-hover:text-cyan-300 transition-colors">{customer.bpCode}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white font-medium group-hover:text-white transition-colors">{customer.customerName}</span>
                    </td>
                    <td className="py-4 px-6 text-white/50">
                      {customer.region || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white/70 group-hover:text-white/90 transition-colors">{customer.personInCharge || '-'}</div>
                      {customer.emailId && (
                        <div className="text-xs text-white/35 mt-0.5">{customer.emailId}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRiskBadgeColor(customer.riskClass)}`}>
                        {customer.riskClass === 'CRITICAL' && <AlertTriangle className="w-3 h-3" />}
                        {customer.riskClass}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-white font-semibold">
                      {customer.creditLimit ? formatARCurrency(customer.creditLimit) : <span className="text-white/25">-</span>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/finance/ar/customers/${customer.id}`}
                          className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400 transition-all"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/finance/ar/customers/${customer.id}/edit`}
                          className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/40 hover:text-amber-400 transition-all"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
            <span className="text-sm text-white/40">
              Showing <span className="text-white/70 font-medium">{Math.min((page - 1) * 20 + 1, total)}</span> to <span className="text-white/70 font-medium">{Math.min(page * 20, total)}</span> of <span className="text-white/70 font-medium">{total}</span> customers
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-cyan-500/10 hover:text-white hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm text-white/60 bg-white/5 rounded-xl border border-white/10">
                Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-cyan-500/10 hover:text-white hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
