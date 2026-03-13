"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  MapPin,
  Cylinder,
  GitBranch,
  Anchor,
  Gauge,
  ChevronRight,
  Edit3,
  Trash2,
  X,
} from "lucide-react";

interface TerminalData {
  id: string;
  name: string;
  code: string;
  location: string;
  description: string;
  tankCount: number;
  berthCount: number;
  pipelineCount: number;
  pumpCount: number;
  valveCount: number;
}

const SAMPLE_TERMINALS: TerminalData[] = [
  {
    id: "t1",
    name: "Singapore Chemical Hub",
    code: "SCH-01",
    location: "Jurong Island, Singapore",
    description: "Primary chemical storage and distribution terminal. 12 tanks, 3 berths, full pipeline network.",
    tankCount: 12,
    berthCount: 3,
    pipelineCount: 8,
    pumpCount: 6,
    valveCount: 24,
  },
  {
    id: "t2",
    name: "Rotterdam Euro Terminal",
    code: "RET-02",
    location: "Europoort, Rotterdam, Netherlands",
    description: "European distribution hub for bulk chemicals. Handles methanol, ethanol, and aromatics.",
    tankCount: 8,
    berthCount: 2,
    pipelineCount: 5,
    pumpCount: 4,
    valveCount: 16,
  },
  {
    id: "t3",
    name: "Houston Gulf Terminal",
    code: "HGT-03",
    location: "Houston Ship Channel, TX, USA",
    description: "Gulf Coast terminal specializing in petrochemical intermediates.",
    tankCount: 15,
    berthCount: 4,
    pipelineCount: 10,
    pumpCount: 8,
    valveCount: 32,
  },
];

export default function TerminalsPage() {
  const [terminals, setTerminals] = useState(SAMPLE_TERMINALS);
  const [showAdd, setShowAdd] = useState(false);
  const [newTerminal, setNewTerminal] = useState({ name: "", code: "", location: "", description: "" });

  const handleAdd = () => {
    if (!newTerminal.name || !newTerminal.code) return;
    const terminal: TerminalData = {
      id: `t${Date.now()}`,
      ...newTerminal,
      tankCount: 0,
      berthCount: 0,
      pipelineCount: 0,
      pumpCount: 0,
      valveCount: 0,
    };
    setTerminals([...terminals, terminal]);
    setNewTerminal({ name: "", code: "", location: "", description: "" });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setTerminals(terminals.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Terminal Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {terminals.length} terminal{terminals.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Terminal
        </button>
      </div>

      {/* Add terminal form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">New Terminal</h3>
            <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Terminal Name *</label>
              <input
                value={newTerminal.name}
                onChange={(e) => setNewTerminal({ ...newTerminal, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Singapore Chemical Hub"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Terminal Code *</label>
              <input
                value={newTerminal.code}
                onChange={(e) => setNewTerminal({ ...newTerminal, code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. SCH-01"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
              <input
                value={newTerminal.location}
                onChange={(e) => setNewTerminal({ ...newTerminal, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Jurong Island, Singapore"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
              <input
                value={newTerminal.description}
                onChange={(e) => setNewTerminal({ ...newTerminal, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Brief description..."
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newTerminal.name || !newTerminal.code}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Create Terminal
          </button>
        </div>
      )}

      {/* Terminal cards */}
      <div className="grid grid-cols-1 gap-4">
        {terminals.map((terminal) => (
          <Link
            key={terminal.id}
            href={`/terminals/${terminal.id}`}
            className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{terminal.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{terminal.code}</span>
                      {terminal.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {terminal.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              {terminal.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{terminal.description}</p>
              )}

              {/* Asset counts */}
              <div className="grid grid-cols-5 gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                  <Cylinder className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{terminal.tankCount}</p>
                    <p className="text-[10px] text-muted-foreground">Tanks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                  <Anchor className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{terminal.berthCount}</p>
                    <p className="text-[10px] text-muted-foreground">Berths</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                  <GitBranch className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{terminal.pipelineCount}</p>
                    <p className="text-[10px] text-muted-foreground">Pipelines</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                  <Gauge className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{terminal.pumpCount}</p>
                    <p className="text-[10px] text-muted-foreground">Pumps</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{terminal.valveCount}</p>
                    <p className="text-[10px] text-muted-foreground">Valves</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
