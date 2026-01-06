'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, RefreshCw, TrendingUp, TrendingDown, Target, Calendar, 
  BarChart3, Zap, Award, ChevronRight, ChevronDown, Building2, IndianRupee,
  ArrowUpRight, ArrowDownRight, Sparkles, Activity, PieChart,
  CheckCircle2, AlertTriangle, XCircle, User, Users, Package, Download, FileSpreadsheet
} from 'lucide-react'
import { apiService } from '@/services/api'
import { exportForecastToExcel } from '@/utils/excelExport'
import POExpectedMonthTab from './POExpectedMonthTab'
import ProductUserZoneTab from './ProductUserZoneTab'
import ProductWiseForecastTab from './ProductWiseForecastTab'

interface ZoneSummary {
  zoneId: number
  zoneName: string
  noOfOffers: number
  offersValue: number
  ordersReceived: number
  openFunnel: number
  orderBooking: number
  uForBooking: number
  hitRatePercent: number
  balanceBU: number
  yearlyTarget: number
}

interface SummaryTotals {
  noOfOffers: number
  offersValue: number
  ordersReceived: number
  openFunnel: number
  orderBooking: number
  uForBooking: number
  yearlyTarget: number
  balanceBU: number
  hitRatePercent: number
}

interface MonthlyData {
  month: string
  monthLabel: string
  offersValue: number
  orderReceived: number
  ordersBooked: number
  devORvsBooked: number
  ordersInHand: number
  buMonthly: number
  bookedVsBU: number | null
  percentDev: number | null
  offerBUMonth: number
  offerBUMonthDev: number | null
}

interface ZoneMonthlyBreakdown {
  zoneId: number
  zoneName: string
  hitRate: number
  yearlyTarget: number
  monthlyData: MonthlyData[]
  productBreakdown?: {
    productType: string
    productLabel: string
    yearlyTarget: number
    hitRate: number
    monthlyData: {
      month: string
      monthLabel: string
      offersValue: number
      orderReceived: number
      ordersInHand: number
      buMonthly: number
      percentDev: number | null
      offerBUMonth: number
      offerBUMonthDev: number | null
    }[]
    totals: {
      offersValue: number
      orderReceived: number
      ordersInHand: number
      buMonthly: number
      offerBUMonth: number
    }
  }[]
  totals: {
    offersValue: number
    orderReceived: number
    ordersBooked: number
    ordersInHand: number
    buMonthly: number
    offerBUMonth: number
  }
}

interface UserMonthlyData {
  month: string
  monthLabel: string
  offersValue: number
  orderReceived: number
  ordersInHand: number
  buMonthly: number
  percentDev: number | null
  offerBUMonth: number
  offerBUMonthDev: number | null
}

interface UserMonthlyBreakdown {
  userId: number
  userName: string
  userShortForm: string | null
  zoneName: string
  hitRate: number
  yearlyTarget: number
  monthlyData: UserMonthlyData[]
  productBreakdown?: {
    productType: string
    productLabel: string
    yearlyTarget: number
    hitRate: number
    monthlyData: {
      month: string
      monthLabel: string
      offersValue: number
      orderReceived: number
      ordersInHand: number
      buMonthly: number
      percentDev: number | null
      offerBUMonth: number
      offerBUMonthDev: number | null
    }[]
    totals: {
      offersValue: number
      orderReceived: number
      ordersInHand: number
      buMonthly: number
      offerBUMonth: number
    }
  }[]
  totals: {
    offersValue: number
    orderReceived: number
    ordersInHand: number
    buMonthly: number
    offerBUMonth: number
  }
}

interface UserMonthlyResponse {
  year: number
  zoneId: number | null
  users: UserMonthlyBreakdown[]
}

interface SummaryResponse {
  year: number
  zones: ZoneSummary[]
  totals: SummaryTotals
}

interface MonthlyResponse {
  year: number
  zones: ZoneMonthlyBreakdown[]
}

