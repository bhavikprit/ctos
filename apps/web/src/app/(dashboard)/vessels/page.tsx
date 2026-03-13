"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { DataTable } from "@/components/common";
import {
  Ship,
  Plus,
  Anchor,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  EXPECTED: { label: "Expected", color: "text-slate-600", bg: "bg-slate-100" },
  ARRIVED: { label: "Arrived", color: "text-blue-600", bg: "bg-blue-100" },
  BERTHED: { label: "Berthed", color: "text-emerald-600", bg: "bg-emerald-100" },
  OPERATIONS: { label: "Operations", color: "text-purple-600", bg: "bg-purple-100" },
  DEPARTED: { label: "Departed", color: "text-slate-500", bg: "bg-slate-50" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-100" },
};

export default function VesselsPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVesselCalls()
      .then((res: any) => setVessels(Array.isArray(res) ? res : res?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  const columns = [
    {
      key: "vessel",
      header: "Vessel",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Ship className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{row.vesselName}</p>
            <p className="text-xs text-muted-foreground">IMO {row.imoNumber || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: any) => {
        const config = STATUS_CONFIG[row.status] || STATUS_CONFIG.EXPECTED;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "berth",
      header: "Berth",
      cell: (row: any) => (
        <div className="flex items-center gap-1.5">
          <Anchor className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{row.berth?.code || row.berthCode || "—"}</span>
        </div>
      ),
    },
    {
      key: "eta",
      header: "ETA",
      cell: (row: any) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">
            {row.eta ? new Date(row.eta).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "agent",
      header: "Agent",
      cell: (row: any) => (
        <span className="text-sm text-muted-foreground">{row.agent || "—"}</span>
      ),
    },
    {
      key: "parcels",
      header: "Parcels",
      cell: (row: any) => (
        <span className="text-sm font-medium">{row._count?.parcels || row.parcels?.length || 0}</span>
      ),
      className: "text-center",
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
          <h1 className="text-2xl font-bold text-foreground">Vessel Calls</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vessels.length} vessel call{vessels.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/vessels/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Vessel Call
        </Link>
      </div>

      {/* Summary counters */}
      <div className="flex items-center gap-3 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = vessels.filter((v) => v.status === key).length;
          if (count === 0) return null;
          return (
            <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${config.bg}`}>
              <span className={`text-xs font-medium ${config.color}`}>{count} {config.label}</span>
            </div>
          );
        })}
      </div>

      {/* Data table */}
      <DataTable
        data={vessels}
        columns={columns}
        searchPlaceholder="Search vessels..."
        searchKey={(row) => `${row.vesselName} ${row.imoNumber || ""} ${row.agent || ""}`}
        onRowClick={(row) => router.push(`/vessels/${row.id}`)}
        pageSize={25}
        emptyMessage="No vessel calls yet. Create one to get started."
      />
    </div>
  );
}
