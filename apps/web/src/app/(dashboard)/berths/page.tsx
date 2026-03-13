"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Anchor,
  Ship,
  CheckCircle2,
  AlertCircle,
  Wrench,
  ArrowRightLeft,
  Clock,
  MapPin,
  Waves,
} from "lucide-react";

interface Berth {
  id: string;
  code: string;
  name: string;
  status: string;
  maxLOA?: number;
  maxDraft?: number;
  maxDWT?: number;
  currentVessel?: string;
  currentVesselEta?: string;
  pipelineConnections?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  AVAILABLE: { label: "Available", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  OCCUPIED: { label: "Occupied", color: "text-blue-600", bg: "bg-blue-50", icon: Ship },
  MAINTENANCE: { label: "Maintenance", color: "text-amber-600", bg: "bg-amber-50", icon: Wrench },
  CLOSED: { label: "Closed", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
};

const SAMPLE_BERTHS: Berth[] = [
  { id: "1", code: "B1", name: "Berth 1 — Main Chemical Jetty", status: "OCCUPIED", maxLOA: 200, maxDraft: 12.5, maxDWT: 45000, currentVessel: "MT Chem Voyager", pipelineConnections: 4 },
  { id: "2", code: "B2", name: "Berth 2 — East Jetty", status: "OCCUPIED", maxLOA: 180, maxDraft: 11.0, maxDWT: 35000, currentVessel: "MT Global Spirit", pipelineConnections: 3 },
  { id: "3", code: "B3", name: "Berth 3 — West Jetty", status: "AVAILABLE", maxLOA: 220, maxDraft: 14.0, maxDWT: 55000, currentVessel: undefined, pipelineConnections: 5 },
  { id: "4", code: "B4", name: "Berth 4 — Small Vessel Dock", status: "MAINTENANCE", maxLOA: 120, maxDraft: 8.0, maxDWT: 15000, currentVessel: undefined, pipelineConnections: 2 },
];

export default function BerthsPage() {
  const [berths, setBerths] = useState<Berth[]>(SAMPLE_BERTHS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Berths</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {berths.length} berths · {berths.filter((b) => b.status === "AVAILABLE").length} available
        </p>
      </div>

      {/* Status overview */}
      <div className="flex items-center gap-3 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = berths.filter((b) => b.status === key).length;
          const Icon = config.icon;
          return (
            <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg}`}>
              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              <span className={`text-xs font-medium ${config.color}`}>{count} {config.label}</span>
            </div>
          );
        })}
      </div>

      {/* Berth cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {berths.map((berth) => {
          const config = STATUS_CONFIG[berth.status] || STATUS_CONFIG.AVAILABLE;
          const StatusIcon = config.icon;

          return (
            <div key={berth.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
              {/* Header with status */}
              <div className="p-5 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Anchor className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{berth.code}</h3>
                      <p className="text-xs text-muted-foreground">{berth.name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Current vessel or availability */}
              <div className="p-5">
                {berth.currentVessel ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50 mb-4">
                    <Ship className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">{berth.currentVessel}</p>
                      <p className="text-xs text-blue-600">Currently berthed</p>
                    </div>
                  </div>
                ) : berth.status === "AVAILABLE" ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/50 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">Available for berthing</p>
                      <p className="text-xs text-emerald-600">No vessel currently assigned</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-200/50 mb-4">
                    <Wrench className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Under maintenance</p>
                      <p className="text-xs text-amber-600">Scheduled until TBD</p>
                    </div>
                  </div>
                )}

                {/* Specifications */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Max LOA</p>
                    <p className="text-sm font-bold text-foreground">{berth.maxLOA}m</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Max Draft</p>
                    <p className="text-sm font-bold text-foreground">{berth.maxDraft}m</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Max DWT</p>
                    <p className="text-sm font-bold text-foreground">{(berth.maxDWT || 0) / 1000}k</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Pipelines</p>
                    <p className="text-sm font-bold text-foreground">{berth.pipelineConnections}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
