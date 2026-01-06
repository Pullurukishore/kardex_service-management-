'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Eye, X, Calendar, User, Building2, Wrench, ArrowUpRight, Sparkles, Timer, AlertTriangle, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/axios';
import { Ticket, TicketStatus, Priority } from '@/types/ticket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Client-side stats calculation
function calculateClientTicketStats(tickets: Ticket[]) {
  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
    inProgress: tickets.filter(t => 
      t.status === TicketStatus.IN_PROGRESS || 
      t.status === TicketStatus.ASSIGNED ||
      t.status === TicketStatus.ONSITE_VISIT_PLANNED ||
      t.status === TicketStatus.ONSITE_VISIT
    ).length,
    closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
  };
}

interface ExternalTicketClientProps {
  initialTickets: Ticket[];
  initialStats: any;
  searchParams: {
    status?: string;
    priority?: string;
    search?: string;
    page?: string;
    limit?: string;
    view?: string;
  };
}

// Enhanced status configuration with colors and icons
function getStatusConfig(status: TicketStatus) {
  const configs: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    [TicketStatus.OPEN]: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: 'Open'
    },
    [TicketStatus.ASSIGNED]: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <User className="h-3.5 w-3.5" />,
      label: 'Assigned'
    },
    [TicketStatus.IN_PROGRESS]: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: 'In Progress'
    },
    [TicketStatus.ONSITE_VISIT_PLANNED]: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: 'Visit Planned'
    },
    [TicketStatus.ONSITE_VISIT]: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
      icon: <Users className="h-3.5 w-3.5" />,
      label: 'Onsite Visit'
    },
    [TicketStatus.CLOSED_PENDING]: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <Timer className="h-3.5 w-3.5" />,
      label: 'Pending Close'
    },
    [TicketStatus.CLOSED]: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: 'Closed'
    },
    [TicketStatus.SPARE_PARTS_NEEDED]: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: <Wrench className="h-3.5 w-3.5" />,
      label: 'Parts Needed'
    },
    [TicketStatus.SPARE_PARTS_BOOKED]: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      icon: <Wrench className="h-3.5 w-3.5" />,
      label: 'Parts Booked'
    },
    [TicketStatus.SPARE_PARTS_DELIVERED]: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      label: 'Parts Delivered'
    },
    [TicketStatus.PO_NEEDED]: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: 'PO Needed'
    },
    [TicketStatus.PO_REACHED]: {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
      icon: <ArrowUpRight className="h-3.5 w-3.5" />,
      label: 'PO Reached'
    },
    [TicketStatus.PO_RECEIVED]: {
      bg: 'bg-fuchsia-50',
      text: 'text-fuchsia-700',
      border: 'border-fuchsia-200',
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      label: 'PO Received'
    },
    [TicketStatus.CANCELLED]: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: 'Cancelled'
    }
  };
  
  return configs[status] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: <Clock className="h-3.5 w-3.5" />,
    label: status.replace(/_/g, ' ')
  };
}

// Enhanced priority configuration
function getPriorityConfig(priority: Priority) {
  const configs: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; glow: string }> = {
    [Priority.LOW]: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: null,
      glow: ''
    },
    [Priority.MEDIUM]: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: null,
      glow: ''
    },
    [Priority.HIGH]: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300',
      icon: <AlertTriangle className="h-3 w-3" />,
      glow: 'shadow-sm shadow-orange-200'
    },
    [Priority.CRITICAL]: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      icon: <Zap className="h-3 w-3" />,
      glow: 'shadow-md shadow-red-200 animate-pulse'
    }
  };
  
  return configs[priority] || configs[Priority.MEDIUM];
}

// Status Badge Component
function StatusBadge({ status }: { status: TicketStatus }) {
  const config = getStatusConfig(status);
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200",
      config.bg,
      config.text,
      config.border
    )}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }: { priority: Priority }) {
  const config = getPriorityConfig(priority);
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
      config.bg,
      config.text,
      config.border,
      config.glow
    )}>
      {config.icon}
      <span>{priority}</span>
    </div>
  );
}

