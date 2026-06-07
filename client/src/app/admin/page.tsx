'use client';

import { userServiceApi } from "@/services/userApiService";
import { useEffect, useState } from "react";

/* ── Types ───────────────────────────────────────────────────── */
type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
type AppointmentType   = 'IN_PERSON' | 'ONLINE';
type PaymentStatus     = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
type DoctorStatus      = 'approved' | 'pending' | 'rejected';

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  approvedDoctors: number;
  pendingDoctors: number;
  rejectedDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

interface AdminRevenue {
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  doctorPayouts: number;
  platformProfit: number;
}

interface RecentAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  session: { startTime: string; endTime: string };
  status: AppointmentStatus;
  type: AppointmentType;
  appointmentNo: number;
  reason?: string | null;
  notes?: string | null;
  paymentStatus: PaymentStatus;
  amount: number;
  paymentId?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  slotDuration?: number;
  bufferTime?: number;
  reminderSent?: boolean;
  isCheckedIn?: boolean;
  hasReviewed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RecentDoctor {
  id: string;
  fullName: string;
  email: string;
  status: DoctorStatus;
}

interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  isBlocked: boolean;
  isAdmin: boolean;
}

interface AdminDashboardData {
  stats: AdminStats;
  revenue: AdminRevenue;
  recentAppointments: RecentAppointment[];
  recentlyRegisteredDoctors: RecentDoctor[];
  recentlyRegisteredUsers: RecentUser[];
}

