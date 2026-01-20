'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, MapPin, Layers, Eye, Play, ThumbsUp, ThumbsDown, Briefcase, ChevronRight, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ActivityStage {
  id: number;
  stage: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface RelatedActivity {
  id: number;
  title: string;
  activityType: string;
  startTime: string;
  endTime?: string;
  location?: string;
  status?: string;
  ActivityStage?: ActivityStage[];
  ticket?: {
    id: number;
    title: string;
    status: string;
  };
}

interface ActivitySchedule {
  id: number;
  title: string;
  description?: string;
  activityType: string;
  priority: string;
  scheduledDate: string;
  estimatedDuration: number;
  location?: string;
  status: string;
  rejectionReason?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  relatedActivities?: RelatedActivity[];
  assets?: any[];
  zone?: {
    id: number;
    name: string;
  };
  customer?: {
    id: number;
    companyName: string;
    address?: string;
  };
  ticket?: {
    id: number;
    title: string;
    status: string;
    priority?: string;
    customer?: {
      id: number;
      companyName: string;
      address?: string;
    };
    asset?: {
      id: number;
      serialNo?: string;
      model?: string;
      location?: string;
    };
    contact?: {
      id: number;
      name: string;
      phone?: string;
      email?: string;
    };
  };
  scheduledBy: {
    name: string;
    email: string;
  };
  servicePerson?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

// Activity type icons mapping
const ACTIVITY_TYPE_ICONS: Record<string, { icon: string; color: string; bgColor: string }> = {
  TICKET_WORK: { icon: '🎫', color: 'text-[#546A7A]', bgColor: 'bg-[#96AEC2]/20' },
  PO_DISCUSSION: { icon: '💼', color: 'text-[#546A7A]', bgColor: 'bg-[#6F8A9D]/20' },
  SPARE_REPLACEMENT: { icon: '🔧', color: 'text-[#976E44]', bgColor: 'bg-[#CE9F6B]/20' },
  TRAVEL: { icon: '🚗', color: 'text-[#546A7A]', bgColor: 'bg-[#96AEC2]/20' },
  TRAINING: { icon: '📚', color: 'text-[#546A7A]', bgColor: 'bg-[#546A7A]/20' },
  REVIEW_MEETING: { icon: '👥', color: 'text-[#9E3B47]', bgColor: 'bg-[#EEC1BF]/20' },
  RELOCATION: { icon: '📦', color: 'text-[#976E44]', bgColor: 'bg-[#CE9F6B]/20' },
  MAINTENANCE_PLANNED: { icon: '🛠️', color: 'text-[#4F6A64]', bgColor: 'bg-[#82A094]/20' },
  INSTALLATION: { icon: '🔨', color: 'text-[#4F6A64]', bgColor: 'bg-[#A2B9AF]/20' },
  DOCUMENTATION: { icon: '📝', color: 'text-[#5D6E73]', bgColor: 'bg-[#AEBFC3]/20' },
  WORK_FROM_HOME: { icon: '🏠', color: 'text-[#546A7A]', bgColor: 'bg-[#6F8A9D]/20' },
  OTHER: { icon: '📋', color: 'text-[#5D6E73]', bgColor: 'bg-[#AEBFC3]/20' },
};

export default function ServicePersonSchedules() {
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<ActivitySchedule | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionScheduleId, setActionScheduleId] = useState<number | null>(null);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/activity-schedule?status=PENDING,ACCEPTED');
      
