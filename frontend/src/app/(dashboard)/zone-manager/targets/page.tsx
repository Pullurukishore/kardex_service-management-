'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';
import { apiService } from '@/services/api';
import { Plus, Target, TrendingUp, Users, Package, Building2, Edit2, Eye, RefreshCw, Download, Filter, Award, BarChart3, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ZoneTarget {
  id: number;
  serviceZoneId: number;
  targetPeriod: string;
  periodType: 'MONTHLY' | 'YEARLY';
  productType?: string;
  targetValue: number;
  targetOfferCount?: number;
  actualValue: number;
  actualOfferCount: number;
  achievement: number;
  serviceZone: {
    id: number;
    name: string;
  };
}

interface UserTarget {
  id: number;
  userId: number;
  targetPeriod: string;
  periodType: 'MONTHLY' | 'YEARLY';
  targetValue: number;
  targetOfferCount?: number;
  productType?: string;
  actualValue: number;
  actualOfferCount: number;
  achievement: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

type TargetType = 'ZONE' | 'USER';

export default function ZoneManagerTargetsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // ALL HOOKS MUST BE CALLED AT THE TOP - NO CONDITIONAL HOOKS
  const [activeTab, setActiveTab] = useState<TargetType>('ZONE');
  const [periodType, setPeriodType] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
  const [targetPeriod, setTargetPeriod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [zoneTargets, setZoneTargets] = useState<ZoneTarget[]>([]);
  const [userTargets, setUserTargets] = useState<UserTarget[]>([]);
  
  // Protect this page - only ZONE_MANAGER can access
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?callbackUrl=' + encodeURIComponent('/zone-manager/targets'))
      } else if (user?.role !== UserRole.ZONE_MANAGER) {
        router.push('/zone-manager/dashboard')
      }
    }
  }, [authLoading, isAuthenticated, user?.role, router])

  // Initialize with current period once on mount / periodType change
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const currentPeriod = periodType === 'MONTHLY' ? `${year}-${month}` : `${year}`;
    setTargetPeriod(currentPeriod);
  }, [periodType]);

  const calculateMonthlyTargets = (targets: any[]) => {
    return targets;
  };

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const fetchPeriodType = periodType === 'MONTHLY' ? 'YEARLY' : 'YEARLY';
      const fetchTargetPeriod = periodType === 'MONTHLY' ? targetPeriod.split('-')[0] : targetPeriod;
      
      // Get zone manager's zone ID
      const zoneId = user?.serviceZones?.[0]?.serviceZone?.id || (user as any)?.zoneId;
      
      const params = { 
        targetPeriod: fetchTargetPeriod, 
        periodType: fetchPeriodType, 
        grouped: 'true',
        ...(periodType === 'MONTHLY' && { actualValuePeriod: targetPeriod }),
        ...(zoneId && { serviceZoneId: zoneId })
      };
      
      if (activeTab === 'ZONE') {
        const response = await apiService.getZoneTargets(params);
        let targets = response.targets || [];
        // Filter to only this zone manager's zone
        if (zoneId) {
          targets = targets.filter((t: any) => t.serviceZoneId === zoneId || t.serviceZone?.id === zoneId);
        }
        setZoneTargets(calculateMonthlyTargets(targets));
      } else if (activeTab === 'USER') {
        const response = await apiService.getUserTargets(params);
        let targets = response.targets || [];
        // Filter to only users in this zone manager's zone
        if (zoneId) {
          targets = targets.filter((t: any) => t.user?.serviceZoneId === zoneId || t.serviceZoneId === zoneId);
        }
        setUserTargets(calculateMonthlyTargets(targets));
      }
    } catch (error: any) {
      console.error('Failed to fetch targets:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch targets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when period or tab changes
  useEffect(() => {
    if (targetPeriod) {
      fetchTargets();
    }
  }, [activeTab, targetPeriod, periodType]);

  // Early returns AFTER all hooks & effects are registered
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6F8A9D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D6E73] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== UserRole.ZONE_MANAGER) {
    return null;
  }

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 100) return 'bg-gradient-to-r from-[#82A094] to-[#82A094] text-white';
    if (achievement >= 75) return 'bg-gradient-to-r from-yellow-500 to-[#CE9F6B] text-white';
    return 'bg-gradient-to-r from-[#E17F70] to-[#E17F70] text-white';
  };

  const currentTargets = activeTab === 'ZONE' ? zoneTargets : userTargets;
  const totalTargetValue = currentTargets.reduce((sum, t) => sum + t.targetValue, 0);
  const totalActualValue = currentTargets.reduce((sum, t) => sum + t.actualValue, 0);
  const overallAchievement = totalTargetValue > 0 ? (totalActualValue / totalTargetValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 to-[#AEBFC3]/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#6F8A9D] via-[#6F8A9D] to-[#6F8A9D] rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <Target className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  Zone Target Management
                  <Sparkles className="w-8 h-8 text-[#CE9F6B]" />
                </h1>
                <p className="text-[#96AEC2] text-lg">Monitor and manage performance targets for your zone</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchTargets}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white hover:text-white"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {currentTargets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Targets Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#96AEC2]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#96AEC2]/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-[#546A7A] uppercase tracking-widest">Total Targets</p>
                    <p className="text-4xl font-black text-[#546A7A] mt-2">{currentTargets.length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-[#96AEC2] to-[#6F8A9D] rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-[#96AEC2] to-cyan-400 rounded-full" />
              </div>
            </div>

            {/* Target Value Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#546A7A]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-[#546A7A] uppercase tracking-widest">Target Value</p>
                    <p className="text-4xl font-black text-[#546A7A] mt-2">₹{(totalTargetValue / 10000000).toFixed(2)}Cr</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-400 to-[#6F8A9D] rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" />
              </div>
            </div>

            {/* Actual Value Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/20 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#A2B9AF]/40">
              <div className="absolute inset-0 bg-gradient-to-br from-[#A2B9AF]/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-[#4F6A64] uppercase tracking-widest">Actual Value (Won)</p>
                    <p className="text-4xl font-black text-[#4F6A64] mt-2">₹{(totalActualValue / 10000000).toFixed(2)}Cr</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-[#A2B9AF] to-[#82A094] rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-[#A2B9AF] to-green-400 rounded-full" />
              </div>
            </div>

            {/* Achievement Card */}
            <div className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border ${
              overallAchievement >= 100 ? 'bg-gradient-to-br from-[#A2B9AF]/10 to-[#A2B9AF]/20 border-[#A2B9AF]/40' :
              overallAchievement >= 75 ? 'bg-gradient-to-br from-[#EEC1BF]/10 to-[#EEC1BF]/20 border-[#CE9F6B]/40' :
              'bg-gradient-to-br from-[#EEC1BF]/10 to-red-100 border-[#EEC1BF]/40'
            }`}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                overallAchievement >= 100 ? 'bg-gradient-to-br from-[#A2B9AF]/10 to-teal-400/10' :
                overallAchievement >= 75 ? 'bg-gradient-to-br from-[#CE9F6B]/10 to-orange-400/10' :
                'bg-gradient-to-br from-rose-400/10 to-red-400/10'
              }`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-widest ${
                      overallAchievement >= 100 ? 'text-[#4F6A64]' :
                      overallAchievement >= 75 ? 'text-[#976E44]' : 'text-[#9E3B47]'
                    }`}>Achievement</p>
                    <p className={`text-4xl font-black mt-2 ${
                      overallAchievement >= 100 ? 'text-[#4F6A64]' :
                      overallAchievement >= 75 ? 'text-[#976E44]' : 'text-[#75242D]'
                    }`}>
                      {overallAchievement.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow ${
                    overallAchievement >= 100 ? 'bg-gradient-to-br from-[#A2B9AF] to-[#82A094]' :
                    overallAchievement >= 75 ? 'bg-gradient-to-br from-[#CE9F6B] to-[#976E44]' :
                    'bg-gradient-to-br from-rose-400 to-red-600'
                  }`}>
                    <Award className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className={`h-1 rounded-full ${
                  overallAchievement >= 100 ? 'bg-gradient-to-r from-[#A2B9AF] to-teal-400' :
                  overallAchievement >= 75 ? 'bg-gradient-to-r from-[#CE9F6B] to-orange-400' :
                  'bg-gradient-to-r from-rose-400 to-red-400'
                }`} />
              </div>
            </div>
          </div>
        )}

        {/* Period Selector & Tabs */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-white border-b">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-[#546A7A]" />
                <CardTitle className="text-lg">Filter & View Options</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#AEBFC3]0" />
                  <select
                    value={periodType}
                    onChange={(e) => setPeriodType(e.target.value as 'MONTHLY' | 'YEARLY')}
                    className="px-4 py-2 border-2 border-[#92A2A5] rounded-lg focus:ring-2 focus:ring-[#96AEC2] focus:border-[#6F8A9D] font-semibold bg-white hover:border-[#6F8A9D] transition-colors"
                  >
                    <option value="MONTHLY">📅 Monthly View</option>
                    <option value="YEARLY">📆 Yearly Target</option>
                  </select>
                </div>
                <input
                  type={periodType === 'MONTHLY' ? 'month' : 'number'}
                  value={targetPeriod}
                  onChange={(e) => setTargetPeriod(e.target.value)}
                  className="px-4 py-2 border-2 border-[#92A2A5] rounded-lg focus:ring-2 focus:ring-[#96AEC2] focus:border-[#6F8A9D] font-semibold bg-white hover:border-[#6F8A9D] transition-colors"
                  min={periodType === 'YEARLY' ? '2020' : undefined}
                  max={periodType === 'YEARLY' ? '2030' : undefined}
                />
              </div>
            </div>
          </CardHeader>

          {/* Tabs */}
          <div className="px-6 pt-4 pb-0 flex gap-3">
            <Button
              onClick={() => setActiveTab('ZONE')}
              variant={activeTab === 'ZONE' ? 'default' : 'outline'}
              className={`px-6 py-6 font-bold rounded-t-xl transition-all flex items-center gap-2 ${
                activeTab === 'ZONE'
                  ? 'bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] text-white shadow-lg hover:from-[#546A7A] hover:to-[#546A7A]'
                  : 'bg-[#AEBFC3]/10 text-[#5D6E73] hover:bg-[#AEBFC3]/20 border-2'
              }`}
            >
              <Building2 className="w-5 h-5" />
              Zone Targets
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'ZONE' ? 'bg-white/20' : 'bg-[#96AEC2]/20 text-[#546A7A]'
              }`}>
                {zoneTargets.length}
              </span>
            </Button>
            <Button
              onClick={() => setActiveTab('USER')}
              variant={activeTab === 'USER' ? 'default' : 'outline'}
              className={`px-6 py-6 font-bold rounded-t-xl transition-all flex items-center gap-2 ${
                activeTab === 'USER'
                  ? 'bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] text-white shadow-lg hover:from-[#546A7A] hover:to-[#546A7A]'
                  : 'bg-[#AEBFC3]/10 text-[#5D6E73] hover:bg-[#AEBFC3]/20 border-2'
              }`}
            >
              <Users className="w-5 h-5" />
              Zone User Targets
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'USER' ? 'bg-white/20' : 'bg-[#6F8A9D]/20 text-[#546A7A]'
              }`}>
                {userTargets.length}
              </span>
            </Button>
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <Card className="shadow-xl border-0">
            <CardContent className="py-20">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#546A7A] border-t-transparent mb-4"></div>
                <p className="text-[#5D6E73] font-semibold text-xl">Loading targets...</p>
                <p className="text-[#AEBFC3]0 text-sm mt-2">Please wait while we fetch the data</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl border-0 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="sticky top-0 z-20">
                  <tr className={`bg-gradient-to-r ${activeTab === 'ZONE' ? 'from-[#6F8A9D] to-[#6F8A9D]' : 'from-[#6F8A9D] to-[#6F8A9D]'} text-white shadow-lg`}>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        {activeTab === 'ZONE' ? '🏢' : '👤'} {activeTab === 'ZONE' ? 'Zone' : 'User'}
                      </span>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2">🎯 Target Value</span>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2">💰 Actual Value</span>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2">📊 Achievement</span>
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2">⚙️ Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {activeTab === 'ZONE' && zoneTargets.map((target: any) => (
                    <tr key={target.serviceZoneId} className={`group hover:bg-gradient-to-r hover:from-[#96AEC2]/10 hover:to-blue-25 transition-all duration-300 border-l-4 ${!target.id ? 'border-l-[#CE9F6B] bg-[#CE9F6B]/10/30' : 'border-l-blue-400 hover:border-l-blue-600'}`}>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#546A7A] text-base">{target.serviceZone?.name}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#546A7A] text-lg">₹{Number(target?.targetValue || 0).toLocaleString()}</div>
                        <p className="text-xs text-[#AEBFC3]0 mt-1">Target</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#4F6A64] text-lg">₹{Number(target?.actualValue || 0).toLocaleString()}</div>
                        <p className="text-xs text-[#AEBFC3]0 mt-1">Actual</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md w-fit ${getAchievementColor(target.achievement)}`}>
                            {Number(target?.achievement || 0).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Button
                          onClick={() => router.push(`/zone-manager/targets/view?id=${target.serviceZoneId}`)}
                          size="sm"
                          className="bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] hover:from-[#6F8A9D] hover:to-[#546A7A] text-white shadow-md hover:shadow-lg transition-all"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'USER' && userTargets.map((target: any) => (
                    <tr key={target.userId} className={`group hover:bg-gradient-to-r hover:from-[#96AEC2]/10 hover:to-purple-25 transition-all duration-300 border-l-4 ${!target.id ? 'border-l-[#CE9F6B] bg-[#CE9F6B]/10/30' : 'border-l-purple-400 hover:border-l-purple-600'}`}>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#546A7A] text-base">{target.user?.name || 'N/A'}</div>
                        <div className="text-sm text-[#757777] mt-1">{target.user?.email}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#546A7A] text-lg">₹{Number(target?.targetValue || 0).toLocaleString()}</div>
                        <p className="text-xs text-[#AEBFC3]0 mt-1">Target</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#4F6A64] text-lg">₹{Number(target?.actualValue || 0).toLocaleString()}</div>
                        <p className="text-xs text-[#AEBFC3]0 mt-1">Actual</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md w-fit ${getAchievementColor(target.achievement)}`}>
                            {Number(target?.achievement || 0).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Button
                          onClick={() => router.push(`/zone-manager/targets/view?userId=${target.userId}`)}
                          size="sm"
                          className="bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] hover:from-[#6F8A9D] hover:to-[#546A7A] text-white shadow-md hover:shadow-lg transition-all"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {((activeTab === 'ZONE' && zoneTargets.length === 0) ||
                    (activeTab === 'USER' && userTargets.length === 0)) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-[#96AEC2]/20 to-[#96AEC2]/20 rounded-full flex items-center justify-center shadow-lg">
                            <Target className="w-12 h-12 text-[#546A7A]" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-[#546A7A] mb-2">No Targets Found</p>
                            <p className="text-[#5D6E73] text-lg">
                              {activeTab === 'ZONE' ? 'No zone targets set for this period' : 'No user targets set for this period'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
