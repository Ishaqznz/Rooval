import AdminSidebar from "@/components/reusable/admin/AdminSidebar";
import AdminNavbar from "@/components/reusable/admin/AdminNavbar";
import AdminGuard from "@/guards/adminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <AdminNavbar />

        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}