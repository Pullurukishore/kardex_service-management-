'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/axios';
import { Ticket, TicketStatus, Priority, TicketStats } from '@/types/ticket';
import { calculateTicketStats } from '@/lib/utils/ticketStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Users, Clock, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TicketClientProps {
  initialTickets: Ticket[];
  initialStats: TicketStats;
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  searchParams: {
    status?: string;
    priority?: string;
    search?: string;
    page?: string;
    limit?: string;
    view?: 'all' | 'unassigned' | 'assigned-to-zone' | 'assigned-to-service-person';
  };
  basePath?: string; // e.g., '/admin/tickets' or '/expert/tickets'
}

function getStatusBadgeVariant(status: TicketStatus) {
  switch (status) {
    case TicketStatus.OPEN:
      return 'default';
    case TicketStatus.ASSIGNED:
      return 'secondary';
    case TicketStatus.IN_PROGRESS:
      return 'default';
    case TicketStatus.ONSITE_VISIT_PLANNED:
      return 'outline';
    case TicketStatus.ONSITE_VISIT:
      return 'default';
    case TicketStatus.CLOSED_PENDING:
      return 'secondary';
    case TicketStatus.CLOSED:
      return 'secondary';
    case TicketStatus.SPARE_PARTS_NEEDED:
      return 'outline';
    case TicketStatus.SPARE_PARTS_BOOKED:
      return 'secondary';
    case TicketStatus.SPARE_PARTS_DELIVERED:
      return 'default';
    case TicketStatus.PO_NEEDED:
      return 'outline';
    case TicketStatus.PO_RECEIVED:
      return 'secondary';
    default:
      return 'outline';
  }
}

function getPriorityBadgeVariant(priority: Priority) {
  switch (priority) {
    case Priority.CRITICAL:
      return 'destructive';
    case Priority.HIGH:
      return 'default';
    case Priority.MEDIUM:
      return 'secondary';
    case Priority.LOW:
      return 'outline';
    default:
      return 'outline';
  }
}

