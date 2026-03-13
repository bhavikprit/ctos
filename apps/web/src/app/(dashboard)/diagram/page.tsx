"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Cylinder,
  Ship,
  Anchor,
  Zap,
  CircleDot,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  IN_USE: "border-blue-400 bg-blue-500/5",
  ALLOCATED: "border-purple-400 bg-purple-500/5",
  AVAILABLE: "border-emerald-400 bg-emerald-500/5",
  CLEANING: "border-amber-400 bg-amber-500/5",
  MAINTENANCE: "border-orange-400 bg-orange-500/5",
  OUT_OF_SERVICE: "border-red-400 bg-red-500/5",
};

function TankCard({ tank }: { tank: any }) {
  const fillPct = tank.fillPercentage || 0;
  const isHigh = fillPct >= 90;
  const isCritical = fillPct >= 95;
  const fillColor = isCritical ? "bg-red-500" : isHigh ? "bg-amber-500" : fillPct > 0 ? "bg-blue-500" : "bg-transparent";
  const borderColor = STATUS_COLORS[tank.status] || STATUS_COLORS.AVAILABLE;

  return (
    <div className={`rounded-xl border-2 ${borderColor} p-3 transition-all hover:shadow-md cursor-pointer min-w-[120px]`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-foreground">{tank.code}</p>
        {isCritical && <AlertTriangle className="w-3 h-3 text-red-500" />}
        {isHigh && !isCritical && <AlertTriangle className="w-3 h-3 text-amber-500" />}
      </div>
      <div className="relative h-10 bg-muted/50 rounded-md overflow-hidden mb-1">
        <div
          className={`absolute bottom-0 left-0 right-0 ${fillColor} transition-all duration-500 rounded-b-md opacity-70`}
          style={{ height: `${fillPct}%` }}
        />
        <p className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
          {fillPct}%
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        {tank.currentLevelM3?.toLocaleString()} / {tank.capacityM3?.toLocaleString()} m³
      </p>
    </div>
  );
}

export default function DiagramPage() {
  const [tanks, setTanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTanks()
      .then((data) => setTanks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Static berths (from seed data)
  const berths = [
    { code: "B1", name: "Deep Water", vessel: "MT Chem Voyager", status: "BERTHED" },
    { code: "B2", name: "Chemical Jetty", vessel: null, status: "EMPTY" },
    { code: "B3", name: "Barge Dock", vessel: null, status: "EMPTY" },
  ];

  const pumps = [
    { code: "P-001", status: "RUNNING" },
    { code: "P-002", status: "STOPPED" },
    { code: "P-003", status: "STOPPED" },
    { code: "P-004", status: "STOPPED" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Terminal Diagram</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visual overview of terminal infrastructure and active transfers
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-blue-400 bg-blue-500/10" /> In Use</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-purple-400 bg-purple-500/10" /> Allocated</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-emerald-400 bg-emerald-500/10" /> Available</div>
          <div className="flex items-center gap-1.5"><div className="w-8 h-0.5 bg-blue-500 rounded" /> Active Flow</div>
        </div>
      </div>

      {/* Diagram layout */}
      <div className="bg-white rounded-xl border border-border p-6 overflow-auto" style={{ minHeight: "calc(100vh - 200px)" }}>
        <div className="flex gap-8 items-start min-w-[900px]">
          {/* Berths column */}
          <div className="space-y-4 flex-shrink-0">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Berths</h4>
            {berths.map((berth) => (
              <div
                key={berth.code}
                className={`rounded-xl border-2 p-4 min-w-[140px] transition-all ${
                  berth.vessel ? "border-purple-400 bg-purple-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Anchor className={`w-4 h-4 ${berth.vessel ? "text-purple-500" : "text-slate-400"}`} />
                  <span className="text-xs font-bold text-foreground">{berth.code}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{berth.name}</p>
                {berth.vessel && (
                  <div className="mt-2 pt-2 border-t border-purple-200 flex items-center gap-1">
                    <Ship className="w-3 h-3 text-purple-500" />
                    <p className="text-[10px] font-medium text-purple-700">{berth.vessel}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pipeline connection lines */}
          <div className="flex flex-col items-center justify-center gap-4 pt-10 flex-shrink-0">
            {/* flow lines */}
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2" style={{ height: "80px" }}>
                <div className={`w-16 h-0.5 rounded ${i === 0 ? "bg-blue-500 animate-pulse" : "bg-slate-200"}`} />
                <span className="text-[9px] text-muted-foreground">→</span>
              </div>
            ))}
          </div>

          {/* Pumps column */}
          <div className="space-y-4 flex-shrink-0">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pumps</h4>
            {pumps.map((pump) => (
              <div
                key={pump.code}
                className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  pump.status === "RUNNING"
                    ? "border-blue-400 bg-blue-50 animate-pulse"
                    : "border-slate-200 bg-white"
                }`}
              >
                <Zap className={`w-4 h-4 ${pump.status === "RUNNING" ? "text-blue-500" : "text-slate-400"}`} />
                <span className="text-[9px] mt-0.5 text-muted-foreground">{pump.code}</span>
              </div>
            ))}
          </div>

          {/* Pipeline connection lines */}
          <div className="flex flex-col items-center justify-center gap-4 pt-10 flex-shrink-0">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2" style={{ height: "60px" }}>
                <div className={`w-12 h-0.5 rounded ${i === 0 ? "bg-blue-500 animate-pulse" : "bg-slate-200"}`} />
                <span className="text-[9px] text-muted-foreground">→</span>
              </div>
            ))}
          </div>

          {/* Tanks grid */}
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tank Farm</h4>
            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading tanks...</div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {tanks.map((tank) => (
                  <TankCard key={tank.id} tank={tank} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active transfer banner */}
        <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Active Transfer: TRF-2026-0001</p>
                <p className="text-xs text-blue-600">Ship → Tank · MT Chem Voyager → T103 · Methanol · 250 m³/h</p>
              </div>
            </div>
            <a
              href="/transfers"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              View Transfer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
