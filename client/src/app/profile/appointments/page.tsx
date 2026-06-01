'use client';

import { Button } from "@/components/reusable/ui/button";
import { useAuth } from "@/context/AuthContext";
import { AppointmentStatus, IListAppointment } from "@/interfaces/user/appointment.interface";
import { appointmentServiceApi } from "@/services/appointmentApiService";
import { paymentServiceApi } from "@/services/paymentApiService";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


type AppointmentStatusType = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
type AppointmentType   = 'IN_PERSON' | 'ONLINE';
type PaymentStatus     = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
type FilterTab         = 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

interface Appointment {
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
  amount?: number | null;
  paymentId?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  bufferTime?: number;
  reminderSent?: boolean;
  isCheckedIn?: boolean;
  createdAt?: string;
  updatedAt?: string;
  doctor: {
    fullName: string;
  };
}

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

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All',       value: 'ALL' },
  { label: 'Upcoming',  value: 'SCHEDULED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const PAGE_LIMIT = 8;

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateTime(iso?: string | null) {
  if (!iso) return '—';
  return formatDate(iso) + ' · ' + formatTime(iso);
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

/* ── Icons ───────────────────────────────────────────────────── */
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
function IconDoc({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
    </svg>
  );
}
function IconUser({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconHash({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  );
}
function IconCreditCard({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}
function IconXCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}
function IconMessage({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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

/* ── Cancel Modal ────────────────────────────────────────────── */
function CancelModal({
  onConfirm,
  onClose,
  loading,
}: {
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Cancel Appointment</h2>
          <button onClick={onClose} disabled={loading} className="text-muted-foreground hover:text-foreground text-lg leading-none disabled:opacity-50">✕</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-muted-foreground">Let the doctor know why you're cancelling.</p>
          <textarea
            ref={ref}
            value={reason}
            onChange={e => setReason(e.target.value)}
            disabled={loading}
            placeholder="e.g. Schedule conflict, feeling better…"
            rows={3}
            className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none disabled:opacity-50"
          />
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Go Back</Button>
          <Button
            size="sm"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading || !reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            {loading ? 'Cancelling…' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Modal ────────────────────────────────────────────── */
function DetailModal({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
  const duration = getDuration(appt.session?.startTime, appt.session?.endTime);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[appt.status].cls}`}>
              {STATUS_BADGE[appt.status].label}
            </span>
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              {appt.type === 'ONLINE'
                ? <IconVideo className="w-3 h-3" />
                : <IconBuilding className="w-3 h-3" />}
              {appt.type === 'IN_PERSON' ? 'In-person' : 'Online'}
            </span>
            {appt.isCheckedIn && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                <IconCheckIn className="w-3 h-3" /> Checked in
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none ml-2">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm">

          {/* Session card */}
          <div className="rounded-lg bg-muted/40 border border-border p-3.5 space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Session</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-0.5">Date</p>
                <p className="font-medium text-foreground">{formatDate(appt.session?.startTime)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Time</p>
                <p className="font-medium text-foreground">
                  {formatTime(appt.session?.startTime)}
                  {appt.session?.endTime && <> – {formatTime(appt.session.endTime)}</>}
                </p>
              </div>
              {duration && (
                <div>
                  <p className="text-muted-foreground mb-0.5">Duration</p>
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <IconClock className="w-3 h-3 text-muted-foreground" /> {duration}
                  </p>
                </div>
              )}
            </div>
            {appt.bufferTime != null && appt.bufferTime > 0 && (
              <p className="text-xs text-muted-foreground">
                + {appt.bufferTime} min buffer after session
              </p>
            )}
          </div>

          {/* Doctor & IDs */}
          <div className="rounded-lg bg-muted/40 border border-border p-3.5 space-y-2 text-xs">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Appointment info</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <IconUser className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground leading-tight">Doctor</p>
                  <p className="font-medium text-foreground">{appt.doctor.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <IconHash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground leading-tight">Appt. No.</p>
                  <p className="font-medium text-foreground">#{appt.appointmentNo}</p>
                </div>
              </div>
            </div>
            {appt.createdAt && (
              <p className="text-muted-foreground pt-1 border-t border-border/60">
                Booked on {formatDateTime(appt.createdAt)}
              </p>
            )}
          </div>

          {/* Payment */}
          <div className="rounded-lg bg-muted/40 border border-border p-3.5 space-y-2 text-xs">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payment</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconCreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={`font-medium px-2 py-0.5 rounded-full ${PAYMENT_BADGE[appt.paymentStatus].cls}`}>
                  {PAYMENT_BADGE[appt.paymentStatus].label}
                </span>
              </div>
              {appt.amount != null && (
                <p className="font-semibold text-foreground text-sm">${appt.amount.toLocaleString('en-IN')}</p>
              )}
            </div>
            {appt.paymentId && (
              <p className="text-muted-foreground">Payment ID: <span className="font-mono text-foreground">{appt.paymentId}</span></p>
            )}
          </div>

          {/* Reason / Notes */}
          {(appt.reason || appt.notes) && (
            <div className="space-y-3">
              {appt.reason && (
                <div className="flex gap-2">
                  <IconDoc className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Reason for Visit</p>
                    <p className="text-foreground text-xs">{appt.reason}</p>
                  </div>
                </div>
              )}
              {appt.notes && (
                <div className="flex gap-2">
                  <IconDoc className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Doctor's Notes</p>
                    <p className="text-foreground text-xs">{appt.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancellation */}
          {(appt.cancelReason || appt.cancelledBy) && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <IconXCircle className="w-3.5 h-3.5 text-red-500" />
                <p className="font-semibold text-red-700 text-[10px] uppercase tracking-wider">Cancellation Details</p>
              </div>
              {appt.cancelledBy && (
                <p className="text-red-600">Cancelled by: <span className="font-medium">{appt.cancelledBy}</span></p>
              )}
              {appt.cancelReason && (
                <p className="text-red-700">{appt.cancelReason}</p>
              )}
            </div>
          )}

          {/* Reminder chip */}
          {appt.reminderSent && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Reminder sent
            </p>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

/* ── Appointment Row ─────────────────────────────────────────── */
function AppointmentRow({
  appt,
  onCancel,
  cancelling,
  onViewDetails,
  onPay,
  paying,
}: {
  appt: Appointment;
  onCancel: (id: string) => void;
  cancelling: boolean;
  onViewDetails: () => void;
  onPay: (id: string) => void;
  paying: boolean;
}) {
  const router = useRouter();
  const canCancel = appt.status === 'SCHEDULED';
  const canPay    = appt.paymentStatus === 'PENDING' && appt.status !== 'CANCELLED';
  const duration  = getDuration(appt.session?.startTime, appt.session?.endTime);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">

      {/* Left: date block */}
      <div className="sm:w-48 shrink-0">
        <p className="text-xs font-medium text-foreground leading-snug">
          {formatDate(appt.session?.startTime)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatTime(appt.session?.startTime)}
          {appt.session?.endTime && <> – {formatTime(appt.session.endTime)}</>}
          {duration && <span className="ml-1 opacity-60">({duration})</span>}
        </p>
      </div>

      {/* Middle: info */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Row 1: doctor + appt no */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-foreground truncate">
            Dr. {appt.doctor.fullName}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">#{appt.appointmentNo}</span>
        </div>

        {/* Row 2: badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
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
            {appt.paymentStatus === 'PAID' ? 'Paid' : PAYMENT_BADGE[appt.paymentStatus].label}
            {appt.amount != null && appt.paymentStatus === 'PAID' ? ` · $${appt.amount.toLocaleString('en-IN')}` : ''}
          </span>
          {appt.isCheckedIn && (
            <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
              <IconCheckIn className="w-2.5 h-2.5" /> Checked in
            </span>
          )}
        </div>

        {/* Row 3: reason or cancel reason */}
        {appt.cancelReason ? (
          <p className="text-[10px] text-red-500 truncate max-w-xs" title={appt.cancelReason}>
            Cancelled: {appt.cancelReason}
          </p>
        ) : appt.reason ? (
          <p className="text-[10px] text-muted-foreground truncate max-w-xs" title={appt.reason}>
            {appt.reason}
          </p>
        ) : null}
      </div>

      {/* Right: amount + actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {appt.amount != null && appt.paymentStatus !== 'PAID' && (
          <span className="text-xs font-medium text-foreground mr-1">
            ${appt.amount.toLocaleString('en-IN')}
          </span>
        )}

        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={onViewDetails}>
          Details
        </Button>

        {appt.paymentStatus === 'PAID' && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2.5 flex items-center gap-1 text-primary border-primary/30 hover:bg-primary/10"
            onClick={() => router.push(`/messages?id=${appt.doctorId}`)}
          >
            <IconMessage className="w-3 h-3" />
            Message
          </Button>
        )}

        {canPay && (
          <Button
            size="sm"
            className="h-7 text-xs px-2.5 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={paying}
            onClick={() => onPay(appt.id)}
          >
            {paying ? 'Redirecting…' : 'Pay Now'}
          </Button>
        )}

        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={cancelling}
            onClick={() => onCancel(appt.id)}
          >
            {cancelling ? '…' : 'Cancel'}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function UserAppointments() {
  const { user } = useAuth();

  const [appointments, setAppointments]       = useState<Appointment[]>([]);
  const [total, setTotal]                     = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState<FilterTab>('ALL');
  const [search, setSearch]                   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]                       = useState(1);
  const [cancelTargetId, setCancelTargetId]   = useState<string | null>(null);
  const [cancellingId, setCancellingId]       = useState<string | null>(null);
  const [payingId, setPayingId]               = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt]       = useState<Appointment | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  useEffect(() => { setPage(1); }, [activeTab]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const input: IListAppointment = { page, limit: PAGE_LIMIT };
      if (debouncedSearch) input.search = debouncedSearch;
      if (activeTab !== 'ALL') input.appointmentStatus = AppointmentStatus[activeTab];

      const res = await appointmentServiceApi.listUser({
        input,
        fields: `
          appointments {
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
            bufferTime
            reminderSent
            isCheckedIn
            createdAt
            updatedAt
            doctor { fullName }
          }
          appointmentsCount
        `,
      });

      const data = res?.data?.listUserAppointments;
      setAppointments(data?.appointments ?? []);
      setTotal(data?.appointmentsCount ?? 0);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, debouncedSearch]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments, user]);

  const handleCancelClick   = (id: string) => setCancelTargetId(id);
  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTargetId) return;
    setCancellingId(cancelTargetId);
    try {
      const result = await appointmentServiceApi.cancel({
        input: { appointmentId: cancelTargetId, reason },
      });
      if (result?.data?.cancelAppointment) {
        toast.success('Appointment cancelled');
        setAppointments(prev =>
          prev.map(a =>
            a.id === cancelTargetId ? { ...a, status: 'CANCELLED', cancelReason: reason, paymentStatus: 'FAILED' } : a
          )
        );
        setCancelTargetId(null);
      } else {
        toast.error('Could not cancel appointment');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePay = async (appointmentId: string) => {
    setPayingId(appointmentId);
    try {
      const response = await paymentServiceApi.createCheckoutSession({
        input: { appointmentId },
        fields: `url`,
      });
      if (response?.errors) {
        toast.error(response?.errors?.[0]?.message || 'Failed to create a payment session');
        return;
      }
      const checkoutUrl = response?.data?.createPaymentSession?.url;
      if (!checkoutUrl) { toast.error('Invalid checkout session'); return; }
      window.location.href = checkoutUrl;
    } catch {
      toast.error('Something went wrong during payment');
    } finally {
      setPayingId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <div className="flex-1 p-6 sm:p-8">
      <div className="max-w-3xl space-y-5">

        <div>
          <h1 className="text-xl font-bold text-foreground">My Appointments</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total > 0 ? `${total} appointment${total !== 1 ? 's' : ''} found` : 'No appointments yet'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search appointments…"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  activeTab === tab.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/50 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-48 shrink-0">Date & Time</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">Doctor / Status</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</p>
          </div>

          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-4 flex items-center gap-4">
                  <div className="space-y-1.5 w-48 shrink-0">
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-2.5 w-24 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-36 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-52 bg-muted animate-pulse rounded-full" />
                  </div>
                  <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <svg className="w-10 h-10 mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <p className="text-sm font-medium">No appointments found</p>
              <p className="text-xs mt-1">
                {activeTab !== 'ALL'
                  ? `No ${activeTab.toLowerCase()} appointments.`
                  : debouncedSearch
                    ? `Nothing matching "${debouncedSearch}".`
                    : 'Book your first appointment.'}
              </p>
            </div>
          ) : (
            appointments.map(appt => (
              <AppointmentRow
                key={appt.id}
                appt={appt}
                onCancel={handleCancelClick}
                cancelling={cancellingId === appt.id}
                onViewDetails={() => setSelectedAppt(appt)}
                onPay={handlePay}
                paying={payingId === appt.id}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>
                ← Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`e-${idx}`} className="px-1.5 text-xs text-muted-foreground self-center">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant="outline"
                      size="sm"
                      className={`h-7 w-7 text-xs p-0 ${page === p ? 'bg-primary text-primary-foreground border-primary' : ''}`}
                      onClick={() => setPage(p as number)}
                      disabled={loading}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {cancelTargetId && (
        <CancelModal
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTargetId(null)}
          loading={cancellingId === cancelTargetId}
        />
      )}

      {selectedAppt && (
        <DetailModal appt={selectedAppt} onClose={() => setSelectedAppt(null)} />
      )}
    </div>
  );
}