"use client";

import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  Video,
  MessageSquare,
  Bell
} from "lucide-react";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Stethoscope, label: "Doctors", path: "/admin/doctors" },
  { icon: Calendar, label: "Appointments", path: "/admin/appointments" },
  { icon: DollarSign, label: "Revenue & Commissions", path: "/admin/revenue" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-5rem)]">
      <div className="p-6">

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
