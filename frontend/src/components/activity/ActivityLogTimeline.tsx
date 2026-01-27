'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Pencil,
  CreditCard,
  TrendingUp,
  Truck,
  MessageSquare,
  Package,
  User,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle,
  Calendar,
  UserPlus,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Activity types for tickets
type TicketActivityType = 
  | 'STATUS_CHANGE' 
  | 'NOTE' 
  | 'SCHEDULED' 
  | 'REPORT_UPLOADED' 
  | 'TICKET_CREATED' 
  | 'TICKET_UPDATED' 
  | 'TICKET_ASSIGNED'
  | 'TICKET_ESCALATED'
  | 'TICKET_CLOSED'
  | 'TICKET_REOPENED'
  | 'PO_REQUESTED'
  | 'PO_APPROVED'
  | 'COMMENT_ADDED'
  | string;

// Activity types for offers
type OfferActivityType =
  | 'AUDIT'
  | 'REMARK'
  | 'OFFER_CREATED'
  | 'OFFER_UPDATED'
  | 'STAGE_CHANGED'
  | 'OFFER_ASSIGNED'
  | 'OFFER_WON'
  | 'OFFER_LOST'
  | 'REMARK_ADDED'
  | string;

interface TicketActivity {
  id: string;
  type: TicketActivityType;
  description: string;
  data: Record<string, any>;
  user: { 
    id: number; 
    email: string; 
    name: string | null; 
    role: string | null 
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface OfferActivity {
  id: string;
  type: string;
  action: OfferActivityType;
  description: string;
  fieldName?: string;
  oldValue?: string | null;
  newValue?: string | null;
  data: Record<string, any>;
  performedBy: string | null;
  performedById: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
}

interface ActivityLogTimelineProps {
  entityType: 'ticket' | 'offer';
  activities: TicketActivity[] | OfferActivity[];
  loading?: boolean;
  onRefresh?: () => void;
  emptyMessage?: string;
}

// Get icon and color for different activity types
const getActivityConfig = (type: string, action?: string) => {
  const actionType = action || type;
  
  switch (actionType) {
    // Ticket activities
    case 'TICKET_CREATED':
    case 'OFFER_CREATED':
      return { icon: Plus, color: 'from-[#82A094] to-[#4F6A64]' };
    case 'TICKET_UPDATED':
    case 'OFFER_UPDATED':
      return { icon: Pencil, color: 'from-[#6F8A9D] to-[#546A7A]' };
    case 'STATUS_CHANGE':
    case 'STAGE_CHANGED':
      return { icon: TrendingUp, color: 'from-[#E17F70] to-[#9E3B47]' };
    case 'TICKET_ASSIGNED':
    case 'OFFER_ASSIGNED':
    case 'SCHEDULED':
      return { icon: UserPlus, color: 'from-[#CE9F6B] to-[#976E44]' };
    case 'NOTE':
    case 'REMARK':
    case 'REMARK_ADDED':
    case 'COMMENT_ADDED':
      return { icon: MessageSquare, color: 'from-[#CE9F6B] to-[#976E44]' };
    case 'REPORT_UPLOADED':
      return { icon: FileText, color: 'from-[#6F8A9D] to-[#546A7A]' };
    case 'TICKET_ESCALATED':
      return { icon: AlertCircle, color: 'from-[#E17F70] to-[#9E3B47]' };
    case 'TICKET_CLOSED':
    case 'OFFER_WON':
      return { icon: CheckCircle, color: 'from-[#82A094] to-[#4F6A64]' };
    case 'TICKET_REOPENED':
      return { icon: RefreshCw, color: 'from-[#CE9F6B] to-[#976E44]' };
    case 'OFFER_LOST':
      return { icon: XCircle, color: 'from-[#E17F70] to-[#9E3B47]' };
    case 'PO_REQUESTED':
    case 'PO_APPROVED':
      return { icon: CreditCard, color: 'from-[#CE9F6B] to-[#976E44]' };
    case 'DELIVERY_UPDATED':
      return { icon: Truck, color: 'from-[#96AEC2] to-[#6F8A9D]' };
    case 'INVOICE_IMPORTED':
      return { icon: Package, color: 'from-[#82A094] to-[#4F6A64]' };
    default:
      return { icon: Clock, color: 'from-[#AEBFC3] to-[#92A2A5]' };
  }
};

// Format date for display
const formatDateTime = (date: string | Date) => {
  const d = new Date(date);
  return {
    date: d.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }),
    time: d.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    relative: formatDistanceToNow(d, { addSuffix: true })
  };
};