// Ticket Detail Modal Component
function TicketDetailModal({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const statusConfig = getStatusConfig(ticket.status);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
              #{ticket.ticketNumber ?? ticket.id}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{ticket.title}</h2>
              <p className="text-red-100 text-sm">Created {format(new Date(ticket.createdAt), 'MMMM dd, yyyy \'at\' h:mm a')}</p>
            </div>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Status & Priority Row */}
          <div className="flex flex-wrap gap-3 mb-6">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
              {ticket.description || 'No description provided.'}
            </p>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Customer</p>
                  <p className="text-gray-900 font-semibold">{ticket.customer?.companyName || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Created Date */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Created</p>
                  <p className="text-gray-900 font-semibold">{format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
            
            {/* Last Updated */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Timer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Last Updated</p>
                  <p className="text-gray-900 font-semibold">
                    {formatDistanceToNow(new Date(ticket.updatedAt || ticket.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg shadow-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExternalTicketClient({ initialTickets, initialStats, searchParams }: ExternalTicketClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const refreshTickets = async () => {
    try {
      setLoading(true);
      
      // Filter out empty string parameters to avoid validation errors
      const cleanParams: any = {};
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all') {
          cleanParams[key] = value;
        }
      });
      
      const response = await api.get('/tickets', { params: cleanParams });
      const ticketsData = response.data.data || [];
      const calculatedStats = calculateClientTicketStats(ticketsData);
      
      setTickets(ticketsData);
      setStats(calculatedStats);
      toast.success('Tickets refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards - Enhanced with glassmorphism effect */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg shadow-blue-200">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Tickets</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 border-0 shadow-lg shadow-amber-200">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Open</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.open || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 border-0 shadow-lg shadow-indigo-200">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.inProgress || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 border-0 shadow-lg shadow-emerald-200">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Closed</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.closed || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List - Enhanced with premium styling */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100">
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Your Support Tickets
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Track the status of your support requests
            </CardDescription>
          </div>
          <button
            onClick={refreshTickets}
            disabled={loading}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-medium rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-gray-300"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </button>
        </CardHeader>
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            // Enhanced Empty State
            <div className="text-center py-16 px-4">
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-500 rounded-3xl opacity-20 blur-xl animate-pulse"></div>
                <div className="relative h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                You haven't created any support tickets yet. Click "New Ticket" to submit a support request.
              </p>
            </div>
          ) : isMobile ? (
            // Mobile Card Layout - Enhanced
            <div className="p-4 space-y-4">
              {tickets.map((ticket, index) => (
                <Card 
                  key={ticket.id} 
                  className={cn(
                    "border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden",
                    "hover:border-red-200 hover:-translate-y-0.5"
                  )}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-200 group-hover:shadow-red-300 transition-shadow duration-300">
                          #{ticket.ticketNumber ?? ticket.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-red-600 transition-colors duration-200">
                            {ticket.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {ticket.description}
                          </div>
                        </div>
                      </div>
                      <Eye className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium truncate max-w-[120px]">{ticket.customer?.companyName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop Table Layout - Premium Enhanced
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Ticket</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Priority</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Created</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket, index) => (
                    <tr 
                      key={ticket.id} 
                      className={cn(
                        "group transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-orange-50/50",
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      )}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-200/50 group-hover:shadow-red-300/70 transition-shadow duration-300">
                            #{ticket.ticketNumber ?? ticket.id}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200 truncate max-w-[200px]">
                              {ticket.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {ticket.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700 font-medium truncate max-w-[120px]">
                            {ticket.customer?.companyName || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700 font-medium">
                          {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg shadow-red-200/50 hover:shadow-red-300/70 group-hover:scale-105"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </div>
  );
}
