'use client';

import { userServiceApi } from "@/services/userApiService";
import { useEffect, useState } from "react";

/* ── Types ───────────────────────────────────────────────────── */
type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
type AppointmentType   = 'IN_PERSON' | 'ONLINE';
type PaymentStatus     = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

interface AdminRevenue {
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  doctorPayouts: number;
  platformProfit: number;
}

interface AdminStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
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
  paymentStatus: PaymentStatus;
  amount: number;
  paymentId?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  slotDuration?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface RevenuePageData {
  revenue: AdminRevenue;
  stats: AdminStats;
  recentAppointments: RecentAppointment[];
}

/* ── Constants ───────────────────────────────────────────────── */
const COMMISSION_RATE = 0.20;

/* ── Badge configs ───────────────────────────────────────────── */
const PAYMENT_BADGE: Record<PaymentStatus, { label: string; cls: string; dot: string }> = {
  PENDING:  { label: 'Pending',  cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100', dot: 'bg-yellow-400' },
  PAID:     { label: 'Paid',     cls: 'bg-green-50 text-green-700 border border-green-100',   dot: 'bg-green-500' },
  REFUNDED: { label: 'Refunded', cls: 'bg-blue-50 text-blue-700 border border-blue-100',      dot: 'bg-blue-500' },
  FAILED:   { label: 'Failed',   cls: 'bg-red-50 text-red-700 border border-red-100',         dot: 'bg-red-500' },
};

const STATUS_BADGE: Record<AppointmentStatus, { label: string; cls: string }> = {
  SCHEDULED: { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  COMPLETED: { label: 'Completed', cls: 'bg-green-50 text-green-700 border border-green-100' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border border-red-100' },
  NO_SHOW:   { label: 'No-show',   cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
};

/* ── Helpers ─────────────────────────────────────────────────── */
function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function timeAgo(iso?: string) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
function barW(value: number, max: number) {
  if (!max) return '0%';
  return `${Math.min(100, (value / max) * 100)}%`;
}
function commission(amount: number) { return amount * COMMISSION_RATE; }
function doctorShare(amount: number) { return amount * (1 - COMMISSION_RATE); }

/* ── Icons ───────────────────────────────────────────────────── */
const Ico = {
  Dollar: ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  TrendUp: ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Wallet: ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
      <circle cx="17" cy="13" r="1" fill="currentColor"/>
    </svg>
  ),
  Percent: ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  Calendar: ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  Video: ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.72v6.56a1 1 0 0 1-1.45.9L15 14"/>
      <rect x="2" y="7" width="13" height="10" rx="2"/>
    </svg>
  ),
  Building: ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M6 21V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14"/>
      <path d="M9 10h2M13 10h2M9 14h2M13 14h2"/>
    </svg>
  ),
  Users: ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Info: ({ className = '' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, iconCls, valueCls = 'text-foreground', accent }: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  iconCls: string; valueCls?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-lg border bg-background p-4 space-y-3 ${accent ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-border'}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconCls}`}>{icon}</div>
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none ${valueCls}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}
function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 bg-muted animate-pulse rounded"/>
        <div className="w-8 h-8 bg-muted animate-pulse rounded-lg"/>
      </div>
      <div className="space-y-1.5">
        <div className="h-7 w-24 bg-muted animate-pulse rounded"/>
        <div className="h-2.5 w-36 bg-muted animate-pulse rounded"/>
      </div>
    </div>
  );
}

/* ── Split Bar ───────────────────────────────────────────────── */
function SplitBar({ doctorPct, platformPct }: { doctorPct: number; platformPct: number }) {
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        <div className="rounded-full bg-violet-400 transition-all duration-700 flex items-center justify-center"
          style={{ width: `${doctorPct}%` }}>
          {doctorPct > 10 && <span className="text-[8px] font-bold text-white">{doctorPct}%</span>}
        </div>
        <div className="rounded-full bg-emerald-500 transition-all duration-700 flex items-center justify-center"
          style={{ width: `${platformPct}%` }}>
          {platformPct > 10 && <span className="text-[8px] font-bold text-white">{platformPct}%</span>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400"/>
          <span className="text-[10px] text-muted-foreground">Doctor Payouts <span className="font-semibold text-foreground">{doctorPct}%</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>
          <span className="text-[10px] text-muted-foreground">Platform Commission <span className="font-semibold text-foreground">{platformPct}%</span></span>
        </div>
      </div>
    </div>
  );
}

/* ── Payment Status Breakdown ────────────────────────────────── */
function PaymentBreakdown({ appointments }: { appointments: RecentAppointment[] }) {
  const total    = appointments.length;
  const paid     = appointments.filter(a => a.paymentStatus === 'PAID').length;
  const pending  = appointments.filter(a => a.paymentStatus === 'PENDING').length;
  const refunded = appointments.filter(a => a.paymentStatus === 'REFUNDED').length;
  const failed   = appointments.filter(a => a.paymentStatus === 'FAILED').length;

  const paidAmt     = appointments.filter(a => a.paymentStatus === 'PAID').reduce((s, a) => s + a.amount, 0);
  const refundedAmt = appointments.filter(a => a.paymentStatus === 'REFUNDED').reduce((s, a) => s + a.amount, 0);

  const segments = [
    { key: 'Paid',     count: paid,     color: 'bg-green-500' },
    { key: 'Pending',  count: pending,  color: 'bg-yellow-400' },
    { key: 'Refunded', count: refunded, color: 'bg-blue-400' },
    { key: 'Failed',   count: failed,   color: 'bg-red-400' },
  ].filter(s => s.count > 0);

  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden flex gap-0.5">
        {segments.map(s => (
          <div key={s.key} className={`h-full rounded-full ${s.color} transition-all duration-700`}
            style={{ width: barW(s.count, total) }}/>
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {segments.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${s.color}`}/>
            <span className="text-[10px] text-muted-foreground">
              {s.key}: <span className="font-medium text-foreground">{s.count}</span>
              <span className="text-muted-foreground"> ({pct(s.count, total)}%)</span>
            </span>
          </div>
        ))}
      </div>
      {/* Amount summary */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Collected (Paid)</p>
          <p className="text-sm font-bold text-green-600 mt-0.5">{formatCurrency(paidAmt)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Refunded</p>
          <p className="text-sm font-bold text-blue-500 mt-0.5">{formatCurrency(refundedAmt)}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Appointment Type Revenue Split ─────────────────────────── */
function TypeRevenueSplit({ appointments }: { appointments: RecentAppointment[] }) {
  const online    = appointments.filter(a => a.type === 'ONLINE');
  const inPerson  = appointments.filter(a => a.type === 'IN_PERSON');
  const onlineAmt = online.reduce((s, a) => s + a.amount, 0);
  const ipAmt     = inPerson.reduce((s, a) => s + a.amount, 0);
  const total     = onlineAmt + ipAmt;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Ico.Video className="w-3 h-3"/> Online ({online.length})</span>
          <span className="font-semibold text-foreground">{formatCurrency(onlineAmt)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-violet-500 transition-all duration-700" style={{ width: barW(onlineAmt, total) }}/>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Ico.Building className="w-3 h-3"/> In-person ({inPerson.length})</span>
          <span className="font-semibold text-foreground">{formatCurrency(ipAmt)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-sky-500 transition-all duration-700" style={{ width: barW(ipAmt, total) }}/>
        </div>
      </div>
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">Total collected</p>
        <p className="text-sm font-bold text-foreground">{formatCurrency(total)}</p>
      </div>
    </div>
  );
}

/* ── Transaction Row ─────────────────────────────────────────── */
function TransactionRow({ appt }: { appt: RecentAppointment }) {
  const badge        = PAYMENT_BADGE[appt.paymentStatus];
  const statusBadge  = STATUS_BADGE[appt.status];
  const commAmt      = commission(appt.amount);
  const doctorAmt    = doctorShare(appt.amount);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {/* Date + time */}
      <div className="sm:w-36 shrink-0">
        <p className="text-xs font-medium text-foreground">{formatDate(appt.session?.startTime)}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{formatTime(appt.session?.startTime)}</p>
      </div>

      {/* Appointment info */}
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">#{appt.appointmentNo}</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge.cls}`}>
          {statusBadge.label}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
          {appt.type === 'ONLINE' ? <Ico.Video className="w-2.5 h-2.5"/> : <Ico.Building className="w-2.5 h-2.5"/>}
          <span className="ml-0.5">{appt.type === 'IN_PERSON' ? 'In-person' : 'Online'}</span>
        </span>
      </div>

      {/* Commission breakdown */}
      <div className="sm:w-52 shrink-0 flex items-center gap-2">
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Gross</span>
            <span className="text-[10px] font-semibold text-foreground">{formatCurrency(appt.amount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-violet-600 uppercase tracking-wide">Doctor (80%)</span>
            <span className="text-[10px] font-medium text-violet-600">{formatCurrency(doctorAmt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-emerald-600 uppercase tracking-wide">Platform (20%)</span>
            <span className="text-[10px] font-semibold text-emerald-600">{formatCurrency(commAmt)}</span>
          </div>
        </div>
      </div>

      {/* Payment status + time */}
      <div className="sm:w-28 shrink-0 flex sm:flex-col sm:items-end gap-2 sm:gap-1">
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}/>
          {badge.label}
        </span>
        <span className="text-[10px] text-muted-foreground">{timeAgo(appt.createdAt)}</span>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────── */
function TxSkeleton() {
  return (
    <div className="px-4 py-4 flex items-center gap-3 border-b border-border last:border-0">
      <div className="space-y-1.5 w-36 shrink-0">
        <div className="h-3 w-24 bg-muted animate-pulse rounded"/>
        <div className="h-2.5 w-16 bg-muted animate-pulse rounded"/>
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-5 w-40 bg-muted animate-pulse rounded-full"/>
      </div>
      <div className="h-4 w-20 bg-muted animate-pulse rounded"/>
    </div>
  );
}
function PanelSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background p-4 space-y-3">
      <div className="h-3 w-32 bg-muted animate-pulse rounded"/>
      <div className="h-2 w-full bg-muted animate-pulse rounded-full"/>
      <div className="flex gap-4">
        <div className="h-2.5 w-20 bg-muted animate-pulse rounded"/>
        <div className="h-2.5 w-20 bg-muted animate-pulse rounded"/>
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <div className="mb-3 opacity-30">{icon}</div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

/* ── Filter Tabs ─────────────────────────────────────────────── */
type FilterTab = 'ALL' | 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
function FilterTabs({ active, onChange, counts }: {
  active: FilterTab; onChange: (t: FilterTab) => void; counts: Record<FilterTab, number>;
}) {
  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: 'All' }, { key: 'PAID', label: 'Paid' },
    { key: 'PENDING', label: 'Pending' }, { key: 'REFUNDED', label: 'Refunded' }, { key: 'FAILED', label: 'Failed' },
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            active === t.key
              ? 'bg-foreground text-background border-foreground'
              : 'bg-background text-muted-foreground border-border hover:bg-muted'
          }`}>
          {t.label}
          <span className={`text-[10px] px-1.5 py-0 rounded-full ${active === t.key ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'}`}>
            {counts[t.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function AdminRevenueCommissionsPage() {
  const [data, setData]           = useState<RevenuePageData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const response = await userServiceApi.getAdminDashboard(`
          revenue {
            todayRevenue
            monthlyRevenue
            totalRevenue
            doctorPayouts
            platformProfit
          }
          stats {
            totalAppointments
            completedAppointments
            cancelledAppointments
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
            paymentStatus
            amount
            paymentId
            cancelledBy
            cancelReason
            slotDuration
            createdAt
            updatedAt
          }
        `);
        const d = response?.data?.getDashboardData;
        if (d) setData(d);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  /* ── derived ── */
  const revenue      = data?.revenue;
  const appointments = data?.recentAppointments ?? [];
  const stats        = data?.stats;

  const doctorPct   = revenue ? pct(revenue.doctorPayouts, revenue.totalRevenue) : 80;
  const platformPct = revenue ? pct(revenue.platformProfit, revenue.totalRevenue) : 20;

  const totalCollected = appointments
    .filter(a => a.paymentStatus === 'PAID')
    .reduce((s, a) => s + a.amount, 0);

  const totalCommission = appointments
    .filter(a => a.paymentStatus === 'PAID')
    .reduce((s, a) => s + commission(a.amount), 0);

  const counts: Record<FilterTab, number> = {
    ALL:      appointments.length,
    PAID:     appointments.filter(a => a.paymentStatus === 'PAID').length,
    PENDING:  appointments.filter(a => a.paymentStatus === 'PENDING').length,
    REFUNDED: appointments.filter(a => a.paymentStatus === 'REFUNDED').length,
    FAILED:   appointments.filter(a => a.paymentStatus === 'FAILED').length,
  };

  const filtered = activeTab === 'ALL'
    ? appointments
    : appointments.filter(a => a.paymentStatus === activeTab);

  return (
    <div className="flex-1 p-6 sm:p-8">
      <div className="max-w-5xl space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">Revenue & Commissions</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {/* Commission rate badge */}
          <div className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Ico.Percent className="w-3 h-3"/> Platform Commission: 20%
          </div>
        </div>

        {/* ── Top stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i}/>)
          ) : (
            <>
              <StatCard
                label="Platform Profit"
                value={formatCurrency(revenue?.platformProfit ?? 0)}
                sub={`${platformPct}% of total revenue`}
                icon={<Ico.Percent className="w-4 h-4 text-emerald-600"/>}
                iconCls="bg-emerald-50"
                valueCls="text-emerald-600"
                accent
              />
              <StatCard
                label="Today's Revenue"
                value={formatCurrency(revenue?.todayRevenue ?? 0)}
                sub={`Commission: ${formatCurrency((revenue?.todayRevenue ?? 0) * COMMISSION_RATE)}`}
                icon={<Ico.Calendar className="w-4 h-4 text-orange-600"/>}
                iconCls="bg-orange-50"
              />
              <StatCard
                label="Monthly Revenue"
                value={formatCurrency(revenue?.monthlyRevenue ?? 0)}
                sub={`Commission: ${formatCurrency((revenue?.monthlyRevenue ?? 0) * COMMISSION_RATE)}`}
                icon={<Ico.TrendUp className="w-4 h-4 text-sky-600"/>}
                iconCls="bg-sky-50"
              />
              <StatCard
                label="Total Revenue"
                value={formatCurrency(revenue?.totalRevenue ?? 0)}
                sub={`Doctor payouts: ${formatCurrency(revenue?.doctorPayouts ?? 0)}`}
                icon={<Ico.Dollar className="w-4 h-4 text-indigo-600"/>}
                iconCls="bg-indigo-50"
              />
            </>
          )}
        </div>

        {/* ── Revenue split + collected from transactions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Revenue split bar */}
          <div className="sm:col-span-2 rounded-lg border border-border bg-background px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Revenue Split</p>
              <span className="text-[10px] text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{formatCurrency(revenue?.totalRevenue ?? 0)}</span>
              </span>
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted animate-pulse rounded-full"/>
                <div className="h-2.5 w-48 bg-muted animate-pulse rounded"/>
              </div>
            ) : (
              <SplitBar doctorPct={doctorPct} platformPct={platformPct}/>
            )}
            {!loading && revenue && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Doctor Payouts</p>
                  <p className="text-base font-bold text-violet-600 mt-0.5">{formatCurrency(revenue.doctorPayouts)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Platform Profit</p>
                  <p className="text-base font-bold text-emerald-600 mt-0.5">{formatCurrency(revenue.platformProfit)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Commission from recent transactions */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 px-4 py-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">From Recent Transactions</p>
            {loading ? (
              <div className="space-y-2">
                <div className="h-6 w-24 bg-muted animate-pulse rounded"/>
                <div className="h-2.5 w-32 bg-muted animate-pulse rounded"/>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Collected (paid)</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{formatCurrency(totalCollected)}</p>
                </div>
                <div className="pt-2 border-t border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Platform 20%</span>
                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(totalCommission)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Doctor 80%</span>
                    <span className="text-xs font-semibold text-violet-600">{formatCurrency(totalCollected - totalCommission)}</span>
                  </div>
                  {/* mini bar */}
                  <div className="flex h-1.5 rounded-full overflow-hidden mt-1 gap-0.5">
                    <div className="rounded-full bg-violet-400" style={{ width: '80%' }}/>
                    <div className="rounded-full bg-emerald-500" style={{ width: '20%' }}/>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Analysis panels ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-background px-4 py-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">Payment Status Breakdown</p>
            {loading ? <PanelSkeleton/> : appointments.length === 0
              ? <p className="text-xs text-muted-foreground">No data</p>
              : <PaymentBreakdown appointments={appointments}/>
            }
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">Revenue by Appointment Type</p>
            {loading ? <PanelSkeleton/> : appointments.length === 0
              ? <p className="text-xs text-muted-foreground">No data</p>
              : <TypeRevenueSplit appointments={appointments}/>
            }
          </div>
        </div>

        {/* ── Appointment performance strip ── */}
        {!loading && stats && (
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/50">
              <p className="text-xs font-semibold text-foreground">Appointment Performance</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border">
              {[
                { label: 'Total',     value: stats.totalAppointments,     cls: 'text-foreground' },
                { label: 'Completed', value: stats.completedAppointments, cls: 'text-green-600' },
                { label: 'Cancelled', value: stats.cancelledAppointments, cls: 'text-red-500' },
              ].map(item => (
                <div key={item.label} className="px-4 py-4 space-y-1 text-center">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.cls}`}>{item.value}</p>
                  {item.label !== 'Total' && (
                    <p className="text-[10px] text-muted-foreground">{pct(item.value, stats.totalAppointments)}%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Transactions table ── */}
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-border bg-muted/50">
            <div>
              <p className="text-xs font-semibold text-foreground">Recent Transactions</p>
              {!loading && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {counts.ALL} transaction{counts.ALL !== 1 ? 's' : ''} · {counts.PAID} paid
                  · Commission shown per row
                </p>
              )}
            </div>
            {!loading && counts.ALL > 0 && (
              <FilterTabs active={activeTab} onChange={setActiveTab} counts={counts}/>
            )}
          </div>

          {/* Column headers */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36 shrink-0">Date / Time</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">Appointment</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-52 shrink-0">Commission Breakdown</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28 text-right shrink-0">Status</p>
          </div>

          {/* Rows */}
          {loading ? (
            <div>{Array.from({ length: 5 }).map((_, i) => <TxSkeleton key={i}/>)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Ico.Dollar className="w-10 h-10"/>}
              message={activeTab === 'ALL' ? 'No transactions found' : `No ${activeTab.toLowerCase()} transactions`}
            />
          ) : (
            filtered.map(appt => <TransactionRow key={appt.id} appt={appt}/>)
          )}
        </div>

        {/* ── Full revenue summary strip ── */}
        {!loading && revenue && (
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Full Revenue Summary</p>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                20% platform commission
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-border">
              {[
                { label: "Today's Revenue", value: formatCurrency(revenue.todayRevenue) },
                { label: 'Monthly Revenue', value: formatCurrency(revenue.monthlyRevenue) },
                { label: 'Total Revenue',   value: formatCurrency(revenue.totalRevenue) },
                { label: 'Doctor Payouts',  value: formatCurrency(revenue.doctorPayouts),  cls: 'text-violet-600' },
                { label: 'Platform Profit', value: formatCurrency(revenue.platformProfit), cls: 'text-emerald-600' },
              ].map(item => (
                <div key={item.label} className="px-4 py-4 space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className={`text-base font-bold ${(item as any).cls ?? 'text-foreground'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}