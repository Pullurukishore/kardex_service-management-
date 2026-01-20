'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { arApi, ARPaymentTerm } from '@/lib/ar-api';
import { Plus, CreditCard, Check, X, Sparkles, Clock, Eye, Edit2, Settings } from 'lucide-react';

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
    <div className="space-y-6 relative">
      {/* Decorative Background */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-[#96AEC2]/10 to-[#6F8A9D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-tr from-[#CE9F6B]/10 to-[#96AEC2]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Premium Header - Blue Policy Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#546A7A] via-[#6F8A9D] to-[#96AEC2] p-6 shadow-xl">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-12 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute -bottom-8 right-32 w-48 h-48 border-4 border-white rounded-full" />
          <div className="absolute top-8 left-1/3 w-16 h-16 border-2 border-white rounded-full" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Payment Terms
                <span className="px-4 py-1.5 text-sm font-bold bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30">
                  {terms.length} Terms
                </span>
              </h1>
              <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Configure payment term rules and due date policies
              </p>
            </div>
          </div>
          <Link 
            href="/finance/ar/payment-terms/new"
            className="group relative flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#546A7A] font-bold hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
            <span className="relative">Add Term</span>
            <Sparkles className="w-4 h-4 text-[#6F8A9D]" />
          </Link>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-[#6F8A9D]/20 p-6 animate-pulse shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="h-14 w-14 bg-gradient-to-br from-[#6F8A9D]/20 to-[#96AEC2]/20 rounded-xl" />
                <div className="h-6 w-16 bg-[#AEBFC3]/20 rounded-full" />
              </div>
              <div className="h-6 bg-[#AEBFC3]/20 rounded w-2/3 mb-3" />
              <div className="h-4 bg-[#AEBFC3]/20 rounded w-1/3 mb-2" />
              <div className="h-4 bg-[#AEBFC3]/20 rounded w-1/2" />
            </div>
          ))
        ) : terms.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6F8A9D]/10 to-[#96AEC2]/10 flex items-center justify-center mx-auto mb-5 border-2 border-[#6F8A9D]/20">
              <CreditCard className="w-12 h-12 text-[#6F8A9D]" />
            </div>
            <p className="text-[#546A7A] font-semibold text-lg mb-2">No payment terms configured</p>
            <p className="text-[#92A2A5] text-sm mb-5">Get started by creating your first payment term</p>
            <Link 
              href="/finance/ar/payment-terms/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6F8A9D] to-[#96AEC2] text-white font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Payment Term
            </Link>
          </div>
        ) : (
          terms.map((term, index) => (
            <div 
              key={term.id}
              onClick={() => router.push(`/finance/ar/payment-terms/${term.id}`)}
              className="bg-white/90 backdrop-blur-xl rounded-2xl border-2 border-[#6F8A9D]/20 p-6 hover:border-[#6F8A9D]/40 hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6F8A9D]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#546A7A] via-[#6F8A9D] to-[#96AEC2] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <Link
                  href={`/finance/ar/payment-terms/${term.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-[#AEBFC3]/10 hover:bg-[#6F8A9D]/20 text-[#5D6E73] hover:text-[#6F8A9D] transition-all"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  href={`/finance/ar/payment-terms/${term.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-[#AEBFC3]/10 hover:bg-[#CE9F6B]/20 text-[#5D6E73] hover:text-[#CE9F6B] transition-all"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6F8A9D] to-[#96AEC2] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-[#6F8A9D]/30"
                >
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  term.isActive 
                    ? 'bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white shadow-md' 
                    : 'bg-[#AEBFC3]/15 text-[#92A2A5] border border-[#AEBFC3]/30'
                }`}>
                  {term.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {term.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-[#546A7A] mb-1 relative z-10 group-hover:text-[#6F8A9D] transition-colors">{term.termName}</h3>
              <p className="text-[#6F8A9D] font-mono text-sm mb-4 relative z-10 bg-[#6F8A9D]/10 px-2 py-0.5 rounded inline-block">{term.termCode}</p>
              
              <div className="flex items-center gap-2 text-sm relative z-10 mb-3 p-3 rounded-xl bg-gradient-to-r from-[#6F8A9D]/10 to-transparent">
                <Clock className="w-4 h-4 text-[#6F8A9D]" />
                <span className="text-[#5D6E73]">Due Days:</span>
                <span className="text-[#546A7A] font-bold text-lg">{term.dueDays}</span>
              </div>
              
              {term.description && (
                <p className="text-[#92A2A5] text-sm leading-relaxed relative z-10 pt-3 border-t border-[#AEBFC3]/20">{term.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
