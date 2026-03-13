"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Cylinder,
  Anchor,
  GitBranch,
  Gauge,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Settings2,
  Save,
} from "lucide-react";

// ─── Sample data (would come from API in production) ──────────────────
const SAMPLE_TERMINAL = {
  id: "t1",
  name: "Singapore Chemical Hub",
  code: "SCH-01",
  location: "Jurong Island, Singapore",
  description: "Primary chemical storage and distribution terminal. 12 tanks, 3 berths, full pipeline network.",
};

const SAMPLE_TANKS = [
  { id: "tk1", code: "T101", name: "Tank 101", capacityM3: 5000, currentLevelM3: 3200, status: "IN_USE", tankType: "Fixed Roof", heated: false, hlaM3: 4750, hhlaM3: 4900 },
  { id: "tk2", code: "T102", name: "Tank 102", capacityM3: 5000, currentLevelM3: 1800, status: "AVAILABLE", tankType: "Fixed Roof", heated: false, hlaM3: 4750, hhlaM3: 4900 },
  { id: "tk3", code: "T103", name: "Tank 103", capacityM3: 3000, currentLevelM3: 2580, status: "IN_USE", tankType: "Floating Roof", heated: false, hlaM3: 2850, hhlaM3: 2950 },
  { id: "tk4", code: "T104", name: "Tank 104", capacityM3: 3000, currentLevelM3: 0, status: "CLEANING", tankType: "Floating Roof", heated: false, hlaM3: 2850, hhlaM3: 2950 },
  { id: "tk5", code: "T105", name: "Tank 105", capacityM3: 8000, currentLevelM3: 7280, status: "IN_USE", tankType: "Fixed Roof", heated: true, hlaM3: 7600, hhlaM3: 7850 },
  { id: "tk6", code: "T106", name: "Tank 106", capacityM3: 8000, currentLevelM3: 4100, status: "IN_USE", tankType: "Fixed Roof", heated: true, hlaM3: 7600, hhlaM3: 7850 },
  { id: "tk7", code: "T107", name: "Tank 107", capacityM3: 2000, currentLevelM3: 0, status: "MAINTENANCE", tankType: "Fixed Roof", heated: false, hlaM3: 1900, hhlaM3: 1950 },
  { id: "tk8", code: "T108", name: "Tank 108", capacityM3: 2000, currentLevelM3: 1200, status: "AVAILABLE", tankType: "Fixed Roof", heated: false, hlaM3: 1900, hhlaM3: 1950 },
  { id: "tk9", code: "T109", name: "Tank 109", capacityM3: 10000, currentLevelM3: 6500, status: "IN_USE", tankType: "Floating Roof", heated: false, hlaM3: 9500, hhlaM3: 9800 },
  { id: "tk10", code: "T110", name: "Tank 110", capacityM3: 10000, currentLevelM3: 2200, status: "ALLOCATED", tankType: "Floating Roof", heated: false, hlaM3: 9500, hhlaM3: 9800 },
  { id: "tk11", code: "T111", name: "Tank 111", capacityM3: 4000, currentLevelM3: 3600, status: "IN_USE", tankType: "Fixed Roof", heated: true, hlaM3: 3800, hhlaM3: 3950 },
  { id: "tk12", code: "T112", name: "Tank 112", capacityM3: 4000, currentLevelM3: 0, status: "OUT_OF_SERVICE", tankType: "Fixed Roof", heated: false, hlaM3: 3800, hhlaM3: 3950 },
];

