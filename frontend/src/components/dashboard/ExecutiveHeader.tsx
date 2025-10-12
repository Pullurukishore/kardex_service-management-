"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Calendar, Clock, RefreshCw, Download, Info } from "lucide-react";
import CreateTicketButton from "@/components/tickets/CreateTicketButton";

interface ExecutiveHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}

export default function ExecutiveHeader({ isRefreshing, onRefresh }: ExecutiveHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 w-full max-w-full">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 w-full max-w-full">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex-shrink-0">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight truncate">
                Executive Dashboard
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium truncate">Business Intelligence & Field Service Analytics</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 w-full max-w-full overflow-hidden">
            <div className="flex items-center gap-1 min-w-0">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Last updated: {new Date().toLocaleTimeString()}</span>
              {isRefreshing && <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 ml-1 animate-spin flex-shrink-0" />}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
          <CreateTicketButton 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Create New Ticket</span>
            <span className="sm:hidden">New Ticket</span>
          </CreateTicketButton>
          <Button
            onClick={onRefresh}
            variant="default"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 whitespace-nowrap"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            <span className="sm:hidden">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>
      
      {/* Business Hours Notice */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg w-full max-w-full overflow-hidden">
        <div className="flex items-start gap-2 text-blue-800">
          <Info className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
          <span className="text-xs sm:text-sm font-medium leading-relaxed">
            Time metrics (Response Time, Resolution Time, Downtime, Onsite Work) are calculated using business hours only (9 AM - 5 PM, Monday to Saturday). Travel times show actual elapsed time.
          </span>
        </div>
      </div>
    </div>
  );
}
