"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle,
  Activity,
  Users,
  Building2,
  MapPin
} from "lucide-react";
import type { DashboardData } from "./types";

interface QuickStatsAlertsProps {
  dashboardData: Partial<DashboardData>;
  loading?: boolean;
}

export default function QuickStatsAlerts({ dashboardData }: QuickStatsAlertsProps) {
  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {(dashboardData?.stats?.kpis?.unassignedTickets?.value || 0) > 5 && (
        <Card className="bg-gradient-to-r from-[#E17F70]/10 to-[#EEC1BF]/10 border-[#E17F70] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#75242D]">
              <AlertTriangle className="w-5 h-5" />
              Critical Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-[#75242D]">
                <strong>{dashboardData?.stats?.kpis?.unassignedTickets?.value}</strong> tickets require immediate assignment
              </p>
              <Button size="sm" className="bg-[#9E3B47] hover:bg-[#75242D]">
                Assign Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live System Stats */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#4F6A64] to-[#4F6A64] rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5D6E73]" />
                <span className="text-sm font-medium">Service Personnel</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-[#546A7A]">
                  {dashboardData?.stats?.kpis?.activeServicePersons?.value || 0} Active
                </span>
                <span className="text-xs text-[#757777]">
                  of {dashboardData?.adminStats?.totalServicePersons || 0} total
                </span>
              </div>
            </div>
            <Progress 
              value={dashboardData?.adminStats?.totalServicePersons 
                ? Math.min(100, ((dashboardData.stats?.kpis?.activeServicePersons?.value || 0) / dashboardData.adminStats.totalServicePersons) * 100)
                : 0} 
              className="h-2" 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5D6E73]" />
                <span className="text-sm font-medium">Active Customers</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-[#546A7A]">
                  {dashboardData?.stats?.kpis?.activeCustomers?.value || 0}
                </span>
                <span className="text-xs text-[#757777]">
                  of {dashboardData?.adminStats?.totalCustomers || 0} total
                </span>
              </div>
            </div>
            <Progress 
              value={dashboardData?.adminStats?.totalCustomers 
                ? Math.min(100, ((dashboardData.stats?.kpis?.activeCustomers?.value || 0) / dashboardData.adminStats.totalCustomers) * 100)
                : 0} 
              className="h-2" 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#5D6E73]" />
                <span className="text-sm font-medium">Service Zones</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-[#546A7A]">
                  {dashboardData?.adminStats?.totalServiceZones || 0} Zones
                </span>
                {dashboardData?.adminStats?.zoneWiseTickets?.some(z => z.totalTickets > 0) && (
                  <span className="text-xs text-[#757777]">
                    {dashboardData.adminStats.zoneWiseTickets.filter(z => z.totalTickets > 0).length} active
                  </span>
                )}
              </div>
            </div>
            <Progress 
              value={dashboardData?.adminStats?.zoneWiseTickets?.length 
                ? (dashboardData.adminStats.zoneWiseTickets.filter(z => z.totalTickets > 0).length / dashboardData.adminStats.zoneWiseTickets.length) * 100
                : 0} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
