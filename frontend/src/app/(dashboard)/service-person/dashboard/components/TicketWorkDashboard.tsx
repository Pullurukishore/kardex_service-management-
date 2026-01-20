'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Ticket as TicketIcon, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  User,
  Building,
  Wrench,
  Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api/api-client';

interface Ticket {
  id: number;
  ticketNumber?: number;
  title: string;
  status: string;
  priority: string;
  customer: {
    companyName: string;
  };
  asset: {
    machineId: string;
    model?: string;
  };
  createdAt: string;
  slaDueAt?: string;
}

interface Activity {
  id: number;
  activityType: string;
  title: string;
  startTime: string;
}

interface Props {
  tickets: Ticket[];
  currentActivity: Activity;
  onEndActivity: (activityId: number) => void;
  onRefreshTickets: () => void;
  getCurrentLocation: () => Promise<{latitude: number; longitude: number; address?: string}>;
}

// Ticket status configurations (like zone user)
const TICKET_STATUS_CONFIG = {
  'ASSIGNED': {
    label: 'Assigned',
    color: 'bg-[#96AEC2]/20 text-[#546A7A] border-[#96AEC2]',
    icon: User,
    nextStatuses: ['IN_PROGRESS', 'ONSITE_VISIT_STARTED']
  },
  'IN_PROGRESS': {
    label: 'In Progress',
    color: 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]',
    icon: Clock,
    nextStatuses: ['ONSITE_VISIT_STARTED', 'RESOLVED', 'ON_HOLD']
  },
  'ONSITE_VISIT_STARTED': {
    label: 'Onsite Visit Started',
    color: 'bg-[#6F8A9D]/20 text-[#546A7A] border-[#6F8A9D]',
    icon: MapPin,
    nextStatuses: ['ONSITE_VISIT_REACHED']
  },
  'ONSITE_VISIT_REACHED': {
    label: 'Reached Customer',
    color: 'bg-[#546A7A]/20 text-[#546A7A] border-[#546A7A]',
    icon: CheckCircle,
    nextStatuses: ['ONSITE_VISIT_IN_PROGRESS']
  },
  'ONSITE_VISIT_IN_PROGRESS': {
    label: 'Working Onsite',
    color: 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]',
    icon: Wrench,
    nextStatuses: ['ONSITE_VISIT_RESOLVED']
  },
  'ONSITE_VISIT_RESOLVED': {
    label: 'Onsite Work Complete',
    color: 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]',
    icon: CheckCircle,
    nextStatuses: ['RESOLVED']
  },
  'RESOLVED': {
    label: 'Resolved',
    color: 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]',
    icon: CheckCircle,
    nextStatuses: ['CLOSED']
  },
  'CLOSED': {
    label: 'Closed',
    color: 'bg-[#AEBFC3]/20 text-[#546A7A] border-[#92A2A5]',
    icon: XCircle,
    nextStatuses: []
  }
};

const PRIORITY_CONFIG = {
  'CRITICAL': { label: 'Critical', color: 'bg-[#E17F70]/20 text-[#75242D]', icon: AlertTriangle },
  'HIGH': { label: 'High', color: 'bg-[#CE9F6B]/20 text-[#976E44]', icon: AlertTriangle },
  'MEDIUM': { label: 'Medium', color: 'bg-[#CE9F6B]/20 text-[#976E44]', icon: Clock },
  'LOW': { label: 'Low', color: 'bg-[#A2B9AF]/20 text-[#4F6A64]', icon: CheckCircle }
};

