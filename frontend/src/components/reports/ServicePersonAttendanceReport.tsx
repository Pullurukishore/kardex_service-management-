import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MobileModal } from '@/components/ui/mobile-responsive';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  MapPin,
  User,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  ExternalLink,
  UserCheck,
  UserX,
  Zap,
  Clock3,
  Info,
  Eye,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  Target,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { ReportData, ServicePersonReport } from './types';
import { STATUS_COLORS } from './types';

interface ServicePersonAttendanceReportProps {
  reportData: ReportData;
}

const STATUS_CONFIG = {
  CHECKED_IN: { label: 'Checked In', color: 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]', icon: UserCheck },
  CHECKED_OUT: { label: 'Checked Out', color: 'bg-[#96AEC2]/20 text-[#546A7A] border-[#96AEC2]', icon: UserX },
  AUTO_CHECKED_OUT: { label: 'Auto Checkout', color: 'bg-[#6F8A9D]/20 text-[#546A7A] border-[#6F8A9D]', icon: Zap },
  ABSENT: { label: 'Absent', color: 'bg-[#E17F70]/20 text-[#75242D] border-[#E17F70]', icon: XCircle },
  LATE: { label: 'Late', color: 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]', icon: AlertTriangle },
  EARLY_CHECKOUT: { label: 'Early Checkout', color: 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]', icon: Clock3 },
};

const FLAG_CONFIG = {
  LATE: { color: 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]', icon: AlertTriangle, severity: 'warning' },
  EARLY_CHECKOUT: { color: 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]', icon: Clock3, severity: 'warning' },
  LONG_DAY: { color: 'bg-[#6F8A9D]/20 text-[#546A7A] border-[#6F8A9D]', icon: Timer, severity: 'warning' },
  AUTO_CHECKOUT: { color: 'bg-[#96AEC2]/20 text-[#546A7A] border-[#96AEC2]', icon: Zap, severity: 'info' },
  NO_ACTIVITY: { color: 'bg-[#E17F70]/20 text-[#75242D] border-[#E17F70]', icon: XCircle, severity: 'error' },
  MISSING_CHECKOUT: { color: 'bg-[#E17F70]/20 text-[#75242D] border-[#E17F70]', icon: AlertTriangle, severity: 'error' },
  MULTIPLE_SESSIONS: { color: 'bg-[#96AEC2]/20 text-[#546A7A] border-[#96AEC2]', icon: Info, severity: 'info' },
  ABSENT: { color: 'bg-[#E17F70]/20 text-[#75242D] border-[#E17F70]', icon: UserX, severity: 'error' },
};

