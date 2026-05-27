import React from "react";
import DoctorSidebar from "@/components/doctor/dashboard/sidebar";
import DoctorGuard from "@/guards/doctorGuard";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DoctorGuard>
    <div className="flex h-screen bg-background overflow-hidden">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
    </DoctorGuard>
  );
}