// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   Menu,
//   Search,
//   Moon,
//   Bell,
//   ChevronDown,
// } from 'lucide-react';

// import { HeaderProps } from '@/interfaces/common/admin.interface';
// import { apiRequest } from '@/api';
// import { FIND_USER_QUERY } from '@/graphql/queries/user';


// // Header Component
// const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
//   const [userData, setUserData] = useState<Record<string, any>>()
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => {
//     const fetchUser = async () => {
//       const data = await apiRequest(FIND_USER_QUERY)
//       setUserData(data)
//       setMounted(true)
//     }

//     fetchUser()
//   }, [])

//   if (!mounted) return null;
//   return (
//     <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//       <div className="flex items-center space-x-4">
//         <button
//           onClick={toggleSidebar}
//           className="lg:hidden p-2 rounded-md hover:bg-gray-100"
//         >
//           <Menu size={20} />
//         </button>

//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//           <input
//             type="text"
//             placeholder="Search or type command..."
//             className="pl-10 pr-20 py-2 w-96 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//           <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">⌘K</span>
//         </div>
//       </div>

//       <div className="flex items-center space-x-4">
//         <button className="p-2 rounded-md hover:bg-gray-100">
//           <Moon size={20} className="text-gray-600" />
//         </button>
//         <button className="p-2 rounded-md hover:bg-gray-100 relative">
//           <Bell size={20} className="text-gray-600" />
//           <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
//         </button>
//         <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
//           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
//             <span className="text-white text-sm font-medium">{userData?.email?.slice(0, 1) ?? 'A'}</span>
//           </div>
//           <span className="text-sm font-medium text-gray-700">{userData?.email ?? 'admin'}</span>
//           <ChevronDown size={16} className="text-gray-400" />
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;