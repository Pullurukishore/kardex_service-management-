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
      bg: 'bg-[#CE9F6B]/10',
      text: 'text-[#976E44]',
      border: 'border-[#CE9F6B]/50',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: 'Open'
    },
    [TicketStatus.ASSIGNED]: {
      bg: 'bg-[#96AEC2]/10',
      text: 'text-[#546A7A]',
      border: 'border-[#96AEC2]',
      icon: <User className="h-3.5 w-3.5" />,
      label: 'Assigned'
    },
    [TicketStatus.IN_PROGRESS]: {
      bg: 'bg-[#546A7A]/10',
      text: 'text-[#546A7A]',
      border: 'border-[#546A7A]',
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: 'In Progress'
    },
    [TicketStatus.ONSITE_VISIT_PLANNED]: {
      bg: 'bg-[#6F8A9D]/10',
      text: 'text-[#546A7A]',
      border: 'border-[#6F8A9D]',
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: 'Visit Planned'
    },
    [TicketStatus.ONSITE_VISIT]: {
      bg: 'bg-[#6F8A9D]/10',
      text: 'text-[#546A7A]',
      border: 'border-[#6F8A9D]/50',
      icon: <Users className="h-3.5 w-3.5" />,
      label: 'Onsite Visit'
    },
    [TicketStatus.CLOSED_PENDING]: {
      bg: 'bg-[#AEBFC3]/10',
      text: 'text-[#5D6E73]',
      border: 'border-[#92A2A5]',
      icon: <Timer className="h-3.5 w-3.5" />,
      label: 'Pending Close'
    },
    [TicketStatus.CLOSED]: {
      bg: 'bg-[#82A094]/10',
      text: 'text-[#4F6A64]',
      border: 'border-[#82A094]/50',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: 'Closed'
    },
    [TicketStatus.SPARE_PARTS_NEEDED]: {
      bg: 'bg-[#CE9F6B]/10',
      text: 'text-[#976E44]',
      border: 'border-[#CE9F6B]',
      icon: <Wrench className="h-3.5 w-3.5" />,
      label: 'Parts Needed'
    },
    [TicketStatus.SPARE_PARTS_BOOKED]: {
      bg: 'bg-[#96AEC2]/10',
      text: 'text-[#546A7A]',
      border: 'border-[#96AEC2]/50',
      icon: <Wrench className="h-3.5 w-3.5" />,
      label: 'Parts Booked'
    },
    [TicketStatus.SPARE_PARTS_DELIVERED]: {
      bg: 'bg-[#82A094]/10',
      text: 'text-[#4F6A64]',
      border: 'border-[#82A094]/50',
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      label: 'Parts Delivered'
    },
    [TicketStatus.PO_NEEDED]: {
      bg: 'bg-[#EEC1BF]/10',
      text: 'text-[#9E3B47]',
      border: 'border-[#EEC1BF]/50',
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: 'PO Needed'
    },
    [TicketStatus.PO_REACHED]: {
      bg: 'bg-[#EEC1BF]/10',
      text: 'text-[#9E3B47]',
      border: 'border-[#EEC1BF]/50',
      icon: <ArrowUpRight className="h-3.5 w-3.5" />,
      label: 'PO Reached'
    },
    [TicketStatus.PO_RECEIVED]: {
      bg: 'bg-[#EEC1BF]/10',
      text: 'text-fuchsia-700',
      border: 'border-fuchsia-200',
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      label: 'PO Received'
    },
    [TicketStatus.CANCELLED]: {
      bg: 'bg-[#E17F70]/10',
      text: 'text-[#75242D]',
      border: 'border-[#E17F70]',
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: 'Cancelled'
    }
  };
  
  return configs[status] || {
    bg: 'bg-[#AEBFC3]/10',
    text: 'text-[#5D6E73]',
    border: 'border-[#92A2A5]',
    icon: <Clock className="h-3.5 w-3.5" />,
    label: status.replace(/_/g, ' ')
  };
}

