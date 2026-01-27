"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  Clock, 
  AlertTriangle, 
  Loader2,
  Timer,
  Cpu,
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
      description: 'Awaiting action',
      gradient: 'from-[#546A7A] to-[#6F8A9D]',
      category: 'status'
    },
    {
      title: 'Unassigned',
      value: formatNumber(dashboardData?.stats?.unassignedTickets?.count ?? 0),
      description: 'Needs assignment',
      critical: dashboardData?.stats?.unassignedTickets?.critical || false,
      gradient: dashboardData?.stats?.unassignedTickets?.critical 
        ? 'from-[#E17F70] to-[#9E3B47]' 
        : 'from-[#5D6E73] to-[#3D4E53]',
      icon: AlertTriangle,
      category: 'status'
    },
    {
      title: 'In Progress',
      value: formatNumber(dashboardData?.stats?.inProgressTickets?.count ?? 0),
      description: 'Being worked on',
      change: Number(dashboardData?.stats?.inProgressTickets?.change ?? 0),
      isPositive: true,
      gradient: 'from-[#CE9F6B] to-[#976E44]',
      icon: Loader2,
      category: 'status'
    },
    {
      title: 'Monthly Tickets',
      value: formatNumber(dashboardData?.stats?.monthlyTickets?.count ?? 0),
      change: Number(dashboardData?.stats?.monthlyTickets?.change ?? 0),
      isPositive: true,
      icon: Target,
      gradient: 'from-[#6F8A9D] to-[#546A7A]',
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
      description: 'Avg first response',
      change: Number(dashboardData?.stats?.avgResponseTime?.change ?? 0),
      isPositive: dashboardData?.stats?.avgResponseTime?.isPositive !== false,
      gradient: 'from-[#82A094] to-[#4F6A64]',
      icon: Clock,
      category: 'time'
    },
    {
      title: 'Resolution Time',
      value: formatDuration(
        (dashboardData?.stats?.avgResolutionTime?.days || 0) * 8 + (dashboardData?.stats?.avgResolutionTime?.hours || 0),
        dashboardData?.stats?.avgResolutionTime?.minutes || 0
      ),
      description: 'Avg time to resolve',
      change: Number(dashboardData?.stats?.avgResolutionTime?.change ?? 0),
      isPositive: dashboardData?.stats?.avgResolutionTime?.isPositive !== false,
      gradient: 'from-[#6F8A9D] to-[#546A7A]',
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
      gradient: 'from-[#E17F70] to-[#9E3B47]',
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
      gradient: 'from-[#546A7A] to-[#6F8A9D]',
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
      gradient: 'from-[#CE9F6B] to-[#976E44]',
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
      gradient: 'from-[#6F8A9D] to-[#546A7A]',
      description: 'Customers with tickets',
      category: 'resources'
    },
    {
      title: 'Active Technicians',
      value: formatNumber(dashboardData?.stats?.kpis?.activeServicePersons?.value || 0),
      subtitle: `of ${formatNumber(dashboardData?.adminStats?.totalServicePersons || 0)} total`,
      change: dashboardData?.stats?.kpis?.activeServicePersons?.change || 0,
      isPositive: true,
      icon: Users,
      gradient: 'from-[#82A094] to-[#4F6A64]',
      description: 'On active tickets',
      category: 'resources'
    },
    {
      title: 'Service Zones',
      value: formatNumber(dashboardData?.adminStats?.totalServiceZones || 0),
      valueLabel: "zones",
      subtitle: `${dashboardData?.stats?.kpis?.activeServicePersons?.value || 0} active technicians`,
      icon: MapPin,
      gradient: 'from-[#CE9F6B] to-[#976E44]',
      description: 'Geographic coverage',
      category: 'resources'
    },
    {
      title: 'Active Machines',
      value: formatNumber(dashboardData?.stats?.activeMachines?.count ?? 0),
      change: Number(dashboardData?.stats?.activeMachines?.change ?? 0),
      isPositive: true,
      icon: Cpu,
      gradient: 'from-[#E17F70] to-[#9E3B47]',
      description: 'Equipment in operation',
      category: 'resources'
    }
  ];

  return { ticketMetrics, timeMetrics, resourceMetrics };
};

// Section Header Component - Compact Kardex styling
const SectionHeader = ({ icon: Icon, title, iconGradient, badge }: { 
  icon: any; 
  title: string; 
  iconGradient: string;
  badge?: { label: string; color: string };
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
    <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${iconGradient} shadow-md`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[#546A7A]">{title}</span>
    </h3>
    {badge && (
      <Badge className={`${badge.color} px-2.5 py-1 text-[10px] font-bold`}>
        <Zap className="w-2.5 h-2.5 mr-1" />
        {badge.label}
      </Badge>
    )}
  </div>
);

// Metric Card Component - Compact Finance Dashboard Style
const MetricCard = ({ metric, index }: { metric: any; index: number }) => (
  <div 
    className={`bg-gradient-to-br ${metric.gradient} rounded-xl p-4 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group`}
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {/* Decorative background circle */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
    
    <div className="relative z-10">
      {/* Icon Badge */}
      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-2 group-hover:bg-white/25 transition-colors">
        {metric.icon && React.createElement(metric.icon, { 
          className: "w-4 h-4 text-white" 
        })}
      </div>
      
      {/* Title */}
      <div className="text-[10px] text-white/70 font-semibold uppercase tracking-wide mb-0.5">
        {metric.title}
      </div>
      
      {/* Main Value */}
      <div className="text-xl sm:text-2xl font-bold tracking-tight">
        {metric.value}
        {metric.valueLabel && (
          <span className="text-xs font-medium text-white/70 ml-1">{metric.valueLabel}</span>
        )}
      </div>
      
      {/* Description or Subtitle */}
      <div className="text-[10px] text-white/60 mt-0.5">
        {metric.subtitle || metric.description}
      </div>
      
      {/* Critical Badge for Unassigned */}
      {metric.critical && (
        <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
          <AlertTriangle className="w-2.5 h-2.5" />
          Attention
        </div>
      )}
    </div>
  </div>
);

export default function ExecutiveSummaryCards({ dashboardData }: ExecutiveSummaryCardsProps) {
  const { ticketMetrics, timeMetrics, resourceMetrics } = getMetricsConfig(dashboardData);

  return (
    <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
      {/* SECTION 1: TICKET STATUS */}
      <section>
        <SectionHeader 
          icon={Ticket} 
          title="Ticket Overview" 
          iconGradient="from-[#6F8A9D] to-[#546A7A]"
          badge={{ label: 'Live', color: 'bg-[#96AEC2]/20 text-[#546A7A] border border-[#96AEC2]/40' }}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {ticketMetrics.map((metric, i) => (
            <MetricCard key={`ticket-${i}`} metric={metric} index={i} />
          ))}
        </div>
      </section>

      {/* SECTION 2: TIME METRICS */}
      <section>
        <SectionHeader 
          icon={Clock} 
          title="Time Analytics" 
          iconGradient="from-[#82A094] to-[#4F6A64]"
          badge={{ label: 'Business Hours', color: 'bg-[#A2B9AF]/20 text-[#4F6A64] border border-[#82A094]/30' }}
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
          iconGradient="from-[#E17F70] to-[#9E3B47]"
          badge={{ label: 'Capacity', color: 'bg-[#EEC1BF]/20 text-[#9E3B47] border border-[#E17F70]/30' }}
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