/* ── Badge configs ───────────────────────────────────────────── */
const STATUS_BADGE: Record<AppointmentStatus, { label: string; cls: string }> = {
  SCHEDULED: { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  COMPLETED: { label: 'Completed', cls: 'bg-green-50 text-green-700 border border-green-100' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border border-red-100' },
  NO_SHOW:   { label: 'No-show',   cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
};

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; cls: string }> = {
  PENDING:  { label: 'Pending',  cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
  PAID:     { label: 'Paid',     cls: 'bg-green-50 text-green-700 border border-green-100' },
  REFUNDED: { label: 'Refunded', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  FAILED:   { label: 'Failed',   cls: 'bg-red-50 text-red-700 border border-red-100' },
};

const DOCTOR_STATUS_BADGE: Record<DoctorStatus, { label: string; cls: string }> = {
  approved: { label: 'Approved', cls: 'bg-green-50 text-green-700 border border-green-100' },
  pending:  { label: 'Pending',  cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border border-red-100' },
};

/* ── Helpers ─────────────────────────────────────────────────── */
function formatTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-IN')}`;
}
function getDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return null;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
function timeAgo(iso?: string) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ── Icons ───────────────────────────────────────────────────── */
function IconUsers({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconStethoscope({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3a6 6 0 0 0 12 0v-3A2.5 2.5 0 0 0 11.5 2h-7z"/>
      <path d="M14 7.5a7 7 0 0 1 7 7 5 5 0 0 1-10 0"/>
      <circle cx="19" cy="17" r="2" fill="currentColor" strokeWidth="0"/>
    </svg>
  );
}
function IconCalendar({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  );
}
function IconCheckCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function IconXCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}
function IconDollar({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function IconTrendUp({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}
function IconWallet({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
      <circle cx="17" cy="13" r="1" fill="currentColor"/>
    </svg>
  );
}
function IconVideo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.72v6.56a1 1 0 0 1-1.45.9L15 14"/>
      <rect x="2" y="7" width="13" height="10" rx="2"/>
    </svg>
  );
}
function IconBuilding({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M6 21V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14"/>
      <path d="M9 10h2M13 10h2M9 14h2M13 14h2M9 18h2M13 18h2"/>
    </svg>
  );
}
function IconClock({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
    </svg>
  );
}
function IconShield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconUserCheck({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <polyline points="16 11 18 13 22 9"/>
    </svg>
  );
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({
  label, value, icon, iconCls, sub,
}: {
  label: string; value: string | number; icon: React.ReactNode; iconCls: string; sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconCls}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
        <div className="w-8 h-8 bg-muted animate-pulse rounded-lg" />
      </div>
      <div className="space-y-1.5">
        <div className="h-7 w-20 bg-muted animate-pulse rounded" />
        <div className="h-2.5 w-32 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

/* ── Doctor Status Donut (pure CSS) ─────────────────────────── */
function DoctorStatusBar({ approved, pending, rejected }: { approved: number; pending: number; rejected: number }) {
  const total = approved + pending + rejected;
  if (total === 0) return null;
  const approvedPct = Math.round((approved / total) * 100);
  const pendingPct  = Math.round((pending  / total) * 100);
  const rejectedPct = 100 - approvedPct - pendingPct;

  return (
    <div className="space-y-2">
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        <div className="rounded-full bg-green-500 transition-all duration-500" style={{ width: `${approvedPct}%` }} />
        <div className="rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${pendingPct}%` }} />
        <div className="rounded-full bg-red-400 transition-all duration-500" style={{ width: `${rejectedPct}%` }} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: 'Approved', value: approved, cls: 'bg-green-500' },
          { label: 'Pending',  value: pending,  cls: 'bg-yellow-400' },
          { label: 'Rejected', value: rejected, cls: 'bg-red-400' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${item.cls}`} />
            <span className="text-[10px] text-muted-foreground">{item.label}: <span className="font-medium text-foreground">{item.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Recent Appointment Row ──────────────────────────────────── */
function AppointmentRow({ appt }: { appt: RecentAppointment }) {
  const duration = getDuration(appt.session?.startTime, appt.session?.endTime);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {/* Time */}
      <div className="sm:w-32 shrink-0">
        <p className="text-xs font-medium text-foreground leading-snug">
          {formatTime(appt.session?.startTime)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(appt.session?.startTime)}</p>
        {duration && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <IconClock className="w-2.5 h-2.5" />{duration}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-foreground">#{appt.appointmentNo}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[appt.status].cls}`}>
            {STATUS_BADGE[appt.status].label}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            {appt.type === 'ONLINE' ? <IconVideo className="w-2.5 h-2.5" /> : <IconBuilding className="w-2.5 h-2.5" />}
            <span className="ml-0.5">{appt.type === 'IN_PERSON' ? 'In-person' : 'Online'}</span>
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PAYMENT_BADGE[appt.paymentStatus].cls}`}>
            {PAYMENT_BADGE[appt.paymentStatus].label}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-foreground">{formatCurrency(appt.amount)}</p>
        <p className="text-[10px] text-muted-foreground">{timeAgo(appt.createdAt)}</p>
      </div>
    </div>
  );
}

/* ── Doctor Row ──────────────────────────────────────────────── */
function DoctorRow({ doctor }: { doctor: RecentDoctor }) {
  const badge = DOCTOR_STATUS_BADGE[doctor.status] ?? DOCTOR_STATUS_BADGE.pending;
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center shrink-0">
        {initials(doctor.fullName)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{doctor.fullName}</p>
        <p className="text-[10px] text-muted-foreground truncate">{doctor.email}</p>
      </div>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
        {badge.label}
      </span>
    </div>
  );
}

/* ── User Row ────────────────────────────────────────────────── */
function UserRow({ user }: { user: RecentUser }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center shrink-0">
        {initials(user.fullName)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{user.fullName}</p>
        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {user.isAdmin && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            <IconShield className="w-2.5 h-2.5" /> Admin
          </span>
        )}
        {user.isBlocked && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
            Blocked
          </span>
        )}
        {!user.isAdmin && !user.isBlocked && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
            Active
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton Rows ───────────────────────────────────────────── */
function RowSkeleton() {
  return (
    <div className="px-4 py-4 flex items-center gap-3 border-b border-border last:border-0">
      <div className="space-y-1.5 w-32 shrink-0">
        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        <div className="h-2.5 w-16 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-5 w-48 bg-muted animate-pulse rounded-full" />
      </div>
      <div className="h-4 w-12 bg-muted animate-pulse rounded" />
    </div>
  );
}
function PersonRowSkeleton() {
  return (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-border last:border-0">
      <div className="w-7 h-7 bg-muted animate-pulse rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 bg-muted animate-pulse rounded" />
        <div className="h-2.5 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-4 w-16 bg-muted animate-pulse rounded-full" />
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      <div className="mb-3 opacity-30">{icon}</div>
      <p className="text-sm font-medium">{message}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  );
}

/* ── Section Header ──────────────────────────────────────────── */
function SectionHeader({ title, sub, badge }: { title: string; sub?: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
      <div>
        <p className="text-xs font-semibold text-foreground">{title}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {badge}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [data, setData]       = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      setLoading(true);
      try {
        const response = await userServiceApi.getAdminDashboard(`
          stats {
            totalUsers
            totalDoctors
            approvedDoctors
            pendingDoctors
            rejectedDoctors
            totalAppointments
            completedAppointments
            cancelledAppointments
          }
          revenue {
            todayRevenue
            monthlyRevenue
            totalRevenue
            doctorPayouts
            platformProfit
          }
          recentAppointments {
            id
            patientId
            doctorId
            session { startTime endTime }
            status
            type
            appointmentNo
            reason
            notes
            paymentStatus
            amount
            paymentId
            cancelledBy
            cancelReason
            slotDuration
            bufferTime
            reminderSent
            isCheckedIn
            hasReviewed
            createdAt
            updatedAt
          }
          recentlyRegisteredDoctors {
            id
            fullName
            email
            status
          }
          recentlyRegisteredUsers {
            id
            fullName
            email
            isBlocked
            isAdmin
          }
        `);
        const d = response?.data?.getDashboardData;
        if (d) setData(d);
      } catch {
        // silently fail — UI handles empty state
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  const stats   = data?.stats;
  const revenue = data?.revenue;

  const completionRate =
    stats && stats.totalAppointments > 0
      ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
      : 0;

  const platformProfitPct =
    revenue && revenue.totalRevenue > 0
      ? Math.round((revenue.platformProfit / revenue.totalRevenue) * 100)
      : 0;

  return (
    <div className="flex-1 p-6 sm:p-8">
      <div className="max-w-5xl space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Users"
                value={stats?.totalUsers ?? 0}
                icon={<IconUsers className="w-4 h-4 text-blue-600" />}
                iconCls="bg-blue-50"
                sub="Registered patients"
              />
              <StatCard
                label="Total Doctors"
                value={stats?.totalDoctors ?? 0}
                icon={<IconStethoscope className="w-4 h-4 text-violet-600" />}
                iconCls="bg-violet-50"
                sub={`${stats?.approvedDoctors ?? 0} approved`}
              />
              <StatCard
                label="Approved Doctors"
                value={stats?.approvedDoctors ?? 0}
                icon={<IconUserCheck className="w-4 h-4 text-green-600" />}
                iconCls="bg-green-50"
                sub={`${stats?.pendingDoctors ?? 0} pending approval`}
              />
              <StatCard
                label="Pending Doctors"
                value={stats?.pendingDoctors ?? 0}
                icon={<IconClock className="w-4 h-4 text-orange-600" />}
                iconCls="bg-orange-50"
                sub="Awaiting review"
              />
              <StatCard
                label="Total Appointments"
                value={stats?.totalAppointments ?? 0}
                icon={<IconCalendar className="w-4 h-4 text-sky-600" />}
                iconCls="bg-sky-50"
                sub="All time"
              />
              <StatCard
                label="Completed"
                value={stats?.completedAppointments ?? 0}
                icon={<IconCheckCircle className="w-4 h-4 text-emerald-600" />}
                iconCls="bg-emerald-50"
                sub={`${completionRate}% completion rate`}
              />
              <StatCard
                label="Cancelled"
                value={stats?.cancelledAppointments ?? 0}
                icon={<IconXCircle className="w-4 h-4 text-red-500" />}
                iconCls="bg-red-50"
                sub="All time"
              />
              <StatCard
                label="Platform Profit"
                value={formatCurrency(revenue?.platformProfit ?? 0)}
                icon={<IconDollar className="w-4 h-4 text-indigo-600" />}
                iconCls="bg-indigo-50"
                sub={`${platformProfitPct}% of total revenue`}
              />
            </>
          )}
        </div>

        {/* ── Doctor status breakdown ── */}
        {!loading && stats && (
          <div className="rounded-lg border border-border bg-background px-4 py-3.5 space-y-2.5">
            <p className="text-xs font-semibold text-foreground">Doctor Verification Status</p>
            <DoctorStatusBar
              approved={stats.approvedDoctors}
              pending={stats.pendingDoctors}
              rejected={stats.rejectedDoctors}
            />
          </div>
        )}

        {/* ── Revenue Overview ── */}
        {!loading && revenue && (
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/50">
              <p className="text-xs font-semibold text-foreground">Revenue Overview</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-border">
              {[
                { label: "Today's Revenue",  value: formatCurrency(revenue.todayRevenue),   highlight: false },
                { label: 'Monthly Revenue',  value: formatCurrency(revenue.monthlyRevenue), highlight: false },
                { label: 'Total Revenue',    value: formatCurrency(revenue.totalRevenue),   highlight: false },
                { label: 'Doctor Payouts',   value: formatCurrency(revenue.doctorPayouts),  highlight: false },
                { label: 'Platform Profit',  value: formatCurrency(revenue.platformProfit), highlight: true  },
              ].map(item => (
                <div key={item.label} className="px-4 py-4 space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className={`text-base font-bold ${item.highlight ? 'text-emerald-600' : 'text-foreground'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            {/* Payout vs profit bar */}
            <div className="px-4 pb-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">Revenue split</p>
                <p className="text-[10px] text-muted-foreground">
                  Doctors {revenue.totalRevenue > 0 ? Math.round((revenue.doctorPayouts / revenue.totalRevenue) * 100) : 0}% · Platform {platformProfitPct}%
                </p>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                <div
                  className="rounded-full bg-violet-400 transition-all duration-500"
                  style={{ width: `${revenue.totalRevenue > 0 ? Math.round((revenue.doctorPayouts / revenue.totalRevenue) * 100) : 0}%` }}
                />
                <div
                  className="rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${platformProfitPct}%` }}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  <span className="text-[10px] text-muted-foreground">Doctor Payouts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-muted-foreground">Platform Profit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Recent Appointments ── */}
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <SectionHeader
            title="Recent Appointments"
            sub={
              !loading
                ? data?.recentAppointments?.length
                  ? `${data.recentAppointments.length} recent appointment${data.recentAppointments.length !== 1 ? 's' : ''}`
                  : 'No appointments yet'
                : undefined
            }
            badge={
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                All time
              </span>
            }
          />
          {/* Column header */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32 shrink-0">Time</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">Details</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</p>
          </div>
          {loading ? (
            <div>{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
          ) : !data?.recentAppointments?.length ? (
            <EmptyState icon={<IconCalendar className="w-10 h-10" />} message="No appointments yet" />
          ) : (
            data.recentAppointments.map(appt => (
              <AppointmentRow key={appt.id} appt={appt} />
            ))
          )}
        </div>

        {/* ── Doctors & Users side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Recently Registered Doctors */}
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <SectionHeader
              title="Recently Registered Doctors"
              sub={
                !loading
                  ? data?.recentlyRegisteredDoctors?.length
                    ? `${data.recentlyRegisteredDoctors.length} doctor${data.recentlyRegisteredDoctors.length !== 1 ? 's' : ''}`
                    : 'No doctors yet'
                  : undefined
              }
              badge={
                !loading && stats ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                    {stats.totalDoctors} total
                  </span>
                ) : null
              }
            />
            {loading ? (
              <div>{Array.from({ length: 5 }).map((_, i) => <PersonRowSkeleton key={i} />)}</div>
            ) : !data?.recentlyRegisteredDoctors?.length ? (
              <EmptyState icon={<IconStethoscope className="w-10 h-10" />} message="No doctors registered" />
            ) : (
              data.recentlyRegisteredDoctors.map(doctor => (
                <DoctorRow key={doctor.id} doctor={doctor} />
              ))
            )}
          </div>

          {/* Recently Registered Users */}
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <SectionHeader
              title="Recently Registered Users"
              sub={
                !loading
                  ? data?.recentlyRegisteredUsers?.length
                    ? `${data.recentlyRegisteredUsers.length} user${data.recentlyRegisteredUsers.length !== 1 ? 's' : ''}`
                    : 'No users yet'
                  : undefined
              }
              badge={
                !loading && stats ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    {stats.totalUsers} total
                  </span>
                ) : null
              }
            />
            {loading ? (
              <div>{Array.from({ length: 5 }).map((_, i) => <PersonRowSkeleton key={i} />)}</div>
            ) : !data?.recentlyRegisteredUsers?.length ? (
              <EmptyState icon={<IconUsers className="w-10 h-10" />} message="No users registered" />
            ) : (
              data.recentlyRegisteredUsers.map(user => (
                <UserRow key={user.id} user={user} />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}