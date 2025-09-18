'use client';

import { useEffect, useState } from "react";
import { apiRequest } from "@/api";
import { FIND_USERS_QUERY } from "@/graphql/queries/user";
import { User } from "@/interfaces/admin.interface";
import Header from "@/modules/admin/header/page";
import UserListing from "@/modules/admin/user-listing/page";
import Sidebar from "@/modules/admin/sidebar/page";

export default function Users() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<User[]>([]);

  const fetchUserData = async () => {
    try {
      const response = await apiRequest(FIND_USERS_QUERY);
      const transformed = transformUsers(response.findUsers);
      setUserData(transformed);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <UserListing users={userData} />
      </div>
    </div>
  );
}

// Helper function
const transformUsers = (users: any[]): User[] => {
  console.log('users data in the front end after fetching: ', users)
  return users.map(user => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    status: user.isBlocked ? "blocked" : "active",
    role: user.isAdmin ? "admin" : "user",
    phone: user.phone ?? "",
    joinDate: user.joinDate ?? "",
    avatar: user.avatar ?? "",
    lastLogin: user.lastLogin ?? ""
  }));
};