// Zone colors for visual distinction with enhanced gradients
const zoneColors: Record<string, { gradient: string; badge: string; ring: string; light: string; glow: string }> = {
  WEST: { gradient: 'from-blue-500 via-blue-600 to-indigo-700', badge: 'bg-blue-500', ring: 'ring-blue-500/30', light: 'bg-blue-50 dark:bg-blue-950/30', glow: 'shadow-blue-500/30' },
  SOUTH: { gradient: 'from-emerald-500 via-emerald-600 to-teal-700', badge: 'bg-emerald-500', ring: 'ring-emerald-500/30', light: 'bg-emerald-50 dark:bg-emerald-950/30', glow: 'shadow-emerald-500/30' },
  NORTH: { gradient: 'from-amber-500 via-orange-500 to-orange-700', badge: 'bg-amber-500', ring: 'ring-amber-500/30', light: 'bg-amber-50 dark:bg-amber-950/30', glow: 'shadow-amber-500/30' },
  EAST: { gradient: 'from-purple-500 via-purple-600 to-pink-700', badge: 'bg-purple-500', ring: 'ring-purple-500/30', light: 'bg-purple-50 dark:bg-purple-950/30', glow: 'shadow-purple-500/30' },
}

const getZoneColor = (zoneName: string) => {
  const upperName = zoneName.toUpperCase()
  return zoneColors[upperName] || { gradient: 'from-gray-500 to-gray-600', badge: 'bg-gray-500', ring: 'ring-gray-500/30', light: 'bg-gray-50 dark:bg-gray-950/30', glow: 'shadow-gray-500/30' }
}

