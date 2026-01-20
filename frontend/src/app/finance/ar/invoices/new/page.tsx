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
      });
      router.push('/finance/ar/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full h-12 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#E17F70]/50 focus:outline-none focus:ring-4 focus:ring-[#E17F70]/10 transition-all font-medium";

  return (
    <div className="space-y-6 w-full relative">
      {/* Decorative Background */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-[#E17F70]/10 to-[#CE9F6B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-tr from-[#82A094]/10 to-[#6F8A9D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E17F70] via-[#CE9F6B] to-[#976E44] p-6 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-12 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute -bottom-8 right-32 w-48 h-48 border-4 border-white rounded-full" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/finance/ar/invoices"
              className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                New Invoice
                <Sparkles className="w-6 h-6 text-white/80" />
              </h1>
              <p className="text-white/80 text-sm mt-1">Create a new AR invoice manually</p>
            </div>
          </div>
          <Link 
            href="/finance/ar/import"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#4F6A64] font-semibold hover:shadow-lg transition-all"
          >
            <Upload className="w-4 h-4" />
            Import from Excel
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#E17F70]/10 to-[#9E3B47]/10 border-2 border-[#E17F70]/30 rounded-xl text-[#9E3B47] font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-[#6F8A9D]/15 to-[#82A094]/10 border-2 border-[#6F8A9D]/30 rounded-xl">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#6F8A9D] to-[#546A7A]">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[#546A7A] font-semibold text-sm">All fields are mandatory</p>
            <p className="text-[#92A2A5] text-xs mt-1">Due date will be auto-calculated as 30 days from the document date</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#E17F70]/20 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-[#546A7A] mb-5 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#E17F70] to-[#CE9F6B]">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Invoice Details
          </h3>
          <div className="grid grid-cols-2 gap-5">
            {/* Doc. No. */}
            <div>
              <label className="block text-[#5D6E73] text-sm font-semibold mb-2">
                Doc. No. <span className="text-[#E17F70]">*</span>
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className={inputClass}
                placeholder="INV-2024-001"
                required
              />
            </div>

            {/* Customer Code */}
            <div>
              <label className="block text-[#5D6E73] text-sm font-semibold mb-2">
                Customer Code <span className="text-[#E17F70]">*</span>
              </label>
              <input
                type="text"
                name="bpCode"
                value={formData.bpCode}
                onChange={handleChange}
                className={inputClass}
                placeholder="CUST001"
                required
              />
            </div>

            {/* Customer Name */}
            <div className="col-span-2">
              <label className="block text-[#5D6E73] text-sm font-semibold mb-2">
                Customer Name <span className="text-[#E17F70]">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className={inputClass}
                placeholder="ABC Corporation Ltd"
                required
              />
            </div>

            {/* Customer Ref. No. */}
            <div>
              <label className="block text-[#5D6E73] text-sm font-semibold mb-2">
                Customer Ref. No. <span className="text-[#E17F70]">*</span>
              </label>
              <input
                type="text"
                name="poNo"
                value={formData.poNo}
                onChange={handleChange}
                className={inputClass}
                placeholder="PO-12345"
                required
              />
            </div>

            {/* Document Date */}
            <div>
              <label className="block text-[#5D6E73] text-sm font-semibold mb-2">
                Document Date <span className="text-[#E17F70]">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CE9F6B]" />
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] focus:border-[#E17F70]/50 focus:outline-none focus:ring-4 focus:ring-[#E17F70]/10 transition-all font-medium"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amount Details */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#82A094]/20 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-[#546A7A] mb-5 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#82A094] to-[#4F6A64]">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            Amount Details
          </h3>
          <div className="grid grid-cols-3 gap-5">
            {/* Amount */}
            <div>
              <label className="block text-[#5D6E73] text-sm font-semibold mb-2">
                Amount (₹) <span className="text-[#E17F70]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CE9F6B] font-semibold">₹</span>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  className="w-full h-12 pl-8 pr-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/10 transition-all font-medium"
                  placeholder="100000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Net */}
            <div>
              <label className="block text-[#5D6E73] text-sm font-semibold mb-2">
                Net (₹) <span className="text-[#E17F70]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CE9F6B] font-semibold">₹</span>
                <input
                  type="number"
                  name="netAmount"
                  value={formData.netAmount}
                  onChange={handleChange}
                  className="w-full h-12 pl-8 pr-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/10 transition-all font-medium"
                  placeholder="84746"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Tax */}
            <div>
              <label className="block text-[#5D6E73] text-sm font-semibold mb-2">
                Tax (%) <span className="text-[#E17F70]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="taxAmount"
                  value={formData.taxAmount}
                  onChange={handleChange}
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#82A094]/50 focus:outline-none focus:ring-4 focus:ring-[#82A094]/10 transition-all font-medium"
                  placeholder="18"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CE9F6B] font-semibold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            href="/finance/ar/invoices"
            className="px-8 py-3.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-[#AEBFC3]/10 transition-all font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="group relative flex items-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-r from-[#E17F70] to-[#CE9F6B] text-white font-bold hover:shadow-xl hover:shadow-[#E17F70]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span className="relative">{saving ? 'Saving...' : 'Create Invoice'}</span>
            <Sparkles className="w-4 h-4 relative" />
          </button>
        </div>
      </form>
    </div>
  );
}
