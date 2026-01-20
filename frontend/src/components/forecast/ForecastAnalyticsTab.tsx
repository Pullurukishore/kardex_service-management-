'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, TrendingUp, TrendingDown, Target, BarChart3, 
  PieChart, Activity, Zap, Award, Users, Building2,
  ArrowUpRight, ArrowDownRight, Calendar, Package, 
  IndianRupee, Percent, FileText, UserCheck, Trophy,
  Star, Medal, Crown, Flame, Sparkles, ChevronRight
} from 'lucide-react'
import { apiService } from '@/services/api'

interface Props {
  year: number
}

const zoneColors: Record<string, { bg: string; gradient: string; text: string; border: string }> = {
  WEST: { bg: 'bg-[#96AEC2]/100', gradient: 'from-[#6F8A9D] to-[#546A7A]', text: 'text-[#546A7A]', border: 'border-[#6F8A9D]' },
  SOUTH: { bg: 'bg-[#82A094]/100', gradient: 'from-[#82A094] to-[#4F6A64]', text: 'text-[#4F6A64]', border: 'border-[#82A094]' },
  NORTH: { bg: 'bg-[#CE9F6B]/100', gradient: 'from-[#CE9F6B] to-[#976E44]', text: 'text-[#976E44]', border: 'border-[#CE9F6B]' },
  EAST: { bg: 'bg-[#6F8A9D]/100', gradient: 'from-[#6F8A9D] to-[#9E3B47]', text: 'text-[#546A7A]', border: 'border-[#6F8A9D]' },
}

const getZoneColor = (name: string) => zoneColors[name?.toUpperCase()] || { bg: 'bg-[#AEBFC3]/100', gradient: 'from-[#757777] to-[#5D6E73]', text: 'text-[#5D6E73]', border: 'border-slate-500' }

