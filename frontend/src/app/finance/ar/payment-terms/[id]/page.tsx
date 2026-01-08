'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARPaymentTerm } from '@/lib/ar-api';
import { ArrowLeft, Edit2, CreditCard, Check, X, Clock, Sparkles, Calendar } from 'lucide-react';

export default function ViewPaymentTermPage() {
  const params = useParams();
  const router = useRouter();
  const [term, setTerm] = useState<ARPaymentTerm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTerm();
  }, [params.id]);

  const loadTerm = async () => {
    try {
      setLoading(true);
      const data = await arApi.getPaymentTermById(params.id as string);
      setTerm(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment term');
    } finally {
      setLoading(false);
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
                className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-white/40 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !term) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/finance/ar/payment-terms"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-amber-500/10 hover:text-white hover:border-amber-500/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Payment Term Not Found</h1>
        </div>
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error || 'The requested payment term could not be found.'}
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
            href="/finance/ar/payment-terms"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-amber-500/10 hover:text-white hover:border-amber-500/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {term.termName}
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-amber-400 font-mono text-sm mt-1">{term.termCode}</p>
          </div>
        </div>
        <Link
          href={`/finance/ar/payment-terms/${term.id}/edit`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
        >
          <Edit2 className="w-4 h-4" />
          Edit Term
        </Link>
      </div>

      {/* Details Card */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 relative overflow-hidden">
        {/* Top gradient line */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        {/* Icon and Status */}
        <div className="flex items-start justify-between mb-6">
          <div 
            className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"
            style={{ boxShadow: '0 8px 25px rgba(251, 191, 36, 0.3)' }}
          >
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border ${
            term.isActive 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
              : 'bg-white/5 text-white/40 border-white/10'
          }`}>
            {term.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {term.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white/50 text-sm mb-1">Term Code</label>
              <p className="text-white font-semibold text-lg font-mono">{term.termCode}</p>
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Term Name</label>
              <p className="text-white font-semibold text-lg">{term.termName}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <label className="block text-white/50 text-sm">Due Days</label>
                <p className="text-white font-bold text-2xl">
                  {term.dueDays}
                  <span className="text-white/40 text-sm font-normal ml-2">
                    {term.dueDays === 0 ? 'Immediate' : term.dueDays < 0 ? 'days before' : 'days after invoice'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {term.description && (
            <div className="pt-4 border-t border-white/10">
              <label className="block text-white/50 text-sm mb-2">Description</label>
              <p className="text-white/80 leading-relaxed">{term.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
