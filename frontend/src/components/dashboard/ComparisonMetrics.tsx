"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

interface MetricComparison {
  label: string;
  current: number;
  previous: number;
  target?: number;
  unit?: string;
  isPercentage?: boolean;
  lowerIsBetter?: boolean;
}

interface ComparisonMetricsProps {
  metrics: MetricComparison[];
  title?: string;
  description?: string;
  periodLabel?: string;
}

export default function ComparisonMetrics({ 
  metrics, 
  title = "Period Comparison",
  description = "Current vs previous period performance",
  periodLabel = "vs Last Period"
}: ComparisonMetricsProps) {

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatValue = (value: number, unit?: string, isPercentage?: boolean) => {
    if (isPercentage) return `${value.toFixed(1)}%`;
    if (unit) return `${value.toFixed(0)}${unit}`;
    return value.toFixed(0);
  };

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              {title}
            </CardTitle>
            <CardDescription className="mt-2 text-base">{description}</CardDescription>
          </div>
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {periodLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.current, metric.previous);
            const isPositive = metric.lowerIsBetter ? change < 0 : change > 0;
            const isOnTarget = metric.target ? (
              metric.lowerIsBetter 
                ? metric.current <= metric.target 
                : metric.current >= metric.target
            ) : null;

            return (
              <div 
                key={index} 
                className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1">{metric.label}</h4>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-slate-900">
                        {formatValue(metric.current, metric.unit, metric.isPercentage)}
                      </span>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">
                          from {formatValue(metric.previous, metric.unit, metric.isPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {Math.abs(change).toFixed(1)}%
                      </span>
                    </div>

                    {metric.target !== undefined && (
                      <Badge 
                        className={`text-xs ${
                          isOnTarget 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}
                        variant="outline"
                      >
                        <Target className="w-3 h-3 mr-1" />
                        Target: {formatValue(metric.target, metric.unit, metric.isPercentage)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress bar for target achievement */}
                {metric.target !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Progress to target</span>
                      <span>
                        {metric.lowerIsBetter 
                          ? Math.min(100, (metric.target / metric.current) * 100).toFixed(0)
                          : Math.min(100, (metric.current / metric.target) * 100).toFixed(0)
                        }%
                      </span>
                    </div>
                    <Progress 
                      value={
                        metric.lowerIsBetter 
                          ? Math.min(100, (metric.target / metric.current) * 100)
                          : Math.min(100, (metric.current / metric.target) * 100)
                      }
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
