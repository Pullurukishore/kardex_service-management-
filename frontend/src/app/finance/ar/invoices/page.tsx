'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { arApi, ARInvoice, formatARCurrency, formatARDate } from '@/lib/ar-api';
import { Search, ChevronLeft, ChevronRight, FileText, Plus, TrendingUp, AlertTriangle, Clock, CheckCircle2, Zap, DollarSign, Calendar, Building2, Upload, Briefcase, Shield } from 'lucide-react';

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
    { value: '', label: 'All', icon: Zap, bg: 'from-amber-500 to-yellow-500', glow: 'shadow-amber-500/40' },
    { value: 'PENDING', label: 'Pending', icon: Clock, bg: 'from-sky-500 to-blue-600', glow: 'shadow-sky-500/40' },
    { value: 'OVERDUE', label: 'Overdue', icon: AlertTriangle, bg: 'from-rose-500 to-red-600', glow: 'shadow-rose-500/40' },
    { value: 'PAID', label: 'Paid', icon: CheckCircle2, bg: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/40' },
    { value: 'PARTIAL', label: 'Partial', icon: TrendingUp, bg: 'from-orange-500 to-amber-600', glow: 'shadow-orange-500/40' },
  ];

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'PAID': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20';
      case 'PARTIAL': return 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-orange-500/20';
      case 'OVERDUE': return 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-rose-500/20';
      case 'PENDING': return 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-sky-500/20';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'PAID': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'PARTIAL': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'OVERDUE': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'PENDING': return <Clock className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-rose-600/25 text-rose-300 border-rose-500/60 animate-pulse';
      case 'HIGH': return 'bg-orange-500/25 text-orange-300 border-orange-500/50';
      case 'MEDIUM': return 'bg-amber-500/25 text-amber-300 border-amber-500/50';
      case 'LOW': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'ACKNOWLEDGED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'DELIVERED': return 'bg-violet-500/20 text-violet-400 border-violet-500/50';
      case 'SENT': return 'bg-sky-500/20 text-sky-400 border-sky-500/50';
      case 'PENDING': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getRowBackground = (invoice: ARInvoice, index: number) => {
    const isEven = index % 2 === 0;
    const baseClass = isEven ? 'bg-slate-800/30' : 'bg-slate-900/20';
    
    switch (invoice.status) {
      case 'OVERDUE': return `${baseClass} border-l-4 border-l-rose-500`;
      case 'PAID': return `${baseClass} border-l-4 border-l-emerald-500`;
      case 'PARTIAL': return `${baseClass} border-l-4 border-l-orange-500`;
      case 'PENDING': return `${baseClass} border-l-4 border-l-sky-500`;
      default: return `${baseClass} border-l-4 border-l-transparent`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 shadow-lg">
              <FileText className="w-7 h-7 text-amber-400" />
            </div>
            Invoices
            <span className="px-3.5 py-1.5 text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 rounded-lg shadow-lg shadow-amber-500/30">
              {total}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2 ml-1">
            <Briefcase className="w-4 h-4 text-amber-500/70" />
            Manage all accounts receivable invoices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/finance/ar/import"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            Import
          </Link>
          <Link 
            href="/finance/ar/invoices/new"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold hover:from-amber-400 hover:to-yellow-400 transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/80 p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[280px] relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by invoice number, customer, PO..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-11 pl-12 pr-4 rounded-lg bg-slate-900/70 border border-slate-700 text-white font-medium placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2">
            {statusFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => { setStatus(filter.value); setPage(1); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    status === filter.value
                      ? `bg-gradient-to-r ${filter.bg} text-white shadow-lg ${filter.glow}`
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/60 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/80">
                <th className="text-left py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Invoice / PO
                  </span>
                </th>
                <th className="text-left py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-500" />
                    Customer / POC
                  </span>
                </th>
                <th className="text-left py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    Dates
                  </span>
                </th>
                <th className="text-right py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-2 justify-end">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    Amount / Balance
                  </span>
                </th>
                <th className="text-center py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-2 justify-center">
                    <Shield className="w-4 h-4 text-orange-500" />
                    Risk
                  </span>
                </th>
                <th className="text-center py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery</th>
                <th className="text-center py-4 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="bg-slate-800/20">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-5 px-5">
                        <div 
                          className="h-5 bg-slate-700/50 rounded animate-pulse" 
                          style={{ width: `${60 + Math.random() * 40}%`, animationDelay: `${j * 0.1}s` }} 
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 mb-5">
                      <FileText className="w-10 h-10 text-slate-500" />
                    </div>
                    <div className="text-white font-semibold text-lg mb-2">No invoices found</div>
                    <div className="text-slate-500 text-sm">Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, index) => (
                  <tr 
                    key={invoice.id} 
                    className={`${getRowBackground(invoice, index)} hover:bg-slate-700/40 transition-all duration-200 cursor-pointer group`}
                    onClick={() => window.location.href = `/finance/ar/invoices/${encodeURIComponent(invoice.invoiceNumber)}`}
                  >
                    {/* Invoice & PO */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1.5">
                        <Link 
                          href={`/finance/ar/invoices/${encodeURIComponent(invoice.invoiceNumber)}`} 
                          className="text-amber-400 font-semibold hover:text-amber-300 transition-colors flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {invoice.invoiceNumber}
                        </Link>
                        {invoice.poNo && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-slate-700/70 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">PO</span>
                            <span className="font-mono text-slate-300">{invoice.poNo}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Customer & POC */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1.5 max-w-[220px]">
                        <span className="text-white text-sm font-medium truncate" title={invoice.customerName}>
                          {invoice.customerName || '-'}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                           <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 font-mono text-[11px]">
                             {invoice.bpCode}
                           </span>
                           {invoice.pocName && (
                             <span className="text-slate-400 truncate text-xs" title={`POC: ${invoice.pocName}`}>
                               {invoice.pocName}
                             </span>
                           )}
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500 text-xs w-14">Issued</span>
                          <span className="text-slate-300 font-medium">{formatARDate(invoice.invoiceDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`text-xs w-14 ${invoice.dueByDays && invoice.dueByDays > 0 ? 'text-rose-400' : 'text-slate-500'}`}>Due</span>
                          <span className={`font-medium ${invoice.dueByDays && invoice.dueByDays > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {formatARDate(invoice.dueDate)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Amount & Balance */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-emerald-400 font-bold text-lg">
                          {formatARCurrency(Number(invoice.totalAmount) || 0)}
                        </span>
                        {invoice.balance && Number(invoice.balance) > 0 ? (
                           <div className="flex items-center gap-1.5 text-sm">
                             <span className="text-slate-500 text-xs">Bal:</span>
                             <span className="text-rose-400 font-semibold">
                               {formatARCurrency(Number(invoice.balance))}
                             </span>
                           </div>
                        ) : (
                          <span className="text-xs text-emerald-400/80 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getRiskBadge(invoice.riskClass)}`}>
                        {invoice.riskClass}
                      </span>
                    </td>

                    {/* Delivery Status */}
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getDeliveryBadge(invoice.deliveryStatus)}`}>
                        {invoice.deliveryStatus}
                      </span>
                    </td>

                    {/* Status & Overdue */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-lg ${getStatusBadge(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                        {invoice.dueByDays && invoice.dueByDays > 0 && (
                          <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1 bg-rose-500/15 px-2 py-1 rounded border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            +{invoice.dueByDays}d
                          </span>
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
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700/60 bg-slate-800/50">
          <span className="text-sm text-slate-400">
            Showing <span className="text-white font-medium">{Math.min((page - 1) * 20 + 1, total)}</span> to <span className="text-white font-medium">{Math.min(page * 20, total)}</span> of <span className="text-amber-400 font-bold">{total}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg border border-slate-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
