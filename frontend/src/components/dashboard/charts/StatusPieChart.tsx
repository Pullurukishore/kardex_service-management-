"use client";

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusData {
  status: string;
  count: number;
  color: string;
  [key: string]: any;
}

interface StatusPieChartProps {
  data: StatusData[];
  title?: string;
  onSegmentClick?: (status: string) => void;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={fill} className="font-bold text-2xl">
        {value}
      </text>
      <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#64748b" className="text-sm">
        {payload.status}
      </text>
      <text x={cx} y={cy} dy={35} textAnchor="middle" fill="#94a3b8" className="text-xs">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function StatusPieChart({ data, title = "Status Distribution", onSegmentClick }: StatusPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleClick = (data: any) => {
    if (onSegmentClick) {
      onSegmentClick(data.status);
    }
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="bg-gradient-to-br from-white to-[#96AEC2]/10/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] animate-pulse"></div>
            {title}
          </span>
          <span className="text-sm font-normal text-[#5D6E73] bg-[#96AEC2]/10 px-3 py-1 rounded-full">
            Total: <span className="font-bold text-[#546A7A]">{total}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              dataKey="count"
              onMouseEnter={onPieEnter}
              onClick={handleClick}
              label={(entry) => `${entry.status}: ${entry.count}`}
              style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                  opacity={activeIndex === index ? 1 : 0.85}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                border: 'none', 
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px'
              }}
              formatter={(value: any, name: any, props: any) => {
                const percentage = ((props.payload.count / total) * 100).toFixed(1);
                return [
                  <span key="value" className="font-bold text-lg" style={{ color: props.payload.color }}>
                    {value} tickets
                  </span>,
                  <span key="name" className="text-[#5D6E73] capitalize text-sm">
                    {props.payload.status} ({percentage}%)
                  </span>
                ];
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => {
                const percentage = ((entry.payload.count / total) * 100).toFixed(1);
                return (
                  <span className="text-sm font-medium text-[#5D6E73] capitalize">
                    {value} ({percentage}%)
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
