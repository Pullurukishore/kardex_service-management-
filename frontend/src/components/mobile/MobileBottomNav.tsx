'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Activity, 
  Plus, 
  MapPin,
  Home,
  User
} from 'lucide-react';

interface MobileBottomNavProps {
  onQuickCheckIn?: () => void;
  onNewActivity?: () => void;
  onViewActivities?: () => void;
  className?: string;
}

export default function MobileBottomNav({ 
  onQuickCheckIn, 
  onNewActivity, 
  onViewActivities,
  className = ""
}: MobileBottomNavProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-[#92A2A5] shadow-lg z-40 pb-safe ${className}`}>
      <div className="flex items-center justify-around px-2 py-2">
        {/* Home/Dashboard */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 h-12 text-xs font-medium text-[#5D6E73] hover:text-[#546A7A] hover:bg-[#96AEC2]/10"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>

        {/* Quick Check-in */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onQuickCheckIn}
          className="flex-1 flex flex-col items-center gap-1 h-12 text-xs font-medium text-[#5D6E73] hover:text-[#4F6A64] hover:bg-[#A2B9AF]/10"
        >
          <Clock className="h-4 w-4" />
          <span>Check-in</span>
        </Button>

        {/* New Activity - Central FAB */}
        <Button
          size="sm"
          onClick={onNewActivity}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6F8A9D] hover:bg-[#546A7A] shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="h-5 w-5 text-white" />
        </Button>

        {/* Activities */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewActivities}
          className="flex-1 flex flex-col items-center gap-1 h-12 text-xs font-medium text-[#5D6E73] hover:text-[#546A7A] hover:bg-[#6F8A9D]/10"
        >
          <Activity className="h-4 w-4" />
          <span>Activities</span>
        </Button>

        {/* Location/Profile */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex flex-col items-center gap-1 h-12 text-xs font-medium text-[#5D6E73] hover:text-[#976E44] hover:bg-[#CE9F6B]/10"
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Button>
      </div>
    </div>
  );
}