export default function TicketWorkDashboard({ 
  tickets, 
  currentActivity, 
  onEndActivity, 
  onRefreshTickets,
  getCurrentLocation 
}: Props) {
  // Hooks
  const { toast } = useToast();
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusComment, setStatusComment] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (slaDueAt?: string) => {
    if (!slaDueAt) return false;
    return new Date(slaDueAt) < new Date();
  };

  const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      
      // Get current location for status update
      const location = await getCurrentLocation();
      
      const updateData = {
        status: newStatus,
        comments: statusComment || `Status updated to ${newStatus}`,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          timestamp: new Date().toISOString()
        }
      };

      const response = await apiClient.patch(`/tickets/${ticketId}/status`, updateData);
      
      if (response.data) {
        setSelectedTicket(null);
        setStatusComment('');
        onRefreshTickets();
      }
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderTicketCard = (ticket: Ticket) => {
    const statusConfig = TICKET_STATUS_CONFIG[ticket.status as keyof typeof TICKET_STATUS_CONFIG];
    const priorityConfig = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG];
    const StatusIcon = statusConfig?.icon || TicketIcon;
    const PriorityIcon = priorityConfig?.icon || Clock;

    return (
      <div
        key={ticket.id}
        className="bg-white border border-[#92A2A5] rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedTicket(ticket)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TicketIcon className="w-5 h-5 text-[#5D6E73]" />
            <span className="font-semibold text-[#546A7A]">#{ticket.ticketNumber ?? ticket.id}</span>
            {isOverdue(ticket.slaDueAt) && (
              <span className="bg-[#E17F70]/20 text-[#75242D] text-xs px-2 py-1 rounded-full">
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig?.color}`}>
              <PriorityIcon className="w-3 h-3 mr-1" />
              {priorityConfig?.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-medium text-[#546A7A] mb-2 line-clamp-2">{ticket.title}</h3>

        {/* Customer & Asset */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-sm text-[#5D6E73]">
            <Building className="w-4 h-4 mr-2" />
            <span>{ticket.customer.companyName}</span>
          </div>
          <div className="flex items-center text-sm text-[#5D6E73]">
            <Wrench className="w-4 h-4 mr-2" />
            <span>{ticket.asset.machineId} {ticket.asset.model && `(${ticket.asset.model})`}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig?.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig?.label}
          </span>
          <div className="flex items-center text-xs text-[#AEBFC3]0">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(ticket.createdAt)}
          </div>
        </div>
      </div>
    );
  };

  const renderStatusUpdateModal = () => {
    if (!selectedTicket) return null;

    const statusConfig = TICKET_STATUS_CONFIG[selectedTicket.status as keyof typeof TICKET_STATUS_CONFIG];
    const nextStatuses = statusConfig?.nextStatuses || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-[#546A7A] mb-4">
            Update Ticket #{selectedTicket.id}
          </h3>
          
          <div className="mb-4">
            <p className="text-sm text-[#5D6E73] mb-2">{selectedTicket.title}</p>
            <p className="text-sm text-[#AEBFC3]0">
              Current Status: <span className="font-medium">{statusConfig?.label}</span>
            </p>
          </div>

          {nextStatuses.length > 0 ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5D6E73] mb-2">
                  Select New Status:
                </label>
                <div className="space-y-2">
                  {nextStatuses.map((status) => {
                    const config = TICKET_STATUS_CONFIG[status as keyof typeof TICKET_STATUS_CONFIG];
                    const Icon = config?.icon || TicketIcon;
                    
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedTicket.id, status)}
                        disabled={isUpdatingStatus}
                        className="w-full flex items-center p-3 border border-[#92A2A5] rounded-lg hover:bg-[#AEBFC3]/10 disabled:opacity-50 text-left"
                      >
                        <Icon className="w-5 h-5 mr-3 text-[#5D6E73]" />
                        <span className="font-medium">{config?.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#5D6E73] mb-2">
                  Comments (Optional):
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="w-full p-2 border border-[#92A2A5] rounded-lg text-sm"
                  rows={3}
                  placeholder="Add any comments about this status change..."
                />
              </div>
            </>
          ) : (
            <div className="mb-4 p-3 bg-[#AEBFC3]/10 rounded-lg">
              <p className="text-sm text-[#5D6E73]">
                This ticket is in final status. No further status changes available.
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSelectedTicket(null);
                setStatusComment('');
              }}
              className="flex-1 px-4 py-2 border border-[#92A2A5] rounded-lg text-[#5D6E73] hover:bg-[#AEBFC3]/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#546A7A]">Ticket Work Dashboard</h2>
            <p className="text-[#5D6E73]">Manage your assigned tickets</p>
          </div>
          <button
            onClick={() => onEndActivity(currentActivity.id)}
            className="bg-[#9E3B47] hover:bg-[#75242D] text-white px-4 py-2 rounded-lg font-semibold"
          >
            End Ticket Work
          </button>
        </div>

        {/* Current Activity Info */}
        <div className="bg-[#96AEC2]/10 border border-[#96AEC2] rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Wrench className="w-6 h-6 text-[#546A7A]" />
            <div>
              <h3 className="font-semibold text-[#546A7A]">Ticket Work Activity Active</h3>
              <p className="text-[#546A7A] text-sm">
                Started: {new Date(currentActivity.startTime).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map(renderTicketCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <TicketIcon className="w-12 h-12 text-[#979796] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#546A7A] mb-2">No Assigned Tickets</h3>
            <p className="text-[#5D6E73]">You don't have any tickets assigned to you at the moment.</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-[#AEBFC3]/10 border border-[#92A2A5] rounded-lg p-4">
          <h4 className="font-semibold text-[#546A7A] mb-2">Instructions:</h4>
          <ul className="text-sm text-[#5D6E73] space-y-1">
            <li>• Click on any ticket to update its status</li>
            <li>• Location is automatically captured with each status change</li>
            <li>• Follow the status progression: Assigned → In Progress → Onsite → Resolved</li>
            <li>• Add comments when updating status for better tracking</li>
          </ul>
        </div>
      </div>

      {/* Status Update Modal */}
      {renderStatusUpdateModal()}
    </div>
  );
}
