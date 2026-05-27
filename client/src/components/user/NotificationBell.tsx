'use client';

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { getSocket } from "@/sockets/socket";
import { Button } from "@/components/reusable/ui/button";
import { cn } from "@/lib/utils";
import { notificationApiService } from "@/services/notificationApiService";
import { toast } from "sonner";

export enum NotificationType {
  MESSAGE = 'message',
  APPOINTMENT = 'appointment',
  PAYMENT = 'payment',
  VIDEO_CALL = 'video_call',
  SYSTEM = 'system',
  SECURITY = 'security',
}

export interface INotificationResponseDTO {
  id: string;
  receiverId: string;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationBellProps {
  userId: string;
  variant?: "user" | "admin";
}

const TYPE_CONFIG: Record<NotificationType, { dot: string; badge: string; label: string; icon: string }> = {
  [NotificationType.MESSAGE]: {
    dot: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    label: "Message",
    icon: "💬",
  },
  [NotificationType.APPOINTMENT]: {
    dot: "bg-purple-500",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    label: "Appointment",
    icon: "📅",
  },
  [NotificationType.PAYMENT]: {
    dot: "bg-green-500",
    badge: "bg-green-500/10 text-green-600 dark:text-green-400",
    label: "Payment",
    icon: "💳",
  },
  [NotificationType.VIDEO_CALL]: {
    dot: "bg-pink-500",
    badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    label: "Video Call",
    icon: "🎥",
  },
  [NotificationType.SYSTEM]: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "System",
    icon: "⚙️",
  },
  [NotificationType.SECURITY]: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-600 dark:text-red-400",
    label: "Security",
    icon: "🔒",
  },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const d = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const NotificationBell = ({ userId, variant = "user" }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<INotificationResponseDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = variant === "admin";

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("receive_notifications");

    socket.on("receive_notifications", (data: INotificationResponseDTO[]) => {
      console.log('all the notifications: ', data)
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    });

    socket.on("receive_notification", (notification: INotificationResponseDTO) => {
      console.log('receive notification: ', notification)
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.isRead) setUnreadCount((prev) => prev + 1);
    });

    socket.on("notification_count", (count: number) => {
      setUnreadCount(count);
    });

    return () => {
      socket.off("receive_notifications");
      socket.off("receive_notification");
      socket.off("notification_count");
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    const update = await notificationApiService.markAllAsRead()
    if (update?.data?.markAllAsRead) {
      toast.success('success!')
    } else {
      toast.error(update?.errors?.[0]?.message || 'Something went wrong!')
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative h-9 w-9 rounded-full",
          isAdmin
            ? "text-slate-300 hover:text-white hover:bg-white/10"
            : "text-foreground hover:text-primary"
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center leading-none animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 overflow-hidden",
            isAdmin
              ? "bg-slate-800 border-slate-700"
              : "bg-background border-border"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3 border-b",
              isAdmin ? "border-slate-700" : "border-border"
            )}
          >
            <h3 className={cn("font-semibold text-sm", isAdmin ? "text-white" : "text-foreground")}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500/15 text-red-500 font-medium px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notification list — scrollable with styled scrollbar */}
          <div
            className={cn(
              "max-h-[340px] overflow-y-auto",
              // Styled scrollbar (Webkit)
              "[&::-webkit-scrollbar]:w-1.5",
              isAdmin
                ? "[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-track]:bg-slate-800"
                : "[&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-background"
            )}
          >
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className={cn("h-8 w-8 opacity-20", isAdmin ? "text-slate-400" : "text-muted-foreground")} />
                <p className={cn("text-sm", isAdmin ? "text-slate-400" : "text-muted-foreground")}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const config = TYPE_CONFIG[notification.type] ?? {
                  dot: "bg-slate-400",
                  badge: "bg-slate-400/10 text-slate-400",
                  label: notification.type,
                  icon: "🔔",
                };
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 border-b last:border-b-0 transition-colors cursor-pointer",
                      !notification.isRead
                        ? isAdmin
                          ? "bg-blue-500/10 hover:bg-blue-500/15"
                          : "bg-primary/5 hover:bg-primary/10"
                        : isAdmin
                          ? "hover:bg-white/5"
                          : "hover:bg-muted/50"
                    )}
                  >
                    {/* Unread dot */}
                    <div className="mt-2 flex-shrink-0">
                      <span
                        className={cn(
                          "block h-2 w-2 rounded-full",
                          !notification.isRead ? config.dot : "bg-transparent"
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Type badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded mb-1",
                          config.badge
                        )}
                      >
                        <span>{config.icon}</span>
                        {config.label}
                      </span>

                      {/* Content */}
                      <p
                        className={cn(
                          "text-sm line-clamp-2",
                          !notification.isRead
                            ? isAdmin ? "text-white font-medium" : "text-foreground font-medium"
                            : isAdmin ? "text-slate-300" : "text-muted-foreground"
                        )}
                      >
                        {notification.content}
                      </p>

                      {/* Timestamp */}
                      <p className={cn("text-[11px] mt-1", isAdmin ? "text-slate-500" : "text-muted-foreground/70")}>
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={cn("px-4 py-2.5 border-t text-center", isAdmin ? "border-slate-700" : "border-border")}>
              <button
                onClick={markAllAsRead}
                className={cn("text-xs font-medium hover:underline", isAdmin ? "text-blue-400" : "text-primary")}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;