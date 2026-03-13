"use client";

import { useState } from "react";
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  ExternalLink,
  Clock,
  Flame,
  Skull,
  Droplets,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SDSEntry {
  id: string;
  product: string;
  code: string;
  version: string;
  lastUpdated: string;
  hazards: string[];
  ghs: string[];
  emergencyContact: string;
}

const SAMPLE_SDS: SDSEntry[] = [
  { id: "1", product: "Methanol", code: "MEOH", version: "4.2", lastUpdated: "2025-11-15", hazards: ["Flammable", "Toxic", "Health Hazard"], ghs: ["GHS02", "GHS06", "GHS08"], emergencyContact: "+1-800-424-9300" },
  { id: "2", product: "Ethanol", code: "ETOH", version: "3.8", lastUpdated: "2025-10-01", hazards: ["Flammable", "Irritant"], ghs: ["GHS02", "GHS07"], emergencyContact: "+1-800-424-9300" },
  { id: "3", product: "Toluene", code: "TOL", version: "5.0", lastUpdated: "2025-12-01", hazards: ["Flammable", "Irritant", "Health Hazard"], ghs: ["GHS02", "GHS07", "GHS08"], emergencyContact: "+1-800-424-9300" },
  { id: "4", product: "Benzene", code: "BEN", version: "6.1", lastUpdated: "2026-01-20", hazards: ["Flammable", "Carcinogenic", "Toxic"], ghs: ["GHS02", "GHS06", "GHS08"], emergencyContact: "+1-800-424-9300" },
  { id: "5", product: "Acetone", code: "ACE", version: "4.0", lastUpdated: "2025-09-10", hazards: ["Flammable", "Irritant"], ghs: ["GHS02", "GHS07"], emergencyContact: "+1-800-424-9300" },
  { id: "6", product: "Xylene", code: "XYL", version: "3.5", lastUpdated: "2025-08-20", hazards: ["Flammable", "Irritant", "Health Hazard"], ghs: ["GHS02", "GHS07", "GHS08"], emergencyContact: "+1-800-424-9300" },
];

const GHS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  GHS02: { label: "Flammable", color: "text-red-600 bg-red-50", icon: Flame },
  GHS06: { label: "Toxic", color: "text-purple-600 bg-purple-50", icon: Skull },
  GHS07: { label: "Irritant", color: "text-amber-600 bg-amber-50", icon: AlertTriangle },
  GHS08: { label: "Health Hazard", color: "text-blue-600 bg-blue-50", icon: Shield },
};

export default function SafetyPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = search
    ? SAMPLE_SDS.filter((s) => `${s.product} ${s.code}`.toLowerCase().includes(search.toLowerCase()))
    : SAMPLE_SDS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Safety Data Sheets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {SAMPLE_SDS.length} SDS documents · IMDG/GHS compliant
          </p>
        </div>
      </div>

      {/* Emergency contacts banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">Emergency Contacts</p>
            <p className="text-xs text-red-600">
              Fire: <span className="font-mono font-bold">911</span> · CHEMTREC: <span className="font-mono font-bold">+1-800-424-9300</span> · Terminal Control: <span className="font-mono font-bold">Ext. 100</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name or code..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* SDS cards */}
      <div className="space-y-3">
        {filtered.map((sds) => {
          const isExpanded = expandedId === sds.id;
          return (
            <div key={sds.id} className="bg-white rounded-xl border border-border overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : sds.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{sds.product}</p>
                      <span className="text-xs font-mono text-muted-foreground">({sds.code})</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Version {sds.version}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Updated {new Date(sds.lastUpdated).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {sds.ghs.map((code) => {
                      const ghsConfig = GHS_LABELS[code];
                      if (!ghsConfig) return null;
                      const GHSIcon = ghsConfig.icon;
                      return (
                        <span key={code} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ghsConfig.color}`}>
                          <GHSIcon className="w-3 h-3 inline mr-0.5" />
                          {ghsConfig.label}
                        </span>
                      );
                    })}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Hazard Statements</p>
                      <div className="flex flex-wrap gap-1">
                        {sds.hazards.map((h) => (
                          <span key={h} className="px-2 py-0.5 rounded-md text-xs bg-red-50 text-red-700 font-medium">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">GHS Classification</p>
                      <p className="text-sm font-mono">{sds.ghs.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Emergency Contact</p>
                      <p className="text-sm font-mono font-bold">{sds.emergencyContact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">First Aid</p>
                      <p className="text-sm">See SDS Section 4</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Section 2</p>
                      <p className="text-xs font-medium">Hazard ID</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Section 5</p>
                      <p className="text-xs font-medium">Firefighting</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Section 6</p>
                      <p className="text-xs font-medium">Spill Response</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Section 8</p>
                      <p className="text-xs font-medium">PPE Required</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Full SDS
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
