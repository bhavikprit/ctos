"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { DataTable } from "@/components/common";
import {
  ArrowRightLeft,
  Plus,
  Activity,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Droplets,
  ChevronRight,
  AlertOctagon,
  Ship,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PLANNED: { label: "Planned", color: "text-slate-600", bg: "bg-slate-100", icon: Clock },
  AWAITING_CHECKLIST: { label: "Awaiting Checklist", color: "text-amber-600", bg: "bg-amber-100", icon: FileText },
  READY: { label: "Ready", color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle2 },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100", icon: Play },
  PAUSED: { label: "Paused", color: "text-amber-700", bg: "bg-amber-100", icon: Pause },
  COMPLETING: { label: "Completing", color: "text-teal-600", bg: "bg-teal-100", icon: Droplets },
  PENDING_CLOSURE: { label: "Pending Closure", color: "text-cyan-600", bg: "bg-cyan-100", icon: FileText },
  COMPLETED: { label: "Completed", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle2 },
  TERMINATED: { label: "Terminated", color: "text-red-600", bg: "bg-red-100", icon: XCircle },
};

const TYPE_LABELS: Record<string, string> = {
  SHIP_TO_TANK: "Ship → Tank",
  TANK_TO_SHIP: "Tank → Ship",
  TANK_TO_TANK: "Tank → Tank",
  SHIP_TO_SHIP: "Ship → Ship",
  PIPELINE_IN: "Pipeline In",
  PIPELINE_OUT: "Pipeline Out",
  TRUCK_LOADING: "Truck Load",
};

export default function TransfersPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    api.getTransfers()
      .then((res: any) => setTransfers(Array.isArray(res) ? res : res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  const filtered = statusFilter === "all"
    ? transfers
    : transfers.filter((t) => t.status === statusFilter);

  const activeCount = transfers.filter((t) => ["IN_PROGRESS", "PAUSED"].includes(t.status)).length;

  const columns = [
    {
      key: "transfer",
      header: "Transfer",
      cell: (row: any) => {
        const statusCfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.PLANNED;
        const StatusIcon = statusCfg.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              row.status === "IN_PROGRESS" ? "bg-blue-50" :
              row.status === "PAUSED" ? "bg-amber-50" :
              row.status === "COMPLETED" ? "bg-green-50" :
              "bg-slate-50"
            }`}>
              <StatusIcon className={`w-4 h-4 ${statusCfg.color} ${row.status === "IN_PROGRESS" ? "animate-pulse" : ""}`} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{row.transferNumber}</p>
              <p className="text-xs text-muted-foreground">{TYPE_LABELS[row.type] || row.type?.replace(/_/g, " ")}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row: any) => {
        const config = STATUS_CONFIG[row.status] || STATUS_CONFIG.PLANNED;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "product",
      header: "Product",
      cell: (row: any) => (
        <span className="text-sm">{row.parcel?.product?.name || row.productName || "—"}</span>
      ),
    },
    {
      key: "vessel",
      header: "Vessel",
      cell: (row: any) => (
        <div className="flex items-center gap-1.5">
          <Ship className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{row.parcel?.vesselCall?.vesselName || "—"}</span>
        </div>
      ),
    },
    {
      key: "volume",
      header: "Volume",
      cell: (row: any) => {
        const progress = row.plannedVolume > 0
          ? Math.round(((row.actualVolume || 0) / row.plannedVolume) * 100)
          : 0;
        return (
          <div className="min-w-[100px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {row.actualVolume?.toLocaleString() || "0"} / {row.plannedVolume?.toLocaleString() || "—"} m³
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  row.status === "COMPLETED" ? "bg-green-500" :
                  row.status === "IN_PROGRESS" ? "bg-blue-500" :
                  row.status === "PAUSED" ? "bg-amber-500" :
                  "bg-slate-300"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "flowRate",
      header: "Flow Rate",
      cell: (row: any) => (
        <div className="flex items-center gap-1.5">
          {row.flowRateM3h > 0 && <Activity className="w-3 h-3 text-blue-500 animate-pulse" />}
          <span className="text-sm font-mono">
            {row.flowRateM3h ? `${row.flowRateM3h} m³/h` : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: () => <ChevronRight className="w-4 h-4 text-muted-foreground" />,
      className: "w-10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transfers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {transfers.length} total · {activeCount} active
          </p>
        </div>
        <Link
          href="/transfers/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Transfer
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({transfers.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = transfers.filter((t) => t.status === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === key
                  ? `${config.bg} ${config.color}`
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <DataTable
        data={filtered}
        columns={columns}
        searchPlaceholder="Search transfers..."
        searchKey={(row) => `${row.transferNumber} ${row.parcel?.product?.name || ""} ${row.parcel?.vesselCall?.vesselName || ""}`}
        onRowClick={(row) => router.push(`/transfers/${row.id}`)}
        pageSize={25}
        emptyMessage="No transfers found"
      />
    </div>
  );
}
