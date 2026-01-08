'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { arApi, ARDashboardKPIs, ARAgingData, formatARCurrency, formatARDate } from '@/lib/ar-api';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, IndianRupee, 
  FileText, Users, Sparkles, ArrowUpRight, ArrowDownRight, Activity,
  Building2, Calendar, Target, RefreshCw, ChevronRight
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-emerald-400';
      case 'MEDIUM': return 'text-amber-400';
      case 'HIGH': return 'text-red-400';
      case 'CRITICAL': return 'text-red-300';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/20 text-emerald-400';
      case 'PARTIAL': return 'bg-amber-500/20 text-amber-400';
      case 'OVERDUE': return 'bg-red-500/20 text-red-400';
      case 'PENDING': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Calculate aging chart data
  const agingTotal = aging 
    ? aging.current.amount + aging.days1to30.amount + aging.days31to60.amount + aging.days61to90.amount + aging.over90.amount 
    : 1;
  
  const agingSegments = aging ? [
    { label: 'Current', amount: aging.current.amount, color: '#10b981', percent: (aging.current.amount / agingTotal) * 100 },
    { label: '1-30 Days', amount: aging.days1to30.amount, color: '#22d3ee', percent: (aging.days1to30.amount / agingTotal) * 100 },
    { label: '31-60 Days', amount: aging.days31to60.amount, color: '#a855f7', percent: (aging.days31to60.amount / agingTotal) * 100 },
    { label: '61-90 Days', amount: aging.days61to90.amount, color: '#f59e0b', percent: (aging.days61to90.amount / agingTotal) * 100 },
    { label: '90+ Days', amount: aging.over90.amount, color: '#ef4444', percent: (aging.over90.amount / agingTotal) * 100 },
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
            <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
          </div>
          <span className="text-white/40 text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent flex items-center gap-3 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            Dashboard
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </h1>
          <p className="text-cyan-200/60 text-sm mt-1 font-medium">Accounts Receivable Overview</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <div className="bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-transparent backdrop-blur-sm rounded-2xl border-2 border-purple-500/50 p-5 group hover:border-purple-400/80 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-sm font-medium">Total Outstanding</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{formatARCurrency(kpis?.totalOutstanding || 0)}</div>
          <div className="text-white/40 text-xs">{kpis?.pendingInvoices || 0} pending invoices</div>
        </div>

        {/* Overdue Amount */}
        <div className="bg-gradient-to-br from-red-500/15 via-rose-500/10 to-transparent backdrop-blur-sm rounded-2xl border-2 border-red-500/50 p-5 group hover:border-red-400/80 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-sm font-medium">Overdue Amount</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/40 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-400 mb-1">{formatARCurrency(kpis?.overdueAmount || 0)}</div>
          <div className="text-white/40 text-xs">{kpis?.overdueInvoices || 0} overdue invoices</div>
        </div>

        {/* Collections Today */}
        <div className="bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent backdrop-blur-sm rounded-2xl border-2 border-emerald-500/50 p-5 group hover:border-emerald-400/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-sm font-medium">Today's Collections</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-1">{formatARCurrency(kpis?.collectionsToday || 0)}</div>
          <div className="text-white/40 text-xs">Real-time updates</div>
        </div>

        {/* DSO Metric */}
        <div className="bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent backdrop-blur-sm rounded-2xl border-2 border-cyan-500/50 p-5 group hover:border-cyan-400/80 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-sm font-medium">Days Sales Outstanding</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
              <Target className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {dsoMetrics?.averageDSO || 0} <span className="text-sm font-normal text-white/40">days</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${(dsoMetrics?.averageDSO || 0) <= (dsoMetrics?.targetDSO || 45) ? 'text-emerald-400' : 'text-amber-400'}`}>
              Target: {dsoMetrics?.targetDSO || 45} days
            </span>
            {(dsoMetrics?.averageDSO || 0) <= (dsoMetrics?.targetDSO || 45) ? (
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-400" />
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Comparison + Aging Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border-2 border-purple-500/40 p-6 hover:border-purple-400/70 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Monthly Comparison
          </h3>
          {monthlyComparison && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-white/40 text-sm font-medium">{monthlyComparison.currentMonth.monthName}</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-white/50 text-xs mb-1">Invoice Value</div>
                    <div className="text-xl font-bold text-white">{formatARCurrency(monthlyComparison.currentMonth.invoiceValue)}</div>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-1">Collections</div>
                    <div className="text-xl font-bold text-emerald-400">{formatARCurrency(monthlyComparison.currentMonth.collections)}</div>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-1">Invoices Created</div>
                    <div className="text-lg font-semibold text-white">{monthlyComparison.currentMonth.invoiceCount}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 border-l border-white/10 pl-6">
                <div className="text-white/40 text-sm font-medium">vs {monthlyComparison.lastMonth.monthName}</div>
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 text-sm ${invoiceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {invoiceChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(invoiceChange).toFixed(1)}% invoices
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${collectionChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {collectionChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(collectionChange).toFixed(1)}% collections
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Aging Analysis */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border-2 border-cyan-500/40 p-6 hover:border-cyan-400/70 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Aging Analysis
          </h3>
          <div className="flex items-center gap-6">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 flex-shrink-0">
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
                      strokeWidth="16"
                      strokeDasharray={`${segment.percent * 2.51} 251`}
                      strokeDashoffset={-prevOffset * 2.51}
                      className="transition-all duration-700 ease-out"
                      style={{ filter: `drop-shadow(0 0 4px ${segment.color}40)` }}
                    />
                  );
                  return acc;
                }, { offset: 0, elements: [] as JSX.Element[] }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-bold text-white">{formatARCurrency(agingTotal)}</div>
                  <div className="text-xs text-white/40">Total</div>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2">
              {agingSegments.map((segment, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="text-xs text-white/50">{segment.label}</span>
                  </div>
                  <span className="text-xs font-medium text-white">{formatARCurrency(segment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Collection Trend + Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Trend */}
        <div className="lg:col-span-2 bg-white/[0.05] backdrop-blur-sm rounded-2xl border-2 border-emerald-500/40 p-6 hover:border-emerald-400/70 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Collection Trend
          </h3>
          <div className="h-44 flex items-end justify-between gap-3 px-2">
            {trend.map((item, i) => {
              const maxAmount = Math.max(...trend.map(t => t.amount), 1);
              const height = (item.amount / maxAmount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatARCurrency(item.amount)}
                  </div>
                  <div className="w-full relative" style={{ height: '120px' }}>
                    <div 
                      className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-purple-600 via-fuchsia-500 to-cyan-400 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                      style={{ height: `${Math.max(height, 5)}%`, opacity: 0.85 }}
                    />
                  </div>
                  <span className="text-xs text-white/40 font-medium">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border-2 border-amber-500/40 p-6 hover:border-amber-400/70 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Top Customers
            </h3>
            <Link href="/finance/ar/customers" className="text-xs text-purple-400 hover:text-purple-300">View all</Link>
          </div>
          <div className="space-y-3">
            {topCustomers.slice(0, 5).map((customer, i) => (
              <div key={customer.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium truncate max-w-[120px]">{customer.customerName}</div>
                    <div className="text-xs text-white/40">{customer.invoiceCount} invoices</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatARCurrency(customer.totalOutstanding)}</div>
                  {customer.overdueCount > 0 && (
                    <div className="text-xs text-red-400">{customer.overdueCount} overdue</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Critical Overdue + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Overdue */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border-2 border-red-500/40 overflow-hidden hover:border-red-400/70 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all duration-300">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Critical Overdue
            </h3>
            <Link href="/finance/ar/invoices?status=OVERDUE" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {criticalOverdue.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-500/30 mx-auto mb-2" />
                <div className="text-white/40 text-sm">No critical overdue invoices</div>
              </div>
            ) : (
              criticalOverdue.map((inv) => (
                <Link 
                  key={inv.id}
                  href={`/finance/ar/invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-red-500/5 transition-colors group"
                >
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-purple-300">{inv.invoiceNumber}</div>
                    <div className="text-xs text-white/40">{inv.customerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{formatARCurrency(inv.amount)}</div>
                    <div className="text-xs text-red-400 font-medium">{inv.daysOverdue} days</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border-2 border-purple-500/40 overflow-hidden hover:border-purple-400/70 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Recent Activity
            </h3>
          </div>
          <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
            {recentActivity.map((activity) => (
              <Link 
                key={activity.id}
                href={`/finance/ar/invoices/${activity.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-500/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'PAID' ? 'bg-emerald-400' :
                    activity.status === 'OVERDUE' ? 'bg-red-400' :
                    activity.status === 'PARTIAL' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  <div>
                    <div className="text-sm text-white group-hover:text-purple-300">{activity.invoiceNumber}</div>
                    <div className="text-xs text-white/40">{activity.action}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{formatARCurrency(activity.amount)}</div>
                  <div className="text-xs text-white/30">{activity.customerName}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