// Enhanced priority configuration
function getPriorityConfig(priority: Priority) {
  const configs: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; glow: string }> = {
    [Priority.LOW]: {
      bg: 'bg-[#AEBFC3]/20',
      text: 'text-[#5D6E73]',
      border: 'border-[#92A2A5]',
      icon: null,
      glow: ''
    },
    [Priority.MEDIUM]: {
      bg: 'bg-[#96AEC2]/20',
      text: 'text-[#546A7A]',
      border: 'border-[#96AEC2]',
      icon: null,
      glow: ''
    },
    [Priority.HIGH]: {
      bg: 'bg-[#CE9F6B]/20',
      text: 'text-[#976E44]',
      border: 'border-[#CE9F6B]',
      icon: <AlertTriangle className="h-3 w-3" />,
      glow: 'shadow-sm shadow-orange-200'
    },
    [Priority.CRITICAL]: {
      bg: 'bg-[#E17F70]/20',
      text: 'text-[#75242D]',
      border: 'border-[#E17F70]',
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
        <div className="bg-gradient-to-r from-[#9E3B47] via-[#976E44] to-red-800 p-6 text-white relative">
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
              <p className="text-[#E17F70] text-sm">Created {format(new Date(ticket.createdAt), 'MMMM dd, yyyy \'at\' h:mm a')}</p>
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
            <h3 className="text-sm font-semibold text-[#AEBFC3]0 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-[#5D6E73] leading-relaxed bg-[#AEBFC3]/10 rounded-xl p-4 border border-[#AEBFC3]/30">
              {ticket.description || 'No description provided.'}
            </p>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer */}
            <div className="bg-gradient-to-br from-[#96AEC2]/10 to-[#6F8A9D]/10 rounded-xl p-4 border border-[#96AEC2]/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#96AEC2]/100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#546A7A] font-medium uppercase tracking-wide">Customer</p>
                  <p className="text-[#546A7A] font-semibold">{ticket.customer?.companyName || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Created Date */}
            <div className="bg-gradient-to-br from-[#A2B9AF]/10 to-[#82A094]/10 rounded-xl p-4 border border-[#A2B9AF]/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#82A094]/100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#4F6A64] font-medium uppercase tracking-wide">Created</p>
                  <p className="text-[#546A7A] font-semibold">{format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
            
            {/* Last Updated */}
            <div className="bg-gradient-to-br from-[#EEC1BF]/10 to-[#EEC1BF]/10 rounded-xl p-4 border border-[#EEC1BF]/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#CE9F6B]/100 flex items-center justify-center">
                  <Timer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#976E44] font-medium uppercase tracking-wide">Last Updated</p>
                  <p className="text-[#546A7A] font-semibold">
                    {formatDistanceToNow(new Date(ticket.updatedAt || ticket.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="border-t border-[#AEBFC3]/30 p-4 bg-[#AEBFC3]/10">
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
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] border-0 shadow-lg shadow-blue-200">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#96AEC2] text-sm font-medium">Total Tickets</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#CE9F6B] to-[#CE9F6B] border-0 shadow-lg shadow-[#CE9F6B]/50">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#EEC1BF] text-sm font-medium">Open</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.open || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] border-0 shadow-lg shadow-[#6F8A9D]/50">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#6F8A9D] text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.inProgress || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#82A094] to-[#82A094] border-0 shadow-lg shadow-[#A2B9AF]/50">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A2B9AF] text-sm font-medium">Closed</p>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-[#AEBFC3]/30">
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Your Support Tickets
            </CardTitle>
            <CardDescription className="text-[#AEBFC3]0 mt-1">
              Track the status of your support requests
            </CardDescription>
          </div>
          <button
            onClick={refreshTickets}
            disabled={loading}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm font-medium rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#92A2A5] disabled:opacity-50 transition-all duration-200 shadow-lg shadow-gray-300"
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
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-[#CE9F6B] rounded-3xl opacity-20 blur-xl animate-pulse"></div>
                <div className="relative h-full w-full bg-gradient-to-br from-[#AEBFC3]/20 to-gray-200 rounded-3xl flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-[#979796]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#546A7A] mb-2">No tickets found</h3>
              <p className="text-[#AEBFC3]0 max-w-sm mx-auto">
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
                    "border border-[#AEBFC3]/30 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden",
                    "hover:border-[#E17F70] hover:-translate-y-0.5"
                  )}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#E17F70] to-[#976E44] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-200 group-hover:shadow-red-300 transition-shadow duration-300">
                          #{ticket.ticketNumber ?? ticket.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#546A7A] text-sm truncate group-hover:text-[#9E3B47] transition-colors duration-200">
                            {ticket.title}
                          </div>
                          <div className="text-xs text-[#AEBFC3]0 mt-1 line-clamp-2">
                            {ticket.description}
                          </div>
                        </div>
                      </div>
                      <Eye className="h-5 w-5 text-[#979796] group-hover:text-[#E17F70] transition-colors duration-200" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-[#AEBFC3]0 pt-3 border-t border-[#AEBFC3]/20">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[#979796]" />
                        <span className="font-medium truncate max-w-[120px]">{ticket.customer?.companyName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#979796]" />
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
                  <tr className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#AEBFC3]/20 border-b border-[#92A2A5]">
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73] text-sm uppercase tracking-wider">Ticket</th>
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73] text-sm uppercase tracking-wider">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73] text-sm uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73] text-sm uppercase tracking-wider">Priority</th>
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73] text-sm uppercase tracking-wider">Created</th>
                    <th className="text-center py-4 px-6 font-semibold text-[#5D6E73] text-sm uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket, index) => (
                    <tr 
                      key={ticket.id} 
                      className={cn(
                        "group transition-all duration-200 hover:bg-gradient-to-r hover:from-[#E17F70]/10/50 hover:to-[#EEC1BF]/10/50",
                        index % 2 === 0 ? "bg-white" : "bg-[#AEBFC3]/10/50"
                      )}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#E17F70] to-[#976E44] flex items-center justify-center text-white font-bold shadow-lg shadow-red-200/50 group-hover:shadow-red-300/70 transition-shadow duration-300">
                            #{ticket.ticketNumber ?? ticket.id}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[#546A7A] group-hover:text-[#9E3B47] transition-colors duration-200 truncate max-w-[200px]">
                              {ticket.title}
                            </div>
                            <div className="text-sm text-[#AEBFC3]0 truncate max-w-[200px]">
                              {ticket.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-[#96AEC2]/20 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-[#546A7A]" />
                          </div>
                          <span className="text-sm text-[#5D6E73] font-medium truncate max-w-[120px]">
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
                        <div className="text-sm text-[#5D6E73] font-medium">
                          {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#E17F70] to-[#CE9F6B] text-white text-sm font-medium rounded-xl hover:from-[#9E3B47] hover:to-[#976E44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E17F70] transition-all duration-200 shadow-lg shadow-red-200/50 hover:shadow-red-300/70 group-hover:scale-105"
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
