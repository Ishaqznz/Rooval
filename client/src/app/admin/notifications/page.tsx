"use client";

import { useState } from "react";
import {
  Bell,
  Send,
  Users,
  Stethoscope,
  UsersRound,
  Megaphone,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationApiService } from "@/services/notificationApiService";
import { RealAudience } from "@/interfaces/notifications/notification.interfaces";
import { toast } from "sonner";
import { NotificationType } from "@/interfaces/notifications/notification.interfaces";

type Audience = "all" | "users" | "doctors";
type NotifType = "announcement" | "system" | "alert" | "reminder";

interface Notification {
  id: number;
  title: string;
  message: string;
  audience: Audience;
  type: NotifType;
  sentAt: string;
  readCount: number;
  totalCount: number;
}

interface IRealNotification {
  content: string
  type: NotificationType
  audience: RealAudience
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Platform Maintenance Scheduled",
    message: "We will be performing scheduled maintenance on June 1st from 2–4 AM IST. All services will be temporarily unavailable.",
    audience: "all",
    type: "announcement",
    sentAt: "2025-05-20T10:30:00",
    readCount: 1240,
    totalCount: 1560,
  },
  {
    id: 2,
    title: "New Feature: AI Symptom Checker",
    message: "We have launched an AI-powered symptom checker for all users. Try it from your dashboard today!",
    audience: "users",
    type: "announcement",
    sentAt: "2025-05-18T14:00:00",
    readCount: 870,
    totalCount: 1100,
  },
  {
    id: 3,
    title: "Updated Payout Schedule for May",
    message: "Doctor payouts for May will be processed on May 30th. Please ensure your bank details are up to date.",
    audience: "doctors",
    type: "reminder",
    sentAt: "2025-05-15T09:00:00",
    readCount: 210,
    totalCount: 460,
  },
  {
    id: 4,
    title: "Community Guidelines Update",
    message: "We have revised our community guidelines. Please review them in the Communities section.",
    audience: "all",
    type: "system",
    sentAt: "2025-05-10T11:15:00",
    readCount: 980,
    totalCount: 1560,
  },
  {
    id: 5,
    title: "Action Required: Profile Verification",
    message: "Several doctor profiles are pending document verification. Please complete verification within 7 days.",
    audience: "doctors",
    type: "alert",
    sentAt: "2025-05-08T08:00:00",
    readCount: 380,
    totalCount: 460,
  },
];


const AUDIENCE_OPTIONS: { value: Audience; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "all", label: "Everyone", icon: UsersRound, desc: "All users & doctors" },
  { value: "users", label: "Users Only", icon: Users, desc: "general users" },
  { value: "doctors", label: "Doctors Only", icon: Stethoscope, desc: "Verified doctors" },
];

const TYPE_OPTIONS: { value: NotifType; label: string }[] = [
  { value: "announcement", label: "Announcement" },
  { value: "system", label: "System" },
  { value: "alert", label: "Alert" },
  { value: "reminder", label: "Reminder" },
];

const audienceBadge: Record<Audience, string> = {
  all: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  users: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  doctors: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const typeBadge: Record<NotifType, string> = {
  announcement: "bg-primary/10 text-primary",
  system: "bg-muted text-muted-foreground",
  alert: "bg-red-500/10 text-red-500",
  reminder: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filterAudience, setFilterAudience] = useState<Audience | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "all" as Audience,
    type: "announcement" as NotifType,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!form.message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    const newNotif: IRealNotification = {
      content: form.message,
      type: form.type.toUpperCase() as NotificationType,
      audience: form.audience == 'all' ? RealAudience.BOTH : form.audience == 'users' ? RealAudience.USER : RealAudience.DOCTOR
    };

    const response = await notificationApiService.notifyMany({ input: newNotif });
    if (response?.errors) {
      toast.error(response?.errors?.message?.[0] || "Something went wrong!")
      return;
    }

    toast.success("Successful!")

    setForm({ title: "", message: "", audience: "all", type: "announcement" });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered =
    filterAudience === "all"
      ? notifications
      : notifications.filter((n) => n.audience === filterAudience || n.audience === "all");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send announcements and manage platform-wide notifications
          </p>
        </div>
        {/* Stats pill */}
        {/* <div className="hidden sm:flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-3 shadow-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{notifications.length}</p>
            <p className="text-xs text-muted-foreground">Total Sent</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-primary">
              {notifications.filter((n) => n.audience === "all").length}
            </p>
            <p className="text-xs text-muted-foreground">Broadcast</p>
          </div>
        </div> */}
      </div>

      {/* ── Compose Card ── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border bg-primary/5">
          <Megaphone className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Send New Announcement</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Audience Selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
              Target Audience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AUDIENCE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = form.audience === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setForm((f) => ({ ...f, audience: opt.value }))}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40 hover:bg-accent text-muted-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        active ? "bg-primary/20" : "bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-medium", active ? "text-primary" : "text-foreground")}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type + Title row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as NotifType }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="Write your announcement message here..."
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
            />
          </div>

          {/* Send Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSend}
              disabled={sending || !form.message.trim()}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                sent
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : sent ? (
                <>
                  <CheckCheck className="h-4 w-4" />
                  Sent!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}