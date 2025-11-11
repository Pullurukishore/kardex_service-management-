"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, PieChart, TrendingUp, CheckCircle, Clock, AlertTriangle, BarChart3, Filter } from "lucide-react";
import { getStatusColor } from "./utils";
import type { DashboardData, StatusDistribution, TrendsData } from "./types";
import StatusPieChart from "./charts/StatusPieChart";
import TrendLineChart from "./charts/TrendLineChart";
import DrillDownModal from "./DrillDownModal";

interface AdvancedAnalyticsProps {
  dashboardData: Partial<DashboardData>;
  statusDistribution: StatusDistribution;
  ticketTrends: TrendsData;
  loading: boolean;
}

export default function AdvancedAnalytics({ 
  dashboardData, 
  statusDistribution, 
  ticketTrends, 
  loading 
}: AdvancedAnalyticsProps) {
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showClosedTickets, setShowClosedTickets] = useState(false);

  // Transform status distribution data for pie chart
  const statusChartData = useMemo(() => {
    if (!statusDistribution?.distribution?.length) return [];
    
    const colorMap: { [key: string]: string } = {
      // New/Initial States
      'open': '#0ea5e9',                        // Sky Blue - Fresh, new ticket
      'reopened': '#3b82f6',                    // Blue - Returned for attention
      
      // Assignment States
      'assigned': '#8b5cf6',                    // Purple - Assigned to technician
      
      // Work In Progress States
      'in_progress': '#f59e0b',                 // Amber - Active work
      'in_process': '#f59e0b',                  // Amber - Active work (alias)
      
      // Onsite Visit States (Orange family - urgent, field work)
      'onsite_visit': '#f97316',                // Orange - General onsite
      'onsite_visit_planned': '#fb923c',        // Light Orange - Planned visit
      'onsite_visit_started': '#ea580c',        // Deep Orange - Journey started
      'onsite_visit_reached': '#c2410c',        // Dark Orange - Arrived on site
      'onsite_visit_in_progress': '#f97316',    // Orange - Working on site
      'onsite_visit_resolved': '#16a34a',       // Green - Fixed on site
      'onsite_visit_pending': '#fdba74',        // Peach - Waiting on site
      'onsite_visit_completed': '#15803d',      // Dark Green - Completed on site
      
      // Spare Parts States (Teal/Cyan family - procurement)
      'spare_parts_needed': '#0891b2',          // Dark Cyan - Parts required
      'spare_parts_booked': '#06b6d4',          // Cyan - Parts ordered
      'spare_parts_delivered': '#14b8a6',       // Teal - Parts arrived
      
      // Purchase Order States (Blue-Gray family - procurement)
      'po_needed': '#0284c7',                   // Sky Blue - PO required
      'po_received': '#0369a1',                 // Deep Blue - PO approved
      'po_reached': '#075985',                  // Navy Blue - Items received
      
      // Waiting/Hold States (Pink/Rose family - paused)
      'waiting_customer': '#ec4899',            // Pink - Customer action needed
      'pending': '#d946ef',                     // Magenta - General pending
      'on_hold': '#db2777',                     // Rose - Temporarily paused
      
      // Escalation State
      'escalated': '#dc2626',                   // Red - High priority escalation
      
      // Completion States (Green family - positive)
      'resolved': '#10b981',                    // Emerald - Issue fixed
      'closed_pending': '#059669',              // Dark Emerald - Awaiting closure
      'closed': '#6366f1',                      // Indigo - Archived/Complete
      
      // Cancelled State
      'cancelled': '#ef4444',                   // Red - Stopped/Rejected
    };

    // Filter out only fully closed/cancelled tickets if toggle is off
    // Keep CLOSED_PENDING and ONSITE_VISIT_COMPLETED visible as they may need follow-up
    const isCompletedStatus = (status: string) => {
      const statusUpper = status.toUpperCase();
      const statusLower = status.toLowerCase();
      
      const completedPatterns = [
        'CLOSED',
        'CANCELLED'
      ];
      
      return completedPatterns.some(pattern => 
        statusUpper === pattern || 
        statusLower === pattern.toLowerCase()
      );
    };
    
    const filteredDistribution = showClosedTickets 
      ? statusDistribution.distribution
      : statusDistribution.distribution.filter(item => !isCompletedStatus(item.status));

    return filteredDistribution.map(item => ({
      status: item.status.replace('_', ' '),
      count: item.count,
      color: colorMap[item.status.toLowerCase()] || '#6b7280'
    }));
  }, [statusDistribution, showClosedTickets]);

  // Transform trends data for line chart
  const trendsChartData = useMemo(() => {
    if (!ticketTrends?.trends?.length) return [];
    return ticketTrends.trends.slice(-14).map(trend => ({
      date: trend.date,
      count: trend.count
    }));
  }, [ticketTrends]);

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    setDrillDownOpen(true);
  };

  // Mock ticket data for drill-down - in real app, this would come from API
  const mockTickets = dashboardData?.recentTickets?.slice(0, 10).map(ticket => ({
    id: String(ticket.id),
    ticketNumber: `TKT-${ticket.id}`,
    title: ticket.title || 'Untitled',
    status: ticket.status || 'open',
    priority: ticket.priority || 'medium',
    customerName: ticket.customer?.companyName,
    assignedTo: (ticket as any).assignedTo || undefined,
    location: (ticket as any).location || ticket.customer?.companyName,
    createdAt: ticket.createdAt || new Date().toISOString(),
    updatedAt: (ticket as any).updatedAt,
    responseTime: (ticket as any).responseTime,
    resolutionTime: (ticket as any).resolutionTime,
  })) || [];

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex-shrink-0">
                  <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="truncate">Advanced Analytics Dashboard</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                Comprehensive ticket analytics, trends, and performance insights
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Status Distribution</span>
                <span className="sm:hidden">Status</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Weekly Trends</span>
                <span className="sm:hidden">Trends</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Performance Metrics</span>
                <span className="sm:hidden">Performance</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="mt-6">
              <div className="space-y-4">
                {/* Filter Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        Show Archived Tickets
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {showClosedTickets ? 'Showing all ticket statuses' : 'Hiding closed & cancelled tickets only'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={showClosedTickets ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                      {showClosedTickets ? 'All Statuses' : 'Active Only'}
                    </Badge>
                    <Switch 
                      checked={showClosedTickets}
                      onCheckedChange={setShowClosedTickets}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : statusChartData.length === 0 && !showClosedTickets ? (
                  <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-green-50 rounded-full">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-slate-900">All Active Tickets Handled! 🎉</p>
                      <p className="text-sm text-slate-600 mt-2">No open, assigned, or in-progress tickets.</p>
                      <button
                        onClick={() => setShowClosedTickets(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Archived Tickets
                      </button>
                    </div>
                  </div>
                ) : statusDistribution?.distribution?.length ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StatusPieChart 
                      data={statusChartData}
                      title="Ticket Status Distribution"
                      onSegmentClick={handleStatusClick}
                    />
                    
                    <Card className="bg-white border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">Status Breakdown</CardTitle>
                        <CardDescription>Detailed ticket counts by status</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {statusChartData.map((chartItem, i) => {
                            // Find matching item from original distribution
                            const item = statusDistribution.distribution.find(
                              d => d.status.toLowerCase() === chartItem.status.toLowerCase().replace(' ', '_')
                            );
                            if (!item) return null;
                            const total = statusDistribution.distribution.reduce((sum, d) => sum + d.count, 0);
                            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                            const statusColor = statusChartData[i]?.color || '#6b7280';
                            return (
                              <div 
                                key={i} 
                                className="p-4 bg-white rounded-lg border-l-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
                                style={{ borderLeftColor: statusColor }}
                                onClick={() => handleStatusClick(item.status)}
                              >
                                {/* Hover gradient overlay */}
                                <div 
                                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                                  style={{ background: `linear-gradient(to right, ${statusColor}, transparent)` }}
                                />
                                
                                <div className="relative z-10">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <div 
                                        className="w-3 h-3 rounded-full shadow-md"
                                        style={{ backgroundColor: statusColor }}
                                      />
                                      <span className="font-semibold capitalize text-slate-800 group-hover:text-slate-900 transition-colors">
                                        {item.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <Badge 
                                      className="text-xs font-bold px-2 py-1"
                                      style={{ 
                                        backgroundColor: `${statusColor}20`,
                                        color: statusColor,
                                        border: `1px solid ${statusColor}40`
                                      }}
                                    >
                                      {percentage}%
                                    </Badge>
                                  </div>
                                  <div className="flex items-end justify-between mb-3">
                                    <span 
                                      className="text-3xl font-bold"
                                      style={{ color: statusColor }}
                                    >
                                      {item.count}
                                    </span>
                                    <span className="text-sm text-slate-500 font-medium">tickets</span>
                                  </div>
                                  <div className="relative">
                                    <Progress value={percentage} className="h-2.5" />
                                    <div 
                                      className="absolute top-0 left-0 h-2.5 rounded-full transition-all duration-500"
                                      style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: statusColor,
                                        boxShadow: `0 0 8px ${statusColor}60`
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">No status distribution data available</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="mt-6">
              <div className="space-y-6">
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : ticketTrends?.trends?.length ? (
                  <>
                    <TrendLineChart 
                      data={trendsChartData}
                      title="14-Day Ticket Volume Trends"
                      description="Visualizing ticket creation patterns over the last two weeks"
                      dataKey="count"
                      color="#3b82f6"
                      showArea={true}
                      showComparison={true}
                    />
                    
                    {/* Daily Breakdown Cards */}
                    <Card className="bg-white border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-blue-600" />
                              Last 7 Days Breakdown
                            </CardTitle>
                            <CardDescription className="mt-1">Daily ticket counts with peak analysis</CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-blue-100 text-blue-800">
                              {ticketTrends.trends.slice(-7).reduce((sum, t) => sum + t.count, 0)} Total
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              Avg: {Math.round(ticketTrends.trends.slice(-7).reduce((sum, t) => sum + t.count, 0) / 7)}/day
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                          {ticketTrends.trends.slice(-7).map((trend, i) => {
                            const maxCount = Math.max(...ticketTrends.trends.slice(-7).map(t => t.count));
                            const percentage = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
                            const isHighest = trend.count === maxCount;
                            return (
                              <div key={i} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${isHighest ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300' : 'bg-white'}`}>
                                <div className="text-center mb-3">
                                  <p className="text-xs font-medium text-slate-600 mb-1">
                                    {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                                <div className="text-center mb-3">
                                  <span className={`text-2xl font-bold ${isHighest ? 'text-blue-900' : 'text-slate-900'}`}>
                                    {trend.count}
                                  </span>
                                  {isHighest && <p className="text-xs text-blue-600 font-medium">Peak</p>}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${isHighest ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-slate-400 to-slate-500'}`}
                                    style={{ width: `${Math.max(10, percentage)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">No trends data available</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-green-800">SLA Compliance</span>
                    </div>
                    <Badge className={`${(dashboardData?.stats?.kpis?.slaCompliance?.value || 0) >= 95 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {(dashboardData?.stats?.kpis?.slaCompliance?.value || 0) >= 95 ? 'Excellent' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-green-900 mb-2">{dashboardData?.stats?.kpis?.slaCompliance?.value || 0}%</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Target: 95%</span>
                    <span className={`font-medium ${(dashboardData?.stats?.kpis?.slaCompliance?.value || 0) >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                      {(dashboardData?.stats?.kpis?.slaCompliance?.value || 0) >= 95 ? '✓ On Track' : '⚠ Below Target'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-blue-50 to-sky-100 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-blue-800">Response Time</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Average</Badge>
                  </div>
                  <p className="text-3xl font-bold text-blue-900 mb-2">{dashboardData?.stats?.kpis?.avgResponseTime?.value || 'N/A'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">Target: 2 hours</span>
                    <span className="text-blue-600 font-medium">Current Period</span>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border border-orange-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-orange-800">Unassigned</span>
                    </div>
                    <Badge className={`${(dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) > 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {(dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) > 5 ? 'High Priority' : 'Normal'}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-orange-900 mb-2">{dashboardData?.stats?.kpis?.unassignedTickets?.value || 0}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-600">Pending Assignment</span>
                    <span className={`font-medium ${(dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) > 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {(dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) > 5 ? '⚠ Action Needed' : '✓ Under Control'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Drill-Down Modal */}
      <DrillDownModal 
        isOpen={drillDownOpen}
        onClose={() => setDrillDownOpen(false)}
        title={selectedStatus ? `${selectedStatus.replace('_', ' ')} Tickets` : 'Ticket Details'}
        description={`Detailed view of all ${selectedStatus ? selectedStatus.replace('_', ' ').toLowerCase() : ''} tickets`}
        tickets={mockTickets}
        statusFilter={selectedStatus || undefined}
      />
    </div>
  );
}