export default function ForecastAnalyticsTab({ year }: Props) {
  const [loading, setLoading] = useState(true)
  const [summaryData, setSummaryData] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [poExpectedData, setPOExpectedData] = useState<any>(null)
  const [productUserZoneData, setProductUserZoneData] = useState<any>(null)
  const [productWiseData, setProductWiseData] = useState<any>(null)

  // Refs to prevent duplicate API calls (React StrictMode protection)
  const hasFetchedInitialData = useRef(false)
  const isFetching = useRef(false)

  const fetchData = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetching.current) return
    isFetching.current = true

    try {
      setLoading(true)
      const [summary, monthly, poExpected, productUserZone, productWise] = await Promise.all([
        apiService.getForecastSummary({ year }),
        apiService.getForecastMonthly({ year }),
        apiService.getPOExpectedMonthBreakdown({ year }),
        apiService.getProductUserZoneBreakdown({ year }),
        apiService.getProductWiseForecast({ year }),
      ])
      setSummaryData(summary)
      setMonthlyData(monthly)
      setPOExpectedData(poExpected)
      setProductUserZoneData(productUserZone)
      setProductWiseData(productWise)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [year])

  useEffect(() => {
    // Skip if already fetched (React Strict Mode protection)
    if (hasFetchedInitialData.current) return
    hasFetchedInitialData.current = true
    fetchData()
  }, [fetchData])

  const formatCurrency = (value: number) => {
    if (!value) return '₹0'
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
    return `₹${new Intl.NumberFormat('en-IN').format(value)}`
  }

  const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value || 0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#6F8A9D]/50 border-t-violet-600 rounded-full animate-spin" />
          <BarChart3 className="absolute inset-0 m-auto h-8 w-8 text-[#6F8A9D]" />
        </div>
        <p className="text-[#5D6E73] font-semibold animate-pulse">Analyzing Forecast Data...</p>
      </div>
    )
  }

  if (!summaryData) return null

  // ============ CALCULATE ALL ANALYTICS ============
  const zones = summaryData.zones || []
  const totals = summaryData.totals || {}
  const totalOffers = totals.noOfOffers || 0
  const totalValue = totals.offersValue || 0
  const totalWon = totals.ordersReceived || 0
  const totalOpen = totals.openFunnel || 0
  const totalTarget = totals.yearlyTarget || 0
  const overallHitRate = totalValue > 0 ? (totalWon / totalValue) * 100 : 0
  const targetAchievement = totalTarget > 0 ? (totalWon / totalTarget) * 100 : 0
  const avgOfferValue = totalOffers > 0 ? totalValue / totalOffers : 0
  const targetGap = totalTarget - totalWon

  // Zone rankings
  const zoneRankings = [...zones].sort((a: any, b: any) => b.ordersReceived - a.ordersReceived)
  const zonesByAchievement = [...zones].sort((a: any, b: any) => {
    const aAch = a.yearlyTarget > 0 ? a.ordersReceived / a.yearlyTarget : 0
    const bAch = b.yearlyTarget > 0 ? b.ordersReceived / b.yearlyTarget : 0
    return bAch - aAch
  })

  // Monthly data analysis
  const monthlyBreakdown = monthlyData?.zones || []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Aggregate monthly totals
  const monthlyAggregates = monthNames.map((m, idx) => {
    let offers = 0, orders = 0
    monthlyBreakdown.forEach((zone: any) => {
      const monthData = zone.monthlyData?.[idx]
      if (monthData) {
        offers += monthData.offersValue || 0
        orders += monthData.orderReceived || 0
      }
    })
    return { month: m, offers, orders, hitRate: offers > 0 ? (orders / offers) * 100 : 0 }
  })
  const bestPerformingMonth = monthlyAggregates.reduce((best, curr) => 
    curr.orders > (best?.orders || 0) ? curr : best, monthlyAggregates[0])

  // PO Expected analysis
  const quarterlyData = poExpectedData?.quarterlyData || []
  const monthlyTotals = poExpectedData?.overallTotals?.monthlyTotals || {}
  const poForecast = poExpectedData?.overallTotals?.grandTotal || 0

  // Product analysis
  const productTotals: Record<string, number> = {}
  const productZones = productUserZoneData?.zones || []
  productZones.forEach((zone: any) => {
    zone.productMatrix?.forEach((p: any) => {
      productTotals[p.productType] = (productTotals[p.productType] || 0) + p.total
    })
  })
  const topProducts = Object.entries(productTotals).sort(([,a],[,b]) => b - a).slice(0, 6)
  const totalProductValue = Object.values(productTotals).reduce((s, v) => s + v, 0)

  // User analysis
  const userStats: Record<number, { name: string; value: number; zone: string }> = {}
  productZones.forEach((zone: any) => {
    zone.users?.forEach((user: any) => {
      const val = zone.userTotals?.[user.id] || 0
      if (!userStats[user.id] || userStats[user.id].value < val) {
        userStats[user.id] = { name: user.name, value: val, zone: zone.zoneName }
      }
    })
  })
  const topUsers = Object.values(userStats).sort((a, b) => b.value - a.value).slice(0, 8)

  // Product-wise totals
  const pwZones = productWiseData?.zones || []
  const pwProductTotals: Record<string, number> = {}
  pwZones.forEach((zone: any) => {
    zone.users?.forEach((user: any) => {
      user.products?.forEach((p: any) => {
        pwProductTotals[p.productType] = (pwProductTotals[p.productType] || 0) + p.total
      })
    })
  })

  return (
    <div className="space-y-8">
      {/* ===== ANALYTICS HEADER ===== */}
      <div className="relative overflow-hidden p-6 bg-gradient-to-br from-violet-900 via-purple-900 to-[#546A7A] rounded-3xl border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#6F8A9D]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#6F8A9D]/20 to-transparent rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Comprehensive Forecast Analytics</h2>
              <p className="text-purple-200/80">Complete insights for {year} • All data sources combined</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm">
              <FileText className="h-4 w-4 mr-2" /> {totalOffers} Offers
            </Badge>
            <Badge className="bg-[#82A094]/100/20 text-[#82A094] border-[#82A094]/30 px-4 py-2 text-sm">
              <TrendingUp className="h-4 w-4 mr-2" /> {formatCurrency(totalWon)} Won
            </Badge>
          </div>
        </div>
      </div>

      {/* ===== EXECUTIVE SUMMARY - BIG METRICS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="col-span-1 border-0 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] shadow-xl shadow-[#6F8A9D]/20 rounded-2xl">
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <IndianRupee className="h-5 w-5 opacity-80" />
              <Badge className="bg-white/20 text-white text-xs">Pipeline</Badge>
            </div>
            <p className="text-3xl font-black">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-white/70 mt-1">Total Offers Value</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-0 bg-gradient-to-br from-[#82A094] to-[#4F6A64] shadow-xl shadow-[#82A094]/20 rounded-2xl">
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Trophy className="h-5 w-5 opacity-80" />
              <Badge className="bg-white/20 text-white text-xs">Won</Badge>
            </div>
            <p className="text-3xl font-black">{formatCurrency(totalWon)}</p>
            <p className="text-sm text-white/70 mt-1">Orders Received</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-0 bg-gradient-to-br from-[#CE9F6B] to-[#976E44] shadow-xl shadow-amber-500/20 rounded-2xl">
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Activity className="h-5 w-5 opacity-80" />
              <Badge className="bg-white/20 text-white text-xs">Open</Badge>
            </div>
            <p className="text-3xl font-black">{formatCurrency(totalOpen)}</p>
            <p className="text-sm text-white/70 mt-1">Open Funnel</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-0 bg-gradient-to-br from-[#6F8A9D] to-[#9E3B47] shadow-xl shadow-[#6F8A9D]/20 rounded-2xl">
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Target className="h-5 w-5 opacity-80" />
              <Badge className="bg-white/20 text-white text-xs">{targetAchievement.toFixed(0)}%</Badge>
            </div>
            <p className="text-3xl font-black">{formatCurrency(totalTarget)}</p>
            <p className="text-sm text-white/70 mt-1">Yearly Target</p>
          </CardContent>
        </Card>

        <Card className={`col-span-1 border-0 shadow-xl rounded-2xl ${targetGap <= 0 ? 'bg-gradient-to-br from-[#82A094] to-[#4F6A64] shadow-[#82A094]/20' : 'bg-gradient-to-br from-[#E17F70] to-red-600 shadow-rose-500/20'}`}>
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              {targetGap <= 0 ? <Star className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              <Badge className="bg-white/20 text-white text-xs">{targetGap <= 0 ? 'Exceeded!' : 'Gap'}</Badge>
            </div>
            <p className="text-3xl font-black">{formatCurrency(Math.abs(targetGap))}</p>
            <p className="text-sm text-white/70 mt-1">{targetGap <= 0 ? 'Above Target' : 'Balance to Achieve'}</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== KEY PERFORMANCE INDICATORS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#96AEC2]/20 dark:bg-[#546A7A]/30 rounded-lg">
                <Percent className="h-5 w-5 text-[#546A7A]" />
              </div>
              <span className="text-sm font-bold text-[#5D6E73] dark:text-[#979796]">Hit Rate</span>
            </div>
            <p className="text-4xl font-black text-[#546A7A]">{overallHitRate.toFixed(1)}%</p>
            <p className="text-xs text-[#757777] mt-1">Won Value / Offers Value</p>
          </CardContent>
        </Card>

        <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#82A094]/20 dark:bg-[#4F6A64]/30 rounded-lg">
                <Award className="h-5 w-5 text-[#4F6A64]" />
              </div>
              <span className="text-sm font-bold text-[#5D6E73] dark:text-[#979796]">Achievement</span>
            </div>
            <p className={`text-4xl font-black ${targetAchievement >= 100 ? 'text-[#4F6A64]' : targetAchievement >= 75 ? 'text-[#976E44]' : 'text-[#9E3B47]'}`}>
              {targetAchievement.toFixed(1)}%
            </p>
            <p className="text-xs text-[#757777] mt-1">Target Completion</p>
          </CardContent>
        </Card>

        <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#6F8A9D]/20 dark:bg-[#546A7A]/30 rounded-lg">
                <IndianRupee className="h-5 w-5 text-[#546A7A]" />
              </div>
              <span className="text-sm font-bold text-[#5D6E73] dark:text-[#979796]">Avg Offer</span>
            </div>
            <p className="text-3xl font-black text-[#546A7A]">{formatCurrency(avgOfferValue)}</p>
            <p className="text-xs text-[#757777] mt-1">Average Offer Value</p>
          </CardContent>
        </Card>

        <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#CE9F6B]/20 dark:bg-[#976E44]/30 rounded-lg">
                <Flame className="h-5 w-5 text-[#976E44]" />
              </div>
              <span className="text-sm font-bold text-[#5D6E73] dark:text-[#979796]">Best Month</span>
            </div>
            <p className="text-3xl font-black text-[#976E44]">{bestPerformingMonth?.month}</p>
            <p className="text-xs text-[#757777] mt-1">{formatCurrency(bestPerformingMonth?.orders || 0)} orders</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== ZONE LEADERBOARD ===== */}
      <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#5D6E73] via-slate-800 to-[#5D6E73] py-4 px-6">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
            <Crown className="h-5 w-5 text-[#CE9F6B]" />
            Zone Leaderboard - Performance Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {zoneRankings.map((zone: any, idx: number) => {
              const color = getZoneColor(zone.zoneName)
              const achievement = zone.yearlyTarget > 0 ? (zone.ordersReceived / zone.yearlyTarget) * 100 : 0
              const hitRate = zone.offersValue > 0 ? (zone.ordersReceived / zone.offersValue) * 100 : 0
              
              return (
                <div key={zone.zoneId} className="flex items-center gap-4 p-4 hover:bg-[#AEBFC3]/10 dark:hover:bg-[#546A7A]/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg ${idx === 0 ? 'bg-gradient-to-br from-[#CE9F6B] to-[#976E44]' : idx === 1 ? 'bg-gradient-to-br from-slate-300 to-[#AEBFC3]/100' : idx === 2 ? 'bg-gradient-to-br from-orange-400 to-[#976E44]' : 'bg-[#92A2A5]'}`}>
                    {idx === 0 ? <Crown className="h-5 w-5" /> : idx + 1}
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color.gradient} flex items-center justify-center text-white text-xl font-black shadow-lg`}>
                    {zone.zoneName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#546A7A] dark:text-white text-lg">{zone.zoneName}</p>
                    <div className="flex gap-4 text-xs text-[#757777]">
                      <span>{zone.noOfOffers} offers</span>
                      <span>•</span>
                      <span>Hit Rate: {hitRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-[#546A7A] dark:text-white">{formatCurrency(zone.ordersReceived)}</p>
                    <p className={`text-sm font-bold ${achievement >= 100 ? 'text-[#4F6A64]' : achievement >= 75 ? 'text-[#976E44]' : 'text-[#9E3B47]'}`}>
                      {achievement.toFixed(1)}% of target
                    </p>
                  </div>
                  <div className="w-32">
                    <div className="h-3 bg-[#AEBFC3]/20 dark:bg-[#5D6E73] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${achievement >= 100 ? 'from-[#82A094] to-[#82A094]' : achievement >= 75 ? 'from-[#CE9F6B] to-[#CE9F6B]' : 'from-[#E17F70] to-[#E17F70]'}`}
                        style={{ width: `${Math.min(achievement, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ===== QUARTERLY & MONTHLY ANALYSIS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quarterly Performance */}
        <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] py-4 px-6">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Quarterly Forecast Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
              {quarterlyData.map((q: any, idx: number) => (
                <div key={q.name} className="p-4 bg-[#AEBFC3]/10 dark:bg-[#546A7A] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black ${idx === 0 ? 'bg-gradient-to-br from-[#6F8A9D] to-[#546A7A]' : idx === 1 ? 'bg-gradient-to-br from-[#82A094] to-[#4F6A64]' : idx === 2 ? 'bg-gradient-to-br from-[#CE9F6B] to-[#976E44]' : 'bg-gradient-to-br from-[#6F8A9D] to-[#9E3B47]'}`}>
                        {q.name}
                      </div>
                      <div>
                        <p className="font-bold text-[#546A7A] dark:text-white">{q.name} Forecast</p>
                        <p className="text-xs text-[#757777]">{q.months?.join(', ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#546A7A] dark:text-white">{formatCurrency(q.forecast)}</p>
                      <p className={`text-sm font-bold ${q.deviation >= 0 ? 'text-[#4F6A64]' : 'text-[#9E3B47]'}`}>
                        {q.deviation >= 0 ? '+' : ''}{q.deviation?.toFixed(0)}% vs BU
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-[#92A2A5]/30 dark:bg-[#5D6E73] rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${q.deviation >= 0 ? 'bg-gradient-to-r from-[#82A094] to-[#82A094]' : 'bg-gradient-to-r from-[#E17F70] to-[#E17F70]'}`}
                      style={{ width: `${Math.min(Math.max((q.forecast / (q.bu || 1)) * 100, 0), 150) * (100/150)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#4F6A64] to-[#4F6A64] py-4 px-6">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5" /> Monthly Orders Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-end justify-between gap-1 h-40">
              {monthlyAggregates.map((m, idx) => {
                const maxOrders = Math.max(...monthlyAggregates.map(x => x.orders))
                const heightPercent = maxOrders > 0 ? (m.orders / maxOrders) * 100 : 0
                const isBest = m.month === bestPerformingMonth?.month
                
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex-1 flex items-end">
                      <div 
                        className={`w-full rounded-t-md transition-all duration-500 ${isBest ? 'bg-gradient-to-t from-[#CE9F6B] to-amber-400' : 'bg-gradient-to-t from-[#82A094] to-teal-400'}`}
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        title={formatCurrency(m.orders)}
                      />
                    </div>
                    <span className={`text-[9px] font-bold ${isBest ? 'text-[#976E44]' : 'text-[#757777]'}`}>{m.month}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== TOP PRODUCTS & USERS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#546A7A] to-[#9E3B47] py-4 px-6">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5" /> Top Products by Value
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {topProducts.map(([product, value], idx) => {
                const percent = totalProductValue > 0 ? (value / totalProductValue) * 100 : 0
                return (
                  <div key={product} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${idx === 0 ? 'bg-[#CE9F6B]/100' : idx === 1 ? 'bg-[#92A2A5]' : idx === 2 ? 'bg-[#CE9F6B]/100' : 'bg-[#92A2A5]'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-[#5D6E73] dark:text-[#92A2A5] text-sm truncate">{product.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-[#546A7A] dark:text-white text-sm">{formatCurrency(value)}</span>
                      </div>
                      <div className="h-1.5 bg-[#AEBFC3]/20 dark:bg-[#5D6E73] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#6F8A9D] to-[#E17F70] rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] py-4 px-6">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {topUsers.slice(0, 6).map((user, idx) => {
                const color = getZoneColor(user.zone)
                return (
                  <div key={user.name} className="flex items-center gap-3 p-2 bg-[#AEBFC3]/10 dark:bg-[#546A7A] rounded-lg">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${idx === 0 ? 'bg-[#CE9F6B]/100' : idx === 1 ? 'bg-[#92A2A5]' : idx === 2 ? 'bg-[#CE9F6B]/100' : 'bg-[#92A2A5]'}`}>
                      {idx === 0 ? <Medal className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#5D6E73] dark:text-[#92A2A5] text-sm truncate">{user.name}</p>
                      <p className={`text-[10px] ${color.text}`}>{user.zone}</p>
                    </div>
                    <span className="font-bold text-[#546A7A] dark:text-white">{formatCurrency(user.value)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== PRODUCT DISTRIBUTION ===== */}
      <Card className="border border-[#92A2A5] dark:border-[#5D6E73] shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#976E44] to-red-600 py-4 px-6">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="h-5 w-5" /> Product Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(pwProductTotals)
              .filter(([, v]) => v > 0)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([product, value], idx) => {
                const colors = ['from-[#6F8A9D] to-[#546A7A]', 'from-[#82A094] to-[#4F6A64]', 'from-[#CE9F6B] to-[#976E44]', 'from-[#6F8A9D] to-[#9E3B47]', 'from-[#E17F70] to-red-600']
                return (
                  <div key={product} className={`p-4 rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} text-white`}>
                    <p className="text-xs font-semibold opacity-80 truncate">{product.replace(/_/g, ' ')}</p>
                    <p className="text-xl font-black mt-1">{formatCurrency(value)}</p>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* ===== SUMMARY FOOTER ===== */}
      <Card className="border-0 bg-gradient-to-r from-[#5D6E73] via-slate-800 to-[#5D6E73] shadow-2xl rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#6F8A9D]" />
              <div>
                <p className="text-[#979796] text-xs uppercase">Total Offers</p>
                <p className="text-white font-black text-lg">{formatNumber(totalOffers)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-[#5D6E73]" />
            <div className="flex items-center gap-3">
              <IndianRupee className="h-5 w-5 text-[#82A094]" />
              <div>
                <p className="text-[#979796] text-xs uppercase">Total Won</p>
                <p className="text-[#82A094] font-black text-lg">{formatCurrency(totalWon)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-[#5D6E73]" />
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-[#6F8A9D]" />
              <div>
                <p className="text-[#979796] text-xs uppercase">Target</p>
                <p className="text-white font-black text-lg">{formatCurrency(totalTarget)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-[#5D6E73]" />
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-[#CE9F6B]" />
              <div>
                <p className="text-[#979796] text-xs uppercase">Hit Rate</p>
                <p className="text-[#CE9F6B] font-black text-lg">{overallHitRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="w-px h-10 bg-[#5D6E73]" />
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-pink-400" />
              <div>
                <p className="text-[#979796] text-xs uppercase">Zones</p>
                <p className="text-white font-black text-lg">{zones.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
