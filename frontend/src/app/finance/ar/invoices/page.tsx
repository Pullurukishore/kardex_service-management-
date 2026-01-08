'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { arApi, ARInvoice, formatARCurrency, formatARDate } from '@/lib/ar-api';
import { Search, Filter, Download, Upload, ChevronLeft, ChevronRight, FileText, Sparkles, Plus, Eye } from 'lucide-react';

export default function ARInvoicesPage() {
  const [invoices, setInvoices] = useState<ARInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadInvoices();
  }, [search, status, page]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await arApi.getInvoices({ search, status, page, limit: 20 });
      setInvoices(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusFilters = [
    { value: '', label: 'All', color: 'purple' },
    { value: 'PENDING', label: 'Pending', color: 'blue' },
    { value: 'OVERDUE', label: 'Overdue', color: 'red' },
    { value: 'PAID', label: 'Paid', color: 'emerald' },
    { value: 'PARTIAL', label: 'Partial', color: 'amber' },
  ];

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'PAID': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/30';
      case 'PARTIAL': return 'bg-amber-500/15 text-amber-400 border-amber-500/30 ring-1 ring-amber-500/30';
      case 'OVERDUE': return 'bg-red-500/15 text-red-400 border-red-500/30 ring-1 ring-red-500/30';
      case 'PENDING': return 'bg-blue-500/15 text-blue-400 border-blue-500/30 ring-1 ring-blue-500/30';
      default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30 ring-1 ring-gray-500/30';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'LOW': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'ACKNOWLEDGED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'DELIVERED': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'SENT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PENDING': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent flex items-center gap-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            Invoices
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40">
              {total}
            </span>
          </h1>
          <p className="text-cyan-200/60 text-sm mt-1 font-medium">Manage all accounts receivable invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/finance/ar/import"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <Upload className="w-4 h-4" />
            Import
          </Link>
          <Link 
            href="/finance/ar/invoices/new"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-purple-500/20 transition-all duration-300">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[280px] relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by invoice number, customer, PO..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => { setStatus(filter.value); setPage(1); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  status === filter.value
                    ? 'bg-gradient-to-r from-purple-500/25 to-pink-500/20 text-white border border-purple-500/40 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/20 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500/10 via-fuchsia-500/5 to-transparent border-b border-white/10">
                <th className="text-left py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Invoice / PO</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Customer / POC</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Dates</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Amount / Balance</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Risk</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Delivery</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
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
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FileText className="w-14 h-14 text-white/10 mx-auto mb-4" />
                    <div className="text-white/40 font-medium">No invoices found</div>
                    <div className="text-white/25 text-sm mt-1">Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, index) => (
                  <tr 
                    key={invoice.id} 
                    className="border-b border-white/5 hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-transparent transition-all duration-200 cursor-pointer group"
                    style={{ animationDelay: `${index * 0.03}s` }}
                    onClick={() => window.location.href = `/finance/ar/invoices/${encodeURIComponent(invoice.invoiceNumber)}`}
                  >
                    {/* Invoice & PO */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <Link href={`/finance/ar/invoices/${encodeURIComponent(invoice.invoiceNumber)}`} className="text-purple-400 font-semibold group-hover:text-purple-300 transition-colors hover:underline text-sm">
                          {invoice.invoiceNumber}
                        </Link>
                        {invoice.poNo && (
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <span className="uppercase tracking-wider opacity-70">PO:</span>
                            <span className="font-mono text-white/60">{invoice.poNo}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Customer & POC */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 max-w-[200px]">
                        <span className="text-white/90 text-sm font-medium truncate" title={invoice.customerName}>
                          {invoice.customerName || '-'}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                           <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 font-mono">
                             {invoice.bpCode}
                           </span>
                           {invoice.pocName && (
                             <span className="text-cyan-400/60 truncate" title={`POC: ${invoice.pocName}`}>
                               • {invoice.pocName}
                             </span>
                           )}
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <span className="text-white/30 w-12 text-xs uppercase tracking-wider">Issued</span>
                          {formatARDate(invoice.invoiceDate)}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white/30 w-12 text-xs uppercase tracking-wider">Due</span>
                          <span className={`${invoice.dueByDays && invoice.dueByDays > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {formatARDate(invoice.dueDate)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Amount & Balance */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-white font-semibold text-sm">
                          {formatARCurrency(Number(invoice.totalAmount) || 0)}
                        </span>
                        {invoice.balance && Number(invoice.balance) > 0 ? (
                           <div className="flex items-center gap-1.5">
                             <span className="text-[10px] text-white/30 uppercase tracking-wider">Bal</span>
                             <span className="text-xs text-red-300/80 font-medium">
                               {formatARCurrency(Number(invoice.balance))}
                             </span>
                           </div>
                        ) : (
                          <span className="text-xs text-emerald-400/60 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Paid
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRiskBadge(invoice.riskClass)}`}>
                        {invoice.riskClass}
                      </span>
                    </td>

                    {/* Delivery Status */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getDeliveryBadge(invoice.deliveryStatus)}`}>
                        {invoice.deliveryStatus === 'ACKNOWLEDGED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {invoice.deliveryStatus}
                      </span>
                    </td>

                    {/* Status & Overdue */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        {invoice.dueByDays && invoice.dueByDays > 0 ? (
                          <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                            +{invoice.dueByDays} days
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400/60 font-medium">On Track</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <span className="text-sm text-white/40">
            Showing <span className="text-white/70 font-medium">{Math.min((page - 1) * 20 + 1, total)}</span> to <span className="text-white/70 font-medium">{Math.min(page * 20, total)}</span> of <span className="text-white/70 font-medium">{total}</span> invoices
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm text-white/60 bg-white/5 rounded-xl border border-white/10">
              Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
