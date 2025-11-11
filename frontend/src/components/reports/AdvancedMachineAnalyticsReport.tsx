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
  Users, Target, Award, Activity, Zap, Settings, BarChart3, Factory
} from 'lucide-react';

interface AdvancedMachineAnalyticsReportProps {
  reportData: ReportData;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#6366F1'];

export function AdvancedMachineAnalyticsReport({ reportData }: AdvancedMachineAnalyticsReportProps) {
  const { machineDowntime, summary } = reportData;

  if (!summary || !machineDowntime) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Machine Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No machine data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  const totalMachines = summary.totalMachines || 0;
  const totalMachinesWithIssues = summary.totalMachinesWithDowntime || 0;
  const totalMachinesWithoutIssues = summary.totalMachinesWithoutIssues || 0;
  const totalDowntimeHours = summary.totalDowntimeHours || 0;
  const avgDowntimePerMachine = summary.averageDowntimePerMachine || 0;
  const totalIncidents = summary.totalIncidents || machineDowntime.reduce((sum, m) => sum + (m.incidents || 0), 0);
  const totalOpenIncidents = summary.totalOpenIncidents || machineDowntime.reduce((sum, m) => sum + (m.openIncidents || 0), 0);
  const totalResolvedIncidents = summary.totalResolvedIncidents || machineDowntime.reduce((sum, m) => sum + (m.resolvedIncidents || 0), 0);
  const resolutionRate = totalIncidents > 0 ? ((totalResolvedIncidents / totalIncidents) * 100).toFixed(1) : '100';

  const machinesByCustomer = machineDowntime.reduce((acc: any, machine: any) => {
    const customerName = machine.customer || 'Unknown Customer';
    if (!acc[customerName]) acc[customerName] = [];
    acc[customerName].push(machine);
    return acc;
  }, {});

  const customerNames = Object.keys(machinesByCustomer).sort();
  const customerChartData = customerNames.map((customerName) => {
    const machines = machinesByCustomer[customerName];
    const totalDowntime = machines.reduce((sum: number, m: any) => sum + (m.totalDowntimeMinutes || 0), 0);
    return {
      name: customerName.length > 20 ? customerName.substring(0, 20) + '...' : customerName,
      fullName: customerName,
      value: totalDowntime,
      machineCount: machines.length
    };
  }).sort((a, b) => b.value - a.value);

  // Filter machines with issues for visualizations
  const machinesWithIssues = machineDowntime.filter(m => (m.incidents || 0) > 0);
  const machinesWithoutIssues = machineDowntime.filter(m => (m.incidents || 0) === 0);

  const downtimeRanges = [
    { range: '0h (No Issues)', min: 0, max: 0 },
    { range: '0-2h', min: 0.01, max: 120 }, 
    { range: '2-5h', min: 120, max: 300 },
    { range: '5-10h', min: 300, max: 600 }, 
    { range: '10-20h', min: 600, max: 1200 },
    { range: '20h+', min: 1200, max: Infinity }
  ];

  const downtimeDistribution = downtimeRanges.map((range, idx) => ({
    name: range.range,
    value: range.min === 0 && range.max === 0 
      ? machinesWithoutIssues.length
      : machineDowntime.filter(m => (m.totalDowntimeMinutes || 0) >= range.min && (m.totalDowntimeMinutes || 0) < range.max).length,
    color: CHART_COLORS[idx]
  })).filter(item => item.value > 0);

  const topMachines = [...machinesWithIssues]
    .sort((a, b) => (b.totalDowntimeMinutes || 0) - (a.totalDowntimeMinutes || 0))
    .slice(0, 10).map(m => ({
      name: `${m.model || 'N/A'} - ${m.serialNo?.substring(0, 8) || 'N/A'}`,
      fullName: `${m.model || 'N/A'} (${m.serialNo || 'N/A'})`,
      downtime: (m.totalDowntimeMinutes || 0) / 60,
      incidents: m.incidents || 0,
      customer: m.customer
    }));

  const healthScoreRanges = [
    { range: 'Excellent (0-1h)', min: 0, max: 60, count: 0 },
    { range: 'Good (1-3h)', min: 60, max: 180, count: 0 },
    { range: 'Fair (3-6h)', min: 180, max: 360, count: 0 },
    { range: 'Poor (6-12h)', min: 360, max: 720, count: 0 },
    { range: 'Critical (12h+)', min: 720, max: Infinity, count: 0 }
  ];

  machineDowntime.forEach(machine => {
    const downtime = machine.totalDowntimeMinutes || 0;
    const range = healthScoreRanges.find(r => downtime >= r.min && downtime < r.max);
    if (range) range.count++;
  });

  const healthScoreData = healthScoreRanges.filter(r => r.count > 0).map((r, idx) => ({
    name: r.range, value: r.count, color: CHART_COLORS[idx]
  }));

  const performanceData = [
    { metric: 'Uptime', value: Math.min(100 - (totalDowntimeHours / (totalMachines * 24 * 30) * 100), 100), fullMark: 100 },
    { metric: 'Resolution Rate', value: parseFloat(resolutionRate), fullMark: 100 },
    { metric: 'MTBF', value: totalIncidents > 0 ? Math.min((totalMachines * 24 * 30 / totalIncidents) * 2, 100) : 100, fullMark: 100 },
    { metric: 'Incident Response', value: totalOpenIncidents > 0 ? Math.max(100 - (totalOpenIncidents / totalIncidents * 100), 0) : 100, fullMark: 100 },
    { metric: 'Equipment Health', value: avgDowntimePerMachine > 0 ? Math.max(100 - (avgDowntimePerMachine / 24 * 100), 0) : 100, fullMark: 100 }
  ];

  const totalCustomerDowntime = customerChartData.reduce((sum, item) => sum + item.value, 0);
  const renderPercentageLabel = (entry: any, total: number) => {
    const percent = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0';
    return `${percent}%`;
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Machines</p>
                <p className="text-3xl font-bold mt-2">{totalMachines}</p>
                <p className="text-blue-100 text-xs mt-1">All assets tracked</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg"><Settings className="h-8 w-8" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Healthy</p>
                <p className="text-3xl font-bold mt-2">{totalMachinesWithoutIssues}</p>
                <p className="text-green-100 text-xs mt-1">No issues</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg"><CheckCircle className="h-8 w-8" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">With Issues</p>
                <p className="text-3xl font-bold mt-2">{totalMachinesWithIssues}</p>
                <p className="text-red-100 text-xs mt-1">{totalIncidents} incidents</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg"><AlertCircle className="h-8 w-8" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Total Downtime</p>
                <p className="text-3xl font-bold mt-2">{totalDowntimeHours.toFixed(1)}h</p>
                <p className="text-amber-100 text-xs mt-1">Business hours</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg"><Clock className="h-8 w-8" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Resolution Rate</p>
                <p className="text-3xl font-bold mt-2">{resolutionRate}%</p>
                <p className="text-purple-100 text-xs mt-1">{totalResolvedIncidents} resolved</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg"><Activity className="h-8 w-8" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Downtime Distribution and Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Downtime Distribution by Severity
            </CardTitle>
            <CardDescription>Breakdown of machines by total downtime hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={downtimeDistribution} cx="50%" cy="50%" labelLine={false}
                  label={(entry) => renderPercentageLabel(entry, machineDowntime.length)}
                  outerRadius={100} fill="#8884d8" dataKey="value">
                  {downtimeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} machines`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {downtimeDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Machine Health Distribution
            </CardTitle>
            <CardDescription>Health status based on downtime performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={healthScoreData} cx="50%" cy="50%" labelLine={false}
                  label={(entry) => renderPercentageLabel(entry, totalMachines)}
                  outerRadius={100} fill="#8884d8" dataKey="value" innerRadius={60}>
                  {healthScoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} machines`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {healthScoreData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="font-semibold text-gray-900">{item.value} machines</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Machines by Downtime */}
      {topMachines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Top 10 Machines by Downtime
            </CardTitle>
            <CardDescription>Machines requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topMachines} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: 'Downtime (hours)', position: 'insideBottom', offset: -5 }} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold">{data.fullName}</p>
                        <p className="text-sm text-gray-600">Customer: {data.customer}</p>
                        <p className="text-sm text-red-600">Downtime: {data.downtime.toFixed(1)} hours</p>
                        <p className="text-sm text-amber-600">Incidents: {data.incidents}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="downtime" fill="#EF4444" radius={[0, 8, 8, 0]}>
                  {topMachines.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Customer Performance */}
      {customerChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-blue-600" />
              Customer Downtime Analysis
            </CardTitle>
            <CardDescription>Total downtime hours by customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Customers</p>
                <p className="text-3xl font-bold text-blue-900">{customerNames.length}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Total Downtime</p>
                <p className="text-3xl font-bold text-red-900">{(totalCustomerDowntime / 60).toFixed(1)}h</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={customerChartData.slice(0, 8)} cx="50%" cy="50%" labelLine={false}
                  label={(entry) => renderPercentageLabel(entry, totalCustomerDowntime)}
                  outerRadius={100} fill="#8884d8" dataKey="value">
                  {customerChartData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${(value / 60).toFixed(1)} hours`, 'Downtime']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">All Customers Breakdown</h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {customerChartData.map((customer, index) => {
                  const percentage = totalCustomerDowntime > 0 ? ((customer.value / totalCustomerDowntime) * 100).toFixed(1) : '0';
                  return (
                    <div key={customer.fullName} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg hover:from-blue-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{customer.fullName}</span>
                          <span className="text-xs text-gray-500">{customer.machineCount} machines</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{percentage}%</span>
                        <span className="font-bold text-red-600 min-w-[80px] text-right">
                          {(customer.value / 60).toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Radar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Overall Machine Performance Metrics
          </CardTitle>
          <CardDescription>360° view of equipment performance and reliability</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={performanceData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Performance Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Strengths</p>
              <ul className="mt-2 space-y-1">
                <li className="text-sm text-green-800">✓ {totalMachinesWithoutIssues} machines running perfectly</li>
                <li className="text-sm text-green-800">✓ High resolution rate ({resolutionRate}%)</li>
                <li className="text-sm text-green-800">✓ {totalMachines} total assets tracked</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Areas to Improve</p>
              <ul className="mt-2 space-y-1">
                <li className="text-sm text-yellow-800">→ {totalMachinesWithIssues} machines need attention</li>
                {totalOpenIncidents > 0 && <li className="text-sm text-yellow-800">→ Close {totalOpenIncidents} open incidents</li>}
                {avgDowntimePerMachine > 0 && <li className="text-sm text-yellow-800">→ Reduce avg downtime ({avgDowntimePerMachine.toFixed(1)}h)</li>}
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Recommendations</p>
              <ul className="mt-2 space-y-1">
                <li className="text-sm text-blue-800">• Preventive maintenance schedule</li>
                <li className="text-sm text-blue-800">• Equipment health monitoring</li>
                <li className="text-sm text-blue-800">• Regular asset performance reviews</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="border-t-4 border-t-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Key Insights
          </CardTitle>
          <CardDescription>Automated insights from your machine performance data</CardDescription>
        </CardHeader>
        <CardContent>
          {topMachines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Highest Downtime Machine</p>
                  <p className="text-sm text-red-700 mt-1">
                    {topMachines[0].fullName} - {topMachines[0].downtime.toFixed(1)} hours
                  </p>
                </div>
              </div>
              {customerChartData.length > 0 && customerChartData[0].value > 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Factory className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Most Affected Customer</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {customerChartData[0].fullName} - {(customerChartData[0].value / 60).toFixed(1)} hours downtime
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Resolution Success</p>
                  <p className="text-sm text-green-700 mt-1">
                    {resolutionRate}% of incidents resolved successfully
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Fleet Health</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {totalMachinesWithoutIssues} of {totalMachines} machines ({((totalMachinesWithoutIssues / totalMachines) * 100).toFixed(1)}%) running perfectly
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Excellent Performance!</h3>
              <p className="text-green-700 mb-4">
                All {totalMachines} machines are operating optimally with no incidents reported in the selected period.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">{totalMachines}</p>
                  <p className="text-sm text-green-700">Total Machines</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">0</p>
                  <p className="text-sm text-blue-700">Incidents</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-900">100%</p>
                  <p className="text-sm text-purple-700">Uptime</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
