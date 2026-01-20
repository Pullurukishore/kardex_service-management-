'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
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
  UserCheck,
  UserX,
  Zap,
  Radio,
  Building,
  LogIn,
  LogOut
} from 'lucide-react';
import { apiClient } from '@/lib/api/api-client';
import { format, parseISO, startOfDay, endOfDay, isToday } from 'date-fns';
import Link from 'next/link';

// Types based on backend schema
interface AttendanceRecord {
  id: number | string;
  userId: number;
  checkInAt: string | null;
  checkOutAt?: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkInAddress?: string | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkOutAddress?: string | null;
  totalHours?: number | null;
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT' | 'LATE' | 'EARLY_CHECKOUT' | 'AUTO_CHECKED_OUT';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
    serviceZones: Array<{
      serviceZone: {
        id: number;
        name: string;
      };
    }>;
    _count?: {
      activityLogs: number;
    };
  };
  flags?: Array<{
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
  activityCount?: number;
}

interface AttendanceStats {
  totalRecords: number;
  statusBreakdown: Record<string, number>;
  averageHours: number;
  period: string;
}

interface ServicePerson {
  id: number;
  name: string | null;
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; dotColor: string }> = {
  CHECKED_IN: { label: 'Checked In', color: 'text-[#4F6A64]', bgColor: 'bg-[#A2B9AF]/10 border-[#A2B9AF]', dotColor: 'bg-[#A2B9AF]/100' },
  CHECKED_OUT: { label: 'Checked Out', color: 'text-[#546A7A]', bgColor: 'bg-[#96AEC2]/10 border-[#96AEC2]', dotColor: 'bg-[#96AEC2]/100' },
  AUTO_CHECKED_OUT: { label: 'Auto Checkout', color: 'text-[#546A7A]', bgColor: 'bg-[#6F8A9D]/10 border-[#6F8A9D]', dotColor: 'bg-[#6F8A9D]/100' },
  ABSENT: { label: 'Absent', color: 'text-[#75242D]', bgColor: 'bg-[#E17F70]/10 border-[#E17F70]', dotColor: 'bg-[#E17F70]/100' },
  LATE: { label: 'Late', color: 'text-[#976E44]', bgColor: 'bg-[#EEC1BF]/10 border-[#CE9F6B]', dotColor: 'bg-[#EEC1BF]/100' },
  EARLY_CHECKOUT: { label: 'Early Checkout', color: 'text-[#976E44]', bgColor: 'bg-[#CE9F6B]/10 border-[#CE9F6B]', dotColor: 'bg-[#CE9F6B]/100' },
};

const ZONE_COLORS: Record<string, string> = {
  'South': 'bg-[#E17F70]/100',
  'North': 'bg-[#96AEC2]/100',
  'East': 'bg-[#A2B9AF]/100',
  'West': 'bg-[#6F8A9D]/100',
  'Central': 'bg-[#CE9F6B]/100',
};

const ACTIVITY_TYPES: Record<string, string> = {
  TICKET_WORK: '🎫 Ticket Work',
  BD_VISIT: '🏢 BD Visit',
  PO_DISCUSSION: '📋 PO Discussion',
  SPARE_REPLACEMENT: '🔧 Spare Replacement',
  TRAVEL: '🚗 Travel',
  TRAINING: '📚 Training',
  MEETING: '👥 Meeting',
  MAINTENANCE: '🛠️ Maintenance',
  DOCUMENTATION: '📝 Documentation',
  OTHER: '📌 Other',
  WORK_FROM_HOME: '🏠 Work From Home',
  INSTALLATION: '⚙️ Installation',
  MAINTENANCE_PLANNED: '📅 Planned Maintenance',
  REVIEW_MEETING: '📊 Review Meeting',
  RELOCATION: '🚚 Relocation',
};

