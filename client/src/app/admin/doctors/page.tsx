'use client';

import { useEffect, useState } from "react";
import { apiRequest } from "@/api";
import { FIND_DOCTORS_QUERY } from "@/graphql/queries/doctor";
import { Doctor } from "@/interfaces/admin.interface"; 
import Sidebar from "@/modules/admin/sidebar/page";
import Header from "@/modules/admin/header/page";
import DoctorListing from "@/modules/admin/doctor-listing/page";

export default function Doctors() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [doctorData, setDoctorData] = useState<Doctor[]>([]);

  const fetchDoctorData = async () => {
  try {
    const response = await apiRequest(FIND_DOCTORS_QUERY);

    const transformed = response.findDoctors.map((doc: any) => ({
      ...doc,
      status: "pending",          
      specialization: "General",  
      licenseNumber: "N/A",
      applicationDate: new Date().toISOString(),
    }));

    console.log('transformed data: ', transformed)

      setDoctorData(transformed);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };


  useEffect(() => {
    fetchDoctorData();
  }, []);

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <DoctorListing doctors={doctorData}/>
      </div>
    </div>
  );
}
