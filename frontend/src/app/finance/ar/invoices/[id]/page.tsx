'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARInvoice, ARPaymentHistory, formatARCurrency, formatARDate } from '@/lib/ar-api';
import { 
  ArrowLeft, Edit, Trash2, FileText, Calendar, User, IndianRupee, Clock, 
  AlertTriangle, CheckCircle, Loader2, Mail, Phone, MapPin, Building, 
  CreditCard, Hash, Receipt, Truck, MessageSquare, Shield, Copy, 
  ExternalLink, Printer, Download, RefreshCw, Plus, X
} from 'lucide-react';

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<ARInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentTime: new Date().toTimeString().slice(0, 5),
    paymentMode: '',
    referenceNo: '',
    notes: ''
  });

  useEffect(() => {
    if (params.id) {
      loadInvoice(params.id as string);
    }
  }, [params.id]);

  const loadInvoice = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await arApi.getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      console.error('Failed to load invoice:', err);
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice || !confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      setDeleting(true);
      await arApi.deleteInvoice(invoice.id);
      router.push('/finance/ar/invoices');
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      setDeleting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    try {
      setPaymentLoading(true);
      await arApi.addPayment(invoice.id, {
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentTime: paymentForm.paymentTime,
        paymentMode: paymentForm.paymentMode,
        referenceNo: paymentForm.referenceNo,
        notes: paymentForm.notes
      });
      
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentTime: new Date().toTimeString().slice(0, 5),
        paymentMode: '',
        referenceNo: '',
        notes: ''
      });
      
      // Reload invoice to show new payment
      await loadInvoice(invoice.id);
    } catch (err) {
      console.error('Failed to record payment:', err);
      alert('Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: CheckCircle, glow: 'shadow-emerald-500/20' };
      case 'PARTIAL': return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', icon: Clock, glow: 'shadow-amber-500/20' };
      case 'OVERDUE': return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', icon: AlertTriangle, glow: 'shadow-red-500/20' };
      case 'PENDING': return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', icon: Clock, glow: 'shadow-blue-500/20' };
      case 'CANCELLED': return { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', icon: FileText, glow: '' };
      default: return { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', icon: FileText, glow: '' };
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW': return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'MEDIUM': return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'HIGH': return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' };
      case 'CRITICAL': return { bg: 'bg-red-600/20', text: 'text-red-300', border: 'border-red-500/40' };
      default: return { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'SENT': return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'ACKNOWLEDGED': return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' };
      default: return { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
  };

  // Field display component
  const Field = ({ label, value, copyable = false, highlight = false, className = '' }: { 
    label: string; 
    value: string | number | null | undefined; 
    copyable?: boolean;
    highlight?: boolean;
    className?: string;
  }) => (
    <div className={className}>
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`font-medium ${highlight ? 'text-cyan-400' : value ? 'text-white' : 'text-white/25'}`}>
          {value || '-'}
        </p>
        {copyable && value && (
          <button 
            onClick={() => copyToClipboard(String(value))}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <Copy className="w-3 h-3 text-white/30 hover:text-white/60" />
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-white/40 text-sm">Loading invoice...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Invoice Not Found</h2>
          <p className="text-white/40 mb-6">{error || "The invoice you're looking for doesn't exist."}</p>
          <Link href="/finance/ar/invoices" className="text-purple-400 hover:text-purple-300">
            ← Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(invoice.status);
  const StatusIcon = statusInfo.icon;
  const riskInfo = getRiskBadge(invoice.riskClass);
  const deliveryInfo = getDeliveryBadge(invoice.deliveryStatus);
  
  // Parse amounts
  const totalAmount = Number(invoice.totalAmount || 0);
  const netAmount = Number(invoice.netAmount || 0);
  const taxAmount = Number(invoice.taxAmount || 0);
  const receipts = Number(invoice.receipts || 0);
  const adjustments = Number(invoice.adjustments || 0);
  const totalReceived = Number(invoice.totalReceipts || 0);
  const balanceAmount = Number(invoice.balance) || (totalAmount - totalReceived);
  const paymentProgress = totalAmount > 0 ? Math.min(100, (totalReceived / totalAmount) * 100) : 0;

  // Use backend-calculated values or calculate locally
  const daysOverdue = (invoice as any).daysOverdue || 0;
  const isOverdue = (invoice as any).isOverdue || (daysOverdue > 0 && invoice.status !== 'PAID');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/finance/ar/invoices"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                {invoice.invoiceNumber}
              </h1>
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border flex items-center gap-1.5 shadow-lg ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} ${statusInfo.glow}`}>
                <StatusIcon className="w-4 h-4" />
                {invoice.status}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${riskInfo.bg} ${riskInfo.text} ${riskInfo.border}`}>
                {invoice.riskClass} RISK
              </span>
            </div>
            <p className="text-white/40 text-sm mt-1">{invoice.customerName} • {invoice.bpCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadInvoice(params.id as string)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all font-medium"
          >
            <IndianRupee className="w-4 h-4" />
            Record Payment
          </button>
          <Link
            href={`/finance/ar/invoices/${encodeURIComponent(invoice.invoiceNumber)}/edit`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/30 transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>

      {/* Copied Toast */}
      {copied && (
        <div className="fixed top-4 right-4 px-4 py-2 bg-emerald-500 text-white rounded-lg shadow-lg animate-fade-in z-50">
          Copied to clipboard!
        </div>
      )}

      {/* Financial Summary Card */}
      <div className="bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-transparent backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-lg shadow-purple-500/5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Total Amount</p>
            <p className="text-xl lg:text-2xl font-bold text-white">{formatARCurrency(totalAmount)}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Net Amount</p>
            <p className="text-xl lg:text-2xl font-bold text-cyan-400">{formatARCurrency(netAmount)}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Tax</p>
            <p className="text-xl lg:text-2xl font-bold text-purple-400">{taxAmount > 0 ? `${taxAmount}%` : '-'}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Receipts</p>
            <p className="text-xl lg:text-2xl font-bold text-blue-400">{formatARCurrency(receipts)}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-emerald-500/10">
            <p className="text-emerald-400/60 text-xs uppercase tracking-wider mb-2">Total Receipts</p>
            <p className="text-xl lg:text-2xl font-bold text-emerald-400">{formatARCurrency(totalReceived)}</p>
          </div>
          <div className={`text-center p-4 rounded-xl ${balanceAmount > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
            <p className={`${balanceAmount > 0 ? 'text-amber-400/60' : 'text-emerald-400/60'} text-xs uppercase tracking-wider mb-2`}>Balance</p>
            <p className={`text-xl lg:text-2xl font-bold ${balanceAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatARCurrency(balanceAmount)}
            </p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Payment Progress</span>
            <span className="text-white/60 font-medium">{Math.round(paymentProgress)}%</span>
            <span>{formatARCurrency(totalReceived)} of {formatARCurrency(totalAmount)}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid - 4 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Column 1: SAP Invoice Details */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            SAP Details
          </h3>
          <div className="space-y-4">
            <Field label="Invoice Number" value={invoice.invoiceNumber} copyable highlight />
            <Field label="BP Code" value={invoice.bpCode} copyable highlight />
            <Field label="Customer Name" value={invoice.customerName} />
            <Field label="PO Number" value={invoice.poNo} copyable />
            <Field label="Type" value={invoice.type} />
            <Field label="Payment Terms" value={invoice.actualPaymentTerms} />
          </div>
        </div>

        {/* Column 2: Dates & Status */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Dates & Status
          </h3>
          <div className="space-y-4">
            <Field label="Invoice Date" value={formatARDate(invoice.invoiceDate)} />
            <Field label="Due Date" value={formatARDate(invoice.dueDate)} />
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Days Overdue</p>
              {daysOverdue > 0 ? (
                <p className="text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded inline-block">{daysOverdue} days</p>
              ) : (
                <p className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> On Time
                </p>
              )}
            </div>
            <div className="relative group">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-white/40 text-xs uppercase tracking-wider">Due By Days</p>
                <div className="relative">
                  <Shield className="w-3.5 h-3.5 text-white/30 cursor-help" />
                  {/* Risk Class Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-4 py-3 bg-[#1a1d2e] border border-white/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-64">
                    <p className="text-white font-semibold text-xs mb-2">Risk Class Criteria</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">≤ 0 days</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">LOW</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">1 - 30 days</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">MEDIUM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">31 - 90 days</span>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">HIGH</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">&gt; 90 days</span>
                        <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-300 font-medium">CRITICAL</span>
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/20"></div>
                  </div>
                </div>
              </div>
              <p className="text-white font-medium">{invoice.dueByDays ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* Column 3: Customer Info */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            Customer
          </h3>
          
          {/* Customer Header */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{invoice.customerName}</p>
              <p className="text-cyan-400 font-mono text-sm">{invoice.bpCode}</p>
            </div>
          </div>

          <div className="space-y-4">
            {invoice.emailId && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                <span className="text-white/70 truncate">{invoice.emailId}</span>
              </div>
            )}
            {invoice.contactNo && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
                <span className="text-white/70">{invoice.contactNo}</span>
              </div>
            )}
            {invoice.region && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" />
                <span className="text-white/70">{invoice.region}</span>
              </div>
            )}
            <Field label="Department" value={invoice.department} />
            <Field label="Person In Charge" value={invoice.personInCharge} />
          </div>
        </div>

        {/* Column 4: Delivery */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Delivery
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Delivery Status</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${deliveryInfo.bg} ${deliveryInfo.text} ${deliveryInfo.border}`}>
                {invoice.deliveryStatus}
              </span>
            </div>
            <Field label="Mode of Delivery" value={invoice.modeOfDelivery} />
            <Field label="Sent/Handover" value={invoice.sentHandoverDate ? formatARDate(invoice.sentHandoverDate) : null} />
            <Field label="Impact Date" value={invoice.impactDate ? formatARDate(invoice.impactDate) : null} />
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            Payment History
          </h3>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
        </div>

        {invoice.paymentHistory && invoice.paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs uppercase tracking-wider text-white/40 font-medium py-3 px-4">Date</th>
                  <th className="text-left text-xs uppercase tracking-wider text-white/40 font-medium py-3 px-4">Time</th>
                  <th className="text-left text-xs uppercase tracking-wider text-white/40 font-medium py-3 px-4">Mode</th>
                  <th className="text-left text-xs uppercase tracking-wider text-white/40 font-medium py-3 px-4">Ref No</th>
                  <th className="text-right text-xs uppercase tracking-wider text-white/40 font-medium py-3 px-4">Amount</th>
                  <th className="text-left text-xs uppercase tracking-wider text-white/40 font-medium py-3 px-4">Added By</th>
                  <th className="text-left text-xs uppercase tracking-wider text-white/40 font-medium py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoice.paymentHistory.map((payment) => {
                  // Use paymentTime from backend if available
                  const timeStr = (payment as any).paymentTime || '-';
                  const addedBy = (payment as any).recordedBy || '-';
                  return (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white/80">{formatARDate(payment.paymentDate)}</td>
                      <td className="py-3 px-4 text-purple-300 font-mono text-sm">{timeStr}</td>
                      <td className="py-3 px-4 text-cyan-300 font-mono text-sm">{payment.paymentMode || '-'}</td>
                      <td className="py-3 px-4 text-white/60">{payment.referenceNo || '-'}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-medium">{formatARCurrency(payment.amount)}</td>
                      <td className="py-3 px-4 text-amber-300 text-sm">{addedBy}</td>
                      <td className="py-3 px-4 text-white/60 text-sm max-w-xs truncate">{payment.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/5 dashed">
            <Clock className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No payment history recorded yet.</p>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {invoice.comments && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Comments & Remarks
          </h3>
          <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{invoice.comments}</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
              Record Payment
            </h3>
            <p className="text-white/40 text-sm mb-6">Add a new payment record for this invoice.</p>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-lg"
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-2">Date</label>
                  <input 
                    type="date" 
                    required
                    value={paymentForm.paymentDate}
                    onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-2">Time</label>
                  <input 
                    type="time" 
                    required
                    value={paymentForm.paymentTime}
                    onChange={e => setPaymentForm({...paymentForm, paymentTime: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm font-medium mb-2">Mode</label>
                  <input 
                    type="text"
                    value={paymentForm.paymentMode}
                    onChange={e => setPaymentForm({...paymentForm, paymentMode: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
                    placeholder="e.g. NEFT"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Reference / UTR No</label>
                <input 
                  type="text" 
                  value={paymentForm.referenceNo}
                  onChange={e => setPaymentForm({...paymentForm, referenceNo: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="e.g. UTR123456789"
                />
              </div>
              
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Notes</label>
                <textarea 
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none h-20"
                  placeholder="Optional notes..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  {paymentLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
