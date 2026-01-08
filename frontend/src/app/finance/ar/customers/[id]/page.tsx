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
      case 'LOW': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'HIGH': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'CRITICAL': return 'bg-red-600/20 text-red-300 border-red-500/40';
      default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
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
                className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-white/40 text-sm">Loading...</span>
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
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-cyan-500/10 hover:text-white hover:border-cyan-500/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Customer Not Found</h1>
        </div>
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
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
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-cyan-500/10 hover:text-white hover:border-cyan-500/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {customer.customerName}
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </h1>
            <p className="text-cyan-400 font-mono text-sm mt-1">{customer.bpCode}</p>
          </div>
        </div>
        <Link
          href={`/finance/ar/customers/${customer.id}/edit`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/25"
        >
          <Edit2 className="w-4 h-4" />
          Edit Customer
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center"
                style={{ boxShadow: '0 8px 25px rgba(34, 211, 238, 0.3)' }}
              >
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{customer.customerName}</h2>
                <p className="text-cyan-400 font-mono mt-1">{customer.bpCode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  Region
                </label>
                <p className="text-white font-medium">{customer.region || '-'}</p>
              </div>
              <div>
                <label className="text-white/50 text-sm mb-1 block">Department</label>
                <p className="text-white font-medium">{customer.department || '-'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-white/50 text-sm mb-1 block">Person In Charge</label>
                <p className="text-white font-medium">{customer.personInCharge || '-'}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <Phone className="w-4 h-4" />
                  Contact Number
                </label>
                <p className="text-white font-medium">{customer.contactNo || '-'}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-white font-medium">{customer.emailId || '-'}</p>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          {customer.invoices && customer.invoices.length > 0 && (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Recent Invoices
              </h3>
              <div className="space-y-3">
                {customer.invoices.slice(0, 5).map((invoice: any) => (
                  <Link
                    key={invoice.id}
                    href={`/finance/ar/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all"
                  >
                    <div>
                      <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-white/40 text-sm">{formatARDate(invoice.invoiceDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatARCurrency(invoice.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        invoice.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                        invoice.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
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
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Risk & Credit
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-sm mb-2 block">Risk Classification</label>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getRiskBadgeColor(customer.riskClass)}`}>
                  {customer.riskClass === 'CRITICAL' && <AlertTriangle className="w-4 h-4" />}
                  {customer.riskClass}
                </span>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 text-white/50 text-sm mb-2">
                  <CreditCard className="w-4 h-4" />
                  Credit Limit
                </label>
                <p className="text-2xl font-bold text-white">
                  {customer.creditLimit ? formatARCurrency(customer.creditLimit) : <span className="text-white/30">Not Set</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Total Invoices</span>
                <span className="text-white font-semibold">{customer.invoices?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Created</span>
                <span className="text-white font-semibold">{formatARDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
