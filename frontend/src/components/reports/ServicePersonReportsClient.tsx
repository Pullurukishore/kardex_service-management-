'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Ticket,
  MapPin,
  User,
  Download,
  Loader2,
  BarChart3,
  CalendarDays,
  Target,
  Award,
  FileText
} from 'lucide-react';
import { apiClient } from '@/lib/api/api-client';
import { format } from 'date-fns';

interface Flag {
  type: 'LATE' | 'AUTO_CHECKOUT' | 'ABSENT' | string;
  message: string;
  count: number;
}

interface TicketReference {
  id: string;
  title: string;
  status: string;
}

interface Activity {
  id: string;
  title: string;
  name: string;
  activityType: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string;
  location?: string;
  ticket?: TicketReference;
  ticketId?: string;
  createdAt: string;
  updatedAt: string;
}

interface DayWiseBreakdown {
  date: string;
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'CHECKED_IN' | string;
  totalHours: number;
  activityCount: number;
  checkInTime?: string;
  checkOutTime?: string;
  flags: Flag[];
  activities: Activity[];
}

interface ReportSummary {
  totalWorkingDays: number;
  totalHours: number;
  absentDays: number;
  autoCheckouts: number;
  activitiesLogged: number;
  averageHoursPerDay: number;
}

interface PersonalReportData {
  summary: ReportSummary;
  flags: Flag[];
  dayWiseBreakdown: DayWiseBreakdown[];
}

interface ReportsSummary {
  totalCheckIns: number;
  totalAbsentees: number;
  totalServicePersons: number;
  averageHoursPerDay: number;
  totalActivitiesLogged: number;
  mostActiveUser: {
    id: string;
    name: string;
    activities: number;
  } | null;
}

