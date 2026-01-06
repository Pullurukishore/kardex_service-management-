'use client'

import { Suspense, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { BarChart3 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Dynamically import the dashboard component with user filtering
const UserForecastDashboard = dynamic(
  () => import('../../../../components/forecast/UserForecastDashboard'),
  { 
    loading: () => <DashboardSkeleton />,
    ssr: false 
  }
)

// Loading skeleton for the dashboard
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-pulse">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header skeleton */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 shadow-2xl">
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

        {/* Cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/60" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/60 p-6">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ZoneUserForecastPage() {
  const { user } = useAuth()
  
  // Get the user's ID (ensure it's a number)
  const currentUserId = user?.id ? Number(user.id) : null
  
  // Get the user's name
  const userName = useMemo(() => {
    return user?.name || 'User'
  }, [user])
  
  // Get zone name for display
  const zoneName = useMemo(() => {
    if (!user?.serviceZones || user.serviceZones.length === 0) return 'Zone'
    const firstZone = user.serviceZones[0]
    return firstZone?.serviceZone?.name || 'Zone'
  }, [user])
  
  return (
    <>
      {/* Page Title - for browser tab */}
      <title>My Forecast | KardexCare</title>
      <meta name="description" content="Personal offer funnel forecast analytics and performance tracking" />
      
      <Suspense fallback={<DashboardSkeleton />}>
        {currentUserId ? (
          <UserForecastDashboard userId={currentUserId} userName={userName} zoneName={zoneName} />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Not Logged In</h2>
              <p className="text-slate-600 dark:text-slate-400">Please log in to view your forecast.</p>
            </div>
          </div>
        )}
      </Suspense>
    </>
  )
}
