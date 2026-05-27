"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/reusable/ui/table";
import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/reusable/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/reusable/ui/pagination";
import {
  Search,
  Video,
  Building2,
  Clock,
  CalendarDays,
  X,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/reusable/ui/popover";
import { toast } from "sonner";
import { appointmentServiceApi } from "@/services/appointmentApiService";
import { useDebounce } from "@/hooks/use-debounced";

// ─── Types ────────────────────────────────────────────────────────────────────

type ListAppointmentType = "ONLINE" | "IN_PERSON" | "all";
type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "all";

interface AdvancedFilters {
  appointmentType: ListAppointmentType;
}

const DEFAULT_ADVANCED: AdvancedFilters = {
  appointmentType: "all",
};

function countActiveAdvancedFilters(f: AdvancedFilters): number {
  let count = 0;
  if (f.appointmentType !== "all") count++;
  return count;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: "bg-muted text-emerald-600 dark:text-emerald-400",
    PENDING:   "bg-muted text-amber-600 dark:text-amber-400",
    COMPLETED: "bg-muted text-foreground",
    CANCELLED: "bg-muted text-muted-foreground line-through",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        map[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID:     "bg-muted text-emerald-600 dark:text-emerald-400",
    PENDING:  "bg-muted text-amber-600 dark:text-amber-400",
    REFUNDED: "bg-muted text-muted-foreground",
    FAILED:   "bg-muted text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        map[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-destructive transition-colors ml-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>("all");
  const [advanced, setAdvanced] = useState<AdvancedFilters>(DEFAULT_ADVANCED);
  const [draft, setDraft] = useState<AdvancedFilters>(DEFAULT_ADVANCED);
  const [filterOpen, setFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const debouncedSearch = useDebounce(searchQuery, 500);

  const activeAdvancedCount = countActiveAdvancedFilters(advanced);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchAppointments = async () => {
    try {
      const response = await appointmentServiceApi.listAll({
        input: {
          page: currentPage,
          limit: itemsPerPage,
          ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
          ...(statusFilter !== "all" && { appointmentStatus: statusFilter }),
          ...(advanced.appointmentType !== "all" && {
            appointmentType: advanced.appointmentType,
          }),
        },
        fields: `
          appointments {
            id
            patientId
            doctorId
            session {
              startTime
              endTime
            }
            status
            type
            paymentStatus
            amount
            slotDuration
            createdAt
          }
          appointmentsCount
        `,
      });

      const data = response?.data?.listAllAppointments;
      setAppointments(data?.appointments ?? []);
      setTotalCount(data?.appointmentsCount ?? 0);
    } catch {
      toast.error("Failed to load appointments");
    }
  };

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, advanced]);

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, debouncedSearch, statusFilter, advanced]);

  // ── Filter popover helpers ────────────────────────────────────────────────

  const openFilter = () => {
    setDraft(advanced);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setAdvanced(draft);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setDraft(DEFAULT_ADVANCED);
    setAdvanced(DEFAULT_ADVANCED);
    setFilterOpen(false);
  };

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Appointments
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all appointments
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient, doctor or ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as AppointmentStatus)}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced filters popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              onClick={openFilter}
              className="gap-2 relative"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeAdvancedCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeAdvancedCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[260px] p-0" align="end">
            {/* Popover header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                Filters
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setFilterOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="p-3 space-y-3">
              {/* Appointment Type */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12 shrink-0">
                  Type
                </span>
                <div className="flex gap-1 flex-1">
                  {(["all", "ONLINE", "IN_PERSON"] as ListAppointmentType[]).map(
                    (t) => (
                      <Button
                        key={t}
                        size="sm"
                        variant={
                          draft.appointmentType === t ? "default" : "outline"
                        }
                        className="flex-1 text-xs h-7 px-1 gap-1"
                        onClick={() =>
                          setDraft((d) => ({ ...d, appointmentType: t }))
                        }
                      >
                        {t === "ONLINE" && <Video className="h-3 w-3" />}
                        {t === "IN_PERSON" && <Building2 className="h-3 w-3" />}
                        {t === "all" ? "All" : t === "ONLINE" ? "Online" : "In-person"}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Popover footer */}
            <div className="flex gap-2 px-3 py-2 border-t border-border bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs h-7"
                onClick={resetFilters}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs h-7"
                onClick={applyFilters}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter chips */}
      {activeAdvancedCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {advanced.appointmentType !== "all" && (
            <FilterChip
              label={`Type: ${advanced.appointmentType === "IN_PERSON" ? "In-person" : "Online"}`}
              onRemove={() =>
                setAdvanced((f) => ({ ...f, appointmentType: "all" }))
              }
            />
          )}

          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Appointment ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Booked On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  No appointments found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appt: any) => {
                const start = formatDateTime(appt.session.startTime);
                const booked = formatDateTime(appt.createdAt);
                return (
                  <TableRow key={appt.id}>
                    {/* ID */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {appt.id.slice(-8).toUpperCase()}
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {appt.type === "ONLINE" ? (
                          <><Video className="h-3.5 w-3.5" /> Online</>
                        ) : (
                          <><Building2 className="h-3.5 w-3.5" /> In-person</>
                        )}
                      </span>
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                          {start.date}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {start.time}
                        </span>
                      </div>
                    </TableCell>

                    {/* Duration */}
                    <TableCell className="text-sm text-muted-foreground">
                      {appt.slotDuration} min
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={appt.status} />
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <PaymentBadge status={appt.paymentStatus} />
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="font-medium text-sm">
                      ${appt.amount}
                    </TableCell>

                    {/* Booked On */}
                    <TableCell className="text-sm text-muted-foreground">
                      {booked.date}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}