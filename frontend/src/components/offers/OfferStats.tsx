'use client'

import { Button } from '@/components/ui/button'
import { Plus, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OfferStatsProps {
  stats: {
    total: number
    won: number
    conversionRate: number
    totalValue: number
  }
}

export default function OfferStats({ stats }: OfferStatsProps) {
  const router = useRouter()
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#82A094] via-[#82A094] to-[#546A7A] rounded-2xl shadow-xl p-4 sm:p-6 text-white mb-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl ring-2 ring-white/30">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Offer Management</h1>
            <p className="text-emerald-100 text-sm sm:text-base mt-1">Track, manage, and convert offers to orders</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-2 sm:px-4 py-2 border border-white/20 text-center">
              <p className="text-emerald-100 text-[10px] sm:text-xs font-medium">Total</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-2 sm:px-4 py-2 border border-white/20 text-center">
              <p className="text-emerald-100 text-[10px] sm:text-xs font-medium">Won</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.won}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-2 sm:px-4 py-2 border border-white/20 text-center">
              <p className="text-emerald-100 text-[10px] sm:text-xs font-medium">Win Rate</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.conversionRate.toFixed(0)}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-2 sm:px-4 py-2 border border-white/20 text-center">
              <p className="text-emerald-100 text-[10px] sm:text-xs font-medium">Value</p>
              <p className="text-base sm:text-xl font-bold">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
          <Button onClick={() => router.push('/expert/offers/new')} className="bg-white text-[#4F6A64] hover:bg-white/90 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>
    </div>
  )
}
