'use client';

import React from 'react';
import { 
  Wrench, 
  Users, 
  MessageSquare, 
  Package, 
  Car, 
  GraduationCap, 
  Calendar, 
  Settings, 
  FileText, 
  MoreHorizontal, 
  Home,
  Hammer,
  Cog,
  UserCheck,
  MapPin
} from 'lucide-react';

interface Props {
  activityTypes: string[];
  onStartActivity: (activityType: string) => void;
  isLocationLoading: boolean;
}

// Activity type configurations with icons and descriptions
const ACTIVITY_CONFIG = {
  'TICKET_WORK': {
    icon: Wrench,
    label: 'Ticket Work',
    description: 'Work on assigned tickets',
    color: 'bg-[#96AEC2]/100 hover:bg-[#6F8A9D]',
    requiresLocation: true,
    special: true // Special handling - goes to ticket dashboard
  },
  'BD_VISIT': {
    icon: Users,
    label: 'Business Development',
    description: 'Customer visits and BD activities',
    color: 'bg-[#6F8A9D]/100 hover:bg-[#546A7A]',
    requiresLocation: true
  },
  'PO_DISCUSSION': {
    icon: MessageSquare,
    label: 'PO Discussion',
    description: 'Purchase order discussions',
    color: 'bg-[#A2B9AF]/100 hover:bg-[#4F6A64]',
    requiresLocation: true
  },
  'SPARE_REPLACEMENT': {
    icon: Package,
    label: 'Spare Replacement',
    description: 'Replace spare parts',
    color: 'bg-[#CE9F6B]/100 hover:bg-[#976E44]',
    requiresLocation: true
  },
  'TRAVEL': {
    icon: Car,
    label: 'Travel',
    description: 'Traveling to customer location',
    color: 'bg-[#546A7A]/100 hover:bg-[#546A7A]',
    requiresLocation: true
  },
  'TRAINING': {
    icon: GraduationCap,
    label: 'Training',
    description: 'Training sessions and learning',
    color: 'bg-[#82A094]/100 hover:bg-[#4F6A64]',
    requiresLocation: true
  },
  'MEETING': {
    icon: Calendar,
    label: 'Meeting',
    description: 'Team meetings and discussions',
    color: 'bg-[#EEC1BF]/100 hover:bg-[#9E3B47]',
    requiresLocation: true
  },
  'MAINTENANCE': {
    icon: Settings,
    label: 'Maintenance',
    description: 'Equipment maintenance work',
    color: 'bg-[#E17F70]/100 hover:bg-[#9E3B47]',
    requiresLocation: true
  },
  'DOCUMENTATION': {
    icon: FileText,
    label: 'Documentation',
    description: 'Report writing and documentation',
    color: 'bg-[#AEBFC3]/100 hover:bg-[#5D6E73]',
    requiresLocation: true
  },
  'WORK_FROM_HOME': {
    icon: Home,
    label: 'Work From Home',
    description: 'Remote work activities',
    color: 'bg-[#82A094]/100 hover:bg-[#4F6A64]',
    requiresLocation: false // Special case - no location required
  },
  'INSTALLATION': {
    icon: Hammer,
    label: 'Installation',
    description: 'New equipment installation',
    color: 'bg-[#CE9F6B]/100 hover:bg-[#976E44]',
    requiresLocation: true
  },
  'MAINTENANCE_PLANNED': {
    icon: Cog,
    label: 'Planned Maintenance',
    description: 'Scheduled maintenance activities',
    color: 'bg-[#96AEC2]/100 hover:bg-[#546A7A]',
    requiresLocation: true
  },
  'REVIEW_MEETING': {
    icon: UserCheck,
    label: 'Review Meeting',
    description: 'Performance and review meetings',
    color: 'bg-[#6F8A9D] hover:bg-[#6F8A9D]',
    requiresLocation: true
  },
  'RELOCATION': {
    icon: MapPin,
    label: 'Relocation',
    description: 'Equipment relocation work',
    color: 'bg-[#EEC1BF]/100 hover:bg-[#9E3B47]',
    requiresLocation: true
  },
  'OTHER': {
    icon: MoreHorizontal,
    label: 'Other',
    description: 'Other work activities',
    color: 'bg-[#AEBFC3]/100 hover:bg-[#5D6E73]',
    requiresLocation: true
  }
};

export default function ActivitySelection({ activityTypes, onStartActivity, isLocationLoading }: Props) {
  const handleActivitySelect = (activityType: string) => {
    const config = ACTIVITY_CONFIG[activityType as keyof typeof ACTIVITY_CONFIG];
    
    if (config?.requiresLocation && isLocationLoading) {
      return; // Don't allow selection while location is loading
    }
    
    onStartActivity(activityType);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#546A7A] mb-2">Select Activity Type</h2>
          <p className="text-[#5D6E73]">Choose the type of work you want to start</p>
        </div>

        {/* Special Notice for TICKET_WORK */}
        <div className="bg-[#96AEC2]/10 border border-[#96AEC2] rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Wrench className="w-6 h-6 text-[#546A7A] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-[#546A7A] mb-1">Ticket Work</h3>
              <p className="text-[#546A7A] text-sm">
                Select "Ticket Work" to access your ticket dashboard where you can manage ticket statuses 
                and work on assigned tickets like a zone user.
              </p>
            </div>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activityTypes.map((activityType) => {
            const config = ACTIVITY_CONFIG[activityType as keyof typeof ACTIVITY_CONFIG];
            
            if (!config) return null;

            const Icon = config.icon;
            const isDisabled = config.requiresLocation && isLocationLoading;
            
            return (
              <button
                key={activityType}
                onClick={() => handleActivitySelect(activityType)}
                disabled={isDisabled}
                className={`
                  ${config.color} 
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105 active:scale-95'}
                  text-white p-6 rounded-xl shadow-lg transition-all duration-200 text-left
                  ${(config as any).special ? 'ring-2 ring-blue-300 ring-offset-2' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="w-8 h-8" />
                  {(config as any).special && (
                    <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                      Special
                    </span>
                  )}
                  {!config.requiresLocation && (
                    <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                      No GPS
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{config.label}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{config.description}</p>
                
                {config.requiresLocation && (
                  <div className="flex items-center mt-3 text-xs opacity-75">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>Location required</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Location Loading Notice */}
        {isLocationLoading && (
          <div className="mt-6 bg-[#CE9F6B]/10 border border-[#CE9F6B]/40 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-[#976E44] border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="font-medium text-[#976E44]">Getting your location...</p>
                <p className="text-[#976E44] text-sm">Please wait while we determine your GPS coordinates.</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-[#AEBFC3]/10 border border-[#92A2A5] rounded-lg p-4">
          <h4 className="font-semibold text-[#546A7A] mb-2">Instructions:</h4>
          <ul className="text-sm text-[#5D6E73] space-y-1">
            <li>• <strong>Ticket Work:</strong> Access ticket dashboard to manage assigned tickets</li>
            <li>• <strong>Work From Home:</strong> No location tracking required</li>
            <li>• <strong>Other Activities:</strong> Progress through stages with location tracking</li>
            <li>• <strong>Location:</strong> GPS coordinates are captured for most activities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
