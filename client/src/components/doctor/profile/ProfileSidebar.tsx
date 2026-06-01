"use client";

import { User, MapPin, Video, Calendar, FileText, Shield, CalendarDays, MessageCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
const menuItems = [
  { icon: User, label: "General Info", path: "/doctor/profile/info" },
  { icon: MapPin, label: "Clinic & Location", path: "/doctor/profile/clinic-location" },
  { icon: Video, label: "Consultation Settings", path: "/doctor/profile/consultations" },
  { icon: Calendar, label: "Availability", path: "/doctor/profile/availability" },
  { icon: FileText, label: "Certificates & Licenses", path: "/doctor/profile/certificates" },
  { icon: Shield, label: "Account & Security", path: "/doctor/profile/security" },
  { icon: MessageCircle, label: 'Messages', path: '/doctor/messages'},
  { icon: Wallet, label: "Wallet", path: '/doctor/profile/wallet'}
];

export default function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-5rem)]">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Profile Settings</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
