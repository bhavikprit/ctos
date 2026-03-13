"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  Ship,
  Plus,
  Search,
  Calendar,
  Anchor,
  ChevronRight,
  Filter,
} from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  SCHEDULED: { bg: "bg-slate-50", text: "text-slate-600" },
  ARRIVED: { bg: "bg-blue-50", text: "text-blue-600" },
  BERTHED: { bg: "bg-purple-50", text: "text-purple-600" },
  OPERATIONS: { bg: "bg-emerald-50", text: "text-emerald-600" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-600" },
  DEPARTED: { bg: "bg-slate-50", text: "text-slate-500" },
};

export default function VesselCallsPage() {
  const [vesselCalls, setVesselCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadVesselCalls();
  }, []);

  async function loadVesselCalls() {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const result = await api.getVesselCalls(params);
      setVesselCalls(result.data);
    } catch (err) {
      console.error("Failed to load vessel calls:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vessel Calls</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage vessel arrivals, parcels, and berth assignments
          </p>
        </div>
        <Link
          href="/vessels/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Vessel Call
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vessels by name or IMO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadVesselCalls()}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Vessel call list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-muted-foreground">Loading...</div>
        ) : vesselCalls.length === 0 ? (
          <div className="p-16 text-center">
            <Ship className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No vessel calls found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Create your first vessel call to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {vesselCalls.map((vc) => {
              const statusStyle = STATUS_STYLES[vc.status] || STATUS_STYLES.SCHEDULED;
              return (
                <Link
                  key={vc.id}
                  href={`/vessels/${vc.id}`}
                  className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Ship className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {vc.vesselName}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {vc.imoNumber && (
                          <span className="text-xs text-muted-foreground">IMO {vc.imoNumber}</span>
                        )}
                        {vc.berth && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Anchor className="w-3 h-3" />
                            {vc.berth.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          ETA: {new Date(vc.eta).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {vc.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {vc._count?.parcels || 0} parcels
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
