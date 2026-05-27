import React from "react";
import Navigation from "@/components/user/Navigation";
import ProfileSidebar from "@/components/user/profile/ProfileSidebar";
import UserGuard from "@/guards/userGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex pt-20">
          <ProfileSidebar />
          {children}
        </div>
      </div>
    </UserGuard>
  );
}