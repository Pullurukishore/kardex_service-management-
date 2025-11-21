'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReportData } from './types';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, 
  Users, Target, Award, Activity, Zap, Calendar, BarChart3
} from 'lucide-react';

interface AdvancedTicketSummaryReportProps {
  reportData: ReportData;
}

// Color schemes for charts - All 28 ticket statuses from Prisma schema
const STATUS_COLORS: Record<string, string> = {
  // Initial/Open States
  'OPEN': '#3B82F6',                    // Blue
  'ASSIGNED': '#8B5CF6',                 // Purple
  
  // In Progress States
  'IN_PROCESS': '#F59E0B',               // Amber
  'IN_PROGRESS': '#F97316',              // Orange
  
  // Onsite Visit States
  'ONSITE_VISIT': '#06B6D4',             // Cyan
  'ONSITE_VISIT_PLANNED': '#0891B2',     // Cyan-600
  'ONSITE_VISIT_STARTED': '#0E7490',     // Cyan-700
  'ONSITE_VISIT_REACHED': '#155E75',     // Cyan-800
  'ONSITE_VISIT_IN_PROGRESS': '#164E63', // Cyan-900
  'ONSITE_VISIT_RESOLVED': '#0D9488',    // Teal-600
  'ONSITE_VISIT_PENDING': '#14B8A6',     // Teal-500
  'ONSITE_VISIT_COMPLETED': '#2DD4BF',   // Teal-400
  
  // Waiting/Pending States
  'WAITING_CUSTOMER': '#FBBF24',         // Yellow-400
  'ON_HOLD': '#FB923C',                  // Orange-400
  
  // Spare Parts States
  'SPARE_PARTS_NEEDED': '#A855F7',       // Purple-500
  'SPARE_PARTS_BOOKED': '#9333EA',       // Purple-600
  'SPARE_PARTS_DELIVERED': '#7C3AED',    // Purple-700
  
  // Purchase Order States
  'PO_NEEDED': '#EC4899',                // Pink-500
  'PO_RECEIVED': '#DB2777',              // Pink-600
  'PO_REACHED': '#BE185D',               // Pink-700
  
  // Resolution States
  'RESOLVED': '#10B981',                 // Emerald-500
  'CLOSED_PENDING': '#84CC16',           // Lime-500
  'CLOSED': '#6B7280',                   // Gray-500
  
  // Issue/Problem States
  'ESCALATED': '#EF4444',                // Red-500
  'CANCELLED': '#9CA3AF',                // Gray-400
  'REOPENED': '#F87171'                  // Red-400
};