export function ServicePersonAttendanceReport({ reportData }: ServicePersonAttendanceReportProps) {
  const [selectedPerson, setSelectedPerson] = useState<ServicePersonReport | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState<{[key: string]: boolean}>({});

  // Safety check - if no report data, show loading state
  if (!reportData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Service Person Attendance Report...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please wait while we load the data.</p>
        </CardContent>
      </Card>
    );
  }

  const toggleDay = (dayKey: string) => {
    setExpandedDays(prev => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const reports = Array.isArray(reportData?.reports) ? reportData.reports : [];
  
  // Additional safety check - if reports is empty, show empty state
  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Person Attendance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-[#92A2A5] mb-4" />
            <h3 className="text-lg font-medium text-[#5D6E73] mb-2">No Reports Found</h3>
            <p className="text-[#AEBFC3]0">No service person reports available for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Create safe summary object with proper type conversion
  const safeSummary = {
    totalServicePersons: Number(reportData.summary?.totalServicePersons || 0),
    totalCheckIns: Number(reportData.summary?.totalCheckIns || 0),
    averageHoursPerDay: Number(reportData.summary?.averageHoursPerDay || 0),
    totalAbsentees: Number(reportData.summary?.totalAbsentees || 0),
    totalActivitiesLogged: Number(reportData.summary?.totalActivitiesLogged || 0),
    mostActiveUser: reportData.summary?.mostActiveUser && typeof reportData.summary.mostActiveUser === 'object' ? {
      name: String(reportData.summary.mostActiveUser.name || ''),
      email: String(reportData.summary.mostActiveUser.email || ''),
      activityCount: Number(reportData.summary.mostActiveUser.activityCount || 0)
    } : null
  };
  
  const summary = safeSummary;
  const dateRange = reportData.dateRange || { from: '', to: '', totalDays: 0 };

  // Note: Only display backend-provided data. No demo/fallback data.

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    try {
      return format(parseISO(timeString), 'HH:mm');
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const openPersonDetails = (person: ServicePersonReport) => {
    setSelectedPerson(person);
    setDetailModalOpen(true);
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!selectedPerson) return;

    try {
      // Get token from multiple sources (same as ReportsClient)
      const getToken = () => {
        if (typeof window !== 'undefined') {
          const localStorageToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
          if (localStorageToken) return localStorageToken;
          
          // Check cookies as fallback
          const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
          };
          
          return getCookie('accessToken') || getCookie('token') || localStorage.getItem('cookie_accessToken');
        }
        return null;
      };

      const token = getToken();
      
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const params = new URLSearchParams({
        fromDate: dateRange.from || '',
        toDate: dateRange.to || '',
        servicePersonId: String(selectedPerson.id || ''),
        format: format
      });

      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/service-person-reports/export/detailed-person?${params}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${selectedPerson.name.replace(/\s+/g, '_')}_Attendance_${format === 'excel' ? 'Report.xlsx' : 'Report.pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Person Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Service Person Attendance Reports
              </CardTitle>
              <CardDescription>
                Detailed attendance breakdown for {dateRange.from && dateRange.to 
                  ? `${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`
                  : 'selected period'
                }
                <span className="ml-2 text-[#546A7A] font-medium">
                  (Monday - Saturday working days only)
                </span>
              </CardDescription>
            </div>
            <Badge variant="outline">
              {reports.length} persons
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-[#92A2A5] mb-4" />
              <h3 className="text-lg font-medium text-[#5D6E73] mb-2">No Reports Found</h3>
              <p className="text-[#AEBFC3]0">No service person reports available for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-[#AEBFC3]/10">
                    <th className="text-left p-3 font-medium text-[#546A7A]">Service Person</th>
                    <th className="text-left p-3 font-medium text-[#546A7A]">Present Days</th>
                    <th className="text-left p-3 font-medium text-[#546A7A]">Absent Days</th>
                    <th className="text-left p-3 font-medium text-[#546A7A]">Total Hours</th>
                    <th className="text-left p-3 font-medium text-[#546A7A]">Avg Hours/Day</th>
                    <th className="text-left p-3 font-medium text-[#546A7A]">Activities</th>
                    <th className="text-left p-3 font-medium text-[#546A7A]">Auto Checkouts</th>
                    <th className="text-left p-3 font-medium text-[#546A7A]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((person) => (
                    <tr key={person.id} className="border-b hover:bg-[#AEBFC3]/10 transition-colors">
                      {/* Service Person */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-[#546A7A]">{person.name}</div>
                            <div className="text-sm text-[#5D6E73]">{person.email}</div>
                            {person.zones && person.zones.length > 0 && (
                              <div className="text-xs text-[#AEBFC3]0 bg-[#AEBFC3]/20 px-2 py-1 rounded mt-1">
                                {person.zones.map((zone, idx) => (
                                  <span key={idx}>
                                    {zone.name}
                                    {idx < person.zones.length - 1 && ', '}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Present Days */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <CheckCircle className="h-3 w-3 text-[#4F6A64]" />
                          <span className="text-[#4F6A64]">{person.summary.presentDays || person.summary.totalWorkingDays || 0}</span>
                        </div>
                      </td>

                      {/* Absent Days */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <XCircle className={`h-3 w-3 ${
                            person.summary.absentDays > 0 ? 'text-[#9E3B47]' : 'text-[#979796]'
                          }`} />
                          <span className={person.summary.absentDays > 0 ? 'text-[#9E3B47]' : 'text-[#546A7A]'}>
                            {person.summary.absentDays || 0}
                          </span>
                        </div>
                      </td>

                      {/* Total Hours */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Clock className="h-3 w-3 text-[#546A7A]" />
                          {Number(person.summary.totalHours).toFixed(1)}h
                        </div>
                      </td>

                      {/* Average Hours/Day */}
                      <td className="p-3">
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                          person.summary.averageHoursPerDay > 8 ? 'text-[#4F6A64]' : 
                          person.summary.averageHoursPerDay < 6 ? 'text-[#976E44]' : 'text-[#546A7A]'
                        }`}>
                          <Timer className="h-3 w-3" />
                          {Number(person.summary.averageHoursPerDay).toFixed(1)}h
                        </div>
                      </td>

                      {/* Activities */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Activity className="h-3 w-3 text-[#546A7A]" />
                          {person.summary.totalActivities || person.summary.activitiesLogged || 0}
                        </div>
                      </td>

                      {/* Auto Checkouts */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Zap className={`h-3 w-3 ${
                            person.summary.autoCheckouts > 0 ? 'text-[#976E44]' : 'text-[#979796]'
                          }`} />
                          <span className={person.summary.autoCheckouts > 0 ? 'text-[#976E44]' : 'text-[#546A7A]'}>
                            {person.summary.autoCheckouts || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPersonDetails(person)}
                          className="h-8 px-3"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Person Details Modal - Desktop */}
      <div className="hidden md:block">
        {detailModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDetailModalOpen(false)}
            />
            
            {/* Modal positioned to avoid sidebar */}
            <div className="fixed top-4 bottom-4 left-[280px] right-4 flex items-center justify-center">
              <div className="relative w-full max-w-5xl max-h-full bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h2 className="text-xl font-semibold text-[#546A7A] flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {selectedPerson?.name} - Attendance Details
                    </h2>
                    <p className="text-sm text-[#5D6E73] mt-1">
                      Comprehensive attendance breakdown for {dateRange.from && dateRange.to 
                        ? `${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`
                        : 'selected period'
                      }
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-[#96AEC2]/10 border border-[#96AEC2] rounded text-xs text-[#546A7A]">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">Working Days: Monday - Saturday only</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Export to Excel */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('excel')}
                      className="text-[#4F6A64] hover:text-[#4F6A64] hover:bg-[#A2B9AF]/10 border-[#A2B9AF]"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                    
                    {/* Export to PDF */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('pdf')}
                      className="text-[#9E3B47] hover:text-[#75242D] hover:bg-[#E17F70]/10 border-[#E17F70]"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    
                    {/* Close button */}
                    <button
                      onClick={() => setDetailModalOpen(false)}
                      className="text-[#979796] hover:text-[#5D6E73] p-2 rounded-lg hover:bg-[#AEBFC3]/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            
            {selectedPerson && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Complete Overview</TabsTrigger>
                  <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
                  <TabsTrigger value="activities">Activities Log</TabsTrigger>
                </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Summary Card with Person Info */}
                <Card className="bg-gradient-to-r from-[#96AEC2]/10 to-[#6F8A9D]/10 border-[#96AEC2]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-[#546A7A]">{selectedPerson.name}</h3>
                        <p className="text-sm text-[#5D6E73] mt-1">{selectedPerson.email}</p>
                        {selectedPerson.zones && selectedPerson.zones.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {selectedPerson.zones.map((zone, idx) => (
                              <Badge key={idx} variant="outline" className="bg-white">
                                {zone.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#546A7A]">
                          {selectedPerson.summary.performanceScore || 0}%
                        </div>
                        <div className="text-sm text-[#5D6E73]">Performance Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attendance Metrics */}
                <div>
                  <h4 className="text-lg font-semibold text-[#546A7A] mb-4 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-[#546A7A]" />
                    Attendance Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <Card className="border-l-4 border-l-[#82A094]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-[#5D6E73]">Working Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-[#4F6A64]">
                            {selectedPerson.summary.presentDays || selectedPerson.summary.totalWorkingDays || 0}
                          </div>
                          <p className="text-xs text-[#AEBFC3]0 mt-1">Days present</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-l-4 border-l-[#6F8A9D]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-[#5D6E73]">Total Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-[#546A7A]">
                            {Number(selectedPerson.summary.totalHours).toFixed(1)}h
                          </div>
                          <p className="text-xs text-[#AEBFC3]0 mt-1">
                            {selectedPerson.summary.averageHoursPerDay 
                              ? `${Number(selectedPerson.summary.averageHoursPerDay).toFixed(1)}h avg/day`
                              : 'N/A avg/day'
                            }
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-l-4 border-l-[#E17F70]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-[#5D6E73]">Absent Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-[#9E3B47]">
                            {selectedPerson.summary.absentDays}
                          </div>
                          <p className="text-xs text-[#AEBFC3]0 mt-1">Days absent</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-l-4 border-l-[#6F8A9D]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-[#5D6E73]">Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-[#546A7A]">
                            {selectedPerson.summary.totalActivities || selectedPerson.summary.activitiesLogged || 0}
                          </div>
                          <p className="text-xs text-[#AEBFC3]0 mt-1">Total logged</p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-[#CE9F6B]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-[#5D6E73]">Auto Checkouts</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-[#976E44]">
                            {selectedPerson.summary.autoCheckouts || 0}
                          </div>
                          <p className="text-xs text-[#AEBFC3]0 mt-1">System generated</p>
                        </CardContent>
                      </Card>
                    </div>
                </div>

                {/* Ticket Performance Metrics */}
                <div>
                  <h4 className="text-lg font-semibold text-[#546A7A] mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#546A7A]" />
                    Ticket Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-[#96AEC2]/10 border-[#96AEC2]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-[#546A7A]">Total Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-[#546A7A]">
                            {selectedPerson.summary.totalTickets || 0}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-[#4F6A64]">✓ {selectedPerson.summary.ticketsResolved || 0} resolved</span>
                            <span className="text-[#5D6E73]">
                              {selectedPerson.summary.totalTickets 
                                ? ((selectedPerson.summary.totalTickets - (selectedPerson.summary.ticketsResolved || 0))) 
                                : 0
                              } pending
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-[#A2B9AF]/10 border-[#A2B9AF]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-[#4F6A64]">Resolution Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-[#4F6A64]">
                            {(() => {
                              const total = selectedPerson.summary.totalTickets || 0;
                              const resolved = selectedPerson.summary.ticketsResolved || 0;
                              return total > 0 ? Math.round((resolved / total) * 100) : 0;
                            })()}%
                          </div>
                          <p className="text-xs text-[#4F6A64] mt-2">Success rate</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-[#CE9F6B]/10 border-[#CE9F6B]/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-[#976E44]">Avg Resolution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-[#976E44]">
                            {(() => {
                              const hours = selectedPerson.summary.averageResolutionTimeHours || 0;
                              return hours > 0 ? `${hours.toFixed(1)}h` : 'N/A';
                            })()} 
                          </div>
                          <p className="text-xs text-[#976E44] mt-2">Business hours</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-[#6F8A9D]/10 border-[#6F8A9D]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-[#546A7A]">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-[#546A7A]">
                            {selectedPerson.summary.performanceScore || 0}%
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-[#6F8A9D]/30 rounded-full h-2">
                              <div 
                                className="bg-[#546A7A] h-2 rounded-full transition-all"
                                style={{ width: `${selectedPerson.summary.performanceScore || 0}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                </div>

                {/* Time Metrics */}
                <div>
                  <h4 className="text-lg font-semibold text-[#546A7A] mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#976E44]" />
                    Time Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-[#5D6E73]">Avg Travel Time</CardTitle>
                            <MapPin className="h-4 w-4 text-[#976E44]" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-[#976E44]">
                            {(() => {
                              const hours = selectedPerson.summary.averageTravelTimeHours || 0;
                              return hours > 0 ? `${hours.toFixed(1)}h` : 'N/A';
                            })()} 
                          </div>
                          <p className="text-xs text-[#AEBFC3]0 mt-1">Per ticket (real-time)</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-[#5D6E73]">Avg Onsite Time</CardTitle>
                            <Clock3 className="h-4 w-4 text-[#546A7A]" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-[#546A7A]">
                            {(() => {
                              const hours = selectedPerson.summary.averageOnsiteTimeHours || 0;
                              return hours > 0 ? `${hours.toFixed(1)}h` : 'N/A';
                            })()} 
                          </div>
                          <p className="text-xs text-[#AEBFC3]0 mt-1">Per ticket (onsite)</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-[#5D6E73]">Total Work Time</CardTitle>
                            <Timer className="h-4 w-4 text-[#546A7A]" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-[#546A7A]">
                            {(() => {
                              const travel = selectedPerson.summary.averageTravelTimeHours || 0;
                              const onsite = selectedPerson.summary.averageOnsiteTimeHours || 0;
                              const total = travel + onsite;
                              return total > 0 ? `${total.toFixed(1)}h` : 'N/A';
                            })()} 
                          </div>
                          <p className="text-xs text-[#AEBFC3]0 mt-1">Travel + Onsite avg</p>
                        </CardContent>
                      </Card>
                    </div>
                </div>
              </TabsContent>
              
              <TabsContent value="daily" className="space-y-4">
                <div className="mb-4 p-3 bg-[#96AEC2]/10 border border-[#96AEC2] rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-[#546A7A]">
                    <Info className="h-4 w-4" />
                    <span>Detailed day-by-day attendance with all activities and times</span>
                  </div>
                </div>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {selectedPerson.dayWiseBreakdown.map((day, index) => {
                      const statusConfig = STATUS_CONFIG[day.attendanceStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.CHECKED_OUT;
                      const StatusIcon = statusConfig.icon;
                      const dayKey = `${day.date}-${index}`;
                      const isExpanded = expandedDays[dayKey] || false;
                      
                      return (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-0">
                            {/* Header Section */}
                            <div className="p-4 bg-gradient-to-r from-[#AEBFC3]/10 to-white border-b">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Calendar className="h-5 w-5 text-[#546A7A]" />
                                  <div>
                                    <div className="font-semibold text-[#546A7A]">{formatDate(day.date)}</div>
                                    <div className="text-xs text-[#AEBFC3]0">
                                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                    </div>
                                  </div>
                                  <Badge className={`${statusConfig.color} border`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-[#546A7A]">{Number(day.totalHours).toFixed(1)}h</div>
                                  <div className="text-xs text-[#AEBFC3]0">Total Hours</div>
                                </div>
                              </div>
                              
                              {/* Time Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-[#A2B9AF]/20 rounded-lg">
                                    <Clock className="h-4 w-4 text-[#4F6A64]" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-[#5D6E73]">Check-in</div>
                                    <div className="font-semibold text-[#546A7A]">{formatTime(day.checkInTime)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-[#E17F70]/20 rounded-lg">
                                    <Clock className="h-4 w-4 text-[#75242D]" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-[#5D6E73]">Check-out</div>
                                    <div className="font-semibold text-[#546A7A]">{formatTime(day.checkOutTime)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-[#6F8A9D]/20 rounded-lg">
                                    <Activity className="h-4 w-4 text-[#546A7A]" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-[#5D6E73]">Activities</div>
                                    <div className="font-semibold text-[#546A7A]">{day.activityCount}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Activities Section */}
                            {day.activities && day.activities.length > 0 && (
                              <div className="p-4">
                                <button
                                  onClick={() => toggleDay(dayKey)}
                                  className="w-full flex items-center justify-between text-sm font-medium text-[#5D6E73] hover:text-[#546A7A] transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    View {day.activities.length} {day.activities.length === 1 ? 'Activity' : 'Activities'}
                                  </span>
                                  <svg 
                                    className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                
                                {isExpanded && (
                                  <div className="mt-3 space-y-2">
                                    {day.activities.map((activity, actIdx) => (
                                      <div key={actIdx} className="p-3 bg-[#AEBFC3]/10 rounded-lg border border-[#92A2A5]">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <div className="font-medium text-[#546A7A]">{activity.title}</div>
                                            <Badge variant="outline" className="text-xs mt-1">{activity.activityType}</Badge>
                                          </div>
                                          {activity.duration && (
                                            <Badge className="bg-[#6F8A9D]/20 text-[#546A7A] border-[#6F8A9D]">
                                              {Math.round(activity.duration)}m
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-[#5D6E73] mt-2">
                                          <div>
                                            <span className="text-[#AEBFC3]0">Start:</span> {formatTime(activity.startTime)}
                                          </div>
                                          <div>
                                            <span className="text-[#AEBFC3]0">End:</span> {formatTime(activity.endTime)}
                                          </div>
                                        </div>
                                        {activity.location && (
                                          <div className="flex items-center gap-1 text-xs text-[#5D6E73] mt-2">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{activity.location}</span>
                                          </div>
                                        )}
                                        {activity.ticket && (
                                          <div className="mt-2 p-2 bg-white rounded border border-[#96AEC2]">
                                            <div className="text-xs text-[#546A7A] font-medium">Ticket #{activity.ticketId}</div>
                                            <div className="text-xs text-[#5D6E73] truncate">{activity.ticket.title}</div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="activities" className="space-y-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#6F8A9D]/20 rounded-lg">
                      <Activity className="h-5 w-5 text-[#546A7A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#546A7A]">All Activities</div>
                      <div className="text-xs text-[#5D6E73]">
                        {selectedPerson.dayWiseBreakdown.reduce((sum, day) => sum + day.activityCount, 0)} total activities
                      </div>
                    </div>
                  </div>
                </div>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {selectedPerson.dayWiseBreakdown.map((day) => {
                      if (day.activities.length === 0) return null;
                      
                      return (
                        <div key={day.date}>
                          {/* Date Header */}
                          <div className="sticky top-0 z-10 bg-white border-b-2 border-[#546A7A] pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#546A7A]" />
                              <span className="font-semibold text-[#546A7A]">{formatDate(day.date)}</span>
                              <Badge variant="outline" className="text-xs">
                                {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Activities for this day */}
                          <div className="space-y-3 ml-6">
                            {day.activities.map((activity, index) => (
                              <Card key={`${day.date}-${index}`} className="border-l-4 border-l-[#6F8A9D]">
                                <CardContent className="p-4">
                                  {/* Activity Header */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Activity className="h-4 w-4 text-[#546A7A]" />
                                        <span className="font-semibold text-[#546A7A]">{activity.title}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs bg-[#6F8A9D]/10 text-[#546A7A] border-[#6F8A9D]">
                                          {activity.activityType}
                                        </Badge>
                                        {activity.duration && (
                                          <Badge className="text-xs bg-[#AEBFC3]/20 text-[#5D6E73] border-[#92A2A5]">
                                            <Timer className="h-3 w-3 mr-1" />
                                            {Math.round(activity.duration)} minutes
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Time Details */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div className="flex items-center gap-2 p-2 bg-[#A2B9AF]/10 rounded-lg">
                                      <Clock className="h-4 w-4 text-[#4F6A64]" />
                                      <div>
                                        <div className="text-xs text-[#4F6A64] font-medium">Start Time</div>
                                        <div className="text-sm font-semibold text-[#546A7A]">{formatTime(activity.startTime)}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-[#E17F70]/10 rounded-lg">
                                      <Clock className="h-4 w-4 text-[#75242D]" />
                                      <div>
                                        <div className="text-xs text-[#75242D] font-medium">End Time</div>
                                        <div className="text-sm font-semibold text-[#546A7A]">
                                          {activity.endTime ? formatTime(activity.endTime) : 'In Progress'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Location */}
                                  {activity.location && (
                                    <div className="flex items-start gap-2 p-2 bg-[#CE9F6B]/10 rounded-lg mb-3">
                                      <MapPin className="h-4 w-4 text-[#976E44] mt-0.5" />
                                      <div className="flex-1">
                                        <div className="text-xs text-[#976E44] font-medium">Location</div>
                                        <div className="text-sm text-[#546A7A] break-words">{activity.location}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Ticket Details */}
                                  {activity.ticket && (
                                    <div className="p-3 bg-gradient-to-r from-[#96AEC2]/10 to-[#6F8A9D]/10 rounded-lg border border-[#96AEC2]">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="p-1.5 bg-[#6F8A9D] rounded">
                                            <FileText className="h-3 w-3 text-white" />
                                          </div>
                                          <div>
                                            <div className="text-xs text-[#546A7A] font-medium">Ticket #{activity.ticketId}</div>
                                            <div className="text-sm font-semibold text-[#546A7A]">{activity.ticket.title}</div>
                                          </div>
                                        </div>
                                        {activity.ticket.status && (
                                          <Badge className="text-xs" style={{ 
                                            backgroundColor: STATUS_COLORS[activity.ticket.status as keyof typeof STATUS_COLORS] || '#6B7280',
                                            color: 'white',
                                            border: 'none'
                                          }}>
                                            {activity.ticket.status.replace(/_/g, ' ')}
                                          </Badge>
                                        )}
                                      </div>
                                      {activity.ticket.customer && (
                                        <div className="flex items-center gap-2 text-xs text-[#5D6E73] mt-2">
                                          <Users className="h-3 w-3" />
                                          <span className="font-medium">Customer:</span>
                                          <span>{activity.ticket.customer.companyName}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      <div className="md:hidden">
        <MobileModal 
          isOpen={detailModalOpen} 
          onClose={() => setDetailModalOpen(false)}
          className="max-w-[95vw] max-h-[95vh]"
        >
          <div className="space-y-4">
            {/* Mobile Header */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#546A7A]" />
                  <h2 className="text-lg font-semibold text-[#546A7A]">{selectedPerson?.name}</h2>
                </div>
                
                {/* Mobile Export Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('excel')}
                    className="text-[#4F6A64] hover:bg-[#A2B9AF]/10 border-[#A2B9AF] h-8 px-2"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    className="text-[#9E3B47] hover:bg-[#E17F70]/10 border-[#E17F70] h-8 px-2"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-[#5D6E73]">
                Attendance Details for {dateRange.from && dateRange.to 
                  ? `${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`
                  : 'selected period'
                }
              </p>
            </div>

            {selectedPerson && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  {/* Mobile Overview - Simplified */}
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#A2B9AF]/10 p-3 rounded-lg border border-[#A2B9AF]">
                        <div className="text-lg font-bold text-[#4F6A64]">
                          {selectedPerson.summary.presentDays || selectedPerson.summary.totalWorkingDays || 0}
                        </div>
                        <div className="text-xs text-[#4F6A64]">Working Days</div>
                      </div>
                      
                      <div className="bg-[#96AEC2]/10 p-3 rounded-lg border border-[#96AEC2]">
                        <div className="text-lg font-bold text-[#546A7A]">
                          {Number(selectedPerson.summary.totalHours).toFixed(1)}h
                        </div>
                        <div className="text-xs text-[#546A7A]">Total Hours</div>
                      </div>
                      
                      <div className="bg-[#E17F70]/10 p-3 rounded-lg border border-[#E17F70]">
                        <div className="text-lg font-bold text-[#9E3B47]">
                          {selectedPerson.summary.absentDays}
                        </div>
                        <div className="text-xs text-[#75242D]">Absent Days</div>
                      </div>
                      
                      <div className="bg-[#6F8A9D]/10 p-3 rounded-lg border border-[#6F8A9D]">
                        <div className="text-lg font-bold text-[#546A7A]">
                          {selectedPerson.summary.totalActivities || selectedPerson.summary.activitiesLogged || 0}
                        </div>
                        <div className="text-xs text-[#546A7A]">Activities</div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-[#546A7A] flex items-center gap-2">
                        <Target className="h-4 w-4 text-[#546A7A]" />
                        Performance
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-[#AEBFC3]/10 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#5D6E73]">Total Tickets</span>
                            <span className="font-semibold text-[#546A7A]">{selectedPerson.summary.totalTickets || 0}</span>
                          </div>
                        </div>
                        <div className="bg-[#AEBFC3]/10 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#5D6E73]">Resolution Rate</span>
                            <span className="font-semibold text-[#4F6A64]">
                              {(() => {
                                const total = selectedPerson.summary.totalTickets || 0;
                                const resolved = selectedPerson.summary.ticketsResolved || 0;
                                return total > 0 ? Math.round((resolved / total) * 100) : 0;
                              })()}%
                            </span>
                          </div>
                        </div>
                        <div className="bg-[#AEBFC3]/10 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#5D6E73]">Performance Score</span>
                            <span className="font-semibold text-[#546A7A]">{selectedPerson.summary.performanceScore || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-[#546A7A] flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#976E44]" />
                        Additional Info
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#CE9F6B]/10 p-3 rounded-lg border border-[#CE9F6B]">
                          <div className="text-lg font-bold text-[#976E44]">
                            {selectedPerson.summary.autoCheckouts || 0}
                          </div>
                          <div className="text-xs text-[#976E44]">Auto Checkouts</div>
                        </div>
                        <div className="bg-[#546A7A]/10 p-3 rounded-lg border border-[#546A7A]">
                          <div className="text-lg font-bold text-[#546A7A]">
                            {Number(selectedPerson.summary.averageHoursPerDay || 0).toFixed(1)}h
                          </div>
                          <div className="text-xs text-[#546A7A]">Avg Hours/Day</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="daily" className="space-y-4">
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {selectedPerson.dayWiseBreakdown.slice(0, 10).map((day, index) => {
                        const statusConfig = STATUS_CONFIG[day.attendanceStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.CHECKED_OUT;
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                          <div key={index} className="bg-white border border-[#92A2A5] rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-[#5D6E73]" />
                                <span className="text-sm font-medium">{formatDate(day.date)}</span>
                              </div>
                              <div className="text-xs text-[#5D6E73]">
                                {Number(day.totalHours).toFixed(1)}h
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${statusConfig.color} border`}>
                                <StatusIcon className="h-2 w-2" />
                                {statusConfig.label}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[#AEBFC3]0">In:</span>
                                <span className="ml-1 font-medium">{formatTime(day.checkInTime)}</span>
                              </div>
                              <div>
                                <span className="text-[#AEBFC3]0">Out:</span>
                                <span className="ml-1 font-medium">{formatTime(day.checkOutTime)}</span>
                              </div>
                            </div>
                            
                            {day.flags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {day.flags.slice(0, 2).map((flag, flagIndex) => {
                                  const flagConfig = FLAG_CONFIG[flag.type as keyof typeof FLAG_CONFIG];
                                  const FlagIcon = flagConfig?.icon || AlertTriangle;
                                  return (
                                    <div key={flagIndex} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${flagConfig?.color || 'bg-[#AEBFC3]/20 text-[#546A7A]'} border`}>
                                      <FlagIcon className="h-2 w-2" />
                                      {flag.message.substring(0, 20)}...
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {selectedPerson.dayWiseBreakdown.length > 10 && (
                        <div className="text-center py-2">
                          <span className="text-xs text-[#AEBFC3]0">Showing first 10 days</span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </MobileModal>
      </div>
    </div>
  );
}
