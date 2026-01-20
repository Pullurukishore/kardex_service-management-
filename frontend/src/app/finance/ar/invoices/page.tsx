'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { arApi, ARInvoice, formatARCurrency, formatARDate } from '@/lib/ar-api';
import { Search, ChevronLeft, ChevronRight, FileText, Plus, TrendingUp, AlertTriangle, Clock, CheckCircle2, Zap, DollarSign, Calendar, Building2, Upload, Briefcase, Shield, Sparkles } from 'lucide-react';

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
    { value: '', label: 'All', icon: Zap, color: 'from-[#E17F70] to-[#CE9F6B]', text: 'text-white' },
    { value: 'PENDING', label: 'Pending', icon: Clock, color: 'from-[#6F8A9D] to-[#96AEC2]', text: 'text-white' },
    { value: 'OVERDUE', label: 'Overdue', icon: AlertTriangle, color: 'from-[#E17F70] to-[#9E3B47]', text: 'text-white' },
    { value: 'PAID', label: 'Paid', icon: CheckCircle2, color: 'from-[#82A094] to-[#4F6A64]', text: 'text-white' },
    { value: 'PARTIAL', label: 'Partial', icon: TrendingUp, color: 'from-[#CE9F6B] to-[#976E44]', text: 'text-white' },
  ];

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'PAID': return 'bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white shadow-lg shadow-[#82A094]/30';
      case 'PARTIAL': return 'bg-gradient-to-r from-[#CE9F6B] to-[#976E44] text-white shadow-lg shadow-[#CE9F6B]/30';
      case 'OVERDUE': return 'bg-gradient-to-r from-[#E17F70] to-[#9E3B47] text-white shadow-lg shadow-[#E17F70]/30';
      case 'PENDING': return 'bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] text-white shadow-lg shadow-[#6F8A9D]/30';
      default: return 'bg-gradient-to-r from-[#AEBFC3] to-[#92A2A5] text-white';
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
      case 'CRITICAL': return 'bg-gradient-to-r from-[#9E3B47] to-[#75242D] text-white shadow-md';
      case 'HIGH': return 'bg-gradient-to-r from-[#E17F70] to-[#9E3B47] text-white shadow-md';
      case 'MEDIUM': return 'bg-gradient-to-r from-[#CE9F6B] to-[#976E44] text-white shadow-md';
      case 'LOW': return 'bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white shadow-md';
      default: return 'bg-[#AEBFC3]/15 text-[#5D6E73] border border-[#AEBFC3]/40';
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'ACKNOWLEDGED': return 'bg-[#4F6A64]/15 text-[#4F6A64] border border-[#82A094]/40 font-medium';
      case 'DELIVERED': return 'bg-[#6F8A9D]/15 text-[#546A7A] border border-[#6F8A9D]/40 font-medium';
      case 'SENT': return 'bg-[#CE9F6B]/15 text-[#976E44] border border-[#CE9F6B]/40 font-medium';
      case 'PENDING': return 'bg-[#AEBFC3]/15 text-[#5D6E73] border border-[#AEBFC3]/40 font-medium';
      default: return 'bg-[#AEBFC3]/15 text-[#5D6E73] border border-[#AEBFC3]/40';
    }
  };

  const getRowAccent = (invoice: ARInvoice) => {
    switch (invoice.status) {
      case 'OVERDUE': return 'border-l-4 border-l-[#E17F70]';
      case 'PAID': return 'border-l-4 border-l-[#82A094]';
      case 'PARTIAL': return 'border-l-4 border-l-[#CE9F6B]';
      case 'PENDING': return 'border-l-4 border-l-[#6F8A9D]';
      default: return 'border-l-4 border-l-transparent';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Decorative Background Elements */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-[#E17F70]/10 to-[#CE9F6B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-tr from-[#82A094]/10 to-[#6F8A9D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E17F70] via-[#CE9F6B] to-[#976E44] p-6 shadow-xl">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-12 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute -bottom-8 right-32 w-48 h-48 border-4 border-white rounded-full" />
          <div className="absolute top-8 left-1/3 w-16 h-16 border-2 border-white rounded-full" />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                AR Invoices
                <span className="px-4 py-1.5 text-sm font-bold bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30">
                  {total} Total
                </span>
              </h1>
              <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Manage accounts receivable invoices with ease
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/finance/ar/import"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium hover:bg-white/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              Import
            </Link>
            <Link 
              href="/finance/ar/invoices/new"
              className="group relative flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#9E3B47] font-bold hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus className="w-5 h-5" />
              <span className="relative">New Invoice</span>
              <Sparkles className="w-4 h-4 text-[#CE9F6B]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-[#CE9F6B]/20 p-5 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[280px] relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#92A2A5] group-focus-within:text-[#E17F70] transition-colors" />
            <input
              type="text"
              placeholder="Search by invoice number, customer, PO..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-gradient-to-r from-[#AEBFC3]/10 to-[#82A094]/5 border-2 border-[#AEBFC3]/30 text-[#546A7A] font-medium placeholder:text-[#92A2A5] focus:border-[#E17F70]/50 focus:outline-none focus:ring-4 focus:ring-[#E17F70]/10 transition-all"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2">
            {statusFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = status === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => { setStatus(filter.value); setPage(1); }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${filter.color} ${filter.text} shadow-lg hover:shadow-xl hover:-translate-y-0.5`
                      : 'bg-white border-2 border-[#AEBFC3]/30 text-[#5D6E73] hover:bg-gradient-to-r hover:from-[#AEBFC3]/10 hover:to-[#82A094]/10 hover:border-[#6F8A9D]/40'
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
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#CE9F6B]/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#E17F70] via-[#CE9F6B] to-[#976E44]">
                <th className="text-left py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 opacity-80" />
                    Invoice / PO
                  </span>
                </th>
                <th className="text-left py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 opacity-80" />
                    Customer / POC
                  </span>
                </th>
                <th className="text-left py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-80" />
                    Dates
                  </span>
                </th>
                <th className="text-right py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-2 justify-end">
                    <DollarSign className="w-4 h-4 opacity-80" />
                    Amount / Balance
                  </span>
                </th>
                <th className="text-center py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-2 justify-center">
                    <Shield className="w-4 h-4 opacity-80" />
                    Risk
                  </span>
                </th>
                <th className="text-center py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Delivery</th>
                <th className="text-center py-5 px-6 text-xs font-bold text-white uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AEBFC3]/15">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="bg-white">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-6 px-6">
                        <div 
                          className="h-5 bg-gradient-to-r from-[#AEBFC3]/30 to-[#82A094]/20 rounded-lg animate-pulse" 
                          style={{ width: `${60 + Math.random() * 40}%`, animationDelay: `${j * 0.1}s` }} 
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E17F70]/10 to-[#CE9F6B]/10 border-2 border-[#CE9F6B]/20 mb-5">
                      <FileText className="w-12 h-12 text-[#CE9F6B]" />
                    </div>
                    <div className="text-[#546A7A] font-semibold text-lg mb-2">No invoices found</div>
                    <div className="text-[#92A2A5] text-sm">Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, index) => (
                  <tr 
                    key={invoice.id} 
                    className={`${getRowAccent(invoice)} ${index % 2 === 0 ? 'bg-white' : 'bg-[#AEBFC3]/5'} hover:bg-gradient-to-r hover:from-[#E17F70]/5 hover:to-[#CE9F6B]/5 transition-all cursor-pointer group`}
                    onClick={() => window.location.href = `/finance/ar/invoices/${encodeURIComponent(invoice.invoiceNumber)}`}
                  >
                    {/* Invoice & PO */}
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-1.5">
                        <Link 
                          href={`/finance/ar/invoices/${encodeURIComponent(invoice.invoiceNumber)}`} 
                          className="text-[#E17F70] font-bold hover:text-[#9E3B47] transition-colors group-hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {invoice.invoiceNumber}
                        </Link>
                        {invoice.poNo && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-gradient-to-r from-[#AEBFC3]/20 to-[#92A2A5]/20 text-[#5D6E73] text-[10px] uppercase tracking-wider font-bold">PO</span>
                            <span className="font-mono text-[#5D6E73]">{invoice.poNo}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Customer & POC */}
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-1.5 max-w-[220px]">
                        <span className="text-[#546A7A] text-sm font-semibold truncate" title={invoice.customerName}>
                          {invoice.customerName || '-'}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                           <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#6F8A9D]/15 to-[#82A094]/15 border border-[#6F8A9D]/30 text-[#6F8A9D] font-mono text-[11px] font-medium">
                             {invoice.bpCode}
                           </span>
                           {invoice.pocName && (
                             <span className="text-[#92A2A5] truncate text-xs" title={`POC: ${invoice.pocName}`}>
                               {invoice.pocName}
                             </span>
                           )}
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#92A2A5] text-xs w-14">Issued</span>
                          <span className="text-[#5D6E73] font-medium">{formatARDate(invoice.invoiceDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`text-xs w-14 ${invoice.dueByDays && invoice.dueByDays > 0 ? 'text-[#E17F70] font-medium' : 'text-[#92A2A5]'}`}>Due</span>
                          <span className={`font-medium ${invoice.dueByDays && invoice.dueByDays > 0 ? 'text-[#E17F70]' : 'text-[#4F6A64]'}`}>
                            {formatARDate(invoice.dueDate)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Amount & Balance */}
                    <td className="py-5 px-6 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[#546A7A] font-bold text-lg">
                          {formatARCurrency(Number(invoice.totalAmount) || 0)}
                        </span>
                        {invoice.balance && Number(invoice.balance) > 0 ? (
                           <div className="flex items-center gap-1.5 text-sm">
                             <span className="text-[#92A2A5] text-xs">Bal:</span>
                             <span className="text-[#E17F70] font-bold">
                               {formatARCurrency(Number(invoice.balance))}
                             </span>
                           </div>
                        ) : (
                          <span className="text-xs text-[#4F6A64] font-semibold flex items-center gap-1 bg-[#82A094]/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getRiskBadge(invoice.riskClass)}`}>
                        {invoice.riskClass}
                      </span>
                    </td>

                    {/* Delivery Status */}
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${getDeliveryBadge(invoice.deliveryStatus)}`}>
                        {invoice.deliveryStatus}
                      </span>
                    </td>

                    {/* Status & Overdue */}
                    <td className="py-5 px-6">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${getStatusBadge(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                        {invoice.dueByDays && invoice.dueByDays > 0 && (
                          <span className="text-[10px] font-bold text-white flex items-center gap-1 bg-gradient-to-r from-[#E17F70] to-[#9E3B47] px-2 py-1 rounded-full shadow-md">
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
        <div className="flex items-center justify-between px-6 py-5 border-t border-[#CE9F6B]/15 bg-gradient-to-r from-[#E17F70]/5 via-[#CE9F6B]/5 to-transparent">
          <span className="text-sm text-[#5D6E73]">
            Showing <span className="text-[#546A7A] font-bold">{Math.min((page - 1) * 20 + 1, total)}</span> to <span className="text-[#546A7A] font-bold">{Math.min(page * 20, total)}</span> of <span className="text-[#E17F70] font-bold">{total}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-gradient-to-r hover:from-[#E17F70]/10 hover:to-[#CE9F6B]/10 hover:border-[#E17F70]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#E17F70] to-[#CE9F6B] rounded-xl shadow-lg">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-gradient-to-r hover:from-[#E17F70]/10 hover:to-[#CE9F6B]/10 hover:border-[#E17F70]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
