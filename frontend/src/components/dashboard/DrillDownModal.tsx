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

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'open': 'bg-blue-100 text-blue-800',
    'assigned': 'bg-purple-100 text-purple-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'onsite_visit': 'bg-orange-100 text-orange-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-slate-100 text-slate-800',
    'cancelled': 'bg-red-100 text-red-800',
  };
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priority: string) => {
  const colors: { [key: string]: string } = {
    'critical': 'bg-red-100 text-red-800 border-red-300',
    'high': 'bg-orange-100 text-orange-800 border-orange-300',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'low': 'bg-green-100 text-green-800 border-green-300',
  };
  return colors[priority.toLowerCase()] || 'bg-gray-100 text-gray-800';
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
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="text-sm text-blue-600 font-medium">Total Tickets</div>
                <div className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="text-sm text-green-600 font-medium">Avg Response</div>
                <div className="text-3xl font-bold text-green-900 mt-1">
                  {formatDuration(stats.avgResponseTime)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="text-sm text-red-600 font-medium">Critical</div>
                <div className="text-3xl font-bold text-red-900 mt-1">{stats.critical}</div>
              </CardContent>
            </Card>
          </div>
        </DialogHeader>

        {/* Tickets List */}
        <div className="mt-6 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium">No tickets found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="hover:shadow-md transition-all duration-200 border-l-4"
                style={{
                  borderLeftColor: ticket.priority.toLowerCase() === 'critical' ? '#ef4444' : 
                                   ticket.priority.toLowerCase() === 'high' ? '#f59e0b' : '#3b82f6'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Link 
                          href={`/admin/tickets/${ticket.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate"
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
                      
                      <h4 className="font-medium text-slate-900 mb-3 line-clamp-2">
                        {ticket.title}
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {ticket.customerName && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{ticket.customerName}</span>
                          </div>
                        )}
                        {ticket.assignedTo && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{ticket.assignedTo}</span>
                          </div>
                        )}
                        {ticket.location && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{ticket.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {(ticket.responseTime || ticket.resolutionTime) && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                          {ticket.responseTime !== undefined && (
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span className="text-slate-600">Response: {formatDuration(ticket.responseTime)}</span>
                            </div>
                          )}
                          {ticket.resolutionTime !== undefined && (
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="w-3 h-3 text-green-500" />
                              <span className="text-slate-600">Resolution: {formatDuration(ticket.resolutionTime)}</span>
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
