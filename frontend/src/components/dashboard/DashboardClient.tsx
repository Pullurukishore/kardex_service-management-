'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Import lightweight components directly
import ExecutiveHeader from './ExecutiveHeader';
import ExecutiveSummaryCards from './ExecutiveSummaryCards';
import QuickStatsAlerts from './QuickStatsAlerts';
import LazyDashboardSection from './LazyDashboardSection';
import RecentTickets from './RecentTickets';

// Import heavy components dynamically
import {
  DynamicFieldServiceAnalytics,
  DynamicPerformanceAnalytics,
  DynamicAdvancedAnalytics,
  DynamicZonePerformanceAnalytics,
} from './DynamicDashboardComponents';

// Import types
import type { DashboardData, StatusDistribution, TrendsData } from '@/components/dashboard/types';
import api from '@/lib/api/axios';

// Client-side only components
const RefreshButton = ({ onRefresh, isRefreshing }: { onRefresh: () => void, isRefreshing: boolean }) => (
  <button
    onClick={onRefresh}
    disabled={isRefreshing}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
      isRefreshing 
        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
    }`}
  >
    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
  </button>
);

interface DashboardClientProps {
  initialDashboardData: Partial<DashboardData>;
  initialStatusDistribution: StatusDistribution;
  initialTicketTrends: TrendsData;
}

export default function DashboardClient({
  initialDashboardData,
  initialStatusDistribution,
  initialTicketTrends,
}: DashboardClientProps) {
  const [dashboardData, setDashboardData] = useState<Partial<DashboardData>>(initialDashboardData);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution>(initialStatusDistribution);
  const [ticketTrends, setTicketTrends] = useState<TrendsData>(initialTicketTrends);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const [dashboardRes, statusRes, trendsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/dashboard/status-distribution'),
        api.get('/dashboard/ticket-trends')
      ]);
      
      setDashboardData(dashboardRes.data || {});
      setStatusDistribution(statusRes.data || { distribution: [] });
      setTicketTrends(trendsRes.data || { trends: [] });
      
      return true;
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to refresh dashboard data');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial data load
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 sm:p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
          <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">Error loading dashboard</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {error}
          </p>
          <div className="mt-4 sm:mt-6">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Try again'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Executive Header - Always visible */}
        <ExecutiveHeader 
          onRefresh={handleRefresh} 
          isRefreshing={isRefreshing} 
        />

        {/* Initial loading state */}
        {isRefreshing && (
          <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
            <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full shadow-lg">
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-indigo-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Updating data...</span>
            </div>
          </div>
        )}

        {/* Executive Summary Cards - Critical above-the-fold content */}
        <ExecutiveSummaryCards 
          dashboardData={dashboardData} 
        />

        {/* Lazy-loaded analytics components with intersection observer */}
        <LazyDashboardSection className="mb-6 sm:mb-8">
          <DynamicFieldServiceAnalytics 
            dashboardData={dashboardData} 
          />
        </LazyDashboardSection>

        <LazyDashboardSection className="mb-6 sm:mb-8">
          <DynamicPerformanceAnalytics 
            dashboardData={dashboardData} 
          />
        </LazyDashboardSection>

        <LazyDashboardSection className="mb-6 sm:mb-8">
          <DynamicAdvancedAnalytics 
            dashboardData={dashboardData}
            statusDistribution={statusDistribution}
            ticketTrends={ticketTrends}
            loading={isRefreshing}
          />
        </LazyDashboardSection>

        <LazyDashboardSection className="mb-6 sm:mb-8">
          <RecentTickets 
            dashboardData={dashboardData} 
            loading={isRefreshing}
          />
        </LazyDashboardSection>

        <LazyDashboardSection className="mb-6 sm:mb-8">
          <DynamicZonePerformanceAnalytics 
            dashboardData={dashboardData} 
            onRefresh={handleRefresh} 
            isRefreshing={isRefreshing} 
          />
        </LazyDashboardSection>
      </div>
    </div>
  );
}
