'use client';

import { Button } from "@/components/reusable/ui/button";
import { useAuth } from "@/context/AuthContext";
import { AppointmentStatus, IListAppointment } from "@/interfaces/user/appointment.interface";
import { appointmentServiceApi } from "@/services/appointmentApiService";
import { paymentServiceApi } from "@/services/paymentApiService";
import { useCallback, useEffect, useRef, useState } from "react";
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
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<AppointmentStatusType, { label: string; cls: string }> = {
  SCHEDULED: { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  COMPLETED: { label: 'Completed', cls: 'bg-green-50 text-green-700 border border-green-100' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border border-red-100' },
  NO_SHOW:   { label: 'No-show',   cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
};

const PAYMENT_CLS: Record<PaymentStatus, string> = {
  PENDING:  'text-yellow-600',
  PAID:     'text-green-600',
  REFUNDED: 'text-blue-600',
  FAILED:   'text-red-600',
};

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All',       value: 'ALL' },
  { label: 'Upcoming',  value: 'SCHEDULED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const PAGE_LIMIT = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ─── Cancel Reason Modal ──────────────────────────────────────────────────────

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

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  appt,
  onClose,
}: {
  appt: Appointment;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Appointment Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm">
          {/* Status row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[appt.status].cls}`}>
              {STATUS_BADGE[appt.status].label}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              {appt.type === 'IN_PERSON' ? 'In-person' : 'Online'}
            </span>
            <span className={`text-xs font-medium ${PAYMENT_CLS[appt.paymentStatus]}`}>
              {appt.paymentStatus.charAt(0) + appt.paymentStatus.slice(1).toLowerCase()}
              {appt.amount != null ? ` · $${appt.amount}` : ''}
            </span>
          </div>

          {/* Session */}
          <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Session</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Start</p>
                <p className="text-foreground">{formatDateTime(appt.session?.startTime)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">End</p>
                <p className="text-foreground">{formatTime(appt.session?.endTime)}</p>
              </div>
            </div>
          </div>

          {/* IDs */}
          <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-2 text-xs text-muted-foreground">
            <p><span className="font-medium text-foreground">Appointment ID:</span> {appt.id}</p>
            <p><span className="font-medium text-foreground">Doctor ID:</span> {appt.doctorId}</p>
            {appt.paymentId && <p><span className="font-medium text-foreground">Payment ID:</span> {appt.paymentId}</p>}
          </div>

          {appt.reason && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Reason for Visit</p>
              <p className="text-foreground">{appt.reason}</p>
            </div>
          )}
          {appt.notes && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
              <p className="text-foreground">{appt.notes}</p>
            </div>
          )}
          {appt.cancelReason && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Cancellation Reason</p>
              <p className="text-destructive">{appt.cancelReason}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Appointment Row ──────────────────────────────────────────────────────────

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
  const canCancel = appt.status === 'SCHEDULED';
  const canPay    = appt.paymentStatus === 'PENDING' && appt.status !== 'CANCELLED';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {/* Left: date + type */}
      <div className="sm:w-44 shrink-0">
        <p className="text-xs font-medium text-foreground leading-tight">
          {formatDateTime(appt.session?.startTime)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {appt.type === 'IN_PERSON' ? 'In-person' : 'Online'}
          {appt.amount != null ? ` · $${appt.amount}` : ''}
        </p>
      </div>

      {/* Middle: statuses */}
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[appt.status].cls}`}>
          {STATUS_BADGE[appt.status].label}
        </span>
        <span className={`text-xs font-medium ${PAYMENT_CLS[appt.paymentStatus]}`}>
          {appt.paymentStatus.charAt(0) + appt.paymentStatus.slice(1).toLowerCase()}
        </span>
        {appt.cancelReason && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={appt.cancelReason}>
            — {appt.cancelReason}
          </span>
        )}
        {appt.reason && !appt.cancelReason && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={appt.reason}>
            {appt.reason}
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={onViewDetails}>
          Details
        </Button>

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserAppointments() {
  const { user } = useAuth();

  const [appointments, setAppointments]   = useState<Appointment[]>([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState<FilterTab>('ALL');
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]                   = useState(1);
  const [cancelTargetId, setCancelTargetId]   = useState<string | null>(null);
  const [cancellingId, setCancellingId]       = useState<string | null>(null);
  const [payingId, setPayingId]               = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt]       = useState<Appointment | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  // Reset page when tab changes
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

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, user]);

  // Cancel flow
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
            a.id === cancelTargetId ? { ...a, status: 'CANCELLED', cancelReason: reason } : a
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

  // Payment flow (mirrors doctor/[id])
  const handlePay = async (appointmentId: string) => {
    setPayingId(appointmentId);
    try {
      const response = await paymentServiceApi.createCheckoutSession({
        input: { appointmentId },
        fields: `url`,
      });
      if (response?.errors) {
        toast.error('Failed to create a payment session');
        return;
      }
      const checkoutUrl = response?.data?.createPaymentSession?.url;
      if (!checkoutUrl) {
        toast.error('Invalid checkout session');
        return;
      }
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

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">My Appointments</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total > 0 ? `${total} appointment${total !== 1 ? 's' : ''} found` : 'No appointments yet'}
          </p>
        </div>

        {/* Search + Tabs */}
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

        {/* Table card */}
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[11rem_1fr_auto] gap-3 px-4 py-2 bg-muted/50 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date & Time</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</p>
          </div>

          {loading ? (
            <div className="space-y-0 divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-4">
                  <div className="h-3 w-36 bg-muted animate-pulse rounded" />
                  <div className="h-3 flex-1 bg-muted animate-pulse rounded" />
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
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => p - 1)}
              >
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
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-muted-foreground self-center">…</span>
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
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelTargetId && (
        <CancelModal
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTargetId(null)}
          loading={cancellingId === cancelTargetId}
        />
      )}

      {/* Detail Modal */}
      {selectedAppt && (
        <DetailModal appt={selectedAppt} onClose={() => setSelectedAppt(null)} />
      )}
    </div>
  );
}