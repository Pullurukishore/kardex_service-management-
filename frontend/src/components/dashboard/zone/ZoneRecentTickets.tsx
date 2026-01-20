'use client';

import React from 'react';
import { 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ZoneRecentTicketsProps {
  zoneDashboardData: {
    recentActivities?: Array<{
      id: number;
      type: string;
      description: string;
      timestamp: string;
      priority: string;
      technician?: string;
    }>;
    topIssues?: Array<{
      title: string;
      count: number;
      priority?: string;
      avgResolutionTime?: number;
    }>;
  };
}

// Helper function to format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

// Helper function to get priority color
const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'bg-[#E17F70]/20 text-[#75242D] border-[#E17F70]';
    case 'medium':
      return 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]';
    case 'low':
      return 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]';
    default:
      return 'bg-[#AEBFC3]/20 text-[#546A7A] border-[#92A2A5]';
  }
};

// Helper function to get activity icon
const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ticket_created':
      return <AlertTriangle className="h-4 w-4 text-[#E17F70]" />;
    case 'ticket_resolved':
      return <CheckCircle className="h-4 w-4 text-[#82A094]" />;
    case 'ticket_assigned':
      return <User className="h-4 w-4 text-[#6F8A9D]" />;
    case 'maintenance':
      return <RefreshCw className="h-4 w-4 text-[#6F8A9D]" />;
    default:
      return <Activity className="h-4 w-4 text-[#AEBFC3]0" />;
  }
};

export default function ZoneRecentTickets({ 
  zoneDashboardData 
}: ZoneRecentTicketsProps) {
  const { recentActivities = [], topIssues = [] } = zoneDashboardData;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Activities */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#6F8A9D]" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            ) : (
              recentActivities.slice(0, 8).map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-[#AEBFC3]/10 hover:bg-[#AEBFC3]/20 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-[#546A7A] truncate">
                        {activity.description}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(activity.priority)}`}
                      >
                        {activity.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>
                      
                      {activity.technician && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{activity.technician}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Issues */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#CE9F6B]" />
            Top Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topIssues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No major issues reported</p>
              </div>
            ) : (
              topIssues.slice(0, 8).map((issue: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-[#AEBFC3]/10 hover:bg-[#AEBFC3]/20 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#976E44]">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#546A7A] truncate">
                        {issue.title}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {issue.avgResolutionTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{issue.avgResolutionTime}h avg</span>
                          </div>
                        )}
                        
                        {issue.priority && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(issue.priority)}`}
                          >
                            {issue.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#976E44]">
                        {issue.count}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {issue.count === 1 ? 'ticket' : 'tickets'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
