"use client";

import { toast } from "sonner";
import { appointmentServiceApi } from "@/services/appointmentApiService";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/reusable/ui/alert-dialog";
import { Textarea } from "@/components/reusable/ui/textarea";
import NotificationBell from "@/components/user/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { connectSocket, disconnectSocket } from "@/sockets/socket";

enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

enum AppointmentType {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

interface AppointmentSession {
  startTime: string;
  endTime: string;
}

interface AppointmentUser {
  id: string;
  fullName: string;
  profile: {
    personal: {
      profilePhoto: string | null;
    };
  } | null;
}

interface Appointment {
  id: string;
  patientId: string;
  session: AppointmentSession;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string | null;
  notes: string | null;
  paymentStatus: PaymentStatus;
  amount: number | null;
  slotDuration: number;
  bufferTime: number | null;
  reminderSent: boolean;
  isCheckedIn: boolean;
  createdAt: string;
  updatedAt: string;
  user: AppointmentUser | null;
  cancelledBy: string;
  cancelReason: string;
}

/* ── Helpers ────────────────────────────────────────────────── */

const AVATAR_COLORS = [
  "bg-sky-500", "bg-amber-500", "bg-purple-500",
  "bg-emerald-500", "bg-rose-500", "bg-indigo-500",
  "bg-teal-500", "bg-orange-500",
];

function getAvatarColor(id?: string | null): string {
  if (!id) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateShort(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const PAGE_SIZE = 5;

const statusConfig: Record<AppointmentStatus, { label: string; className: string; dot: string; bg: string }> = {
  [AppointmentStatus.SCHEDULED]: {
    label: "Scheduled",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
    bg: "bg-blue-500",
  },
  [AppointmentStatus.COMPLETED]: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
    bg: "bg-emerald-500",
  },
  [AppointmentStatus.CANCELLED]: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
    dot: "bg-rose-500",
    bg: "bg-rose-500",
  },
  [AppointmentStatus.NO_SHOW]: {
    label: "No Show",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
    bg: "bg-gray-400",
  },
};

const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  [PaymentStatus.PAID]:    { label: "Paid",    className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  [PaymentStatus.PENDING]: { label: "Pending", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  [PaymentStatus.FAILED]:  { label: "Failed",  className: "bg-rose-50 text-rose-700 border border-rose-200" },
};

/* ── Icons ──────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="6.5" cy="6.5" r="4.5" /><path d="M10.5 10.5L14 14" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 3L5 8l5 5" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 3l5 5-5 5" />
  </svg>
);
const VideoIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="1" y="4" width="10" height="8" rx="1.5" />
    <path d="M11 6.5l4-2.5v8l-4-2.5V6.5z" />
  </svg>
);
const PinIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" />
    <circle cx="8" cy="5" r="1.5" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="8" cy="8" r="6.5" /><path d="M8 5v3.5l2.5 1.5" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="8" cy="8" r="6.5" /><path d="M5 8l2.5 2.5L11 6" />
  </svg>
);
const XCircleIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="8" cy="8" r="6.5" /><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" />
  </svg>
);
const BellIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M8 2a4 4 0 014 4v3l1 2H3l1-2V6a4 4 0 014-4z" /><path d="M6 13a2 2 0 004 0" />
  </svg>
);
const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

/* ── Avatar ─────────────────────────────────────────────────── */
function Avatar({ user, size = "md" }: { user: AppointmentUser | null | undefined; size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "lg" ? "w-14 h-14 text-base rounded-2xl" :
    size === "sm" ? "w-8 h-8 text-[10px] rounded-full" :
                    "w-9 h-9 text-[11px] rounded-full";

  // Safe fallback when user is null/undefined
  if (!user) {
    return (
      <div className={`${sizeClass} bg-gray-300 flex items-center justify-center font-semibold text-white flex-shrink-0`}>
        ?
      </div>
    );
  }

  const photo = user.profile?.personal?.profilePhoto ?? null;
  const color = getAvatarColor(user.id);
  const initials = getInitials(user.fullName);

  if (photo) {
    return (
      <img
        src={photo}
        alt={user.fullName ?? "Patient"}
        className={`${sizeClass} object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${sizeClass} ${color} flex items-center justify-center font-semibold text-white flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<AppointmentType | "">("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const { user } = useAuth();

  useEffect(() => {
    if (user) connectSocket();
    else disconnectSocket();
  }, [user]);

  /* ── Cancel ── */
  const cancelAppointment = async () => {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    try {
      const response = await appointmentServiceApi.cancelByDoctor({
        input: { appointmentId: appointmentToCancel, reason: cancelReason },
      });

      if (response?.data?.cancelAppointmentByDoctor) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentToCancel
              ? { ...a, status: AppointmentStatus.CANCELLED, cancelReason, cancelledBy: "DOCTOR" }
              : a
          )
        );
        setSelectedAppointment((prev) =>
          prev?.id === appointmentToCancel
            ? { ...prev, status: AppointmentStatus.CANCELLED, cancelReason, cancelledBy: "DOCTOR" }
            : prev
        );
        toast.success("Appointment cancelled successfully");
        setAppointmentToCancel(null);
        setCancelReason("");
        return;
      }
      toast.error("Failed to cancel appointment");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsCancelling(false);
    }
  };

  /* ── Debounce search ── */
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  useEffect(() => { setPage(1); }, [statusFilter, typeFilter]);

  /* ── Fetch ── */
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const input: Record<string, unknown> = { page, limit: PAGE_SIZE };
      if (debouncedSearch) input.search = debouncedSearch;
      if (statusFilter)    input.appointmentStatus = statusFilter;
      if (typeFilter)      input.appointmentType   = typeFilter;

      const response = await appointmentServiceApi.list({
        input: input as unknown as Parameters<typeof appointmentServiceApi.list>[0]["input"],
        fields: `
          appointments {
            id
            patientId
            session { startTime endTime }
            status
            type
            reason
            notes
            paymentStatus
            amount
            slotDuration
            bufferTime
            reminderSent
            isCheckedIn
            createdAt
            updatedAt
            cancelledBy
            cancelReason
            user {
              id
              fullName
              profile { personal { profilePhoto } }
            }
          }
          appointmentsCount
        `,
      });

      if (response?.errors) {
        toast.error("Error while loading the appointments!");
        return;
      }

      const data = response?.data?.listAppointments;
      if (data) {
        setAppointments(data.appointments ?? []);
        setTotalCount(data.appointmentsCount ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  /* ── List View ── */
  const ListView = () => (
    <>
      <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="font-semibold text-base leading-tight">Appointments</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {totalCount > 0
              ? `${totalCount} total appointment${totalCount !== 1 ? "s" : ""}`
              : "Manage and review all patient appointments"}
          </p>
        </div>
        {user?.id && <NotificationBell userId={user.id} variant="user" />}
      </header>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border bg-card space-y-3 flex-shrink-0">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">Status:</span>
            <div className="flex gap-1 flex-wrap">
              {([["", "All"], ...Object.values(AppointmentStatus).map((s) => [s, statusConfig[s].label])] as [string, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val as AppointmentStatus | "")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors
                    ${statusFilter === val
                      ? "bg-primary text-white"
                      : "bg-background text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">Type:</span>
            <div className="flex gap-1">
              {([["", "All"], [AppointmentType.ONLINE, "Online"], [AppointmentType.OFFLINE, "In-person"]] as [string, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTypeFilter(val as AppointmentType | "")}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors
                    ${typeFilter === val
                      ? "bg-primary text-white"
                      : "bg-background text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground text-[13px]">
            <SpinnerIcon /> Loading appointments…
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-[13px]">
            <p className="font-medium">No appointments found</p>
            <p className="text-[11px] mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-card/60 sticky top-0">
                {["Patient", "Date & Time", "Type", "Duration", "Status", "Payment", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => {
                // Safe lookups — fall back to SCHEDULED / PENDING defaults
                const sc = statusConfig[a.status]         ?? statusConfig[AppointmentStatus.SCHEDULED];
                const pc = paymentConfig[a.paymentStatus] ?? paymentConfig[PaymentStatus.PENDING];

                return (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAppointment(a)}
                    className="border-b border-border hover:bg-purple-50/50 transition-colors cursor-pointer group"
                  >
                    {/* Patient */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar user={a.user} size="sm" />
                        <div>
                          <p className="font-medium text-foreground">{a.user?.fullName ?? "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {a.patientId ? a.patientId.slice(-8) : "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{formatTime(a.session?.startTime)}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateShort(a.session?.startTime)}</p>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border border-border bg-card">
                        {a.type === AppointmentType.ONLINE ? <VideoIcon /> : <PinIcon />}
                        {a.type === AppointmentType.ONLINE ? "Online" : "In-person"}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <ClockIcon />
                        {a.slotDuration ?? "—"} min
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${sc.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="px-5 py-3.5">
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${pc.className}`}>
                          {pc.label}
                        </span>
                        {a.amount != null && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">${a.amount.toLocaleString("en-IN")}</p>
                        )}
                      </div>
                    </td>

                    {/* Arrow */}
                    <td className="px-4 py-3.5">
                      <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRightIcon />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="h-12 border-t border-border bg-card px-6 flex items-center justify-between flex-shrink-0">
          <p className="text-[11px] text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-purple-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeftIcon />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="w-7 text-center text-[11px] text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-7 h-7 rounded-md text-[11px] font-medium transition-colors
                      ${page === p ? "bg-primary text-white" : "text-muted-foreground hover:bg-purple-50 hover:text-foreground"}`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-purple-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );

  /* ── Detail View ── */
  const DetailView = ({ a }: { a: Appointment }) => {
    const sc = statusConfig[a.status]         ?? statusConfig[AppointmentStatus.SCHEDULED];
    const pc = paymentConfig[a.paymentStatus] ?? paymentConfig[PaymentStatus.PENDING];
    const isOnline    = a.type === AppointmentType.ONLINE;
    const isScheduled = a.status === AppointmentStatus.SCHEDULED;

    return (
      <>
        {/* Topbar */}
        <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeftIcon />
              <span>Appointments</span>
            </button>
            <span className="text-border">|</span>
            <p className="font-semibold text-sm">{a.user?.fullName ?? "Unknown Patient"}</p>
          </div>
          <button className="relative w-[34px] h-[34px] border border-border rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <BellIcon />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary border-2 border-white" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Patient card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar user={a.user} size="lg" />
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{a.user?.fullName ?? "Unknown Patient"}</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      ID: {a.patientId ? a.patientId.slice(-8) : "—"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${sc.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-border bg-background">
                        {isOnline ? <VideoIcon /> : <PinIcon />}
                        {isOnline ? "Online" : "In-person"}
                      </span>
                      {a.isCheckedIn && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircleIcon /> Checked In
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isScheduled && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="text-[11px] px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-card transition-colors">
                      Reschedule
                    </button>
                    <button
                      className="text-[11px] px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                      onClick={() => setAppointmentToCancel(a.id)}
                    >
                      Cancel
                    </button>
                    <button className="text-[11px] px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-secondary transition-colors">
                      {isOnline ? "Start Call" : "Mark Arrived"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Session details */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-3">Session Details</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Date</p>
                  <p className="text-[13px] font-semibold">{formatDate(a.session?.startTime)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Time</p>
                  <p className="text-[13px] font-semibold">
                    {formatTime(a.session?.startTime)} – {formatTime(a.session?.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Duration</p>
                  <p className="text-[13px] font-semibold">
                    {a.slotDuration ?? "—"} min
                    {a.bufferTime ? (
                      <span className="text-muted-foreground font-normal text-[11px]"> + {a.bufferTime}m buffer</span>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason & Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Reason for Visit</p>
                <p className="text-[12px] text-foreground leading-relaxed">
                  {a.reason ?? <span className="text-muted-foreground italic">Not provided</span>}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Doctor&apos;s Notes</p>
                <p className="text-[12px] text-foreground leading-relaxed">
                  {a.notes ?? <span className="text-muted-foreground italic">No notes added</span>}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-3">Payment Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Amount</p>
                  <p className="text-[15px] font-semibold">
                    {a.amount != null ? `$${a.amount.toLocaleString("en-IN")}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${pc.className}`}>
                    {pc.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation */}
            {a.status === AppointmentStatus.CANCELLED && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wide text-rose-600 font-medium mb-2">Cancellation Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-rose-400 mb-1">Cancelled By</p>
                    <p className="text-[12px] text-rose-700 capitalize">{a.cancelledBy ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-rose-400 mb-1">Reason</p>
                    <p className="text-[12px] text-rose-700">{a.cancelReason ?? "—"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional info */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-3">Additional Info</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">Reminder Sent</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1
                    ${a.reminderSent ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {a.reminderSent ? <><CheckCircleIcon /> Yes</> : <><XCircleIcon /> No</>}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">Checked In</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1
                    ${a.isCheckedIn ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {a.isCheckedIn ? <><CheckCircleIcon /> Yes</> : <><XCircleIcon /> No</>}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">Created At</p>
                  <p className="text-[11px] text-foreground">{formatDate(a.createdAt)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">Last Updated</p>
                  <p className="text-[11px] text-foreground">{formatDate(a.updatedAt)}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </>
    );
  };

  /* ── Render ── */
  return (
    <>
      <AlertDialog
        open={!!appointmentToCancel}
        onOpenChange={(open) => {
          if (!open) {
            setAppointmentToCancel(null);
            setCancelReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling || !cancelReason.trim()}
              onClick={(e) => { e.preventDefault(); cancelAppointment(); }}
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-full overflow-hidden">
        {selectedAppointment ? <DetailView a={selectedAppointment} /> : <ListView />}
      </div>
    </>
  );
}