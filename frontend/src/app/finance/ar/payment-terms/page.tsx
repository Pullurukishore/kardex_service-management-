'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARPaymentTerm } from '@/lib/ar-api';
import { Plus, CreditCard, Check, X, Sparkles, Clock, Eye, Edit2 } from 'lucide-react';

export default function ARPaymentTermsPage() {
  const router = useRouter();
  const [terms, setTerms] = useState<ARPaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentTerms();
  }, []);

  const loadPaymentTerms = async () => {
    try {
      setLoading(true);
      const data = await arApi.getPaymentTerms();
      setTerms(data);
    } catch (error) {
      console.error('Failed to load payment terms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-amber-200 to-yellow-200 bg-clip-text text-transparent flex items-center gap-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            Payment Terms
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-amber-200/60 text-sm mt-1 font-medium">Manage payment term configurations</p>
        </div>
        <Link 
          href="/finance/ar/payment-terms/new"
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
          Add Term
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 finance-stagger-in">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 bg-white/10 rounded-xl" />
                <div className="h-6 w-16 bg-white/10 rounded-full" />
              </div>
              <div className="h-6 bg-white/10 rounded w-2/3 mb-3" />
              <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))
        ) : terms.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-amber-400/50" />
            </div>
            <p className="text-white/40 font-medium mb-2">No payment terms configured</p>
            <Link 
              href="/finance/ar/payment-terms/new"
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              Click here to add your first payment term →
            </Link>
          </div>
        ) : (
          terms.map((term, index) => (
            <div 
              key={term.id}
              onClick={() => router.push(`/finance/ar/payment-terms/${term.id}`)}
              className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-amber-500/30 transition-all duration-500 group relative overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Top gradient line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <Link
                  href={`/finance/ar/payment-terms/${term.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-white/10 hover:bg-cyan-500/20 text-white/60 hover:text-cyan-400 transition-all"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  href={`/finance/ar/payment-terms/${term.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-white/10 hover:bg-amber-500/20 text-white/60 hover:text-amber-400 transition-all"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ boxShadow: '0 8px 25px rgba(251, 191, 36, 0.3)' }}
                >
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
                  term.isActive 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}>
                  {term.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {term.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 relative z-10 group-hover:text-white transition-colors">{term.termName}</h3>
              <p className="text-amber-400 font-mono text-sm mb-4 relative z-10">{term.termCode}</p>
              
              <div className="flex items-center gap-2 text-sm relative z-10 mb-3">
                <Clock className="w-4 h-4 text-white/40" />
                <span className="text-white/50">Due Days:</span>
                <span className="text-white font-semibold">{term.dueDays}</span>
              </div>
              
              {term.description && (
                <p className="text-white/40 text-sm leading-relaxed relative z-10 pt-3 border-t border-white/5">{term.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
