"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendData {
  date: string;
  count: number;
  [key: string]: any;
}

interface TrendLineChartProps {
  data: TrendData[];
  title?: string;
  description?: string;
  dataKey?: string;
  color?: string;
  showArea?: boolean;
  showComparison?: boolean;
}

export default function TrendLineChart({ 
  data, 
  title = "Ticket Trends", 
  description = "7-day ticket volume analysis",
  dataKey = "count",
  color = "#3b82f6",
  showArea = true,
  showComparison = true
}: TrendLineChartProps) {
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateStats = () => {
    if (data.length < 2) return { avg: 0, trend: 0, isPositive: true, peak: 0, low: 0 };
    
    const values = data.map(d => d[dataKey] || 0);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const peak = Math.max(...values);
    const low = Math.min(...values);
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trend = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    return { 
      avg: Math.round(avg), 
      trend: Math.round(trend), 
      isPositive: trend >= 0,
      peak,
      low
    };
  };

  const stats = calculateStats();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-[#92A2A5]">
          <p className="font-semibold text-[#546A7A]">{formatDate(label)}</p>
          <p className="text-2xl font-bold text-[#546A7A] mt-1">
            {payload[0].value} tickets
          </p>
          {stats.peak === payload[0].value && (
            <Badge className="mt-2 bg-[#A2B9AF]/20 text-[#4F6A64]">Peak Day</Badge>
          )}
          {stats.low === payload[0].value && data.length > 2 && (
            <Badge className="mt-2 bg-[#96AEC2]/20 text-[#546A7A]">Lowest Day</Badge>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {showComparison && (
            <div className="flex flex-col items-end gap-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                stats.isPositive ? 'bg-[#A2B9AF]/10' : 'bg-[#E17F70]/10'
              }`}>
                {stats.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-[#4F6A64]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[#9E3B47]" />
                )}
                <span className={`text-sm font-semibold ${
                  stats.isPositive ? 'text-[#4F6A64]' : 'text-[#75242D]'
                }`}>
                  {Math.abs(stats.trend)}%
                </span>
              </div>
              <div className="text-xs text-[#757777]">
                Avg: {stats.avg} tickets/day
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {showArea ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)"
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
