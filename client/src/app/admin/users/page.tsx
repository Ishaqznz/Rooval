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
import { Separator } from "@/components/reusable/ui/separator";
import {
  Ban,
  CheckCircle,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  ShieldCheck,
  User,
  KeyRound,
  Chrome,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { userServiceApi } from "@/services/userApiService";
import { useDebounce } from "@/hooks/use-debounced";

import { SortField } from "@/types/user.types";
import { SortOrder } from "@/types/user.types";
import { StatusFilter } from "@/types/user.types";
import { RoleFilter } from "@/types/user.types";
import { AuthFilter } from "@/types/user.types";

interface AdvancedFilters {
  role: RoleFilter;
  authMethod: AuthFilter;
  dateFrom: string;
  dateTo: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

const DEFAULT_ADVANCED: AdvancedFilters = {
  role: "all",
  authMethod: "all",
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

function countActiveAdvancedFilters(f: AdvancedFilters): number {
  let count = 0;
  if (f.role !== "all") count++;
  if (f.authMethod !== "all") count++;
  if (f.dateFrom) count++;
  if (f.dateTo) count++;
  if (f.sortBy !== "createdAt" || f.sortOrder !== "desc") count++;
  return count;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [advanced, setAdvanced] = useState<AdvancedFilters>(DEFAULT_ADVANCED);
  const [filterOpen, setFilterOpen] = useState(false);

  // Local draft state inside the popover
  const [draft, setDraft] = useState<AdvancedFilters>(DEFAULT_ADVANCED);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const debouncedSearch = useDebounce(searchQuery, 500);

  const [pendingAction, setPendingAction] = useState<{
    userId: string;
    currentStatus: string;
  } | null>(null);

  const [reload, setReload] = useState<number>(0);

  const activeAdvancedCount = countActiveAdvancedFilters(advanced);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    try {
      const res = await userServiceApi.find({
        input: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch.trim(),
          filter: statusFilter.toUpperCase() as StatusFilter,
          role: advanced.role.toUpperCase() as RoleFilter,
          authMethod: advanced.authMethod.toUpperCase() as AuthFilter,
          sortBy: advanced.sortBy.toUpperCase() as SortField,
          sortOrder: advanced.sortOrder.toUpperCase() as SortOrder,
        },
        fields: `
          id
          fullName
          email
          isBlocked
          isAdmin
        `,
      });

      setUsers(res?.data?.findUsers || []);

      const totalUsers = await userServiceApi.count({
        input: {
          search: debouncedSearch.trim(),
          status: statusFilter,
        },
      });
      setTotalCount(totalUsers?.data?.countUsers || 0);
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, advanced]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch, statusFilter, advanced, reload]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleToggleStatus = async () => {
    if (!pendingAction) return;
    const { userId, currentStatus } = pendingAction;
    const newStatus = currentStatus === "active" ? "blocked" : "active";

    const changeStatus = await userServiceApi.changeStatus({
      input: { userId, status: newStatus !== "active" },
    });

    if (changeStatus?.errors?.[0]?.success === false) {
      toast.error("Internal Error!");
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isBlocked: newStatus === "blocked" } : u
      )
    );

    toast.success(
      `User ${newStatus === "blocked" ? "blocked" : "unblocked"} successfully`
    );
    setPendingAction(null);
    setReload((n) => n + 1);
  };

  // ── Filter popover helpers ───────────────────────────────────────────────

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

  // ── Pagination ───────────────────────────────────────────────────────────

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
        <p className="text-muted-foreground mt-1">Manage all registered users</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced filters popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" onClick={openFilter} className="gap-2 relative">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeAdvancedCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeAdvancedCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[280px] p-0" align="end">
            {/* Popover header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Filters</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFilterOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="p-3 space-y-3">
              {/* Role */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Role
                </span>
                <div className="flex gap-1 flex-1">
                  {(["all", "admin", "user"] as RoleFilter[]).map((r) => (
                    <Button
                      key={r}
                      size="sm"
                      variant={draft.role === r ? "default" : "outline"}
                      className="flex-1 capitalize text-xs h-7 px-1"
                      onClick={() => setDraft((d) => ({ ...d, role: r }))}
                    >
                      {r === "all" ? "All" : r === "admin" ? "Admin" : "User"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Auth Method */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0 flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> Auth
                </span>
                <div className="flex gap-1 flex-1">
                  {(["all", "google", "password"] as AuthFilter[]).map((a) => (
                    <Button
                      key={a}
                      size="sm"
                      variant={draft.authMethod === a ? "default" : "outline"}
                      className="flex-1 text-xs h-7 px-1 gap-0.5"
                      onClick={() => setDraft((d) => ({ ...d, authMethod: a }))}
                    >
                      {a === "google" && <Chrome className="h-3 w-3" />}
                      {a === "password" && <User className="h-3 w-3" />}
                      {a === "all" ? "All" : a === "google" ? "Google" : "Pass"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              {/* <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0 flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Joined
                </span>
                <div className="flex gap-1 flex-1">
                  <Input
                    type="date"
                    className="h-7 text-xs px-1.5"
                    value={draft.dateFrom}
                    max={draft.dateTo || undefined}
                    onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))}
                  />
                  <Input
                    type="date"
                    className="h-7 text-xs px-1.5"
                    value={draft.dateTo}
                    min={draft.dateFrom || undefined}
                    onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))}
                  />
                </div>
              </div> */}

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0 flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Sort
                </span>
                <div className="flex gap-1 flex-1">
                  <Select
                    value={draft.sortBy}
                    onValueChange={(v) => setDraft((d) => ({ ...d, sortBy: v as SortField }))}
                  >
                    <SelectTrigger className="flex-1 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Joined</SelectItem>
                      <SelectItem value="fullName">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={draft.sortOrder}
                    onValueChange={(v) => setDraft((d) => ({ ...d, sortOrder: v as SortOrder }))}
                  >
                    <SelectTrigger className="w-[72px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Popover footer */}
            <div className="flex gap-2 px-3 py-2 border-t border-border bg-muted/30">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={resetFilters}>
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
              <Button size="sm" className="flex-1 text-xs h-7" onClick={applyFilters}>
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

          {advanced.role !== "all" && (
            <FilterChip
              label={`Role: ${advanced.role}`}
              onRemove={() => setAdvanced((f) => ({ ...f, role: "all" }))}
            />
          )}
          {advanced.authMethod !== "all" && (
            <FilterChip
              label={`Auth: ${advanced.authMethod}`}
              onRemove={() => setAdvanced((f) => ({ ...f, authMethod: "all" }))}
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
              <TableHead>Role</TableHead>
              <TableHead>Auth</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-10 text-muted-foreground"
                >
                  No users found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>

                  <TableCell className="font-medium">{user.fullName}</TableCell>

                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge variant="secondary" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <User className="h-3 w-3" />
                        User
                      </Badge>
                    )}
                  </TableCell>

                  {/* Auth method */}
                  <TableCell>
                    {user.googleId ? (
                      <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400">
                        <Chrome className="h-3 w-3" />
                        Google
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <KeyRound className="h-3 w-3" />
                        Password
                      </Badge>
                    )}
                  </TableCell>

                  {/* Joined date */}
                  <TableCell className="text-muted-foreground text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={user.isBlocked === false ? "default" : "destructive"}
                    >
                      {user.isBlocked === false ? "Active" : "Blocked"}
                    </Badge>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    {user.isBlocked === false ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setPendingAction({
                            userId: user.id,
                            currentStatus: "active",
                          })
                        }
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Block
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          setPendingAction({
                            userId: user.id,
                            currentStatus: "blocked",
                          })
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Unblock
                      </Button>
                    )}
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

      {/* Confirm dialog */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={() => setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {pendingAction?.currentStatus === "active" ? "block" : "unblock"} this
              user?{" "}
              {pendingAction?.currentStatus === "active"
                ? "They will no longer be able to access their account."
                : "They will regain access to their account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {pendingAction?.currentStatus === "active"
                ? "Block User"
                : "Unblock User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Filter chip ─────────────────────────────────────────────────────────────

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