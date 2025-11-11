"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Timer,
  Timer as TimerOff,
  FileText,
  Cpu,
  TrendingUp,
  TrendingDown,
  Award,
  Database
} from "lucide-react";
import { formatNumber, formatDuration, formatChange } from "./utils";
import type { DashboardData } from "./types";

interface ExecutiveSummaryCardsProps {
  dashboardData: Partial<DashboardData>;
  loading?: boolean;
}

export default function ExecutiveSummaryCards({ dashboardData }: ExecutiveSummaryCardsProps) {
  const metrics = [
    {
      title: "Open Tickets",
      value: formatNumber(dashboardData?.stats?.openTickets?.count ?? 0),
      change: Number(dashboardData?.stats?.openTickets?.change ?? 0),
      isPositive: false,
      icon: Ticket,
      description: 'Currently open tickets',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Unassigned',
      value: String(dashboardData?.stats?.unassignedTickets?.count ?? '0'),
      description: 'Tickets waiting for assignment',
      critical: dashboardData?.stats?.unassignedTickets?.critical || false,
      color: dashboardData?.stats?.unassignedTickets?.critical 
        ? 'from-amber-500 to-amber-600' 
        : 'from-slate-500 to-slate-600',
      bgColor: dashboardData?.stats?.unassignedTickets?.critical 
        ? 'bg-amber-50' 
        : 'bg-slate-50',
      icon: AlertTriangle
    },
    {
      title: 'In Progress',
      value: formatNumber(dashboardData?.stats?.inProgressTickets?.count ?? 0),
      description: 'Tickets being worked on',
      change: Number(dashboardData?.stats?.inProgressTickets?.change ?? 0),
      isPositive: (Number(dashboardData?.stats?.inProgressTickets?.change ?? 0)) >= 0,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      icon: RefreshCw
    },
    {
      title: 'Avg Response Time',
      value: formatDuration(
        dashboardData?.stats?.avgResponseTime?.hours || 0, 
        dashboardData?.stats?.avgResponseTime?.minutes || 0
      ),
      description: 'Time to first response',
      change: Number(dashboardData?.stats?.avgResponseTime?.change ?? 0),
      isPositive: dashboardData?.stats?.avgResponseTime?.isPositive !== false,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      icon: Clock
    },
    {
      title: 'Avg Resolution Time',
      value: formatDuration(
        (dashboardData?.stats?.avgResolutionTime?.days || 0) * 24 + (dashboardData?.stats?.avgResolutionTime?.hours || 0),
        dashboardData?.stats?.avgResolutionTime?.minutes || 0
      ),
      description: 'Time to ticket resolution',
      change: Number(dashboardData?.stats?.avgResolutionTime?.change ?? 0),
      isPositive: dashboardData?.stats?.avgResolutionTime?.isPositive !== false,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      icon: Timer
    },
    {
      title: 'Machine Downtime',
      value: formatDuration(
        dashboardData?.stats?.avgDowntime?.hours || 0, 
        dashboardData?.stats?.avgDowntime?.minutes || 0
      ),
      change: Number(dashboardData?.stats?.avgDowntime?.change ?? 0),
      isPositive: dashboardData?.stats?.avgDowntime?.isPositive ?? false,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-50',
      icon: TimerOff,
      description: 'Average machine downtime'
    },
    {
      title: 'Tickets This Month',
      value: formatNumber(dashboardData?.stats?.monthlyTickets?.count ?? 0),
      change: Number(dashboardData?.stats?.monthlyTickets?.change ?? 0),
      isPositive: true,
      icon: FileText,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      description: 'Tickets created this month'
    },
    {
      title: 'Active Machines',
      value: formatNumber(dashboardData?.stats?.activeMachines?.count ?? 0),
      change: Number(dashboardData?.stats?.activeMachines?.change ?? 0),
      isPositive: true,
      icon: Cpu,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      description: 'Machines in operation'
    }
  ];

  return (
    <div className="mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 w-full max-w-full">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex-shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="truncate">Executive Summary</span>
        </h2>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 text-xs sm:text-sm whitespace-nowrap">
            <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full max-w-full">
        {metrics.map((metric, i) => (
          <Card 
            key={i} 
            className={`${metric.bgColor || 'bg-white'} border-0 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full max-w-full overflow-hidden`}
          >
            <CardContent className="p-4 sm:p-5 lg:p-6 w-full max-w-full">
              <div className="flex items-start justify-between gap-3 w-full max-w-full">
                <div className="space-y-1 sm:space-y-2 min-w-0 flex-1 overflow-hidden">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 flex items-center gap-1">
                    <metric.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{metric.title}</span>
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight break-words overflow-wrap-anywhere">{metric.value}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{metric.description}</p>
                  {metric.change !== undefined && (
                    <div className="flex items-center gap-1 min-w-0">
                      {metric.isPositive ? (
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${metric.isPositive ? 'text-green-600' : 'text-red-600'} truncate`}>
                        {formatChange(metric.change, metric.isPositive)}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${metric.color} shadow-md sm:shadow-lg flex-shrink-0`}>
                  {metric.icon && React.createElement(metric.icon, { className: "w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
