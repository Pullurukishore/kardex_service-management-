import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle2, XCircle, Package } from 'lucide-react';

interface CustomerStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    totalAssets: number;
    totalTickets?: number;
  };
}

export default memo(function CustomerStats({ stats }: CustomerStatsProps) {
  const statsData = [
    {
      label: 'Total Customers',
      value: stats.total,
      icon: Building2,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 via-blue-50 to-indigo-50',
      borderColor: 'border-blue-200/50',
      textColor: 'text-blue-700',
      valueColor: 'text-blue-900',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-50 via-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200/50',
      textColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      subLabel: stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%',
    },
    {
      label: 'Inactive',
      value: stats.inactive,
      icon: XCircle,
      gradient: 'from-slate-400 via-slate-500 to-gray-600',
      bgGradient: 'from-slate-50 via-gray-50 to-slate-50',
      borderColor: 'border-slate-200/50',
      textColor: 'text-slate-600',
      valueColor: 'text-slate-800',
      subLabel: stats.total > 0 ? `${Math.round((stats.inactive / stats.total) * 100)}%` : '0%',
    },
    {
      label: 'Total Assets',
      value: stats.totalAssets,
      icon: Package,
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
      bgGradient: 'from-violet-50 via-purple-50 to-fuchsia-50',
      borderColor: 'border-violet-200/50',
      textColor: 'text-violet-700',
      valueColor: 'text-violet-900',
      subLabel: stats.total > 0 ? `${(stats.totalAssets / stats.total).toFixed(1)} avg/customer` : '0 avg',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor} border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            {/* Decorative gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            
            {/* Decorative background circle */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
            
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className={`text-sm font-medium ${stat.textColor} tracking-wide`}>
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold ${stat.valueColor} tracking-tight`}>
                      {stat.value.toLocaleString()}
                    </p>
                    {stat.subLabel && (
                      <span className={`text-xs font-medium ${stat.textColor} opacity-70`}>
                        {stat.subLabel}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
