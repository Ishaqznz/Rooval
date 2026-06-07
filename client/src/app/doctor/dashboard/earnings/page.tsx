'use client';

import { doctorServiceApi } from "@/services/doctorApiService";
import { useEffect, useState } from "react";

/* ── Types ───────────────────────────────────────────────────── */
type PaymentStatus        = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
type AppointmentType      = 'IN_PERSON' | 'ONLINE';
type AppointmentStatusType = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

interface EarningsRevenue {
  availableBalance: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

interface EarningsAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  session: { startTime: string; endTime: string };
  status: AppointmentStatusType;
  type: AppointmentType;
  appointmentNo: number;
  reason?: string | null;
  paymentStatus: PaymentStatus;
  paymentId?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  slotDuration?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface EarningsData {
  revenue: EarningsRevenue;
  todayAppointments: EarningsAppointment[];
  recentReviews: { rating: number }[];
}

/* ── Badge configs ───────────────────────────────────────────── */
const PAYMENT_BADGE: Record<PaymentStatus, { label: string; cls: string; dot: string }> = {
  PENDING:  { label: 'Pending',  cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100', dot: 'bg-yellow-400' },
  PAID:     { label: 'Paid',     cls: 'bg-green-50 text-green-700 border border-green-100',   dot: 'bg-green-500' },
  REFUNDED: { label: 'Refunded', cls: 'bg-blue-50 text-blue-700 border border-blue-100',      dot: 'bg-blue-500' },
  FAILED:   { label: 'Failed',   cls: 'bg-red-50 text-red-700 border border-red-100',         dot: 'bg-red-500' },
};

const APPOINTMENT_TYPE_LABEL: Record<AppointmentType, string> = {
  IN_PERSON: 'In-person',
  ONLINE: 'Online',
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
function getDuration(start?: string, end?: string) {
  if (!start || !end) return null;
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
function barWidth(value: number, max: number) {
  if (!max) return '0%';
  return `${Math.min(100, (value / max) * 100)}%`;
}

/* ── Commission ──────────────────────────────────────────────── */
const COMMISSION_RATE = 0.20; // 20%
function grossFromNet(net: number) { return net / (1 - COMMISSION_RATE); }
function commissionFromNet(net: number) { return grossFromNet(net) - net; }

/* ── Icons ───────────────────────────────────────────────────── */
const IconDollar = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconWallet = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
    <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
    <circle cx="17" cy="13" r="1" fill="currentColor"/>
  </svg>
);
const IconTrendUp = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconCalendar = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const IconClock = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
  </svg>
);
const IconVideo = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.72v6.56a1 1 0 0 1-1.45.9L15 14"/>
    <rect x="2" y="7" width="13" height="10" rx="2"/>
  </svg>
);
const IconBuilding = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M6 21V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14"/>
    <path d="M9 10h2M13 10h2M9 14h2M13 14h2M9 18h2M13 18h2"/>
  </svg>
);


