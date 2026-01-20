import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Activity, Users, FileText, AlertCircle, HardDrive } from 'lucide-react';

interface CustomerStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    totalOffers?: number;
    totalContacts?: number;
    totalAssets?: number;
  };
}

export default memo(function CustomerStats({ stats }: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      <Card className="bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 border-[#96AEC2]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#546A7A]">Total Customers</p>
              <p className="text-2xl font-bold text-[#546A7A]">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#96AEC2]/100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/20 border-[#A2B9AF]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4F6A64]">Active</p>
              <p className="text-2xl font-bold text-[#4F6A64]">{stats.active}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#A2B9AF]/100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-[#AEBFC3]/10 to-[#AEBFC3]/20 border-[#92A2A5]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#5D6E73]">Inactive</p>
              <p className="text-2xl font-bold text-[#546A7A]">{stats.inactive}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#AEBFC3]/100 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-[#6F8A9D]/10 to-[#6F8A9D]/20 border-[#6F8A9D]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#546A7A]">Total Offers</p>
              <p className="text-2xl font-bold text-[#546A7A]">{stats.totalOffers || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#6F8A9D]/100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-[#EEC1BF]/10 to-[#EEC1BF]/20 border-[#CE9F6B]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#976E44]">Total Contacts</p>
              <p className="text-2xl font-bold text-[#976E44]">{stats.totalContacts || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#CE9F6B]/100 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-[#6F8A9D]/10 to-[#6F8A9D]/20 border-[#546A7A]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#546A7A]">Total Assets</p>
              <p className="text-2xl font-bold text-[#546A7A]">{stats.totalAssets || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#546A7A]/100 flex items-center justify-center">
              <HardDrive className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
