"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ExternalLink, 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

interface TicketDetail {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  customerName?: string;
  assignedTo?: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
  responseTime?: number;
  resolutionTime?: number;
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  tickets: TicketDetail[];
  statusFilter?: string;
}

// Kardex Company Colors for status
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'open': 'bg-[#96AEC2]/20 text-[#546A7A]',         // Blue 1
    'assigned': 'bg-[#6F8A9D]/20 text-[#546A7A]',    // Blue 2
    'in_progress': 'bg-[#EEC18F]/20 text-[#976E44]', // Sand 1
    'onsite_visit': 'bg-[#CE9F6B]/20 text-[#976E44]', // Sand 2
    'resolved': 'bg-[#82A094]/20 text-[#4F6A64]',    // Green 2
    'closed': 'bg-[#979796]/20 text-[#757777]',      // Grey 3
    'cancelled': 'bg-[#E17F70]/20 text-[#9E3B47]',   // Red 1
  };
  return colors[status.toLowerCase()] || 'bg-[#979796]/20 text-[#757777]';
};

// Kardex Company Colors for priority
const getPriorityColor = (priority: string) => {
  const colors: { [key: string]: string } = {
    'critical': 'bg-[#9E3B47]/20 text-[#75242D] border-[#9E3B47]',  // Red 2
    'high': 'bg-[#E17F70]/20 text-[#9E3B47] border-[#E17F70]',      // Red 1
    'medium': 'bg-[#EEC18F]/20 text-[#976E44] border-[#EEC18F]',    // Sand 1
    'low': 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]',       // Green 1
  };
  return colors[priority.toLowerCase()] || 'bg-[#979796]/20 text-[#757777]';
};

const formatDuration = (minutes: number | undefined) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export default function DrillDownModal({ 
  isOpen, 
  onClose, 
  title, 
  description,
  tickets,
  statusFilter 
}: DrillDownModalProps) {

  const filteredTickets = statusFilter 
    ? tickets.filter(t => t.status.toLowerCase() === statusFilter.toLowerCase())
    : tickets;

  const stats = {
    total: filteredTickets.length,
    avgResponseTime: filteredTickets.reduce((sum, t) => sum + (t.responseTime || 0), 0) / filteredTickets.length,
    critical: filteredTickets.filter(t => t.priority.toLowerCase() === 'critical').length,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-base mt-2">
                  {description}
                </DialogDescription>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Stats - Kardex Colors */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="bg-[#96AEC2]/10 border-[#96AEC2]">
              <CardContent className="p-4">
                <div className="text-sm text-[#6F8A9D] font-medium">Total Tickets</div>
                <div className="text-3xl font-bold text-[#546A7A] mt-1">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#A2B9AF]/10 border-[#A2B9AF]">
              <CardContent className="p-4">
                <div className="text-sm text-[#82A094] font-medium">Avg Response</div>
                <div className="text-3xl font-bold text-[#4F6A64] mt-1">
                  {formatDuration(stats.avgResponseTime)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#E17F70]/10 border-[#E17F70]">
              <CardContent className="p-4">
                <div className="text-sm text-[#E17F70] font-medium">Critical</div>
                <div className="text-3xl font-bold text-[#9E3B47] mt-1">{stats.critical}</div>
              </CardContent>
            </Card>
          </div>
        </DialogHeader>

        {/* Tickets List */}
        <div className="mt-6 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-[#757777]">
              <p className="text-lg font-medium">No tickets found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="hover:shadow-md transition-all duration-200 border-l-4"
                style={{
                  borderLeftColor: ticket.priority.toLowerCase() === 'critical' ? '#9E3B47' : 
                                   ticket.priority.toLowerCase() === 'high' ? '#E17F70' : '#96AEC2'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Link 
                          href={`/admin/tickets/${ticket.id}`}
                          className="font-semibold text-[#6F8A9D] hover:text-[#546A7A] hover:underline truncate"
                        >
                          #{ticket.ticketNumber}
                        </Link>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                          {ticket.priority}
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium text-[#546A7A] mb-3 line-clamp-2">
                        {ticket.title}
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {ticket.customerName && (
                          <div className="flex items-center gap-2 text-[#5D6E73]">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{ticket.customerName}</span>
                          </div>
                        )}
                        {ticket.assignedTo && (
                          <div className="flex items-center gap-2 text-[#5D6E73]">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{ticket.assignedTo}</span>
                          </div>
                        )}
                        {ticket.location && (
                          <div className="flex items-center gap-2 text-[#5D6E73]">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{ticket.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[#5D6E73]">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {(ticket.responseTime || ticket.resolutionTime) && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#AEBFC3]/30">
                          {ticket.responseTime !== undefined && (
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="w-3 h-3 text-[#96AEC2]" />
                              <span className="text-[#5D6E73]">Response: {formatDuration(ticket.responseTime)}</span>
                            </div>
                          )}
                          {ticket.resolutionTime !== undefined && (
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="w-3 h-3 text-[#82A094]" />
                              <span className="text-[#5D6E73]">Resolution: {formatDuration(ticket.resolutionTime)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Link href={`/admin/tickets/${ticket.id}`}>
                      <Button variant="outline" size="sm" className="flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
