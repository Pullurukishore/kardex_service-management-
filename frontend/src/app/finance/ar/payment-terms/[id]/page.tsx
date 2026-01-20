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

  if (error || !term) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/finance/ar/payment-terms"
            className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-[#CE9F6B]/10 hover:border-[#CE9F6B]/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#546A7A]">Payment Term Not Found</h1>
        </div>
        <div className="p-6 bg-[#E17F70]/10 border-2 border-[#E17F70]/30 rounded-xl text-[#9E3B47]">
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
            className="p-2.5 rounded-xl bg-white border-2 border-[#AEBFC3]/40 text-[#5D6E73] hover:bg-[#CE9F6B]/10 hover:border-[#CE9F6B]/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#546A7A] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] shadow-lg shadow-[#CE9F6B]/30">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              {term.termName}
              <Sparkles className="w-5 h-5 text-[#CE9F6B]" />
            </h1>
            <p className="text-[#CE9F6B] font-mono text-sm mt-1 ml-1">{term.termCode}</p>
          </div>
        </div>
        <Link
          href={`/finance/ar/payment-terms/${term.id}/edit`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#CE9F6B] to-[#976E44] text-white font-semibold hover:shadow-lg hover:shadow-[#CE9F6B]/40 hover:-translate-y-0.5 transition-all"
        >
          <Edit2 className="w-4 h-4" />
          Edit Term
        </Link>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-2xl border-2 border-[#CE9F6B]/20 p-6 relative overflow-hidden shadow-lg">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#CE9F6B] to-[#976E44] opacity-70" />
        
        {/* Icon and Status */}
        <div className="flex items-start justify-between mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center shadow-lg shadow-[#CE9F6B]/30">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border ${
            term.isActive 
              ? 'bg-[#82A094]/15 text-[#4F6A64] border-[#82A094]/30' 
              : 'bg-[#AEBFC3]/10 text-[#92A2A5] border-[#AEBFC3]/30'
          }`}>
            {term.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {term.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[#92A2A5] text-sm mb-1">Term Code</label>
              <p className="text-[#546A7A] font-semibold text-lg font-mono">{term.termCode}</p>
            </div>
            <div>
              <label className="block text-[#92A2A5] text-sm mb-1">Term Name</label>
              <p className="text-[#546A7A] font-semibold text-lg">{term.termName}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#AEBFC3]/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#CE9F6B]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#CE9F6B]" />
              </div>
              <div>
                <label className="block text-[#92A2A5] text-sm">Due Days</label>
                <p className="text-[#546A7A] font-bold text-2xl">
                  {term.dueDays}
                  <span className="text-[#92A2A5] text-sm font-normal ml-2">
                    {term.dueDays === 0 ? 'Immediate' : term.dueDays < 0 ? 'days before' : 'days after invoice'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {term.description && (
            <div className="pt-4 border-t border-[#AEBFC3]/20">
              <label className="block text-[#92A2A5] text-sm mb-2">Description</label>
              <p className="text-[#5D6E73] leading-relaxed">{term.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
