'use client';

import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Clock,
  MapPin,
  User,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Map,
  Info,
  UserCheck,
  UserX,
  Zap,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  Grid3x3,
  List,
  ChevronUp,
  Download,
  Sparkles,
  Target,
  ArrowUp,
  ArrowDown,
  Briefcase,
  PhoneCall
} from 'lucide-react';
import { apiClient } from '@/lib/api/api-client';
import { format, parseISO, startOfDay, endOfDay, isToday, isYesterday } from 'date-fns';
import Link from 'next/link';

// Types based on backend schema
interface AttendanceRecord {
  id: number;
  userId: number;
  checkInAt: string;
  checkOutAt?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInAddress?: string;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutAddress?: string;
  totalHours?: number;
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT' | 'LATE' | 'EARLY_CHECKOUT' | 'AUTO_CHECKED_OUT';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    serviceZones: Array<{
      serviceZone: {
        id: number;
        name: string;
      };
    }>;
    _count: {
      activityLogs: number;
    };
  };
  flags: Array<{
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
  gaps: Array<{
    start: string;
    end: string;
    duration: number;
  }>;
  activityCount: number;
}

interface AttendanceStats {
  totalRecords: number;
  statusBreakdown: Record<string, number>;
  averageHours: number;
  period: string;
}

interface ServicePerson {
  id: number;
  name: string;
  email: string;
  serviceZones: Array<{
    serviceZone: {
      id: number;
      name: string;
    };
  }>;
}

interface ServiceZone {
  id: number;
  name: string;
  description?: string;
}

const STATUS_CONFIG = {
  CHECKED_IN: { label: 'Checked In', color: 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]', icon: UserCheck },
  CHECKED_OUT: { label: 'Checked Out', color: 'bg-[#96AEC2]/20 text-[#546A7A] border-[#96AEC2]', icon: UserX },
  AUTO_CHECKED_OUT: { label: 'Auto Checkout', color: 'bg-[#6F8A9D]/20 text-[#546A7A] border-[#6F8A9D]', icon: Zap },
  ABSENT: { label: 'Absent', color: 'bg-[#E17F70]/20 text-[#75242D] border-[#E17F70]', icon: XCircle },
  LATE: { label: 'Late', color: 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]', icon: AlertTriangle },
  EARLY_CHECKOUT: { label: 'Early Checkout', color: 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]', icon: Clock },
};

const FLAG_CONFIG = {
  LATE_CHECKIN: { label: 'Late Check-in', color: 'bg-[#CE9F6B]/20 text-[#976E44]', icon: Clock },
  EARLY_CHECKOUT: { label: 'Early Checkout', color: 'bg-[#CE9F6B]/20 text-[#976E44]', icon: Timer },
  LONG_BREAK: { label: 'Long Break', color: 'bg-[#6F8A9D]/20 text-[#546A7A]', icon: Clock },
  NO_CHECKOUT: { label: 'No Checkout', color: 'bg-[#E17F70]/20 text-[#75242D]', icon: XCircle },
  SUSPICIOUS_LOCATION: { label: 'Location Issue', color: 'bg-[#E17F70]/20 text-[#75242D]', icon: MapPin },
  LOW_ACTIVITY: { label: 'Low Activity', color: 'bg-[#AEBFC3]/20 text-[#546A7A]', icon: Activity },
};

