"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ticket,
  Clock,
  Eye,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { getStatusColor, getPriorityColor } from "./utils";
import type { DashboardData } from "./types";

interface RecentTicketsProps {
  dashboardData: Partial<DashboardData>;
  loading: boolean;
}

export default function RecentTickets({ dashboardData, loading }: RecentTicketsProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to get the correct tickets route based on current path
  const getTicketsRoute = (ticketId?: string) => {
    const basePath = pathname.startsWith('/zone') 
      ? '/zone' 
      : pathname.startsWith('/service-person') 
        ? '/service-person' 
        : '/admin';
    
    return ticketId ? `${basePath}/tickets/${ticketId}` : `${basePath}/tickets`;
  };

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Recent Tickets
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">Latest support requests and critical issues requiring attention</CardDescription>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Badge className="bg-orange-100 text-orange-800 px-2 sm:px-3 py-1 text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Live Updates
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => router.push(getTicketsRoute())}
              className="flex items-center gap-2 text-xs sm:text-sm"
              size="sm"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View All Tickets</span>
              <span className="sm:hidden">View All</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading recent tickets...</span>
          </div>
        ) : dashboardData?.recentTickets?.length ? (
          <div className="space-y-4">
            {dashboardData.recentTickets.slice(0, 5).map((ticket) => (
              <div 
                key={ticket.id} 
                className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(getTicketsRoute(ticket.id.toString()))}
              >
                {/* Mobile Layout */}
                <div className="block sm:hidden space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate pr-2">{ticket.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {ticket.customer.companyName}
                        {ticket.asset && ` • ${ticket.asset.model}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={`${getPriorityColor(ticket.priority)} text-xs`} variant="outline">
                      {ticket.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-sm">{ticket.title}</h4>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ticket.customer.companyName}
                      {ticket.asset && ` • ${ticket.asset.model}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent tickets found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