const SAMPLE_PIPELINES = [
  { id: "pl1", code: "PL-01", name: "Main B1 to Tank Farm", diameterMm: 300, lengthM: 850, maxFlowRate: 500, segments: 4 },
  { id: "pl2", code: "PL-02", name: "B2 to East Tank Farm", diameterMm: 250, lengthM: 620, maxFlowRate: 400, segments: 3 },
  { id: "pl3", code: "PL-03", name: "B3 West Pipeline", diameterMm: 350, lengthM: 1100, maxFlowRate: 600, segments: 5 },
  { id: "pl4", code: "PL-04", name: "Cross-over North", diameterMm: 200, lengthM: 300, maxFlowRate: 300, segments: 2 },
  { id: "pl5", code: "PL-05", name: "Cross-over South", diameterMm: 200, lengthM: 280, maxFlowRate: 300, segments: 2 },
  { id: "pl6", code: "PL-06", name: "Truck Loading Arm", diameterMm: 150, lengthM: 50, maxFlowRate: 150, segments: 1 },
  { id: "pl7", code: "PL-07", name: "T109-T110 Interconnect", diameterMm: 250, lengthM: 120, maxFlowRate: 400, segments: 1 },
  { id: "pl8", code: "PL-08", name: "B1 Emergency Relief", diameterMm: 100, lengthM: 200, maxFlowRate: 100, segments: 2 },
];

const SAMPLE_BERTHS = [
  { id: "b1", code: "B1", name: "Berth 1 — Main Chemical Jetty", maxLOA: 200, maxDraft: 12.5 },
  { id: "b2", code: "B2", name: "Berth 2 — East Jetty", maxLOA: 180, maxDraft: 11.0 },
  { id: "b3", code: "B3", name: "Berth 3 — West Jetty", maxLOA: 220, maxDraft: 14.0 },
];

const SAMPLE_PUMPS = [
  { id: "p1", code: "P01", name: "Main Pump 1", status: "STOPPED", maxFlowRate: 500 },
  { id: "p2", code: "P02", name: "Main Pump 2", status: "RUNNING", maxFlowRate: 500 },
  { id: "p3", code: "P03", name: "Transfer Pump East", status: "STOPPED", maxFlowRate: 350 },
  { id: "p4", code: "P04", name: "Transfer Pump West", status: "RUNNING", maxFlowRate: 350 },
  { id: "p5", code: "P05", name: "Loading Pump", status: "STOPPED", maxFlowRate: 200 },
  { id: "p6", code: "P06", name: "Emergency Pump", status: "STOPPED", maxFlowRate: 600 },
];

const SAMPLE_VALVES = [
  { id: "v1", code: "V01", name: "B1 Inlet Valve", state: "OPEN" },
  { id: "v2", code: "V02", name: "B1 Outlet Valve", state: "CLOSED" },
  { id: "v3", code: "V03", name: "B2 Inlet Valve", state: "CLOSED" },
  { id: "v4", code: "V04", name: "B2 Outlet Valve", state: "OPEN" },
  { id: "v5", code: "V05", name: "T101 Inlet", state: "OPEN" },
  { id: "v6", code: "V06", name: "T101 Outlet", state: "CLOSED" },
  { id: "v7", code: "V07", name: "T103 Inlet", state: "OPEN" },
  { id: "v8", code: "V08", name: "T103 Outlet", state: "CLOSED" },
  { id: "v9", code: "V09", name: "Cross-over North", state: "CLOSED" },
  { id: "v10", code: "V10", name: "Cross-over South", state: "CLOSED" },
  { id: "v11", code: "V11", name: "Emergency Shutoff B1", state: "OPEN" },
  { id: "v12", code: "V12", name: "Emergency Shutoff B2", state: "OPEN" },
];

const TABS = [
  { key: "overview", label: "Overview", icon: Building2 },
  { key: "tanks", label: "Tanks", icon: Cylinder },
  { key: "pipelines", label: "Pipelines", icon: GitBranch },
  { key: "berths", label: "Berths", icon: Anchor },
  { key: "pumps", label: "Pumps & Valves", icon: Gauge },
];

const TANK_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: "Available", color: "text-emerald-600", bg: "bg-emerald-100" },
  ALLOCATED: { label: "Allocated", color: "text-blue-600", bg: "bg-blue-100" },
  IN_USE: { label: "In Use", color: "text-purple-600", bg: "bg-purple-100" },
  CLEANING: { label: "Cleaning", color: "text-amber-600", bg: "bg-amber-100" },
  MAINTENANCE: { label: "Maintenance", color: "text-orange-600", bg: "bg-orange-100" },
  OUT_OF_SERVICE: { label: "Out of Service", color: "text-red-600", bg: "bg-red-100" },
};

