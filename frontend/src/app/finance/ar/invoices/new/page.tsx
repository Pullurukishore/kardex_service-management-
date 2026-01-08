'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARPaymentTerm } from '@/lib/ar-api';
import { ArrowLeft, Save, Loader2, FileText, Sparkles, Upload, AlertCircle } from 'lucide-react';

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
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    actualPaymentTerms: '',
    emailId: '',
    contactNo: '',
    region: '',
    department: '',
    personInCharge: '',
    pocName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate due date based on payment terms
    if (name === 'actualPaymentTerms' && value && formData.invoiceDate) {
      const days = parseInt(value.replace(/\D/g, '')) || 30;
      const invoiceDate = new Date(formData.invoiceDate);
      invoiceDate.setDate(invoiceDate.getDate() + days);
      setFormData(prev => ({ ...prev, dueDate: invoiceDate.toISOString().split('T')[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.invoiceNumber || !formData.bpCode || !formData.customerName || !formData.totalAmount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await arApi.createInvoice({
        invoiceNumber: formData.invoiceNumber,
        bpCode: formData.bpCode,
        customerName: formData.customerName,
        poNo: formData.poNo || undefined,
        totalAmount: parseFloat(formData.totalAmount),
        netAmount: parseFloat(formData.netAmount) || parseFloat(formData.totalAmount),
        taxAmount: formData.taxAmount ? parseFloat(formData.taxAmount) : undefined,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate || formData.invoiceDate,
        actualPaymentTerms: formData.actualPaymentTerms || undefined,
        emailId: formData.emailId || undefined,
        contactNo: formData.contactNo || undefined,
        region: formData.region || undefined,
        department: formData.department || undefined,
        personInCharge: formData.personInCharge || undefined,
        pocName: formData.pocName || undefined,
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
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              New Invoice
              <Sparkles className="w-5 h-5 text-purple-400" />
            </h1>
            <p className="text-white/40 text-sm mt-1">Create a new AR invoice manually or import from Excel</p>
          </div>
        </div>
        <Link 
          href="/finance/ar/import"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/30 transition-all"
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

        {/* SAP Fields - Invoice Details */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/20 transition-all">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Invoice Details (SAP Fields)
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Doc. No. / Invoice Number <span className="text-purple-400">*</span>
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
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Customer Code (BP Code) <span className="text-purple-400">*</span>
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
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Customer Ref. No. (PO)</label>
              <input
                type="text"
                name="poNo"
                value={formData.poNo}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="PO-12345"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Document Date <span className="text-purple-400">*</span>
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Payment Terms</label>
              <input
                type="text"
                name="actualPaymentTerms"
                value={formData.actualPaymentTerms}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Net 30"
              />
            </div>
          </div>
        </div>

        {/* Amount Fields */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-emerald-500/20 transition-all">
          <h3 className="text-lg font-semibold text-white mb-5">Amount Details</h3>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Total Amount (₹) <span className="text-purple-400">*</span>
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="100000"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Net Amount (₹) <span className="text-purple-400">*</span>
              </label>
              <input
                type="number"
                name="netAmount"
                value={formData.netAmount}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="84746"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Tax Amount (₹)</label>
              <input
                type="number"
                name="taxAmount"
                value={formData.taxAmount}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="15254"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Customer Master Fields */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-cyan-500/20 transition-all">
          <h3 className="text-lg font-semibold text-white mb-5">Customer Contact Details (Optional)</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Email ID</label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="accounts@company.com"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Contact No.</label>
              <input
                type="text"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Region</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="North"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Finance"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Person In-charge</label>
              <input
                type="text"
                name="personInCharge"
                value={formData.personInCharge}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">POC Name</label>
              <input
                type="text"
                name="pocName"
                value={formData.pocName}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Jane Smith"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/finance/ar/invoices"
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
