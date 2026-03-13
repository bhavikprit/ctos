"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Ship,
  Cylinder,
  ArrowRight,
  Droplets,
  Gauge,
  Activity,
  Zap,
  ChevronRight,
} from "lucide-react";

const STATUS_COLORS: Record<string, { line: string; glow: string; label: string }> = {
  PLANNED: { line: "border-slate-300", glow: "", label: "Planned" },
  AWAITING_CHECKLIST: { line: "border-amber-400", glow: "", label: "Awaiting Checklist" },
  READY: { line: "border-emerald-400", glow: "", label: "Ready" },
  IN_PROGRESS: { line: "border-blue-500", glow: "shadow-blue-500/20 shadow-lg", label: "In Progress" },
  PAUSED: { line: "border-amber-500", glow: "", label: "Paused" },
  COMPLETING: { line: "border-teal-400", glow: "", label: "Completing" },
  PENDING_CLOSURE: { line: "border-cyan-400", glow: "", label: "Pending Closure" },
  COMPLETED: { line: "border-green-400", glow: "", label: "Completed" },
  TERMINATED: { line: "border-red-500", glow: "", label: "Terminated" },
};

export default function TransferDiagramPage() {
  const params = useParams();
  const router = useRouter();
  const transferId = params.id as string;
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTransfer(transferId)
      .then(setTransfer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [transferId]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  if (!transfer) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Transfer not found</p>
      </div>
    );
  }

  const statusColors = STATUS_COLORS[transfer.status] || STATUS_COLORS.PLANNED;
  const isActive = transfer.status === "IN_PROGRESS";
  const progress = transfer.plannedVolume > 0
    ? Math.round(((transfer.actualVolume || 0) / transfer.plannedVolume) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transfer Diagram</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{transfer.transferNumber}</p>
        </div>
      </div>

      {/* Diagram visualization */}
      <div className={`bg-white rounded-xl border-2 ${statusColors.line} ${statusColors.glow} p-8 overflow-hidden`}>
        {/* Flow direction bar */}
        {isActive && (
          <div className="mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Live Transfer</p>
          </div>
        )}

        {/* Main diagram: Source → Pipeline → Destination */}
        <div className="flex items-center justify-between gap-4">
          {/* Source */}
          <div className="flex-1 max-w-[240px]">
            <div className={`p-6 rounded-xl border-2 ${statusColors.line} text-center relative`}>
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                {transfer.sourceType === "BERTH" || transfer.type?.includes("SHIP") ? (
                  <Ship className="w-7 h-7 text-blue-500" />
                ) : (
                  <Cylinder className="w-7 h-7 text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Source</p>
              <p className="text-lg font-bold text-foreground">{transfer.sourceId || "Berth B1"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {transfer.type?.includes("SHIP_TO") ? transfer.parcel?.vesselCall?.vesselName || "Vessel" : "Storage Tank"}
              </p>
            </div>
          </div>

          {/* Pipeline connection */}
          <div className="flex-1 flex flex-col items-center gap-3 min-w-[200px]">
            {/* Flow arrows */}
            <div className="w-full relative">
              <div className={`h-1 w-full rounded-full ${isActive ? "bg-blue-200" : "bg-muted"} relative overflow-hidden`}>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-slide" />
                )}
              </div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <ArrowRight className={`w-5 h-5 ${isActive ? "text-blue-500" : "text-muted-foreground"}`} />
              </div>
            </div>

            {/* Pipeline metrics */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Gauge className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Flow Rate</p>
                <p className="text-sm font-bold">{transfer.flowRateM3h || "—"} m³/h</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Droplets className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Transferred</p>
                <p className="text-sm font-bold">{transfer.actualVolume?.toLocaleString() || "0"} m³</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Activity className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-sm font-bold">{progress}%</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isActive ? "bg-blue-500" : transfer.status === "COMPLETED" ? "bg-green-500" : "bg-slate-300"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Destination */}
          <div className="flex-1 max-w-[240px]">
            <div className={`p-6 rounded-xl border-2 ${statusColors.line} text-center`}>
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                {transfer.destType === "BERTH" || transfer.type?.includes("TO_SHIP") ? (
                  <Ship className="w-7 h-7 text-blue-500" />
                ) : (
                  <Cylinder className="w-7 h-7 text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Destination</p>
              <p className="text-lg font-bold text-foreground">{transfer.destId || "Tank T103"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {transfer.type?.includes("TO_SHIP") ? transfer.parcel?.vesselCall?.vesselName || "Vessel" : "Storage Tank"}
              </p>
            </div>
          </div>
        </div>

        {/* Transfer info bar */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Product</p>
            <p className="text-sm font-medium">{transfer.parcel?.product?.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Planned Volume</p>
            <p className="text-sm font-medium">{transfer.plannedVolume?.toLocaleString() || "—"} m³</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className={`text-sm font-semibold ${
              isActive ? "text-blue-600" : transfer.status === "COMPLETED" ? "text-green-600" : "text-foreground"
            }`}>{statusColors.label}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Started</p>
            <p className="text-sm font-medium">
              {transfer.startTime ? new Date(transfer.startTime).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href={`/transfers/${transferId}`}
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-border hover:shadow-md transition-all group"
        >
          <span className="text-sm font-medium text-foreground">Transfer Detail</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
        <Link
          href={`/transfers/${transferId}/isgott`}
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-border hover:shadow-md transition-all group"
        >
          <span className="text-sm font-medium text-foreground">ISGOTT Checklist</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
        <Link
          href={`/transfers/${transferId}/certificate`}
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-border hover:shadow-md transition-all group"
        >
          <span className="text-sm font-medium text-foreground">Quantity Certificate</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-slide {
          animation: slide 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
