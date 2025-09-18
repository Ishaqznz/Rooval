import React, {  } from 'react';
import { 
  LucideIcon
} from 'lucide-react';


export interface MenuItem {
  icon: LucideIcon;
  label: string;
  badge?: string;
  path: string;
  hasSubmenu?: boolean;
}

export interface StatCardData {
  title: string;
  value: string;
  trend: number;
  isPositive: boolean;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
}

export interface User {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  status?: 'active' | 'blocked';
  joinDate?: string;
  avatar?: string;
  lastLogin?: string;
}

export interface UserListingProps {
  users?: User[];
}

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  licenseNumber?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'blocked';
  applicationDate?: string;
  lastLogin?: string;
  avatar?: string;
  location?: string;
  rating?: number;
  patientsCount?: number;
  qualification?: string;
}

export interface DoctorListingProps {
  doctors?: Doctor[];
}