export default function TerminalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [terminal, setTerminal] = useState(SAMPLE_TERMINAL);
  const [tanks, setTanks] = useState(SAMPLE_TANKS);
  const [pipelines, setPipelines] = useState(SAMPLE_PIPELINES);
  const [berths, setBerths] = useState(SAMPLE_BERTHS);
  const [pumps, setPumps] = useState(SAMPLE_PUMPS);
  const [valves, setValves] = useState(SAMPLE_VALVES);
  const [editing, setEditing] = useState(false);

  // ─── Add states ──────────────────────────────────────────────
  const [showAddTank, setShowAddTank] = useState(false);
  const [newTank, setNewTank] = useState({ code: "", name: "", capacityM3: "", tankType: "Fixed Roof", heated: false, hlaM3: "", hhlaM3: "" });
  const [showAddPipeline, setShowAddPipeline] = useState(false);
  const [newPipeline, setNewPipeline] = useState({ code: "", name: "", diameterMm: "", lengthM: "", maxFlowRate: "" });
  const [showAddBerth, setShowAddBerth] = useState(false);
  const [newBerth, setNewBerth] = useState({ code: "", name: "", maxLOA: "", maxDraft: "" });
  const [showAddPump, setShowAddPump] = useState(false);
  const [newPump, setNewPump] = useState({ code: "", name: "", maxFlowRate: "" });
  const [showAddValve, setShowAddValve] = useState(false);
  const [newValve, setNewValve] = useState({ code: "", name: "" });

  // ─── Add handlers ──────────────────────────────────────────
  const addTank = () => {
    if (!newTank.code || !newTank.name) return;
    setTanks([...tanks, {
      id: `tk${Date.now()}`, code: newTank.code, name: newTank.name,
      capacityM3: Number(newTank.capacityM3) || 0, currentLevelM3: 0, status: "AVAILABLE",
      tankType: newTank.tankType, heated: newTank.heated,
      hlaM3: Number(newTank.hlaM3) || 0, hhlaM3: Number(newTank.hhlaM3) || 0,
    }]);
    setNewTank({ code: "", name: "", capacityM3: "", tankType: "Fixed Roof", heated: false, hlaM3: "", hhlaM3: "" });
    setShowAddTank(false);
  };

  const addPipeline = () => {
    if (!newPipeline.code || !newPipeline.name) return;
    setPipelines([...pipelines, {
      id: `pl${Date.now()}`, code: newPipeline.code, name: newPipeline.name,
      diameterMm: Number(newPipeline.diameterMm) || 0, lengthM: Number(newPipeline.lengthM) || 0,
      maxFlowRate: Number(newPipeline.maxFlowRate) || 0, segments: 0,
    }]);
    setNewPipeline({ code: "", name: "", diameterMm: "", lengthM: "", maxFlowRate: "" });
    setShowAddPipeline(false);
  };

  const addBerth = () => {
    if (!newBerth.code || !newBerth.name) return;
    setBerths([...berths, {
      id: `b${Date.now()}`, code: newBerth.code, name: newBerth.name,
      maxLOA: Number(newBerth.maxLOA) || 0, maxDraft: Number(newBerth.maxDraft) || 0,
    }]);
    setNewBerth({ code: "", name: "", maxLOA: "", maxDraft: "" });
    setShowAddBerth(false);
  };

  const addPump = () => {
    if (!newPump.code || !newPump.name) return;
    setPumps([...pumps, {
      id: `p${Date.now()}`, code: newPump.code, name: newPump.name,
      status: "STOPPED", maxFlowRate: Number(newPump.maxFlowRate) || 0,
    }]);
    setNewPump({ code: "", name: "", maxFlowRate: "" });
    setShowAddPump(false);
  };

  const addValve = () => {
    if (!newValve.code || !newValve.name) return;
    setValves([...valves, {
      id: `v${Date.now()}`, code: newValve.code, name: newValve.name, state: "CLOSED",
    }]);
    setNewValve({ code: "", name: "" });
    setShowAddValve(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/terminals")} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{terminal.name}</h1>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{terminal.code}</span>
          </div>
          {terminal.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {terminal.location}
            </p>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = tab.key === "tanks" ? tanks.length :
              tab.key === "pipelines" ? pipelines.length :
              tab.key === "berths" ? berths.length :
              tab.key === "pumps" ? pumps.length + valves.length : null;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {/* ─── OVERVIEW TAB ──────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Terminal info card */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Terminal Information</h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-input rounded-lg hover:bg-muted transition-colors"
                >
                  {editing ? <><Check className="w-3.5 h-3.5" /> Save</> : <><Edit3 className="w-3.5 h-3.5" /> Edit</>}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                  {editing ? (
                    <input value={terminal.name} onChange={(e) => setTerminal({ ...terminal, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input text-sm" />
                  ) : (
                    <p className="text-sm text-foreground">{terminal.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Code</label>
                  {editing ? (
                    <input value={terminal.code} onChange={(e) => setTerminal({ ...terminal, code: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input text-sm" />
                  ) : (
                    <p className="text-sm font-mono text-foreground">{terminal.code}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
                  {editing ? (
                    <input value={terminal.location} onChange={(e) => setTerminal({ ...terminal, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input text-sm" />
                  ) : (
                    <p className="text-sm text-foreground">{terminal.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  {editing ? (
                    <textarea value={terminal.description} onChange={(e) => setTerminal({ ...terminal, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input text-sm" rows={2} />
                  ) : (
                    <p className="text-sm text-foreground">{terminal.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Asset summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Tanks", count: tanks.length, icon: Cylinder, color: "from-emerald-500 to-teal-600" },
                { label: "Berths", count: berths.length, icon: Anchor, color: "from-blue-500 to-blue-600" },
                { label: "Pipelines", count: pipelines.length, icon: GitBranch, color: "from-purple-500 to-purple-600" },
                { label: "Pumps", count: pumps.length, icon: Gauge, color: "from-orange-500 to-orange-600" },
                { label: "Valves", count: valves.length, icon: Settings2, color: "from-amber-500 to-amber-600" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-white rounded-xl border border-border p-4 text-center">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{item.count}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Capacity utilization */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Capacity Utilization</h3>
              <div className="space-y-3">
                {tanks.slice(0, 6).map((tank) => {
                  const pct = Math.round((tank.currentLevelM3 / tank.capacityM3) * 100);
                  return (
                    <div key={tank.id} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-12">{tank.code}</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-16 text-right">{pct}%</span>
                      <span className="text-xs text-muted-foreground w-24 text-right">{tank.currentLevelM3.toLocaleString()} m³</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── TANKS TAB ──────────────────────────────────────────── */}
        {activeTab === "tanks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{tanks.length} tanks configured</p>
              <button
                onClick={() => setShowAddTank(!showAddTank)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tank
              </button>
            </div>

            {showAddTank && (
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">New Tank</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <input value={newTank.code} onChange={(e) => setNewTank({ ...newTank, code: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Code (e.g. T113)" />
                  <input value={newTank.name} onChange={(e) => setNewTank({ ...newTank, name: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Name" />
                  <input value={newTank.capacityM3} onChange={(e) => setNewTank({ ...newTank, capacityM3: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Capacity (m³)" type="number" />
                  <select value={newTank.tankType} onChange={(e) => setNewTank({ ...newTank, tankType: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs">
                    <option>Fixed Roof</option>
                    <option>Floating Roof</option>
                    <option>Horizontal</option>
                    <option>Pressurized</option>
                  </select>
                  <input value={newTank.hlaM3} onChange={(e) => setNewTank({ ...newTank, hlaM3: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="HLA (m³)" type="number" />
                  <input value={newTank.hhlaM3} onChange={(e) => setNewTank({ ...newTank, hhlaM3: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="HHLA (m³)" type="number" />
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={newTank.heated} onChange={(e) => setNewTank({ ...newTank, heated: e.target.checked })} />
                    Heated
                  </label>
                  <div className="flex gap-2">
                    <button onClick={addTank} className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Add</button>
                    <button onClick={() => setShowAddTank(false)} className="px-3 py-2 border border-input rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Capacity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Fill %</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">HLA / HHLA</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Heated</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tanks.map((tank) => {
                    const pct = Math.round((tank.currentLevelM3 / tank.capacityM3) * 100);
                    const statusCfg = TANK_STATUS_CONFIG[tank.status] || TANK_STATUS_CONFIG.AVAILABLE;
                    return (
                      <tr key={tank.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold">{tank.code}</p>
                            <p className="text-xs text-muted-foreground">{tank.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs">{tank.tankType}</td>
                        <td className="px-4 py-3 text-xs font-mono">{tank.capacityM3.toLocaleString()} m³</td>
                        <td className="px-4 py-3 text-xs font-mono">{tank.currentLevelM3.toLocaleString()} m³</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-medium">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono">{tank.hlaM3} / {tank.hhlaM3}</td>
                        <td className="px-4 py-3 text-center">{tank.heated ? "🔥" : "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setTanks(tanks.filter((t) => t.id !== tank.id))} className="p-1.5 rounded-md hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── PIPELINES TAB ──────────────────────────────────────── */}
        {activeTab === "pipelines" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{pipelines.length} pipelines configured</p>
              <button
                onClick={() => setShowAddPipeline(!showAddPipeline)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Pipeline
              </button>
            </div>

            {showAddPipeline && (
              <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">New Pipeline</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <input value={newPipeline.code} onChange={(e) => setNewPipeline({ ...newPipeline, code: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Code (e.g. PL-09)" />
                  <input value={newPipeline.name} onChange={(e) => setNewPipeline({ ...newPipeline, name: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Name" />
                  <input value={newPipeline.diameterMm} onChange={(e) => setNewPipeline({ ...newPipeline, diameterMm: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Diameter (mm)" type="number" />
                  <input value={newPipeline.lengthM} onChange={(e) => setNewPipeline({ ...newPipeline, lengthM: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Length (m)" type="number" />
                  <input value={newPipeline.maxFlowRate} onChange={(e) => setNewPipeline({ ...newPipeline, maxFlowRate: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Max flow (m³/h)" type="number" />
                  <div className="flex gap-2">
                    <button onClick={addPipeline} className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Add</button>
                    <button onClick={() => setShowAddPipeline(false)} className="px-3 py-2 border border-input rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Pipeline</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Diameter</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Length</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Max Flow</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Segments</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pipelines.map((pl) => (
                    <tr key={pl.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-sm font-semibold">{pl.code}</p>
                            <p className="text-xs text-muted-foreground">{pl.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">{pl.diameterMm} mm</td>
                      <td className="px-4 py-3 text-xs font-mono">{pl.lengthM} m</td>
                      <td className="px-4 py-3 text-xs font-mono">{pl.maxFlowRate} m³/h</td>
                      <td className="px-4 py-3 text-xs font-medium">{pl.segments}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setPipelines(pipelines.filter((p) => p.id !== pl.id))} className="p-1.5 rounded-md hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── BERTHS TAB ──────────────────────────────────────────── */}
        {activeTab === "berths" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{berths.length} berths configured</p>
              <button
                onClick={() => setShowAddBerth(!showAddBerth)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Berth
              </button>
            </div>

            {showAddBerth && (
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">New Berth</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <input value={newBerth.code} onChange={(e) => setNewBerth({ ...newBerth, code: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Code (e.g. B4)" />
                  <input value={newBerth.name} onChange={(e) => setNewBerth({ ...newBerth, name: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Name" />
                  <input value={newBerth.maxLOA} onChange={(e) => setNewBerth({ ...newBerth, maxLOA: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Max LOA (m)" type="number" />
                  <input value={newBerth.maxDraft} onChange={(e) => setNewBerth({ ...newBerth, maxDraft: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Max Draft (m)" type="number" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addBerth} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Add</button>
                  <button onClick={() => setShowAddBerth(false)} className="px-3 py-2 border border-input rounded-lg text-xs">Cancel</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {berths.map((berth) => (
                <div key={berth.id} className="bg-white rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Anchor className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{berth.code}</p>
                        <p className="text-xs text-muted-foreground">{berth.name}</p>
                      </div>
                    </div>
                    <button onClick={() => setBerths(berths.filter((b) => b.id !== berth.id))} className="p-1.5 rounded-md hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Max LOA</p>
                      <p className="text-sm font-bold">{berth.maxLOA}m</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Max Draft</p>
                      <p className="text-sm font-bold">{berth.maxDraft}m</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── PUMPS & VALVES TAB ──────────────────────────────────── */}
        {activeTab === "pumps" && (
          <div className="space-y-6">
            {/* Pumps section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Pumps ({pumps.length})</h3>
                <button
                  onClick={() => setShowAddPump(!showAddPump)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Pump
                </button>
              </div>

              {showAddPump && (
                <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <input value={newPump.code} onChange={(e) => setNewPump({ ...newPump, code: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Code (e.g. P07)" />
                    <input value={newPump.name} onChange={(e) => setNewPump({ ...newPump, name: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Name" />
                    <input value={newPump.maxFlowRate} onChange={(e) => setNewPump({ ...newPump, maxFlowRate: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Max flow (m³/h)" type="number" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addPump} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Add</button>
                    <button onClick={() => setShowAddPump(false)} className="px-3 py-2 border border-input rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {pumps.map((pump) => (
                  <div key={pump.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${pump.status === "RUNNING" ? "bg-emerald-50" : pump.status === "FAULT" ? "bg-red-50" : "bg-muted"}`}>
                        <Gauge className={`w-4 h-4 ${pump.status === "RUNNING" ? "text-emerald-500 animate-spin" : pump.status === "FAULT" ? "text-red-500" : "text-muted-foreground"}`} style={pump.status === "RUNNING" ? { animationDuration: "3s" } : {}} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{pump.code} — {pump.name}</p>
                        <p className="text-xs text-muted-foreground">{pump.maxFlowRate} m³/h max</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        pump.status === "RUNNING" ? "bg-emerald-100 text-emerald-700" :
                        pump.status === "FAULT" ? "bg-red-100 text-red-700" :
                        "bg-muted text-muted-foreground"
                      }`}>{pump.status}</span>
                      <button onClick={() => setPumps(pumps.filter((p) => p.id !== pump.id))} className="p-1 rounded-md hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Valves section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Valves ({valves.length})</h3>
                <button
                  onClick={() => setShowAddValve(!showAddValve)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Valve
                </button>
              </div>

              {showAddValve && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <input value={newValve.code} onChange={(e) => setNewValve({ ...newValve, code: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Code (e.g. V13)" />
                    <input value={newValve.name} onChange={(e) => setNewValve({ ...newValve, name: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-input text-xs" placeholder="Name" />
                    <div className="flex gap-2">
                      <button onClick={addValve} className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Add</button>
                      <button onClick={() => setShowAddValve(false)} className="px-3 py-2 border border-input rounded-lg text-xs">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {valves.map((valve) => (
                  <div key={valve.id} className="bg-white rounded-xl border border-border p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${valve.state === "OPEN" ? "bg-emerald-500" : valve.state === "LOCKED" ? "bg-red-500" : "bg-muted-foreground"}`} />
                      <div>
                        <p className="text-xs font-semibold">{valve.code}</p>
                        <p className="text-[10px] text-muted-foreground">{valve.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-semibold ${valve.state === "OPEN" ? "text-emerald-600" : valve.state === "LOCKED" ? "text-red-600" : "text-muted-foreground"}`}>
                        {valve.state}
                      </span>
                      <button onClick={() => setValves(valves.filter((v) => v.id !== valve.id))} className="p-1 rounded-md hover:bg-red-50 transition-colors">
                        <Trash2 className="w-2.5 h-2.5 text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
