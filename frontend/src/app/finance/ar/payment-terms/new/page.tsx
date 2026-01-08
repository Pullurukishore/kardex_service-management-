'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi } from '@/lib/ar-api';
import { ArrowLeft, Save, Loader2, CreditCard, Sparkles } from 'lucide-react';

export default function NewPaymentTermPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    termCode: '',
    termName: '',
    dueDays: '',
    description: '',
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.termCode || !formData.termName || formData.dueDays === '') {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await arApi.createPaymentTerm({
        termCode: formData.termCode.toUpperCase(),
        termName: formData.termName,
        dueDays: parseInt(formData.dueDays),
        description: formData.description || undefined,
        isActive: formData.isActive,
      });
      router.push('/finance/ar/payment-terms');
    } catch (err: any) {
      setError(err.message || 'Failed to create payment term');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/finance/ar/payment-terms"
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-amber-500/10 hover:text-white hover:border-amber-500/30 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            New Payment Term
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-white/40 text-sm mt-1">Create a new payment term configuration</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Term Details */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Term Details
          </h3>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Term Code <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                name="termCode"
                value={formData.termCode}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all uppercase"
                placeholder="NET30"
                required
              />
              <p className="text-white/30 text-xs mt-1">Unique identifier (e.g., NET30, COD)</p>
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Term Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                name="termName"
                value={formData.termName}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                placeholder="Net 30 Days"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Due Days <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                name="dueDays"
                value={formData.dueDays}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                placeholder="30"
                required
              />
              <p className="text-white/30 text-xs mt-1">Days until payment is due (use negative for prepaid)</p>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-white/5 border border-white/20 text-amber-500 focus:ring-amber-500/30"
                />
                <span className="text-white/70 font-medium">Active</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-white/60 text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                placeholder="Payment due in 30 days from invoice date"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/finance/ar/payment-terms"
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
            {saving ? 'Saving...' : 'Create Term'}
          </button>
        </div>
      </form>
    </div>
  );
}
