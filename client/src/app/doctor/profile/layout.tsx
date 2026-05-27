import Navigation from "@/components/user/Navigation";
import ProfileSidebar from "@/components/doctor/profile/ProfileSidebar";
import DoctorGuard from "@/guards/doctorGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DoctorGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex pt-20">
          <ProfileSidebar />
          {children}
        </div>
      </div>
    </DoctorGuard>
  );
}
