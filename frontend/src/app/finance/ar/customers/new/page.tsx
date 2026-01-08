'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi } from '@/lib/ar-api';
import { ArrowLeft, Save, Loader2, Building2, Sparkles, User, Mail, Phone, MapPin, Shield, CreditCard } from 'lucide-react';

const riskOptions = [
  { value: 'LOW', label: 'Low Risk', color: 'text-emerald-400' },
  { value: 'MEDIUM', label: 'Medium Risk', color: 'text-amber-400' },
  { value: 'HIGH', label: 'High Risk', color: 'text-red-400' },
  { value: 'CRITICAL', label: 'Critical', color: 'text-red-300' },
];

export default function NewCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bpCode: '',
    customerName: '',
    region: '',
    department: '',
    personInCharge: '',
    contactNo: '',
    emailId: '',
    riskClass: 'LOW',
    creditLimit: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.bpCode || !formData.customerName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await arApi.createCustomer({
        bpCode: formData.bpCode.toUpperCase(),
        customerName: formData.customerName,
        region: formData.region || undefined,
        department: formData.department || undefined,
        personInCharge: formData.personInCharge || undefined,
        contactNo: formData.contactNo || undefined,
        emailId: formData.emailId || undefined,
        riskClass: formData.riskClass as any,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
      });
      router.push('/finance/ar/customers');
    } catch (err: any) {
      setError(err.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/finance/ar/customers"
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-cyan-500/10 hover:text-white hover:border-cyan-500/30 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            New Customer
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-white/40 text-sm mt-1">Add a new customer to the AR system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                BP Code <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                name="bpCode"
                value={formData.bpCode}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all uppercase"
                placeholder="BP001"
                required
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-white/60 text-sm font-medium mb-2">
                Customer Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="Company Name Ltd."
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                Region
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="North India"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="Finance"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Person In Charge</label>
              <input
                type="text"
                name="personInCharge"
                value={formData.personInCharge}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                <Phone className="w-3.5 h-3.5 inline mr-1" />
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                <Mail className="w-3.5 h-3.5 inline mr-1" />
                Email ID
              </label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="contact@company.com"
              />
            </div>
          </div>
        </div>

        {/* Risk & Credit */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Risk & Credit Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Risk Class</label>
              <select
                name="riskClass"
                value={formData.riskClass}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
              >
                {riskOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                Credit Limit (₹)
              </label>
              <input
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="1000000"
                min="0"
                step="1000"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/finance/ar/customers"
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
            {saving ? 'Saving...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
