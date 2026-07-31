'use client';

import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon | React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'amber' | 'purple' | string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'blue',
  subtitle,
}) => {
  // Color presets for icon badges
  const getColorClasses = (c: string) => {
    switch (c) {
      case 'blue':
        return 'bg-blue-50 text-[#0a66c2] border-blue-100';
      case 'green':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'amber':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'purple':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      default:
        return 'bg-blue-50 text-[#0a66c2] border-blue-100';
    }
  };

  const renderIcon = () => {
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && 'render' in Icon)) {
      const Component = Icon as LucideIcon;
      return <Component className="w-5 h-5" />;
    }
    return Icon as React.ReactNode;
  };

  const isUp = trendDirection === 'up';
  const isDown = trendDirection === 'down';

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`p-2.5 rounded-lg border ${getColorClasses(color)} flex items-center justify-center`}>
          {renderIcon()}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
        {trend && (
          <div
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              isUp
                ? 'bg-emerald-50 text-emerald-700'
                : isDown
                ? 'bg-rose-50 text-rose-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isUp && <TrendingUp className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />}
            {isDown && <TrendingDown className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
