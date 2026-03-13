"use client";

import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Ship,
  ArrowRightLeft,
  CheckCircle2,
  Droplets,
  Shield,
  Gauge,
  Trash2,
  Check,
  Filter,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  severity: "info" | "warning" | "critical";
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "ALARM",
    title: "Tank T105 — HLA Triggered",
    message: "Fill level reached 91%. Review and take action.",
    time: "5 minutes ago",
    read: false,
    severity: "warning",
  },
  {
    id: "2",
    type: "TRANSFER",
    title: "Transfer TRF-2026-0001 started",
    message: "Ship-to-tank transfer initiated. Flow rate: 250 m³/h.",
    time: "2 hours ago",
    read: false,
    severity: "info",
  },
  {
    id: "3",
    type: "CHECKLIST",
    title: "ISGOTT Checklist completed",
    message: "Checklist for TRF-2026-0001 signed by both parties.",
    time: "3 hours ago",
    read: false,
    severity: "info",
  },
  {
    id: "4",
    type: "VESSEL",
    title: "MT Pacific Trader arrived",
    message: "Vessel berthed at B3. ETA was 13:00, actual arrival 12:45.",
    time: "8 hours ago",
    read: true,
    severity: "info",
  },
  {
    id: "5",
    type: "EMERGENCY",
    title: "Emergency stop — TRF-2026-0099",
    message: "Transfer was halted due to pressure anomaly. Investigate immediately.",
    time: "2 days ago",
    read: true,
    severity: "critical",
  },
  {
    id: "6",
    type: "VARIANCE",
    title: "Variance exceeds tolerance",
    message: "Ship vs shore variance at 0.72% for TRF-2026-0098. Explanation required.",
    time: "3 days ago",
    read: true,
    severity: "warning",
  },
];

const TYPE_ICONS: Record<string, any> = {
  ALARM: AlertTriangle,
  TRANSFER: ArrowRightLeft,
  CHECKLIST: Shield,
  VESSEL: Ship,
  EMERGENCY: AlertOctagon,
  VARIANCE: Gauge,
};

const SEVERITY_STYLES: Record<string, { border: string; dot: string }> = {
  info: { border: "border-l-blue-400", dot: "bg-blue-500" },
  warning: { border: "border-l-amber-400", dot: "bg-amber-500" },
  critical: { border: "border-l-red-400", dot: "bg-red-500" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === "all" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === "unread" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </div>
        ) : (
          filtered.map((notification) => {
            const Icon = TYPE_ICONS[notification.type] || Bell;
            const severity = SEVERITY_STYLES[notification.severity] || SEVERITY_STYLES.info;
            return (
              <div
                key={notification.id}
                className={`px-5 py-4 flex items-start gap-4 border-l-4 transition-colors ${severity.border} ${
                  notification.read ? "bg-white" : "bg-blue-50/30"
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.severity === "critical" ? "bg-red-100" :
                  notification.severity === "warning" ? "bg-amber-100" : "bg-blue-100"
                }`}>
                  <Icon className={`w-4 h-4 ${
                    notification.severity === "critical" ? "text-red-600" :
                    notification.severity === "warning" ? "text-amber-600" : "text-blue-600"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${notification.read ? "text-foreground" : "text-foreground"}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className={`w-2 h-2 rounded-full ${severity.dot} flex-shrink-0`} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{notification.time}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => markRead(notification.id)}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(notification.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
