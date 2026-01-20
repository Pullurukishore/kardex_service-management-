import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#5D6E73]">
          {title}
        </CardTitle>
        {icon && <div className="text-[#979796]">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-[#AEBFC3]0 mt-1">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <span
              className={`font-medium ${
                trend.isPositive ? 'text-[#4F6A64]' : 'text-[#9E3B47]'
              }`}
            >
              {trend.value}
            </span>
            <span className="text-[#AEBFC3]0 ml-2">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
