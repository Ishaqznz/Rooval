import { StatCardData } from '@/interfaces/common/admin.interface';

import {
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
} from 'lucide-react';


const StatCard: React.FC<{ data: StatCardData }> = ({ data }) => {
  const { title, value, trend, isPositive, icon: Icon, iconBgColor, iconColor } = data;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${iconBgColor} rounded-lg`}>
          <Icon className={iconColor} size={24} />
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-1">
            <TrendIcon className={trendColor + " mr-1"} size={16} />
            <span className={`${trendColor} text-sm font-medium`}>
              {Math.abs(trend).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;