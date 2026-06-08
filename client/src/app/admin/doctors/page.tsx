'use client';

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
import { Badge } from "@/components/reusable/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/reusable/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/reusable/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/reusable/ui/popover";
import { Label } from "@/components/reusable/ui/label";
import { Textarea } from "@/components/reusable/ui/textarea";
import {
  Eye,
  CheckCircle,
  XCircle,
  Search,
  FileText,
  ArrowLeft,
  SlidersHorizontal,
  X,
  Stethoscope,
  Video,
  Building2,
  ArrowUpDown,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { doctorServiceApi } from "@/services/doctorApiService";
import { useDebounce } from "@/hooks/use-debounced";

import { StatusFilter } from "@/types/doctor.types";
import { ConsultationFilter } from "@/types/doctor.types";
import { SortField } from "@/types/doctor.types";
import { SortOrder } from "@/types/doctor.types";

interface AdvancedFilters {
  specialization: string;
  consultationMode: ConsultationFilter;
  minExperience: number;
  maxExperience: number;
  dateFrom: string;
  dateTo: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

const DEFAULT_ADVANCED: AdvancedFilters = {
  specialization: "",
  consultationMode: "all",
  minExperience: 0,
  maxExperience: 30,
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const SPECIALIZATIONS = [
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic Surgeon",
  "Psychiatrist",
  "General Physician",
  "Neurologist",
  "ENT Specialist",
  "Gynecologist",
  "Oncologist",
];

function countActiveFilters(f: AdvancedFilters): number {
  let n = 0;
  if (f.specialization) n++;
  if (f.consultationMode !== "all") n++;
  if (f.minExperience > 0 || f.maxExperience < 30) n++;
  if (f.dateFrom) n++;
  if (f.dateTo) n++;
  if (f.sortBy !== "createdAt" || f.sortOrder !== "desc") n++;
  return n;
}

function statusVariant(status: string) {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [advanced, setAdvanced] = useState<AdvancedFilters>(DEFAULT_ADVANCED);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<AdvancedFilters>(DEFAULT_ADVANCED);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    doctorId: string;
    action: "approved" | "rejected";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reload, setReload] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const activeCount = countActiveFilters(advanced);

  const fetchDoctors = async () => {
    try {
      const res = await doctorServiceApi.find({
        input: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch.trim(),
          filter: statusFilter.toUpperCase() as StatusFilter,
          specialization: ((advanced.specialization) as string).toUpperCase(),
          consultationMode:
            ((advanced.consultationMode !== "all"
              ? advanced.consultationMode.toUpperCase()
              : undefined) as ConsultationFilter),
          minExperience: (advanced.minExperience > 0 ? advanced.minExperience : undefined) as number,
          maxExperience: (advanced.maxExperience < 30 ? advanced.maxExperience : undefined) as number,
          sortBy: (advanced.sortBy.toUpperCase()) as SortField,
          sortOrder: (advanced.sortOrder.toUpperCase()) as SortOrder,
        },
        fields: `
          id
          fullName
          email
          status
          profilePhoto
          certificates
          profile {
            personal {
              specializations
              registrationNumber
              experience
              phone
            }
            consultationSettings {
              consultationModes
            }
          }
        `,
      });

      setDoctors(res?.data?.findDoctors || []);

      const total = await doctorServiceApi.count({
        input: {
          search: debouncedSearch.trim(),
          status: statusFilter,
        },
      });
      setTotalCount(total?.data?.countDoctors || 0);
    } catch {
      toast.error("Failed to load doctors");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, advanced]);

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, debouncedSearch, statusFilter, advanced, reload]);

  const handleViewDetails = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowCertificate(false);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!pendingAction) return;
    const { doctorId, action } = pendingAction;

    if (action === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    const reject = await doctorServiceApi.addRejectionReason({
      input: { doctorId, rejectionReason },
    });
    if (reject?.errors?.[0]?.success === false) {
      toast.error("Something went wrong!");
      return;
    }

    const changeStatus = await doctorServiceApi.changeStatus({
      input: { userId: doctorId, status: action },
    });
    if (changeStatus?.errors?.[0]?.success === false) {
      toast.error("Internal Error!");
      return;
    }

    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, status: action } : d))
    );
    toast.success(`Doctor application ${action}`);
    setPendingAction(null);
    setRejectionReason("");
    setIsDialogOpen(false);
    setReload((n) => n + 1);
  };

  // ── Filter popover ────────────────────────────────────────────────────────

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

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Doctors Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage doctor applications
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced filters */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              onClick={openFilter}
              className="gap-2 relative"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[280px] p-0" align="end">
            {/* Header */}
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
              {/* Specialization */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0 flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" /> Spec.
                </span>
                <Select
                  value={draft.specialization || "__all__"}
                  onValueChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      specialization: v === "__all__" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger className="flex-1 h-7 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[180px] overflow-y-auto text-xs w-[160px]">
                    <SelectItem value="__all__" className="text-xs">All</SelectItem>
                    {SPECIALIZATIONS.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Consultation Mode */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0 flex items-center gap-1">
                  <Video className="h-3 w-3" /> Mode
                </span>
                <div className="flex gap-1 flex-1">
                  {(
                    [
                      { value: "all", label: "All", icon: null },
                      { value: "ONLINE", label: "Online", icon: <Video className="h-3 w-3" /> },
                      { value: "IN_CLINIC", label: "Clinic", icon: <Building2 className="h-3 w-3" /> },
                    ] as const
                  ).map(({ value, label, icon }) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={
                        draft.consultationMode === value ? "default" : "outline"
                      }
                      className="flex-1 text-xs h-7 px-1 gap-0.5"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          consultationMode: value as ConsultationFilter,
                        }))
                      }
                    >
                      {icon}
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Experience Range */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0 flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Exp.
                </span>
                <div className="flex gap-1 flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={draft.maxExperience}
                    value={draft.minExperience}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        minExperience: Number(e.target.value) || 0,
                      }))
                    }
                    className="h-7 text-xs px-2 w-full"
                    placeholder="Min"
                  />
                  <Input
                    type="number"
                    min={draft.minExperience}
                    max={30}
                    value={draft.maxExperience}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        maxExperience: Number(e.target.value) || 30,
                      }))
                    }
                    className="h-7 text-xs px-2 w-full"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0 flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Sort
                </span>
                <div className="flex gap-1 flex-1">
                  <Select
                    value={draft.sortBy}
                    onValueChange={(v) =>
                      setDraft((d) => ({ ...d, sortBy: v as SortField }))
                    }
                  >
                    <SelectTrigger className="flex-1 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Joined</SelectItem>
                      <SelectItem value="fullName">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="experience">Experience</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={draft.sortOrder}
                    onValueChange={(v) =>
                      setDraft((d) => ({ ...d, sortOrder: v as SortOrder }))
                    }
                  >
                    <SelectTrigger className="w-[72px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Asc</SelectItem>
                      <SelectItem value="desc">Desc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Footer */}
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
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {advanced.specialization && (
            <FilterChip
              label={`Spec: ${advanced.specialization}`}
              onRemove={() =>
                setAdvanced((f) => ({ ...f, specialization: "" }))
              }
            />
          )}
          {advanced.consultationMode !== "all" && (
            <FilterChip
              label={`Mode: ${advanced.consultationMode}`}
              onRemove={() =>
                setAdvanced((f) => ({ ...f, consultationMode: "all" }))
              }
            />
          )}
          {(advanced.minExperience > 0 || advanced.maxExperience < 30) && (
            <FilterChip
              label={`Exp: ${advanced.minExperience}–${advanced.maxExperience} yrs`}
              onRemove={() =>
                setAdvanced((f) => ({
                  ...f,
                  minExperience: 0,
                  maxExperience: 30,
                }))
              }
            />
          )}
          {advanced.dateFrom && (
            <FilterChip
              label={`From: ${advanced.dateFrom}`}
              onRemove={() => setAdvanced((f) => ({ ...f, dateFrom: "" }))}
            />
          )}
          {advanced.dateTo && (
            <FilterChip
              label={`To: ${advanced.dateTo}`}
              onRemove={() => setAdvanced((f) => ({ ...f, dateTo: "" }))}
            />
          )}
          {(advanced.sortBy !== "createdAt" || advanced.sortOrder !== "desc") && (
            <FilterChip
              label={`Sort: ${advanced.sortBy} (${advanced.sortOrder})`}
              onRemove={() =>
                setAdvanced((f) => ({
                  ...f,
                  sortBy: "createdAt",
                  sortOrder: "desc",
                }))
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
              <TableHead>Profile</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No doctors found
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage
                        src={doctor.profilePhoto}
                        alt={doctor.fullName}
                      />
                      <AvatarFallback>
                        {doctor.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>

                  <TableCell className="font-medium">
                    {doctor.fullName}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {doctor.email}
                  </TableCell>

                  {/* Specializations */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(
                        doctor.profile?.personal?.specializations || []
                      )
                        .slice(0, 2)
                        .map((s: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>

                  {/* Experience */}
                  <TableCell className="text-sm text-muted-foreground">
                    {doctor.profile?.personal?.experience
                      ? `${doctor.profile.personal.experience} yrs`
                      : "—"}
                  </TableCell>

                  {/* Consultation modes */}
                  <TableCell>
                    <div className="flex gap-1">
                      {(
                        doctor.profile?.consultationSettings
                          ?.consultationModes || []
                      ).map((m: string) =>
                        m === "ONLINE" ? (
                          <Badge
                            key={m}
                            variant="outline"
                            className="gap-1 text-xs text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400"
                          >
                            <Video className="h-3 w-3" />
                            Online
                          </Badge>
                        ) : (
                          <Badge
                            key={m}
                            variant="outline"
                            className="gap-1 text-xs"
                          >
                            <Building2 className="h-3 w-3" />
                            Clinic
                          </Badge>
                        )
                      )}
                    </div>
                  </TableCell>

                  {/* Joined date */}
                  <TableCell className="text-sm text-muted-foreground">
                    {doctor.createdAt
                      ? new Date(doctor.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={statusVariant(doctor.status)}>
                      {doctor.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(doctor)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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

      {/* Detail dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setShowCertificate(false);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {showCertificate
                ? "Doctor Certificate"
                : "Doctor Application Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedDoctor && !showCertificate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-foreground">{selectedDoctor.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-foreground">{selectedDoctor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Specializations
                  </label>
                  <div className="text-foreground">
                    {(
                      selectedDoctor.profile?.personal?.specializations || []
                    ).map((s: string, i: number) => (
                      <p key={i}>{s}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Experience
                  </label>
                  <p className="text-foreground">
                    {selectedDoctor.profile?.personal?.experience}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </label>
                  <p className="text-foreground">
                    {selectedDoctor.profile?.personal?.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    License Number
                  </label>
                  <p className="text-foreground">
                    {selectedDoctor.profile?.personal?.registrationNumber}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowCertificate(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() =>
                    setPendingAction({
                      doctorId: selectedDoctor.id,
                      action: "rejected",
                    })
                  }
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={() =>
                    setPendingAction({
                      doctorId: selectedDoctor.id,
                      action: "approved",
                    })
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}

          {selectedDoctor && showCertificate && (
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4 bg-muted/50">
                <img
                  src={selectedDoctor.certificates[0]}
                  alt="Certificate"
                  className="w-full h-auto rounded"
                />
              </div>
              <Button variant="outline" onClick={() => setShowCertificate(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm dialog */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={() => {
          setPendingAction(null);
          setRejectionReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {pendingAction?.action === "approved" ? "approve" : "reject"} this
              doctor's application?{" "}
              {pendingAction?.action === "approved"
                ? "They will be able to start accepting appointments."
                : "The doctor will be notified of the rejection."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {pendingAction?.action === "rejected" && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a reason for rejecting this application…"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionReason("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              {pendingAction?.action === "approved" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

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