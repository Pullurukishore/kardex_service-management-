"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3,
  Activity,
  Database,
  Timer,
  Users,
  Building2,
  Ticket,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { formatNumber } from "./utils";
import type { DashboardData } from "./types";

interface PerformanceAnalyticsProps {
  dashboardData: Partial<DashboardData>;
  loading?: boolean;
}

export default function PerformanceAnalytics({ dashboardData }: PerformanceAnalyticsProps) {
  const overviewMetrics = [
    { 
      label: "Active Customers", 
      value: `${dashboardData?.stats?.kpis?.activeCustomers?.value || 0}`,
      subtitle: `of ${dashboardData?.adminStats?.totalCustomers || 0} total customers`,
      benchmark: "Customers with active tickets",
      performance: Math.round(((dashboardData?.stats?.kpis?.activeCustomers?.value || 0) / Math.max(1, dashboardData?.adminStats?.totalCustomers || 1)) * 100),
      trend: dashboardData?.stats?.kpis?.activeCustomers?.change || 0,
      isPositive: true,
      icon: Users,
      color: "from-[#6F8A9D] to-cyan-600",
      bgColor: "bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/10"
    },
    { 
      label: "Resource Utilization", 
      value: `${Math.round(((dashboardData?.stats?.kpis?.activeServicePersons?.value || 0) / Math.max(1, dashboardData?.adminStats?.totalServicePersons || 1)) * 100)}%`,
      subtitle: `${dashboardData?.stats?.kpis?.activeServicePersons?.value || 0} of ${dashboardData?.adminStats?.totalServicePersons || 0} technicians active`,
      benchmark: "Target: > 80%",
      performance: Math.round(((dashboardData?.stats?.kpis?.activeServicePersons?.value || 0) / Math.max(1, dashboardData?.adminStats?.totalServicePersons || 1)) * 100),
      trend: dashboardData?.stats?.kpis?.activeServicePersons?.change || 0,
      isPositive: true,
      icon: Users,
      color: "from-[#82A094] to-[#4F6A64]",
      bgColor: "bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/10"
    },
    { 
      label: "Total Customers", 
      value: `${dashboardData?.adminStats?.totalCustomers || 0}`,
      subtitle: `${dashboardData?.stats?.kpis?.activeCustomers?.value || 0} with active tickets`,
      benchmark: "Customer base",
      performance: Math.round(((dashboardData?.stats?.kpis?.activeCustomers?.value || 0) / Math.max(1, dashboardData?.adminStats?.totalCustomers || 1)) * 100),
      trend: 0,
      isPositive: true,
      icon: Building2,
      color: "from-[#6F8A9D] to-[#546A7A]",
      bgColor: "bg-gradient-to-br from-[#6F8A9D]/10 to-[#6F8A9D]/10"
    },
    { 
      label: "Workload Distribution", 
      value: `${dashboardData?.stats?.kpis?.totalTickets?.value || 0}`,
      subtitle: `${dashboardData?.stats?.kpis?.unassignedTickets?.value || 0} unassigned tickets`,
      benchmark: dashboardData?.adminStats?.zoneWiseTickets?.length 
        ? `Across ${dashboardData?.adminStats?.zoneWiseTickets?.length} zones`
        : "System-wide",
      performance: Math.max(0, 100 - ((dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) * 10)),
      trend: -(dashboardData?.stats?.kpis?.unassignedTickets?.value || 0),
      isPositive: (dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) < 5,
      icon: Ticket,
      color: "from-[#CE9F6B] to-red-600",
      bgColor: "bg-gradient-to-br from-[#EEC1BF]/10 to-[#E17F70]/10"
    }
  ];

  const currentPeriodMetrics = [
    {
      label: "Total Tickets",
      value: formatNumber(dashboardData?.stats?.kpis?.totalTickets?.value || 0),
      change: dashboardData?.stats?.kpis?.totalTickets?.change || "0%",
      isPositive: dashboardData?.stats?.kpis?.totalTickets?.isPositive !== false,
      icon: Ticket,
      color: "from-[#6F8A9D] to-cyan-600"
    },
    {
      label: "SLA Compliance",
      value: `${dashboardData?.stats?.kpis?.slaCompliance?.value || 0}%`,
      change: `${dashboardData?.stats?.kpis?.slaCompliance?.change || 0}%`,
      isPositive: (dashboardData?.stats?.kpis?.slaCompliance?.change || 0) >= 0,
      icon: Shield,
      color: "from-[#82A094] to-[#4F6A64]"
    },
    {
      label: "Active Customers",
      value: formatNumber(dashboardData?.stats?.kpis?.activeCustomers?.value || 0),
      change: `${dashboardData?.stats?.kpis?.activeCustomers?.change || 0}%`,
      isPositive: (dashboardData?.stats?.kpis?.activeCustomers?.change || 0) >= 0,
      icon: Building2,
      color: "from-[#6F8A9D] to-[#546A7A]"
    },
    {
      label: "Response Time",
      value: `${dashboardData?.stats?.kpis?.avgResponseTime?.value || 0} ${dashboardData?.stats?.kpis?.avgResponseTime?.unit || 'hrs'}`,
      change: `${dashboardData?.stats?.kpis?.avgResponseTime?.change || 0}%`,
      isPositive: (dashboardData?.stats?.kpis?.avgResponseTime?.change || 0) <= 0,
      icon: Timer,
      color: "from-[#CE9F6B] to-red-600"
    }
  ];

  const systemResources = [
    {
      label: "Service Zones",
      value: dashboardData?.adminStats?.totalServiceZones || 0,
      utilization: (dashboardData?.adminStats?.zoneWiseTickets || []).filter(z => z.totalTickets > 0).length,
      total: dashboardData?.adminStats?.totalServiceZones || 0,
      icon: MapPin,
      color: "from-[#6F8A9D] to-[#546A7A]"
    },
    {
      label: "Service Personnel",
      value: dashboardData?.adminStats?.totalServicePersons || 0,
      utilization: dashboardData?.stats?.kpis?.activeServicePersons?.value || 0,
      total: dashboardData?.adminStats?.totalServicePersons || 0,
      icon: Users,
      color: "from-[#82A094] to-[#4F6A64]"
    },
    {
      label: "Total Customers",
      value: formatNumber(dashboardData?.adminStats?.totalCustomers || 0),
      utilization: dashboardData?.stats?.kpis?.activeCustomers?.value || 0,
      total: dashboardData?.adminStats?.totalCustomers || 0,
      icon: Building2,
      color: "from-[#6F8A9D] to-[#546A7A]"
    },
    {
      label: "Unassigned Tickets",
      value: dashboardData?.stats?.kpis?.unassignedTickets?.value || 0,
      utilization: Math.max(0, 100 - ((dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) * 20)),
      total: 100,
      icon: AlertTriangle,
      color: (dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) > 5 ? "from-[#E17F70] to-[#9E3B47]" : "from-[#CE9F6B] to-[#976E44]"
    }
  ];

  const benchmarks = [
    {
      metric: "Response Time",
      current: ((dashboardData?.stats?.avgResponseTime?.hours || 0) * 60 + (dashboardData?.stats?.avgResponseTime?.minutes || 0)),
      target: 120,
      unit: "minutes",
      format: (val: number) => `${Math.floor(val / 60)}h ${val % 60}m`,
      isLowerBetter: true
    },
    {
      metric: "SLA Compliance",
      current: dashboardData?.stats?.kpis?.slaCompliance?.value || 0,
      target: 95,
      unit: "%",
      format: (val: number) => `${val}%`,
      isLowerBetter: false
    },
    {
      metric: "Resource Utilization",
      current: Math.round(((dashboardData?.stats?.kpis?.activeServicePersons?.value || 0) / Math.max(1, dashboardData?.adminStats?.totalServicePersons || 1)) * 100),
      target: 80,
      unit: "%",
      format: (val: number) => `${val}%`,
      isLowerBetter: false
    },
    {
      metric: "Unassigned Tickets",
      current: dashboardData?.stats?.kpis?.unassignedTickets?.value || 0,
      target: 5,
      unit: "tickets",
      format: (val: number) => `${val}`,
      isLowerBetter: true
    }
  ];

  return (
    <Card className="lg:col-span-2 bg-gradient-to-br from-white via-[#96AEC2]/10/30 to-[#6F8A9D]/10 border-0 shadow-xl">
      <CardHeader className="pb-6 bg-gradient-to-r from-[#546A7A]/5 to-[#546A7A]/5 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-3 bg-gradient-to-r from-[#546A7A] to-[#546A7A] rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-[#546A7A] via-[#546A7A] to-[#546A7A] bg-clip-text text-transparent">
                  Performance Analytics
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-[#A2B9AF]/20 text-[#4F6A64] text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Metrics
                  </Badge>
                  <Badge className="bg-[#96AEC2]/20 text-[#546A7A] text-xs">
                    <Database className="w-3 h-3 mr-1" />
                    Real-time
                  </Badge>
                </div>
              </div>
            </CardTitle>
            <CardDescription className="text-base mt-3 text-[#5D6E73]">
              Advanced business intelligence with predictive analytics and performance insights
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs sm:text-sm">Trends</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs sm:text-sm">Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {overviewMetrics.map((item, i) => (
                <div key={i} className={`${item.bgColor} rounded-2xl p-8 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${item.color} shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/90 text-[#5D6E73] border-0 shadow-sm">
                        <Activity className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                      {item.trend !== 0 && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          item.isPositive ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' : 'bg-[#E17F70]/20 text-[#75242D]'
                        }`}>
                          {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(item.trend)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#546A7A]">{item.label}</h3>
                    <p className="text-5xl font-bold text-[#546A7A] group-hover:scale-105 transition-transform duration-300">{item.value}</p>
                    <p className="text-sm text-[#5D6E73] font-medium">{item.subtitle}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-[#757777]">
                        <span>Performance Score</span>
                        <span>{item.performance}%</span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={item.performance} 
                          className="h-3 bg-white/50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-white/50">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#757777] font-medium">{item.benchmark}</p>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          item.performance >= 80 ? 'bg-[#82A094]/30 text-[#4F6A64]' :
                          item.performance >= 60 ? 'bg-[#CE9F6B]/30 text-[#976E44]' :
                          'bg-[#E17F70]/30 text-[#75242D]'
                        }`}>
                          {item.performance >= 80 ? 'Excellent' : item.performance >= 60 ? 'Good' : 'Needs Attention'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-[#96AEC2]/10 to-[#6F8A9D]/10 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#4F6A64]" />
                  Service Performance
                </h4>
                <ul className="space-y-1 text-sm text-[#5D6E73]">
                  {dashboardData?.stats?.kpis?.slaCompliance?.value !== undefined && dashboardData.stats.kpis.slaCompliance.value >= 95 && (
                    <li>• Excellent SLA compliance at {dashboardData.stats.kpis.slaCompliance.value}%</li>
                  )}
                  {dashboardData?.stats?.kpis?.avgResponseTime?.value && (
                    <li>• Average response time: {dashboardData.stats.kpis.avgResponseTime.value} {dashboardData.stats.kpis.avgResponseTime.unit || 'hrs'}</li>
                  )}
                  {dashboardData?.adminStats?.zoneWiseTickets?.map(zone => (
                    zone?.totalTickets > 0 && (
                      <li key={`zone-${zone.id}`}>• {zone.name}: {zone.totalTickets} active tickets</li>
                    )
                  ))}
                </ul>
              </div>
              {(dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) > 0 && (
                <div className="p-4 bg-gradient-to-r from-[#EEC1BF]/10 to-[#E17F70]/10 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#976E44]" />
                    Attention Required
                  </h4>
                  <ul className="space-y-1 text-sm text-[#5D6E73]">
                    <li>• {dashboardData?.stats?.kpis?.unassignedTickets?.value} unassigned tickets</li>
                    {dashboardData?.adminStats?.zoneWiseTickets?.some(z => z?.servicePersonCount === 0) && (
                      <li>• Some zones have no assigned service personnel</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="comparison" className="mt-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Period Performance */}
                <Card className="bg-gradient-to-br from-[#A2B9AF]/10 via-emerald-50 to-[#82A094]/10 border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold">
                        <div className="p-3 bg-gradient-to-r from-[#4F6A64] to-[#4F6A64] rounded-xl shadow-lg">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        Current Period
                      </CardTitle>
                      <Badge className="bg-[#A2B9AF]/20 text-[#4F6A64] px-3 py-1 shadow-sm">
                        <Activity className="w-4 h-4 mr-1" />
                        Live Data
                      </Badge>
                    </div>
                    <CardDescription className="text-base">Real-time performance metrics and KPIs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {currentPeriodMetrics.map((metric, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color} shadow-lg`}>
                              <metric.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#5D6E73]">{metric.label}</p>
                              <p className="text-2xl font-bold text-[#546A7A]">{metric.value}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            metric.isPositive ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' : 'bg-[#E17F70]/20 text-[#75242D]'
                          }`}>
                            {metric.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {metric.change}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Capacity & Resources */}
                <Card className="bg-gradient-to-br from-[#96AEC2]/10 via-[#6F8A9D]/10 to-[#6F8A9D]/10 border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold">
                        <div className="p-3 bg-gradient-to-r from-[#546A7A] to-[#546A7A] rounded-xl shadow-lg">
                          <Database className="w-6 h-6 text-white" />
                        </div>
                        System Capacity
                      </CardTitle>
                      <Badge className="bg-[#96AEC2]/20 text-[#546A7A] px-3 py-1 shadow-sm">
                        <Database className="w-4 h-4 mr-1" />
                        Infrastructure
                      </Badge>
                    </div>
                    <CardDescription className="text-base">Resource allocation and system utilization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {systemResources.map((resource, i) => (
                        <div key={i} className="p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${resource.color} shadow-lg`}>
                                <resource.icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#5D6E73]">{resource.label}</p>
                                <p className="text-xl font-bold text-[#546A7A]">{resource.value}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-[#757777]">Utilization</p>
                              <p className="text-sm font-semibold text-[#5D6E73]">
                                {typeof resource.utilization === 'number' && typeof resource.total === 'number' && resource.total > 0
                                  ? `${Math.round((resource.utilization / resource.total) * 100)}%`
                                  : '0%'}
                              </p>
                            </div>
                          </div>
                          <Progress 
                            value={typeof resource.utilization === 'number' && typeof resource.total === 'number' && resource.total > 0
                              ? Math.min(100, (resource.utilization / resource.total) * 100)
                              : 0} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-[#757777] mt-1">
                            <span>{resource.utilization} active</span>
                            <span>{resource.total} total</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Benchmarks */}
              <Card className="bg-gradient-to-br from-[#AEBFC3]/10 to-[#AEBFC3]/10 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="p-3 bg-gradient-to-r from-slate-600 to-gray-600 rounded-xl shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    Performance Benchmarks & Goals
                  </CardTitle>
                  <CardDescription className="text-base">Key performance indicators vs industry standards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benchmarks.map((benchmark, i) => {
                      const performance = benchmark.isLowerBetter 
                        ? benchmark.current <= benchmark.target
                        : benchmark.current >= benchmark.target;
                      const percentage = benchmark.isLowerBetter
                        ? Math.min(100, Math.max(0, ((benchmark.target - benchmark.current + benchmark.target) / benchmark.target) * 100))
                        : Math.min(100, (benchmark.current / benchmark.target) * 100);
                      
                      return (
                        <div key={i} className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-[#546A7A]">{benchmark.metric}</h4>
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                performance ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' : 'bg-[#E17F70]/20 text-[#75242D]'
                              }`}>
                                {performance ? '✓ Target Met' : '⚠ Below Target'}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-[#5D6E73]">Current:</span>
                                <span className="font-semibold">{benchmark.format(benchmark.current)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-[#5D6E73]">Target:</span>
                                <span className="font-semibold">{benchmark.format(benchmark.target)}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Progress value={percentage} className="h-3" />
                              <p className="text-xs text-[#757777] text-center">
                                Performance: {Math.round(percentage)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
