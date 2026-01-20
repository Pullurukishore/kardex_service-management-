'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARPaymentTerm } from '@/lib/ar-api';
import { ArrowLeft, Save, Loader2, CreditCard, Sparkles, Clock, Info } from 'lucide-react';

export default function EditPaymentTermPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    termCode: '',
    termName: '',
    dueDays: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    loadTerm();
  }, [params.id]);

  const loadTerm = async () => {
    try {
      setLoading(true);
      const data = await arApi.getPaymentTermById(params.id as string);
      setFormData({
        termCode: data.termCode,
        termName: data.termName,
        dueDays: data.dueDays.toString(),
        description: data.description || '',
        isActive: data.isActive,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load payment term');
    } finally {
      setLoading(false);
    }
  };

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
      await arApi.updatePaymentTerm(params.id as string, {
        termCode: formData.termCode.toUpperCase(),
        termName: formData.termName,
        dueDays: parseInt(formData.dueDays),
        description: formData.description || undefined,
        isActive: formData.isActive,
      });
      router.push(`/finance/ar/payment-terms/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update payment term');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-4 h-4 rounded-full bg-gradient-to-r from-[#CE9F6B] to-[#976E44] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-[#92A2A5] text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href={`/finance/ar/payment-terms/${params.id}`}
          className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-[#CE9F6B]/10 hover:border-[#CE9F6B]/40 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] shadow-lg shadow-[#CE9F6B]/30">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            Edit Payment Term
            <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
          </h1>
          <p className="text-[#92A2A5] text-sm mt-1 ml-1">Update payment term configuration</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-[#E17F70]/10 border-2 border-[#E17F70]/30 rounded-xl text-[#9E3B47]">
            {error}
          </div>
        )}

        {/* Term Details */}
        <div className="bg-white rounded-2xl border-2 border-[#CE9F6B]/20 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-[#546A7A] mb-5 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#CE9F6B]" />
            Term Details
          </h3>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2">
                Term Code <span className="text-[#CE9F6B]">*</span>
              </label>
              <input
                type="text"
                name="termCode"
                value={formData.termCode}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#CE9F6B]/50 focus:outline-none focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all uppercase"
                placeholder="NET30"
                required
              />
              <p className="text-[#92A2A5] text-xs mt-1">Unique identifier (e.g., NET30, COD)</p>
            </div>
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2">
                Term Name <span className="text-[#CE9F6B]">*</span>
              </label>
              <input
                type="text"
                name="termName"
                value={formData.termName}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#CE9F6B]/50 focus:outline-none focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all"
                placeholder="Net 30 Days"
                required
              />
            </div>
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Due Days <span className="text-[#CE9F6B]">*</span>
              </label>
              <input
                type="number"
                name="dueDays"
                value={formData.dueDays}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#CE9F6B]/50 focus:outline-none focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all"
                placeholder="30"
                required
              />
              <p className="text-[#92A2A5] text-xs mt-1">Days until payment is due (use negative for prepaid)</p>
            </div>
            <div className="flex items-center pt-7">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-12 h-7 rounded-full transition-all ${formData.isActive ? 'bg-gradient-to-r from-[#82A094] to-[#4F6A64]' : 'bg-[#AEBFC3]/30'}`}>
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${formData.isActive ? 'left-[22px]' : 'left-0.5'}`} />
                  </div>
                </div>
                <span className="text-[#546A7A] font-medium group-hover:text-[#82A094] transition-colors">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-[#5D6E73] text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#CE9F6B]/50 focus:outline-none focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all resize-none"
                placeholder="Payment due in 30 days from invoice date"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/finance/ar/payment-terms/${params.id}`}
            className="px-6 py-3 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-[#AEBFC3]/10 transition-all font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white font-semibold hover:shadow-lg hover:shadow-[#82A094]/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
