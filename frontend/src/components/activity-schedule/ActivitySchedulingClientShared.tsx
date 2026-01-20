'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Calendar, Plus, Search, Filter, Clock, User, AlertCircle, CheckCircle, 
  XCircle, TrendingUp, Users, Activity, Eye, Pencil as Edit, MapPin, 
  ChevronLeft, ChevronRight, Sparkles, Zap, Target, RefreshCw,
  LayoutGrid, List, ArrowUpRight, Timer, Building2, X
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ActivityScheduleDetail from '@/components/activity-schedule/ActivityScheduleDetail';

interface ActivitySchedule {
  id: number;
  servicePersonId: number;
  description?: string;
  activityType: string;
  priority: string;
  scheduledDate: string;
  estimatedDuration?: number;
  location?: string;
  status: string;
  zoneId?: string;
  servicePerson: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  scheduledBy: {
    id: number;
    name: string;
    email: string;
  };
  ticket?: {
    id: number;
    title: string;
    status: string;
  };
  zone?: {
    id: number;
    name: string;
  };
  customer?: {
    id: number;
    companyName: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
  rejected: number;
  cancelled: number;
  completionRate: number;
  acceptanceRate: number;
}

export default function ActivitySchedulingClient() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin/');
  const isZone = pathname.includes('/zone/');
  const isExpert = pathname.includes('/expert/');
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
  const [stats, setStats] = useState<Stats>({ 
    total: 0, 
    pending: 0, 
    accepted: 0, 
    completed: 0,
    rejected: 0,
    cancelled: 0,
    completionRate: 0,
    acceptanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState<ActivitySchedule | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [zoneFilter, setZoneFilter] = useState('all');
  const [servicePersonFilter, setServicePersonFilter] = useState('all');
  const [zones, setZones] = useState<any[]>([]);
  const [servicePersons, setServicePersons] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(true);

  const getBasePath = () => `/${isAdmin ? 'admin' : isZone ? 'zone' : 'expert'}`;

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter && priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (search) params.append('search', search);
      if (zoneFilter && zoneFilter !== 'all') params.append('zoneId', zoneFilter);
      if (servicePersonFilter && servicePersonFilter !== 'all') params.append('servicePersonId', servicePersonFilter);
      params.append('sortBy', 'date');
      params.append('sortOrder', 'desc');

      const response = await apiClient.get(`/activity-schedule?${params.toString()}`);
      
      if (response.success) {
        const schedulesData = response.data || [];
        setSchedules(schedulesData);
        setTotalPages(response.pagination?.totalPages || 1);
        
        const total = response.pagination?.total || schedulesData.length;
        const pending = schedulesData.filter((s: ActivitySchedule) => s.status === 'PENDING').length;
        const accepted = schedulesData.filter((s: ActivitySchedule) => s.status === 'ACCEPTED').length;
        const completed = schedulesData.filter((s: ActivitySchedule) => s.status === 'COMPLETED').length;
        const rejected = schedulesData.filter((s: ActivitySchedule) => s.status === 'REJECTED').length;
        const cancelled = schedulesData.filter((s: ActivitySchedule) => s.status === 'CANCELLED').length;
        
        setStats({ 
          total, 
          pending, 
          accepted, 
          completed,
          rejected,
          cancelled,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          acceptanceRate: (pending + accepted + rejected) > 0 ? Math.round((accepted / (pending + accepted + rejected)) * 100) : 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterData = async () => {
    try {
      // Fetch zones
      const zonesResponse = await apiClient.get('/service-zones');
      if (zonesResponse.success && zonesResponse.data) {
        setZones(Array.isArray(zonesResponse.data) ? zonesResponse.data : []);
      }
      
      // Fetch service persons
      const servicePersonsResponse = await apiClient.get('/service-persons');
      if (servicePersonsResponse.success && servicePersonsResponse.data) {
        setServicePersons(Array.isArray(servicePersonsResponse.data) ? servicePersonsResponse.data : []);
      }
    } catch (error: any) {
      console.error('Error fetching filter data:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [page, statusFilter, priorityFilter, search, zoneFilter, servicePersonFilter]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { 
          gradient: 'from-[#CE9F6B] to-[#CE9F6B]', 
          bg: 'bg-gradient-to-r from-[#EEC1BF]/10 to-[#EEC1BF]/10', 
          text: 'text-[#976E44]',
          border: 'border-[#CE9F6B]/50',
          icon: <AlertCircle className="h-4 w-4" />
        };
      case 'ACCEPTED':
        return { 
          gradient: 'from-[#6F8A9D] to-[#6F8A9D]', 
          bg: 'bg-gradient-to-r from-[#96AEC2]/10 to-[#6F8A9D]/10', 
          text: 'text-[#546A7A]',
          border: 'border-[#96AEC2]',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'COMPLETED':
        return { 
          gradient: 'from-[#82A094] to-[#82A094]', 
          bg: 'bg-gradient-to-r from-[#A2B9AF]/10 to-[#82A094]/10', 
          text: 'text-[#4F6A64]',
          border: 'border-[#82A094]/50',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'REJECTED':
        return { 
          gradient: 'from-[#E17F70] to-[#E17F70]', 
          bg: 'bg-gradient-to-r from-[#E17F70]/10 to-[#EEC1BF]/10', 
          text: 'text-[#75242D]',
          border: 'border-[#E17F70]',
          icon: <XCircle className="h-4 w-4" />
        };
      case 'CANCELLED':
        return { 
          gradient: 'from-[#AEBFC3]/100 to-[#AEBFC3]/100', 
          bg: 'bg-gradient-to-r from-[#AEBFC3]/10 to-[#AEBFC3]/10', 
          text: 'text-[#5D6E73]',
          border: 'border-[#92A2A5]',
          icon: <X className="h-4 w-4" />
        };
      default:
        return { 
          gradient: 'from-[#AEBFC3]/100 to-[#AEBFC3]/100', 
          bg: 'bg-gradient-to-r from-[#AEBFC3]/10 to-[#AEBFC3]/10', 
          text: 'text-[#5D6E73]',
          border: 'border-[#92A2A5]',
          icon: null 
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { color: 'bg-[#E17F70]/100', text: 'text-[#75242D]', bg: 'bg-[#E17F70]/10', icon: <Zap className="h-3 w-3" /> };
      case 'HIGH':
        return { color: 'bg-[#CE9F6B]/100', text: 'text-[#976E44]', bg: 'bg-[#CE9F6B]/10', icon: <Target className="h-3 w-3" /> };
      case 'MEDIUM':
        return { color: 'bg-[#96AEC2]/100', text: 'text-[#546A7A]', bg: 'bg-[#96AEC2]/10', icon: <Activity className="h-3 w-3" /> };
      case 'LOW':
        return { color: 'bg-[#A2B9AF]/100', text: 'text-[#4F6A64]', bg: 'bg-[#A2B9AF]/10', icon: <CheckCircle className="h-3 w-3" /> };
      default:
        return { color: 'bg-[#AEBFC3]/100', text: 'text-[#5D6E73]', bg: 'bg-[#AEBFC3]/10', icon: null };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearch('');
    setZoneFilter('all');
    setServicePersonFilter('all');
  };

  const hasActiveFilters = (statusFilter && statusFilter !== 'all') || (priorityFilter && priorityFilter !== 'all') || search || (zoneFilter && zoneFilter !== 'all') || (servicePersonFilter && servicePersonFilter !== 'all');

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Scheduled */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxOS44ODIgMCAxOC04LjA1OSAxOC0xOHMtOC4wNTktMTgtMTgtMTh6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#96AEC2] text-sm font-medium mb-1">Total Scheduled</p>
                <p className="text-4xl font-bold text-white">{stats.total}</p>
                <p className="text-[#96AEC2] text-xs mt-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  All time activities
                </p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Response */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#CE9F6B] to-[#CE9F6B] opacity-90" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#EEC1BF] text-sm font-medium mb-1">Pending Response</p>
                <p className="text-4xl font-bold text-white">{stats.pending}</p>
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#82A094] to-[#82A094] opacity-90" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A2B9AF] text-sm font-medium mb-1">Completion Rate</p>
                <p className="text-4xl font-bold text-white">{stats.completionRate}%</p>
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance Rate */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] opacity-90" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium mb-1">Acceptance Rate</p>
                <p className="text-4xl font-bold text-white">{stats.acceptanceRate}%</p>
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${stats.acceptanceRate}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push(`${getBasePath()}/activity-scheduling/new`)}
            className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] hover:from-[#546A7A] hover:to-[#546A7A] text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            New Schedule
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchSchedules}
            className="border-[#92A2A5] hover:bg-[#AEBFC3]/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-[#6F8A9D] text-white' : 'border-[#92A2A5]'}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
          <div className="border-l border-[#92A2A5] h-8 mx-2" />
          <div className="flex items-center bg-[#AEBFC3]/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-[#92A2A5]/30'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm' : 'hover:bg-[#92A2A5]/30'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="border-0 shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#AEBFC3]/10 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-[#96AEC2]/20 rounded-lg">
                  <Filter className="h-4 w-4 text-[#546A7A]" />
                </div>
                Filters & Search
              </CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#9E3B47] hover:text-[#75242D] hover:bg-[#E17F70]/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5D6E73] mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#979796]" />
                  <Input
                    placeholder="Search activities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#96AEC2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5D6E73] mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-[#92A2A5]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="PENDING">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#CE9F6B]/100 rounded-full" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="ACCEPTED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#96AEC2]/100 rounded-full" />
                        Accepted
                      </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#82A094]/100 rounded-full" />
                        Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="REJECTED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#E17F70]/100 rounded-full" />
                        Rejected
                      </div>
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#AEBFC3]/100 rounded-full" />
                        Cancelled
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5D6E73] mb-2">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="border-[#92A2A5]">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="URGENT">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-[#E17F70]" />
                        Urgent
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3 text-[#CE9F6B]" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3 text-[#6F8A9D]" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-[#82A094]" />
                        Low
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5D6E73] mb-2">Zone</label>
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger className="border-[#92A2A5]">
                    <SelectValue placeholder="All zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All zones</SelectItem>
                    {zones.map((zone: any) => (
                      <SelectItem key={zone.id} value={zone.id.toString()}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5D6E73] mb-2">Service Person</label>
                <Select value={servicePersonFilter} onValueChange={setServicePersonFilter}>
                  <SelectTrigger className="border-[#92A2A5]">
                    <SelectValue placeholder="All persons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All persons</SelectItem>
                    {servicePersons.map((person: any) => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedules Content */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-white to-[#AEBFC3]/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-xl shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[#546A7A]">Activity Schedules</CardTitle>
                <CardDescription className="text-[#AEBFC3]0">
                  {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} found
                  {loading && ' • Loading...'}
                </CardDescription>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-[#AEBFC3]0">
                <span>Page {page} of {totalPages}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center">
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-[#92A2A5]" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
              </div>
              <p className="text-[#5D6E73] font-medium">Loading schedules...</p>
              <p className="text-[#979796] text-sm mt-1">Please wait</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#AEBFC3]/20 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-12 w-12 text-[#979796]" />
              </div>
              <h3 className="text-xl font-semibold text-[#546A7A] mb-2">No schedules found</h3>
              <p className="text-[#AEBFC3]0 mb-6 max-w-md mx-auto">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to find more results'
                  : 'Create your first activity schedule to get started'}
              </p>
              <div className="flex items-center justify-center gap-3">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Button 
                  onClick={() => router.push(`${getBasePath()}/activity-scheduling/new`)}
                  className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {schedules.map((schedule) => {
                const statusConfig = getStatusConfig(schedule.status);
                const priorityConfig = getPriorityConfig(schedule.priority);
                
                return (
                  <Card 
                    key={schedule.id} 
                    className="border border-[#AEBFC3]/30 hover:border-[#96AEC2] hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => router.push(`${getBasePath()}/activity-scheduling/${schedule.id}`)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${statusConfig.gradient}`} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${statusConfig.gradient} text-white shadow-md`}>
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#546A7A] group-hover:text-[#546A7A] transition-colors">
                              {schedule.activityType.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-[#AEBFC3]0">#{schedule.id}</p>
                          </div>
                        </div>
                        <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                          {statusConfig.icon}
                          <span className="ml-1">{schedule.status}</span>
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[#5D6E73]">
                          <User className="h-4 w-4 text-[#979796]" />
                          <span>{schedule.servicePerson.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#5D6E73]">
                          <Calendar className="h-4 w-4 text-[#979796]" />
                          <span>{formatDate(schedule.scheduledDate)}</span>
                          <Clock className="h-4 w-4 text-[#979796] ml-2" />
                          <span>{formatTime(schedule.scheduledDate)}</span>
                        </div>
                        {schedule.location && (
                          <div className="flex items-center gap-2 text-sm text-[#5D6E73]">
                            <MapPin className="h-4 w-4 text-[#979796]" />
                            <span className="truncate">{schedule.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[#AEBFC3]/30">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${priorityConfig.color}`} />
                          <span className={`text-xs font-medium ${priorityConfig.text}`}>{schedule.priority}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#546A7A] hover:text-[#546A7A] hover:bg-[#96AEC2]/10 group-hover:bg-[#96AEC2]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`${getBasePath()}/activity-scheduling/${schedule.id}`);
                          }}
                        >
                          View Details
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#AEBFC3]/10 border-b border-[#92A2A5]">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">ID</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Activity</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Priority</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Assigned To</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Created By</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Zone</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Schedule</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Location</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#AEBFC3]0 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {schedules.map((schedule) => {
                    const statusConfig = getStatusConfig(schedule.status);
                    const priorityConfig = getPriorityConfig(schedule.priority);

                    return (
                      <tr key={schedule.id} className="hover:bg-[#96AEC2]/10/50 transition-colors group">
                        <td className="px-3 py-2">
                          <span 
                            onClick={() => router.push(`${getBasePath()}/activity-scheduling/${schedule.id}`)}
                            className="bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] text-white text-xs font-bold px-2 py-0.5 rounded cursor-pointer hover:from-[#546A7A] hover:to-[#546A7A] hover:shadow-md transition-all"
                          >
                            #{schedule.id}
                          </span>
                        </td>
                        
                        <td className="px-3 py-2">
                          <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => router.push(`${getBasePath()}/activity-scheduling/${schedule.id}`)}
                          >
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${statusConfig.gradient} text-white`}>
                              <Activity className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-[#546A7A] group-hover:text-[#546A7A] group-hover:underline">
                                {schedule.activityType.replace(/_/g, ' ')}
                              </p>
                              {schedule.description && (
                                <p className="text-xs text-[#AEBFC3]0 truncate max-w-[120px]">{schedule.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-3 py-2">
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border text-xs py-0.5`}>
                            {statusConfig.icon}
                            <span className="ml-1">{schedule.status}</span>
                          </Badge>
                        </td>
                        
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${priorityConfig.color}`} />
                            <span className={`text-xs font-medium ${priorityConfig.text}`}>{schedule.priority}</span>
                          </div>
                        </td>
                        
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-gradient-to-br from-[#6F8A9D] to-[#E17F70] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {schedule.servicePerson.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-[#546A7A]">{schedule.servicePerson.name}</span>
                          </div>
                        </td>
                        
                        <td className="px-3 py-2">
                          {schedule.scheduledBy ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 bg-gradient-to-br from-[#82A094] to-[#6F8A9D] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {schedule.scheduledBy.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <span className="text-sm text-[#546A7A]">{schedule.scheduledBy.name || 'Unknown'}</span>
                            </div>
                          ) : (
                            <span className="text-[#979796] text-xs">—</span>
                          )}
                        </td>
                        
                        <td className="px-3 py-2">
                          {schedule.zone ? (
                            <span className="text-sm text-[#5D6E73] font-medium">{schedule.zone.name}</span>
                          ) : (
                            <span className="text-[#979796] text-xs">—</span>
                          )}
                        </td>
                        
                        <td className="px-3 py-2">
                          {schedule.customer ? (
                            <span className="text-sm text-[#5D6E73] truncate max-w-[100px] block">{schedule.customer.companyName}</span>
                          ) : (
                            <span className="text-[#979796] text-xs">—</span>
                          )}
                        </td>
                        
                        <td className="px-3 py-2">
                          <div className="text-xs">
                            <span className="text-[#546A7A] font-medium">{formatDate(schedule.scheduledDate)}</span>
                            <span className="text-[#AEBFC3]0 ml-1">{formatTime(schedule.scheduledDate)}</span>
                          </div>
                        </td>
                        
                        <td className="px-3 py-2">
                          {schedule.location ? (
                            <span className="text-xs text-[#5D6E73] truncate max-w-[80px] block">{schedule.location}</span>
                          ) : (
                            <span className="text-[#979796] text-xs">—</span>
                          )}
                        </td>
                        
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`${getBasePath()}/activity-scheduling/${schedule.id}`)}
                              className="h-7 px-2 text-xs border-[#92A2A5] hover:bg-[#96AEC2]/10 hover:border-[#96AEC2] hover:text-[#546A7A]"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {schedule.status === 'PENDING' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`${getBasePath()}/activity-scheduling/${schedule.id}/edit`)}
                                className="h-7 px-2 text-xs border-[#92A2A5] hover:bg-[#CE9F6B]/10 hover:border-[#CE9F6B]/50 hover:text-[#976E44]"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-[#AEBFC3]/10 border-t">
              <div className="text-sm text-[#5D6E73]">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, stats.total)} of {stats.total} schedules
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="border-[#92A2A5]"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`h-9 w-9 p-0 ${pageNum === page ? 'bg-[#6F8A9D] text-white' : 'border-[#92A2A5]'}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="border-[#92A2A5]"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Schedule Details</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <ActivityScheduleDetail
              schedule={selectedSchedule}
              onRefresh={() => {
                setIsDetailDialogOpen(false);
                fetchSchedules();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
