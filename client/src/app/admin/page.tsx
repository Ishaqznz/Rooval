'use client';

import { useState } from "react";
import Sidebar from "@/modules/admin/sidebar/page";
import Header from "@/modules/admin/header/page";
import DashboardContent from "@/modules/admin/dashboard/page";

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <DashboardContent />
      </div>
    </div>
  );
};

export default App;