"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface BarData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ComparisonBarChartProps {
  data: BarData[];
  title?: string;
  description?: string;
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  horizontal?: boolean;
  onBarClick?: (name: string) => void;
}

export default function ComparisonBarChart({ 
  data, 
  title = "Comparison Chart", 
  description,
  dataKey = "value",
  nameKey = "name",
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
  horizontal = false,
  onBarClick
}: ComparisonBarChartProps) {

  const handleClick = (data: any) => {
    if (onBarClick) {
      onBarClick(data[nameKey]);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900">{payload[0].payload[nameKey]}</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {payload[0].value}
          </p>
          {payload[0].payload.subtitle && (
            <p className="text-xs text-slate-500 mt-1">{payload[0].payload.subtitle}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const maxValue = Math.max(...data.map(d => d[dataKey] || 0));
  const avgValue = data.reduce((sum, d) => sum + (d[dataKey] || 0), 0) / data.length;

  return (
    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Average</div>
            <div className="text-lg font-bold text-slate-900">{Math.round(avgValue)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data} 
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            {horizontal ? (
              <>
                <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis 
                  type="category" 
                  dataKey={nameKey}
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  width={100}
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey={nameKey}
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              </>
            )}
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={dataKey} 
              radius={[8, 8, 0, 0]}
              onClick={handleClick}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            >
              {data.map((entry, index) => {
                const isHighest = entry[dataKey] === maxValue;
                const color = isHighest ? '#10b981' : colors[index % colors.length];
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={color}
                    opacity={isHighest ? 1 : 0.8}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
