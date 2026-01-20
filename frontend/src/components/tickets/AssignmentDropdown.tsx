"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { User, Users, UserPlus, ChevronDown, Zap } from 'lucide-react';

interface AssignmentDropdownProps {
  onAssignToUser: () => void;
  onAssignToZone: () => void;
  hasZone: boolean;
  disabled?: boolean;
}

export function AssignmentDropdown({ 
  onAssignToUser, 
  onAssignToZone, 
  hasZone,
  disabled = false 
}: AssignmentDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className="h-10 px-4 bg-gradient-to-r from-[#6F8A9D]/10 to-[#EEC1BF]/10 hover:from-[#6F8A9D]/20 hover:to-[#EEC1BF]/20 border-[#6F8A9D] hover:border-[#6F8A9D] text-[#546A7A] hover:text-[#546A7A] transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-full bg-[#6F8A9D]/20 group-hover:bg-[#6F8A9D]/30 transition-colors">
              <UserPlus className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium">Assign Ticket</span>
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 p-2" align="end">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b mb-2">
          Assignment Options
        </div>
        
        <DropdownMenuItem 
          onClick={onAssignToUser}
          className="p-3 cursor-pointer hover:bg-[#96AEC2]/10 rounded-lg transition-colors group"
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="p-2 rounded-full bg-[#96AEC2]/20 group-hover:bg-[#96AEC2]/30 transition-colors">
              <User className="h-4 w-4 text-[#546A7A]" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Assign to Service Person</div>
              <div className="text-xs text-muted-foreground">Send directly to field technician</div>
            </div>
            <Zap className="h-4 w-4 text-[#6F8A9D] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </DropdownMenuItem>
        
        {hasZone && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem 
              onClick={onAssignToZone}
              className="p-3 cursor-pointer hover:bg-[#82A094]/10 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="p-2 rounded-full bg-[#82A094]/20 group-hover:bg-[#82A094]/30 transition-colors">
                  <Users className="h-4 w-4 text-[#4F6A64]" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Assign to Zone User</div>
                  <div className="text-xs text-muted-foreground">Delegate to zone coordinator</div>
                </div>
                <Zap className="h-4 w-4 text-[#82A094] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
