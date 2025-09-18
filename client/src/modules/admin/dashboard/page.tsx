import { 
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
} from 'lucide-react';

import { StatCardData } from '@/interfaces/admin.interface';
import ChartBar from '../chartbar/page';
import StatCard from '../statcard/page';


// Main Dashboard Content
const DashboardContent: React.FC = () => {
  const statsData: StatCardData[] = [
    {
      title: 'Customers',
      value: '3,782',
      trend: 11.01,
      isPositive: true,
      icon: Users,
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Commissions', 
      value: '5,359',
      trend: -9.05,
      isPositive: false,
      icon: Package,
      iconBgColor: 'bg-purple-50',
      iconColor: 'text-purple-500'
    }
  ];

  const chartData: number[] = [150, 380, 180, 280, 160, 180, 280, 80, 200, 380, 260, 100];
  const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxHeight: number = 380;
  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {statsData.map((stat: StatCardData, index: number) => (
            <StatCard key={index} data={stat} />
          ))}
        </div>

        {/* Monthly Target */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Target</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">Target you've set for each month</p>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${75.55 * 3.52} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">75.55%</span>
                <span className="text-sm text-green-500 font-medium">+10%</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 text-center mb-6">
            You earn $3287 today, it's higher than last month. Keep up your good work!
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Target</p>
              <div className="flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-900">$20K</span>
                <TrendingDown className="text-red-500 ml-1" size={12} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Revenue</p>
              <div className="flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-900">$20K</span>
                <TrendingUp className="text-green-500 ml-1" size={12} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <div className="flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-900">$20K</span>
                <TrendingUp className="text-green-500 ml-1" size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Sales Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {/* <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Sales</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={16} />
          </button>
        </div> */}
        
        <div className="h-80 flex items-end justify-between space-x-2">
          {chartData.map((height: number, index: number) => (
            <ChartBar 
              key={index}
              height={height}
              month={months[index]}
              maxHeight={maxHeight}
            />
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
          <span>0</span>
          <span>100</span>
          <span>200</span>
          <span>300</span>
          <span>400</span>
        </div>
      </div>
    </main>
  );
};

export default DashboardContent