'use client'

import { Suspense } from 'react'
import ForecastDashboard from '@/components/forecast/ForecastDashboard'
import { BarChart3 } from 'lucide-react'

// Loading skeleton for the dashboard
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-[#96AEC2]/10 to-[#A2B9AF]/10 dark:from-[#5D6E73] dark:via-slate-900 dark:to-[#5D6E73] animate-pulse">
      <div className="max-w-[1900px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header skeleton */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-[#5D6E73] p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <BarChart3 className="h-7 w-7 text-white/50" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-white/10 rounded-lg" />
              <div className="h-4 w-48 bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2 p-1.5 bg-white/80 dark:bg-[#546A7A]/80 rounded-2xl shadow-lg">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 w-32 bg-[#92A2A5]/30 dark:bg-[#5D6E73] rounded-xl" />
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white dark:bg-[#546A7A] rounded-2xl shadow-lg border border-[#92A2A5]/60" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white dark:bg-[#546A7A] rounded-2xl shadow-xl border border-[#92A2A5]/60 p-6">
          <div className="h-6 w-48 bg-[#92A2A5]/30 dark:bg-[#5D6E73] rounded-lg mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-[#AEBFC3]/20 dark:bg-[#546A7A] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ForecastPage() {
  return (
    <>
      {/* Page Title - for browser tab */}
      <title>Forecast Dashboard | KardexCare</title>
      <meta name="description" content="Offer funnel forecast analytics and performance tracking" />
      
      <Suspense fallback={<DashboardSkeleton />}>
        <ForecastDashboard />
      </Suspense>
    </>
  )
}
