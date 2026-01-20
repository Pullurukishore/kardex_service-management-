'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARCustomer, formatARCurrency, formatARDate } from '@/lib/ar-api';
import { ArrowLeft, Edit2, Building2, User, Mail, Phone, MapPin, Shield, CreditCard, Sparkles, AlertTriangle, FileText } from 'lucide-react';

export default function ViewCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<(ARCustomer & { invoices?: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomer();
  }, [params.id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await arApi.getCustomerById(params.id as string);
      setCustomer(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-[#82A094]/15 text-[#4F6A64] border-[#82A094]/30';
      case 'MEDIUM': return 'bg-[#CE9F6B]/15 text-[#976E44] border-[#CE9F6B]/30';
      case 'HIGH': return 'bg-[#E17F70]/15 text-[#9E3B47] border-[#E17F70]/30';
      case 'CRITICAL': return 'bg-[#E17F70]/20 text-[#9E3B47] border-[#E17F70]/40';
      default: return 'bg-[#AEBFC3]/15 text-[#5D6E73] border-[#AEBFC3]/30';
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

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/finance/ar/customers"
            className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-[#6F8A9D]/10 hover:border-[#6F8A9D]/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#546A7A]">Customer Not Found</h1>
        </div>
        <div className="p-6 bg-[#E17F70]/10 border-2 border-[#E17F70]/30 rounded-xl text-[#9E3B47]">
          {error || 'The requested customer could not be found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/finance/ar/customers"
            className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-[#6F8A9D]/10 hover:border-[#6F8A9D]/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] shadow-lg shadow-[#6F8A9D]/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              {customer.customerName}
              <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
            </h1>
            <p className="text-[#6F8A9D] font-mono text-sm mt-1 ml-1">{customer.bpCode}</p>
          </div>
        </div>
        <Link
          href={`/finance/ar/customers/${customer.id}/edit`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] text-white font-semibold hover:shadow-lg hover:shadow-[#6F8A9D]/40 hover:-translate-y-0.5 transition-all"
        >
          <Edit2 className="w-4 h-4" />
          Edit Customer
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details */}
          <div className="bg-white rounded-2xl border-2 border-[#6F8A9D]/20 p-6 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6F8A9D] to-[#82A094] opacity-60" />
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] flex items-center justify-center shadow-lg shadow-[#6F8A9D]/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#546A7A]">{customer.customerName}</h2>
                <p className="text-[#6F8A9D] font-mono mt-1">{customer.bpCode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-[#92A2A5] text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  Region
                </label>
                <p className="text-[#546A7A] font-medium">{customer.region || '-'}</p>
              </div>
              <div>
                <label className="text-[#92A2A5] text-sm mb-1 block">Department</label>
                <p className="text-[#546A7A] font-medium">{customer.department || '-'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl border-2 border-[#82A094]/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#546A7A] mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-[#82A094]" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[#92A2A5] text-sm mb-1 block">Person In Charge</label>
                <p className="text-[#546A7A] font-medium">{customer.personInCharge || '-'}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[#92A2A5] text-sm mb-1">
                  <Phone className="w-4 h-4" />
                  Contact Number
                </label>
                <p className="text-[#546A7A] font-medium">{customer.contactNo || '-'}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[#92A2A5] text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-[#546A7A] font-medium">{customer.emailId || '-'}</p>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          {customer.invoices && customer.invoices.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-[#CE9F6B]/20 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#546A7A] mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#CE9F6B]" />
                Recent Invoices
              </h3>
              <div className="space-y-3">
                {customer.invoices.slice(0, 5).map((invoice: any) => (
                  <Link
                    key={invoice.id}
                    href={`/finance/ar/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#AEBFC3]/10 hover:bg-[#CE9F6B]/10 border border-[#AEBFC3]/20 hover:border-[#CE9F6B]/30 transition-all"
                  >
                    <div>
                      <p className="text-[#546A7A] font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-[#92A2A5] text-sm">{formatARDate(invoice.invoiceDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#546A7A] font-semibold">{formatARCurrency(invoice.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        invoice.status === 'PAID' ? 'bg-[#82A094]/15 text-[#4F6A64]' :
                        invoice.status === 'OVERDUE' ? 'bg-[#E17F70]/15 text-[#9E3B47]' :
                        'bg-[#CE9F6B]/15 text-[#976E44]'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Risk & Credit Card */}
          <div className="bg-white rounded-2xl border-2 border-[#CE9F6B]/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#546A7A] mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#CE9F6B]" />
              Risk & Credit
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[#92A2A5] text-sm mb-2 block">Risk Classification</label>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getRiskBadgeColor(customer.riskClass)}`}>
                  {customer.riskClass === 'CRITICAL' && <AlertTriangle className="w-4 h-4" />}
                  {customer.riskClass}
                </span>
              </div>
              
              <div className="pt-4 border-t border-[#AEBFC3]/20">
                <label className="flex items-center gap-2 text-[#92A2A5] text-sm mb-2">
                  <CreditCard className="w-4 h-4" />
                  Credit Limit
                </label>
                <p className="text-2xl font-bold text-[#546A7A]">
                  {customer.creditLimit ? formatARCurrency(customer.creditLimit) : <span className="text-[#AEBFC3]">Not Set</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border-2 border-[#AEBFC3]/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#546A7A] mb-5">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#92A2A5]">Total Invoices</span>
                <span className="text-[#546A7A] font-semibold">{customer.invoices?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#92A2A5]">Created</span>
                <span className="text-[#546A7A] font-semibold">{formatARDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
