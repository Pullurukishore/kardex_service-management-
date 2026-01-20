'use client';

import React from 'react';
import { 
  Users, 
  Star, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Target,
  Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ZoneTechniciansPerformanceProps {
  zoneDashboardData: {
    technicians?: Array<{
      id: number;
      name: string;
      activeTickets: number;
      efficiency: number;
      rating: number;
    }>;
  };
}

// Helper function to get performance rating
const getPerformanceRating = (efficiency: number, rating: number): { 
  rating: string; 
  color: string; 
  icon: React.ReactNode;
  bgColor: string;
} => {
  const score = (efficiency + (rating * 20)) / 2; // Convert rating to 100 scale and average
  
  if (score >= 85) {
    return {
      rating: 'Excellent',
      color: 'text-[#4F6A64]',
      icon: <Award className="h-4 w-4" />,
      bgColor: 'bg-[#A2B9AF]/10'
    };
  } else if (score >= 70) {
    return {
      rating: 'Good',
      color: 'text-[#546A7A]',
      icon: <TrendingUp className="h-4 w-4" />,
      bgColor: 'bg-[#96AEC2]/10'
    };
  } else if (score >= 55) {
    return {
      rating: 'Average',
      color: 'text-[#976E44]',
      icon: <Activity className="h-4 w-4" />,
      bgColor: 'bg-[#EEC1BF]/10'
    };
  } else {
    return {
      rating: 'Needs Improvement',
      color: 'text-[#9E3B47]',
      icon: <TrendingDown className="h-4 w-4" />,
      bgColor: 'bg-[#E17F70]/10'
    };
  }
};

// Helper function to get workload status
const getWorkloadStatus = (activeTickets: number): { 
  status: string; 
  color: string; 
  bgColor: string;
} => {
  if (activeTickets === 0) {
    return {
      status: 'Available',
      color: 'text-[#4F6A64]',
      bgColor: 'bg-[#A2B9AF]/10'
    };
  } else if (activeTickets <= 3) {
    return {
      status: 'Normal',
      color: 'text-[#546A7A]',
      bgColor: 'bg-[#96AEC2]/10'
    };
  } else if (activeTickets <= 6) {
    return {
      status: 'Busy',
      color: 'text-[#976E44]',
      bgColor: 'bg-[#EEC1BF]/10'
    };
  } else {
    return {
      status: 'Overloaded',
      color: 'text-[#9E3B47]',
      bgColor: 'bg-[#E17F70]/10'
    };
  }
};

export default function ZoneTechniciansPerformance({ 
  zoneDashboardData 
}: ZoneTechniciansPerformanceProps) {
  const { technicians = [] } = zoneDashboardData;
  
  // Calculate team statistics
  const totalTechnicians = technicians.length;
  const avgEfficiency = totalTechnicians > 0 
    ? technicians.reduce((sum: number, tech: any) => sum + tech.efficiency, 0) / totalTechnicians 
    : 0;
  const avgRating = totalTechnicians > 0 
    ? technicians.reduce((sum: number, tech: any) => sum + tech.rating, 0) / totalTechnicians 
    : 0;
  const totalActiveTickets = technicians.reduce((sum: number, tech: any) => sum + tech.activeTickets, 0);
  
  // Sort technicians by efficiency (highest first)
  const sortedTechnicians = [...technicians].sort((a, b) => b.efficiency - a.efficiency);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#6F8A9D]" />
          Technicians Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-[#6F8A9D]/10 to-[#6F8A9D]/20">
            <div className="text-2xl font-bold text-[#546A7A]">
              {totalTechnicians}
            </div>
            <div className="text-sm text-[#546A7A]">Total Technicians</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-[#96AEC2]/10 to-[#96AEC2]/20">
            <div className="text-2xl font-bold text-[#546A7A]">
              {avgEfficiency.toFixed(1)}%
            </div>
            <div className="text-sm text-[#546A7A]">Avg Efficiency</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-[#EEC1BF]/10 to-[#EEC1BF]/20">
            <div className="text-2xl font-bold text-[#976E44]">
              {avgRating.toFixed(1)}/5.0
            </div>
            <div className="text-sm text-[#976E44]">Avg Rating</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-[#A2B9AF]/10 to-[#A2B9AF]/20">
            <div className="text-2xl font-bold text-[#4F6A64]">
              {totalActiveTickets}
            </div>
            <div className="text-sm text-[#4F6A64]">Active Tickets</div>
          </div>
        </div>

        {/* Technicians List */}
        <div className="space-y-3">
          {technicians.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No technicians assigned to this zone</p>
            </div>
          ) : (
            sortedTechnicians.map((technician) => {
              const performanceRating = getPerformanceRating(technician.efficiency, technician.rating);
              const workloadStatus = getWorkloadStatus(technician.activeTickets);
              
              return (
                <div
                  key={technician.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-[#AEBFC3]/10 hover:bg-[#AEBFC3]/20 transition-colors"
                >
                  {/* Technician Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#6F8A9D]/20 to-[#96AEC2]/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-[#546A7A]" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-[#546A7A] truncate">
                          {technician.name}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${workloadStatus.bgColor} ${workloadStatus.color} border-current`}
                        >
                          {workloadStatus.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>{technician.activeTickets} active tickets</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-[#CE9F6B]" />
                          <span>{technician.rating.toFixed(1)}/5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#546A7A]">
                        {technician.efficiency.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Efficiency</div>
                      <Progress value={technician.efficiency} className="w-20 h-2 mt-1" />
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-sm font-medium ${performanceRating.color}`}>
                        {performanceRating.rating}
                      </div>
                      <div className="text-xs text-muted-foreground">Performance</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Performance Summary */}
        {technicians.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-[#6F8A9D]" />
              <span className="text-sm font-medium">Team Performance Summary</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2 rounded-lg bg-[#A2B9AF]/10">
                <div className="text-sm font-bold text-[#4F6A64]">
                  {technicians.filter((t: any) => t.efficiency >= 80).length}
                </div>
                <div className="text-xs text-[#4F6A64]">High Performers</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-[#96AEC2]/10">
                <div className="text-sm font-bold text-[#546A7A]">
                  {technicians.filter((t: any) => t.activeTickets === 0).length}
                </div>
                <div className="text-xs text-[#546A7A]">Available</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-[#EEC1BF]/10">
                <div className="text-sm font-bold text-[#976E44]">
                  {technicians.filter((t: any) => t.activeTickets > 3).length}
                </div>
                <div className="text-xs text-[#976E44]">Busy</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-[#6F8A9D]/10">
                <div className="text-sm font-bold text-[#546A7A]">
                  {technicians.filter((t: any) => t.rating >= 4.0).length}
                </div>
                <div className="text-xs text-[#546A7A]">Top Rated</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