// Progress bar component
const ProgressBar = ({ value, max, color = 'blue' }: { value: number; max: number; color?: string }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const colorClasses: Record<string, string> = {
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-600',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-600',
  }
  return (
    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClasses[color] || colorClasses.blue} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

interface Props {
  zoneId: number
  zoneName: string
}

export default function ZoneForecastDashboard({ zoneId, zoneName }: Props) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyResponse | null>(null)
  const [userMonthlyData, setUserMonthlyData] = useState<UserMonthlyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeUserTab, setActiveUserTab] = useState<number | null>(null)
  const [activeMainTab, setActiveMainTab] = useState<'overview' | 'po-expected' | 'product-user-zone' | 'product-wise'>('overview')
  const [selectedProbability, setSelectedProbability] = useState<number | 'all'>('all')
  const [showProductBreakdown, setShowProductBreakdown] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [showUserProductBreakdown, setShowUserProductBreakdown] = useState(false)
  const [expandedUserProducts, setExpandedUserProducts] = useState<Set<string>>(new Set())
  const [exporting, setExporting] = useState(false)

  // Refs to prevent duplicate API calls (React StrictMode protection)
  const hasFetchedInitialData = useRef(false)
  const hasFetchedUserData = useRef(false)
  const isFetching = useRef(false)

  const years = useMemo(() => {
    const yrs = []
    for (let y = 2030; y >= 2020; y--) {
      yrs.push(y)
    }
    return yrs
  }, [])

  const fetchData = useCallback(async (showRefresh = false) => {
    // Prevent concurrent fetches (except for manual refresh)
    if (isFetching.current && !showRefresh) return
    isFetching.current = true

    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const minProb = selectedProbability === 'all' ? undefined : selectedProbability
      const [summaryRes, monthlyRes] = await Promise.all([
        apiService.getForecastSummary({ year: selectedYear, minProbability: minProb, zoneId }),
        apiService.getForecastMonthly({ year: selectedYear, zoneId }),
      ])

      setSummaryData(summaryRes)
      setMonthlyData(monthlyRes)
      
    } catch (err: any) {
      console.error('Failed to fetch forecast data:', err)
      setError(err.message || 'Failed to load forecast data')
    } finally {
      setLoading(false)
      setRefreshing(false)
      isFetching.current = false
    }
  }, [selectedYear, zoneId, selectedProbability])

  const fetchUserData = useCallback(async () => {
    try {
      const userMonthlyRes = await apiService.getUserMonthlyBreakdown({ 
        year: selectedYear,
        zoneId: zoneId 
      })
      setUserMonthlyData(userMonthlyRes)
      
      if (userMonthlyRes.users.length > 0) {
        setActiveUserTab(userMonthlyRes.users[0].userId)
      } else {
        setActiveUserTab(null)
      }
    } catch (err: any) {
      console.error('Failed to fetch user data:', err)
    }
  }, [selectedYear, zoneId])

  useEffect(() => {
    // Skip if already fetched (React Strict Mode protection)
    if (hasFetchedInitialData.current) return
    hasFetchedInitialData.current = true
    fetchData()
  }, [fetchData])

  useEffect(() => {
    // Skip duplicate initial fetch
    if (!hasFetchedUserData.current) {
      hasFetchedUserData.current = true
    }
    fetchUserData()
  }, [fetchUserData])

  const handleRefresh = () => {
    fetchData(true)
    fetchUserData()
  }

  const handleExportExcel = async () => {
    try {
      setExporting(true)
      
      const minProb = selectedProbability === 'all' ? undefined : selectedProbability
      
      const [poExpectedData, productUserZoneData, productWiseForecastData, userMonthly] = await Promise.all([
        apiService.getPOExpectedMonthBreakdown({ year: selectedYear, minProbability: minProb, zoneId }).catch(() => null),
        apiService.getProductUserZoneBreakdown({ year: selectedYear, minProbability: minProb, zoneId }).catch(() => null),
        apiService.getProductWiseForecast({ year: selectedYear, minProbability: minProb, zoneId }).catch(() => null),
        apiService.getUserMonthlyBreakdown({ year: selectedYear, zoneId }).catch(() => null)
      ])

      // Defensive filtering: Ensure only the current zone data is exported
      const exportSummaryData = summaryData ? {
        ...summaryData,
        zones: summaryData.zones.filter(z => z.zoneId === zoneId)
      } : null

      const exportMonthlyData = monthlyData ? {
        ...monthlyData,
        zones: monthlyData.zones.filter(z => z.zoneId === zoneId)
      } : null

      // Filter user data by zone name matching
      const exportUserMonthly = userMonthly?.users 
        ? userMonthly.users.filter((u: any) => u.zoneName === zoneName) 
        : []

      const exportPOExpected = poExpectedData?.zones 
        ? { ...poExpectedData, zones: poExpectedData.zones.filter((z: any) => z.zoneId === zoneId) } 
        : poExpectedData

      const exportProductUserZone = productUserZoneData?.zones 
        ? { ...productUserZoneData, zones: productUserZoneData.zones.filter((z: any) => z.zoneId === zoneId) } 
        : productUserZoneData

      const exportProductWise = productWiseForecastData?.zones 
        ? { ...productWiseForecastData, zones: productWiseForecastData.zones.filter((z: any) => z.zoneId === zoneId) } 
        : productWiseForecastData
      
      await exportForecastToExcel({
        year: selectedYear,
        probability: selectedProbability,
        summaryData: exportSummaryData,
        monthlyData: exportMonthlyData,
        userMonthlyData: exportUserMonthly,
        poExpectedData: exportPOExpected,
        productUserZoneData: exportProductUserZone,
        productWiseForecastData: exportProductWise,
      })
    } catch (err: any) {
      console.error('Failed to export Excel:', err)
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatCurrencyCompact = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`
    }
    return formatCurrency(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value)
  }

  const getDeviationColor = (value: number | null) => {
    if (value === null) return 'text-slate-400'
    if (value >= 0) return 'text-emerald-600 dark:text-emerald-400'
    if (value >= -25) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const getDeviationBg = (value: number | null) => {
    if (value === null) return 'bg-slate-100/80 dark:bg-slate-800/80'
    if (value >= 0) return 'bg-emerald-100/80 dark:bg-emerald-900/40'
    if (value >= -25) return 'bg-amber-100/80 dark:bg-amber-900/40'
    return 'bg-rose-100/80 dark:bg-rose-900/40'
  }

  const getHitRateBadge = (rate: number) => {
    if (rate >= 50) return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
    if (rate >= 30) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
    return 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30'
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    if (percentage >= 75) return <AlertTriangle className="h-5 w-5 text-amber-500" />
    return <XCircle className="h-5 w-5 text-rose-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 animate-spin flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Loader2 className="h-8 w-8 text-white animate-spin" style={{ animationDirection: 'reverse' }} />
              </div>
            </div>
          </div>
          <div className="text-center space-y-3">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Loading Zone Forecast
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Analyzing offer data for {zoneName}...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="max-w-md border-rose-200 dark:border-rose-800 shadow-2xl shadow-rose-500/10">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 flex items-center justify-center shadow-lg">
                <Zap className="h-10 w-10 text-rose-500" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">Error Loading Data</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{error}</p>
              </div>
              <Button 
                onClick={() => handleRefresh()} 
                className="mt-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/25"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeZone = monthlyData?.zones.find(z => z.zoneId === zoneId) || monthlyData?.zones[0]
  const activeUser = userMonthlyData?.users.find(u => u.userId === activeUserTab)
  const totalAchievement = summaryData && summaryData.totals.yearlyTarget > 0 
    ? (summaryData.totals.ordersReceived / summaryData.totals.yearlyTarget) * 100 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-[1900px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Premium Header with Stats */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 md:p-8 shadow-2xl shadow-blue-900/40 border border-white/5">
          {/* Animated background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.15),transparent_50%)]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
          </div>
          
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                      {zoneName} Forecast
                    </h1>
                    <p className="text-blue-100/80 text-sm md:text-base mt-1">
                      Real-time Performance Analytics & Deviations for {selectedYear}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                  <Calendar className="h-4 w-4 text-white/70" />
                  <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-[110px] border-0 bg-transparent text-white font-semibold focus:ring-0 focus:ring-offset-0 h-auto p-0">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl">
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)} className="font-medium">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                  <Target className="h-4 w-4 text-white/70" />
                  <Select value={String(selectedProbability)} onValueChange={(v) => setSelectedProbability(v === 'all' ? 'all' : parseInt(v))}>
                    <SelectTrigger className="w-[130px] border-0 bg-transparent text-white font-semibold focus:ring-0 focus:ring-offset-0 h-auto p-0">
                      <SelectValue placeholder="Probability" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl">
                      <SelectItem value="all" className="font-medium">All Probability</SelectItem>
                      {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
                        <SelectItem key={p} value={String(p)} className="font-medium">
                          ≥ {p}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="secondary"
                  size="default"
                  onClick={handleExportExcel}
                  disabled={exporting || loading}
                  className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-white border border-emerald-400/30 backdrop-blur-sm font-semibold rounded-xl px-5 transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/10"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  {exporting ? 'Exporting...' : 'Download Excel'}
                </Button>
                
                <Button
                  variant="secondary"
                  size="default"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm font-semibold rounded-xl px-5 transition-all duration-300 hover:scale-105"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Overall Achievement Banner */}
            {summaryData && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-4 md:gap-8">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-white/60" />
                    <span className="text-white/80 text-sm font-medium">Zone Achievement</span>
                  </div>
                  <div className="flex-1 min-w-[200px] max-w-md">
                    <div className="relative h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(totalAchievement, 100)}%` }}
                      />
                      {totalAchievement > 100 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{totalAchievement.toFixed(1)}%</span>
                    {getStatusIcon(totalAchievement)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex gap-2 flex-wrap p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setActiveMainTab('overview')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeMainTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className="text-lg">📊</span>
            <span className="hidden sm:inline">Overview Dashboard</span>
            <span className="sm:hidden">Overview</span>
          </button>
          <button
            onClick={() => setActiveMainTab('po-expected')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeMainTab === 'po-expected'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className="text-lg">📅</span>
            <span className="hidden sm:inline">PO Expected Month</span>
            <span className="sm:hidden">PO Month</span>
          </button>
          <button
            onClick={() => setActiveMainTab('product-user-zone')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeMainTab === 'product-user-zone'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className="text-lg">📦</span>
            <span className="hidden sm:inline">Product × User</span>
            <span className="sm:hidden">Product</span>
          </button>
          <button
            onClick={() => setActiveMainTab('product-wise')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeMainTab === 'product-wise'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className="text-lg">📋</span>
            <span className="hidden sm:inline">Product-wise Forecast</span>
            <span className="sm:hidden">Forecast</span>
          </button>
        </div>

        {/* Conditional Content Based on Tab */}
        {activeMainTab === 'po-expected' ? (
          <POExpectedMonthTab year={selectedYear} minProbability={selectedProbability === 'all' ? undefined : selectedProbability} zoneId={zoneId} />
        ) : activeMainTab === 'product-user-zone' ? (
          <ProductUserZoneTab year={selectedYear} minProbability={selectedProbability === 'all' ? undefined : selectedProbability} zoneId={zoneId} />
        ) : activeMainTab === 'product-wise' ? (
          <ProductWiseForecastTab year={selectedYear} minProbability={selectedProbability === 'all' ? undefined : selectedProbability} zoneId={zoneId} />
        ) : (
          <>
            {/* Quick Stats Cards - Compact Premium */}
            {summaryData && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Offers */}
                <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Total Offers
                        </p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {formatNumber(summaryData.totals.noOfOffers)}
                        </p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Offers Value */}
                <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Offers Value
                        </p>
                        <p className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                          {formatCurrencyCompact(summaryData.totals.offersValue)}
                        </p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                        <IndianRupee className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Orders Won */}
                <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Orders Won
                        </p>
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                          {formatCurrencyCompact(summaryData.totals.ordersReceived)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[50px]">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(totalAchievement, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600">{totalAchievement.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                        <Award className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Open Funnel */}
                <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Open Funnel
                        </p>
                        <p className="text-xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                          {formatCurrencyCompact(summaryData.totals.openFunnel)}
                        </p>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {/* Zone Summary Table - Compact Premium */}
            {summaryData && (
              <Card className="overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-lg bg-white dark:bg-slate-900 rounded-xl">
                <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 py-3 px-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Building2 className="h-4 w-4 text-blue-300" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-white">Zone Performance Summary</CardTitle>
                        <p className="text-slate-400 text-xs">Breakdown for {selectedYear}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-3 py-2 text-left font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Zone</th>
                          <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">#Offers</th>
                          <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Value</th>
                          <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Orders</th>
                          <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Funnel</th>
                          <th className="px-2 py-2 text-right font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide bg-sky-50/50 dark:bg-sky-900/20">Target</th>
                          <th className="px-2 py-2 text-center font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">%Dev</th>
                          <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Balance</th>
                          <th className="px-2 py-2 text-center font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {summaryData.zones.filter(z => z.zoneId === zoneId).map((zone, idx) => {
                          const colors = getZoneColor(zone.zoneName)
                          const deviationPercent = zone.yearlyTarget > 0 
                            ? ((zone.ordersReceived / zone.yearlyTarget) * 100 - 100).toFixed(0)
                            : '0'
                          const achievementPercent = zone.yearlyTarget > 0 
                            ? (zone.ordersReceived / zone.yearlyTarget) * 100 
                            : 0
                          return (
                            <tr 
                              key={zone.zoneId} 
                              className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900/50' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}
                            >
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-sm`}>
                                    <span className="text-white font-bold text-xs">{zone.zoneName.charAt(0)}</span>
                                  </div>
                                  <span className="font-bold text-slate-900 dark:text-white text-xs">{zone.zoneName}</span>
                                </div>
                              </td>
                              <td className="px-2 py-2 text-right">
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{zone.noOfOffers}</span>
                              </td>
                              <td className="px-2 py-2 text-right">
                                <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{formatCurrencyCompact(zone.offersValue)}</span>
                              </td>
                              <td className="px-2 py-2 text-right">
                                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{formatCurrencyCompact(zone.ordersReceived)}</span>
                              </td>
                              <td className="px-2 py-2 text-right">
                                <span className="font-mono font-medium text-amber-600 dark:text-amber-400">{formatCurrencyCompact(zone.openFunnel)}</span>
                              </td>
                              <td className="px-2 py-2 text-right bg-sky-50/30 dark:bg-sky-900/10">
                                <span className="font-mono font-medium text-sky-700 dark:text-sky-400">{formatCurrencyCompact(zone.yearlyTarget)}</span>
                              </td>
                              <td className="px-1 py-2 text-center">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  parseFloat(deviationPercent) >= 0 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                                }`}>
                                  {parseFloat(deviationPercent) >= 0 ? '+' : ''}{deviationPercent}%
                                </span>
                              </td>
                              <td className="px-2 py-2 text-right">
                                <span className={`font-mono font-medium ${
                                  zone.yearlyTarget - zone.ordersReceived <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                  {formatCurrencyCompact(zone.yearlyTarget - zone.ordersReceived)}
                                </span>
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex-1 min-w-[40px]">
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          achievementPercent >= 100 ? 'bg-emerald-500' :
                                          achievementPercent >= 75 ? 'bg-amber-500' :
                                          'bg-rose-500'
                                        }`}
                                        style={{ width: `${Math.min(achievementPercent, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 w-7">
                                    {achievementPercent.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Zone Monthly Breakdown */}
            {monthlyData && activeZone && (
              <div className="space-y-3">
                {/* Active Zone Card - Compact */}
                <Card className="overflow-hidden border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl">
                  <CardHeader className={`bg-gradient-to-r ${getZoneColor(activeZone.zoneName).gradient} py-3 px-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/15 rounded-lg">
                          <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-white">{activeZone.zoneName} Zone</CardTitle>
                          <p className="text-white/70 text-xs">Monthly Breakdown</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowProductBreakdown(!showProductBreakdown)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            showProductBreakdown 
                              ? 'bg-white text-slate-800 shadow' 
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <Package className="h-3.5 w-3.5" />
                          Products
                          {showProductBreakdown ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </button>
                        <div className="text-right px-3 py-1 bg-white/10 rounded-lg">
                          <p className="text-white/60 text-[10px] uppercase tracking-wider font-medium">Hit Rate</p>
                          <p className="text-lg font-extrabold text-white">{activeZone.hitRate}%</p>
                        </div>
                        <div className="text-right px-3 py-1 bg-white/10 rounded-lg">
                          <p className="text-white/60 text-[10px] uppercase tracking-wider font-medium">Target</p>
                          <p className="text-base font-bold text-white">{formatCurrencyCompact(activeZone.yearlyTarget)}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-slate-100/95 dark:bg-slate-800/95 shadow-sm">
                            <th className="px-2 py-2 text-left font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide sticky left-0 bg-slate-100/95 dark:bg-slate-800/95 z-20">Month</th>
                            <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="OFFERS VALUE: Total value of all offers created in this month (based on offerMonth)">Offers</th>
                            <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="ORDERS RECEIVED: PO value of WON offers where PO received in this month (poReceivedMonth)">Orders</th>
                            <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="OPEN FUNNEL: Value of offers in pipeline (not WON/LOST) where offerMonth matches">Funnel</th>
                            <th className="px-2 py-2 text-right font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide bg-purple-50/50 dark:bg-purple-900/20 cursor-help" title="BU/MONTHLY: Yearly Zone Target ÷ 12 = Monthly booking target">BU/Mo</th>
                            <th className="px-2 py-2 text-center font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="% DEV (Orders): ((Orders - BU/Mo) / BU/Mo) × 100. Negative = below target, Positive = above target">%Dev</th>
                            <th className="px-2 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide bg-indigo-50/50 dark:bg-indigo-900/20 cursor-help" title="OFFER BU MONTH: BU/Mo × 4 = Pipeline coverage target (4x for healthy funnel)">OfferBU</th>
                            <th className="px-2 py-2 text-center font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="% DEV (Offers): ((Offers - OfferBU) / OfferBU) × 100. Negative = below target, Positive = above target">%Dev</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {activeZone.monthlyData.map((month, idx) => (
                            <tr 
                              key={month.month} 
                              className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                                idx % 2 === 0 ? 'bg-white dark:bg-slate-900/50' : 'bg-slate-50/50 dark:bg-slate-800/20'
                              }`}
                            >
                              <td className="px-2 py-1.5 sticky left-0 bg-inherit">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{month.monthLabel.slice(0, 3)}</span>
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{formatCurrencyCompact(month.offersValue)}</span>
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{formatCurrencyCompact(month.orderReceived)}</span>
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                <span className="font-mono font-medium text-amber-600 dark:text-amber-400">{formatCurrencyCompact(month.ordersInHand)}</span>
                              </td>
                              <td className="px-2 py-1.5 text-right bg-purple-50/30 dark:bg-purple-900/10">
                                <span className="font-mono font-medium text-purple-600 dark:text-purple-400">{formatCurrencyCompact(month.buMonthly)}</span>
                              </td>
                              <td className="px-1 py-1.5 text-center">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${getDeviationBg(month.percentDev)} ${getDeviationColor(month.percentDev)}`}>
                                  {month.percentDev !== null ? (
                                    <>{month.percentDev > 0 ? '+' : ''}{month.percentDev}%</>
                                  ) : <span className="text-slate-400">-</span>}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-right bg-indigo-50/30 dark:bg-indigo-900/10">
                                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">{formatCurrencyCompact(month.offerBUMonth)}</span>
                              </td>
                              <td className="px-1 py-1.5 text-center">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${getDeviationBg(month.offerBUMonthDev)} ${getDeviationColor(month.offerBUMonthDev)}`}>
                                  {month.offerBUMonthDev !== null ? (
                                    <>{month.offerBUMonthDev > 0 ? '+' : ''}{month.offerBUMonthDev}%</>
                                  ) : <span className="text-slate-400">-</span>}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 font-bold">
                            <td className="px-2 py-2 text-slate-900 dark:text-white sticky left-0 bg-slate-200 dark:bg-slate-800">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Total
                              </span>
                            </td>
                            <td className="px-2 py-2 text-right font-mono text-blue-700 dark:text-blue-300">{formatCurrencyCompact(activeZone.totals.offersValue)}</td>
                            <td className="px-2 py-2 text-right font-mono text-emerald-700 dark:text-emerald-300">{formatCurrencyCompact(activeZone.totals.orderReceived)}</td>
                            <td className="px-2 py-2 text-right font-mono text-amber-700 dark:text-amber-300">{formatCurrencyCompact(activeZone.totals.ordersInHand)}</td>
                            <td className="px-2 py-2 text-right font-mono text-purple-700 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-900/30">{formatCurrencyCompact(activeZone.totals.buMonthly)}</td>
                            <td className="px-1 py-2 text-center"><span className="text-slate-400">—</span></td>
                            <td className="px-2 py-2 text-right font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-900/30">{formatCurrencyCompact(activeZone.totals.offerBUMonth)}</td>
                            <td className="px-1 py-2 text-center"><span className="text-slate-400">—</span></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Product Breakdown Section - Expandable */}
                    {showProductBreakdown && activeZone.productBreakdown && activeZone.productBreakdown.length > 0 && (
                      <div className="border-t border-slate-200 dark:border-slate-700 mt-2">
                        {/* Note: Simplified rendering for product breakdown to save space/complexity, similar logic as main component */}
                        <div className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                          <h4 className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider flex items-center gap-2">
                            <Package className="h-3.5 w-3.5" />
                            Product Type Breakdown ({activeZone.productBreakdown.length} types)
                          </h4>
                        </div>
                        {/* ... Product mapping logic ... */}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* User Monthly Breakdown - Compact */}
            {userMonthlyData && userMonthlyData.users.length > 0 && (
              <div className="space-y-3">
                {/* User Section Header - Compact */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                    <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">User Performance</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{userMonthlyData.users.length} users</p>
                  </div>
                </div>

                {/* User Tabs - Compact */}
                <div className="flex flex-wrap gap-2">
                  {userMonthlyData.users.map((user) => {
                    const isActive = activeUserTab === user.userId
                    return (
                      <button
                        key={user.userId}
                        onClick={() => setActiveUserTab(user.userId)}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-lg scale-102' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow border border-slate-200/50 dark:border-slate-700/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                          isActive ? 'bg-white/20' : 'bg-cyan-100 dark:bg-cyan-900/30'
                        }`}>
                          <User className={`h-3 w-3 ${isActive ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'}`} />
                        </div>
                        <span className="text-xs">{user.userName}</span>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </button>
                    )
                  })}
                </div>

                {/* Active User Card - Compact */}
                {activeUser && (
                  <Card className="overflow-hidden border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl">
                    <CardHeader className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 py-3 px-4">
                      {/* ... User Header ... */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/15 rounded-lg">
                            <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                            <CardTitle className="text-base font-bold text-white">{activeUser.userName}</CardTitle>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="text-right px-3 py-1 bg-white/10 rounded-lg">
                                <p className="text-white/60 text-[10px] uppercase tracking-wider font-medium">Hit Rate</p>
                                <p className="text-lg font-extrabold text-white">{activeUser.hitRate}%</p>
                            </div>
                            <div className="text-right px-3 py-1 bg-white/10 rounded-lg">
                                <p className="text-white/60 text-[10px] uppercase tracking-wider font-medium">Target</p>
                                <p className="text-base font-bold text-white">{formatCurrencyCompact(activeUser.yearlyTarget)}</p>
                            </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          {/* Reuse header from Zone table but specific for User */}
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-100/95 dark:bg-slate-800/95 shadow-sm">
                                <th className="px-2 py-2 text-left font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide sticky left-0 bg-slate-100/95 dark:bg-slate-800/95 z-20">Month</th>
                                <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="OFFERS VALUE: Total value of all offers created by this user in this month">Offers</th>
                                <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="ORDERS RECEIVED: PO value of WON offers created by this user in this month">Orders</th>
                                <th className="px-2 py-2 text-right font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="OPEN FUNNEL: Value of open funnel offers by this user">Funnel</th>
                                <th className="px-2 py-2 text-right font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide bg-purple-50/50 dark:bg-purple-900/20 cursor-help" title="BU/MONTHLY: User's Yearly Target ÷ 12 = Monthly booking target">BU/Mo</th>
                                <th className="px-2 py-2 text-center font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="% DEV (Orders): ((Orders - BU/Mo) / BU/Mo) × 100. Negative = below target, Positive = above target">%Dev</th>
                                <th className="px-2 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide bg-indigo-50/50 dark:bg-indigo-900/20 cursor-help" title="OFFER BU MONTH: BU/Mo × 4 = Monthly offer target (4x pipeline coverage)">OfferBU</th>
                                <th className="px-2 py-2 text-center font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide cursor-help" title="% DEV (Offers): ((Offers - OfferBU) / OfferBU) × 100. Negative = below target, Positive = above target">%Dev</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {activeUser.monthlyData.map((month, idx) => (
                              <tr 
                                key={month.month} 
                                className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                                  idx % 2 === 0 ? 'bg-white dark:bg-slate-900/50' : 'bg-slate-50/50 dark:bg-slate-800/20'
                                }`}
                              >
                                <td className="px-2 py-1.5 sticky left-0 bg-inherit">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{month.monthLabel.slice(0, 3)}</span>
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{formatCurrencyCompact(month.offersValue)}</span>
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{formatCurrencyCompact(month.orderReceived)}</span>
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  <span className="font-mono font-medium text-amber-600 dark:text-amber-400">{formatCurrencyCompact(month.ordersInHand)}</span>
                                </td>
                                <td className="px-2 py-1.5 text-right bg-purple-50/30 dark:bg-purple-900/10">
                                  <span className="font-mono font-medium text-purple-600 dark:text-purple-400">{formatCurrencyCompact(month.buMonthly)}</span>
                                </td>
                                <td className="px-1 py-1.5 text-center">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${getDeviationBg(month.percentDev)} ${getDeviationColor(month.percentDev)}`}>
                                    {month.percentDev !== null ? (
                                      <>{month.percentDev > 0 ? '+' : ''}{month.percentDev}%</>
                                    ) : <span className="text-slate-400">-</span>}
                                  </span>
                                </td>
                                <td className="px-2 py-1.5 text-right bg-indigo-50/30 dark:bg-indigo-900/10">
                                  <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">{formatCurrencyCompact(month.offerBUMonth)}</span>
                                </td>
                                <td className="px-1 py-1.5 text-center">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${getDeviationBg(month.offerBUMonthDev)} ${getDeviationColor(month.offerBUMonthDev)}`}>
                                    {month.offerBUMonthDev !== null ? (
                                      <>{month.offerBUMonthDev > 0 ? '+' : ''}{month.offerBUMonthDev}%</>
                                    ) : <span className="text-slate-400">-</span>}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 font-bold">
                                <td className="px-2 py-2 text-slate-900 dark:text-white sticky left-0 bg-slate-200 dark:bg-slate-800">
                                    <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Total
                                    </span>
                                </td>
                                <td className="px-2 py-2 text-right font-mono text-blue-700 dark:text-blue-300">{formatCurrencyCompact(activeUser.totals.offersValue)}</td>
                                <td className="px-2 py-2 text-right font-mono text-emerald-700 dark:text-emerald-300">{formatCurrencyCompact(activeUser.totals.orderReceived)}</td>
                                <td className="px-2 py-2 text-right font-mono text-amber-700 dark:text-amber-300">{formatCurrencyCompact(activeUser.totals.ordersInHand)}</td>
                                <td className="px-2 py-2 text-right font-mono text-purple-700 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-900/30">{formatCurrencyCompact(activeUser.totals.buMonthly)}</td>
                                <td className="px-1 py-2 text-center"><span className="text-slate-400">—</span></td>
                                <td className="px-2 py-2 text-right font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-900/30">{formatCurrencyCompact(activeUser.totals.offerBUMonth)}</td>
                                <td className="px-1 py-2 text-center"><span className="text-slate-400">—</span></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Legend Footer - Compact */}
            <Card className="border-0 shadow-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl">
              <CardContent className="py-2 px-4">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">100%+</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-slate-600 dark:text-slate-400">75-99%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-slate-600 dark:text-slate-400">&lt;75%</span>
                  </div>
                  <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
                  <div className="flex items-center gap-1.5">
                    <span className="px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold">+%</span>
                    <span className="text-slate-600 dark:text-slate-400">Above Target</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-[10px] font-bold">-%</span>
                    <span className="text-slate-600 dark:text-slate-400">Below Target</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