const ExpertAttendancePage = memo(function ExpertAttendancePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [servicePersons, setServicePersons] = useState<ServicePerson[]>([]);
  const [serviceZones, setServiceZones] = useState<ServiceZone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'specific'>('today');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get date range based on selection
  const getDateRange = useCallback(() => {
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
    if (dateRange === 'specific') {
      const d = selectedDate ? new Date(selectedDate) : now;
      return {
        startDate: startOfDay(d).toISOString(),
        endDate: endOfDay(d).toISOString(),
      };
    }
    return {
      startDate: startOfDay(now).toISOString(),
      endDate: endOfDay(now).toISOString(),
    };
  }, [dateRange, selectedDate]);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setLoading(true);

      const { startDate, endDate } = getDateRange();
      const params: Record<string, any> = {
        startDate,
        endDate,
        page: currentPage,
        limit: 20
      };

      if (selectedUser !== 'all') params.userId = selectedUser;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedZone !== 'all') params.zoneId = selectedZone;
      if (selectedActivityType !== 'all') params.activityType = selectedActivityType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [attendanceResponse, statsResponse, servicePersonsResponse, serviceZonesResponse] = await Promise.allSettled([
        apiClient.get('/admin/attendance', { params }),
        apiClient.get('/admin/attendance/stats', { params: { startDate, endDate } }),
        apiClient.get('/admin/attendance/service-persons'),
        apiClient.get('/admin/attendance/service-zones')
      ]);

      if (attendanceResponse.status === 'fulfilled') {
        const response = attendanceResponse.value as any;
        if (response.success && response.data) {
          const data = response.data;
          if (data.attendance && Array.isArray(data.attendance)) {
            setAttendanceRecords(data.attendance);
            setTotalPages(data.pagination?.totalPages || 1);
          } else {
            setAttendanceRecords([]);
          }
        } else {
          setAttendanceRecords([]);
        }
      }

      if (statsResponse.status === 'fulfilled') {
        const response = statsResponse.value as any;
        if (response.success && response.data) {
          setStats(response.data);
        }
      }

      if (servicePersonsResponse.status === 'fulfilled') {
        const response = servicePersonsResponse.value as any;
        if (response.success && response.data) {
          setServicePersons(Array.isArray(response.data) ? response.data : []);
        }
      }

      if (serviceZonesResponse.status === 'fulfilled') {
        const response = serviceZonesResponse.value as any;
        if (response.success && response.data) {
          setServiceZones(Array.isArray(response.data) ? response.data : []);
        }
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load attendance data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, getDateRange, selectedUser, selectedStatus, selectedZone, selectedActivityType, searchQuery, toast]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchAttendanceData();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery, dateRange, selectedDate, selectedUser, selectedStatus, selectedZone, selectedActivityType]);

  // Get zone color
  const getZoneColor = (zoneName: string) => {
    for (const [key, color] of Object.entries(ZONE_COLORS)) {
      if (zoneName.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return 'bg-[#AEBFC3]/100';
  };

  // Format time
  const formatTime = (dateString: string | null) => {
    if (!dateString) return null;
    return format(parseISO(dateString), 'HH:mm');
  };

  // Format date
  const formatDateDisplay = (dateString: string | null) => {
    if (!dateString) return { date: 'N/A', isToday: false };
    const date = parseISO(dateString);
    return {
      date: format(date, 'MMM dd, yyyy'),
      isToday: isToday(date)
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50 to-[#96AEC2]/20 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-[#96AEC2] bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#546A7A]">Total Records</p>
                  <p className="text-2xl font-bold text-[#546A7A]">{loading ? '...' : stats?.totalRecords || attendanceRecords.length}</p>
                </div>
                <div className="p-2.5 bg-[#96AEC2]/100 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#A2B9AF] bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/20 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#4F6A64]">Active Now</p>
                  <p className="text-2xl font-bold text-[#4F6A64]">{loading ? '...' : stats?.statusBreakdown?.CHECKED_IN || 0}</p>
                </div>
                <div className="p-2.5 bg-[#A2B9AF]/100 rounded-xl">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#6F8A9D] bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#546A7A]">Avg Hours</p>
                  <p className="text-2xl font-bold text-[#546A7A]">{loading ? '...' : stats?.averageHours ? `${stats.averageHours.toFixed(1)}h` : '0h'}</p>
                </div>
                <div className="p-2.5 bg-[#6F8A9D]/100 rounded-xl">
                  <Timer className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#CE9F6B] bg-gradient-to-br from-[#EEC1BF]/10 to-[#EEC1BF]/20 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#976E44]">Issues</p>
                  <p className="text-2xl font-bold text-[#976E44]">{loading ? '...' : (stats?.statusBreakdown?.LATE || 0) + (stats?.statusBreakdown?.ABSENT || 0)}</p>
                </div>
                <div className="p-2.5 bg-[#CE9F6B]/100 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#96AEC2]/10 rounded-lg">
                <Filter className="h-4 w-4 text-[#546A7A]" />
                <span className="text-sm font-medium text-[#546A7A]">Filters</span>
              </div>
              
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger className="w-[140px] h-9 bg-white border-[#92A2A5]">
                  <Calendar className="h-4 w-4 mr-2 text-[#979796]" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="specific">Pick Date</SelectItem>
                </SelectContent>
              </Select>

              {dateRange === 'specific' && (
                <Input
                  type="date"
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-[140px] h-9"
                />
              )}
              
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[160px] h-9 bg-white border-[#92A2A5]">
                  <User className="h-4 w-4 mr-2 text-[#979796]" />
                  <SelectValue placeholder="Person" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Persons</SelectItem>
                  {servicePersons.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {person.name || person.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px] h-9 bg-white border-[#92A2A5]">
                  <CheckCircle className="h-4 w-4 mr-2 text-[#979796]" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-[140px] h-9 bg-white border-[#92A2A5]">
                  <MapPin className="h-4 w-4 mr-2 text-[#979796]" />
                  <SelectValue placeholder="Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {serviceZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id.toString()}>{zone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                <SelectTrigger className="w-[160px] h-9 bg-white border-[#92A2A5]">
                  <Activity className="h-4 w-4 mr-2 text-[#979796]" />
                  <SelectValue placeholder="Activity" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="all">📋 All Types</SelectItem>
                  {Object.entries(ACTIVITY_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#979796]" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-white border-[#92A2A5]"
                />
              </div>
              
              <Button 
                onClick={() => fetchAttendanceData(true)} 
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="h-9"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#96AEC2]/10 border-b border-[#AEBFC3]/20 py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#96AEC2]/20 rounded-lg">
                  <Users className="h-5 w-5 text-[#546A7A]" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-[#546A7A]">Attendance Records</CardTitle>
                  <p className="text-sm text-[#757777]">Comprehensive attendance tracking with smart analytics and real-time insights</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-[#96AEC2]/100 hover:bg-[#6F8A9D] text-white px-3 py-1">
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                  {attendanceRecords.length} records
                </Badge>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#AEBFC3]/20 rounded-full">
                  <Radio className="h-3.5 w-3.5 text-[#82A094] animate-pulse" />
                  <span className="text-sm font-medium text-[#5D6E73]">Live Data</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-8 gap-4 px-6 py-3 bg-[#AEBFC3]/10 border-b border-[#AEBFC3]/20 text-sm font-medium text-[#5D6E73]">
              <div className="col-span-1 flex items-center gap-2">
                <User className="h-4 w-4 text-[#979796]" />
                User Name
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#979796]" />
                Date
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#979796]" />
                Check-In
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#979796]" />
                Check-Out
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-[#979796]" />
                Total Hours
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#979796]" />
                Status
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#979796]" />
                Activities
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#979796]" />
                Actions
              </div>
            </div>
            
            {/* Table Body */}
            {loading ? (
              <div className="p-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-[#AEBFC3]/10 rounded-lg mb-3 animate-pulse"></div>
                ))}
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-[#92A2A5] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#5D6E73]">No attendance records found</h3>
                <p className="text-[#979796] mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendanceRecords.map((record) => {
                  const statusConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.CHECKED_OUT;
                  const zoneName = record.user.serviceZones?.[0]?.serviceZone?.name || 'Unknown';
                  const zoneColor = getZoneColor(zoneName);
                  const dateInfo = formatDateDisplay(record.checkInAt || record.createdAt);
                  const checkInTime = formatTime(record.checkInAt);
                  const checkOutTime = formatTime(record.checkOutAt || null);
                  const activityCount = record.activityCount || record.user._count?.activityLogs || 0;
                  
                  return (
                    <div key={record.id} className="grid grid-cols-8 gap-4 px-6 py-4 hover:bg-[#AEBFC3]/10/50 transition-colors items-center">
                      {/* User Name */}
                      <div className="col-span-1 flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#96AEC2] to-[#6F8A9D] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {(record.user.name || record.user.email).charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 ${zoneColor} rounded text-[10px] font-medium text-white shadow-sm`}>
                            {zoneName.split(' ')[0]}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#546A7A] truncate">{record.user.name || record.user.email.split('@')[0]}</p>
                          <div className="flex items-center gap-1 text-xs text-[#979796]">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{zoneName}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Date */}
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#A2B9AF]/10 rounded">
                            <Calendar className="h-3.5 w-3.5 text-[#4F6A64]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#5D6E73]">{dateInfo.date.split(',')[0]}</p>
                            <p className="text-xs text-[#979796]">{dateInfo.date.split(',')[1] || ''}</p>
                          </div>
                        </div>
                        {dateInfo.isToday && (
                          <Badge variant="outline" className="mt-1 text-[10px] bg-[#A2B9AF]/10 text-[#4F6A64] border-[#A2B9AF]">
                            Today
                          </Badge>
                        )}
                      </div>
                      
                      {/* Check-In */}
                      <div>
                        {checkInTime ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#96AEC2]/10 rounded">
                              <LogIn className="h-3.5 w-3.5 text-[#546A7A]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#5D6E73]">{checkInTime}</p>
                              <p className="text-xs text-[#979796]">Check-in</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#E17F70]/10 rounded">
                              <XCircle className="h-3.5 w-3.5 text-[#E17F70]" />
                            </div>
                            <span className="text-sm text-[#E17F70] font-medium">No check-in</span>
                          </div>
                        )}
                        {record.checkInAddress && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-[#979796]">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{record.checkInAddress?.split(',')[0]}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Check-Out */}
                      <div>
                        {checkOutTime ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#CE9F6B]/10 rounded">
                              <LogOut className="h-3.5 w-3.5 text-[#976E44]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#5D6E73]">{checkOutTime}</p>
                              <p className="text-xs text-[#979796]">{record.notes?.includes('Auto') ? 'Auto checkout' : 'Manual checkout'}</p>
                            </div>
                          </div>
                        ) : record.status === 'CHECKED_IN' ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#A2B9AF]/10 rounded animate-pulse">
                              <Activity className="h-3.5 w-3.5 text-[#82A094]" />
                            </div>
                            <span className="text-sm text-[#4F6A64] font-medium">Still active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#AEBFC3]/10 rounded">
                              <XCircle className="h-3.5 w-3.5 text-[#979796]" />
                            </div>
                            <span className="text-sm text-[#979796]">—</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Total Hours */}
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#6F8A9D]/10 rounded">
                            <Timer className="h-3.5 w-3.5 text-[#546A7A]" />
                          </div>
                          <div>
                            {record.totalHours && record.totalHours > 0 ? (
                              <>
                                <p className="text-sm font-semibold text-[#5D6E73]">{Number(record.totalHours).toFixed(1)}h</p>
                                <p className="text-xs text-[#979796]">{record.totalHours < 4 ? 'Short day' : record.totalHours > 10 ? 'Long day' : 'Normal'}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-[#979796]">Calculating...</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.bgColor}`}>
                          <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
                          <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                        </div>
                        <p className="text-xs text-[#979796] mt-1">
                          {record.status === 'CHECKED_IN' ? '● Active now' : record.status === 'ABSENT' ? 'Inactive' : 'Inactive'}
                        </p>
                      </div>
                      
                      {/* Activities */}
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#CE9F6B]/10 rounded">
                            <Activity className="h-3.5 w-3.5 text-[#976E44]" />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${activityCount === 0 ? 'text-[#E17F70]' : activityCount < 3 ? 'text-[#976E44]' : 'text-[#4F6A64]'}`}>
                              {activityCount}
                            </p>
                            {activityCount === 0 ? (
                              <p className="text-xs text-[#E17F70] flex items-center gap-0.5">
                                <XCircle className="h-3 w-3" /> No activity
                              </p>
                            ) : activityCount < 3 ? (
                              <p className="text-xs text-[#CE9F6B] flex items-center gap-0.5">
                                <AlertTriangle className="h-3 w-3" /> Low activity
                              </p>
                            ) : (
                              <p className="text-xs text-[#82A094]">Good</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div>
                        <Link href={`/admin/attendance/${record.id}`}>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full bg-[#96AEC2]/10 hover:bg-[#96AEC2]/20">
                            <Eye className="h-4 w-4 text-[#546A7A]" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Footer */}
            {attendanceRecords.length > 0 && (
              <div className="px-6 py-4 bg-[#AEBFC3]/10 border-t border-[#AEBFC3]/20 flex items-center justify-between">
                <p className="text-sm text-[#757777]">
                  Showing {attendanceRecords.length} records
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-[#5D6E73] px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default ExpertAttendancePage;