/* ── Revenue Summary Cards ───────────────────────────────────── */
interface RevCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconCls: string;
  valueCls?: string;
  accent?: boolean;
}
function RevCard({ label, value, sub, icon, iconCls, valueCls = 'text-foreground', accent }: RevCardProps) {
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
function RevCardSkeleton() {
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

/* ── Payment Breakdown Bar ───────────────────────────────────── */
interface BreakdownProps {
  paid: number; pending: number; refunded: number; failed: number; total: number;
}
function PaymentBreakdownBar({ paid, pending, refunded, failed, total }: BreakdownProps) {
  const segments = [
    { key: 'Paid',     count: paid,     color: 'bg-green-500' },
    { key: 'Pending',  count: pending,  color: 'bg-yellow-400' },
    { key: 'Refunded', count: refunded, color: 'bg-blue-500' },
    { key: 'Failed',   count: failed,   color: 'bg-red-400' },
  ].filter(s => s.count > 0);

  return (
    <div className="space-y-2">
      {/* Stacked bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden flex gap-0.5">
        {segments.map(s => (
          <div
            key={s.key}
            className={`h-full rounded-full ${s.color} transition-all duration-700`}
            style={{ width: barWidth(s.count, total) }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {segments.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${s.color}`}/>
            <span className="text-[10px] text-muted-foreground">
              {s.key} <span className="font-medium text-foreground">{s.count}</span>
              <span className="text-muted-foreground"> ({pct(s.count, total)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Transaction Row ─────────────────────────────────────────── */
function TransactionRow({ appt }: { appt: EarningsAppointment }) {
  const badge = PAYMENT_BADGE[appt.paymentStatus];
  const duration = getDuration(appt.session?.startTime, appt.session?.endTime);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {/* Date+time */}
      <div className="sm:w-40 shrink-0">
        <p className="text-xs font-medium text-foreground">{formatDate(appt.session?.startTime)}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
          <IconClock className="w-3 h-3"/> {formatTime(appt.session?.startTime)}
          {duration && <span className="ml-1 text-muted-foreground/60">· {duration}</span>}
        </p>
      </div>

      {/* Appointment info */}
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">#{appt.appointmentNo}</span>
        <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
          {appt.type === 'ONLINE' ? <IconVideo className="w-2.5 h-2.5"/> : <IconBuilding className="w-2.5 h-2.5"/>}
          <span className="ml-0.5">{APPOINTMENT_TYPE_LABEL[appt.type]}</span>
        </span>
        {appt.reason && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[160px]" title={appt.reason}>
            {appt.reason}
          </span>
        )}
      </div>

      {/* Payment ID */}
      {appt.paymentId && (
        <div className="sm:w-36 shrink-0">
          <p className="text-[10px] text-muted-foreground font-mono truncate" title={appt.paymentId}>
            {appt.paymentId.slice(0, 16)}…
          </p>
        </div>
      )}

      {/* Status badge */}
      <div className="sm:w-28 shrink-0 flex sm:justify-end">
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}/>
          {badge.label}
        </span>
      </div>
    </div>
  );
}

/* ── Skeleton rows ───────────────────────────────────────────── */
function TxRowSkeleton() {
  return (
    <div className="px-4 py-4 flex items-center gap-4 border-b border-border last:border-0">
      <div className="space-y-1.5 w-40 shrink-0">
        <div className="h-3 w-24 bg-muted animate-pulse rounded"/>
        <div className="h-2.5 w-16 bg-muted animate-pulse rounded"/>
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-5 w-40 bg-muted animate-pulse rounded-full"/>
      </div>
      <div className="h-5 w-20 bg-muted animate-pulse rounded-full"/>
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

/* ── Filter Tabs ─────────────────────────────────────────────── */
type FilterTab = 'ALL' | 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';

function FilterTabs({ active, onChange, counts }: {
  active: FilterTab;
  onChange: (t: FilterTab) => void;
  counts: Record<FilterTab, number>;
}) {
  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'ALL',      label: 'All' },
    { key: 'PAID',     label: 'Paid' },
    { key: 'PENDING',  label: 'Pending' },
    { key: 'REFUNDED', label: 'Refunded' },
    { key: 'FAILED',   label: 'Failed' },
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            active === t.key
              ? 'bg-foreground text-background border-foreground'
              : 'bg-background text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          {t.label}
          <span className={`text-[10px] px-1.5 py-0 rounded-full ${
            active === t.key ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
          }`}>
            {counts[t.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── Withdraw Banner ─────────────────────────────────────────── */
function WithdrawBanner({ balance }: { balance: number }) {
  if (balance <= 0) return null;
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <IconWallet className="w-4 h-4 text-emerald-600"/>
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-800">
            {formatCurrency(balance)} available in your wallet
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">
            Manage your balance and withdrawals from your wallet
          </p>
        </div>
      </div>
      <a
        href="/doctor/profile/wallet"
        className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
      >
        <IconWallet className="w-3 h-3"/> Go to Wallet
        <svg className="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function DoctorEarningsPage() {
  const [data, setData]         = useState<EarningsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const response = await doctorServiceApi.getDashboardData(`
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
            paymentStatus
            paymentId
            cancelledBy
            cancelReason
            slotDuration
            createdAt
            updatedAt
          }
          recentReviews {
            rating
          }
        `);
        const d = response?.data?.getDoctorDashboardStats;
        if (d) setData(d);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  /* ── derived ── */
  const appointments = data?.todayAppointments ?? [];
  const revenue      = data?.revenue;

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

  const onlineCount    = appointments.filter(a => a.type === 'ONLINE').length;
  const inPersonCount  = appointments.filter(a => a.type === 'IN_PERSON').length;

  return (
    <div className="flex-1 p-6 sm:p-8">
      <div className="max-w-5xl space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">Earnings</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-full bg-muted text-muted-foreground border border-border">
            <IconCalendar className="w-3 h-3"/> Today's view
          </span>
        </div>

        {/* ── Commission Notice ── */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 flex items-start gap-3">
          <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800">Platform Commission: 20%</p>
            <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
              A 20% platform fee is deducted from each appointment. Revenue figures shown below reflect your <span className="font-medium">net earnings</span> after commission.
            </p>
          </div>
        </div>

        {/* ── Withdraw Banner ── */}
        {!loading && revenue && (
          <WithdrawBanner balance={revenue.availableBalance}/>
        )}

        {/* ── Revenue Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <RevCardSkeleton key={i}/>)
          ) : (
            <>
              <RevCard
                label="Available Balance"
                value={formatCurrency(revenue?.availableBalance ?? 0)}
                sub="After 20% platform commission"
                icon={<IconWallet className="w-4 h-4 text-emerald-600"/>}
                iconCls="bg-emerald-50"
                valueCls="text-emerald-600"
                accent
              />
              <RevCard
                label="Today's Revenue"
                value={formatCurrency(revenue?.todayRevenue ?? 0)}
                sub={`Commission: ${formatCurrency(commissionFromNet(revenue?.todayRevenue ?? 0))}`}
                icon={<IconCalendar className="w-4 h-4 text-orange-600"/>}
                iconCls="bg-orange-50"
              />
              <RevCard
                label="Monthly Revenue"
                value={formatCurrency(revenue?.monthlyRevenue ?? 0)}
                sub={`Commission: ${formatCurrency(commissionFromNet(revenue?.monthlyRevenue ?? 0))}`}
                icon={<IconTrendUp className="w-4 h-4 text-sky-600"/>}
                iconCls="bg-sky-50"
              />
              <RevCard
                label="Total Revenue"
                value={formatCurrency(revenue?.totalRevenue ?? 0)}
                sub={`Commission paid: ${formatCurrency(commissionFromNet(revenue?.totalRevenue ?? 0))}`}
                icon={<IconDollar className="w-4 h-4 text-indigo-600"/>}
                iconCls="bg-indigo-50"
              />
            </>
          )}
        </div>

        {/* ── Detailed Revenue Breakdown + Appointment Type Split ── */}
        {!loading && appointments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Payment status breakdown */}
            <div className="rounded-lg border border-border bg-background px-4 py-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">Payment Status Breakdown</p>
              <PaymentBreakdownBar
                paid={counts.PAID}
                pending={counts.PENDING}
                refunded={counts.REFUNDED}
                failed={counts.FAILED}
                total={counts.ALL}
              />
            </div>

            {/* Appointment type split */}
            <div className="rounded-lg border border-border bg-background px-4 py-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">Appointment Type Split</p>
              <div className="space-y-2">
                {/* Online */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><IconVideo className="w-3 h-3"/> Online</span>
                    <span className="font-medium text-foreground">{onlineCount} ({pct(onlineCount, counts.ALL)}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500 transition-all duration-700" style={{ width: barWidth(onlineCount, counts.ALL) }}/>
                  </div>
                </div>
                {/* In-person */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><IconBuilding className="w-3 h-3"/> In-person</span>
                    <span className="font-medium text-foreground">{inPersonCount} ({pct(inPersonCount, counts.ALL)}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: barWidth(inPersonCount, counts.ALL) }}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Transaction Table ── */}
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-border bg-muted/50">
            <div>
              <p className="text-xs font-semibold text-foreground">Today's Transactions</p>
              {!loading && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {counts.ALL} appointment{counts.ALL !== 1 ? 's' : ''} · {counts.PAID} paid
                </p>
              )}
            </div>
            {!loading && counts.ALL > 0 && (
              <FilterTabs active={activeTab} onChange={setActiveTab} counts={counts}/>
            )}
          </div>

          {/* Column headers */}
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-muted/30 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40 shrink-0">Date / Time</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">Appointment</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36 shrink-0">Payment ID</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28 text-right shrink-0">Status</p>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => <TxRowSkeleton key={i}/>)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<IconDollar className="w-10 h-10"/>}
              message={activeTab === 'ALL' ? 'No transactions today' : `No ${activeTab.toLowerCase()} transactions`}
              sub={activeTab === 'ALL' ? 'Earnings from today will appear here' : 'Try a different filter'}
            />
          ) : (
            filtered.map(appt => (
              <TransactionRow key={appt.id} appt={appt}/>
            ))
          )}
        </div>

        {/* ── Revenue Summary Strip ── */}
        {!loading && revenue && (
          <div className="rounded-lg border border-border bg-background overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Revenue Summary</p>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                20% platform commission applied
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
              {[
                { label: 'Available Balance',   value: formatCurrency(revenue.availableBalance), highlight: true },
                { label: "Today's Net Revenue", value: formatCurrency(revenue.todayRevenue) },
                { label: 'This Month (Net)',     value: formatCurrency(revenue.monthlyRevenue) },
                { label: 'Total Earned (Net)',   value: formatCurrency(revenue.totalRevenue) },
              ].map(item => (
                <div key={item.label} className="px-4 py-4 space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className={`text-lg font-bold ${item.highlight ? 'text-emerald-600' : 'text-foreground'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            {/* Commission detail row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border border-t border-dashed border-border bg-muted/20">
              {[
                { label: 'Gross (est.)',          value: formatCurrency(grossFromNet(revenue.availableBalance)) },
                { label: "Today's Commission",    value: formatCurrency(commissionFromNet(revenue.todayRevenue)) },
                { label: "Monthly Commission",    value: formatCurrency(commissionFromNet(revenue.monthlyRevenue)) },
                { label: "Total Commission Paid", value: formatCurrency(commissionFromNet(revenue.totalRevenue)) },
              ].map(item => (
                <div key={item.label} className="px-4 py-2.5 space-y-0.5">
                  <p className="text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wide">{item.label}</p>
                  <p className="text-xs font-semibold text-amber-600">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}