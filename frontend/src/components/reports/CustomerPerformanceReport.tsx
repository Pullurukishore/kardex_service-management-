'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Users, MapPin, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCrLakh } from '@/lib/format';

interface CustomerMetric {
  customerId: number;
  companyName: string;
  location: string | null;
  industry: string | null;
  zone: { id: number; name: string } | null;
  totalOffers: number;
  wonOffers: number;
  lostOffers: number;
  totalValue: number;
  wonValue: number;
  totalPoValue: number;
  wonPoValue: number;
  winRate: number;
  avgDealSize: number;
  conversionRate: number;
}

interface CustomerPerformanceData {
  topCustomers: CustomerMetric[];
  allCustomers: CustomerMetric[];
  totals: {
    totalCustomers: number;
    totalOffers: number;
    wonOffers: number;
    lostOffers: number;
    totalValue: number;
    wonValue: number;
    totalPoValue: number;
    wonPoValue: number;
    winRate: number;
    avgDealSize: number;
    conversionRate: number;
  };
  dateRange: {
    from: string | null;
    to: string | null;
  };
}

interface CustomerPerformanceReportProps {
  data: CustomerPerformanceData;
}

const CustomerPerformanceReport: React.FC<CustomerPerformanceReportProps> = ({ data }) => {
  const [expandedCustomers, setExpandedCustomers] = useState<Set<number>>(new Set());
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  // Safety check for data structure
  if (!data || !data.topCustomers || !data.allCustomers || !data.totals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No customer data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  const toggleExpand = (customerId: number) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const getWinRateBadgeColor = (rate: number) => {
    if (rate >= 50) return 'bg-[#82A094]/20 text-[#4F6A64] border border-[#82A094]';
    if (rate >= 30) return 'bg-[#CE9F6B]/20 text-[#976E44] border border-[#CE9F6B]';
    if (rate >= 10) return 'bg-[#CE9F6B]/20 text-[#976E44] border border-[#CE9F6B]';
    return 'bg-[#EEC1BF]/20 text-[#75242D] border border-[#E17F70]';
  };

  // Filter out customers with 0 offers
  const customersWithOffers = (data?.allCustomers || []).filter(c => c.totalOffers > 0);
  const displayCustomers = showAllCustomers ? customersWithOffers : (data?.topCustomers || []);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#AEBFC3]/10 to-[#AEBFC3]/20 group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-[#5D6E73] uppercase tracking-wide">Total Customers</CardTitle>
              <div className="p-2 bg-[#92A2A5]/30 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4 text-[#5D6E73]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-[#546A7A]">{data?.totals?.totalCustomers || 0}</div>
            <p className="text-xs text-[#5D6E73] mt-2 font-semibold">Active customers</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#A2B9AF]/10 to-[#82A094]/20 group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-[#5D6E73] uppercase tracking-wide">Total Revenue</CardTitle>
              <div className="p-2 bg-[#82A094]/30 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 text-[#4F6A64]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-[#546A7A]">{formatCrLakh(data?.totals?.totalValue || 0)}</div>
            <p className="text-xs text-[#4F6A64] mt-2 font-semibold">{data?.totals?.totalOffers || 0} offers</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#EEC1BF]/10 to-[#EEC1BF]/20 group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-[#5D6E73] uppercase tracking-wide">Avg Deal Size</CardTitle>
              <div className="p-2 bg-[#CE9F6B]/30 rounded-lg group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4 text-[#976E44]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-[#546A7A]">{formatCrLakh(data?.totals?.avgDealSize || 0)}</div>
            <p className="text-xs text-[#976E44] mt-2 font-semibold">Per offer</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#6F8A9D]/10 to-[#6F8A9D]/20 group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-[#5D6E73] uppercase tracking-wide">Win Rate</CardTitle>
              <div className="p-2 bg-[#6F8A9D]/30 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 text-[#546A7A]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-[#546A7A]">{data.totals.winRate.toFixed(1)}%</div>
            <Badge className={`mt-2 text-xs font-bold ${getWinRateBadgeColor(data.totals.winRate)}`}>
              {data.totals.winRate >= 50 ? '✓ Strong' : data.totals.winRate >= 30 ? '→ Fair' : '⚠ Low'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Customer Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#546A7A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#546A7A]" />
              {showAllCustomers ? 'All Customers' : 'Top Customers'}
            </h3>
            <p className="text-sm text-[#5D6E73] mt-1">
              {showAllCustomers 
                ? `Showing all ${customersWithOffers.length} customers with offers` 
                : `Top ${data.topCustomers.length} customers by revenue`}
            </p>
          </div>
          {customersWithOffers.length > data.topCustomers.length && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllCustomers(!showAllCustomers)}
              className="font-semibold"
            >
              {showAllCustomers ? 'Show Top Only' : `Show All (${customersWithOffers.length})`}
            </Button>
          )}
        </div>

        {/* Customer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCustomers.map((customer) => (
            <Card 
              key={customer.customerId}
              className="border-0 shadow-sm hover:shadow-lg transition-all group bg-white"
            >
              {/* Header with Color Indicator */}
              <div className={`h-1 rounded-t-lg bg-gradient-to-r ${
                customer.winRate >= 50 
                  ? 'from-[#82A094] to-[#82A094]' 
                  : customer.winRate >= 30 
                  ? 'from-[#CE9F6B] to-[#CE9F6B]' 
                  : 'from-[#E17F70] to-[#E17F70]'
              }`}></div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#546A7A] flex-shrink-0" />
                      <CardTitle className="text-lg font-bold text-[#546A7A] truncate">
                        {customer.companyName}
                      </CardTitle>
                    </div>
                    {customer.zone && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-[#5D6E73]">
                        <MapPin className="w-3 h-3" />
                        <span>{customer.zone.name}</span>
                        {customer.location && <span>• {customer.location}</span>}
                      </div>
                    )}
                  </div>
                  <Badge className={`font-bold flex-shrink-0 ${getWinRateBadgeColor(customer.winRate)}`}>
                    {customer.winRate.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Offer Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#AEBFC3]/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#5D6E73] font-semibold">Total</p>
                    <p className="text-2xl font-bold text-[#546A7A] mt-1">{customer.totalOffers}</p>
                  </div>
                  <div className="bg-[#82A094]/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#4F6A64] font-semibold">Won</p>
                    <p className="text-2xl font-bold text-[#4F6A64] mt-1">{customer.wonOffers}</p>
                  </div>
                  <div className="bg-[#EEC1BF]/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9E3B47] font-semibold">Lost</p>
                    <p className="text-2xl font-bold text-[#9E3B47] mt-1">{customer.lostOffers}</p>
                  </div>
                </div>

                {/* Revenue Metrics */}
                <div className="space-y-2 border-t border-[#92A2A5] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5D6E73] font-medium">Total Value</span>
                    <span className="text-sm font-bold text-[#546A7A]">
                      {formatCrLakh(customer.totalValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5D6E73] font-medium">Avg Deal Size</span>
                    <span className="text-sm font-bold text-[#546A7A]">
                      {formatCrLakh(customer.avgDealSize)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5D6E73] font-medium">Won Value</span>
                    <span className="text-sm font-bold text-[#4F6A64]">
                      {formatCrLakh(customer.wonValue)}
                    </span>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-gradient-to-r from-[#EEC1BF]/10 to-[#EEC1BF]/10 rounded-lg p-3 border border-[#CE9F6B]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#5D6E73]">Conversion Rate</span>
                    <span className="text-sm font-bold text-[#976E44]">
                      {customer.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#92A2A5]/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#CE9F6B] to-[#CE9F6B] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(customer.conversionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Additional Info */}
                {customer.industry && (
                  <div className="text-xs text-[#5D6E73] pt-2 border-t border-[#92A2A5]">
                    <span className="font-semibold">Industry:</span> {customer.industry}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#A2B9AF]/10 to-[#82A094]/20 border-l-4 border-l-[#82A094] group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#5D6E73] flex items-center gap-2">
              <div className="p-2 bg-[#82A094]/20 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 text-[#4F6A64]" />
              </div>
              Best Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.allCustomers.length > 0 ? (
              <>
                <div className="text-xl font-bold truncate text-[#546A7A]">
                  {data.allCustomers[0].companyName}
                </div>
                <div className="text-sm text-[#4F6A64] mt-2 font-semibold">
                  {formatCrLakh(data.allCustomers[0].totalValue)} revenue
                </div>
              </>
            ) : (
              <div className="text-[#AEBFC3]0">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#EEC1BF]/10 to-[#EEC1BF]/20 border-l-4 border-l-[#CE9F6B] group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#5D6E73] flex items-center gap-2">
              <div className="p-2 bg-[#CE9F6B]/20 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4 text-[#976E44]" />
              </div>
              Most Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.allCustomers.length > 0 ? (
              <>
                <div className="text-xl font-bold truncate text-[#546A7A]">
                  {data.allCustomers.reduce((max, c) => c.totalOffers > max.totalOffers ? c : max).companyName}
                </div>
                <div className="text-sm text-[#976E44] mt-2 font-semibold">
                  {data.allCustomers.reduce((max, c) => c.totalOffers > max.totalOffers ? c : max).totalOffers} offers
                </div>
              </>
            ) : (
              <div className="text-[#AEBFC3]0">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#6F8A9D]/10 to-[#6F8A9D]/20 border-l-4 border-l-[#6F8A9D] group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#5D6E73] flex items-center gap-2">
              <div className="p-2 bg-[#6F8A9D]/20 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 text-[#546A7A]" />
              </div>
              Highest Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.allCustomers.length > 0 ? (
              <>
                <div className="text-xl font-bold truncate text-[#546A7A]">
                  {data.allCustomers.reduce((max, c) => c.winRate > max.winRate ? c : max).companyName}
                </div>
                <div className="text-sm text-[#546A7A] mt-2 font-semibold">
                  {data.allCustomers.reduce((max, c) => c.winRate > max.winRate ? c : max).winRate.toFixed(1)}% win rate
                </div>
              </>
            ) : (
              <div className="text-[#AEBFC3]0">No data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPerformanceReport;