interface ServicePersonReportsClientProps {
  initialReportData: PersonalReportData | null;
  initialSummaryData: ReportsSummary | null;
  initialDateRange: {
    from: string;
    to: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ServicePersonReportsClient({
  initialReportData,
  initialSummaryData,
  initialDateRange
}: ServicePersonReportsClientProps) {
  const [reportData, setReportData] = useState<PersonalReportData | null>(initialReportData);
  const [summaryData, setSummaryData] = useState<ReportsSummary | null>(initialSummaryData);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const { toast } = useToast();

  // Refs to prevent duplicate API calls (React StrictMode protection)
  const hasFetchedInitialData = useRef(false);
  const isFetching = useRef(false);

  // Handle date range change
  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      setLoading(true);
      
      // Fetch data using apiClient for consistent authentication
      const [reportsResponse, summaryResponse] = await Promise.allSettled([
        apiClient.get('/service-person-reports', {
          params: { 
            fromDate: dateRange.from,
            toDate: dateRange.to,
            limit: 1 // Only get current user's data
          }
        }),
        apiClient.get('/service-person-reports/summary', {
          params: { 
            fromDate: dateRange.from,
            toDate: dateRange.to
          }
        })
      ]);

      // Process reports response
      if (reportsResponse.status === 'fulfilled') {
        const response = reportsResponse.value;
        if (response.success) {
          const reportData = response.data?.servicePersonReports?.[0];
          setReportData(reportData || null);
        } else {
          setReportData(null);
        }
      } else {
        setReportData(null);
        // Don't throw here, allow the component to render with partial data
      }

      // Process summary response
      if (summaryResponse.status === 'fulfilled') {
        const response = summaryResponse.value;
        if (response.success) {
          setSummaryData(response.data || null);
        } else {
          setSummaryData(null);
        }
      } else {
        setSummaryData(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: `Failed to load report data: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [dateRange.from, dateRange.to, toast]);

  // Fetch data when date range changes
  useEffect(() => {
    // Skip if already fetched (React Strict Mode protection)
    if (hasFetchedInitialData.current) return;
    hasFetchedInitialData.current = true;
    fetchReportData();
  }, [fetchReportData]);

  // Handle export to PDF
  const handleExport = async (format: 'pdf' | 'excel' = 'pdf') => {
    try {
      setLoading(true);
      const reportType = activeTab === 'attendance' ? 'attendance' : 'performance';

      const response = await apiClient.get('/service-person-reports/export', {
        params: {
          fromDate: dateRange.from,
          toDate: dateRange.to,
          reportType,
          format,
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `service-reports-${reportType}-${dateRange.from}-to-${dateRange.to}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Export successful',
        description: 'Your report has been exported successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchReportData();
  };

  // Safe data access with fallbacks
  const safeReportData = {
    summary: reportData?.summary || {
      totalWorkingDays: 0,
      totalHours: 0,
      absentDays: 0,
      autoCheckouts: 0,
      activitiesLogged: 0,
      averageHoursPerDay: 0
    },
    flags: Array.isArray(reportData?.flags) ? reportData.flags : [],
    dayWiseBreakdown: Array.isArray(reportData?.dayWiseBreakdown) ? reportData.dayWiseBreakdown.map(day => ({
      ...day,
      activities: Array.isArray(day.activities) ? day.activities.map(activity => ({
        ...activity,
        title: activity.title || activity.name || 'Untitled Activity',
        activityType: activity.activityType || 'GENERAL',
        duration: activity.duration || 0,
        status: activity.status || 'COMPLETED'
      })) : []
    })) : []
  };

  const safeSummaryData = summaryData || {
    totalCheckIns: 0,
    totalAbsentees: 0,
    totalServicePersons: 0,
    averageHoursPerDay: 0,
    totalActivitiesLogged: 0,
    mostActiveUser: null
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Performance Reports</h1>
            <p className="text-[#96AEC2] text-lg">Track your attendance, activities, and performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
              <span className="text-white/70">to</span>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
            </div>
            <Button onClick={handleRefresh} variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/20">
              <Download className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => handleExport('pdf')} variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/20">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#AEBFC3]/20 p-1 rounded-lg">
          <TabsTrigger value="overview" className="rounded-md">Overview</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-md">Attendance Details</TabsTrigger>
          <TabsTrigger value="activities" className="rounded-md">Activity Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 mt-8">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 border-[#96AEC2]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#546A7A]">Total Hours Worked</CardTitle>
                <Clock className="h-5 w-5 text-[#546A7A]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#546A7A]">{safeReportData.summary.totalHours.toFixed(1)}h</div>
                <p className="text-xs text-[#546A7A] mt-1">
                  Avg {safeReportData.summary.averageHoursPerDay.toFixed(1)}h per day
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/20 border-[#A2B9AF]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#4F6A64]">Working Days</CardTitle>
                <CalendarDays className="h-5 w-5 text-[#4F6A64]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#4F6A64]">{safeReportData.summary.totalWorkingDays}</div>
                <p className="text-xs text-[#4F6A64] mt-1">
                  {safeReportData.summary.absentDays} absent days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#6F8A9D]/10 to-[#6F8A9D]/20 border-[#6F8A9D]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#546A7A]">Activities Logged</CardTitle>
                <Activity className="h-5 w-5 text-[#546A7A]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#546A7A]">{safeReportData.summary.activitiesLogged}</div>
                <p className="text-xs text-[#546A7A] mt-1">
                  Across {safeReportData.summary.totalWorkingDays} working days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#EEC1BF]/10 to-[#EEC1BF]/20 border-[#CE9F6B]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#976E44]">Performance Score</CardTitle>
                <Award className="h-5 w-5 text-[#976E44]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#976E44]">
                  {safeReportData.summary.totalWorkingDays > 0 ? 
                    Math.round((safeReportData.summary.activitiesLogged / safeReportData.summary.totalWorkingDays) * 10) : 0}%
                </div>
                <p className="text-xs text-[#976E44] mt-1">
                  {safeReportData.summary.activitiesLogged > safeReportData.summary.totalWorkingDays ? 'Excellent' : 'Good'} productivity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Flags and Issues */}
          {safeReportData.flags.length > 0 && (
            <Card className="border-[#CE9F6B] bg-[#EEC1BF]/10">
              <CardHeader>
                <CardTitle className="text-[#976E44] flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Attention Required
                </CardTitle>
                <CardDescription className="text-[#976E44]">
                  Issues identified in your attendance and activity patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {safeReportData.flags.map((flag: Flag, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#CE9F6B]">
                      <div className={`p-2 rounded-full ${
                        flag.type === 'LATE' ? 'bg-[#CE9F6B]/20 text-[#976E44]' :
                        flag.type === 'AUTO_CHECKOUT' ? 'bg-[#96AEC2]/20 text-[#546A7A]' :
                        'bg-[#E17F70]/20 text-[#9E3B47]'
                      }`}>
                        {flag.type === 'LATE' ? <Clock className="h-4 w-4" /> :
                         flag.type === 'AUTO_CHECKOUT' ? <Target className="h-4 w-4" /> :
                         <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{flag.message}</div>
                        <div className="text-xs text-[#AEBFC3]0">{flag.count} occurrences</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Hours Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#546A7A]" />
                  Daily Hours Trend
                </CardTitle>
                <CardDescription>Your daily working hours over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={safeReportData.dayWiseBreakdown.map(day => ({
                    date: format(new Date(day.date), 'MMM dd'),
                    hours: day.totalHours,
                    status: day.attendanceStatus
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="hours" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#546A7A]" />
                  Activity Summary
                </CardTitle>
                <CardDescription>Your activity logging patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#6F8A9D]/10 rounded-lg">
                    <div>
                      <div className="font-semibold text-[#546A7A]">Total Activities</div>
                      <div className="text-2xl font-bold text-[#546A7A]">{safeReportData.summary.activitiesLogged}</div>
                    </div>
                    <Activity className="h-8 w-8 text-[#546A7A]" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#A2B9AF]/10 rounded-lg">
                    <div>
                      <div className="font-semibold text-[#4F6A64]">Average per Day</div>
                      <div className="text-2xl font-bold text-[#4F6A64]">
                        {safeReportData.summary.totalWorkingDays > 0 ? 
                          (safeReportData.summary.activitiesLogged / safeReportData.summary.totalWorkingDays).toFixed(1) : '0.0'}
                      </div>
                    </div>
                    <Target className="h-8 w-8 text-[#4F6A64]" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#96AEC2]/10 rounded-lg">
                    <div>
                      <div className="font-semibold text-[#546A7A]">Productivity Score</div>
                      <div className="text-2xl font-bold text-[#546A7A]">
                        {safeReportData.summary.activitiesLogged > 0 ? 'High' : 'Low'}
                      </div>
                    </div>
                    <Award className="h-8 w-8 text-[#546A7A]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#546A7A]" />
                Daily Attendance Records
              </CardTitle>
              <CardDescription>Detailed breakdown of your daily attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeReportData.dayWiseBreakdown.map((day: DayWiseBreakdown, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    day.attendanceStatus === 'ABSENT' ? 'bg-[#E17F70]/10 border-[#E17F70]' :
                    day.attendanceStatus === 'CHECKED_IN' ? 'bg-[#A2B9AF]/10 border-[#A2B9AF]' :
                    'bg-[#96AEC2]/10 border-[#96AEC2]'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold">
                          {format(new Date(day.date), 'EEEE, MMM dd, yyyy')}
                        </div>
                        <Badge variant={
                          day.attendanceStatus === 'ABSENT' ? 'destructive' :
                          day.attendanceStatus === 'CHECKED_IN' ? 'default' :
                          'secondary'
                        }>
                          {day.attendanceStatus}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {day.totalHours > 0 ? `${day.totalHours.toFixed(1)}h` : 'N/A'}
                        </div>
                        <div className="text-sm text-[#AEBFC3]0">
                          {day.activityCount} activities
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#4F6A64]" />
                          <span className="font-medium">Check-in:</span>
                          <span>{day.checkInTime ? format(new Date(day.checkInTime), 'HH:mm') : 'Not checked in'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#9E3B47]" />
                          <span className="font-medium">Check-out:</span>
                          <span>{day.checkOutTime ? format(new Date(day.checkOutTime), 'HH:mm') : 'Not checked out'}</span>
                        </div>
                      </div>
                      
                      {day.flags.length > 0 && (
                        <div className="space-y-1">
                          <div className="font-medium text-sm">Issues:</div>
                          {day.flags.map((flag: Flag, flagIndex: number) => (
                            <div key={flagIndex} className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-[#976E44]" />
                              <span className="text-sm text-[#976E44]">{flag.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#546A7A]" />
                Activity Timeline
              </CardTitle>
              <CardDescription>Chronological view of all your logged activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {safeReportData.dayWiseBreakdown
                  .filter(day => day.activities.length > 0)
                  .map((day, dayIndex) => (
                    <div key={dayIndex} className="border-l-4 border-[#6F8A9D] pl-6 pb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#6F8A9D]/20 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-[#546A7A]" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">
                            {format(new Date(day.date), 'EEEE, MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-[#AEBFC3]0">
                            {day.activities.length} activities logged
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 ml-10">
                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="bg-white border border-[#92A2A5] rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="bg-[#96AEC2]/20 p-2 rounded-full">
                                  <FileText className="h-4 w-4 text-[#546A7A]" />
                                </div>
                                <div>
                                  <div className="font-medium">{activity.title}</div>
                                  <div className="text-sm text-[#AEBFC3]0">
                                    {activity.activityType.replace('_', ' ')}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline">
                                {activity.duration ? `${activity.duration}min` : 'Ongoing'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#4F6A64]" />
                                <span>Start: {format(new Date(activity.startTime), 'HH:mm')}</span>
                              </div>
                              {activity.endTime && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-[#9E3B47]" />
                                  <span>End: {format(new Date(activity.endTime), 'HH:mm')}</span>
                                </div>
                              )}
                              {activity.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-[#546A7A]" />
                                  <span className="truncate">{activity.location}</span>
                                </div>
                              )}
                              {activity.ticket && (
                                <div className="flex items-center gap-2">
                                  <Ticket className="h-4 w-4 text-[#546A7A]" />
                                  <span className="truncate">
                                    Ticket #{activity.ticketId}: {activity.ticket.title}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                
                {safeReportData.dayWiseBreakdown.filter(day => day.activities.length > 0).length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-[#979796] mx-auto mb-4" />
                    <div className="text-lg font-medium text-[#AEBFC3]0">No activities logged</div>
                    <div className="text-sm text-[#979796]">Start logging activities to see them here</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
