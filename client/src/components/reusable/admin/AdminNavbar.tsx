"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { authServiceApi } from "@/services/authApiService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import NotificationBell from "../../user/NotificationBell";
import { userServiceApi } from "@/services/userApiService";
import { connectSocket, disconnectSocket } from "@/sockets/socket";

export default function AdminNavbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  const profileRef = useRef<HTMLDivElement>(null);
  const [adminId, setAdminId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true); // Added a loading state flag

  // 1. Fetch Admin ID on component mount
  useEffect(() => {
    const getAdminId = async () => {
      try {
        const response = await userServiceApi.findOne({
          fields: `id`
        });
        const id = response?.data?.findUser?.id || '';
        setAdminId(id);
      } catch (error) {
        console.error("Failed to fetch admin ID:", error);
      } finally {
        setIsLoading(false); // Mark fetching as complete
      }
    };

    getAdminId();
  }, []);

  // 2. Control socket connection status strictly based on present ID state
  useEffect(() => {
    if (adminId) {
      console.log("[SOCKET]: Connecting Admin to Socket Server with ID:", adminId);
      connectSocket();
    }

    return () => {
      // Disconnect socket cleanly if adminId changes or when AdminNavbar unmounts
      if (adminId) {
        console.log("[SOCKET]: Cleaning up Admin Socket Connection.");
        disconnectSocket();
      }
    };
  }, [adminId]);

  // 3. Dropdown click listener
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    disconnectSocket(); // Disconnect socket immediately on logout action
    const response = await authServiceApi.logout();
    if (response?.errors) {
      toast.error(response?.errors?.[0]?.message || "Something went wrong!");
      return;
    }
    toast.success("Successful!");
    router.push('/admin/login');
  };

  return (
    <header className="h-16 bg-card border-b border-border sticky top-0 z-50 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 ml-[10px]">
        <h1 className="text-xl sm:text-2xl font-bold text-primary font-heading">
          rooval
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        
        {/* 🔔 Notification Bell: ONLY render when adminId is fetched and active */}
        {!isLoading && adminId && (
          <NotificationBell userId={adminId} variant="user" />
        )}

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-none">Admin</p>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                profileOpen && "rotate-180"
              )}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Admin Account</p>
              </div>
              <div className="border-t border-border py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}