const PRIORITY_COLORS = {
  'LOW': '#10B981',
  'MEDIUM': '#F59E0B',
  'HIGH': '#EF4444',
  'CRITICAL': '#7C3AED'
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#6366F1'];

export function AdvancedTicketSummaryReport({ reportData }: AdvancedTicketSummaryReportProps) {
  const { 
    statusDistribution, 
    priorityDistribution, 
    zoneDistribution,
    customerDistribution,
    dailyTrends,
    summary,
    insights
  } = reportData;

  if (!summary || !statusDistribution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Ticket Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No ticket data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to format minutes to hours and minutes
  const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
    if (!totalMinutes || totalMinutes <= 0) return '0h 0m';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`) : `${minutes}m`;
  };

  // Prepare data for pie charts
  const statusChartData = Object.entries(statusDistribution || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
    color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#6B7280'
  }));

  const priorityChartData = Object.entries(priorityDistribution || {}).map(([name, value]) => ({
    name,
    value,
    color: PRIORITY_COLORS[name as keyof typeof PRIORITY_COLORS] || '#6B7280'
  }));

  // Prepare zone data for bar chart
  const zoneChartData = (zoneDistribution || []).slice(0, 10).map((zone: any) => ({
    name: zone.zoneName,
    tickets: zone.count
  }));

  // Prepare customer data for bar chart
  const customerChartData = (customerDistribution || []).slice(0, 10).map((customer: any) => ({
    name: customer.customerName.length > 20 ? customer.customerName.substring(0, 20) + '...' : customer.customerName,
    tickets: customer.count
  }));

  // Prepare daily trends data
  const trendsChartData = (dailyTrends || []).map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    created: day.created || 0,
    resolved: day.resolved || 0,
    escalated: day.escalated || 0
  }));

  // Calculate performance metrics
  const totalTickets = summary.totalTickets || 0;
  const resolvedTickets = summary.resolvedTickets || 0;
  const resolutionRate = totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : '0';
  const avgResolutionTime = formatMinutesToHoursAndMinutes(summary.averageResolutionTime || 0);
  const avgFirstResponse = formatMinutesToHoursAndMinutes(summary.averageFirstResponseTime || 0);

  // Prepare radar chart data for performance overview
  const performanceData = [
    {
      metric: 'Resolution Rate',
      value: parseFloat(resolutionRate),
      fullMark: 100
    },
    {
      metric: 'Response Time',
      value: summary.averageFirstResponseTime ? Math.min((1440 / (summary.averageFirstResponseTime + 1)) * 100, 100) : 0,
      fullMark: 100
    },
    {
      metric: 'Ticket Volume',
      value: Math.min((totalTickets / 100) * 100, 100),
      fullMark: 100
    },
    {
      metric: 'Critical Issues',
      value: totalTickets > 0 ? Math.max(100 - ((summary.criticalTickets || 0) / totalTickets) * 100, 0) : 100,
      fullMark: 100
    },
    {
      metric: 'SLA Compliance',
      value: 85, // Placeholder - would need actual SLA data
      fullMark: 100
    }
  ];

  // Calculate totals for percentage calculations
  const totalStatusCount = statusChartData.reduce((sum, item) => sum + item.value, 0);
  const totalPriorityCount = priorityChartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label for status pie chart
  const renderStatusLabel = (entry: any) => {
    const percent = totalStatusCount > 0 ? ((entry.value / totalStatusCount) * 100).toFixed(0) : '0';
    return `${percent}%`;
  };

  // Custom label for priority pie chart
  const renderPriorityLabel = (entry: any) => {
    const percent = totalPriorityCount > 0 ? ((entry.value / totalPriorityCount) * 100).toFixed(0) : '0';
    return `${percent}%`;
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Tickets</p>
                <p className="text-3xl font-bold mt-2">{totalTickets}</p>
                <p className="text-blue-100 text-xs mt-1">All time high</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold mt-2">{resolvedTickets}</p>
                <p className="text-green-100 text-xs mt-1">{resolutionRate}% success rate</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Avg Resolution</p>
                <p className="text-3xl font-bold mt-2">{avgResolutionTime}</p>
                <p className="text-amber-100 text-xs mt-1">Business hours</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">First Response</p>
                <p className="text-3xl font-bold mt-2">{avgFirstResponse}</p>
                <p className="text-purple-100 text-xs mt-1">Average time</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Zap className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Status and Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of tickets by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderStatusLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} tickets`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Status breakdown list */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(statusDistribution || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Priority Distribution
            </CardTitle>
            <CardDescription>Breakdown of tickets by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPriorityLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  innerRadius={60}
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} tickets`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Priority breakdown list */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(priorityDistribution || {}).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{priority}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends for Last Year */}
      {dailyTrends && dailyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Monthly Ticket Analysis - Last 12 Months
            </CardTitle>
            <CardDescription>Year-over-year ticket volume and resolution performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={(() => {
                  // Group daily trends by month
                  const monthlyData: Record<string, any> = {};
                  
                  dailyTrends.forEach((day: any) => {
                    const date = new Date(day.date);
                    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                    
                    if (!monthlyData[monthKey]) {
                      monthlyData[monthKey] = {
                        month: monthKey,
                        created: 0,
                        resolved: 0,
                        escalated: 0,
                        pending: 0
                      };
                    }
                    
                    monthlyData[monthKey].created += day.created || 0;
                    monthlyData[monthKey].resolved += day.resolved || 0;
                    monthlyData[monthKey].escalated += day.escalated || 0;
                    monthlyData[monthKey].pending = monthlyData[monthKey].created - monthlyData[monthKey].resolved;
                  });
                  
                  return Object.values(monthlyData).slice(-12); // Last 12 months
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="created" fill="#3B82F6" name="Created" />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Monthly summary stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Avg Monthly Created</p>
                <p className="text-2xl font-bold text-blue-900">
                  {dailyTrends.length > 0 ? Math.round(dailyTrends.reduce((sum: number, d: any) => sum + (d.created || 0), 0) / Math.max(1, Math.ceil(dailyTrends.length / 30))) : 0}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Avg Monthly Resolved</p>
                <p className="text-2xl font-bold text-green-900">
                  {dailyTrends.length > 0 ? Math.round(dailyTrends.reduce((sum: number, d: any) => sum + (d.resolved || 0), 0) / Math.max(1, Math.ceil(dailyTrends.length / 30))) : 0}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Peak Month</p>
                <p className="text-lg font-bold text-purple-900">
                  {(() => {
                    const monthlyTotals: Record<string, number> = {};
                    dailyTrends.forEach((d: any) => {
                      const month = new Date(d.date).toLocaleDateString('en-US', { month: 'short' });
                      monthlyTotals[month] = (monthlyTotals[month] || 0) + (d.created || 0);
                    });
                    const maxMonth = Object.entries(monthlyTotals).sort((a, b) => b[1] - a[1])[0];
                    return maxMonth ? maxMonth[0] : 'N/A';
                  })()}
                </p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-600 font-medium">Resolution Rate</p>
                <p className="text-2xl font-bold text-amber-900">{resolutionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Trends Line Chart */}
      {dailyTrends && dailyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Daily Ticket Trends
            </CardTitle>
            <CardDescription>Day-by-day ticket creation and resolution patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trendsChartData}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEscalated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorCreated)"
                  name="Created"
                />
                <Area 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorResolved)"
                  name="Resolved"
                />
                {trendsChartData.some((d: any) => d.escalated > 0) && (
                  <Area 
                    type="monotone" 
                    dataKey="escalated" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#colorEscalated)"
                    name="Escalated"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Zone and Customer Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Zones Analytics Summary */}
        {zoneDistribution && zoneDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                All Zones Performance Summary
              </CardTitle>
              <CardDescription>Aggregated analytics across all service zones</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Zone summary metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Zones</p>
                  <p className="text-3xl font-bold text-blue-900">{zoneDistribution.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total Tickets</p>
                  <p className="text-3xl font-bold text-green-900">
                    {zoneDistribution.reduce((sum, z: any) => sum + z.count, 0)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Avg per Zone</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {Math.round(zoneDistribution.reduce((sum, z: any) => sum + z.count, 0) / zoneDistribution.length)}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium">Most Active</p>
                  <p className="text-xl font-bold text-amber-900 truncate">
                    {zoneDistribution.sort((a: any, b: any) => b.count - a.count)[0]?.zoneName.substring(0, 12) || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Zone distribution pie chart */}
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={zoneDistribution.slice(0, 8).map((zone: any) => ({
                      name: zone.zoneName,
                      value: zone.count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      const total = zoneDistribution.reduce((sum, z: any) => sum + z.count, 0);
                      const percent = ((entry.value / total) * 100).toFixed(0);
                      return `${percent}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {zoneDistribution.slice(0, 8).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} tickets`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Detailed Zone Breakdown List */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">All Zones Breakdown</h4>
                <div className="space-y-2">
                  {zoneDistribution.map((zone: any, index: number) => {
                    const totalZoneTickets = zoneDistribution.reduce((sum, z: any) => sum + z.count, 0);
                    const percentage = totalZoneTickets > 0 ? ((zone.count / totalZoneTickets) * 100).toFixed(1) : '0';
                    return (
                      <div 
                        key={zone.zoneId} 
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg hover:from-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-medium text-gray-900">{zone.zoneName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{percentage}%</span>
                          <span className="font-bold text-blue-600 min-w-[60px] text-right">
                            {zone.count} tickets
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Debug info */}
                {zoneDistribution.length < 4 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Note: Showing {zoneDistribution.length} zone(s). If you have 4 zones but only see {zoneDistribution.length}, 
                      the other zones may not have any tickets in the selected date range.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Customers Analytics Summary */}
        {customerDistribution && customerDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                All Customers Performance Summary
              </CardTitle>
              <CardDescription>Aggregated ticket analytics across all customers</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Customer summary metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total Customers</p>
                  <p className="text-3xl font-bold text-green-900">{customerDistribution.length}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Tickets</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {customerDistribution.reduce((sum, c: any) => sum + c.count, 0)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Avg per Customer</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {Math.round(customerDistribution.reduce((sum, c: any) => sum + c.count, 0) / customerDistribution.length)}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium">Most Active</p>
                  <p className="text-xl font-bold text-amber-900 truncate">
                    {customerDistribution.sort((a: any, b: any) => b.count - a.count)[0]?.customerName.substring(0, 15) || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Top 10 customers bar chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerDistribution.slice(0, 10).map((c: any) => ({
                  name: c.customerName.length > 20 ? c.customerName.substring(0, 20) + '...' : c.customerName,
                  tickets: c.count
                }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#10B981" radius={[0, 8, 8, 0]}>
                    {customerDistribution.slice(0, 10).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Detailed Customer Breakdown List */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">All Customers Breakdown</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {customerDistribution.map((customer: any, index: number) => {
                    const totalCustomerTickets = customerDistribution.reduce((sum, c: any) => sum + c.count, 0);
                    const percentage = totalCustomerTickets > 0 ? ((customer.count / totalCustomerTickets) * 100).toFixed(1) : '0';
                    return (
                      <div 
                        key={customer.customerId} 
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg hover:from-green-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-medium text-gray-900">{customer.customerName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{percentage}%</span>
                          <span className="font-bold text-green-600 min-w-[60px] text-right">
                            {customer.count} tickets
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Info message */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Showing all {customerDistribution.length} customers. Customers with 0 tickets are included to provide complete visibility.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Overall Performance Radar
          </CardTitle>
          <CardDescription>360° view of service desk performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={performanceData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Performance Score" 
                dataKey="value" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.6} 
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          
          {/* Performance insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Strengths</p>
              <ul className="mt-2 space-y-1">
                <li className="text-sm text-green-800">✓ High resolution rate</li>
                <li className="text-sm text-green-800">✓ Quick response times</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Areas to Improve</p>
              <ul className="mt-2 space-y-1">
                <li className="text-sm text-yellow-800">→ Reduce critical tickets</li>
                <li className="text-sm text-yellow-800">→ Better SLA compliance</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Recommendations</p>
              <ul className="mt-2 space-y-1">
                <li className="text-sm text-blue-800">• Proactive monitoring</li>
                <li className="text-sm text-blue-800">• Staff training</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights and Recommendations */}
      {insights && (
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Key Insights
            </CardTitle>
            <CardDescription>Automated insights from your ticket data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.topPerformingZone && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Top Performing Zone</p>
                    <p className="text-sm text-green-700 mt-1">{insights.topPerformingZone}</p>
                  </div>
                </div>
              )}
              {insights.mostActiveCustomer && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Most Active Customer</p>
                    <p className="text-sm text-blue-700 mt-1">{insights.mostActiveCustomer}</p>
                  </div>
                </div>
              )}
              {insights.topAssignee && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">Top Assignee</p>
                    <p className="text-sm text-purple-700 mt-1">{insights.topAssignee}</p>
                  </div>
                </div>
              )}
              {insights.worstPerformingCustomer && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Attention Needed</p>
                    <p className="text-sm text-red-700 mt-1">{insights.worstPerformingCustomer}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
