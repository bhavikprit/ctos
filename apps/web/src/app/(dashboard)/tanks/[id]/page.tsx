"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Cylinder,
  Droplets,
  AlertTriangle,
  Thermometer,
  Package,
  Clock,
  Activity,
  ShieldCheck,
  Lock,
  Unlock,
} from "lucide-react";

const STATUS_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: "Available", color: "text-emerald-600", bg: "bg-emerald-50" },
  IN_USE: { label: "In Use", color: "text-blue-600", bg: "bg-blue-50" },
  ALLOCATED: { label: "Allocated", color: "text-purple-600", bg: "bg-purple-50" },
  CLEANING: { label: "Cleaning", color: "text-amber-600", bg: "bg-amber-50" },
  MAINTENANCE: { label: "Maintenance", color: "text-orange-600", bg: "bg-orange-50" },
  OUT_OF_SERVICE: { label: "Out of Service", color: "text-red-600", bg: "bg-red-50" },
};

export default function TankDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tank, setTank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      api.getTank(params.id as string)
        .then(setTank)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  if (!tank) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Tank not found</p>
        <Link href="/tanks" className="text-primary text-sm mt-2 inline-block">← Back to tanks</Link>
      </div>
    );
  }

  const fillPct = tank.fillPercentage || (tank.currentLevelM3 && tank.capacityM3 ? Math.round((tank.currentLevelM3 / tank.capacityM3) * 100) : 0);
  const isHigh = fillPct >= (tank.hlaPercent || 90);
  const isCritical = fillPct >= (tank.hhlaPercent || 95);
  const statusConfig = STATUS_COLORS[tank.status] || STATUS_COLORS.AVAILABLE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{tank.code}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              {isCritical && (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">HHLA</span>
              )}
              {isHigh && !isCritical && (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">HLA</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {tank.name || tank.code} · Capacity {tank.capacityM3?.toLocaleString()} m³
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Tank visualization + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tank fill visualization */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Tank Level</h3>
            <div className="flex items-end gap-8">
              {/* Visual tank */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-48 border-2 border-slate-300 rounded-b-2xl rounded-t-lg overflow-hidden bg-slate-50">
                  {/* HLA marker */}
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400" style={{ bottom: `${tank.hlaPercent || 90}%` }}>
                    <span className="absolute -top-3 -right-1 text-[9px] font-bold text-amber-500 bg-white px-1">HLA</span>
                  </div>
                  {/* HHLA marker */}
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-red-400" style={{ bottom: `${tank.hhlaPercent || 95}%` }}>
                    <span className="absolute -top-3 -right-1 text-[9px] font-bold text-red-500 bg-white px-1">HHLA</span>
                  </div>
                  {/* Fill */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${
                      isCritical ? "bg-red-400/60" : isHigh ? "bg-amber-400/60" : "bg-blue-400/60"
                    }`}
                    style={{ height: `${fillPct}%` }}
                  />
                  {/* Level text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-700">{fillPct}%</span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-xs text-muted-foreground">Current Level</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">{tank.currentLevelM3?.toLocaleString() || "—"} m³</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Cylinder className="w-3.5 h-3.5 text-emerald-500" />
                    <p className="text-xs text-muted-foreground">Capacity</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">{tank.capacityM3?.toLocaleString()} m³</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Cylinder className="w-3.5 h-3.5 text-purple-500" />
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {((tank.capacityM3 || 0) - (tank.currentLevelM3 || 0)).toLocaleString()} m³
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                    <p className="text-xs text-muted-foreground">Temperature</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">{tank.temperature || "—"}°C</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tank specifications */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Tank Type</p>
                <p className="text-sm font-medium">{tank.type || "Fixed Roof"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Material</p>
                <p className="text-sm font-medium">{tank.material || "Stainless Steel 316L"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">HLA Threshold</p>
                <p className="text-sm font-medium text-amber-600">{tank.hlaPercent || 90}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">HHLA Threshold</p>
                <p className="text-sm font-medium text-red-600">{tank.hhlaPercent || 95}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Heating</p>
                <p className="text-sm font-medium">{tank.hasHeating ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Insulation</p>
                <p className="text-sm font-medium">{tank.hasInsulation ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Inspection</p>
                <p className="text-sm font-medium">
                  {tank.lastInspection ? new Date(tank.lastInspection).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Cleaned</p>
                <p className="text-sm font-medium">
                  {tank.lastCleaned ? new Date(tank.lastCleaned).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Compatible products */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Compatible Products
            </h3>
            <div className="flex flex-wrap gap-2">
              {(tank.compatibleProducts || []).map((product: any) => (
                <span
                  key={product.id || product}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200"
                >
                  <Package className="w-3 h-3 inline mr-1" />
                  {product.name || product}
                </span>
              ))}
              {(!tank.compatibleProducts || tank.compatibleProducts.length === 0) && (
                <p className="text-sm text-muted-foreground">No product compatibility data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Right — Status & activity */}
        <div className="space-y-6">
          {/* Current allocation */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3">Current Allocation</h3>
            {tank.currentProduct ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Package className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">{tank.currentProduct.name || tank.currentProduct}</p>
                    <p className="text-xs text-blue-600">Currently stored</p>
                  </div>
                </div>
                {tank.allocatedTo && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <Lock className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">Allocated to transfer</p>
                      <p className="text-xs text-purple-600">{tank.allocatedTo}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                <Unlock className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Available</p>
                  <p className="text-xs text-emerald-600">No product currently stored</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent readings */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Readings</h3>
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Ullage Reading</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {i === 1 ? "2 hours ago" : i === 2 ? "6 hours ago" : "Yesterday"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-mono font-bold text-foreground">
                    {(tank.currentLevelM3 || 2500) - (i * 50)} m³
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Alarms */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alarms
            </h3>
            {isHigh || isCritical ? (
              <div className="space-y-2">
                {isCritical && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                    <p className="text-xs font-medium text-red-700">HHLA — Very High Level Alarm Active</p>
                  </div>
                )}
                {isHigh && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <p className="text-xs font-medium text-amber-700">HLA — High Level Alarm Active</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active alarms</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
