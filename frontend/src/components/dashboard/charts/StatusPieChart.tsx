"use client";

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';

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
      <text x={cx} y={cy} dy={-8} textAnchor="middle" fill={fill} className="font-bold text-xl">
        {value}
      </text>
      <text x={cx} y={cy} dy={12} textAnchor="middle" fill="#546A7A" className="text-xs font-medium">
        {payload.status}
      </text>
      <text x={cx} y={cy} dy={28} textAnchor="middle" fill="#757777" className="text-[10px]">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
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
    <div className="w-full">
      {/* Header with Kardex styling */}
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-[#546A7A]">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6F8A9D] to-[#546A7A]"></div>
          {title}
        </span>
        <span className="text-xs font-medium text-[#5D6E73] bg-[#96AEC2]/15 px-2.5 py-1 rounded-full">
          Total: <span className="font-bold text-[#546A7A]">{total}</span>
        </span>
      </div>
      
      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={95}
            dataKey="count"
            onMouseEnter={onPieEnter}
            onClick={handleClick}
            label={({ status, count }: any) => `${(status as string).toUpperCase()}: ${count}`}
            labelLine={{ stroke: '#AEBFC3', strokeWidth: 1 }}
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
              border: '1px solid rgba(150, 174, 194, 0.2)', 
              borderRadius: '10px',
              boxShadow: '0 8px 20px -5px rgba(84, 106, 122, 0.15)',
              padding: '10px 14px'
            }}
            formatter={(value: any, name: any, props: any) => {
              const percentage = ((props.payload.count / total) * 100).toFixed(1);
              return [
                <span key="value" className="font-bold text-base" style={{ color: props.payload.color }}>
                  {value} tickets
                </span>,
                <span key="name" className="text-[#546A7A] capitalize text-xs">
                  {props.payload.status} ({percentage}%)
                </span>
              ];
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={32}
            iconType="circle"
            iconSize={8}
            formatter={(value, entry: any) => {
              const percentage = ((entry.payload.count / total) * 100).toFixed(1);
              return (
                <span className="text-xs font-medium text-[#5D6E73] capitalize">
                  {value} ({percentage}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
