"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Activity,
  AlertOctagon,
  Droplets,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { icon: any; bg: string; text: string; label: string }> = {
  PLANNED: { icon: Clock, bg: "bg-slate-50", text: "text-slate-600", label: "Planned" },
  AWAITING_CHECKLIST: { icon: Clock, bg: "bg-amber-50", text: "text-amber-600", label: "Awaiting Checklist" },
  READY: { icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600", label: "Ready" },
  IN_PROGRESS: { icon: Activity, bg: "bg-blue-50", text: "text-blue-600", label: "In Progress" },
  PAUSED: { icon: PauseCircle, bg: "bg-amber-50", text: "text-amber-600", label: "Paused" },
  COMPLETING: { icon: Droplets, bg: "bg-teal-50", text: "text-teal-600", label: "Completing" },
  PENDING_CLOSURE: { icon: Clock, bg: "bg-cyan-50", text: "text-cyan-600", label: "Pending Closure" },
  COMPLETED: { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-600", label: "Completed" },
  TERMINATED: { icon: XCircle, bg: "bg-red-50", text: "text-red-600", label: "Terminated" },
};

const TYPE_LABELS: Record<string, string> = {
  SHIP_TO_TANK: "Ship → Tank",
  TANK_TO_SHIP: "Tank → Ship",
  TANK_TO_TANK: "Tank → Tank",
  TANK_TO_TRUCK: "Tank → Truck",
  TANK_TO_IBC: "Tank → IBC",
  CROSS_TERMINAL: "Cross-Terminal",
  IBC_TO_TRUCK: "IBC → Truck",
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTransfers();
  }, []);

  async function loadTransfers() {
    try {
      const result = await api.getTransfers();
      setTransfers(result.data);
    } catch (err) {
      console.error("Failed to load transfers:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transfers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage all chemical transfer operations
          </p>
        </div>
        <Link
          href="/transfers/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Transfer
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by transfer number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Transfer list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-muted-foreground">Loading...</div>
        ) : transfers.length === 0 ? (
          <div className="p-16 text-center">
            <ArrowRightLeft className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No transfers found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Create a transfer from a vessel call or directly
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transfers.map((transfer) => {
              const config = STATUS_CONFIG[transfer.status] || STATUS_CONFIG.PLANNED;
              const StatusIcon = config.icon;
              const productName = transfer.parcel?.product?.name || "—";
              const vesselName = transfer.parcel?.vesselCall?.vesselName;

              return (
                <Link
                  key={transfer.id}
                  href={`/transfers/${transfer.id}`}
                  className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transfer.status === "IN_PROGRESS" ? "bg-blue-500/10" :
                      transfer.status === "COMPLETED" ? "bg-emerald-500/10" :
                      transfer.status === "PAUSED" ? "bg-amber-500/10" :
                      transfer.status === "TERMINATED" ? "bg-red-500/10" :
                      "bg-slate-500/10"
                    }`}>
                      <StatusIcon className={`w-5 h-5 ${config.text}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {transfer.transferNumber}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {TYPE_LABELS[transfer.type] || transfer.type}
                        {vesselName && ` · ${vesselName}`}
                        {` · ${productName}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {transfer.flowRateM3h && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Activity className="w-3 h-3" />
                          {transfer.flowRateM3h} m³/h
                        </div>
                      </div>
                    )}
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {transfer.actualVolume || "—"} / {transfer.plannedVolume} m³
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
