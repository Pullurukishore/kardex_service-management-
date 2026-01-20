'use client';

import React from 'react';
import { RefreshCw, MapPin, Users, Wrench, Server, Calendar, Clock, BarChart3, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CreateTicketButton from '@/components/tickets/CreateTicketButton';

interface ZoneExecutiveHeaderProps {
  zoneData: {
    id: number;
    name: string;
    description: string;
    totalCustomers?: number;
    totalTechnicians?: number;
    totalZoneUsers?: number;
    totalZoneManagers?: number;
    totalAssets?: number;
  };
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function ZoneExecutiveHeader({ 
  zoneData, 
  onRefresh, 
  isRefreshing 
}: ZoneExecutiveHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#E17F70] to-[#CE9F6B] rounded-xl shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9E3B47] via-[#E17F70] to-[#CE9F6B] bg-clip-text text-transparent">
                {zoneData.name}
              </h1>
              <p className="text-[#5D6E73] font-medium">Zone Field Service Management & Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-[#757777]">
            <div className="flex items-center gap-1 bg-[#E17F70]/10 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4 text-[#9E3B47]" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1 bg-[#82A094]/10 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-[#82A094]" />
              Last updated: {new Date().toLocaleTimeString()}
              {isRefreshing && <RefreshCw className="w-4 h-4 ml-1 animate-spin text-[#E17F70]" />}
            </div>
          </div>

          {/* Zone Stats */}
          {(zoneData.totalCustomers || zoneData.totalTechnicians || zoneData.totalAssets || zoneData.totalZoneUsers || zoneData.totalZoneManagers) && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {zoneData.totalCustomers && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#E17F70]/20 to-[#EEC1BF]/30 px-4 py-2 rounded-xl shadow-sm border border-[#E17F70]/30">
                  <Users className="h-4 w-4 text-[#9E3B47]" />
                  <span className="font-semibold text-[#9E3B47]">
                    {zoneData.totalCustomers} Customers
                  </span>
                </div>
              )}
              {zoneData.totalZoneManagers !== undefined && zoneData.totalZoneManagers > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-amber-200 px-4 py-2 rounded-xl shadow-sm">
                  <Users className="h-4 w-4 text-[#976E44]" />
                  <span className="font-semibold text-[#976E44]">
                    {zoneData.totalZoneManagers} Zone Managers
                  </span>
                </div>
              )}
              {zoneData.totalZoneUsers !== undefined && zoneData.totalZoneUsers > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#6F8A9D]/20 to-indigo-200 px-4 py-2 rounded-xl shadow-sm">
                  <Users className="h-4 w-4 text-[#546A7A]" />
                  <span className="font-semibold text-[#546A7A]">
                    {zoneData.totalZoneUsers} Zone Users
                  </span>
                </div>
              )}
              {zoneData.totalTechnicians && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#6F8A9D]/20 to-purple-200 px-4 py-2 rounded-xl shadow-sm">
                  <Wrench className="h-4 w-4 text-[#546A7A]" />
                  <span className="font-semibold text-[#546A7A]">
                    {zoneData.totalTechnicians} Technicians
                  </span>
                </div>
              )}
              {zoneData.totalAssets && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#A2B9AF]/20 to-green-200 px-4 py-2 rounded-xl shadow-sm">
                  <Server className="h-4 w-4 text-[#4F6A64]" />
                  <span className="font-semibold text-[#4F6A64]">
                    {zoneData.totalAssets} Assets
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <CreateTicketButton 
              className="bg-gradient-to-r from-[#E17F70] to-[#CE9F6B] hover:from-[#9E3B47] hover:to-[#976E44] flex items-center gap-2 text-white font-semibold shadow-lg"
            >
              Create New Ticket
            </CreateTicketButton>
            <Button
              onClick={onRefresh}
              variant="default"
              className="bg-gradient-to-r from-[#82A094] to-[#4F6A64] hover:from-[#4F6A64] hover:to-[#546A7A] flex items-center gap-2 text-white"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
