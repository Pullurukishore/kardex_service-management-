'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Ticket, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Building,
  Target,
  Award,
  RefreshCw,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { apiClient } from '@/lib/api/api-client';
import { toast } from 'sonner';

interface FSAData {
  overview: {
    customerName?: string;
    serviceZone?: string;
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    resolutionRate: number;
    avgResolutionTime: string;
    slaCompliance?: number;
  };
  distribution: {
    byStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    byPriority: Array<{
      priority: string;
      count: number;
      percentage: number;
    }>;
  };
  recentActivity: {
    tickets: Array<{
      id: number;
      ticketNumber?: number;
      title: string;
      status: string;
      priority: string;
      createdAt: string;
      assignedTo?: {
        id: number;
        name: string;
        email: string;
      };
      lastStatusChange: string;
    }>;
  };
}

interface ZoneFSAIntegrationProps {
  zoneDashboardData: any;
}

export default function ZoneFSAIntegration({ zoneDashboardData }: ZoneFSAIntegrationProps) {
  const [fsaData, setFsaData] = useState<FSAData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Kardex Company Colors for Charts
  const statusColors = {
    'OPEN': '#E17F70',     // Red 1
    'ASSIGNED': '#CE9F6B', // Sand 2
    'IN_PROGRESS': '#EEC18F', // Sand 1
    'RESOLVED': '#82A094', // Green 2
    'CLOSED': '#A2B9AF',   // Green 1
    'ON_HOLD': '#757777',  // Silver 1
    'ESCALATED': '#9E3B47' // Red 2
  };

  const priorityColors = {
    'LOW': '#A2B9AF',      // Green 1
    'MEDIUM': '#EEC18F',   // Sand 1
    'HIGH': '#CE9F6B',     // Sand 2
    'CRITICAL': '#E17F70'  // Red 1
  };

  const fetchFSAData = async (showSuccessMessage = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/fsa/dashboard?timeframe=${timeframe}`);
      
      if (response.success) {
        setFsaData(response.data.dashboard);
        
        if (showSuccessMessage) {
          toast.success('FSA data refreshed successfully');
        }
      } else {
        throw new Error(response.error || 'Failed to fetch FSA data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load FSA data');
      if (showSuccessMessage) {
        toast.error('Failed to load FSA data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFSAData();
  }, [timeframe]);

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'OPEN': 'bg-[#E17F70]/20 text-[#9E3B47] border-[#E17F70]/30',
      'ASSIGNED': 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]/30',
      'IN_PROGRESS': 'bg-[#EEC18F]/20 text-[#976E44] border-[#EEC18F]/30',
      'RESOLVED': 'bg-[#82A094]/20 text-[#4F6A64] border-[#82A094]/30',
      'CLOSED': 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]/30',
      'ON_HOLD': 'bg-[#979796]/20 text-[#757777] border-[#979796]/30',
      'ESCALATED': 'bg-[#9E3B47]/20 text-[#75242D] border-[#9E3B47]/30'
    };
    return colors[status] || 'bg-[#979796]/20 text-[#757777] border-[#979796]/30';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      'LOW': 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]/30',
      'MEDIUM': 'bg-[#EEC18F]/20 text-[#976E44] border-[#EEC18F]/30', 
      'HIGH': 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]/30',
      'CRITICAL': 'bg-[#E17F70]/20 text-[#9E3B47] border-[#E17F70]/30'
    };
    return colors[priority] || 'bg-[#979796]/20 text-[#757777] border-[#979796]/30';
  };

  const filteredTickets = fsaData?.recentActivity.tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  if (loading && !fsaData) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-[#96AEC2]" />
              <p className="text-[#5D6E73]">Loading FSA data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !fsaData) {
    return (
      <Card className="shadow-lg border-[#E17F70]">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-[#E17F70] mb-4" />
            <h3 className="text-lg font-semibold text-[#546A7A] mb-2">FSA Data Unavailable</h3>
            <p className="text-[#5D6E73] mb-4">{error}</p>
            <Button onClick={() => fetchFSAData(true)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          Field Service Analytics (FSA)
        </h2>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => fetchFSAData(true)}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {fsaData && (
        <>
          {/* FSA Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6F8A9D]">Total Tickets</p>
                    <p className="text-3xl font-bold text-[#546A7A]">{fsaData.overview.totalTickets}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#96AEC2] to-[#6F8A9D] rounded-xl">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#EEC18F]/10 to-[#E17F70]/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#CE9F6B]">Open Tickets</p>
                    <p className="text-3xl font-bold text-[#976E44]">{fsaData.overview.openTickets}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#EEC18F] to-[#E17F70] rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#A2B9AF]/10 to-[#82A094]/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#82A094]">Resolution Rate</p>
                    <p className="text-3xl font-bold text-[#4F6A64]">{fsaData.overview.resolutionRate}%</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#A2B9AF] to-[#82A094] rounded-xl">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#6F8A9D]/10 to-[#546A7A]/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6F8A9D]">Avg Resolution</p>
                    <p className="text-3xl font-bold text-[#546A7A]">{fsaData.overview.avgResolutionTime}h</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FSA Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white shadow-lg border-0">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#6F8A9D] data-[state=active]:text-white">
                <PieChart className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-[#6F8A9D] data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-[#6F8A9D] data-[state=active]:text-white">
                <Ticket className="h-4 w-4 mr-2" />
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-[#96AEC2] to-[#6F8A9D] text-white">
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {fsaData.distribution.byStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={fsaData.distribution.byStatus}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            nameKey="status"
                            label={(entry: any) => `${entry.status}: ${entry.percentage}%`}
                          >
                            {fsaData.distribution.byStatus.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={statusColors[entry.status as keyof typeof statusColors] || '#6b7280'} 
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-[#AEBFC3]0">
                        <div className="text-center">
                          <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No status data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-[#A2B9AF] to-[#82A094] text-white">
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Priority Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {fsaData.distribution.byPriority.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={fsaData.distribution.byPriority}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="priority" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {fsaData.distribution.byPriority.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={priorityColors[entry.priority as keyof typeof priorityColors] || '#6b7280'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-[#AEBFC3]0">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No priority data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-[#96AEC2]" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 rounded-xl">
                      <div className="text-2xl font-bold text-[#6F8A9D]">
                        {fsaData.overview.resolutionRate}%
                      </div>
                      <div className="text-sm text-[#546A7A] mt-1">Resolution Rate</div>
                      <Progress value={fsaData.overview.resolutionRate} className="mt-2" />
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-[#A2B9AF]/10 to-[#82A094]/20 rounded-xl">
                      <div className="text-2xl font-bold text-[#82A094]">
                        {fsaData.overview.slaCompliance || 0}%
                      </div>
                      <div className="text-sm text-[#4F6A64] mt-1">SLA Compliance</div>
                      <Progress value={fsaData.overview.slaCompliance || 0} className="mt-2" />
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-[#6F8A9D]/10 to-[#546A7A]/20 rounded-xl">
                      <div className="text-2xl font-bold text-[#6F8A9D]">
                        {fsaData.overview.avgResolutionTime}h
                      </div>
                      <div className="text-sm text-[#546A7A] mt-1">Avg Resolution Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Ticket className="h-5 w-5 mr-2 text-[#96AEC2]" />
                      Recent Tickets
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-48"
                      />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {filteredTickets.length === 0 ? (
                      <div className="text-center py-8 text-[#AEBFC3]0">
                        <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No tickets found matching your criteria</p>
                      </div>
                    ) : (
                        filteredTickets.slice(0, 10).map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between p-4 bg-[#AEBFC3]/10 rounded-lg hover:bg-[#AEBFC3]/20 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-sm font-mono text-[#AEBFC3]0">#{ticket.ticketNumber ?? ticket.id}</div>
                            <div>
                              <p className="font-semibold text-[#546A7A]">{ticket.title}</p>
                              <p className="text-sm text-[#5D6E73]">
                                {ticket.assignedTo ? `Assigned to ${ticket.assignedTo.name}` : 'Unassigned'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityBadgeColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <Badge className={getStatusBadgeColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
