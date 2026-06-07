'use client';

import { doctorServiceApi } from "@/services/doctorApiService";
import { useEffect, useState } from "react";

type AppointmentStatusType = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
type AppointmentType       = 'IN_PERSON' | 'ONLINE';
type PaymentStatus         = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

interface DashboardRatings {
  averageRating: number;
  totalReviews: number;
}

interface DashboardRevenue {
  availableBalance: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

interface TodayAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  session: { startTime: string; endTime: string };
  status: AppointmentStatusType;
  type: AppointmentType;
  appointmentNo: number;
  reason?: string | null;
  notes?: string | null;
  paymentStatus: PaymentStatus;
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

interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  rating: number;
  review: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  ratings: DashboardRatings;
  revenue: DashboardRevenue;
  todayAppointments: TodayAppointment[];
  recentReviews: Review[];
}

/* ── Badge configs ───────────────────────────────────────────── */
const STATUS_BADGE: Record<AppointmentStatusType, { label: string; cls: string }> = {
  SCHEDULED: { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  COMPLETED: { label: 'Completed', cls: 'bg-green-50 text-green-700 border border-green-100' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border border-red-100' },
  NO_SHOW:   { label: 'No-show',   cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
};

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; cls: string }> = {
  PENDING:  { label: 'Payment Pending', cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
  PAID:     { label: 'Paid',            cls: 'bg-green-50 text-green-700 border border-green-100' },
  REFUNDED: { label: 'Refunded',        cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  FAILED:   { label: 'Payment Failed',  cls: 'bg-red-50 text-red-700 border border-red-100' },
};

/* ── Helpers ─────────────────────────────────────────────────── */
function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-IN')}`;
}
function getDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return null;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
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
function IconClock({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
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
function IconStar({ className = '', filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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
function IconWallet({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
      <circle cx="17" cy="13" r="1" fill="currentColor"/>
    </svg>
  );
}
function IconCheckIn({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon,
  iconCls,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconCls: string;
  sub?: string;
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

/* ── Today's Appointment Row ─────────────────────────────────── */
function TodayAppointmentRow({ appt }: { appt: TodayAppointment }) {
  const duration = getDuration(appt.session?.startTime, appt.session?.endTime);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {/* Left: time block */}
      <div className="sm:w-36 shrink-0">
        <p className="text-xs font-medium text-foreground leading-snug">
          {formatTime(appt.session?.startTime)}
          {appt.session?.endTime && <> – {formatTime(appt.session.endTime)}</>}
        </p>
        {duration && (
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <IconClock className="w-3 h-3" /> {duration}
          </p>
        )}
      </div>

      {/* Middle: info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-foreground">#{appt.appointmentNo}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[appt.status].cls}`}>
            {STATUS_BADGE[appt.status].label}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            {appt.type === 'ONLINE'
              ? <IconVideo className="w-2.5 h-2.5" />
              : <IconBuilding className="w-2.5 h-2.5" />}
            <span className="ml-0.5">{appt.type === 'IN_PERSON' ? 'In-person' : 'Online'}</span>
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PAYMENT_BADGE[appt.paymentStatus].cls}`}>
            {PAYMENT_BADGE[appt.paymentStatus].label}
          </span>
          {appt.isCheckedIn && (
            <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
              <IconCheckIn className="w-2.5 h-2.5" /> Checked in
            </span>
          )}
        </div>
        {appt.reason && (
          <p className="text-[10px] text-muted-foreground truncate max-w-xs" title={appt.reason}>
            {appt.reason}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Review Row ──────────────────────────────────────────────── */
function ReviewRow({ review }: { review: Review }) {
  return (
    <div className="flex gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {/* Avatar placeholder */}
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Stars + time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <IconStar
                key={star}
                className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
                filled={star <= review.rating}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">{review.rating}/5</span>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(review.createdAt)}</span>
        </div>

        {review.review && (
          <p className="text-xs text-foreground line-clamp-2">{review.review}</p>
        )}

        <p className="text-[10px] text-muted-foreground">
          Appointment #{review.appointmentId.slice(-6).toUpperCase()}
          {!review.isVisible && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              Hidden
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Skeleton rows ───────────────────────────────────────────── */
function RowSkeleton() {
  return (
    <div className="px-4 py-4 flex items-center gap-4 border-b border-border last:border-0">
      <div className="space-y-1.5 w-36 shrink-0">
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
        <div className="h-2.5 w-16 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
        <div className="h-5 w-48 bg-muted animate-pulse rounded-full" />
      </div>
    </div>
  );
}

function ReviewRowSkeleton() {
  return (
    <div className="px-4 py-4 flex gap-3 border-b border-border last:border-0">
      <div className="w-7 h-7 bg-muted animate-pulse rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        <div className="h-3 w-full bg-muted animate-pulse rounded" />
        <div className="h-2.5 w-28 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <div className="mb-3 opacity-30">{icon}</div>
      <p className="text-sm font-medium">{message}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function DoctorDashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorsDashboard = async () => {
      setLoading(true);
      try {
        const response = await doctorServiceApi.getDashboardData(`
          stats {
            totalPatients
            totalAppointments
            upcomingAppointments
            completedAppointments
            cancelledAppointments
          }
          ratings {
            averageRating
            totalReviews
          }
          revenue {
            availableBalance
            todayRevenue
            monthlyRevenue
            totalRevenue
          }
          todayAppointments {
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
          recentReviews {
            id
            doctorId
            patientId
            appointmentId
            rating
            review
            isVisible
            createdAt
            updatedAt
          }
        `);
        const d = response?.data?.getDoctorDashboardStats;
        if (d) setData(d);
      } catch {
        // silently fail — UI handles empty state
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsDashboard();
  }, []);

  const stats   = data?.stats;
  const ratings = data?.ratings;
  const revenue = data?.revenue;

  /* ── derived values ── */
  const appointmentCompletionRate =
    stats && stats.totalAppointments > 0
      ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
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
                label="Total Patients"
                value={stats?.totalPatients ?? 0}
                icon={<IconUsers className="w-4 h-4 text-blue-600" />}
                iconCls="bg-blue-50"
                sub="All time"
              />
              <StatCard
                label="Total Appointments"
                value={stats?.totalAppointments ?? 0}
                icon={<IconCalendar className="w-4 h-4 text-violet-600" />}
                iconCls="bg-violet-50"
                sub="All time"
              />
              <StatCard
                label="Upcoming"
                value={stats?.upcomingAppointments ?? 0}
                icon={<IconClock className="w-4 h-4 text-orange-600" />}
                iconCls="bg-orange-50"
                sub="Scheduled"
              />
              <StatCard
                label="Completed"
                value={stats?.completedAppointments ?? 0}
                icon={<IconCheckCircle className="w-4 h-4 text-green-600" />}
                iconCls="bg-green-50"
                sub={`${appointmentCompletionRate}% completion rate`}
              />
              <StatCard
                label="Cancelled"
                value={stats?.cancelledAppointments ?? 0}
                icon={<IconXCircle className="w-4 h-4 text-red-500" />}
                iconCls="bg-red-50"
                sub="All time"
              />
              <StatCard
                label="Available Balance"
                value={formatCurrency(revenue?.availableBalance ?? 0)}
                icon={<IconWallet className="w-4 h-4 text-emerald-600" />}
                iconCls="bg-emerald-50"
                sub="Ready to withdraw"
              />
              <StatCard
                label="Monthly Revenue"
                value={formatCurrency(revenue?.monthlyRevenue ?? 0)}
                icon={<IconTrendUp className="w-4 h-4 text-sky-600" />}
                iconCls="bg-sky-50"
                sub={`Today: ${formatCurrency(revenue?.todayRevenue ?? 0)}`}
              />
              <StatCard
                label="Total Revenue"
                value={formatCurrency(revenue?.totalRevenue ?? 0)}
                icon={<IconDollar className="w-4 h-4 text-indigo-600" />}
                iconCls="bg-indigo-50"
                sub="All time earnings"
              />
            </>
          )}
        </div>

        {/* ── Ratings bar ── */}
        {!loading && ratings && (
          <div className="rounded-lg border border-border bg-background px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <IconStar
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(ratings.averageRating) ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
                    filled={star <= Math.round(ratings.averageRating)}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">{ratings.averageRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">average rating</span>
            </div>
            <div className="h-px sm:h-5 w-full sm:w-px bg-border" />
            <p className="text-xs text-muted-foreground">
              Based on <span className="font-medium text-foreground">{ratings.totalReviews}</span> review{ratings.totalReviews !== 1 ? 's' : ''}
            </p>
            {/* Simple rating bar */}
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${(ratings.averageRating / 5) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{ratings.totalReviews} total</span>
            </div>
          </div>
        )}

        {/* ── Bottom two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Today's Appointments */}
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
              <div>
                <p className="text-xs font-semibold text-foreground">Today's Appointments</p>
                {!loading && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {data?.todayAppointments?.length
                      ? `${data.todayAppointments.length} appointment${data.todayAppointments.length !== 1 ? 's' : ''} today`
                      : 'No appointments scheduled'}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })}
              </span>
            </div>

            {/* Column header */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36 shrink-0">Time</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">Status / Type</p>
            </div>

            {loading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
              </div>
            ) : !data?.todayAppointments?.length ? (
              <EmptyState
                icon={<IconCalendar className="w-10 h-10" />}
                message="No appointments today"
                sub="Enjoy your free day!"
              />
            ) : (
              data.todayAppointments.map(appt => (
                <TodayAppointmentRow key={appt.id} appt={appt} />
              ))
            )}
          </div>

          {/* Recent Reviews */}
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
              <div>
                <p className="text-xs font-semibold text-foreground">Recent Reviews</p>
                {!loading && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {data?.recentReviews?.length
                      ? `${data.recentReviews.length} recent review${data.recentReviews.length !== 1 ? 's' : ''}`
                      : 'No reviews yet'}
                  </p>
                )}
              </div>
              {!loading && ratings && (
                <div className="flex items-center gap-1">
                  <IconStar className="w-3.5 h-3.5 text-yellow-400" filled />
                  <span className="text-xs font-semibold text-foreground">{ratings.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Column header */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">Review</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</p>
            </div>

            {loading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 4 }).map((_, i) => <ReviewRowSkeleton key={i} />)}
              </div>
            ) : !data?.recentReviews?.length ? (
              <EmptyState
                icon={<IconStar className="w-10 h-10" />}
                message="No reviews yet"
                sub="Reviews from patients will appear here"
              />
            ) : (
              data.recentReviews.map(review => (
                <ReviewRow key={review.id} review={review} />
              ))
            )}
          </div>
        </div>

        {/* ── Revenue summary strip ── */}
        {!loading && revenue && (
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/50">
              <p className="text-xs font-semibold text-foreground">Revenue Overview</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
              {[
                { label: 'Available Balance', value: formatCurrency(revenue.availableBalance), highlight: true },
                { label: "Today's Revenue",   value: formatCurrency(revenue.todayRevenue),    highlight: false },
                { label: 'This Month',        value: formatCurrency(revenue.monthlyRevenue),  highlight: false },
                { label: 'Total Earned',      value: formatCurrency(revenue.totalRevenue),    highlight: false },
              ].map(item => (
                <div key={item.label} className="px-4 py-4 space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className={`text-lg font-bold ${item.highlight ? 'text-emerald-600' : 'text-foreground'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}