      if (response.success) {
        setSchedules(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getActivityTypeInfo = (type: string) => {
    return ACTIVITY_TYPE_ICONS[type] || ACTIVITY_TYPE_ICONS.OTHER;
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { color: 'bg-[#E17F70]/100 text-white', label: 'Urgent', dot: 'bg-[#E17F70]/100' };
      case 'HIGH':
        return { color: 'bg-[#CE9F6B]/100 text-white', label: 'High', dot: 'bg-[#CE9F6B]/100' };
      case 'MEDIUM':
        return { color: 'bg-[#96AEC2]/100 text-white', label: 'Medium', dot: 'bg-[#96AEC2]/100' };
      case 'LOW':
        return { color: 'bg-[#A2B9AF]/100 text-white', label: 'Low', dot: 'bg-[#A2B9AF]/100' };
      default:
        return { color: 'bg-[#AEBFC3]/100 text-white', label: priority, dot: 'bg-[#AEBFC3]/100' };
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

  const formatDuration = (hours?: number) => {
    if (!hours) return 'N/A';
    if (hours >= 1) {
      const h = Math.floor(hours);
      const m = Math.round((hours % 1) * 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${Math.round(hours * 60)}m`;
  };

  const handleAccept = async (scheduleId: number) => {
    try {
      setIsSubmitting(true);
      setActionScheduleId(scheduleId);
      const response = await apiClient.patch(`/activity-schedule/${scheduleId}/accept`);
      
      if (response.success) {
        toast.success('Schedule accepted successfully! 🎉');
        fetchSchedules();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept schedule');
    } finally {
      setIsSubmitting(false);
      setActionScheduleId(null);
    }
  };

  const handleReject = async (scheduleId: number) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setIsSubmitting(true);
      setActionScheduleId(scheduleId);
      const response = await apiClient.patch(`/activity-schedule/${scheduleId}/reject`, {
        rejectionReason,
      });
      
      if (response.success) {
        toast.success('Schedule rejected');
        setShowRejectDialog(false);
        setRejectionReason('');
        fetchSchedules();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject schedule');
    } finally {
      setIsSubmitting(false);
      setActionScheduleId(null);
    }
  };

  const openRejectDialog = (schedule: ActivitySchedule) => {
    setSelectedSchedule(schedule);
    setShowRejectDialog(true);
  };

  const viewScheduleDetails = async (schedule: ActivitySchedule) => {
    try {
      const response = await apiClient.get(`/activity-schedule/${schedule.id}`);
      if (response.success) {
        const data = response.data;
        if (data.relatedActivities && Array.isArray(data.relatedActivities)) {
          const seen = new Set();
          data.relatedActivities = data.relatedActivities.filter((activity: any) => {
            if (seen.has(activity.id)) return false;
            seen.add(activity.id);
            return true;
          });
        }
        setSelectedSchedule(data);
      } else {
        setSelectedSchedule(schedule);
      }
    } catch (error) {
      console.error('Error fetching schedule details:', error);
      setSelectedSchedule(schedule);
    }
    setShowDetailDialog(true);
  };

  const pendingSchedules = schedules.filter(s => s.status === 'PENDING');
  const acceptedSchedules = schedules.filter(s => s.status === 'ACCEPTED');

  // Schedule Card Component
  const ScheduleCard = ({ schedule, isPending }: { schedule: ActivitySchedule; isPending: boolean }) => {
    const activityInfo = getActivityTypeInfo(schedule.activityType);
    const priorityConfig = getPriorityConfig(schedule.priority);
    const isActioning = isSubmitting && actionScheduleId === schedule.id;

    return (
      <div className={`relative group rounded-2xl border-2 transition-all duration-300 hover:shadow-lg overflow-hidden ${
        isPending 
          ? 'border-[#CE9F6B] bg-gradient-to-br from-yellow-50 to-[#EEC1BF]/10/30 hover:border-[#CE9F6B]' 
          : 'border-[#A2B9AF] bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/10/30 hover:border-[#82A094]'
      }`}>
        {/* Priority indicator bar */}
        <div className={`absolute top-0 left-0 w-1 h-full ${priorityConfig.dot}`} />
        
        <div className="p-4">
          {/* Header Row */}
          <div className="flex items-start gap-3 mb-3">
            {/* Activity Type Icon */}
            <div className={`w-12 h-12 ${activityInfo.bgColor} rounded-xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0`}>
              {activityInfo.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Title and Priority */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-[#546A7A] text-sm leading-tight line-clamp-2">
                  {schedule.description || schedule.activityType.replace(/_/g, ' ')}
                </h3>
                <Badge className={`${priorityConfig.color} text-xs px-2 py-0.5 flex-shrink-0 shadow-sm`}>
                  {priorityConfig.label}
                </Badge>
              </div>
              
              {/* Activity Type Badge */}
              <Badge variant="secondary" className={`${activityInfo.bgColor} ${activityInfo.color} text-xs mt-1.5 font-medium`}>
                {schedule.activityType.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Date & Time */}
            <div className="flex items-center gap-2 text-xs text-[#5D6E73]">
              <div className="w-6 h-6 bg-[#96AEC2]/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-[#546A7A]" />
              </div>
              <div>
                <p className="font-semibold text-[#546A7A]">{formatDate(schedule.scheduledDate)}</p>
                <p className="text-[#AEBFC3]0">{formatTime(schedule.scheduledDate)}</p>
              </div>
            </div>
            
            {/* Duration */}
            <div className="flex items-center gap-2 text-xs text-[#5D6E73]">
              <div className="w-6 h-6 bg-[#6F8A9D]/20 rounded-lg flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-[#546A7A]" />
              </div>
              <div>
                <p className="font-semibold text-[#546A7A]">{formatDuration(schedule.estimatedDuration)}</p>
                <p className="text-[#AEBFC3]0">Duration</p>
              </div>
            </div>
          </div>

          {/* Location */}
          {schedule.location && (
            <div className="flex items-center gap-2 text-xs text-[#5D6E73] mb-3 p-2 bg-white/60 rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-[#E17F70] flex-shrink-0" />
              <span className="truncate">{schedule.location}</span>
            </div>
          )}

          {/* Related Ticket */}
          {schedule.ticket && (
            <div className="flex items-center gap-2 text-xs text-[#546A7A] mb-3 p-2 bg-[#96AEC2]/10 rounded-lg border border-[#96AEC2]/30">
              <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate font-medium">
                Ticket #{schedule.ticket.id}: {schedule.ticket.title}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#92A2A5]/50">
            {isPending ? (
              <>
                <Button
                  onClick={() => handleAccept(schedule.id)}
                  disabled={isActioning}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-[#82A094] to-[#4F6A64] hover:from-[#4F6A64] hover:to-[#4F6A64] text-white rounded-xl shadow-md shadow-[#82A094]/20 h-10"
                >
                  {isActioning ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <ThumbsUp className="h-4 w-4 mr-1" />
                  )}
                  Accept
                </Button>
                <Button
                  onClick={() => openRejectDialog(schedule)}
                  disabled={isActioning}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-2 border-[#E17F70] text-[#9E3B47] hover:bg-[#E17F70]/10 hover:border-[#E17F70] rounded-xl h-10"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-[#4F6A64] text-xs font-medium">
                <CheckCircle className="h-4 w-4" />
                Accepted • Ready to start
              </div>
            )}
            
            <Button
              onClick={() => viewScheduleDetails(schedule)}
              variant="ghost"
              size="sm"
              className="text-[#AEBFC3]0 hover:text-[#5D6E73] hover:bg-[#AEBFC3]/20 rounded-xl"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-2xl flex items-center justify-center shadow-lg shadow-[#6F8A9D]/30">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#546A7A]">My Scheduled Activities</h2>
            <p className="text-sm text-[#AEBFC3]0">Quick view of your upcoming work</p>
          </div>
        </div>
        {(pendingSchedules.length > 0 || acceptedSchedules.length > 0) && (
          <div className="flex gap-4 text-sm">
            {pendingSchedules.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#CE9F6B]/20 rounded-full">
                <div className="w-2 h-2 bg-[#EEC1BF]/100 rounded-full animate-pulse" />
                <span className="font-semibold text-[#976E44]">{pendingSchedules.length} Pending</span>
              </div>
            )}
            {acceptedSchedules.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#A2B9AF]/20 rounded-full">
                <div className="w-2 h-2 bg-[#A2B9AF]/100 rounded-full" />
                <span className="font-semibold text-[#4F6A64]">{acceptedSchedules.length} Accepted</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#546A7A] rounded-full animate-spin border-t-[#546A7A]" />
            <Calendar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#546A7A]" />
          </div>
          <p className="text-[#5D6E73] mt-4 font-medium">Loading schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#AEBFC3]/20 to-gray-200 rounded-3xl flex items-center justify-center mb-4">
            <Calendar className="h-10 w-10 text-[#979796]" />
          </div>
          <h3 className="text-lg font-semibold text-[#5D6E73] mb-1">No Scheduled Activities</h3>
          <p className="text-[#AEBFC3]0 text-sm">You don't have any pending or accepted schedules</p>
        </div>
      ) : (
        <>
          {/* Pending Schedules */}
          {pendingSchedules.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#976E44]" />
                <h3 className="font-bold text-[#546A7A]">Needs Your Response</h3>
                <Badge className="bg-[#CE9F6B]/20 text-[#976E44]">{pendingSchedules.length}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingSchedules.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} isPending={true} />
                ))}
              </div>
            </div>
          )}

          {/* Accepted Schedules */}
          {acceptedSchedules.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#4F6A64]" />
                <h3 className="font-bold text-[#546A7A]">Ready to Start</h3>
                <Badge className="bg-[#A2B9AF]/20 text-[#4F6A64]">{acceptedSchedules.length}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {acceptedSchedules.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} isPending={false} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#E17F70] to-[#9E3B47] p-5">
            <DialogHeader className="p-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">Reject Schedule</DialogTitle>
                  <p className="text-white/70 text-sm">Please provide a reason</p>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <div className="p-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#5D6E73] block mb-2">Reason for rejection</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why you cannot accept this schedule..."
                className="min-h-[100px] rounded-xl border-2 focus:border-[#E17F70]"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedSchedule && handleReject(selectedSchedule.id)}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="flex-1 bg-[#E17F70]/100 hover:bg-[#9E3B47] text-white rounded-xl"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[85vh]">
          {selectedSchedule && (
            <>
              <div className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] p-5">
                <DialogHeader className="p-0">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                      {getActivityTypeInfo(selectedSchedule.activityType).icon}
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-xl font-bold text-white leading-tight">
                        {selectedSchedule.description || selectedSchedule.activityType.replace(/_/g, ' ')}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPriorityConfig(selectedSchedule.priority).color}>
                          {selectedSchedule.priority}
                        </Badge>
                        <Badge className="bg-white/20 text-white">
                          {selectedSchedule.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              
              <div className="p-5 space-y-6 overflow-y-auto max-h-[60vh]">
                {/* Schedule Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#96AEC2]/10 rounded-xl border border-[#96AEC2]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-[#546A7A]" />
                      <span className="text-sm font-medium text-[#546A7A]">Scheduled Date</span>
                    </div>
                    <p className="text-lg font-bold text-[#546A7A]">{formatDate(selectedSchedule.scheduledDate)}</p>
                    <p className="text-sm text-[#546A7A]">{formatTime(selectedSchedule.scheduledDate)}</p>
                  </div>
                  
                  <div className="p-4 bg-[#6F8A9D]/10 rounded-xl border border-[#6F8A9D]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-[#546A7A]" />
                      <span className="text-sm font-medium text-[#546A7A]">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-[#546A7A]">{formatDuration(selectedSchedule.estimatedDuration)}</p>
                    <p className="text-sm text-[#546A7A]">Estimated</p>
                  </div>
                </div>

                {/* Location */}
                {selectedSchedule.location && (
                  <div className="p-4 bg-[#AEBFC3]/10 rounded-xl border border-[#92A2A5]">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-[#E17F70]" />
                      <span className="text-sm font-medium text-[#5D6E73]">Location</span>
                    </div>
                    <p className="text-[#546A7A]">{selectedSchedule.location}</p>
                  </div>
                )}

                {/* Customer Details */}
                {(selectedSchedule.customer || selectedSchedule.ticket?.customer) && (
                  <div className="p-4 bg-gradient-to-br from-[#EEC1BF]/10 to-[#EEC1BF]/10 rounded-xl border border-[#CE9F6B]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#CE9F6B]/20 rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4 text-[#976E44]" />
                      </div>
                      <span className="text-sm font-bold text-[#976E44]">Customer Details</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-[#976E44] font-medium">Company Name</p>
                        <p className="text-[#976E44] font-semibold">
                          {selectedSchedule.customer?.companyName || selectedSchedule.ticket?.customer?.companyName}
                        </p>
                      </div>
                      {(selectedSchedule.customer?.address || selectedSchedule.ticket?.customer?.address) && (
                        <div>
                          <p className="text-xs text-[#976E44] font-medium">Address</p>
                          <p className="text-[#976E44] text-sm">
                            {selectedSchedule.customer?.address || selectedSchedule.ticket?.customer?.address}
                          </p>
                        </div>
                      )}
                      {selectedSchedule.ticket?.contact && (
                        <div className="pt-2 border-t border-[#CE9F6B] mt-2">
                          <p className="text-xs text-[#976E44] font-medium mb-1">Contact Person</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-[#976E44] font-medium">{selectedSchedule.ticket.contact.name}</p>
                            </div>
                            {selectedSchedule.ticket.contact.phone && (
                              <div>
                                <p className="text-[#976E44]">📞 {selectedSchedule.ticket.contact.phone}</p>
                              </div>
                            )}
                            {selectedSchedule.ticket.contact.email && (
                              <div className="col-span-2">
                                <p className="text-[#976E44] text-xs">✉️ {selectedSchedule.ticket.contact.email}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assets Details */}
                {((selectedSchedule.assets && selectedSchedule.assets.length > 0) || selectedSchedule.ticket?.asset) && (
                  <div className="p-4 bg-gradient-to-br from-[#82A094]/10 to-[#96AEC2]/10 rounded-xl border border-[#82A094]/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#82A094]/20 rounded-lg flex items-center justify-center">
                        <Layers className="h-4 w-4 text-[#4F6A64]" />
                      </div>
                      <span className="text-sm font-bold text-[#4F6A64]">
                        Assets / Equipment
                        {selectedSchedule.assets && selectedSchedule.assets.length > 0 && (
                          <Badge className="ml-2 bg-[#82A094]/20 text-[#4F6A64] text-xs">{selectedSchedule.assets.length}</Badge>
                        )}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {/* Assets from schedule */}
                      {selectedSchedule.assets && selectedSchedule.assets.map((asset: any, index: number) => (
                        <div key={asset.id || index} className="p-3 bg-white/70 rounded-lg border border-[#82A094]/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-[#4F6A64]">{asset.model || 'Unknown Model'}</p>
                              <p className="text-xs text-[#4F6A64] mt-0.5">Serial: {asset.serialNo || 'N/A'}</p>
                            </div>
                            <div className="w-10 h-10 bg-[#82A094]/20 rounded-lg flex items-center justify-center text-xl">
                              🔧
                            </div>
                          </div>
                          {asset.location && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-[#4F6A64]">
                              <MapPin className="h-3 w-3" />
                              <span>{asset.location}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Asset from ticket (if no schedule assets) */}
                      {(!selectedSchedule.assets || selectedSchedule.assets.length === 0) && selectedSchedule.ticket?.asset && (
                        <div className="p-3 bg-white/70 rounded-lg border border-[#82A094]/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-[#4F6A64]">{selectedSchedule.ticket.asset.model || 'Unknown Model'}</p>
                              <p className="text-xs text-[#4F6A64] mt-0.5">Serial: {selectedSchedule.ticket.asset.serialNo || 'N/A'}</p>
                            </div>
                            <div className="w-10 h-10 bg-[#82A094]/20 rounded-lg flex items-center justify-center text-xl">
                              🔧
                            </div>
                          </div>
                          {selectedSchedule.ticket.asset.location && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-[#4F6A64]">
                              <MapPin className="h-3 w-3" />
                              <span>{selectedSchedule.ticket.asset.location}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ticket Details */}
                {selectedSchedule.ticket && (
                  <div className="p-4 bg-[#96AEC2]/10 rounded-xl border border-[#96AEC2]">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="h-4 w-4 text-[#546A7A]" />
                      <span className="text-sm font-medium text-[#546A7A]">Related Ticket</span>
                    </div>
                    <p className="font-bold text-[#546A7A]">#{selectedSchedule.ticket.id}: {selectedSchedule.ticket.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-[#96AEC2]/20 text-[#546A7A] text-xs">{selectedSchedule.ticket.status}</Badge>
                      {selectedSchedule.ticket.priority && (
                        <Badge className={`${getPriorityConfig(selectedSchedule.ticket.priority).color} text-xs`}>
                          {selectedSchedule.ticket.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedSchedule.notes && (
                  <div className="p-4 bg-[#CE9F6B]/10 rounded-xl border border-[#CE9F6B]/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-[#976E44]">📝 Notes</span>
                    </div>
                    <p className="text-[#976E44] whitespace-pre-wrap">{selectedSchedule.notes}</p>
                  </div>
                )}

                {/* Action Buttons for Pending */}
                {selectedSchedule.status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => {
                        handleAccept(selectedSchedule.id);
                        setShowDetailDialog(false);
                      }}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-[#82A094] to-[#4F6A64] hover:from-[#4F6A64] hover:to-[#4F6A64] text-white rounded-xl h-12"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ThumbsUp className="h-5 w-5 mr-2" />}
                      Accept Schedule
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDetailDialog(false);
                        openRejectDialog(selectedSchedule);
                      }}
                      variant="outline"
                      className="flex-1 border-2 border-[#E17F70] text-[#9E3B47] hover:bg-[#E17F70]/10 rounded-xl h-12"
                    >
                      <ThumbsDown className="h-5 w-5 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