const TicketClient = memo(function TicketClient({
  initialTickets,
  initialStats,
  initialPagination,
  searchParams,
  basePath = '/admin/tickets'
}: TicketClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [stats, setStats] = useState<TicketStats>(initialStats);
  const [pagination, setPagination] = useState(initialPagination);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const initialLoadComplete = useRef(false);
  const lastSearchParams = useRef<string>('');

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchTicketData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchParams.status) params.append('status', searchParams.status);
      if (searchParams.priority) params.append('priority', searchParams.priority);
      if (searchParams.search) params.append('search', searchParams.search);
      if (searchParams.page) params.append('page', searchParams.page);
      if (searchParams.limit) params.append('limit', searchParams.limit);
      if (searchParams.view && searchParams.view !== 'all') {
        params.append('view', searchParams.view);
      }

      const response = await api.get(`/tickets?${params.toString()}`);
      const ticketData = response.data?.data || [];
      const paginationData = response.data?.pagination || initialPagination;
      
      setTickets(ticketData);
      setPagination(paginationData);
      
      // Calculate stats using shared utility function
      const newStats = calculateTicketStats(ticketData);
      setStats(newStats);
      
      return true;
    } catch (err) {
      setError('Failed to load ticket data. Please try again.');
      toast.error('Failed to refresh ticket data');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [searchParams]);

  useEffect(() => {
    // Create a string representation of current search params
    const currentSearchParams = JSON.stringify(searchParams);
    
    // Only fetch data if search params have actually changed (not on initial mount)
    if (initialLoadComplete.current && currentSearchParams !== lastSearchParams.current) {
      fetchTicketData();
    } else if (!initialLoadComplete.current) {
      // Mark initial load as complete without fetching (we already have server-side data)
      initialLoadComplete.current = true;
    }
    
    // Update the last search params reference
    lastSearchParams.current = currentSearchParams;
  }, [searchParams, fetchTicketData]);

  const handleRefresh = useCallback(async () => {
    await fetchTicketData();
  }, [fetchTicketData]);

  // Memoize ticket count to prevent unnecessary recalculations
  const ticketCount = useMemo(() => tickets.length, [tickets.length]);

  // Memoize stats to prevent unnecessary recalculations
  const memoizedStats = useMemo(() => stats, [stats]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-[#96AEC2]/10 to-[#6F8A9D]/20 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E17F70]/20">
            <svg className="h-6 w-6 text-[#9E3B47]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-[#546A7A]">Failed to load tickets</h3>
          <p className="mt-1 text-sm text-[#AEBFC3]0">{error}</p>
          <div className="mt-6">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#6F8A9D] hover:bg-[#546A7A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96AEC2]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", isMobile ? "space-y-4" : "space-y-6")}>
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            "flex items-center gap-2 font-medium rounded-md touch-manipulation",
            isMobile ? "px-3 py-2 text-sm w-full justify-center" : "px-4 py-2 text-sm",
            isRefreshing 
              ? 'bg-[#92A2A5]/30 text-[#AEBFC3]0 cursor-not-allowed' 
              : 'bg-white text-[#5D6E73] hover:bg-[#AEBFC3]/10 border border-[#92A2A5]'
          )}
        >
          <RefreshCw className={cn(
            isRefreshing ? 'animate-spin' : '',
            isMobile ? "w-5 h-5" : "w-4 h-4"
          )} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile 
          ? "grid-cols-2 gap-3" 
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      )}>
        <Card className="bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 border-[#96AEC2] touch-manipulation">
          <CardContent className={isMobile ? "p-3" : "p-6"}>
            <div className={cn(
              "flex items-center justify-between",
              isMobile ? "flex-col gap-2" : "flex-row"
            )}>
              <div className={isMobile ? "text-center" : ""}>
                <p className={cn(
                  "font-medium text-[#546A7A]",
                  isMobile ? "text-xs" : "text-sm"
                )}>Total Tickets</p>
                <p className={cn(
                  "font-bold text-[#546A7A]",
                  isMobile ? "text-xl" : "text-2xl"
                )}>{memoizedStats.total}</p>
              </div>
              <div className={cn(
                "rounded-full bg-[#96AEC2]/100 flex items-center justify-center",
                isMobile ? "h-8 w-8" : "h-12 w-12"
              )}>
                <AlertCircle className={cn(
                  "text-white",
                  isMobile ? "h-4 w-4" : "h-6 w-6"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/20 border-[#A2B9AF] touch-manipulation">
          <CardContent className={isMobile ? "p-3" : "p-6"}>
            <div className={cn(
              "flex items-center justify-between",
              isMobile ? "flex-col gap-2" : "flex-row"
            )}>
              <div className={isMobile ? "text-center" : ""}>
                <p className={cn(
                  "font-medium text-[#4F6A64]",
                  isMobile ? "text-xs" : "text-sm"
                )}>Open</p>
                <p className={cn(
                  "font-bold text-[#4F6A64]",
                  isMobile ? "text-xl" : "text-2xl"
                )}>{memoizedStats.open}</p>
              </div>
              <div className={cn(
                "rounded-full bg-[#A2B9AF]/100 flex items-center justify-center",
                isMobile ? "h-8 w-8" : "h-12 w-12"
              )}>
                <Clock className={cn(
                  "text-white",
                  isMobile ? "h-4 w-4" : "h-6 w-6"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br from-yellow-50 to-yellow-100 border-[#CE9F6B] touch-manipulation",
          isMobile ? "col-span-2" : ""
        )}>
          <CardContent className={isMobile ? "p-3" : "p-6"}>
            <div className={cn(
              "flex items-center justify-between",
              isMobile ? "flex-col gap-2" : "flex-row"
            )}>
              <div className={isMobile ? "text-center" : ""}>
                <p className={cn(
                  "font-medium text-[#976E44]",
                  isMobile ? "text-xs" : "text-sm"
                )}>Assigned</p>
                <p className={cn(
                  "font-bold text-[#976E44]",
                  isMobile ? "text-xl" : "text-2xl"
                )}>{memoizedStats.assigned}</p>
              </div>
              <div className={cn(
                "rounded-full bg-[#EEC1BF]/100 flex items-center justify-center",
                isMobile ? "h-8 w-8" : "h-12 w-12"
              )}>
                <Users className={cn(
                  "text-white",
                  isMobile ? "h-4 w-4" : "h-6 w-6"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#6F8A9D]/10 to-[#6F8A9D]/20 border-[#6F8A9D] touch-manipulation">
          <CardContent className={isMobile ? "p-3" : "p-6"}>
            <div className={cn(
              "flex items-center justify-between",
              isMobile ? "flex-col gap-2" : "flex-row"
            )}>
              <div className={isMobile ? "text-center" : ""}>
                <p className={cn(
                  "font-medium text-[#546A7A]",
                  isMobile ? "text-xs" : "text-sm"
                )}>Closed</p>
                <p className={cn(
                  "font-bold text-[#546A7A]",
                  isMobile ? "text-xl" : "text-2xl"
                )}>{memoizedStats.closed}</p>
              </div>
              <div className={cn(
                "rounded-full bg-[#6F8A9D]/100 flex items-center justify-center",
                isMobile ? "h-8 w-8" : "h-12 w-12"
              )}>
                <CheckCircle className={cn(
                  "text-white",
                  isMobile ? "h-4 w-4" : "h-6 w-6"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#E17F70]/10 to-red-100 border-[#E17F70] touch-manipulation">
          <CardContent className={isMobile ? "p-3" : "p-6"}>
            <div className={cn(
              "flex items-center justify-between",
              isMobile ? "flex-col gap-2" : "flex-row"
            )}>
              <div className={isMobile ? "text-center" : ""}>
                <p className={cn(
                  "font-medium text-[#9E3B47]",
                  isMobile ? "text-xs" : "text-sm"
                )}>Critical</p>
                <p className={cn(
                  "font-bold text-[#75242D]",
                  isMobile ? "text-xl" : "text-2xl"
                )}>{memoizedStats.critical}</p>
              </div>
              <div className={cn(
                "rounded-full bg-[#E17F70]/100 flex items-center justify-center",
                isMobile ? "h-8 w-8" : "h-12 w-12"
              )}>
                <XCircle className={cn(
                  "text-white",
                  isMobile ? "h-4 w-4" : "h-6 w-6"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table/Cards */}
      <Card className="shadow-lg">
        <CardHeader className={cn(
          "bg-gradient-to-r from-[#96AEC2]/10 to-[#6F8A9D]/10 rounded-t-lg",
          isMobile ? "p-4" : "p-6"
        )}>
          <CardTitle className={cn(
            "text-[#546A7A] flex items-center gap-2",
            isMobile ? "text-lg" : "text-xl"
          )}>
            <AlertCircle className={cn(
              "text-[#546A7A]",
              isMobile ? "h-4 w-4" : "h-5 w-5"
            )} />
            Tickets ({ticketCount})
          </CardTitle>
          <CardDescription className={isMobile ? "text-sm" : ""}>
            Manage and track service tickets
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "p-4" : "p-0"}>
          {tickets.length === 0 ? (
            <div className={cn(
              "text-center",
              isMobile ? "py-8" : "py-12"
            )}>
              <div className={cn(
                "mx-auto rounded-full bg-gradient-to-br from-[#96AEC2]/20 to-[#6F8A9D]/20 flex items-center justify-center mb-4",
                isMobile ? "h-16 w-16" : "h-24 w-24"
              )}>
                <AlertCircle className={cn(
                  "text-[#6F8A9D]",
                  isMobile ? "h-8 w-8" : "h-12 w-12"
                )} />
              </div>
              <h3 className={cn(
                "font-semibold text-[#546A7A] mb-2",
                isMobile ? "text-base" : "text-lg"
              )}>No tickets found</h3>
              <p className={cn(
                "text-[#AEBFC3]0 mb-6",
                isMobile ? "text-sm" : ""
              )}>
                No tickets match your current filters.
              </p>
            </div>
          ) : isMobile ? (
            // Mobile Card Layout
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="border border-[#92A2A5] hover:shadow-md transition-shadow duration-200 touch-manipulation">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <Link href={`${basePath}/${ticket.id}/list`} className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] flex items-center justify-center text-white font-semibold text-xs hover:from-[#546A7A] hover:to-[#546A7A] transition-colors duration-200">
                          #{ticket.ticketNumber ?? ticket.id}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`${basePath}/${ticket.id}/list`} className="font-semibold text-[#546A7A] hover:text-[#546A7A] transition-colors duration-200 text-sm block truncate">
                            {ticket.title}
                          </Link>
                          <div className="text-xs text-[#AEBFC3]0 mt-1 line-clamp-2">
                            {ticket.description}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs">
                        {ticket.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="text-xs">
                        {ticket.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-[#AEBFC3]0">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Customer:</span>
                        <span>{ticket.customer?.companyName || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                        <span className="font-medium">Created:</span>
                        <span>{format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-[#AEBFC3]/30">
                      <Link href={`${basePath}/${ticket.id}/list`} className="block">
                        <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-[#92A2A5] shadow-sm text-sm font-medium rounded-md text-[#5D6E73] bg-white hover:bg-[#AEBFC3]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96AEC2] touch-manipulation">
                          <Eye className="h-4 w-4 mr-2" />
                          View Ticket
                        </button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop Table Layout
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#AEBFC3]/10">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73]">Ticket</th>
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73]">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73]">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73]">Priority</th>
                    <th className="text-left py-4 px-6 font-semibold text-[#5D6E73]">Created</th>
                    <th className="text-right py-4 px-6 font-semibold text-[#5D6E73]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gradient-to-r hover:from-[#96AEC2]/10/50 hover:to-[#6F8A9D]/10/50 transition-all duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Link href={`${basePath}/${ticket.id}/list`} className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] flex items-center justify-center text-white font-semibold hover:from-[#546A7A] hover:to-[#546A7A] transition-colors duration-200">
                            #{ticket.ticketNumber ?? ticket.id}
                          </Link>
                          <div>
                            <Link href={`${basePath}/${ticket.id}/list`} className="font-semibold text-[#546A7A] hover:text-[#546A7A] transition-colors duration-200">
                              {ticket.title}
                            </Link>
                            <div className="text-sm text-[#AEBFC3]0 max-w-xs truncate">
                              {ticket.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-[#546A7A]">
                          {ticket.customer?.companyName || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                          {ticket.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-[#5D6E73]">
                        {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link href={`${basePath}/${ticket.id}/list`}>
                          <button className="inline-flex items-center px-3 py-1 border border-[#92A2A5] shadow-sm text-sm leading-4 font-medium rounded-md text-[#5D6E73] bg-white hover:bg-[#AEBFC3]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96AEC2]">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <Card className="shadow-sm">
          <CardContent className={cn("flex items-center justify-between", isMobile ? "p-4 flex-col gap-4" : "p-6 flex-row")}>
            {/* Pagination Info */}
            <div className={cn("text-sm text-[#5D6E73]", isMobile ? "order-2" : "")}>
              Showing <span className="font-semibold text-[#546A7A]">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-semibold text-[#546A7A]">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of{' '}
              <span className="font-semibold text-[#546A7A]">{pagination.total}</span> tickets
            </div>

            {/* Pagination Buttons */}
            <div className={cn("flex items-center gap-2", isMobile ? "order-1 w-full justify-between" : "")}>
              {/* Previous Button */}
              <Link 
                href={`?${new URLSearchParams({ 
                  ...searchParams, 
                  page: (pagination.page - 1).toString() 
                }).toString()}`}
                className={cn(pagination.page === 1 ? "pointer-events-none opacity-50" : "")}
              >
                <button
                  disabled={pagination.page === 1}
                  className={cn(
                    "inline-flex items-center px-4 py-2 border border-[#92A2A5] text-sm font-medium rounded-md",
                    "bg-white text-[#5D6E73] hover:bg-[#AEBFC3]/10 disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96AEC2]",
                    isMobile ? "touch-manipulation min-h-[44px]" : ""
                  )}
                >
                  <ChevronLeft className={cn(isMobile ? "h-5 w-5" : "h-4 w-4 mr-2")} />
                  {!isMobile && "Previous"}
                </button>
              </Link>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNumber: number;
                  
                  // Show first page, current page context, and last page
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNumber = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = pagination.page - 2 + i;
                  }

                  const isCurrentPage = pageNumber === pagination.page;

                  return (
                    <Link 
                      key={pageNumber}
                      href={`?${new URLSearchParams({ 
                        ...searchParams, 
                        page: pageNumber.toString() 
                      }).toString()}`}
                      className={cn(isMobile && "hidden sm:block")}
                    >
                      <button
                        className={cn(
                          "inline-flex items-center justify-center w-10 h-10 border text-sm font-medium rounded-md",
                          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96AEC2]",
                          isCurrentPage
                            ? "bg-[#6F8A9D] text-white border-[#546A7A] hover:bg-[#546A7A]"
                            : "bg-white text-[#5D6E73] border-[#92A2A5] hover:bg-[#AEBFC3]/10"
                        )}
                      >
                        {pageNumber}
                      </button>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile: Simple Page Indicator */}
              {isMobile && (
                <div className="sm:hidden px-3 py-2 text-sm font-medium text-[#5D6E73] bg-[#AEBFC3]/20 rounded-md">
                  Page {pagination.page} / {pagination.totalPages}
                </div>
              )}

              {/* Next Button */}
              <Link 
                href={`?${new URLSearchParams({ 
                  ...searchParams, 
                  page: (pagination.page + 1).toString() 
                }).toString()}`}
                className={cn(pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "")}
              >
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  className={cn(
                    "inline-flex items-center px-4 py-2 border border-[#92A2A5] text-sm font-medium rounded-md",
                    "bg-white text-[#5D6E73] hover:bg-[#AEBFC3]/10 disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#96AEC2]",
                    isMobile ? "touch-manipulation min-h-[44px]" : ""
                  )}
                >
                  {!isMobile && "Next"}
                  <ChevronRight className={cn(isMobile ? "h-5 w-5" : "h-4 w-4 ml-2")} />
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

TicketClient.displayName = 'TicketClient';

export default TicketClient;
