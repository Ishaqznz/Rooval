// Sidebar Component
import { SidebarProps } from "@/interfaces/common/admin.interface";
import { MenuItem } from "@/interfaces/common/admin.interface";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  ShoppingCart,
  User,
  CheckSquare,
  FileText,
  Table,
  File,
  ChevronDown,
} from 'lucide-react';

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const router = useRouter()

  const toggleExpand = (item: string): void => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Bot, label: 'Doctors', path: '/admin/doctors' },
    { icon: ShoppingCart, label: 'Patients', path: '/admin/users' },
    { icon: User, label: 'Appointments', path: '/admin/appointments' },
    { icon: CheckSquare, label: 'Revenue & Commission', path: '/admin/revenue' },
    { icon: FileText, label: 'Live Sessions', path: '/admin/sessions' },
    { icon: Table, label: 'Communities', path: '/admin/communities' },
    { icon: File, label: 'Notifications', path: '/admin/notifications' },
  ];


  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 lg:w-64'
      } overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Rooval</span>
        </div>
      </div>

      <nav className="px-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
          MENU
        </div>

        <ul className="space-y-1">
          {menuItems.map((item: MenuItem, index: number) => (
            <li key={index}>
              <button
                onClick={() => {
                  if (item.path) router.push(item.path);
                  if (item.hasSubmenu) toggleExpand(item.label);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >

                <div className="flex items-center space-x-3">
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.hasSubmenu && (
                  <ChevronDown
                    size={14}
                    className={`transform transition-transform ${expandedItems[item.label] ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-3 px-3">
          SUPPORT
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar