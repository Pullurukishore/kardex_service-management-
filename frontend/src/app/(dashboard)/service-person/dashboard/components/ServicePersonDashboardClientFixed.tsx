'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/api-client';
import { toast } from 'sonner';
import CleanAttendanceWidget from '@/components/attendance/CleanAttendanceWidget';
import TicketStatusDialogWithLocation from '@/components/tickets/TicketStatusDialogWithLocation';
import ActivityLogger from '@/components/activity/ActivityLogger';
import ActivityStatusManager from '@/components/activity/ActivityStatusManager';
import { LocationResult } from '@/services/LocationService';

// Types
interface DashboardStats {
  activeActivities: number;
  assignedTickets: number;
  completedToday: number;
}

interface Activity {
  id: number;
  activityType: string;
  title: string;
  startTime: string;
  endTime?: string;
  location?: string;
  ticketId?: number;
  ticket?: {
    id: number;
    title: string;
    status: string;
    priority: string;
  };
}

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  customer?: {
    companyName: string;
    address?: string;
  };
  asset?: {
    serialNo: string;
    model: string;
    location?: string;
  };
  createdAt: string;
  dueDate?: string;
}

const STATUS_CONFIG = {
  'OPEN': { color: 'bg-blue-100 text-blue-800', icon: '📋' },
  'ASSIGNED': { color: 'bg-yellow-100 text-yellow-800', icon: '👤' },
  'IN_PROGRESS': { color: 'bg-orange-100 text-orange-800', icon: '🔧' },
  'ONSITE_VISIT_STARTED': { color: 'bg-purple-100 text-purple-800', icon: '🚗' },
  'ONSITE_VISIT_REACHED': { color: 'bg-indigo-100 text-indigo-800', icon: '📍' },
  'ONSITE_VISIT_IN_PROGRESS': { color: 'bg-pink-100 text-pink-800', icon: '🔨' },
  'ONSITE_VISIT_RESOLVED': { color: 'bg-teal-100 text-teal-800', icon: '✅' },
  'RESOLVED': { color: 'bg-green-100 text-green-800', icon: '✅' },
  'CLOSED': { color: 'bg-gray-100 text-gray-800', icon: '🔒' },
  'CANCELLED': { color: 'bg-red-100 text-red-800', icon: '❌' },
  'WAITING_CUSTOMER': { color: 'bg-amber-100 text-amber-800', icon: '⏳' },
};

