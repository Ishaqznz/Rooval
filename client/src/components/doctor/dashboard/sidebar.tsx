"use client";

import { doctorServiceApi } from "@/services/doctorApiService";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Icons = {
  layers: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  grid: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" /><rect x="9.5" y="1" width="5.5" height="5.5" rx="1.2" />
      <rect x="1" y="9.5" width="5.5" height="5.5" rx="1.2" /><rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.2" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="1" y="3" width="14" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M1 7h14" />
    </svg>
  ),
  live: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2" />
    </svg>
  ),
  patients: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="6" cy="5" r="3" /><path d="M1 14c0-3 2-5 5-5s5 2 5 5" />
      <circle cx="12" cy="4" r="2" /><path d="M12 8c2 0 3 1.5 3 3.5" />
    </svg>
  ),
  records: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 2h10a1 1 0 011 1v11l-3-2H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
      <path d="M5 6h6M5 9h4" />
    </svg>
  ),
  community: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 1C4.1 1 1 3.6 1 6.8c0 1.8.9 3.4 2.4 4.5L2.5 14l3-1.5c.8.3 1.6.4 2.5.4 3.9 0 7-2.6 7-5.8S11.9 1 8 1z" />
    </svg>
  ),
  messages: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 2h12a1 1 0 011 1v8a1 1 0 01-1 1H9l-3 2-1-2H2a1 1 0 01-1-1V3a1 1 0 011-1z" />
    </svg>
  ),
  earnings: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="8" r="6" /><path d="M8 5v1.5M8 10.5V12" />
      <path d="M5.8 6.5a2.2 1.5 0 104.4 0 2.2 1.5 0 00-4.4 0" />
      <path d="M5.8 9.5a2.2 1.5 0 104.4 0" />
    </svg>
  ),
  bell: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 2a4 4 0 014 4v3l1 2H3l1-2V6a4 4 0 014-4z" /><path d="M6 13a2 2 0 004 0" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M11.5 3.1l-1.4 1.4M4.5 11.5l-1.4 1.4" />
    </svg>
  ),
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/doctor/dashboard", icon: Icons.grid },
      { label: "Appointments", href: "/doctor/dashboard/appointments", icon: Icons.calendar },
      { label: "Sessions", href: "/doctor/dashboard/live-sessions", icon: Icons.live, badgeColor: "bg-green-500" },
    ],
  },
  {
    label: "Connect",
    items: [
      { label: "Messages", href: "/doctor/messages", icon: Icons.messages },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Earnings", href: "/doctor/dashboard/earnings", icon: Icons.earnings },
      { label: "Notifications", href: "/doctor/dashboard/notifications", icon: Icons.bell },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [doctorName, setDoctorName] = useState('');
  const [specializations, setSpecializations] = useState<string[]>()
  const [profilePhoto, setProfilePhoto] = useState()
  useEffect(() => {
    const fetchDoctorData = async () => {
      const response = await doctorServiceApi.findOne({
        fields: `
          fullName
          profilePhoto
          profile {
            personal {
              specializations
            } 
          }
        `})
      setDoctorName(response?.data?.findDoctor?.fullName)
      setSpecializations(response?.data?.findDoctor?.profile?.personal?.specializations)
      setProfilePhoto(response?.data?.findDoctor?.profilePhoto)
    }

    fetchDoctorData()
  }, [])

  return (
    <aside className="w-[230px] bg-card border-r border-border flex flex-col flex-shrink-0 h-full">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-[18px] py-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-primary font-heading">
              rooval
            </h1>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-2.5 px-[18px] py-4 border-b border-border">
        <div className="w-[42px] h-[42px] rounded-full overflow-hidden border-2 border-muted flex-shrink-0">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Doctor Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
              AM
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px] truncate">
            {doctorName ? `Dr. ${doctorName}` : "Loading..."}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {specializations && specializations.length > 0
              ? specializations.join(" • ")
              : "General Practitioner"}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 border-2 border-white flex-shrink-0" />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="px-[18px] py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-[18px] py-[9px] text-[13px] border-l-[2.5px] transition-all duration-150
                    ${active
                      ? "bg-purple-50 text-secondary border-primary font-medium"
                      : "text-muted-foreground border-transparent hover:bg-background hover:text-secondary hover:border-muted"
                    }`}
                >
                  <span className={active ? "opacity-100" : "opacity-60"}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${item.badgeColor ?? "bg-primary"}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-[18px] py-3.5 border-t border-border">
        <Link
          href="/doctor/profile/info"
          className="flex items-center gap-2 text-muted-foreground text-xs hover:text-secondary transition-colors w-full"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>

          <span>Back to Profile</span>
        </Link>
      </div>
    </aside>
  );
}