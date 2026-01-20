"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  Clock, 
  AlertTriangle, 
  Loader2,
  Timer,
  Cpu,
  Award,
  Users,
  Building2,
  Zap,
  Wrench,
  MapPin,
  Navigation,
  Target
} from "lucide-react";
import { formatNumber, formatDuration } from "./utils";
import type { DashboardData } from "./types";

interface ExecutiveSummaryCardsProps {
  dashboardData: Partial<DashboardData>;
  loading?: boolean;
}

// Unique, non-overlapping metrics configuration
const getMetricsConfig = (dashboardData: Partial<DashboardData>) => {
  // GROUP 1: TICKET STATUS METRICS - Current state of tickets + SLA
  const ticketMetrics = [
    {
      title: "Open Tickets",
      value: formatNumber(dashboardData?.stats?.openTickets?.count ?? 0),
      change: Number(dashboardData?.stats?.openTickets?.change ?? 0),
      isPositive: (Number(dashboardData?.stats?.openTickets?.change ?? 0)) <= 0,
      icon: Ticket,
      description: 'Tickets awaiting action',
      gradient: 'from-[#6F8A9D] to-[#6F8A9D]',
      bgGradient: 'from-[#96AEC2]/10 to-[#96AEC2]/10',
      iconBg: 'bg-[#96AEC2]/100',
      category: 'status'
    },
    {
      title: 'Unassigned',
      value: formatNumber(dashboardData?.stats?.unassignedTickets?.count ?? 0),
      description: 'Needs assignment',
      critical: dashboardData?.stats?.unassignedTickets?.critical || false,
      gradient: dashboardData?.stats?.unassignedTickets?.critical 
        ? 'from-[#E17F70] to-[#CE9F6B]' 
        : 'from-[#AEBFC3]/100 to-gray-500',
      bgGradient: dashboardData?.stats?.unassignedTickets?.critical 
        ? 'from-[#EEC1BF]/10 to-[#EEC1BF]/10' 
        : 'from-[#AEBFC3]/10 to-[#AEBFC3]/10',
      iconBg: dashboardData?.stats?.unassignedTickets?.critical ? 'bg-[#EEC1BF]/100' : 'bg-[#AEBFC3]/100',
      icon: AlertTriangle,
      category: 'status'
    },
    {
      title: 'In Progress',
      value: formatNumber(dashboardData?.stats?.inProgressTickets?.count ?? 0),
      description: 'Being worked on',
      change: Number(dashboardData?.stats?.inProgressTickets?.change ?? 0),
      isPositive: true,
      gradient: 'from-[#CE9F6B] to-[#CE9F6B]',
      bgGradient: 'from-[#EEC1BF]/10 to-[#EEC1BF]/10',
      iconBg: 'bg-[#CE9F6B]/100',
      icon: Loader2,
      category: 'status'
    },
    {
      title: 'Monthly Tickets',
      value: formatNumber(dashboardData?.stats?.monthlyTickets?.count ?? 0),
      change: Number(dashboardData?.stats?.monthlyTickets?.change ?? 0),
      isPositive: true,
      icon: Target,
      gradient: 'from-[#6F8A9D] to-[#6F8A9D]',
      bgGradient: 'from-[#6F8A9D]/10 to-[#6F8A9D]/10',
      iconBg: 'bg-[#6F8A9D]',
      description: 'Created this month',
      category: 'volume'
    }
  ];

  // GROUP 2: TIME METRICS - All time-based measurements including Onsite Resolution
  const timeMetrics = [
    {
      title: 'Response Time',
      value: formatDuration(
        dashboardData?.stats?.avgResponseTime?.hours || 0, 
        dashboardData?.stats?.avgResponseTime?.minutes || 0
      ),
      description: 'Avg time to first response',
      change: Number(dashboardData?.stats?.avgResponseTime?.change ?? 0),
      isPositive: dashboardData?.stats?.avgResponseTime?.isPositive !== false,
      gradient: 'from-[#82A094] to-[#82A094]',
      bgGradient: 'from-[#A2B9AF]/10 to-[#82A094]/10',
      iconBg: 'bg-[#82A094]/100',
      icon: Clock,
      category: 'time'
    },
    {
      title: 'Resolution Time',
      // Business days are 8 hours each (not 24), so multiply days by 8
      value: formatDuration(
        (dashboardData?.stats?.avgResolutionTime?.days || 0) * 8 + (dashboardData?.stats?.avgResolutionTime?.hours || 0),
        dashboardData?.stats?.avgResolutionTime?.minutes || 0
      ),
      description: 'Avg time to resolve',
      change: Number(dashboardData?.stats?.avgResolutionTime?.change ?? 0),
      isPositive: dashboardData?.stats?.avgResolutionTime?.isPositive !== false,
      gradient: 'from-[#82A094] to-[#6F8A9D]',
      bgGradient: 'from-[#82A094]/10 to-[#96AEC2]/10',
      iconBg: 'bg-[#82A094]/100',
      icon: Timer,
      category: 'time'
    },
    {
      title: 'Machine Downtime',
      value: formatDuration(
        dashboardData?.stats?.avgDowntime?.hours || 0, 
        dashboardData?.stats?.avgDowntime?.minutes || 0
      ),
      change: Number(dashboardData?.stats?.avgDowntime?.change ?? 0),
      isPositive: dashboardData?.stats?.avgDowntime?.isPositive ?? false,
      gradient: 'from-[#E17F70] to-[#E17F70]',
      bgGradient: 'from-[#EEC1BF]/10 to-[#EEC1BF]/10',
      iconBg: 'bg-[#EEC1BF]/100',
      icon: Cpu,
      description: 'Avg equipment downtime',
      category: 'time'
    },
    {
      title: 'Travel Time',
      value: formatDuration(
        dashboardData?.stats?.avgTravelTime?.hours || 0,
        dashboardData?.stats?.avgTravelTime?.minutes || 0
      ),
      subtitle: "Total (going + returning)",
      change: dashboardData?.stats?.avgTravelTime?.change || 0,
      isPositive: dashboardData?.stats?.avgTravelTime?.isPositive !== false,
      icon: Navigation,
      gradient: "from-[#6F8A9D] to-[#6F8A9D]",
      bgGradient: "from-[#6F8A9D]/10 to-[#96AEC2]/10",
      iconBg: 'bg-[#546A7A]/100',
      description: 'Avg technician travel',
      category: 'time'
    },
    {
      title: 'Onsite Resolution',
      value: formatDuration(
        dashboardData?.stats?.avgOnsiteResolutionTime?.hours || 0,
        dashboardData?.stats?.avgOnsiteResolutionTime?.minutes || 0
      ),
      subtitle: "Onsite to resolved",
      change: dashboardData?.stats?.avgOnsiteResolutionTime?.change || 0,
      isPositive: dashboardData?.stats?.avgOnsiteResolutionTime?.isPositive !== false,
      icon: Wrench,
      gradient: "from-[#CE9F6B] to-[#CE9F6B]",
      bgGradient: "from-[#EEC1BF]/10 to-[#EEC1BF]/10",
      iconBg: 'bg-[#CE9F6B]/100',
      description: 'Avg onsite work duration',
      category: 'time'
    }
  ];

  // GROUP 3: RESOURCE METRICS - People and assets
  const resourceMetrics = [
    {
      title: 'Active Customers',
      value: formatNumber(dashboardData?.stats?.kpis?.activeCustomers?.value || 0),
      subtitle: `of ${formatNumber(dashboardData?.adminStats?.totalCustomers || 0)} total`,
      change: dashboardData?.stats?.kpis?.activeCustomers?.change || 0,
      isPositive: true,
      icon: Building2,
      gradient: "from-[#6F8A9D] to-[#6F8A9D]/100",
      bgGradient: "from-[#6F8A9D]/10 to-[#6F8A9D]/10",
      iconBg: 'bg-[#6F8A9D]/100',
      description: 'Customers with active tickets',
      category: 'resources'
    },
    {
      title: 'Active Technicians',
      value: formatNumber(dashboardData?.stats?.kpis?.activeServicePersons?.value || 0),
      subtitle: `of ${formatNumber(dashboardData?.adminStats?.totalServicePersons || 0)} total`,
      change: dashboardData?.stats?.kpis?.activeServicePersons?.change || 0,
      isPositive: true,
      icon: Users,
      gradient: "from-[#6F8A9D] to-[#6F8A9D]",
      bgGradient: "from-[#96AEC2]/10 to-[#96AEC2]/10",
      iconBg: 'bg-[#96AEC2]/100',
      description: 'Technicians on active tickets',
      category: 'resources'
    },
    {
      title: 'Service Zones',
      value: formatNumber(dashboardData?.adminStats?.totalServiceZones || 0),
      valueLabel: "zones",
      subtitle: `${dashboardData?.stats?.kpis?.activeServicePersons?.value || 0} active technicians`,
      icon: MapPin,
      gradient: "from-lime-500 to-[#82A094]",
      bgGradient: "from-lime-50 to-[#A2B9AF]/10",
      iconBg: 'bg-lime-500',
      description: 'Geographic coverage areas',
      category: 'resources'
    },
    {
      title: 'Active Machines',
      value: formatNumber(dashboardData?.stats?.activeMachines?.count ?? 0),
      change: Number(dashboardData?.stats?.activeMachines?.change ?? 0),
      isPositive: true,
      icon: Cpu,
      gradient: 'from-[#E17F70] to-[#E17F70]',
      bgGradient: 'from-fuchsia-50 to-[#EEC1BF]/10',
      iconBg: 'bg-[#E17F70]',
      description: 'Equipment in operation',
      category: 'resources'
    }
  ];

  return { ticketMetrics, timeMetrics, resourceMetrics };
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, iconGradient, badge }: { 
  icon: any; 
  title: string; 
  iconGradient: string;
  badge?: { label: string; color: string };
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-2">
    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
      <div className={`p-2 rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <span className="text-[#546A7A]">{title}</span>
    </h3>
    {badge && (
      <Badge className={`${badge.color} px-3 py-1 text-xs font-semibold`}>
        <Zap className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    )}
  </div>
);

// Metric Card Component - Premium white design with colorful accents
const MetricCard = ({ metric, index }: { metric: any; index: number }) => (
  <Card 
    className={`relative overflow-hidden bg-white/95 backdrop-blur-sm border border-[#96AEC2]/20 shadow-lg hover:shadow-xl hover:shadow-[#96AEC2]/15 transition-all duration-500 transform hover:-translate-y-1 hover:border-[#6F8A9D]/30 group rounded-2xl`}
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {/* Shimmer effect on hover */}
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    
    {/* Top accent line */}
    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
    
    {/* Background decoration */}
    <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br ${metric.gradient} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
    
    <CardContent className="relative z-10 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0 flex-1">
          {/* Title */}
          <p className="text-xs sm:text-sm font-semibold text-[#5D6E73] leading-tight">
            {metric.title}
          </p>
          
          {/* Main Value */}
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-[#546A7A] tracking-tight">
              {metric.value}
            </p>
            {metric.valueLabel && (
              <span className="text-xs font-medium text-[#92A2A5]">{metric.valueLabel}</span>
            )}
          </div>
          
          {/* Description or Subtitle */}
          <p className="text-xs text-[#92A2A5] leading-tight">
            {metric.subtitle || metric.description}
          </p>
          
          {/* Critical Badge for Unassigned */}
          {metric.critical && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E17F70]/10 text-[#9E3B47] text-xs font-semibold border border-[#E17F70]/20">
              <AlertTriangle className="w-3 h-3" />
              Needs Attention
            </div>
          )}
        </div>
        
        {/* Icon Badge */}
        <div className="relative flex-shrink-0">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
            {metric.icon && React.createElement(metric.icon, { 
              className: "w-5 h-5 sm:w-6 sm:h-6 text-white" 
            })}
          </div>
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${metric.gradient} blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ExecutiveSummaryCards({ dashboardData }: ExecutiveSummaryCardsProps) {
  const { ticketMetrics, timeMetrics, resourceMetrics } = getMetricsConfig(dashboardData);

  return (
    <div className="space-y-8 sm:space-y-10 mb-8 sm:mb-10">
      {/* SECTION 1: TICKET STATUS */}
      <section>
        <SectionHeader 
          icon={Ticket} 
          title="Ticket Overview" 
          iconGradient="from-[#6F8A9D] to-[#6F8A9D]"
          badge={{ label: 'Live', color: 'bg-[#96AEC2]/20 text-[#546A7A] border border-[#96AEC2]' }}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {ticketMetrics.map((metric, i) => (
            <MetricCard key={`ticket-${i}`} metric={metric} index={i} />
          ))}
        </div>
      </section>

      {/* SECTION 2: TIME METRICS (includes Onsite Resolution) */}
      <section>
        <SectionHeader 
          icon={Clock} 
          title="Time Analytics" 
          iconGradient="from-[#82A094] to-[#82A094]"
          badge={{ label: 'Business Hours', color: 'bg-[#82A094]/20 text-[#4F6A64] border border-[#82A094]/50' }}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {timeMetrics.map((metric, i) => (
            <MetricCard key={`time-${i}`} metric={metric} index={i} />
          ))}
        </div>
      </section>

      {/* SECTION 3: RESOURCES */}
      <section>
        <SectionHeader 
          icon={Users} 
          title="Resources & Assets" 
          iconGradient="from-[#6F8A9D] to-[#6F8A9D]/100"
          badge={{ label: 'Capacity', color: 'bg-[#6F8A9D]/20 text-[#546A7A] border border-[#6F8A9D]' }}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {resourceMetrics.map((metric, i) => (
            <MetricCard key={`resource-${i}`} metric={metric} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