export function ActivityLogTimeline({ 
  entityType,
  activities, 
  loading = false, 
  onRefresh,
  emptyMessage = 'No activity yet'
}: ActivityLogTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Check if activity has expandable content
  const hasExpandableContent = (activity: TicketActivity | OfferActivity) => {
    if (entityType === 'ticket') {
      const ticketActivity = activity as TicketActivity;
      return ticketActivity.data?.content || 
             ticketActivity.data?.notes || 
             ticketActivity.data?.location ||
             ticketActivity.data?.details ||
             ticketActivity.data?.metadata;
    } else {
      const offerActivity = activity as OfferActivity;
      return offerActivity.data?.remarks || 
             offerActivity.data?.details ||
             (offerActivity.fieldName && offerActivity.oldValue);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-[#6F8A9D] animate-spin" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-[#AEBFC3]/10 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10 text-[#AEBFC3]" />
        </div>
        <h3 className="text-lg font-semibold text-[#5D6E73] mb-2">{emptyMessage}</h3>
        <p className="text-[#92A2A5]">
          Activity will be recorded when changes are made.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#6F8A9D]/10">
            <Clock className="w-5 h-5 text-[#546A7A]" />
          </div>
          <div>
            <h3 className="font-bold text-[#546A7A]">Activity Log</h3>
            <p className="text-sm text-[#92A2A5]">
              Complete audit trail of all {entityType} activities
            </p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[#6F8A9D] hover:bg-[#6F8A9D]/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const isTicket = entityType === 'ticket';
          const ticketActivity = activity as TicketActivity;
          const offerActivity = activity as OfferActivity;
          
          const activityType = isTicket ? ticketActivity.type : offerActivity.action;
          const config = getActivityConfig(activityType);
          const ActionIcon = config.icon;
          const dateTime = formatDateTime(activity.createdAt);
          const isExpanded = expandedItems.has(activity.id);
          const canExpand = hasExpandableContent(activity);

          // Get performer name
          const performerName = isTicket 
            ? (ticketActivity.user?.name || ticketActivity.user?.email?.split('@')[0] || 'System')
            : (offerActivity.performedBy || 'System');

          return (
            <div key={activity.id} className="relative flex gap-4">
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-full bg-gradient-to-b from-[#AEBFC3]/50 to-transparent" />
              )}
              
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                <ActionIcon className="w-5 h-5 text-white" />
              </div>
              
              {/* Content */}
              <div 
                className={`flex-1 bg-white rounded-xl p-4 shadow-md border border-[#AEBFC3]/20 ${canExpand ? 'cursor-pointer hover:border-[#6F8A9D]/30 transition-colors' : ''}`}
                onClick={() => canExpand && toggleExpand(activity.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[#546A7A]">{activity.description}</p>
                    
                    {/* Field change indicator for offers */}
                    {!isTicket && offerActivity.fieldName && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-[#6F8A9D]/10 text-[#6F8A9D] px-2 py-0.5 rounded">
                          {offerActivity.fieldName}
                        </span>
                        {offerActivity.oldValue && offerActivity.newValue && (
                          <span className="text-xs text-[#92A2A5]">
                            {offerActivity.oldValue} → {offerActivity.newValue}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status badge for ticket status changes */}
                    {isTicket && ticketActivity.type === 'STATUS_CHANGE' && ticketActivity.data?.status && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-[#6F8A9D]/10 text-[#6F8A9D] px-2 py-0.5 rounded font-medium">
                          {ticketActivity.data.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right flex items-start gap-2">
                    <div>
                      <p className="text-xs text-[#92A2A5]">{dateTime.date}</p>
                      <p className="text-xs text-[#CE9F6B] font-medium">{dateTime.time}</p>
                    </div>
                    {canExpand && (
                      <div className="text-[#92A2A5] mt-0.5">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Performer info */}
                <div className="flex items-center gap-2 text-sm text-[#92A2A5]">
                  <User className="w-3.5 h-3.5" />
                  <span>{performerName}</span>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#AEBFC3]/20">
                    {/* Notes/Content for tickets */}
                    {isTicket && ticketActivity.data?.content && (
                      <div className="bg-[#F5F7F8] rounded-lg p-3 mb-3">
                        <p className="text-sm text-[#5D6E73] whitespace-pre-wrap">
                          {ticketActivity.data.content}
                        </p>
                      </div>
                    )}
                    
                    {isTicket && ticketActivity.data?.notes && ticketActivity.type !== 'STATUS_CHANGE' && (
                      <div className="bg-[#F5F7F8] rounded-lg p-3 mb-3">
                        <p className="text-sm text-[#5D6E73] whitespace-pre-wrap">
                          {ticketActivity.data.notes}
                        </p>
                      </div>
                    )}

                    {/* Remarks for offers */}
                    {!isTicket && offerActivity.data?.remarks && (
                      <div className="bg-[#F5F7F8] rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-[#546A7A] mb-1">Remarks:</p>
                        <p className="text-sm text-[#5D6E73] whitespace-pre-wrap">
                          {offerActivity.data.remarks}
                        </p>
                      </div>
                    )}

                    {/* Location info */}
                    {isTicket && ticketActivity.data?.location && (
                      <div className="flex items-start gap-2 text-sm mb-2">
                        <span className="text-[#92A2A5] min-w-[80px]">Location:</span>
                        <span className="text-[#5D6E73]">{ticketActivity.data.location}</span>
                      </div>
                    )}

                    {/* File info for reports */}
                    {isTicket && ticketActivity.data?.fileName && (
                      <div className="flex items-start gap-2 text-sm mb-2">
                        <span className="text-[#92A2A5] min-w-[80px]">File:</span>
                        <span className="text-[#5D6E73]">{ticketActivity.data.fileName}</span>
                        {ticketActivity.data.fileSize && (
                          <span className="text-[#92A2A5]">
                            ({Math.round(ticketActivity.data.fileSize / 1024)} KB)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Details for audit logs */}
                    {(ticketActivity as any).data?.details && typeof (ticketActivity as any).data.details === 'object' && (
                      <div className="bg-[#F5F7F8] rounded-lg p-3 text-sm">
                        <p className="font-medium text-[#546A7A] mb-2">Details:</p>
                        <div className="space-y-1">
                          {Object.entries((ticketActivity as any).data.details).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="text-[#92A2A5] min-w-[120px] capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="text-[#5D6E73]">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value || 'N/A')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Multiple field changes for offers */}
                    {!isTicket && offerActivity.data?.details?.changes && (
                      <div className="bg-[#F5F7F8] rounded-lg p-3 text-sm">
                        <p className="font-medium text-[#546A7A] mb-2">Changes:</p>
                        <div className="space-y-2">
                          {Object.entries(offerActivity.data.details.changes).map(([field, change]: [string, any]) => (
                            <div key={field} className="flex items-center gap-2">
                              <span className="text-[#92A2A5] capitalize min-w-[100px]">
                                {field.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="text-[#E17F70] line-through">
                                {String(change.from || 'N/A')}
                              </span>
                              <span className="text-[#92A2A5]">→</span>
                              <span className="text-[#82A094] font-medium">
                                {String(change.to || 'N/A')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityLogTimeline;
