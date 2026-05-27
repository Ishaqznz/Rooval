"use client";

import {
  User,
  MapPin,
  Video,
  Calendar,
  Shield,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: User, label: "General Info", path: "/profile/info" },
  { icon: MapPin, label: "Health Details", path: "/profile/health-details" },
  { icon: Video, label: "Preferences", path: "/profile/preferences" },
  { icon: Shield, label: "Account Settings", path: "/profile/account-settings" },
  { icon: CalendarDays, label: 'appointments', path: '/profile/appointments' },
  { icon: MessageCircle, label: 'messages', path: '/messages' }
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
