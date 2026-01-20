'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Package, Target, Award, BarChart3, Zap, Crown, ArrowUpRight, ArrowDownRight, Percent, DollarSign } from 'lucide-react';
import { formatCrLakh } from '@/lib/format';

interface ProductTypeMetric {
  productType: string;
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

interface ProductTypeAnalysisData {
  analysis: ProductTypeMetric[];
  totals: {
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

interface ProductTypeAnalysisReportProps {
  data: ProductTypeAnalysisData;
}

const ProductTypeAnalysisReport: React.FC<ProductTypeAnalysisReportProps> = ({ data }) => {
  const [sortBy, setSortBy] = useState<'offers' | 'value' | 'winRate'>('value');

  // Safety check for data structure
  if (!data || !data.analysis || !data.totals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Type Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No product type data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  const getWinRateBadgeColor = (rate: number) => {
    if (rate >= 50) return 'bg-[#82A094]/20 text-[#4F6A64] border border-[#82A094]';
    if (rate >= 30) return 'bg-[#CE9F6B]/20 text-[#976E44] border border-[#CE9F6B]';
    if (rate >= 10) return 'bg-[#CE9F6B]/20 text-[#976E44] border border-[#CE9F6B]';
    return 'bg-[#EEC1BF]/20 text-[#75242D] border border-[#E17F70]';
  };

  const getConversionBadgeColor = (rate: number) => {
    if (rate >= 80) return 'bg-[#82A094]/20 text-[#4F6A64] border border-[#82A094]';
    if (rate >= 50) return 'bg-[#CE9F6B]/20 text-[#976E44] border border-[#CE9F6B]';
    if (rate >= 20) return 'bg-[#CE9F6B]/20 text-[#976E44] border border-[#CE9F6B]';
    return 'bg-[#EEC1BF]/20 text-[#75242D] border border-[#E17F70]';
  };

  const getPerformanceIndicator = (rate: number, threshold: number) => {
    if (rate >= threshold) return <ArrowUpRight className="h-3 w-3 inline" />;
    if (rate >= threshold * 0.8) return <Zap className="h-3 w-3 inline" />;
    return <ArrowDownRight className="h-3 w-3 inline" />;
  };

  const getSortedData = () => {
    const sorted = [...data.analysis];
    if (sortBy === 'offers') sorted.sort((a, b) => b.totalOffers - a.totalOffers);
    if (sortBy === 'value') sorted.sort((a, b) => b.totalValue - a.totalValue);
    if (sortBy === 'winRate') sorted.sort((a, b) => b.winRate - a.winRate);
    return sorted;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#546A7A] flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Product Type Analysis
          </h2>
          <p className="text-[#5D6E73] mt-1">Performance metrics across all product types</p>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Offers Card */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#AEBFC3]/10 to-[#AEBFC3]/20 group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-[#5D6E73] uppercase tracking-wide">Total Offers</CardTitle>
              <div className="p-2 bg-[#92A2A5]/30 rounded-lg group-hover:scale-110 transition-transform">
                <Package className="w-4 h-4 text-[#5D6E73]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-[#546A7A]">{data.totals.totalOffers}</div>
            <div className="flex gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#82A094]/100"></div>
                <span className="text-[#4F6A64] font-semibold">{data.totals.wonOffers}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EEC1BF]/100"></div>
                <span className="text-[#9E3B47] font-semibold">{data.totals.lostOffers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Value Card */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#A2B9AF]/10 to-[#82A094]/20 group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-[#5D6E73] uppercase tracking-wide">Total Value</CardTitle>
              <div className="p-2 bg-[#82A094]/30 rounded-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4 text-[#4F6A64]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-[#546A7A]">{formatCrLakh(data.totals.totalValue)}</div>
            <p className="text-xs text-[#4F6A64] mt-2 font-semibold">Won: {formatCrLakh(data.totals.wonValue)}</p>
          </CardContent>
        </Card>

        {/* Win Rate Card */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#EEC1BF]/10 to-[#EEC1BF]/20 group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-[#5D6E73] uppercase tracking-wide">Win Rate</CardTitle>
              <div className="p-2 bg-[#CE9F6B]/30 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 text-[#976E44]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-[#546A7A]">{data.totals.winRate.toFixed(1)}%</div>
            <Badge className={`mt-2 text-xs font-bold ${getWinRateBadgeColor(data.totals.winRate)}`}>
              {data.totals.winRate >= 50 ? '✓ Excellent' : data.totals.winRate >= 30 ? '→ Good' : '⚠ Improve'}
            </Badge>
          </CardContent>
        </Card>

        {/* Avg Deal Size Card */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#6F8A9D]/10 to-[#6F8A9D]/20 group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-[#5D6E73] uppercase tracking-wide">Avg Deal</CardTitle>
              <div className="p-2 bg-[#6F8A9D]/30 rounded-lg group-hover:scale-110 transition-transform">
                <Crown className="w-4 h-4 text-[#546A7A]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-[#546A7A]">{formatCrLakh(data.totals.avgDealSize)}</div>
            <p className="text-xs text-[#546A7A] mt-2 font-semibold">Per offer</p>
          </CardContent>
        </Card>

        {/* Conversion Rate Card */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#EEC1BF]/10 to-red-100 group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-[#5D6E73] uppercase tracking-wide">Conversion</CardTitle>
              <div className="p-2 bg-[#E17F70]/30 rounded-lg group-hover:scale-110 transition-transform">
                <Percent className="w-4 h-4 text-[#9E3B47]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-[#546A7A]">{data.totals.conversionRate.toFixed(1)}%</div>
            <Badge className={`mt-2 text-xs font-bold ${getConversionBadgeColor(data.totals.conversionRate)}`}>
              {data.totals.conversionRate >= 80 ? '✓ Excellent' : data.totals.conversionRate >= 50 ? '→ Good' : '⚠ Improve'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Product Type Analytics Cards with Sorting */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#546A7A] flex items-center gap-2">
              <div className="p-2 bg-[#CE9F6B]/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-[#976E44]" />
              </div>
              Product Type Performance
            </h3>
            <p className="text-sm text-[#5D6E73] mt-1">Detailed breakdown by product type with key metrics</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('value')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                sortBy === 'value'
                  ? 'bg-[#4F6A64] text-white shadow-md'
                  : 'bg-[#92A2A5]/30 text-[#5D6E73] hover:bg-[#92A2A5]'
              }`}
            >
              By Value
            </button>
            <button
              onClick={() => setSortBy('winRate')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                sortBy === 'winRate'
                  ? 'bg-[#976E44] text-white shadow-md'
                  : 'bg-[#92A2A5]/30 text-[#5D6E73] hover:bg-[#92A2A5]'
              }`}
            >
              By Win Rate
            </button>
            <button
              onClick={() => setSortBy('offers')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                sortBy === 'offers'
                  ? 'bg-[#546A7A] text-white shadow-md'
                  : 'bg-[#92A2A5]/30 text-[#5D6E73] hover:bg-[#92A2A5]'
              }`}
            >
              By Offers
            </button>
          </div>
        </div>

        {/* Product Type Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getSortedData().map((product, index) => (
            <Card 
              key={index}
              className={`border-0 shadow-sm hover:shadow-lg transition-all group ${
                product.totalOffers === 0 
                  ? 'bg-[#AEBFC3]/10 opacity-60' 
                  : 'bg-white'
              }`}
            >
              {/* Header with Product Type and Performance Indicator */}
              <div className={`h-1 rounded-t-lg bg-gradient-to-r ${
                product.winRate >= 50 
                  ? 'from-[#82A094] to-[#82A094]' 
                  : product.winRate >= 30 
                  ? 'from-[#CE9F6B] to-[#CE9F6B]' 
                  : 'from-[#E17F70] to-[#E17F70]'
              }`}></div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-[#546A7A]">
                      {product.productType}
                    </CardTitle>
                    {product.totalOffers === 0 && (
                      <p className="text-xs text-[#AEBFC3]0 mt-1 italic">No offers</p>
                    )}
                  </div>
                  <Badge className={`font-bold ${
                    product.totalOffers === 0 
                      ? 'bg-[#92A2A5]/30 text-[#5D6E73]' 
                      : getWinRateBadgeColor(product.winRate)
                  }`}>
                    {product.winRate.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Offer Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#AEBFC3]/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#5D6E73] font-semibold">Total</p>
                    <p className="text-2xl font-bold text-[#546A7A] mt-1">{product.totalOffers}</p>
                  </div>
                  <div className="bg-[#82A094]/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#4F6A64] font-semibold">Won</p>
                    <p className="text-2xl font-bold text-[#4F6A64] mt-1">{product.wonOffers}</p>
                  </div>
                  <div className="bg-[#EEC1BF]/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9E3B47] font-semibold">Lost</p>
                    <p className="text-2xl font-bold text-[#9E3B47] mt-1">{product.lostOffers}</p>
                  </div>
                </div>

                {/* Value Metrics */}
                <div className="space-y-2 border-t border-[#92A2A5] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5D6E73] font-medium">Total Value</span>
                    <span className="text-sm font-bold text-[#546A7A]">
                      {formatCrLakh(product.totalValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5D6E73] font-medium">Avg Deal Size</span>
                    <span className="text-sm font-bold text-[#546A7A]">
                      {formatCrLakh(product.avgDealSize)}
                    </span>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-gradient-to-r from-[#EEC1BF]/10 to-[#EEC1BF]/10 rounded-lg p-3 border border-[#CE9F6B]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#5D6E73]">Conversion Rate</span>
                    <Badge className={`text-xs font-bold ${getConversionBadgeColor(product.conversionRate)}`}>
                      {product.conversionRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-[#92A2A5]/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#CE9F6B] to-[#CE9F6B] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(product.conversionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Win Rate Progress */}
                <div className="bg-gradient-to-r from-[#A2B9AF]/10 to-[#82A094]/10 rounded-lg p-3 border border-[#82A094]/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#5D6E73]">Win Rate</span>
                    <Badge className={`text-xs font-bold ${product.totalOffers === 0 ? 'bg-[#92A2A5]/30 text-[#5D6E73]' : getWinRateBadgeColor(product.winRate)}`}>
                      {product.winRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-[#92A2A5]/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#82A094] to-[#82A094] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(product.winRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Performers & Insights Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[#546A7A] flex items-center gap-2">
          <Crown className="w-5 h-5 text-[#CE9F6B]" />
          Key Insights & Top Performers
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Highest Win Rate */}
          <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#A2B9AF]/10 to-[#82A094]/20 border-l-4 border-l-[#82A094] group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#5D6E73] flex items-center gap-2">
                  <div className="p-2 bg-[#82A094]/20 rounded-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-4 h-4 text-[#4F6A64]" />
                  </div>
                  Highest Win Rate
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {data.analysis.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-[#546A7A] mb-2">
                    {data.analysis.reduce((max, p) => p.winRate > max.winRate ? p : max).productType}
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#82A094]/20 rounded-lg border border-[#82A094]/50">
                      <p className="text-sm text-[#4F6A64] font-bold">
                        {data.analysis.reduce((max, p) => p.winRate > max.winRate ? p : max).winRate.toFixed(1)}% win rate
                      </p>
                    </div>
                    <div className="text-xs text-[#5D6E73] space-y-1">
                      <p>
                        <span className="font-semibold">Offers:</span> {data.analysis.reduce((max, p) => p.winRate > max.winRate ? p : max).totalOffers}
                      </p>
                      <p>
                        <span className="font-semibold">Won:</span> {data.analysis.reduce((max, p) => p.winRate > max.winRate ? p : max).wonOffers}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[#AEBFC3]0 text-sm">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Highest Revenue */}
          <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#96AEC2]/10 to-[#6F8A9D]/20 border-l-4 border-l-[#6F8A9D] group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#5D6E73] flex items-center gap-2">
                  <div className="p-2 bg-[#96AEC2]/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Award className="w-4 h-4 text-[#546A7A]" />
                  </div>
                  Highest Revenue
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {data.analysis.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-[#546A7A] mb-2">
                    {data.analysis.reduce((max, p) => p.totalValue > max.totalValue ? p : max).productType}
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#96AEC2]/20 rounded-lg border border-[#96AEC2]">
                      <p className="text-sm text-[#546A7A] font-bold">
                        {formatCrLakh(data.analysis.reduce((max, p) => p.totalValue > max.totalValue ? p : max).totalValue)}
                      </p>
                    </div>
                    <div className="text-xs text-[#5D6E73] space-y-1">
                      <p>
                        <span className="font-semibold">Avg Deal:</span> {formatCrLakh(data.analysis.reduce((max, p) => p.totalValue > max.totalValue ? p : max).avgDealSize)}
                      </p>
                      <p>
                        <span className="font-semibold">Offers:</span> {data.analysis.reduce((max, p) => p.totalValue > max.totalValue ? p : max).totalOffers}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[#AEBFC3]0 text-sm">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Best Conversion */}
          <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-[#6F8A9D]/10 to-[#EEC1BF]/20 border-l-4 border-l-[#6F8A9D] group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#5D6E73] flex items-center gap-2">
                  <div className="p-2 bg-[#6F8A9D]/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Target className="w-4 h-4 text-[#546A7A]" />
                  </div>
                  Best Conversion
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {data.analysis.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-[#546A7A] mb-2">
                    {data.analysis.reduce((max, p) => p.conversionRate > max.conversionRate ? p : max).productType}
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#6F8A9D]/20 rounded-lg border border-[#6F8A9D]">
                      <p className="text-sm text-[#546A7A] font-bold">
                        {data.analysis.reduce((max, p) => p.conversionRate > max.conversionRate ? p : max).conversionRate.toFixed(1)}% conversion
                      </p>
                    </div>
                    <div className="text-xs text-[#5D6E73] space-y-1">
                      <p>
                        <span className="font-semibold">Total Value:</span> {formatCrLakh(data.analysis.reduce((max, p) => p.conversionRate > max.conversionRate ? p : max).totalValue)}
                      </p>
                      <p>
                        <span className="font-semibold">Offers:</span> {data.analysis.reduce((max, p) => p.conversionRate > max.conversionRate ? p : max).totalOffers}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[#AEBFC3]0 text-sm">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-[#AEBFC3]/10 to-[#AEBFC3]/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#976E44]" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-[#5D6E73] font-semibold">Overall Performance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#546A7A]">{data.totals.winRate.toFixed(1)}%</span>
                  <span className="text-xs text-[#AEBFC3]0">win rate</span>
                </div>
                <div className="w-full bg-[#92A2A5]/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#82A094] to-[#82A094] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(data.totals.winRate, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-[#5D6E73] font-semibold">Conversion Efficiency</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#546A7A]">{data.totals.conversionRate.toFixed(1)}%</span>
                  <span className="text-xs text-[#AEBFC3]0">conversion</span>
                </div>
                <div className="w-full bg-[#92A2A5]/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#CE9F6B] to-[#CE9F6B] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(data.totals.conversionRate, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-[#5D6E73] font-semibold">Deal Success Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#546A7A]">{((data.totals.wonOffers / data.totals.totalOffers) * 100).toFixed(1)}%</span>
                  <span className="text-xs text-[#AEBFC3]0">success</span>
                </div>
                <div className="w-full bg-[#92A2A5]/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((data.totals.wonOffers / data.totals.totalOffers) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductTypeAnalysisReport;
