"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Cylinder, Droplets, AlertTriangle, CheckCircle2, Wrench, Ban } from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  AVAILABLE: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Available", icon: CheckCircle2 },
  ALLOCATED: { color: "text-blue-600", bg: "bg-blue-50", label: "Allocated", icon: Cylinder },
  IN_USE: { color: "text-purple-600", bg: "bg-purple-50", label: "In Use", icon: Droplets },
  CLEANING: { color: "text-amber-600", bg: "bg-amber-50", label: "Cleaning", icon: Wrench },
  MAINTENANCE: { color: "text-orange-600", bg: "bg-orange-50", label: "Maintenance", icon: Wrench },
  OUT_OF_SERVICE: { color: "text-red-600", bg: "bg-red-50", label: "Out of Service", icon: Ban },
};

export default function TanksPage() {
  const [tanks, setTanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTanks()
      .then((data) => setTanks(data))
      .catch((err) => console.error("Failed to load tanks:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tank Farm</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of all storage tanks, fill levels, and operational status
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = tanks.filter((t) => t.status === key).length;
          if (count === 0) return null;
          const Icon = config.icon;
          return (
            <div
              key={key}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg}`}
            >
              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              <span className={`text-xs font-medium ${config.color}`}>
                {count} {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tank grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tanks.map((tank) => {
            const statusConfig = STATUS_CONFIG[tank.status] || STATUS_CONFIG.AVAILABLE;
            const fillPct = tank.fillPercentage || 0;
            const isHigh = fillPct >= tank.hlaPercentage;
            const isCritical = fillPct >= tank.hhlaPercentage;
            const products = tank.compatibleProducts?.map((tp: any) => tp.product.name) || [];

            return (
              <Link
                key={tank.id}
                href={`/tanks/${tank.id}`}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground">{tank.code}</h3>
                    <p className="text-xs text-muted-foreground">{tank.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Fill level visual */}
                <div className="mb-3">
                  <div className="flex items-end justify-between mb-1">
                    <span className="text-2xl font-bold text-foreground">{fillPct}%</span>
                    <span className="text-xs text-muted-foreground">
                      {tank.currentLevelM3?.toLocaleString()} / {tank.capacityM3?.toLocaleString()} m³
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    {/* HLA marker */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-amber-400 z-10"
                      style={{ left: `${tank.hlaPercentage}%` }}
                    />
                    {/* HHLA marker */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                      style={{ left: `${tank.hhlaPercentage}%` }}
                    />
                    {/* Fill bar */}
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? "bg-red-500" :
                        isHigh ? "bg-amber-500" :
                        fillPct > 0 ? "bg-blue-500" :
                        "bg-transparent"
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">0%</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-amber-500">HLA {tank.hlaPercentage}%</span>
                      <span className="text-[10px] text-red-500">HHLA {tank.hhlaPercentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Warning badges */}
                {isCritical && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-600 text-xs mb-2">
                    <AlertTriangle className="w-3 h-3" />
                    High-High Level Alarm
                  </div>
                )}
                {isHigh && !isCritical && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-xs mb-2">
                    <AlertTriangle className="w-3 h-3" />
                    High Level Alarm
                  </div>
                )}

                {/* Product compatibility */}
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Compatible products:</p>
                  <div className="flex flex-wrap gap-1">
                    {products.map((p: string) => (
                      <span key={p} className="px-1.5 py-0.5 rounded bg-muted text-xs text-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available capacity */}
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-medium text-foreground">
                      {tank.availableCapacity?.toLocaleString()} m³
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
