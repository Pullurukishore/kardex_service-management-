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
  WEST: { bg: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600', text: 'text-blue-600', border: 'border-blue-500' },
  SOUTH: { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-600', text: 'text-emerald-600', border: 'border-emerald-500' },
  NORTH: { bg: 'bg-amber-500', gradient: 'from-amber-500 to-orange-600', text: 'text-amber-600', border: 'border-amber-500' },
  EAST: { bg: 'bg-purple-500', gradient: 'from-purple-500 to-pink-600', text: 'text-purple-600', border: 'border-purple-500' },
}

const getZoneColor = (name: string) => zoneColors[name?.toUpperCase()] || { bg: 'bg-slate-500', gradient: 'from-slate-500 to-slate-600', text: 'text-slate-600', border: 'border-slate-500' }

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
          <div className="w-20 h-20 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <BarChart3 className="absolute inset-0 m-auto h-8 w-8 text-violet-500" />
        </div>
        <p className="text-slate-600 font-semibold animate-pulse">Analyzing Forecast Data...</p>
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
      <div className="relative overflow-hidden p-6 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 rounded-3xl border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-3xl" />
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
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-4 py-2 text-sm">
              <TrendingUp className="h-4 w-4 mr-2" /> {formatCurrency(totalWon)} Won
            </Badge>
          </div>
        </div>
      </div>

      {/* ===== EXECUTIVE SUMMARY - BIG METRICS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="col-span-1 border-0 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 rounded-2xl">
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <IndianRupee className="h-5 w-5 opacity-80" />
              <Badge className="bg-white/20 text-white text-xs">Pipeline</Badge>
            </div>
            <p className="text-3xl font-black">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-white/70 mt-1">Total Offers Value</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-0 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 rounded-2xl">
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Trophy className="h-5 w-5 opacity-80" />
              <Badge className="bg-white/20 text-white text-xs">Won</Badge>
            </div>
            <p className="text-3xl font-black">{formatCurrency(totalWon)}</p>
            <p className="text-sm text-white/70 mt-1">Orders Received</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-0 bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/20 rounded-2xl">
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Activity className="h-5 w-5 opacity-80" />
              <Badge className="bg-white/20 text-white text-xs">Open</Badge>
            </div>
            <p className="text-3xl font-black">{formatCurrency(totalOpen)}</p>
            <p className="text-sm text-white/70 mt-1">Open Funnel</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-0 bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl shadow-purple-500/20 rounded-2xl">
          <CardContent className="p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <Target className="h-5 w-5 opacity-80" />
              <Badge className="bg-white/20 text-white text-xs">{targetAchievement.toFixed(0)}%</Badge>
            </div>
            <p className="text-3xl font-black">{formatCurrency(totalTarget)}</p>
            <p className="text-sm text-white/70 mt-1">Yearly Target</p>
          </CardContent>
        </Card>

        <Card className={`col-span-1 border-0 shadow-xl rounded-2xl ${targetGap <= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20' : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20'}`}>
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
        <Card className="border border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Percent className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Hit Rate</span>
            </div>
            <p className="text-4xl font-black text-blue-600">{overallHitRate.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-1">Won Value / Offers Value</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Achievement</span>
            </div>
            <p className={`text-4xl font-black ${targetAchievement >= 100 ? 'text-emerald-600' : targetAchievement >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
              {targetAchievement.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Target Completion</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <IndianRupee className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Avg Offer</span>
            </div>
            <p className="text-3xl font-black text-purple-600">{formatCurrency(avgOfferValue)}</p>
            <p className="text-xs text-slate-500 mt-1">Average Offer Value</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Flame className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Best Month</span>
            </div>
            <p className="text-3xl font-black text-amber-600">{bestPerformingMonth?.month}</p>
            <p className="text-xs text-slate-500 mt-1">{formatCurrency(bestPerformingMonth?.orders || 0)} orders</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== ZONE LEADERBOARD ===== */}
      <Card className="border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-4 px-6">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
            <Crown className="h-5 w-5 text-amber-400" />
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
                <div key={zone.zoneId} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-slate-400'}`}>
                    {idx === 0 ? <Crown className="h-5 w-5" /> : idx + 1}
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color.gradient} flex items-center justify-center text-white text-xl font-black shadow-lg`}>
                    {zone.zoneName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white text-lg">{zone.zoneName}</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>{zone.noOfOffers} offers</span>
                      <span>•</span>
                      <span>Hit Rate: {hitRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-800 dark:text-white">{formatCurrency(zone.ordersReceived)}</p>
                    <p className={`text-sm font-bold ${achievement >= 100 ? 'text-emerald-600' : achievement >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {achievement.toFixed(1)}% of target
                    </p>
                  </div>
                  <div className="w-32">
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${achievement >= 100 ? 'from-emerald-500 to-green-500' : achievement >= 75 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-red-500'}`}
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
        <Card className="border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Quarterly Forecast Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
              {quarterlyData.map((q: any, idx: number) => (
                <div key={q.name} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black ${idx === 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : idx === 1 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : idx === 2 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}>
                        {q.name}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{q.name} Forecast</p>
                        <p className="text-xs text-slate-500">{q.months?.join(', ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-800 dark:text-white">{formatCurrency(q.forecast)}</p>
                      <p className={`text-sm font-bold ${q.deviation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {q.deviation >= 0 ? '+' : ''}{q.deviation?.toFixed(0)}% vs BU
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${q.deviation >= 0 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-rose-500 to-red-500'}`}
                      style={{ width: `${Math.min(Math.max((q.forecast / (q.bu || 1)) * 100, 0), 150) * (100/150)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 py-4 px-6">
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
                        className={`w-full rounded-t-md transition-all duration-500 ${isBest ? 'bg-gradient-to-t from-amber-500 to-amber-400' : 'bg-gradient-to-t from-emerald-500 to-teal-400'}`}
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        title={formatCurrency(m.orders)}
                      />
                    </div>
                    <span className={`text-[9px] font-bold ${isBest ? 'text-amber-600' : 'text-slate-500'}`}>{m.month}</span>
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
        <Card className="border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 py-4 px-6">
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-500' : 'bg-slate-300'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm truncate">{product.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">{formatCurrency(value)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card className="border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 py-4 px-6">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {topUsers.slice(0, 6).map((user, idx) => {
                const color = getZoneColor(user.zone)
                return (
                  <div key={user.name} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-500' : 'bg-slate-300'}`}>
                      {idx === 0 ? <Medal className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm truncate">{user.name}</p>
                      <p className={`text-[10px] ${color.text}`}>{user.zone}</p>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(user.value)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== PRODUCT DISTRIBUTION ===== */}
      <Card className="border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 py-4 px-6">
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
                const colors = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-purple-500 to-pink-600', 'from-rose-500 to-red-600']
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
      <Card className="border-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-slate-400 text-xs uppercase">Total Offers</p>
                <p className="text-white font-black text-lg">{formatNumber(totalOffers)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex items-center gap-3">
              <IndianRupee className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-slate-400 text-xs uppercase">Total Won</p>
                <p className="text-emerald-400 font-black text-lg">{formatCurrency(totalWon)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-slate-400 text-xs uppercase">Target</p>
                <p className="text-white font-black text-lg">{formatCurrency(totalTarget)}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-slate-400 text-xs uppercase">Hit Rate</p>
                <p className="text-amber-400 font-black text-lg">{overallHitRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-pink-400" />
              <div>
                <p className="text-slate-400 text-xs uppercase">Zones</p>
                <p className="text-white font-black text-lg">{zones.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
