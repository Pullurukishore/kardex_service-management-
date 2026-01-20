import { Suspense } from 'react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary';
import DashboardErrorFallback from '@/components/dashboard/DashboardErrorFallback';
import { getAllDashboardData } from '@/lib/server/dashboard';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { 
  DashboardData,
  StatusDistribution,
  TrendsData 
} from '@/components/dashboard/types';
import DashboardClient from '@/components/dashboard/DashboardClient';

// Enhanced Loading component with premium skeleton UI
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#96AEC2]/10 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#96AEC2]/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#82A094]/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CE9F6B]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
      </div>
      
      <div className="relative z-10 w-full max-w-full">
        {/* Header skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="h-32 sm:h-40 bg-white/80 border border-[#96AEC2]/20 rounded-2xl sm:rounded-3xl animate-pulse relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#96AEC2] via-[#82A094] to-[#CE9F6B]" />
          </div>
        </div>
        
        {/* Section title skeleton */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-xl animate-pulse" />
            <div className="h-6 sm:h-8 w-40 sm:w-48 bg-[#AEBFC3]/30 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-[#82A094]/20 rounded-full animate-pulse" />
        </div>
        
        {/* Executive summary cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div 
              key={i} 
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[#96AEC2]/20 shadow-lg animate-pulse relative overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6F8A9D] to-[#82A094]" />
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-[#AEBFC3]/40 rounded w-2/3" />
                  <div className="h-8 sm:h-10 bg-[#6F8A9D]/20 rounded-lg w-1/2" />
                  <div className="h-3 bg-[#AEBFC3]/30 rounded w-4/5" />
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-xl flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Analytics section skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 shadow-lg border border-[#96AEC2]/20 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#82A094] to-[#4F6A64] rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 bg-[#AEBFC3]/40 rounded w-48" />
              <div className="h-4 bg-[#AEBFC3]/30 rounded w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 sm:h-80 bg-[#96AEC2]/10 rounded-xl border border-[#96AEC2]/20" />
            <div className="h-64 sm:h-80 bg-[#82A094]/10 rounded-xl border border-[#82A094]/20" />
          </div>
        </div>

        {/* Recent tickets skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-[#96AEC2]/20 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#CE9F6B] to-[#976E44] rounded-xl" />
              <div className="h-6 bg-[#AEBFC3]/40 rounded w-36" />
            </div>
            <div className="h-8 w-28 bg-[#AEBFC3]/30 rounded-lg" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 sm:h-24 bg-[#AEBFC3]/20 rounded-xl border border-[#AEBFC3]/20" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Server Component - runs on the server for initial data fetching
export default async function DashboardPage() {
  try {
    const cookieStore = cookies();
    const userRole = cookieStore.get('userRole')?.value;
    
    if (!userRole) {
      redirect('/auth/login');
    }

    // Fetch initial data on the server
    const { dashboardData, statusDistribution, ticketTrends } = await getAllDashboardData();

    // Create safe dashboard data with proper typing
    const safeDashboardData: DashboardData = {
      stats: {
        openTickets: { count: 0, change: 0 },
        unassignedTickets: { count: 0, critical: false },
        inProgressTickets: { count: 0, change: 0 },
        avgResponseTime: { hours: 0, minutes: 0, change: 0, isPositive: true },
        avgResolutionTime: { days: 0, hours: 0, minutes: 0, change: 0, isPositive: true },
        avgDowntime: { hours: 0, minutes: 0, change: 0, isPositive: true },
        avgTravelTime: { hours: 0, minutes: 0, change: 0, isPositive: true },
        avgOnsiteResolutionTime: { hours: 0, minutes: 0, change: 0, isPositive: true },
        monthlyTickets: { count: 0, change: 0 },
        activeMachines: { count: 0, change: 0 },
        ticketDistribution: {
          byStatus: [],
          byPriority: []
        },
        kpis: {
          totalTickets: { value: 0, change: '0%', isPositive: true },
          slaCompliance: { value: 0, change: 0, isPositive: true },
          avgResponseTime: { value: '0h 0m', unit: 'h', change: 0, isPositive: true },
          avgResolutionTime: { value: '0h 0m', unit: 'h', change: 0, isPositive: true },
          unassignedTickets: { value: 0, critical: false },
          activeCustomers: { value: 0, change: 0 },
          activeServicePersons: { value: 0, change: 0 }
        }
      },
      adminStats: {
        totalCustomers: 0,
        totalServicePersons: 0,
        totalServiceZones: 0,
        totalZoneUsers: 0,
        totalZoneManagers: 0,
        ticketStatusDistribution: {},
        ticketTrends: [],
        zoneWiseTickets: []
      },
      recentTickets: [],
      ...dashboardData
    };

    return (
      <>
        <div className="overflow-x-hidden">
          <DashboardErrorBoundary fallback={DashboardErrorFallback}>
            <Suspense fallback={<DashboardLoading />}>
              <DashboardClient 
                initialDashboardData={safeDashboardData}
                initialStatusDistribution={statusDistribution || { distribution: [] }}
                initialTicketTrends={ticketTrends || { trends: [] }}
              />
            </Suspense>
          </DashboardErrorBoundary>
        </div>
      </>
    );
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && 
        (error.message.includes('401') || error.message.includes('Unauthorized'))) {
      redirect('/auth/login');
      return null;
    }

    // Return error state with premium design
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-[#96AEC2]/10 to-[#A2B9AF]/10 p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E17F70]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#6F8A9D]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 text-center bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md mx-4 border border-white/50">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#E17F70]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-[#6F8A9D]/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E17F70] to-[#9E3B47] shadow-xl mb-6">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#546A7A] mb-3">Failed to load dashboard</h2>
            <p className="text-sm sm:text-base text-[#5D6E73] mb-6 leading-relaxed">There was an error loading the dashboard. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] hover:from-[#546A7A] hover:to-[#5D6E73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96AEC2] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
}
