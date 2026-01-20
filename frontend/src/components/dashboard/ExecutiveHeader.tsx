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
    <div className="mb-8">
      {/* Premium Header Card */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-[#E17F70]/15 border border-[#E17F70]/20 overflow-hidden p-6 sm:p-8">
        {/* Decorative gradient top bar - Vibrant coral to green */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E17F70] via-[#CE9F6B] to-[#82A094]"></div>
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#E17F70]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#82A094]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              {/* Icon with vibrant coral gradient */}
              <div className="p-3 bg-gradient-to-br from-[#E17F70] to-[#9E3B47] rounded-2xl shadow-lg shadow-[#E17F70]/30">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#9E3B47] via-[#E17F70] to-[#CE9F6B] bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <Sparkles className="w-6 h-6 text-[#E17F70]" />
                </div>
                <p className="text-[#5D6E73] font-medium mt-1">Real-time Operations & Field Service Intelligence</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#757777]">
              <div className="flex items-center gap-2 bg-[#E17F70]/10 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4 text-[#9E3B47]" />
                <span className="font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#82A094]/10 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-[#82A094]" />
                <span className="font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
                {isRefreshing && <RefreshCw className="w-3 h-3 ml-1 animate-spin text-[#E17F70]" />}
              </div>
            </div>

            {/* Admin Stats - Vibrant badges */}
            {stats && (stats.totalCustomers || stats.totalServicePersons || stats.totalServiceZones || stats.totalZoneUsers || stats.totalZoneManagers) && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {stats.totalCustomers !== undefined && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#E17F70]/20 to-[#EEC1BF]/15 px-4 py-2.5 rounded-xl border border-[#E17F70]/30 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                    <div className="p-1.5 bg-[#E17F70] rounded-lg">
                      <Users className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-bold text-[#9E3B47]">{stats.totalCustomers}</span>
                    <span className="text-[#5D6E73] text-sm">Customers</span>
                  </div>
                )}
                {stats.totalZoneManagers !== undefined && stats.totalZoneManagers > 0 && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#CE9F6B]/20 to-[#EEC1BF]/15 px-4 py-2.5 rounded-xl border border-[#CE9F6B]/30 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                    <div className="p-1.5 bg-[#CE9F6B] rounded-lg">
                      <Users className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-bold text-[#976E44]">{stats.totalZoneManagers}</span>
                    <span className="text-[#5D6E73] text-sm">Managers</span>
                  </div>
                )}
                {stats.totalZoneUsers !== undefined && stats.totalZoneUsers > 0 && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#6F8A9D]/15 to-[#96AEC2]/10 px-4 py-2.5 rounded-xl border border-[#6F8A9D]/25 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                    <div className="p-1.5 bg-[#96AEC2] rounded-lg">
                      <Users className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-bold text-[#546A7A]">{stats.totalZoneUsers}</span>
                    <span className="text-[#5D6E73] text-sm">Zone Users</span>
                  </div>
                )}
                {stats.totalServicePersons !== undefined && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#82A094]/20 to-[#A2B9AF]/15 px-4 py-2.5 rounded-xl border border-[#82A094]/30 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                    <div className="p-1.5 bg-[#82A094] rounded-lg">
                      <Wrench className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-bold text-[#4F6A64]">{stats.totalServicePersons}</span>
                    <span className="text-[#5D6E73] text-sm">Technicians</span>
                  </div>
                )}
                {stats.totalServiceZones !== undefined && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#A2B9AF]/20 to-[#82A094]/10 px-4 py-2.5 rounded-xl border border-[#A2B9AF]/30 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                    <div className="p-1.5 bg-[#4F6A64] rounded-lg">
                      <Building2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-bold text-[#4F6A64]">{stats.totalServiceZones}</span>
                    <span className="text-[#5D6E73] text-sm">Zones</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <CreateTicketButton 
              className="bg-gradient-to-r from-[#E17F70] via-[#CE9F6B] to-[#82A094] bg-size-200 hover:bg-pos-100 text-white font-semibold shadow-lg shadow-[#E17F70]/30 hover:shadow-xl hover:scale-[1.02] transition-all rounded-xl px-5 py-2.5"
            >
              Create New Ticket
            </CreateTicketButton>
            <Button
              onClick={onRefresh}
              variant="outline"
              className="border-2 border-[#96AEC2]/40 bg-white/80 hover:bg-[#96AEC2]/10 hover:border-[#6F8A9D]/50 text-[#546A7A] font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all rounded-xl px-5"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
