'use client';

import React from 'react';
import { RefreshCw, BarChart3, Calendar, Clock, Users, Wrench, Building2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateTicketButton from '@/components/tickets/CreateTicketButton';

interface ExecutiveHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  // Optional stats to display
  stats?: {
    totalCustomers?: number;
    totalServicePersons?: number;
    totalServiceZones?: number;
    totalZoneUsers?: number;
    totalZoneManagers?: number;
  };
}

export default function ExecutiveHeader({ 
  isRefreshing, 
  onRefresh,
  stats 
}: ExecutiveHeaderProps) {
  return (
    <div className="mb-6">
      {/* Compact Kardex Header Card */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-[#E17F70]/10 border border-[#E17F70]/15 overflow-hidden p-4 sm:p-5 lg:p-6">
        {/* Decorative gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E17F70] via-[#CE9F6B] to-[#82A094]"></div>
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#E17F70]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#82A094]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Compact icon */}
              <div className="p-2.5 bg-gradient-to-br from-[#E17F70] to-[#9E3B47] rounded-xl shadow-lg shadow-[#E17F70]/25">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#9E3B47] via-[#E17F70] to-[#CE9F6B] bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <Sparkles className="w-5 h-5 text-[#E17F70]" />
                </div>
                <p className="text-[#5D6E73] text-sm font-medium">Real-time Operations & Field Service Intelligence</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#757777]">
              <div className="flex items-center gap-1.5 bg-[#E17F70]/10 px-2.5 py-1 rounded-full">
                <Calendar className="w-3 h-3 text-[#9E3B47]" />
                <span className="font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#82A094]/10 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3 text-[#82A094]" />
                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                {isRefreshing && <RefreshCw className="w-2.5 h-2.5 ml-0.5 animate-spin text-[#E17F70]" />}
              </div>
            </div>

            {/* Admin Stats - Compact badges */}
            {stats && (stats.totalCustomers || stats.totalServicePersons || stats.totalServiceZones || stats.totalZoneUsers || stats.totalZoneManagers) && (
              <div className="flex flex-wrap items-center gap-2">
                {stats.totalCustomers !== undefined && (
                  <div className="flex items-center gap-1.5 bg-[#E17F70]/15 px-2.5 py-1.5 rounded-lg border border-[#E17F70]/20">
                    <div className="p-1 bg-[#E17F70] rounded">
                      <Users className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="font-bold text-[#9E3B47] text-sm">{stats.totalCustomers}</span>
                    <span className="text-[#5D6E73] text-xs">Customers</span>
                  </div>
                )}
                {stats.totalZoneUsers !== undefined && stats.totalZoneUsers > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#6F8A9D]/10 px-2.5 py-1.5 rounded-lg border border-[#6F8A9D]/20">
                    <div className="p-1 bg-[#96AEC2] rounded">
                      <Users className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="font-bold text-[#546A7A] text-sm">{stats.totalZoneUsers}</span>
                    <span className="text-[#5D6E73] text-xs">Zone Users</span>
                  </div>
                )}
                {stats.totalServicePersons !== undefined && (
                  <div className="flex items-center gap-1.5 bg-[#82A094]/15 px-2.5 py-1.5 rounded-lg border border-[#82A094]/20">
                    <div className="p-1 bg-[#82A094] rounded">
                      <Wrench className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="font-bold text-[#4F6A64] text-sm">{stats.totalServicePersons}</span>
                    <span className="text-[#5D6E73] text-xs">Technicians</span>
                  </div>
                )}
                {stats.totalServiceZones !== undefined && (
                  <div className="flex items-center gap-1.5 bg-[#A2B9AF]/15 px-2.5 py-1.5 rounded-lg border border-[#A2B9AF]/20">
                    <div className="p-1 bg-[#4F6A64] rounded">
                      <Building2 className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="font-bold text-[#4F6A64] text-sm">{stats.totalServiceZones}</span>
                    <span className="text-[#5D6E73] text-xs">Zones</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons - Compact */}
          <div className="flex flex-wrap gap-2">
            <CreateTicketButton 
              className="bg-gradient-to-r from-[#E17F70] to-[#9E3B47] text-white text-sm font-semibold shadow-md shadow-[#E17F70]/20 hover:shadow-lg hover:scale-[1.02] transition-all rounded-lg px-4 py-2"
            >
              New Ticket
            </CreateTicketButton>
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="border border-[#96AEC2]/30 bg-white/80 hover:bg-[#96AEC2]/10 text-[#546A7A] text-sm font-medium shadow-sm hover:shadow rounded-lg px-3"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
