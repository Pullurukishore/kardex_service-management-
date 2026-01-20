'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { arApi, ARDashboardKPIs, ARAgingData, formatARCurrency, formatARDate } from '@/lib/ar-api';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, IndianRupee, 
  FileText, Users, Sparkles, ArrowUpRight, ArrowDownRight, Activity,
  Building2, Calendar, Target, RefreshCw, ChevronRight, BarChart3
} from 'lucide-react';

interface CollectionTrend {
  month: string;
  amount: number;
}

interface CriticalOverdue {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  daysOverdue: number;
  riskClass: string;
}

interface RecentActivity {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: string;
  action: string;
  updatedAt: string;
}

interface TopCustomer {
  id: string;
  customerName: string;
  totalOutstanding: number;
  invoiceCount: number;
  overdueCount: number;
  riskClass: string;
}

interface MonthlyComparison {
  currentMonth: { invoiceCount: number; invoiceValue: number; collections: number; monthName: string };
  lastMonth: { invoiceCount: number; invoiceValue: number; collections: number; monthName: string };
}

interface DSOMetrics {
  averageDSO: number;
  targetDSO: number;
  currentOutstanding: number;
  invoicesAnalyzed: number;
}

export default function ARDashboardPage() {
  const [kpis, setKpis] = useState<ARDashboardKPIs | null>(null);
  const [aging, setAging] = useState<ARAgingData | null>(null);
  const [trend, setTrend] = useState<CollectionTrend[]>([]);
  const [criticalOverdue, setCriticalOverdue] = useState<CriticalOverdue[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison | null>(null);
  const [dsoMetrics, setDsoMetrics] = useState<DSOMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [kpisData, agingData, trendData, overdueData, activityData, customersData, comparisonData, dsoData] = await Promise.all([
        arApi.getDashboardKPIs(),
        arApi.getAgingAnalysis(),
        arApi.getCollectionTrend(),
        arApi.getCriticalOverdue(5),
        arApi.getRecentActivity(8),
        arApi.getTopCustomers(5),
        arApi.getMonthlyComparison(),
        arApi.getDSOMetrics()
      ]);
      setKpis(kpisData);
      setAging(agingData);
      setTrend(trendData);
      setCriticalOverdue(overdueData);
      setRecentActivity(activityData);
      setTopCustomers(customersData);
      setMonthlyComparison(comparisonData);
      setDsoMetrics(dsoData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Calculate aging chart data
  const agingTotal = aging 
    ? aging.current.amount + aging.days1to30.amount + aging.days31to60.amount + aging.days61to90.amount + aging.over90.amount 
    : 1;
  
  const agingSegments = aging ? [
    { label: 'Current', amount: aging.current.amount, color: '#82A094', percent: (aging.current.amount / agingTotal) * 100 },
    { label: '1-30 Days', amount: aging.days1to30.amount, color: '#6F8A9D', percent: (aging.days1to30.amount / agingTotal) * 100 },
    { label: '31-60 Days', amount: aging.days31to60.amount, color: '#CE9F6B', percent: (aging.days31to60.amount / agingTotal) * 100 },
    { label: '61-90 Days', amount: aging.days61to90.amount, color: '#E17F70', percent: (aging.days61to90.amount / agingTotal) * 100 },
    { label: '90+ Days', amount: aging.over90.amount, color: '#9E3B47', percent: (aging.over90.amount / agingTotal) * 100 },
  ] : [];

  // Calculate comparison percentages
  const invoiceChange = monthlyComparison && monthlyComparison.lastMonth.invoiceValue > 0
    ? ((monthlyComparison.currentMonth.invoiceValue - monthlyComparison.lastMonth.invoiceValue) / monthlyComparison.lastMonth.invoiceValue) * 100
    : 0;
  const collectionChange = monthlyComparison && monthlyComparison.lastMonth.collections > 0
    ? ((monthlyComparison.currentMonth.collections - monthlyComparison.lastMonth.collections) / monthlyComparison.lastMonth.collections) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#6F8A9D]/20 rounded-full" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#6F8A9D] rounded-full animate-spin" />
          </div>
          <span className="text-[#5D6E73] text-sm font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Decorative Background */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-[#6F8A9D]/10 to-[#82A094]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-72 h-72 bg-gradient-to-tr from-[#96AEC2]/10 to-[#A2B9AF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Premium Header - Blue/Green Analytics Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#546A7A] via-[#6F8A9D] to-[#82A094] p-6 shadow-xl">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-12 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute -bottom-8 right-32 w-48 h-48 border-4 border-white rounded-full" />
          <div className="absolute top-8 left-1/4 w-16 h-16 border-2 border-white rounded-full" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                AR Dashboard
                <Sparkles className="w-6 h-6 text-white/80" />
              </h1>
              <p className="text-white/80 text-sm mt-1">Accounts Receivable Analytics & Insights</p>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#546A7A] font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding - Blue */}
        <div className="group relative bg-white/90 backdrop-blur-xl rounded-2xl border border-[#6F8A9D]/20 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6F8A9D] to-[#96AEC2]" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#5D6E73] text-sm font-medium">Total Outstanding</span>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] flex items-center justify-center shadow-lg shadow-[#6F8A9D]/30">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#546A7A] mb-1">{formatARCurrency(kpis?.totalOutstanding || 0)}</div>
          <div className="text-[#6F8A9D] text-xs font-medium">{kpis?.pendingInvoices || 0} pending invoices</div>
        </div>

        {/* Overdue Amount - Coral */}
        <div className="group relative bg-white/90 backdrop-blur-xl rounded-2xl border border-[#E17F70]/20 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E17F70] to-[#9E3B47]" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#5D6E73] text-sm font-medium">Overdue Amount</span>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17F70] to-[#9E3B47] flex items-center justify-center shadow-lg shadow-[#E17F70]/30 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#9E3B47] mb-1">{formatARCurrency(kpis?.overdueAmount || 0)}</div>
          <div className="text-[#E17F70] text-xs font-medium">{kpis?.overdueInvoices || 0} overdue invoices</div>
        </div>

        {/* Collections Today - Green */}
        <div className="group relative bg-white/90 backdrop-blur-xl rounded-2xl border border-[#82A094]/20 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#82A094] to-[#4F6A64]" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#5D6E73] text-sm font-medium">Today's Collections</span>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#82A094] to-[#4F6A64] flex items-center justify-center shadow-lg shadow-[#82A094]/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#4F6A64] mb-1">{formatARCurrency(kpis?.collectionsToday || 0)}</div>
          <div className="text-[#82A094] text-xs font-medium">Real-time updates</div>
        </div>

        {/* DSO Metric - Sand */}
        <div className="group relative bg-white/90 backdrop-blur-xl rounded-2xl border border-[#CE9F6B]/20 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#CE9F6B] to-[#976E44]" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#5D6E73] text-sm font-medium">Days Sales Outstanding</span>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center shadow-lg shadow-[#CE9F6B]/30">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#976E44] mb-1">
            {dsoMetrics?.averageDSO || 0} <span className="text-sm font-normal text-[#92A2A5]">days</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${(dsoMetrics?.averageDSO || 0) <= (dsoMetrics?.targetDSO || 45) ? 'text-[#82A094]' : 'text-[#E17F70]'}`}>
              Target: {dsoMetrics?.targetDSO || 45} days
            </span>
            {(dsoMetrics?.averageDSO || 0) <= (dsoMetrics?.targetDSO || 45) ? (
              <CheckCircle className="w-4 h-4 text-[#82A094]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#E17F70]" />
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Comparison + Aging Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison - Blue Theme */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#6F8A9D]/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-[#546A7A] mb-5 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#6F8A9D] to-[#546A7A]">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Monthly Comparison
          </h3>
          {monthlyComparison && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-[#546A7A] text-sm font-bold">{monthlyComparison.currentMonth.monthName}</div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#6F8A9D]/10 to-transparent">
                    <div className="text-[#92A2A5] text-xs mb-1">Invoice Value</div>
                    <div className="text-xl font-bold text-[#546A7A]">{formatARCurrency(monthlyComparison.currentMonth.invoiceValue)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#82A094]/10 to-transparent">
                    <div className="text-[#92A2A5] text-xs mb-1">Collections</div>
                    <div className="text-xl font-bold text-[#4F6A64]">{formatARCurrency(monthlyComparison.currentMonth.collections)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#96AEC2]/10 to-transparent">
                    <div className="text-[#92A2A5] text-xs mb-1">Invoices Created</div>
                    <div className="text-lg font-bold text-[#6F8A9D]">{monthlyComparison.currentMonth.invoiceCount}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 border-l border-[#AEBFC3]/30 pl-6">
                <div className="text-[#92A2A5] text-sm font-medium">vs {monthlyComparison.lastMonth.monthName}</div>
                <div className="space-y-4 mt-6">
                  <div className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg ${invoiceChange >= 0 ? 'bg-[#82A094]/10 text-[#4F6A64]' : 'bg-[#E17F70]/10 text-[#9E3B47]'}`}>
                    {invoiceChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(invoiceChange).toFixed(1)}% invoices
                  </div>
                  <div className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg ${collectionChange >= 0 ? 'bg-[#82A094]/10 text-[#4F6A64]' : 'bg-[#E17F70]/10 text-[#9E3B47]'}`}>
                    {collectionChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(collectionChange).toFixed(1)}% collections
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Aging Analysis - Green Theme */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#82A094]/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-[#546A7A] mb-5 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#82A094] to-[#4F6A64]">
              <Clock className="w-5 h-5 text-white" />
            </div>
            Aging Analysis
          </h3>
          <div className="flex items-center gap-6">
            {/* Donut Chart */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {agingSegments.reduce((acc, segment, index) => {
                  const prevOffset = acc.offset;
                  acc.offset += segment.percent;
                  acc.elements.push(
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="18"
                      strokeDasharray={`${segment.percent * 2.51} 251`}
                      strokeDashoffset={-prevOffset * 2.51}
                      className="transition-all duration-700 ease-out"
                    />
                  );
                  return acc;
                }, { offset: 0, elements: [] as JSX.Element[] }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-bold text-[#546A7A]">{formatARCurrency(agingTotal)}</div>
                  <div className="text-xs text-[#92A2A5]">Total</div>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2.5">
              {agingSegments.map((segment, i) => (
                <div key={i} className="flex items-center justify-between group hover:bg-[#AEBFC3]/10 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: segment.color }} />
                    <span className="text-xs text-[#5D6E73] font-medium">{segment.label}</span>
                  </div>
                  <span className="text-xs font-bold text-[#546A7A]">{formatARCurrency(segment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Collection Trend + Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Trend - Blue/Green Gradient */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-[#6F8A9D]/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-[#546A7A] mb-5 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#6F8A9D] to-[#82A094]">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Collection Trend
          </h3>
          <div className="h-48 flex items-end justify-between gap-3 px-2">
            {trend.map((item, i) => {
              const maxAmount = Math.max(...trend.map(t => t.amount), 1);
              const height = (item.amount / maxAmount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-xs text-[#92A2A5] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatARCurrency(item.amount)}
                  </div>
                  <div className="w-full relative" style={{ height: '140px' }}>
                    <div 
                      className="absolute bottom-0 w-full rounded-t-xl bg-gradient-to-t from-[#6F8A9D] to-[#82A094] transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[#6F8A9D]/30"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#5D6E73] font-semibold">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Customers - Sand Theme */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#CE9F6B]/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#546A7A] flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE9F6B] to-[#976E44]">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              Top Customers
            </h3>
            <Link href="/finance/ar/customers" className="text-xs text-[#CE9F6B] hover:text-[#976E44] font-semibold flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topCustomers.slice(0, 5).map((customer, i) => (
              <div key={customer.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#CE9F6B]/10 to-transparent hover:from-[#CE9F6B]/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm text-[#546A7A] font-semibold truncate max-w-[120px]">{customer.customerName}</div>
                    <div className="text-xs text-[#92A2A5]">{customer.invoiceCount} invoices</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#976E44]">{formatARCurrency(customer.totalOutstanding)}</div>
                  {customer.overdueCount > 0 && (
                    <div className="text-xs text-[#E17F70] font-medium">{customer.overdueCount} overdue</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Critical Overdue + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Overdue - Coral/Red Theme */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#E17F70]/20 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-5 border-b border-[#E17F70]/10 bg-gradient-to-r from-[#E17F70]/10 to-transparent">
            <h3 className="text-lg font-bold text-[#546A7A] flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#E17F70] to-[#9E3B47]">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              Critical Overdue
            </h3>
            <Link href="/finance/ar/invoices?status=OVERDUE" className="text-xs text-[#E17F70] hover:text-[#9E3B47] flex items-center gap-1 font-semibold">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {criticalOverdue.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#82A094]/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-[#82A094]" />
                </div>
                <div className="text-[#4F6A64] font-medium">No critical overdue invoices</div>
                <div className="text-[#92A2A5] text-sm">All payments are on track</div>
              </div>
            ) : (
              criticalOverdue.map((inv) => (
                <Link 
                  key={inv.id}
                  href={`/finance/ar/invoices/${inv.invoiceNumber}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#E17F70]/10 transition-colors group"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#546A7A] group-hover:text-[#9E3B47]">{inv.invoiceNumber}</div>
                    <div className="text-xs text-[#92A2A5]">{inv.customerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#546A7A]">{formatARCurrency(inv.amount)}</div>
                    <div className="text-xs text-white bg-gradient-to-r from-[#E17F70] to-[#9E3B47] px-2 py-0.5 rounded-full font-bold inline-block">{inv.daysOverdue}d</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity - Blue Theme */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#6F8A9D]/20 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-5 border-b border-[#6F8A9D]/10 bg-gradient-to-r from-[#6F8A9D]/10 to-transparent">
            <h3 className="text-lg font-bold text-[#546A7A] flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#6F8A9D] to-[#546A7A]">
                <Activity className="w-5 h-5 text-white" />
              </div>
              Recent Activity
            </h3>
          </div>
          <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
            {recentActivity.map((activity) => (
              <Link 
                key={activity.id}
                href={`/finance/ar/invoices/${activity.invoiceNumber}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#6F8A9D]/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${
                    activity.status === 'PAID' ? 'bg-[#82A094]' :
                    activity.status === 'OVERDUE' ? 'bg-[#E17F70]' :
                    activity.status === 'PARTIAL' ? 'bg-[#CE9F6B]' : 'bg-[#6F8A9D]'
                  }`} />
                  <div>
                    <div className="text-sm text-[#546A7A] font-medium group-hover:text-[#6F8A9D]">{activity.invoiceNumber}</div>
                    <div className="text-xs text-[#92A2A5]">{activity.action}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#546A7A]">{formatARCurrency(activity.amount)}</div>
                  <div className="text-xs text-[#92A2A5]">{activity.customerName}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