const PRIORITY_CONFIG = {
  'CRITICAL': { color: 'bg-red-100 text-red-800', icon: '🚨' },
  'HIGH': { color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
  'MEDIUM': { color: 'bg-yellow-100 text-yellow-800', icon: '📋' },
  'LOW': { color: 'bg-green-100 text-green-800', icon: '📝' },
};

interface ServicePersonDashboardClientProps {
  initialLocation?: LocationResult | null;
  initialAttendanceData?: any;
}

export default function ServicePersonDashboardClientFixed({ initialLocation, initialAttendanceData }: ServicePersonDashboardClientProps) {
  const { user } = useAuth();
  
  // Prevent horizontal scrolling on mobile
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.maxWidth = '100vw';
    document.documentElement.style.maxWidth = '100vw';
    
    return () => {
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
      document.body.style.maxWidth = '';
      document.documentElement.style.maxWidth = '';
    };
  }, []);
  
  // Removed tab state - using unified dashboard
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    activeActivities: 0,
    assignedTickets: 0,
    completedToday: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<any>(initialAttendanceData || null);
  const [isLoading, setIsLoading] = useState(!initialAttendanceData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedRef = useRef<boolean>(Boolean(initialAttendanceData));
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showNewActivityDialog, setShowNewActivityDialog] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      // Fetch all data in parallel with individual error handling
      const [activitiesResponse, ticketsResponse, attendanceResponse] = await Promise.allSettled([
        apiClient.get('/activities?limit=50&includeStages=true&includeTicket=true'),
        apiClient.get('/tickets?filter=assigned-to-service-person&limit=50'),
        apiClient.get('/attendance/status'),
      ]);

      // Handle activities response
      let activitiesData = [];
      if (activitiesResponse.status === 'fulfilled') {
        // The response is directly the data, not wrapped in .data
        const responseData = activitiesResponse.value as any;
        if (responseData?.activities) {
          activitiesData = responseData.activities;
          } else if (Array.isArray(responseData)) {
          activitiesData = responseData;
        }
      } else {
        }
      setActivities(activitiesData);

      // Handle tickets response
      let ticketsData = [];
      if (ticketsResponse.status === 'fulfilled') {
        // Check if tickets response is also direct (not wrapped in .data)
        const ticketsResponseData = ticketsResponse.value as any;
        if (ticketsResponseData?.data) {
          ticketsData = ticketsResponseData.data;
        } else if (Array.isArray(ticketsResponseData)) {
          ticketsData = ticketsResponseData;
        }
        
        // Filter out closed tickets - only show active tickets
        ticketsData = ticketsData.filter((ticket: any) => 
          ticket.status !== 'CLOSED' && 
          ticket.status !== 'RESOLVED' && 
          ticket.status !== 'CANCELLED'
        );
      } else {
        }
      setTickets(ticketsData);
      // Debug: Check if contact data is present
      if (ticketsData.length > 0) {
        }

      // Handle attendance response
      if (attendanceResponse.status === 'fulfilled') {
        const attendanceData = attendanceResponse.value as any;
        // Force state update with new object reference to ensure React detects the change
        setAttendanceStatus((prev: any) => {
          const newData = attendanceData ? JSON.parse(JSON.stringify(attendanceData)) : null;
          // Only update if data actually changed to prevent unnecessary re-renders
          if (JSON.stringify(prev) !== JSON.stringify(newData)) {
            return newData;
          }
          return prev;
        });
      } else {
        }

      // Use the extracted data for stats computation

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      // Active activities: no endTime (including WORK_FROM_HOME)
      const activeActivities = activitiesData.filter((a: any) => !a.endTime).length;

      // Completed today: activities that ended today
      const completedToday = activitiesData.filter((a: any) => {
        if (!a.endTime) return false;
        const end = new Date(a.endTime);
        return end >= startOfToday && end <= endOfToday;
      }).length;

      const stats = {
        activeActivities,
        assignedTickets: ticketsData.length,
        completedToday,
      };

      setDashboardStats(stats);

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      if (!hasLoadedRef.current) {
        setIsLoading(false);
        hasLoadedRef.current = true;
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh for active activities (every 5 minutes)
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Log initial attendance data for debugging
  useEffect(() => {
    }, [initialAttendanceData, attendanceStatus]);

  const handleActivityChange = useCallback(async () => {
    // Add a small delay to ensure backend has processed the activity change
    setTimeout(async () => {
      try {
        await fetchDashboardData();
        } catch (error) {
        }
    }, 200); // Reduced delay for better responsiveness
  }, [fetchDashboardData]);

  const handleAttendanceChange = useCallback(async () => {
    // Refresh dashboard data instead of reloading the page
    await fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTicketStatusUpdate = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowStatusDialog(true);
  };

  const handleStatusDialogClose = () => {
    setSelectedTicket(null);
    setShowStatusDialog(false);
  };

  const handleStatusUpdate = async () => {
    // Refresh dashboard data instead of reloading the page
    await fetchDashboardData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-transparent border-t-blue-400 border-r-purple-400 mx-auto"></div>
            <div className="absolute inset-2 animate-spin rounded-full h-20 w-20 border-4 border-transparent border-b-blue-300 border-l-purple-300 animate-reverse"></div>
            <div className="absolute inset-4 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-200 border-r-purple-200"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl">⚡</div>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Loading Dashboard</h2>
            <p className="text-blue-200 animate-pulse">Preparing your premium workspace...</p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-safe overflow-x-hidden w-full max-w-full relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
      
      {/* Mobile-First Header with Premium Glassmorphism */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-3 py-4 sm:px-6 sm:py-8 shadow-2xl pt-safe sticky top-0 z-50 w-full box-border backdrop-blur-lg">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto w-full relative">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full"></div>
                <h1 className="text-xl sm:text-3xl font-black truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                  Service Dashboard
                </h1>
              </div>
              <p className="text-blue-100 text-sm sm:text-base font-medium truncate">
                👋 Welcome back, <span className="font-bold text-white">{user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Service Person'}</span>!
              </p>
              {/* Premium Attendance Status Badge */}
              {attendanceStatus && (
                <div className="mt-2.5 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  {(() => {
                    return attendanceStatus.isCheckedIn ? (
                      <>
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse flex-shrink-0 shadow-lg shadow-green-400/50"></div>
                        <span className="text-xs sm:text-sm text-white font-semibold truncate">
                          🟢 Checked In • {attendanceStatus.attendance?.checkInAt ? 
                            new Date(attendanceStatus.attendance.checkInAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }) : 'Active'
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-200 font-medium truncate">⚪ Not Checked In</span>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="text-left sm:text-right flex-shrink-0 min-w-0">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm sm:text-base text-white font-bold whitespace-nowrap">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-blue-200 font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                </div>
              </div>
              {/* Premium Location Badge */}
              {attendanceStatus?.attendance && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/20 max-w-[180px] sm:max-w-xs" 
                     title={attendanceStatus.isCheckedIn 
                       ? (attendanceStatus.attendance.checkInAddress || 'Location not available')
                       : (attendanceStatus.attendance.checkOutAddress || attendanceStatus.attendance.checkInAddress || 'Location not available')}>
                  <span className="text-base flex-shrink-0">📍</span>
                  <p className="text-xs text-white font-medium truncate">
                    {attendanceStatus.isCheckedIn 
                      ? (attendanceStatus.attendance.checkInAddress || 'Location not available')
                      : (attendanceStatus.attendance.checkOutAddress || attendanceStatus.attendance.checkInAddress || 'Location not available')
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Glassmorphism Stats Cards */}
      <div className="max-w-7xl mx-auto px-3 mt-6 mb-6 sm:px-6 sm:mt-8 sm:mb-10 w-full box-border relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full box-border">
          {/* Active Activities Card */}
          <div className="group relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden touch-manipulation hover:scale-105 active:scale-95 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-white/30 shadow-lg">
                <div className="text-3xl sm:text-4xl">🔄</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white/90 mb-1 uppercase tracking-wide">Active Activities</p>
                <p className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{dashboardStats.activeActivities}</p>
                <p className="text-xs text-white/70 mt-1 font-medium">In Progress</p>
              </div>
            </div>
          </div>
          
          {/* Assigned Tickets Card */}
          <div className="group relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden touch-manipulation hover:scale-105 active:scale-95 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-white/30 shadow-lg">
                <div className="text-3xl sm:text-4xl">🎫</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white/90 mb-1 uppercase tracking-wide">Assigned Tickets</p>
                <p className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{dashboardStats.assignedTickets}</p>
                <p className="text-xs text-white/70 mt-1 font-medium">Pending Work</p>
              </div>
            </div>
          </div>
          
          {/* Completed Today Card */}
          <div className="group relative bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden touch-manipulation hover:scale-105 active:scale-95 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-white/30 shadow-lg">
                <div className="text-3xl sm:text-4xl">✅</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white/90 mb-1 uppercase tracking-wide">Completed Today</p>
                <p className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{dashboardStats.completedToday}</p>
                <p className="text-xs text-white/70 mt-1 font-medium">Tasks Done</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Main Content */}
      <div className="max-w-7xl mx-auto px-3 pb-8 sm:px-6 sm:pb-16 w-full box-border relative z-10">
        {/* Unified Dashboard */}
        <div className="space-y-5 sm:space-y-8 w-full box-border">
          {/* Premium Attendance Widget */}
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden hover:shadow-3xl transition-all duration-300" data-section="attendance">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <CleanAttendanceWidget 
                onStatusChange={handleAttendanceChange}
                initialData={attendanceStatus}
              />
            </div>
          </div>

          {/* Premium Activity Status Manager */}
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border-l-4 border-l-blue-500" data-section="activities">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-4 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                  <div className="text-2xl sm:text-3xl">🔄</div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-gray-900 bg-clip-text">Active Activities</h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Manage your ongoing tasks</p>
                </div>
              </div>
              <ActivityStatusManager 
                activities={activities.filter(a => !a.endTime)}
                onActivityChange={handleActivityChange}
              />
            </div>
          </div>

          {/* Premium Create New Activity */}
          <div className="group relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl shadow-2xl border-2 border-green-200/50 overflow-hidden" data-section="new-activity">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-4 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-teal-600 p-3 rounded-xl shadow-lg">
                  <div className="text-2xl sm:text-3xl">➕</div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-gray-900">Create New Activity</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Start tracking a new task</p>
                </div>
              </div>
              <ActivityLogger 
                activities={activities}
                onActivityChange={handleActivityChange}
              />
            </div>
          </div>

          {/* Premium Assigned Tickets Section */}
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border-l-4 border-l-rose-500">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-4 sm:p-8">
              <div className="flex items-center justify-between mb-5 sm:mb-7">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 bg-gradient-to-br from-rose-500 to-pink-600 p-3 rounded-xl shadow-lg">
                    <div className="text-2xl sm:text-3xl">🎯</div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-gray-900">Active Tickets</h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Your assigned work orders</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-gradient-to-br from-rose-100 to-pink-100 px-4 py-2 rounded-full border-2 border-rose-200">
                  <span className="text-sm font-black text-rose-700">{tickets.length}</span>
                </div>
              </div>
              {tickets.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4 opacity-50">📋</div>
                  <p className="text-gray-600 text-base font-semibold">No tickets assigned yet</p>
                  <p className="text-gray-400 text-sm mt-2">New tickets will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="group relative bg-gradient-to-br from-white via-white to-gray-50/50 border-2 border-gray-200/50 rounded-2xl p-4 sm:p-5 hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300 transform hover:-translate-y-2 active:scale-95 overflow-hidden">
                      {/* Decorative gradient overlay */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative">
                        {/* Premium Header with ID and Priority */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-blue-500/30 flex-shrink-0">
                              #{ticket.id}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold truncate shadow-sm ${PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG]?.color || 'bg-gray-100 text-gray-800'}`}>
                              <span className="mr-1">{PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG]?.icon}</span>
                              {ticket.priority}
                            </span>
                          </div>
                          <div className="bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600 font-bold flex-shrink-0 ml-2">
                            {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>

                        {/* Premium Status Badge */}
                        <div className="mb-3">
                          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-black w-full justify-center shadow-md ${STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800'} border-2 border-opacity-50`}>
                            <span className="mr-1.5 text-base">{STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG]?.icon}</span>
                            <span className="truncate uppercase tracking-wide">{ticket.status.replace(/_/g, ' ')}</span>
                          </div>
                        </div>

                        {/* Premium Title */}
                        <h4 className="text-base font-black text-gray-900 mb-3 line-clamp-2 leading-snug min-h-[2.5rem]">
                          {ticket.title}
                        </h4>

                        {/* Premium Key Info */}
                        <div className="space-y-2 text-xs">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 space-y-2 border border-gray-200/50">
                          <div className="flex items-start gap-1">
                            <span className="text-gray-400 flex-shrink-0 mt-0.5">🏢</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-600 text-xs mb-0.5">Customer</div>
                              <div className="text-gray-800 text-xs break-words">{ticket.customer?.companyName || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <span className="text-gray-400 flex-shrink-0 mt-0.5">⚙️</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-600 text-xs mb-0.5">Asset</div>
                              <div className="text-gray-800 text-xs break-words">{ticket.asset?.model || 'N/A'}</div>
                            </div>
                          </div>
                          {ticket.asset?.serialNo && (
                            <div className="flex items-start gap-1">
                              <span className="text-gray-400 flex-shrink-0 mt-0.5">🔢</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-600 text-xs mb-0.5">Serial</div>
                                <div className="font-mono bg-white px-1.5 py-0.5 rounded text-xs border break-all">
                                  {ticket.asset.serialNo}
                                </div>
                              </div>
                            </div>
                          )}
                          {(ticket.asset?.location || ticket.customer?.address) && (
                            <div className="flex items-start gap-1">
                              <span className="text-gray-400 flex-shrink-0 mt-0.5">📍</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-600 text-xs mb-0.5">Location</div>
                                <div className="text-gray-800 text-xs leading-relaxed break-words">
                                  {ticket.asset?.location || ticket.customer?.address}
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Contact Person Details */}
                          {(() => {
                            const ticketWithContact = ticket as any;
                            const contactPerson = ticketWithContact.contact;
                            
                            // Debug: Always show this section for now to test
                            // Show placeholder if no contact data
                            if (!contactPerson) {
                              return (
                                <div className="flex items-start gap-1">
                                  <span className="text-gray-400 flex-shrink-0 mt-0.5">👤</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-600 text-xs mb-0.5">Contact Person</div>
                                    <div className="text-gray-800 text-xs break-words">
                                      <div className="font-medium text-gray-400">
                                        Contact info not available
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <div className="flex items-start gap-1">
                                <span className="text-gray-400 flex-shrink-0 mt-0.5">👤</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-600 text-xs mb-0.5">Contact Person</div>
                                  <div className="text-gray-800 text-xs break-words">
                                    <div className="font-medium">
                                      {contactPerson.name || 'N/A'}
                                    </div>
                                    {contactPerson.phone && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-gray-400">📞</span>
                                        <a 
                                          href={`tel:${contactPerson.phone}`}
                                          className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                                        >
                                          {contactPerson.phone}
                                        </a>
                                      </div>
                                    )}
                                    {contactPerson.email && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-gray-400">✉️</span>
                                        <a 
                                          href={`mailto:${contactPerson.email}`}
                                          className="text-blue-600 hover:text-blue-800 text-xs break-all"
                                        >
                                          {contactPerson.email}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Refreshing Overlay */}
      {isRefreshing && (
        <div className="fixed top-0 right-0 z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-gray-600 font-medium">Updating...</span>
          </div>
        </div>
      )}

      {/* Ticket Status Dialog */}
      <TicketStatusDialogWithLocation
        ticket={selectedTicket ? {
          id: selectedTicket.id,
          title: selectedTicket.title,
          status: selectedTicket.status,
          priority: selectedTicket.priority,
          customer: selectedTicket.customer ? {
            companyName: selectedTicket.customer.companyName
          } : undefined,
          asset: selectedTicket.asset ? {
            serialNumber: selectedTicket.asset.serialNo || 'N/A',
            model: selectedTicket.asset.model || 'N/A'
          } : undefined
        } : null}
        isOpen={showStatusDialog}
        onClose={handleStatusDialogClose}
        onStatusUpdate={handleStatusUpdate}
        accuracyThreshold={50}
      />

    </div>
  );
}