const AdminAttendancePage = memo(function AdminAttendancePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [servicePersons, setServicePersons] = useState<ServicePerson[]>([]);
  const [serviceZones, setServiceZones] = useState<ServiceZone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'custom' | 'specific'>('today');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'hours'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showLoadMore, setShowLoadMore] = useState(false);
  const pullToRefreshRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const isInitialMount = useRef(true);
  const isFetching = useRef(false);
  const hasInitialFetchCompleted = useRef(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return dateRange !== 'today' || 
           selectedUser !== 'all' || 
           selectedStatus !== 'all' || 
           selectedActivityType !== 'all' || 
           selectedZone !== 'all' || 
           searchQuery.trim() !== '';
  }, [dateRange, selectedUser, selectedStatus, selectedActivityType, selectedZone, searchQuery]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setDateRange('today');
    setSelectedDate(new Date());
    setSelectedUser('all');
    setSelectedStatus('all');
    setSelectedActivityType('all');
    setSelectedZone('all');
    setSearchQuery('');
    setCurrentPage(1);
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    });
  }, [toast]);

  // Calculate attendance rate
  const attendanceRate = useMemo(() => {
    if (!stats || servicePersons.length === 0) return 0;
    const activeCount = (stats.statusBreakdown?.CHECKED_IN || 0) + (stats.statusBreakdown?.CHECKED_OUT || 0) + (stats.statusBreakdown?.AUTO_CHECKED_OUT || 0);
    return Math.round((activeCount / Math.max(servicePersons.length, 1)) * 100);
  }, [stats, servicePersons.length]);

  // Status breakdown for quick chips
  const statusBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    attendanceRecords.forEach(record => {
      breakdown[record.status] = (breakdown[record.status] || 0) + 1;
    });
    return breakdown;
  }, [attendanceRecords]);

  // Get date range based on selection
  const getDateRange = () => {
    const now = new Date();
    if (dateRange === 'today') {
      return {
        startDate: startOfDay(now).toISOString(),
        endDate: endOfDay(now).toISOString(),
      };
    }
    if (dateRange === 'yesterday') {
      const y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return {
        startDate: startOfDay(y).toISOString(),
        endDate: endOfDay(y).toISOString(),
      };
    }
    // specific single-day
    if (dateRange === 'specific') {
      const d = selectedDate ? new Date(selectedDate) : now;
      return {
        startDate: startOfDay(d).toISOString(),
        endDate: endOfDay(d).toISOString(),
      };
    }
    // fallback
    return {
      startDate: startOfDay(now).toISOString(),
      endDate: endOfDay(now).toISOString(),
    };
  };

  // Memoize processed and sorted records for better performance
  const processedRecords = useMemo(() => {
    const processed = attendanceRecords.map(record => ({
      ...record,
      statusConfig: STATUS_CONFIG[record.status] || STATUS_CONFIG.CHECKED_OUT,
      isAutoCheckout: record.notes?.includes('Auto-checkout'),
      formattedHours: record.totalHours ? `${Number(record.totalHours).toFixed(1)}h` : 'Calculating...'
    }));

    // Sort records based on selected criteria
    return processed.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.user.name || a.user.email).localeCompare(b.user.name || b.user.email);
          break;
        case 'date':
          comparison = new Date(a.checkInAt || a.createdAt).getTime() - new Date(b.checkInAt || b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'hours':
          comparison = (a.totalHours || 0) - (b.totalHours || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [attendanceRecords, sortBy, sortOrder]);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async (refresh = false) => {
    // Prevent concurrent fetches
    if (isFetching.current) {
      return;
    }
    
    try {
      isFetching.current = true;
      if (refresh) setIsRefreshing(true);
      else setLoading(true);

      const { startDate, endDate } = getDateRange();
      const params: any = {
        startDate,
        endDate,
        page: currentPage,
        limit: 20
      };

      if (selectedUser !== 'all') params.userId = selectedUser;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedActivityType !== 'all') params.activityType = selectedActivityType;
      if (selectedZone !== 'all') params.zoneId = selectedZone;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      // Optimized: Reduced console logging for better performance

      // Fetch attendance records, stats, service persons, and zones in parallel
      const [attendanceResponse, statsResponse, servicePersonsResponse, serviceZonesResponse] = await Promise.allSettled([
        apiClient.get('/admin/attendance', { params }),
        apiClient.get('/admin/attendance/stats', { params: { startDate, endDate } }),
        apiClient.get('/admin/attendance/service-persons'),
        apiClient.get('/admin/attendance/service-zones')
      ]);

      // API responses received

      // Process attendance records
      if (attendanceResponse.status === 'fulfilled') {
        const response = attendanceResponse.value as any;
        if (response.success && response.data) {
          const data = response.data;
          
          if (data.attendance && Array.isArray(data.attendance)) {
            setAttendanceRecords(data.attendance);
            setTotalPages(data.pagination?.totalPages || 1);
            // Attendance records set successfully
          } else {
            setAttendanceRecords([]);
          }
        } else {
          setAttendanceRecords([]);
        }
      } else {
        setAttendanceRecords([]);
      }

      // Process stats
      if (statsResponse.status === 'fulfilled') {
        const response = statsResponse.value as any;
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setStats(null);
        }
      } else {
        setStats(null);
      }

      // Process service persons
      if (servicePersonsResponse.status === 'fulfilled') {
        const response = servicePersonsResponse.value as any;
        if (response.success && response.data) {
          setServicePersons(Array.isArray(response.data) ? response.data : []);
        } else {
          setServicePersons([]);
        }
      } else {
        setServicePersons([]);
      }

      // Process service zones
      if (serviceZonesResponse.status === 'fulfilled') {
        const response = serviceZonesResponse.value as any;
        if (response.success && response.data) {
          setServiceZones(Array.isArray(response.data) ? response.data : []);
        } else {
          setServiceZones([]);
        }
      } else {
        setServiceZones([]);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load attendance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetching.current = false;
      hasInitialFetchCompleted.current = true;
      }
  }, [currentPage, dateRange, selectedDate, selectedUser, selectedStatus, selectedActivityType, selectedZone, searchQuery, toast]);

  // Format duration
  const formatDuration = useCallback((minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return `Today, ${format(date, 'HH:mm')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`;
    return format(date, 'MMM dd, HH:mm');
  }, []);

  // Pull to refresh functionality
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setIsPulling(true);
      setPullDistance(0);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPulling && window.scrollY === 0) {
      const touch = e.touches[0];
      const distance = Math.max(0, Math.min(150, touch.clientY - 50));
      setPullDistance(distance);
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(() => {
    if (isPulling && pullDistance > 80) {
      fetchAttendanceData(true);
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, pullDistance, fetchAttendanceData]);

  // Load more functionality
  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  // Single useEffect to handle all data fetching with proper debouncing
  useEffect(() => {
    // For initial mount, fetch immediately without debouncing
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchAttendanceData();
      return;
    }
    
    // Skip if initial fetch hasn't completed yet (prevents race conditions during mount)
    if (!hasInitialFetchCompleted.current) {
      return;
    }
    
    // Debounce all filter changes to prevent rapid-fire API calls
    const timeoutId = setTimeout(() => {
      // If we're already fetching, the guard will prevent duplicate calls
      if (currentPage === 1) {
        fetchAttendanceData();
      } else {
        // Reset to page 1 when filters change (will trigger another effect cycle)
        setCurrentPage(1);
      }
    }, 500);

    // Cleanup: cancel the timeout if dependencies change before timeout fires
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, dateRange, selectedDate, selectedUser, selectedStatus, selectedActivityType, selectedZone, searchQuery]);

  // Update showLoadMore based on pagination
  useEffect(() => {
    setShowLoadMore(currentPage < totalPages && attendanceRecords.length > 0);
  }, [currentPage, totalPages, attendanceRecords.length]);

  // Removed full-screen loading state to prevent CLS
  // Using skeleton loaders instead to maintain layout

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50 to-[#96AEC2]/20">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Modern Header with Gradient Background - Mobile Responsive */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6F8A9D] via-[#6F8A9D] to-[#546A7A] p-4 md:p-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">Attendance Management</h1>
                    <p className="text-[#96AEC2] text-sm md:text-lg">Monitor and manage service person attendance records</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {currentTime.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>

                  {attendanceRate > 0 && (
                    <div className="flex items-center gap-2 text-white bg-[#82A094]/100/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-semibold">{attendanceRate}% Attendance Rate</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <Button 
                  onClick={() => fetchAttendanceData(true)} 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 min-h-[44px]" 
                  size="lg"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh Data</span>
                  <span className="sm:hidden">Refresh</span>
                </Button>
              </div>

            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full"></div>
        </div>

        {/* Enhanced Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Records Card */}
          <Card className="relative overflow-hidden border border-[#96AEC2] bg-gradient-to-br from-[#96AEC2]/10 via-blue-100 to-blue-200 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#546A7A]">Total Records</p>
                  {loading || !stats ? (
                    <div className="h-8 w-16 bg-[#96AEC2]/40 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-bold text-[#546A7A]">{stats.totalRecords || attendanceRecords.length}</p>
                  )}
                  <p className="text-xs text-[#546A7A] flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {dateRange === 'today' ? 'Today' : dateRange === 'yesterday' ? 'Yesterday' : 'Selected period'}
                  </p>
                </div>
                <div className="p-3 bg-[#96AEC2]/100 rounded-full group-hover:bg-[#6F8A9D] transition-colors">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Users Card */}
          <Card className="relative overflow-hidden border border-[#A2B9AF] bg-gradient-to-br from-[#A2B9AF]/10 via-green-100 to-green-200 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#4F6A64]">Active Users</p>
                  {loading || !stats ? (
                    <div className="h-8 w-16 bg-[#82A094]/40 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-bold text-[#4F6A64]">
                      {stats?.statusBreakdown?.CHECKED_IN || 
                       attendanceRecords.filter(r => r.status === 'CHECKED_IN').length}
                    </p>
                  )}
                  <p className="text-xs text-[#4F6A64] flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Currently active
                  </p>
                </div>
                <div className="p-3 bg-[#A2B9AF]/100 rounded-full group-hover:bg-[#4F6A64] transition-colors">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Hours Card */}
          <Card className="relative overflow-hidden border border-[#6F8A9D] bg-gradient-to-br from-[#96AEC2]/10 via-purple-100 to-purple-200 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#546A7A]">Average Hours</p>
                  {loading || !stats ? (
                    <div className="h-8 w-16 bg-[#6F8A9D]/40 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-bold text-[#546A7A]">
                      {stats?.averageHours ? `${stats.averageHours.toFixed(1)}h` : 
                       attendanceRecords.length > 0 ? 
                       `${(attendanceRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0) / attendanceRecords.length).toFixed(1)}h` : 
                       '0.0h'}
                    </p>
                  )}
                  <p className="text-xs text-[#546A7A] flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    Per person {dateRange === 'today' ? 'today' : 'average'}
                  </p>
                </div>
                <div className="p-3 bg-[#6F8A9D]/100 rounded-full group-hover:bg-[#546A7A] transition-colors">
                  <Timer className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues Card */}
          <Card className="relative overflow-hidden border border-[#CE9F6B] bg-gradient-to-br from-[#EEC1BF]/10 via-orange-100 to-orange-200 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#976E44]">Issues</p>
                  {loading || !stats ? (
                    <div className="h-8 w-16 bg-[#CE9F6B]/40 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-bold text-[#976E44]">
                      {(stats?.statusBreakdown?.LATE || 0) + 
                       (stats?.statusBreakdown?.ABSENT || 0) + 
                       (stats?.statusBreakdown?.EARLY_CHECKOUT || 0) ||
                       attendanceRecords.filter(r => ['LATE', 'ABSENT', 'EARLY_CHECKOUT'].includes(r.status)).length}
                    </p>
                  )}
                  <p className="text-xs text-[#976E44] flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Require attention
                  </p>
                </div>
                <div className="p-3 bg-[#CE9F6B]/100 rounded-full group-hover:bg-[#976E44] transition-colors">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown Chips - Quick Overview */}
        {!loading && Object.keys(statusBreakdown).length > 0 && (
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#546A7A]" />
              Quick Status:
            </span>
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || { label: status, color: 'bg-[#AEBFC3]/20 text-[#546A7A]' };
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 border ${
                    selectedStatus === status 
                      ? 'ring-2 ring-offset-2 ring-[#6F8A9D] shadow-md' 
                      : 'hover:shadow-md'
                  } ${config.color}`}
                >
                  {config.label}
                  <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-xs font-bold">{count}</span>
                </button>
              );
            })}
            {hasActiveFilters && (
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
                className="ml-2 bg-[#E17F70]/10 hover:bg-[#E17F70]/20 border-[#E17F70] text-[#75242D] hover:text-[#75242D] transition-all duration-200 hover:scale-105"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Filters
              </Button>
            )}
          </div>
        )}

        {/* Mobile Filters - Same as Desktop */}

        <Card className="md:hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#96AEC2]/10 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-[#546A7A]">
              <div className="p-2 bg-[#96AEC2]/20 rounded-lg">
                <Filter className="h-5 w-5 text-[#546A7A]" />
              </div>
              <span className="text-xl font-semibold">Smart Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#6F8A9D]" />
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={(v) => setDateRange(v as 'today' | 'yesterday' | 'specific')}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#96AEC2]/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">📅 Today</SelectItem>
                    <SelectItem value="yesterday">📆 Yesterday</SelectItem>
                    <SelectItem value="specific">🗓️ Specific Date</SelectItem>
                  </SelectContent>
                </Select>
                {dateRange === 'specific' && (
                  <div className="mt-3">
                    <Input
                      type="date"
                      value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                      className="border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#96AEC2]/20 transition-all duration-200"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#82A094]" />
                  Service Person
                </label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-[#82A094] focus:ring-[#82A094]/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-auto">
                    <SelectItem value="all">👥 All Service Persons</SelectItem>
                    {servicePersons.map((person) => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        👤 {person.name || person.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#6F8A9D]" />
                  Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#6F8A9D]/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🔄 All Status</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="AUTO_CHECKED_OUT">⚡ Auto Checked Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#CE9F6B]" />
                  Activity Type
                </label>
                <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="all">📋 All Types</SelectItem>
                    <SelectItem value="TICKET_WORK">🎫 Ticket Work</SelectItem>
                    <SelectItem value="BD_VISIT">🏢 BD Visit</SelectItem>
                    <SelectItem value="PO_DISCUSSION">📋 PO Discussion</SelectItem>
                    <SelectItem value="SPARE_REPLACEMENT">🔧 Spare Replacement</SelectItem>
                    <SelectItem value="TRAVEL">🚗 Travel</SelectItem>
                    <SelectItem value="TRAINING">📚 Training</SelectItem>
                    <SelectItem value="MEETING">👥 Meeting</SelectItem>
                    <SelectItem value="MAINTENANCE">🛠️ Maintenance</SelectItem>
                    <SelectItem value="DOCUMENTATION">📝 Documentation</SelectItem>
                    <SelectItem value="OTHER">📌 Other</SelectItem>
                    <SelectItem value="WORK_FROM_HOME">🏠 Work From Home</SelectItem>
                    <SelectItem value="INSTALLATION">⚙️ Installation</SelectItem>
                    <SelectItem value="MAINTENANCE_PLANNED">📅 Planned Maint.</SelectItem>
                    <SelectItem value="REVIEW_MEETING">📊 Review Meeting</SelectItem>
                    <SelectItem value="RELOCATION">🚚 Relocation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#E17F70]" />
                  Zone / Region
                </label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-[#9E3B47] focus:ring-[#E17F70]/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌍 All Zones</SelectItem>
                    {serviceZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id.toString()}>
                        📍 {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#546A7A]" />
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#96AEC2]" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#6F8A9D]/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Filters Panel */}
        <Card className="hidden md:block border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#96AEC2]/10 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-[#546A7A]">
              <div className="p-2 bg-[#96AEC2]/20 rounded-lg">
                <Filter className="h-5 w-5 text-[#546A7A]" />
              </div>
              <span className="text-xl font-semibold">Smart Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#6F8A9D]" />
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={(v) => setDateRange(v as 'today' | 'yesterday' | 'specific')}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#96AEC2]/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">📅 Today</SelectItem>
                    <SelectItem value="yesterday">📆 Yesterday</SelectItem>
                    <SelectItem value="specific">🗓️ Specific Date</SelectItem>
                  </SelectContent>
                </Select>
                {dateRange === 'specific' && (
                  <div className="mt-3">
                    <Input
                      type="date"
                      value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                      className="border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#96AEC2]/20 transition-all duration-200"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#82A094]" />
                  Service Person
                </label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-[#82A094] focus:ring-[#82A094]/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-auto">
                    <SelectItem value="all">👥 All Service Persons</SelectItem>
                    {servicePersons.map((person) => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        👤 {person.name || person.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#6F8A9D]" />
                  Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#6F8A9D]/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🔄 All Status</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="AUTO_CHECKED_OUT">⚡ Auto Checked Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#CE9F6B]" />
                  Activity Type
                </label>
                <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="all">📋 All Types</SelectItem>
                    <SelectItem value="TICKET_WORK">🎫 Ticket Work</SelectItem>
                    <SelectItem value="BD_VISIT">🏢 BD Visit</SelectItem>
                    <SelectItem value="PO_DISCUSSION">📋 PO Discussion</SelectItem>
                    <SelectItem value="SPARE_REPLACEMENT">🔧 Spare Replacement</SelectItem>
                    <SelectItem value="TRAVEL">🚗 Travel</SelectItem>
                    <SelectItem value="TRAINING">📚 Training</SelectItem>
                    <SelectItem value="MEETING">👥 Meeting</SelectItem>
                    <SelectItem value="MAINTENANCE">🛠️ Maintenance</SelectItem>
                    <SelectItem value="DOCUMENTATION">📝 Documentation</SelectItem>
                    <SelectItem value="OTHER">📌 Other</SelectItem>
                    <SelectItem value="WORK_FROM_HOME">🏠 Work From Home</SelectItem>
                    <SelectItem value="INSTALLATION">⚙️ Installation</SelectItem>
                    <SelectItem value="MAINTENANCE_PLANNED">📅 Planned Maint.</SelectItem>
                    <SelectItem value="REVIEW_MEETING">📊 Review Meeting</SelectItem>
                    <SelectItem value="RELOCATION">🚚 Relocation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#E17F70]" />
                  Zone / Region
                </label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="border-[#92A2A5] focus:border-[#9E3B47] focus:ring-[#E17F70]/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌍 All Zones</SelectItem>
                    {serviceZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id.toString()}>
                        📍 {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#546A7A]" />
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#96AEC2]" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#6F8A9D]/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern Main Attendance Table - Mobile Responsive */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#96AEC2]/10 rounded-t-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-3 text-[#546A7A]">
                  <div className="p-2 bg-[#546A7A]/20 rounded-lg">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-[#546A7A]" />
                  </div>
                  <span className="text-xl md:text-2xl font-bold">Attendance Records</span>
                </CardTitle>
                <CardDescription className="text-[#5D6E73] text-sm md:text-base ml-0 md:ml-11">
                  Comprehensive attendance tracking with smart analytics and real-time insights
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <Badge className="bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] text-white px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-semibold shadow-lg">
                  📊 {attendanceRecords.length} records
                </Badge>
                <div className="hidden sm:flex items-center gap-2 text-sm text-[#5D6E73] bg-white/60 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4" />
                  Live Data
                </div>
              </div>
            </div>
          </CardHeader>
          
          {/* Mobile View Controls - Sort and View Mode Toggle */}
          <div className="md:hidden flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#AEBFC3]/10 to-[#96AEC2]/10 border-b border-[#92A2A5]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextSort = sortBy === 'date' ? 'name' : sortBy === 'name' ? 'status' : sortBy === 'status' ? 'hours' : 'date';
                setSortBy(nextSort);
              }}
              className="flex items-center gap-2 bg-white hover:bg-[#96AEC2]/10 border-[#92A2A5] text-[#5D6E73] font-medium transition-all duration-200 flex-1"
            >
              <ArrowUpDown className="h-4 w-4 text-[#546A7A]" />
              <span className="text-sm">
                {sortBy === 'date' ? 'Date' : sortBy === 'name' ? 'Name' : sortBy === 'status' ? 'Status' : 'Hours'}
              </span>
              {sortOrder === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="bg-white hover:bg-[#96AEC2]/10 border-[#92A2A5] text-[#5D6E73] font-medium transition-all duration-200 px-3"
              title="Toggle sort order"
            >
              <RotateCcw className="h-4 w-4 text-[#546A7A]" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'cards' ? 'compact' : 'cards')}
              className="flex items-center gap-2 bg-white hover:bg-[#96AEC2]/10 border-[#92A2A5] text-[#5D6E73] font-medium transition-all duration-200 flex-1"
            >
              {viewMode === 'cards' ? <List className="h-4 w-4 text-[#546A7A]" /> : <Grid3x3 className="h-4 w-4 text-[#546A7A]" />}
              <span className="text-sm">{viewMode === 'cards' ? 'Compact' : 'Cards'}</span>
            </Button>
          </div>
          
          <CardContent className="p-0">
            <div className="overflow-x-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-200 border-b-2 border-[#92A2A5]">
                      <th 
                        className="text-left p-4 font-semibold text-[#546A7A] bg-gradient-to-r from-[#96AEC2]/10 to-[#96AEC2]/20 cursor-pointer hover:bg-[#96AEC2]/30 transition-colors group"
                        onClick={() => {
                          if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          else { setSortBy('name'); setSortOrder('asc'); }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#546A7A]" />
                          User Name
                          {sortBy === 'name' ? (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-[#546A7A]" /> : <ArrowDown className="h-3 w-3 text-[#546A7A]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-[#979796] opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 font-semibold text-[#546A7A] cursor-pointer hover:bg-[#92A2A5] transition-colors group"
                        onClick={() => {
                          if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          else { setSortBy('date'); setSortOrder('desc'); }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#4F6A64]" />
                          Date
                          {sortBy === 'date' ? (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-[#4F6A64]" /> : <ArrowDown className="h-3 w-3 text-[#4F6A64]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-[#979796] opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>
                      <th className="text-left p-4 font-semibold text-[#546A7A]">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#546A7A]" />
                          Check-In
                        </div>
                      </th>
                      <th className="text-left p-4 font-semibold text-[#546A7A]">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#976E44]" />
                          Check-Out
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 font-semibold text-[#546A7A] cursor-pointer hover:bg-[#92A2A5] transition-colors group"
                        onClick={() => {
                          if (sortBy === 'hours') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          else { setSortBy('hours'); setSortOrder('desc'); }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-[#546A7A]" />
                          Total Hours
                          {sortBy === 'hours' ? (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-[#546A7A]" /> : <ArrowDown className="h-3 w-3 text-[#546A7A]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-[#979796] opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 font-semibold text-[#546A7A] cursor-pointer hover:bg-[#92A2A5] transition-colors group"
                        onClick={() => {
                          if (sortBy === 'status') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          else { setSortBy('status'); setSortOrder('asc'); }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-[#4F6A64]" />
                          Status
                          {sortBy === 'status' ? (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-[#4F6A64]" /> : <ArrowDown className="h-3 w-3 text-[#4F6A64]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-[#979796] opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>
                      <th className="text-left p-4 font-semibold text-[#546A7A]">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-[#9E3B47]" />
                          Activities
                        </div>
                      </th>
                      <th className="text-left p-4 font-semibold text-[#546A7A]">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-[#5D6E73]" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      // Enhanced skeleton rows with fixed heights to prevent CLS
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={`skeleton-${index}`} className={`h-24 ${index % 2 === 0 ? 'bg-white' : 'bg-[#AEBFC3]/10/50'}`}>
                          {Array.from({ length: 8 }).map((_, cellIndex) => (
                            <td key={cellIndex} className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#92A2A5]/30 rounded-full animate-pulse"></div>
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-[#92A2A5]/30 rounded animate-pulse w-24"></div>
                                  <div className="h-5 bg-[#AEBFC3]/20 rounded animate-pulse w-16"></div>
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-16">
                          <div className="bg-gradient-to-br from-[#AEBFC3]/10 to-[#96AEC2]/10 p-8 rounded-xl mx-6">
                            <div className="p-4 bg-white/60 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                              <Users className="h-12 w-12 text-[#979796]" />
                            </div>
                            <h3 className="text-xl font-semibold text-[#5D6E73] mb-2">No Records Found</h3>
                            <p className="text-[#757777] max-w-md mx-auto">No attendance records match your current filters. Try adjusting your search criteria or date range.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      processedRecords.map((record, index) => {
                        const StatusIcon = record.statusConfig.icon;
                        
                        return (
                          <tr 
                            key={record.id} 
                            className={`
                              transition-all duration-300 ease-in-out
                              hover:bg-gradient-to-r hover:from-[#96AEC2]/10/80 hover:via-indigo-50/60 hover:to-[#96AEC2]/10/40 
                              hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-0.5
                              ${index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-r from-[#AEBFC3]/10/80 to-gray-50/50'}
                              border-b border-[#AEBFC3]/20 last:border-b-0
                              group/row
                            `}
                          >
                            {/* User Name */}
                            <td className="p-4 py-5">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-11 h-11 bg-gradient-to-br from-[#6F8A9D] via-[#6F8A9D] to-[#6F8A9D] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200/50 group-hover/row:shadow-lg group-hover/row:shadow-blue-300/50 transition-all duration-300">
                                    {(record.user.name || record.user.email).charAt(0).toUpperCase()}
                                  </div>
                                  {record.status === 'CHECKED_IN' && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#82A094]/100 rounded-full border-2 border-white animate-pulse"></div>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="font-semibold text-[#546A7A] text-sm group-hover/row:text-[#546A7A] transition-colors duration-200">
                                    {record.user.name || record.user.email}
                                  </div>
                                  <div className="text-xs text-[#757777] truncate max-w-[150px]">
                                    {record.user.email}
                                  </div>
                                  {/* Zones */}
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {record.user.serviceZones.length > 0 ? (
                                      <>
                                        {record.user.serviceZones.slice(0, 1).map((sz: any, idx: number) => (
                                          <span key={idx} className="inline-flex items-center gap-1 text-xs text-[#546A7A] bg-[#96AEC2]/10 px-2 py-0.5 rounded-md font-medium border border-[#96AEC2]/30">
                                            <MapPin className="h-3 w-3" />
                                            {sz.serviceZone.name}
                                          </span>
                                        ))}
                                        {record.user.serviceZones.length > 1 && (
                                          <span className="text-xs text-[#757777] bg-[#AEBFC3]/20 px-1.5 py-0.5 rounded-md">+{record.user.serviceZones.length - 1}</span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-xs text-[#979796] italic">No zone</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            

                            {/* Date */}
                            <td className="p-4 py-5">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-[#A2B9AF]/20 to-[#A2B9AF]/20 rounded-xl shadow-sm">
                                  <Calendar className="h-4 w-4 text-[#4F6A64]" />
                                </div>
                                <div>
                                  <div className="font-semibold text-[#546A7A] text-sm">
                                    {record.checkInAt ? format(parseISO(record.checkInAt), 'MMM dd, yyyy') : format(new Date(), 'MMM dd, yyyy')}
                                  </div>
                                  <div className={`text-xs font-medium mt-0.5 ${
                                    record.checkInAt && isToday(parseISO(record.checkInAt)) 
                                      ? 'text-[#4F6A64]' 
                                      : record.checkInAt && isYesterday(parseISO(record.checkInAt))
                                        ? 'text-[#976E44]'
                                        : 'text-[#757777]'
                                  }`}>
                                    {record.checkInAt ? (
                                      isToday(parseISO(record.checkInAt)) ? 'Today' :
                                      isYesterday(parseISO(record.checkInAt)) ? 'Yesterday' : format(parseISO(record.checkInAt), 'EEEE')
                                    ) : 'Today'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Check-In Time */}
                            <td className="p-4 py-5">
                              {record.checkInAt ? (
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-gradient-to-br from-[#96AEC2]/20 to-violet-100 rounded-xl shadow-sm">
                                    <Clock className="h-4 w-4 text-[#546A7A]" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-lg text-[#546A7A] tabular-nums">
                                      {format(parseISO(record.checkInAt), 'HH:mm')}
                                    </div>
                                    {record.checkInAddress ? (
                                      <div className="text-xs text-[#757777] truncate max-w-[120px]" title={record.checkInAddress}>
                                        {record.checkInAddress}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-[#979796]">Check-in</div>
                                    )}
                                  </div>
                                  {record.checkInLatitude && record.checkInLongitude && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 bg-[#96AEC2]/10 hover:bg-[#96AEC2]/20 rounded-lg transition-all duration-200 hover:scale-110"
                                      onClick={() => window.open(`https://maps.google.com/?q=${record.checkInLatitude},${record.checkInLongitude}`, '_blank')}
                                    >
                                      <Map className="h-3.5 w-3.5 text-[#546A7A]" />
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-[#E17F70]/10 rounded-lg">
                                    <XCircle className="h-4 w-4 text-[#E17F70]" />
                                  </div>
                                  <span className="text-sm text-[#E17F70] font-medium">Not checked in</span>
                                </div>
                              )}
                            </td>
                            

                            {/* Check-Out Time */}
                            <td className="p-4 py-5">
                              {record.checkOutAt ? (
                                <div className="flex items-center gap-3">
                                  <div className={`p-2.5 rounded-xl shadow-sm ${
                                    record.isAutoCheckout 
                                      ? 'bg-gradient-to-br from-[#96AEC2]/20 to-violet-100' 
                                      : 'bg-gradient-to-br from-orange-100 to-[#EEC1BF]/20'
                                  }`}>
                                    {record.isAutoCheckout ? (
                                      <Zap className="h-4 w-4 text-[#546A7A]" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-[#976E44]" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-lg text-[#546A7A] tabular-nums">
                                      {format(parseISO(record.checkOutAt), 'HH:mm')}
                                    </div>
                                    <div className={`text-xs font-medium ${record.isAutoCheckout ? 'text-[#546A7A]' : 'text-[#976E44]'}`}>
                                      {record.isAutoCheckout ? 'Auto' : 'Manual'}
                                    </div>
                                  </div>
                                  {record.checkOutLatitude && record.checkOutLongitude && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 bg-[#96AEC2]/10 hover:bg-[#96AEC2]/20 rounded-lg transition-all duration-200 hover:scale-110"
                                      onClick={() => window.open(`https://maps.google.com/?q=${record.checkOutLatitude},${record.checkOutLongitude}`, '_blank')}
                                    >
                                      <Map className="h-3.5 w-3.5 text-[#546A7A]" />
                                    </Button>
                                  )}
                                </div>
                              ) : record.checkInAt ? (
                                // User checked in but hasn't checked out yet - they're active
                                <div className="flex items-center gap-2">
                                  <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-[#A2B9AF]/20 rounded-xl shadow-sm">
                                    <Activity className="h-4 w-4 text-[#4F6A64] animate-pulse" />
                                  </div>
                                  <div>
                                    <span className="text-sm text-[#4F6A64] font-semibold">Active</span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <div className="w-1.5 h-1.5 bg-[#82A094]/100 rounded-full animate-pulse"></div>
                                      <span className="text-xs text-[#82A094]">Working now</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // User never checked in - show N/A
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-[#AEBFC3]/20 rounded-lg">
                                    <Clock className="h-4 w-4 text-[#979796]" />
                                  </div>
                                  <span className="text-sm text-[#979796] font-medium">—</span>
                                </div>
                              )}
                            </td>
                            

                            {/* Total Hours */}
                            <td className="p-4 py-5">
                              {record.totalHours ? (
                                <div className="flex items-center gap-3">
                                  <div className={`p-2.5 rounded-xl shadow-sm ${
                                    Number(record.totalHours) > 10 ? 'bg-gradient-to-br from-[#96AEC2]/20 to-violet-100' : 
                                    Number(record.totalHours) < 4 ? 'bg-gradient-to-br from-orange-100 to-[#EEC1BF]/20' : 
                                    'bg-gradient-to-br from-[#96AEC2]/20 to-[#96AEC2]/20'
                                  }`}>
                                    <Timer className={`h-4 w-4 ${
                                      Number(record.totalHours) > 10 ? 'text-[#546A7A]' : 
                                      Number(record.totalHours) < 4 ? 'text-[#976E44]' : 'text-[#546A7A]'
                                    }`} />
                                  </div>
                                  <div>
                                    <div className={`font-bold text-lg tabular-nums ${
                                      Number(record.totalHours) > 10 ? 'text-[#546A7A]' : 
                                      Number(record.totalHours) < 4 ? 'text-[#976E44]' : 'text-[#546A7A]'
                                    }`}>
                                      {Number(record.totalHours).toFixed(1)}h
                                    </div>
                                    <div className={`text-xs font-medium ${
                                      Number(record.totalHours) > 10 ? 'text-[#6F8A9D]' : 
                                      Number(record.totalHours) < 4 ? 'text-[#CE9F6B]' : 'text-[#546A7A]'
                                    }`}>
                                      {Number(record.totalHours) > 10 ? 'Overtime' : 
                                       Number(record.totalHours) < 4 ? 'Short' : 'Standard'}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-[#AEBFC3]/20 rounded-lg animate-pulse">
                                    <Timer className="h-4 w-4 text-[#979796]" />
                                  </div>
                                  <span className="text-sm text-[#979796]">In progress</span>
                                </div>
                              )}
                            </td>
                            
                            {/* Status */}
                            <td className="p-4 py-5">
                              <div className="flex flex-col gap-1.5">
                                <Badge className={`${record.statusConfig.color} border shadow-sm font-semibold w-fit`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {record.statusConfig.label}
                                </Badge>
                                {record.status === 'CHECKED_IN' && (
                                  <div className="flex items-center gap-1 text-xs text-[#4F6A64] font-medium">
                                    <div className="w-2 h-2 bg-[#82A094]/100 rounded-full animate-pulse"></div>
                                    Online
                                  </div>
                                )}
                              </div>
                            </td>
                            

                            
                            {/* Activity Count */}
                            <td className="p-4 py-5">
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl shadow-sm ${
                                  record.activityCount === 0 ? 'bg-gradient-to-br from-red-100 to-[#EEC1BF]/20' :
                                  record.activityCount < 3 ? 'bg-gradient-to-br from-amber-100 to-yellow-100' :
                                  record.activityCount < 6 ? 'bg-gradient-to-br from-[#96AEC2]/20 to-[#96AEC2]/20' : 
                                  'bg-gradient-to-br from-[#A2B9AF]/20 to-[#A2B9AF]/20'
                                }`}>
                                  <Activity className={`h-4 w-4 ${
                                    record.activityCount === 0 ? 'text-[#9E3B47]' :
                                    record.activityCount < 3 ? 'text-[#976E44]' :
                                    record.activityCount < 6 ? 'text-[#546A7A]' : 'text-[#4F6A64]'
                                  }`} />
                                </div>
                                <div>
                                  <div className={`font-bold text-lg tabular-nums ${
                                    record.activityCount === 0 ? 'text-[#75242D]' :
                                    record.activityCount < 3 ? 'text-[#976E44]' :
                                    record.activityCount < 6 ? 'text-[#546A7A]' : 'text-[#4F6A64]'
                                  }`}>
                                    {record.activityCount}
                                  </div>
                                  <div className={`text-xs font-medium ${
                                    record.activityCount === 0 ? 'text-[#E17F70]' :
                                    record.activityCount < 3 ? 'text-[#CE9F6B]' :
                                    record.activityCount < 6 ? 'text-[#6F8A9D]' : 'text-[#82A094]'
                                  }`}>
                                    {record.activityCount === 0 ? 'None' :
                                     record.activityCount < 3 ? 'Low' :
                                     record.activityCount < 6 ? 'Good' : 'High'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Actions */}
                            <td className="p-4 py-5">
                              <Link href={`/admin/attendance/${record.id}/view`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-10 px-4 bg-gradient-to-r from-[#96AEC2]/20 to-[#96AEC2]/20 hover:from-indigo-200 hover:to-purple-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md group/btn" 
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4 text-[#546A7A] mr-2 group-hover/btn:scale-110 transition-transform" />
                                  <span className="text-[#546A7A] font-medium text-sm">View</span>
                                </Button>
                              </Link>
                            </td>
                          </tr>

                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card View with Pull-to-Refresh */}
              <div 
                className="md:hidden p-4 space-y-4"
                ref={pullToRefreshRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Pull to Refresh Indicator */}
                {isPulling && (
                  <div 
                    className="flex items-center justify-center py-4 transition-all duration-300"
                    style={{ transform: `translateY(${pullDistance}px)` }}
                  >
                    <div className="flex items-center gap-2 text-[#546A7A]">
                      <RefreshCw className={`h-5 w-5 ${pullDistance > 80 ? 'animate-spin' : ''}`} />
                      <span className="text-sm font-medium">
                        {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
                      </span>
                    </div>
                  </div>
                )}

                {loading ? (
                  // Mobile skeleton cards
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={`mobile-skeleton-${index}`} className="bg-white border border-[#92A2A5] rounded-lg p-4 shadow-sm animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#92A2A5]/30 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-[#92A2A5]/30 rounded w-28 mb-1"></div>
                          <div className="h-3 bg-[#AEBFC3]/20 rounded w-20"></div>
                        </div>
                        <div className="h-6 w-16 bg-[#92A2A5]/30 rounded"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-12 bg-[#AEBFC3]/20 rounded"></div>
                        <div className="h-12 bg-[#AEBFC3]/20 rounded"></div>
                        <div className="h-12 bg-[#AEBFC3]/20 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : attendanceRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-[#AEBFC3]/10 to-[#96AEC2]/10 p-8 rounded-xl">
                      <div className="p-4 bg-white/60 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-10 w-10 text-[#979796]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#5D6E73] mb-2">No Records Found</h3>
                      <p className="text-[#757777] text-sm">No attendance records match your current filters.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {processedRecords.map((record: any) => {
                      const StatusIcon = record.statusConfig.icon;
                      
                      return viewMode === 'compact' ? (
                        // Compact View - More records visible
                        <div key={record.id} className="bg-white border border-[#92A2A5] rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {(record.user.name || record.user.email).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-[#546A7A] text-sm truncate">
                                {record.user.name || record.user.email}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[#757777]">
                                <span>{record.checkInAt ? format(parseISO(record.checkInAt), 'HH:mm') : '--:--'}</span>
                                <span>→</span>
                                <span>{record.checkOutAt ? format(parseISO(record.checkOutAt), 'HH:mm') : 'Active'}</span>
                                <span className="font-medium text-[#546A7A]">
                                  {record.totalHours ? `${Number(record.totalHours).toFixed(1)}h` : '--'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs px-2 py-1 ${record.statusConfig.color}`}>
                                {record.status === 'CHECKED_IN' ? '🟢' : record.status === 'CHECKED_OUT' ? '🔵' : record.status === 'AUTO_CHECKED_OUT' ? '⚡' : '❌'}
                              </Badge>
                              <Link href={`/admin/attendance/${record.id}/view`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#96AEC2]/10">
                                  <Eye className="h-3 w-3 text-[#546A7A]" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Card View - Detailed information
                        <div key={record.id} className="bg-white border border-[#92A2A5] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {(record.user.name || record.user.email).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[#546A7A] text-sm truncate">
                                {record.user.name || record.user.email}
                              </div>
                              <div className="text-xs text-[#757777]">
                                {record.checkInAt ? format(parseISO(record.checkInAt), 'MMM dd, yyyy') : format(new Date(), 'MMM dd, yyyy')}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <StatusIcon className="h-4 w-4" />
                              <Badge className={`text-xs px-2 py-1 ${record.statusConfig.color}`}>
                                {record.statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {/* Check-in */}
                            <div className="bg-[#6F8A9D]/10 p-2 rounded text-center">
                              <div className="text-xs text-[#546A7A] mb-1">In</div>
                              <div className="text-sm font-semibold text-[#546A7A]">
                                {record.checkInAt ? format(parseISO(record.checkInAt), 'HH:mm') : '--:--'}
                              </div>
                            </div>
                            
                            {/* Check-out */}
                            <div className="bg-[#CE9F6B]/10 p-2 rounded text-center">
                              <div className="text-xs text-[#976E44] mb-1">Out</div>
                              <div className="text-sm font-semibold text-[#546A7A]">
                                {record.checkOutAt ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <span>{format(parseISO(record.checkOutAt), 'HH:mm')}</span>
                                    {record.isAutoCheckout && <Zap className="h-3 w-3 text-[#546A7A]" />}
                                  </div>
                                ) : (
                                  <span className="text-[#976E44]">Active</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Total Hours */}
                            <div className="bg-[#546A7A]/10 p-2 rounded text-center">
                              <div className="text-xs text-[#546A7A] mb-1">Hours</div>
                              <div className="text-sm font-semibold text-[#546A7A]">
                                {record.totalHours ? `${Number(record.totalHours).toFixed(1)}h` : '--'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#AEBFC3]/30">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs text-[#757777]">
                                <Activity className="h-3 w-3" />
                                <span>{record.activityCount} activities</span>
                              </div>
                              {record.checkInLatitude && record.checkInLongitude && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs bg-[#96AEC2]/10 hover:bg-[#96AEC2]/20 text-[#546A7A]"
                                  onClick={() => window.open(`https://maps.google.com/?q=${record.checkInLatitude},${record.checkInLongitude}`, '_blank')}
                                >
                                  <Map className="h-3 w-3 mr-1" />
                                  Map
                                </Button>
                              )}
                            </div>
                            <Link href={`/admin/attendance/${record.id}/view`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs bg-[#546A7A]/10 hover:bg-[#546A7A]/20 text-[#546A7A]"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Load More Button */}
                    {showLoadMore && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={handleLoadMore}
                          variant="outline"
                          className="w-full h-12 bg-white hover:bg-[#AEBFC3]/10 border-[#92A2A5] text-[#5D6E73] font-medium"
                          disabled={loading}
                        >
                          {loading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mr-2" />
                          )}
                          {loading ? 'Loading...' : `Load More (${totalPages - currentPage} pages left)`}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
              
              {/* Modern Pagination - Fixed height to prevent CLS - Desktop Only */}
              <div className="hidden md:block p-6">
                <div className="flex items-center justify-center space-x-4 mt-8 p-6 bg-gradient-to-r from-[#AEBFC3]/10 to-[#96AEC2]/10 rounded-b-xl min-h-[80px]">
                  {loading ? (
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-24 bg-[#92A2A5]/30 rounded animate-pulse"></div>
                      <div className="h-10 w-32 bg-[#92A2A5]/30 rounded animate-pulse"></div>
                      <div className="h-10 w-24 bg-[#92A2A5]/30 rounded animate-pulse"></div>
                    </div>
                  ) : totalPages > 1 ? (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="bg-white hover:bg-[#96AEC2]/10 border-[#92A2A5] text-[#5D6E73] font-medium px-6 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        ← Previous
                      </Button>
                      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-[#92A2A5]">
                        <span className="text-sm font-medium text-[#5D6E73]">Page</span>
                        <span className="text-lg font-bold text-[#546A7A]">{currentPage}</span>
                        <span className="text-sm text-[#979796]">of</span>
                        <span className="text-lg font-bold text-[#5D6E73]">{totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-white hover:bg-[#96AEC2]/10 border-[#92A2A5] text-[#5D6E73] font-medium px-6 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        Next →
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-[#757777] font-medium">
                      {attendanceRecords.length > 0 ? `Showing ${attendanceRecords.length} records` : 'No pagination needed'}
                    </div>
                  )}
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Modern Detail Modal */}
        <Dialog 
          open={detailModalOpen} 
          onOpenChange={(open) => {
            setDetailModalOpen(open);
            if (!open) setSelectedRecord(null);
          }}
        >
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-[#AEBFC3]/10 border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] text-white p-6 -m-6 mb-6 rounded-t-xl">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Eye className="h-6 w-6" />
                </div>
                Attendance Details
              </DialogTitle>
              <DialogDescription className="text-[#96AEC2] text-lg ml-11">
                Comprehensive breakdown for {selectedRecord?.user.name || selectedRecord?.user.email}
              </DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6 p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#546A7A]">
                        <User className="h-5 w-5" />
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] rounded-full flex items-center justify-center text-white font-bold">
                          {(selectedRecord.user.name || selectedRecord.user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#546A7A]">{selectedRecord.user.name || selectedRecord.user.email}</div>
                          <div className="text-sm text-[#5D6E73]">{selectedRecord.user.email}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#4F6A64]">
                        <Clock className="h-5 w-5" />
                        Time Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#4F6A64]">
                        {selectedRecord.totalHours ? `${Number(selectedRecord.totalHours).toFixed(1)}h` : 'Calculating...'}
                      </div>
                      <div className="text-sm text-[#4F6A64] mt-1">Total hours worked</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-[#92A2A5]">
                  <h3 className="text-lg font-semibold text-[#546A7A] mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-[#546A7A]" />
                    Detailed Information
                  </h3>
                  <div className="text-[#5D6E73]">
                    <p className="mb-4">Complete attendance analytics and detailed breakdown will be available in the next update.</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Status:</strong> {selectedRecord.status}</div>
                      <div><strong>Activities:</strong> {selectedRecord.activityCount}</div>
                      <div><strong>Flags:</strong> {selectedRecord.flags.length}</div>
                      <div><strong>Record ID:</strong> {selectedRecord.id}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
});

export default AdminAttendancePage;
