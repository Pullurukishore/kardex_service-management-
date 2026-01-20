'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi } from '@/lib/ar-api';
import { ArrowLeft, Save, Loader2, Building2, Sparkles, User, Mail, Phone, MapPin, Shield, CreditCard } from 'lucide-react';

const riskOptions = [
  { value: 'LOW', label: 'Low Risk', color: 'text-[#82A094]' },
  { value: 'MEDIUM', label: 'Medium Risk', color: 'text-[#CE9F6B]' },
  { value: 'HIGH', label: 'High Risk', color: 'text-[#E17F70]' },
  { value: 'CRITICAL', label: 'Critical', color: 'text-[#9E3B47]' },
];

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadCustomer();
  }, [params.id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await arApi.getCustomerById(params.id as string);
      setFormData({
        bpCode: data.bpCode,
        customerName: data.customerName,
        region: data.region || '',
        department: data.department || '',
        personInCharge: data.personInCharge || '',
        contactNo: data.contactNo || '',
        emailId: data.emailId || '',
        riskClass: data.riskClass,
        creditLimit: data.creditLimit?.toString() || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

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
      await arApi.updateCustomer(params.id as string, {
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
      router.push(`/finance/ar/customers/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update customer');
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
                className="w-4 h-4 rounded-full bg-gradient-to-r from-[#6F8A9D] to-[#82A094] animate-bounce"
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
          href={`/finance/ar/customers/${params.id}`}
          className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-[#6F8A9D]/10 hover:border-[#6F8A9D]/40 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] shadow-lg shadow-[#6F8A9D]/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            Edit Customer
            <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
          </h1>
          <p className="text-[#92A2A5] text-sm mt-1 ml-1">Update customer information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-[#E17F70]/10 border-2 border-[#E17F70]/30 rounded-xl text-[#9E3B47]">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-2xl border-2 border-[#6F8A9D]/20 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-[#546A7A] mb-5 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#6F8A9D]" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2">
                BP Code <span className="text-[#CE9F6B]">*</span>
              </label>
              <input
                type="text"
                name="bpCode"
                value={formData.bpCode}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#6F8A9D]/50 focus:outline-none focus:ring-2 focus:ring-[#6F8A9D]/20 transition-all uppercase"
                placeholder="BP001"
                required
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-[#5D6E73] text-sm font-medium mb-2">
                Customer Name <span className="text-[#CE9F6B]">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#6F8A9D]/50 focus:outline-none focus:ring-2 focus:ring-[#6F8A9D]/20 transition-all"
                placeholder="Company Name Ltd."
                required
              />
            </div>
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Region
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#6F8A9D]/50 focus:outline-none focus:ring-2 focus:ring-[#6F8A9D]/20 transition-all"
                placeholder="North India"
              />
            </div>
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#6F8A9D]/50 focus:outline-none focus:ring-2 focus:ring-[#6F8A9D]/20 transition-all"
                placeholder="Finance"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border-2 border-[#82A094]/20 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-[#546A7A] mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-[#82A094]" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2">Person In Charge</label>
              <input
                type="text"
                name="personInCharge"
                value={formData.personInCharge}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#82A094]/50 focus:outline-none focus:ring-2 focus:ring-[#82A094]/20 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#82A094]/50 focus:outline-none focus:ring-2 focus:ring-[#82A094]/20 transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                Email ID
              </label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#82A094]/50 focus:outline-none focus:ring-2 focus:ring-[#82A094]/20 transition-all"
                placeholder="contact@company.com"
              />
            </div>
          </div>
        </div>

        {/* Risk & Credit */}
        <div className="bg-white rounded-2xl border-2 border-[#CE9F6B]/20 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-[#546A7A] mb-5 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#CE9F6B]" />
            Risk & Credit Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2">Risk Class</label>
              <select
                name="riskClass"
                value={formData.riskClass}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] focus:border-[#CE9F6B]/50 focus:outline-none focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all"
              >
                {riskOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#5D6E73] text-sm font-medium mb-2 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                Credit Limit (₹)
              </label>
              <input
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-[#AEBFC3]/10 border-2 border-[#AEBFC3]/30 text-[#546A7A] placeholder:text-[#92A2A5] focus:border-[#CE9F6B]/50 focus:outline-none focus:ring-2 focus:ring-[#CE9F6B]/20 transition-all"
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
            href={`/finance/ar/customers/${params.id}`}
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
