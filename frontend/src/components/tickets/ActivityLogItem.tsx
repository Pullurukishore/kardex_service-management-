'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Ticket, 
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

type ActivityLogItemProps = {
  activity: {
    id: number;
    title: string;
    description?: string;
    activityType: string;
    startTime: string | Date;
    endTime?: string | Date;
    duration?: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    ticketId?: number;
    user: {
      id: number;
      name?: string;
      email: string;
    };
    ticket?: {
      id: number;
      title: string;
      status: string;
    };
  };
  className?: string;
};

const getActivityTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ticket_work':
      return 'bg-[#96AEC2]/20 text-[#546A7A] border-[#96AEC2]';
    case 'travel':
      return 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]';
    case 'break':
      return 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]';
    case 'meeting':
      return 'bg-[#6F8A9D]/20 text-[#546A7A] border-[#6F8A9D]';
    default:
      return 'bg-[#AEBFC3]/20 text-[#546A7A] border-[#92A2A5]';
  }
};

const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ticket_work':
      return <Ticket className="h-4 w-4" />;
    case 'travel':
      return <MapPin className="h-4 w-4" />;
    case 'break':
      return <Clock className="h-4 w-4" />;
    case 'meeting':
      return <User className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export function ActivityLogItem({ activity, className = '' }: ActivityLogItemProps) {
  const startTime = new Date(activity.startTime);
  const endTime = activity.endTime ? new Date(activity.endTime) : null;
  const hasLocation = activity.latitude && activity.longitude;

  const handleMapClick = () => {
    if (hasLocation) {
      window.open(`https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`, '_blank');
    }
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with activity type and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getActivityIcon(activity.activityType)}
                <h4 className="font-medium text-[#546A7A]">{activity.title}</h4>
              </div>
              <Badge className={`text-xs ${getActivityTypeColor(activity.activityType)}`}>
                {activity.activityType.replace('_', ' ').toUpperCase()}
              </Badge>
              {hasLocation && (
                <Badge variant="outline" className="text-xs bg-[#96AEC2]/10 text-[#546A7A] border-[#96AEC2]">
                  📍 Location
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {endTime ? (
                <CheckCircle className="h-4 w-4 text-[#82A094]" />
              ) : (
                <AlertCircle className="h-4 w-4 text-[#CE9F6B]" />
              )}
              <span>{formatDistanceToNow(startTime, { addSuffix: true })}</span>
            </div>
          </div>

          {/* Activity description */}
          {activity.description && (
            <p className="text-sm text-[#5D6E73]">{activity.description}</p>
          )}

          {/* Time information */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Started: {startTime.toLocaleTimeString()}</span>
            </div>
            {endTime && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-[#82A094]" />
                <span>Ended: {endTime.toLocaleTimeString()}</span>
              </div>
            )}
            {activity.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-[#6F8A9D]" />
                <span>Duration: {Math.round(activity.duration)} minutes</span>
              </div>
            )}
          </div>

          {/* Location information */}
          {hasLocation && (
            <div className="bg-[#96AEC2]/10 border border-[#96AEC2] rounded-md p-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#546A7A] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#546A7A] font-medium">
                    {activity.address || `${activity.latitude?.toFixed(6)}, ${activity.longitude?.toFixed(6)}`}
                  </p>
                  <button
                    onClick={handleMapClick}
                    className="text-xs text-[#546A7A] hover:text-[#546A7A] underline flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on Map
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Related ticket information */}
          {activity.ticket && (
            <div className="bg-[#AEBFC3]/10 border rounded-md p-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-[#5D6E73]" />
                <div>
                  <p className="text-sm font-medium text-[#546A7A]">
                    Related Ticket: #{activity.ticket.id}
                  </p>
                  <p className="text-sm text-[#5D6E73]">{activity.ticket.title}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {activity.ticket.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* User information */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <User className="h-4 w-4" />
            <span>
              {activity.user.name || activity.user.email}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
