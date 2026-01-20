'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARInvoice, ARPaymentHistory, formatARCurrency, formatARDate } from '@/lib/ar-api';
import { 
  ArrowLeft, Edit, Trash2, FileText, Calendar, User, IndianRupee, Clock, 
  AlertTriangle, CheckCircle, Loader2, Mail, Phone, MapPin, Building, 
  CreditCard, Hash, Receipt, Truck, MessageSquare, Shield, Copy, 
  ExternalLink, Printer, Download, RefreshCw, Plus, X, Sparkles
} from 'lucide-react';

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<ARInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
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
      case 'PAID': return { bg: 'bg-gradient-to-r from-[#82A094] to-[#4F6A64]', text: 'text-white', icon: CheckCircle };
      case 'PARTIAL': return { bg: 'bg-gradient-to-r from-[#CE9F6B] to-[#976E44]', text: 'text-white', icon: Clock };
      case 'OVERDUE': return { bg: 'bg-gradient-to-r from-[#E17F70] to-[#9E3B47]', text: 'text-white', icon: AlertTriangle };
      case 'PENDING': return { bg: 'bg-gradient-to-r from-[#6F8A9D] to-[#546A7A]', text: 'text-white', icon: Clock };
      case 'CANCELLED': return { bg: 'bg-gradient-to-r from-[#AEBFC3] to-[#92A2A5]', text: 'text-white', icon: FileText };
      default: return { bg: 'bg-gradient-to-r from-[#AEBFC3] to-[#92A2A5]', text: 'text-white', icon: FileText };
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white';
      case 'MEDIUM': return 'bg-gradient-to-r from-[#CE9F6B] to-[#976E44] text-white';
      case 'HIGH': return 'bg-gradient-to-r from-[#E17F70] to-[#9E3B47] text-white';
      case 'CRITICAL': return 'bg-gradient-to-r from-[#9E3B47] to-[#75242D] text-white';
      default: return 'bg-[#AEBFC3]/15 text-[#5D6E73] border border-[#AEBFC3]/40';
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-[#4F6A64]/15 text-[#4F6A64] border border-[#82A094]/40';
      case 'SENT': return 'bg-[#CE9F6B]/15 text-[#976E44] border border-[#CE9F6B]/40';
      case 'ACKNOWLEDGED': return 'bg-[#6F8A9D]/15 text-[#546A7A] border border-[#6F8A9D]/40';
      default: return 'bg-[#AEBFC3]/15 text-[#5D6E73] border border-[#AEBFC3]/40';
    }
  };

  const Field = ({ label, value, copyable = false, highlight = false, className = '' }: { 
    label: string; 
    value: string | number | null | undefined; 
    copyable?: boolean;
    highlight?: boolean;
    className?: string;
  }) => (
    <div className={className}>
      <p className="text-[#92A2A5] text-xs uppercase tracking-wider mb-1.5 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`font-semibold ${highlight ? 'text-[#E17F70]' : value ? 'text-[#546A7A]' : 'text-[#AEBFC3]'}`}>
          {value || '-'}
        </p>
        {copyable && value && (
          <button 
            onClick={() => copyToClipboard(String(value))}
            className="p-1.5 rounded-lg hover:bg-[#E17F70]/10 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#92A2A5] hover:text-[#E17F70]" />
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
                className="w-4 h-4 rounded-full bg-gradient-to-r from-[#E17F70] to-[#CE9F6B] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-[#92A2A5] text-sm">Loading invoice...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E17F70]/20 to-[#CE9F6B]/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-[#CE9F6B]" />
          </div>
          <h2 className="text-xl font-bold text-[#546A7A] mb-2">Invoice Not Found</h2>
          <p className="text-[#92A2A5] mb-6">{error || "The invoice you're looking for doesn't exist."}</p>
          <Link href="/finance/ar/invoices" className="text-[#E17F70] hover:text-[#9E3B47] font-semibold">
            ← Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(invoice.status);
  const StatusIcon = statusInfo.icon;
  
  const totalAmount = Number(invoice.totalAmount || 0);
  const netAmount = Number(invoice.netAmount || 0);
  const taxAmount = Number(invoice.taxAmount || 0);
  const receipts = Number(invoice.receipts || 0);
  const adjustments = Number(invoice.adjustments || 0);
  const totalReceived = Number(invoice.totalReceipts || 0);
  const balanceAmount = Number(invoice.balance) || (totalAmount - totalReceived);
  const paymentProgress = totalAmount > 0 ? Math.min(100, (totalReceived / totalAmount) * 100) : 0;

  const daysOverdue = (invoice as any).daysOverdue || 0;
  const isOverdue = (invoice as any).isOverdue || (daysOverdue > 0 && invoice.status !== 'PAID');

  return (
    <div className="space-y-6 relative">
      {/* Decorative Background */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-[#E17F70]/10 to-[#CE9F6B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E17F70] via-[#CE9F6B] to-[#976E44] p-6 shadow-xl">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-12 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute -bottom-8 right-32 w-48 h-48 border-4 border-white rounded-full" />
        </div>

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/finance/ar/invoices"
              className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">
                  {invoice.invoiceNumber}
                </h1>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.text} shadow-lg`}>
                  <StatusIcon className="w-4 h-4" />
                  {invoice.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskBadge(invoice.riskClass)} shadow-md`}>
                  {invoice.riskClass} RISK
                </span>
              </div>
              <p className="text-white/80 text-sm mt-1">{invoice.customerName} • {invoice.bpCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadInvoice(params.id as string)}
              className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#4F6A64] font-semibold hover:shadow-lg transition-all"
            >
              <IndianRupee className="w-4 h-4" />
              Record Payment
            </button>
            <Link
              href={`/finance/ar/invoices/${encodeURIComponent(invoice.invoiceNumber)}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#75242D]/80 backdrop-blur-sm border border-[#9E3B47]/50 text-white hover:bg-[#75242D] transition-all disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Copied Toast */}
      {copied && (
        <div className="fixed top-4 right-4 px-4 py-2 bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white rounded-lg shadow-xl animate-fade-in z-50">
          Copied to clipboard!
        </div>
      )}

      {/* Financial Summary Card */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl border border-[#CE9F6B]/20 p-6 shadow-xl">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-[#E17F70]/10 to-[#CE9F6B]/10 rounded-full blur-2xl" />
        
        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-white to-[#AEBFC3]/10 border border-[#AEBFC3]/30 shadow-sm">
            <p className="text-[#92A2A5] text-xs uppercase tracking-wider mb-2 font-medium">Total Amount</p>
            <p className="text-xl lg:text-2xl font-bold text-[#546A7A]">{formatARCurrency(totalAmount)}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-white to-[#6F8A9D]/10 border border-[#6F8A9D]/30 shadow-sm">
            <p className="text-[#6F8A9D] text-xs uppercase tracking-wider mb-2 font-medium">Net Amount</p>
            <p className="text-xl lg:text-2xl font-bold text-[#6F8A9D]">{formatARCurrency(netAmount)}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-white to-[#AEBFC3]/10 border border-[#AEBFC3]/30 shadow-sm">
            <p className="text-[#92A2A5] text-xs uppercase tracking-wider mb-2 font-medium">Tax</p>
            <p className="text-xl lg:text-2xl font-bold text-[#5D6E73]">{taxAmount > 0 ? `${taxAmount}%` : '-'}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-white to-[#AEBFC3]/10 border border-[#AEBFC3]/30 shadow-sm">
            <p className="text-[#92A2A5] text-xs uppercase tracking-wider mb-2 font-medium">Receipts</p>
            <p className="text-xl lg:text-2xl font-bold text-[#5D6E73]">{formatARCurrency(receipts)}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#82A094]/10 to-[#4F6A64]/10 border border-[#82A094]/30 shadow-sm">
            <p className="text-[#82A094] text-xs uppercase tracking-wider mb-2 font-medium">Total Receipts</p>
            <p className="text-xl lg:text-2xl font-bold text-[#4F6A64]">{formatARCurrency(totalReceived)}</p>
          </div>
          <div className={`text-center p-4 rounded-xl ${balanceAmount > 0 ? 'bg-gradient-to-br from-[#E17F70]/10 to-[#CE9F6B]/10 border-[#E17F70]/30' : 'bg-gradient-to-br from-[#82A094]/10 to-[#4F6A64]/10 border-[#82A094]/30'} border shadow-sm`}>
            <p className={`${balanceAmount > 0 ? 'text-[#E17F70]' : 'text-[#82A094]'} text-xs uppercase tracking-wider mb-2 font-medium`}>Balance</p>
            <p className={`text-xl lg:text-2xl font-bold ${balanceAmount > 0 ? 'text-[#9E3B47]' : 'text-[#4F6A64]'}`}>
              {formatARCurrency(balanceAmount)}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative mt-6">
          <div className="flex justify-between text-xs text-[#92A2A5] mb-2">
            <span>Payment Progress</span>
            <span className="text-[#5D6E73] font-bold">{Math.round(paymentProgress)}%</span>
            <span>{formatARCurrency(totalReceived)} of {formatARCurrency(totalAmount)}</span>
          </div>
          <div className="h-4 bg-[#AEBFC3]/20 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#82A094] via-[#4F6A64] to-[#82A094] rounded-full transition-all duration-500 relative"
              style={{ width: `${paymentProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Column 1: SAP Invoice Details */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#E17F70]/20 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-bold text-[#546A7A] mb-5 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#E17F70] to-[#CE9F6B]">
              <FileText className="w-5 h-5 text-white" />
            </div>
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
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#82A094]/20 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-bold text-[#546A7A] mb-5 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#82A094] to-[#4F6A64]">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Dates & Status
          </h3>
          <div className="space-y-4">
            <Field label="Invoice Date" value={formatARDate(invoice.invoiceDate)} />
            <Field label="Due Date" value={formatARDate(invoice.dueDate)} />
            <div>
              <p className="text-[#92A2A5] text-xs uppercase tracking-wider mb-1.5 font-medium">Days Overdue</p>
              {daysOverdue > 0 ? (
                <p className="text-white font-bold bg-gradient-to-r from-[#E17F70] to-[#9E3B47] px-3 py-1.5 rounded-full inline-block shadow-md">{daysOverdue} days</p>
              ) : (
                <p className="text-[#4F6A64] font-semibold flex items-center gap-1.5 bg-[#82A094]/10 px-3 py-1.5 rounded-full inline-flex">
                  <CheckCircle className="w-4 h-4" /> On Time
                </p>
              )}
            </div>
            <div className="relative group">
              <div className="flex items-center gap-1.5 mb-1.5">
                <p className="text-[#92A2A5] text-xs uppercase tracking-wider font-medium">Due By Days</p>
                <div className="relative">
                  <Shield className="w-3.5 h-3.5 text-[#92A2A5] cursor-help" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-4 py-3 bg-white border-2 border-[#E17F70]/30 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-64">
                    <p className="text-[#546A7A] font-bold text-xs mb-2">Risk Class Criteria</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5D6E73]">≤ 0 days</span>
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white font-medium">LOW</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5D6E73]">1 - 30 days</span>
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#CE9F6B] to-[#976E44] text-white font-medium">MEDIUM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5D6E73]">31 - 90 days</span>
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#E17F70] to-[#9E3B47] text-white font-medium">HIGH</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5D6E73]">&gt; 90 days</span>
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#9E3B47] to-[#75242D] text-white font-medium">CRITICAL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[#546A7A] font-semibold">{invoice.dueByDays ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* Column 3: Customer Info */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#CE9F6B]/20 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-bold text-[#546A7A] mb-5 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE9F6B] to-[#976E44]">
              <User className="w-5 h-5 text-white" />
            </div>
            Customer
          </h3>
          
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#AEBFC3]/30">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E17F70] to-[#CE9F6B] flex items-center justify-center shadow-lg shadow-[#CE9F6B]/30">
              <Building className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#546A7A] font-bold truncate">{invoice.customerName}</p>
              <p className="text-[#E17F70] font-mono text-sm font-medium">{invoice.bpCode}</p>
            </div>
          </div>

          <div className="space-y-4">
            {invoice.emailId && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-[#CE9F6B] flex-shrink-0" />
                <span className="text-[#5D6E73] truncate">{invoice.emailId}</span>
              </div>
            )}
            {invoice.contactNo && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-[#CE9F6B] flex-shrink-0" />
                <span className="text-[#5D6E73]">{invoice.contactNo}</span>
              </div>
            )}
            {invoice.region && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-[#CE9F6B] flex-shrink-0" />
                <span className="text-[#5D6E73]">{invoice.region}</span>
              </div>
            )}
            <Field label="Department" value={invoice.department} />
            <Field label="Person In Charge" value={invoice.personInCharge} />
          </div>
        </div>

        {/* Column 4: Delivery */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#6F8A9D]/20 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-bold text-[#546A7A] mb-5 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#6F8A9D] to-[#546A7A]">
              <Truck className="w-5 h-5 text-white" />
            </div>
            Delivery
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[#92A2A5] text-xs uppercase tracking-wider mb-1.5 font-medium">Delivery Status</p>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getDeliveryBadge(invoice.deliveryStatus)}`}>
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
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#82A094]/20 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#546A7A] flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#82A094] to-[#4F6A64]">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            Payment History
          </h3>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#82A094]/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
        </div>

        {invoice.paymentHistory && invoice.paymentHistory.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[#AEBFC3]/20">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#82A094]/10 to-[#4F6A64]/10 border-b border-[#AEBFC3]/20">
                  <th className="text-left text-xs uppercase tracking-wider text-[#5D6E73] font-bold py-4 px-5">Date</th>
                  <th className="text-left text-xs uppercase tracking-wider text-[#5D6E73] font-bold py-4 px-5">Time</th>
                  <th className="text-left text-xs uppercase tracking-wider text-[#5D6E73] font-bold py-4 px-5">Mode</th>
                  <th className="text-left text-xs uppercase tracking-wider text-[#5D6E73] font-bold py-4 px-5">Ref No</th>
                  <th className="text-right text-xs uppercase tracking-wider text-[#5D6E73] font-bold py-4 px-5">Amount</th>
                  <th className="text-left text-xs uppercase tracking-wider text-[#5D6E73] font-bold py-4 px-5">Added By</th>
                  <th className="text-left text-xs uppercase tracking-wider text-[#5D6E73] font-bold py-4 px-5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#AEBFC3]/15">
                {invoice.paymentHistory.map((payment) => {
                  const timeStr = (payment as any).paymentTime || '-';
                  const addedBy = (payment as any).recordedBy || '-';
                  return (
                    <tr key={payment.id} className="hover:bg-gradient-to-r hover:from-[#82A094]/5 hover:to-[#4F6A64]/5 transition-colors">
                      <td className="py-4 px-5 text-[#546A7A] font-medium">{formatARDate(payment.paymentDate)}</td>
                      <td className="py-4 px-5 text-[#6F8A9D] font-mono text-sm">{timeStr}</td>
                      <td className="py-4 px-5 text-[#6F8A9D] font-mono text-sm">{payment.paymentMode || '-'}</td>
                      <td className="py-4 px-5 text-[#5D6E73]">{payment.referenceNo || '-'}</td>
                      <td className="py-4 px-5 text-right text-[#4F6A64] font-bold">{formatARCurrency(payment.amount)}</td>
                      <td className="py-4 px-5 text-[#CE9F6B] text-sm font-medium">{addedBy}</td>
                      <td className="py-4 px-5 text-[#5D6E73] text-sm max-w-xs truncate">{payment.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-[#AEBFC3]/10 to-[#82A094]/5 rounded-xl border-2 border-dashed border-[#AEBFC3]/30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#82A094]/20 to-[#4F6A64]/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[#82A094]" />
            </div>
            <p className="text-[#5D6E73] font-medium">No payment history recorded yet.</p>
            <p className="text-[#92A2A5] text-sm mt-1">Click "Add Payment" to record the first payment.</p>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {invoice.comments && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#6F8A9D]/20 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-[#546A7A] mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#6F8A9D] to-[#546A7A]">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            Comments & Remarks
          </h3>
          <p className="text-[#5D6E73] leading-relaxed whitespace-pre-wrap bg-[#AEBFC3]/10 p-4 rounded-xl">{invoice.comments}</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-2 border-[#82A094]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-[#92A2A5] hover:text-[#5D6E73] transition-colors p-1 hover:bg-[#AEBFC3]/20 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-[#546A7A] mb-1 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#82A094] to-[#4F6A64]">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              Record Payment
            </h3>
            <p className="text-[#92A2A5] text-sm mb-6">Add a new payment record for this invoice.</p>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-[#5D6E73] text-sm font-semibold mb-2">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/20 transition-all font-mono text-lg"
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#5D6E73] text-sm font-semibold mb-2">Date</label>
                  <input 
                    type="date" 
                    required
                    value={paymentForm.paymentDate}
                    onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#5D6E73] text-sm font-semibold mb-2">Time</label>
                  <input 
                    type="time" 
                    required
                    value={paymentForm.paymentTime}
                    onChange={e => setPaymentForm({...paymentForm, paymentTime: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#5D6E73] text-sm font-semibold mb-2">Mode</label>
                  <input 
                    type="text"
                    value={paymentForm.paymentMode}
                    onChange={e => setPaymentForm({...paymentForm, paymentMode: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/20 transition-all text-sm font-medium"
                    placeholder="e.g. NEFT"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[#5D6E73] text-sm font-semibold mb-2">Reference / UTR No</label>
                <input 
                  type="text" 
                  value={paymentForm.referenceNo}
                  onChange={e => setPaymentForm({...paymentForm, referenceNo: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/20 transition-all"
                  placeholder="e.g. UTR123456789"
                />
              </div>
              
              <div>
                <label className="block text-[#5D6E73] text-sm font-semibold mb-2">Notes</label>
                <textarea 
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/20 transition-all resize-none h-20"
                  placeholder="Optional notes..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-[#AEBFC3]/10 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white font-bold hover:shadow-lg hover:shadow-[#82A094]/40 transition-all flex items-center justify-center gap-2"
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
