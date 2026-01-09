'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi } from '@/lib/ar-api';
import { ArrowLeft, Save, Loader2, FileText, Sparkles, Upload, AlertCircle, IndianRupee, Calendar, Info } from 'lucide-react';

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    bpCode: '',
    customerName: '',
    poNo: '',
    totalAmount: '',
    netAmount: '',
    taxAmount: '',
    invoiceDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all mandatory fields
    if (!formData.invoiceNumber || !formData.bpCode || !formData.customerName || 
        !formData.poNo || !formData.totalAmount || !formData.netAmount || 
        !formData.taxAmount || !formData.invoiceDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await arApi.createInvoice({
        invoiceNumber: formData.invoiceNumber,
        bpCode: formData.bpCode,
        customerName: formData.customerName,
        poNo: formData.poNo,
        totalAmount: parseFloat(formData.totalAmount),
        netAmount: parseFloat(formData.netAmount),
        taxAmount: parseFloat(formData.taxAmount),
        invoiceDate: formData.invoiceDate,
        // Due date auto-calculated by backend (invoice date + 30 days)
      });
      router.push('/finance/ar/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/finance/ar/invoices"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent flex items-center gap-2">
              New Invoice
              <Sparkles className="w-5 h-5 text-purple-400" />
            </h1>
            <p className="text-white/40 text-sm mt-1">Create a new AR invoice manually</p>
          </div>
        </div>
        <Link 
          href="/finance/ar/import"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all font-medium"
        >
          <Upload className="w-4 h-4" />
          Import from Excel
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium text-sm">All fields are mandatory</p>
            <p className="text-blue-400/60 text-xs mt-1">Due date will be auto-calculated as 30 days from the document date</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/20 transition-all">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Invoice Details
          </h3>
          <div className="grid grid-cols-2 gap-5">
            {/* Doc. No. */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Doc. No. <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="INV-2024-001"
                required
              />
            </div>

            {/* Customer Code */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Customer Code <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                name="bpCode"
                value={formData.bpCode}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="CUST001"
                required
              />
            </div>

            {/* Customer Name */}
            <div className="col-span-2">
              <label className="block text-white/60 text-sm font-medium mb-2">
                Customer Name <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="ABC Corporation Ltd"
                required
              />
            </div>

            {/* Customer Ref. No. */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Customer Ref. No. <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                name="poNo"
                value={formData.poNo}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="PO-12345"
                required
              />
            </div>

            {/* Document Date */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Document Date <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amount Details */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-emerald-500/20 transition-all">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
            Amount Details
          </h3>
          <div className="grid grid-cols-3 gap-5">
            {/* Amount */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Amount (₹) <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">₹</span>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  className="w-full h-11 pl-8 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="100000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Net */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Net (₹) <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">₹</span>
                <input
                  type="number"
                  name="netAmount"
                  value={formData.netAmount}
                  onChange={handleChange}
                  className="w-full h-11 pl-8 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="84746"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Tax */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Tax (%) <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="taxAmount"
                  value={formData.taxAmount}
                  onChange={handleChange}
                  className="w-full h-11 pl-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="18"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            href="/finance/ar/invoices"
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
