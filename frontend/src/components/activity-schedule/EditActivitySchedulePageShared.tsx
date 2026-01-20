'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  Loader2, 
  Calendar,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Pencil as Edit3,
  ChevronRight,
  FileText,
  Sparkles,
  Timer,
  Building2,
  Layers,
  Activity,
  AlertCircle,
  XCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ActivityScheduleForm from '@/components/activity-schedule/ActivityScheduleForm';

export const dynamic = 'force-dynamic';

export default function EditActivitySchedulePageShared() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const scheduleId = params.id as string;
  const isAdmin = pathname.includes('/admin/');
  const isZone = pathname.includes('/zone/');
  const isExpert = pathname.includes('/expert/');
  
  const [schedule, setSchedule] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  const getBasePath = useCallback(() => `/${isAdmin ? 'admin' : isZone ? 'zone' : 'expert'}`, [isAdmin, isZone, isExpert]);

  const fetchSchedule = useCallback(async () => {
    if (!scheduleId) return;
    
    try {
      setLoading(true);
      setDataReady(false);
      
      const response = await apiClient.get(`/activity-schedule/${scheduleId}`);
      
      if (response.success && response.data) {
        // Ensure all data is available before setting
        const scheduleData = response.data;
        
        // Log for debugging
        console.log('Schedule data received:', {
          id: scheduleData.id,
          hasZone: !!scheduleData.zone,
          hasCustomer: !!scheduleData.customer,
          hasAssets: !!(scheduleData.assets && scheduleData.assets.length > 0),
          zoneId: scheduleData.zoneId,
          customerId: scheduleData.customerId,
          assetIds: scheduleData.assetIds,
        });
        
        setSchedule(scheduleData);
        setDataReady(true);
      } else {
        throw new Error('Failed to load schedule data');
      }
    } catch (error: any) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
      router.push(`${getBasePath()}/activity-scheduling`);
    } finally {
      setLoading(false);
    }
  }, [scheduleId, getBasePath, router]);

  // Ref to prevent duplicate API calls (React StrictMode protection)
  const hasFetchedSchedule = useRef(false);

  useEffect(() => {
    if (hasFetchedSchedule.current) return;
    hasFetchedSchedule.current = true;
    fetchSchedule();
  }, [fetchSchedule]);

  const handleCancel = () => {
    router.push(`${getBasePath()}/activity-scheduling/${scheduleId}`);
  };

  const handleSuccess = () => {
    toast.success('Schedule updated successfully!', {
      description: 'The changes have been saved.',
    });
    router.push(`${getBasePath()}/activity-scheduling/${scheduleId}`);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { gradient: 'from-[#CE9F6B] to-[#CE9F6B]', bg: 'bg-[#CE9F6B]/10', text: 'text-[#976E44]', icon: <AlertCircle className="h-4 w-4" /> };
      case 'ACCEPTED':
        return { gradient: 'from-[#6F8A9D] to-[#6F8A9D]', bg: 'bg-[#96AEC2]/10', text: 'text-[#546A7A]', icon: <CheckCircle className="h-4 w-4" /> };
      case 'COMPLETED':
        return { gradient: 'from-[#82A094] to-[#82A094]', bg: 'bg-[#82A094]/10', text: 'text-[#4F6A64]', icon: <CheckCircle className="h-4 w-4" /> };
      case 'REJECTED':
        return { gradient: 'from-[#E17F70] to-[#E17F70]', bg: 'bg-[#E17F70]/10', text: 'text-[#75242D]', icon: <XCircle className="h-4 w-4" /> };
      default:
        return { gradient: 'from-[#AEBFC3]/100 to-[#AEBFC3]/100', bg: 'bg-[#AEBFC3]/10', text: 'text-[#5D6E73]', icon: null };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { gradient: 'from-[#E17F70] to-[#9E3B47]', bg: 'bg-[#E17F70]/10', text: 'text-[#75242D]' };
      case 'HIGH':
        return { gradient: 'from-[#CE9F6B] to-[#CE9F6B]', bg: 'bg-[#CE9F6B]/10', text: 'text-[#976E44]' };
      case 'MEDIUM':
        return { gradient: 'from-[#6F8A9D] to-[#6F8A9D]', bg: 'bg-[#96AEC2]/10', text: 'text-[#546A7A]' };
      case 'LOW':
        return { gradient: 'from-[#82A094] to-[#82A094]', bg: 'bg-[#A2B9AF]/10', text: 'text-[#4F6A64]' };
      default:
        return { gradient: 'from-[#AEBFC3]/100 to-[#AEBFC3]/100', bg: 'bg-[#AEBFC3]/10', text: 'text-[#5D6E73]' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const formatDuration = (hours: number) => {
    if (!hours || isNaN(hours)) return '—';
    if (hours >= 1) {
      const h = Math.floor(hours);
      const m = Math.round((hours % 1) * 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${Math.round(hours * 60)}m`;
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5D6E73] via-[#546A7A] to-[#546A7A] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#96AEC2]/100/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6F8A9D]/100/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#96AEC2] animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] animate-pulse flex items-center justify-center">
              <Edit3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Loading Schedule</h3>
            <p className="text-[#96AEC2]/70 text-sm">Preparing the edit form...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!schedule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-[#96AEC2]/10 to-[#6F8A9D]/10 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.push(`${getBasePath()}/activity-scheduling`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schedules
          </Button>
          
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-slate-700 p-8 text-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Schedule Not Found</h3>
              <p className="text-[#AEBFC3] mt-2">The schedule you're trying to edit doesn't exist or has been deleted.</p>
            </div>
            <CardContent className="p-8 text-center bg-white">
              <Button 
                onClick={() => router.push(`${getBasePath()}/activity-scheduling`)}
                className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] hover:from-[#546A7A] hover:to-[#546A7A] text-white shadow-lg"
              >
                Return to Schedules
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(schedule.status);
  const priorityConfig = getPriorityConfig(schedule.priority);

  // Check if related data is available
  const hasZone = schedule.zone && schedule.zone.name;
  const hasCustomer = schedule.customer && schedule.customer.companyName;
  const hasAssets = schedule.assets && Array.isArray(schedule.assets) && schedule.assets.length > 0;
  const hasTicket = schedule.ticket && schedule.ticket.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-[#96AEC2]/10/30 to-[#6F8A9D]/10/50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-[#CE9F6B] via-[#CE9F6B] to-[#E17F70] py-12 px-4 md:px-8">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/70 text-sm mb-6">
              <button
                onClick={() => router.push(`${getBasePath()}/activity-scheduling`)}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Activity Scheduling
              </button>
              <ChevronRight className="h-4 w-4" />
              <button
                onClick={handleCancel}
                className="hover:text-white transition-colors"
              >
                Schedule #{scheduleId}
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">Edit</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
                  <Edit3 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Edit Schedule
                  </h1>
                  <p className="text-[#EEC1BF] text-lg">
                    {schedule.activityType?.replace(/_/g, ' ')} • #{schedule.id}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge className={`${statusConfig.bg} ${statusConfig.text} border border-white/20 shadow-lg backdrop-blur-sm px-4 py-2`}>
                  {statusConfig.icon}
                  <span className="ml-1.5 font-medium">{schedule.status}</span>
                </Badge>
                <Button
                  variant="outline"
                  onClick={fetchSchedule}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-white to-[#AEBFC3]/10 border-b p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-[#CE9F6B] to-[#976E44] rounded-xl text-white shadow-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#546A7A]">Update Schedule Details</CardTitle>
                    <CardDescription className="text-[#AEBFC3]0">
                      Modify the schedule information and save changes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {dataReady ? (
                  <ActivityScheduleForm
                    key={`form-${schedule.id}-${schedule.updatedAt}`}
                    initialData={schedule}
                    isEditing={true}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                ) : (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#979796] mx-auto mb-4" />
                    <p className="text-[#AEBFC3]0">Loading form data...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Current Info */}
          <div className="space-y-6">
            {/* Current Schedule Summary */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] text-white p-6">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  Current Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100">
                {/* Activity Type */}
                <div className="p-4 flex items-center gap-4">
                  <div className="p-2.5 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-xl text-white shadow-md">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Activity Type</p>
                    <p className="font-semibold text-[#546A7A]">{schedule.activityType?.replace(/_/g, ' ') || '—'}</p>
                  </div>
                </div>

                {/* Service Person */}
                <div className="p-4 flex items-center gap-4">
                  <div className="p-2.5 bg-gradient-to-br from-[#6F8A9D] to-[#E17F70] rounded-xl text-white shadow-md">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Assigned To</p>
                    <p className="font-semibold text-[#546A7A]">{schedule.servicePerson?.name || 'Unassigned'}</p>
                    {schedule.servicePerson?.email && (
                      <p className="text-sm text-[#AEBFC3]0">{schedule.servicePerson.email}</p>
                    )}
                  </div>
                </div>

                {/* Scheduled Date */}
                <div className="p-4 flex items-center gap-4">
                  <div className="p-2.5 bg-gradient-to-br from-[#82A094] to-[#82A094] rounded-xl text-white shadow-md">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Scheduled For</p>
                    <p className="font-semibold text-[#546A7A]">{formatDate(schedule.scheduledDate)}</p>
                    <p className="text-sm text-[#AEBFC3]0">{formatTime(schedule.scheduledDate)}</p>
                  </div>
                </div>

                {/* Duration */}
                {schedule.estimatedDuration && (
                  <div className="p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-[#CE9F6B] to-[#CE9F6B] rounded-xl text-white shadow-md">
                      <Timer className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Duration</p>
                      <p className="font-semibold text-[#546A7A]">{formatDuration(schedule.estimatedDuration)}</p>
                    </div>
                  </div>
                )}

                {/* Priority */}
                <div className="p-4 flex items-center gap-4">
                  <div className={`p-2.5 bg-gradient-to-br ${priorityConfig.gradient} rounded-xl text-white shadow-md`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Priority</p>
                    <Badge className={`${priorityConfig.bg} ${priorityConfig.text} mt-1`}>
                      {schedule.priority || 'MEDIUM'}
                    </Badge>
                  </div>
                </div>

                {/* Location */}
                {schedule.location && (
                  <div className="p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-[#E17F70] to-[#9E3B47] rounded-xl text-white shadow-md">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Location</p>
                      <p className="font-semibold text-[#546A7A]">{schedule.location}</p>
                    </div>
                  </div>
                )}

                {/* Zone - Always show if zoneId exists */}
                {(hasZone || schedule.zoneId) && (
                  <div className="p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] rounded-xl text-white shadow-md">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Service Zone</p>
                      <p className="font-semibold text-[#546A7A]">
                        {hasZone ? schedule.zone.name : `Zone ID: ${schedule.zoneId}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Customer - Always show if customerId exists */}
                {(hasCustomer || schedule.customerId) && (
                  <div className="p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-xl text-white shadow-md">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Customer</p>
                      <p className="font-semibold text-[#546A7A]">
                        {hasCustomer ? schedule.customer.companyName : `Customer ID: ${schedule.customerId}`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Ticket */}
            {hasTicket && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] text-white p-5">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5" />
                    Related Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#546A7A]">#{schedule.ticket.id}</p>
                      <p className="text-sm text-[#5D6E73] mt-1">{schedule.ticket.title}</p>
                      <Badge className="mt-2 bg-[#96AEC2]/10 text-[#546A7A] border-[#96AEC2]">
                        {schedule.ticket.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assets - Show if assets exist or assetIds exist */}
            {(hasAssets || (schedule.assetIds && Array.isArray(schedule.assetIds) && schedule.assetIds.length > 0)) && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#4F6A64] to-[#4F6A64] text-white p-5">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="h-5 w-5" />
                    Linked Assets ({hasAssets ? schedule.assets.length : schedule.assetIds?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {hasAssets ? (
                    schedule.assets.map((asset: any) => (
                      <div key={asset.id} className="p-3 bg-gradient-to-br from-[#A2B9AF]/10 to-[#82A094]/10 rounded-xl border border-[#A2B9AF]/30">
                        <p className="font-semibold text-[#546A7A]">{asset.model}</p>
                        <p className="text-sm text-[#AEBFC3]0 font-mono">S/N: {asset.serialNo}</p>
                        {asset.location && (
                          <p className="text-sm text-[#979796] mt-1">{asset.location}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gradient-to-br from-[#AEBFC3]/10 to-[#AEBFC3]/10 rounded-xl border border-[#92A2A5]">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#979796]" />
                        <p className="text-sm text-[#AEBFC3]0">Loading asset details...</p>
                      </div>
                      <p className="text-xs text-[#979796] mt-1">
                        Asset IDs: {schedule.assetIds.join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className="border border-[#96AEC2]/30 shadow-lg bg-gradient-to-br from-[#96AEC2]/10 to-[#6F8A9D]/10">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#96AEC2]/20 rounded-xl">
                    <Info className="h-5 w-5 text-[#546A7A]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#546A7A] mb-1">Editing Tips</h4>
                    <p className="text-sm text-[#5D6E73]">
                      Changes will be reflected immediately. The service person will be notified about any schedule updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
