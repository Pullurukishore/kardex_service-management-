'use client';

import React from 'react';
import { 
  Clock, 
  TrendingUp,
  Gauge,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ZoneFieldServiceAnalyticsProps {
  zoneDashboardData: {
    metrics: {
      avgTravelTime: number;
      avgResponseTime?: number;
      avgResolutionTime?: number;
      technicianEfficiency: number;
    };
    stats: {
      avgResponseTime: { hours: number; minutes: number; change: number; isPositive: boolean };
      avgResolutionTime: { days: number; hours: number; minutes: number; change: number; isPositive: boolean };
      avgDowntime: { hours: number; minutes: number; change: number; isPositive: boolean };
    };
  };
}

// Helper function to format duration
const formatDuration = (hours: number, minutes: number): string => {
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Helper function to render change indicator
const ChangeIndicator = ({ change, isPositive }: { change: number; isPositive: boolean }) => {
  if (change === 0) return null;
  
  const colorClass = isPositive ? 'text-[#4F6A64]' : 'text-[#9E3B47]';
  const arrow = isPositive ? '↓' : '↑';
  
  return (
    <Badge variant={isPositive ? 'default' : 'destructive'} className="text-xs">
      {arrow} {Math.abs(change)}%
    </Badge>
  );
};

export default function ZoneFieldServiceAnalytics({ 
  zoneDashboardData 
}: ZoneFieldServiceAnalyticsProps) {
  const { metrics, stats } = zoneDashboardData;
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-[#546A7A] to-cyan-600 rounded-lg">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          Field Service Analytics
        </h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Response Time Card */}
        <Card className="bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#546A7A]">
                  {formatDuration(stats.avgResponseTime.hours, stats.avgResponseTime.minutes)}
                </p>
                <p className="text-sm text-[#546A7A]">Avg Response Time</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#546A7A]">Time to first response</p>
              <ChangeIndicator 
                change={stats.avgResponseTime.change} 
                isPositive={stats.avgResponseTime.isPositive} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Travel Time Card */}
        <Card className="bg-gradient-to-br from-[#6F8A9D]/10 to-[#6F8A9D]/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#546A7A]">
                  {formatDuration(Math.floor(metrics.avgTravelTime / 60), metrics.avgTravelTime % 60)}
                </p>
                <p className="text-sm text-[#546A7A]">Avg Travel Time</p>
              </div>
            </div>
            <p className="text-xs text-[#546A7A]">Time to reach customer sites</p>
          </CardContent>
        </Card>

        {/* Resolution Time Card */}
        <Card className="bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-[#82A094] to-[#4F6A64] rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#4F6A64]">
                  {formatDuration(stats.avgResolutionTime.days * 24 + stats.avgResolutionTime.hours, stats.avgResolutionTime.minutes)}
                </p>
                <p className="text-sm text-[#4F6A64]">Avg Resolution Time</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#4F6A64]">Time to complete tickets</p>
              <ChangeIndicator 
                change={stats.avgResolutionTime.change} 
                isPositive={stats.avgResolutionTime.isPositive} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 mt-6">
        {/* Technician Efficiency */}
        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#546A7A]" />
                <span className="text-sm font-medium text-[#5D6E73]">Technician Efficiency</span>
              </div>
              <span className="text-xl font-bold text-[#546A7A]">
                {metrics.technicianEfficiency.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.technicianEfficiency} className="h-3 mb-2" />
            <p className="text-xs text-[#5D6E73]">Overall performance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
