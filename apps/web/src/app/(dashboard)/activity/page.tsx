"use client";

import { useState } from "react";
import {
  Activity,
  Ship,
  ArrowRightLeft,
  Cylinder,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Droplets,
  Shield,
  Gauge,
  Edit3,
  Filter,
  Download,
  User,
} from "lucide-react";

interface ActivityEntry {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  user: string;
  severity: "info" | "warning" | "critical" | "success";
}

const SAMPLE_ACTIVITY: ActivityEntry[] = [
  { id: "1", timestamp: "2026-03-13T10:30:00Z", type: "TRANSFER_STARTED", title: "Transfer TRF-2026-0001 started", description: "Ship-to-tank transfer initiated from Berth B1 to Tank T103. Product: Methanol.", user: "Sarah Chen", severity: "info" },
  { id: "2", timestamp: "2026-03-13T10:15:00Z", type: "ISGOTT_SIGNED", title: "ISGOTT Checklist signed", description: "Checklist for TRF-2026-0001 signed by both terminal and vessel representatives.", user: "Alex Thompson", severity: "success" },
  { id: "3", timestamp: "2026-03-13T09:45:00Z", type: "FLOW_RATE", title: "Flow rate updated", description: "Flow rate for TRF-2026-0001 set to 250 m³/h.", user: "Alex Thompson", severity: "info" },
  { id: "4", timestamp: "2026-03-13T09:00:00Z", type: "VESSEL_BERTHED", title: "MT Pacific Trader berthed at B3", description: "Vessel berthed at Berth B3. Cargo: Toluene, 3000 m³.", user: "David Kim", severity: "info" },
  { id: "5", timestamp: "2026-03-13T08:30:00Z", type: "TANK_ALARM", title: "HLA triggered — Tank T105", description: "Fill level reached 91%. Automatic HLA triggered.", user: "System", severity: "warning" },
  { id: "6", timestamp: "2026-03-13T07:00:00Z", type: "TRANSFER_PAUSED", title: "Transfer TRF-2026-0002 paused", description: "Tank-to-ship transfer paused due to weather conditions.", user: "Maria Santos", severity: "warning" },
  { id: "7", timestamp: "2026-03-12T23:00:00Z", type: "ULLAGE_READING", title: "Ullage reading — Tank T103", description: "Reading: 2,580 m³ at 22.1°C.", user: "Alex Thompson", severity: "info" },
  { id: "8", timestamp: "2026-03-12T21:00:00Z", type: "TRANSFER_COMPLETED", title: "Transfer TRF-2026-0000 completed", description: "Ship-to-tank transfer completed. Final volume: 4,500 m³.", user: "Sarah Chen", severity: "success" },
  { id: "9", timestamp: "2026-03-12T18:00:00Z", type: "CERTIFICATE_ISSUED", title: "Quantity certificate issued", description: "Certificate for TRF-2026-0000 — variance 0.12%.", user: "James Morrison", severity: "success" },
  { id: "10", timestamp: "2026-03-12T16:00:00Z", type: "VESSEL_DEPARTED", title: "MT Chem Noble departed", description: "Vessel departed from Berth B2.", user: "David Kim", severity: "info" },
  { id: "11", timestamp: "2026-03-12T10:00:00Z", type: "EMERGENCY_STOP", title: "Emergency stop — TRF-2026-0099", description: "Transfer halted due to pressure anomaly on pipeline PL-03.", user: "Alex Thompson", severity: "critical" },
  { id: "12", timestamp: "2026-03-12T08:00:00Z", type: "TANK_CLEANED", title: "Tank T108 cleaning completed", description: "Tank marked available after cleaning cycle.", user: "Maria Santos", severity: "success" },
];

const TYPE_ICONS: Record<string, any> = {
  TRANSFER_STARTED: Play,
  TRANSFER_PAUSED: Pause,
  TRANSFER_COMPLETED: CheckCircle2,
  ISGOTT_SIGNED: Shield,
  FLOW_RATE: Gauge,
  VESSEL_BERTHED: Ship,
  VESSEL_DEPARTED: Ship,
  TANK_ALARM: AlertTriangle,
  ULLAGE_READING: Droplets,
  CERTIFICATE_ISSUED: CheckCircle2,
  EMERGENCY_STOP: XCircle,
  TANK_CLEANED: Cylinder,
};

const SEVERITY_STYLES: Record<string, { bg: string; icon: string; border: string }> = {
  info: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-l-blue-400" },
  warning: { bg: "bg-amber-50", icon: "text-amber-500", border: "border-l-amber-400" },
  critical: { bg: "bg-red-50", icon: "text-red-500", border: "border-l-red-400" },
  success: { bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-l-emerald-400" },
};

const FILTER_TYPES = [
  { value: "all", label: "All Activity" },
  { value: "transfers", label: "Transfers" },
  { value: "vessels", label: "Vessels" },
  { value: "tanks", label: "Tanks" },
  { value: "alerts", label: "Alerts" },
];

export default function ActivityPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? SAMPLE_ACTIVITY
    : SAMPLE_ACTIVITY.filter((a) => {
        if (filter === "transfers") return a.type.includes("TRANSFER") || a.type.includes("ISGOTT") || a.type.includes("FLOW") || a.type.includes("CERTIFICATE");
        if (filter === "vessels") return a.type.includes("VESSEL");
        if (filter === "tanks") return a.type.includes("TANK") || a.type.includes("ULLAGE");
        if (filter === "alerts") return a.severity === "warning" || a.severity === "critical";
        return true;
      });

  // Group entries by date
  const groupedByDate: Record<string, ActivityEntry[]> = {};
  filtered.forEach((entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(entry);
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Terminal-wide activity and audit trail</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TYPES.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grouped timeline */}
      {Object.entries(groupedByDate).map(([date, entries]) => (
        <div key={date}>
          {/* Date header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">{date}</h2>
          </div>

          {/* Entries */}
          <div className="ml-4 space-y-0">
            {entries.map((entry, idx) => {
              const Icon = TYPE_ICONS[entry.type] || Activity;
              const severity = SEVERITY_STYLES[entry.severity] || SEVERITY_STYLES.info;
              const isLast = idx === entries.length - 1;
              const time = new Date(entry.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

              return (
                <div key={entry.id} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${severity.bg} flex items-center justify-center flex-shrink-0 ring-2 ring-white`}>
                      <Icon className={`w-4 h-4 ${severity.icon}`} />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-border min-h-[12px]" />}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-4 mb-0 border-l-2 ${severity.border} pl-4 -ml-0.5`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 font-mono">{time}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <User className="w-2.5 h-2.5 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/60">{entry.user}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
