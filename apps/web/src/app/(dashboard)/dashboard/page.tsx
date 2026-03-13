"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores";
import {
  ArrowRightLeft,
  Ship,
  Cylinder,
  Activity,
  AlertOctagon,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  Droplets,
  Gauge,
  Plus,
  FileText,
  Shield,
} from "lucide-react";

const STAT_CARDS = [
  {
    label: "Active Transfers",
    value: "3",
    change: "+1 today",
    trend: "up",
    icon: ArrowRightLeft,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: "/transfers",
  },
  {
    label: "Vessel Calls",
    value: "5",
    change: "2 berthed",
    trend: "neutral",
    icon: Ship,
    color: "text-purple-600",
    bg: "bg-purple-50",
    href: "/vessels",
  },
  {
    label: "Tanks Available",
    value: "8/12",
    change: "67% available",
    trend: "neutral",
    icon: Cylinder,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: "/tanks",
  },
  {
    label: "Active Alarms",
    value: "1",
    change: "1 HLA",
    trend: "down",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    href: "/tanks",
  },
];

const ACTIVE_TRANSFERS = [
  {
    id: "1",
    number: "TRF-2026-0001",
    type: "SHIP_TO_TANK",
    status: "IN_PROGRESS",
    vessel: "MT Chem Voyager",
    product: "Methanol",
    progress: 68,
    flowRate: 250,
    source: "Berth B1",
    dest: "Tank T103",
  },
  {
    id: "2",
    number: "TRF-2026-0002",
    type: "TANK_TO_SHIP",
    status: "PAUSED",
    vessel: "MT Global Spirit",
    product: "Ethanol",
    progress: 42,
    flowRate: 0,
    source: "Tank T201",
    dest: "Berth B2",
  },
  {
    id: "3",
    number: "TRF-2026-0003",
    type: "SHIP_TO_TANK",
    status: "AWAITING_CHECKLIST",
    vessel: "MT Pacific Trader",
    product: "Toluene",
    progress: 0,
    flowRate: 0,
    source: "Berth B3",
    dest: "Tank T105",
  },
];

const RECENT_EVENTS = [
  { type: "TRANSFER_STARTED", label: "Transfer TRF-2026-0001 started", time: "2h ago", icon: Play, color: "text-emerald-500" },
  { type: "CHECKLIST", label: "ISGOTT checklist signed — TRF-0001", time: "3h ago", icon: Shield, color: "text-blue-500" },
  { type: "FLOW_RATE", label: "Flow rate updated to 250 m³/h — TRF-0001", time: "3h ago", icon: Gauge, color: "text-purple-500" },
  { type: "TRANSFER_PAUSED", label: "Transfer TRF-2026-0002 paused", time: "5h ago", icon: Pause, color: "text-amber-500" },
  { type: "VESSEL_ARRIVED", label: "MT Pacific Trader berthed at B3", time: "8h ago", icon: Ship, color: "text-blue-500" },
  { type: "ULLAGE", label: "Ullage reading — Tank T103: 2,580 m³", time: "9h ago", icon: Droplets, color: "text-cyan-500" },
  { type: "TRANSFER_COMPLETED", label: "Transfer TRF-2026-0000 closed", time: "Yesterday", icon: CheckCircle2, color: "text-green-500" },
];

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-100" },
  PAUSED: { label: "Paused", color: "text-amber-700", bg: "bg-amber-100" },
  AWAITING_CHECKLIST: { label: "Awaiting Checklist", color: "text-purple-700", bg: "bg-purple-100" },
  READY: { label: "Ready", color: "text-emerald-700", bg: "bg-emerald-100" },
  COMPLETING: { label: "Completing", color: "text-teal-700", bg: "bg-teal-100" },
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Terminal overview — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vessels/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Ship className="w-4 h-4" />
            New Vessel Call
          </Link>
          <Link
            href="/transfers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Transfer
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-xs font-medium ${
                  stat.trend === "up" ? "text-emerald-600" : stat.trend === "down" ? "text-red-500" : "text-muted-foreground"
                }`}>
                  {stat.change}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main content — 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active transfers — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Active Transfers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{ACTIVE_TRANSFERS.length} transfers in progress</p>
            </div>
            <Link href="/transfers" className="text-xs text-primary font-medium hover:underline">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {ACTIVE_TRANSFERS.map((transfer) => {
              const statusStyle = STATUS_STYLES[transfer.status] || STATUS_STYLES.IN_PROGRESS;
              return (
                <Link
                  key={transfer.id}
                  href={`/transfers/${transfer.id}`}
                  className="px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors block"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      transfer.status === "IN_PROGRESS" ? "bg-blue-50" :
                      transfer.status === "PAUSED" ? "bg-amber-50" :
                      "bg-purple-50"
                    }`}>
                      {transfer.status === "IN_PROGRESS" ? (
                        <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                      ) : transfer.status === "PAUSED" ? (
                        <Pause className="w-5 h-5 text-amber-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{transfer.number}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {transfer.vessel} · {transfer.product} · {transfer.source} → {transfer.dest}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* Flow rate */}
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Flow Rate</p>
                      <p className="text-sm font-bold text-foreground">
                        {transfer.flowRate > 0 ? `${transfer.flowRate} m³/h` : "—"}
                      </p>
                    </div>
                    {/* Progress */}
                    <div className="w-24 hidden md:block">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-bold text-foreground">{transfer.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            transfer.status === "IN_PROGRESS" ? "bg-blue-500" :
                            transfer.status === "PAUSED" ? "bg-amber-500" :
                            "bg-purple-400"
                          }`}
                          style={{ width: `${transfer.progress}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Event timeline — 1/3 width */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Terminal-wide events</p>
          </div>
          <div className="p-4">
            <div className="space-y-0">
              {RECENT_EVENTS.map((event, idx) => {
                const Icon = event.icon;
                const isLast = idx === RECENT_EVENTS.length - 1;
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${event.color}`} />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-border min-h-[12px]" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium text-foreground leading-tight">{event.label}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{event.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row — Tank summary + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tank fill overview */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Tank Farm Overview</h3>
            <Link href="/tanks" className="text-xs text-primary font-medium hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const tankCode = `T${(i + 101).toString()}`;
              const fill = [68, 45, 82, 12, 95, 0, 55, 72, 30, 0, 88, 23][i];
              const isHigh = fill >= 90;
              return (
                <div key={i} className="text-center">
                  <div className="relative h-14 w-full bg-muted/30 rounded-md overflow-hidden border border-border">
                    <div
                      className={`absolute bottom-0 left-0 right-0 transition-all ${
                        isHigh ? "bg-red-400/60" : fill > 0 ? "bg-blue-400/60" : "bg-transparent"
                      }`}
                      style={{ height: `${fill}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-600">
                      {fill}%
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{tankCode}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/vessels/new" className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Ship className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">New Vessel Call</p>
                <p className="text-[10px] text-muted-foreground">Register arrival</p>
              </div>
            </Link>
            <Link href="/transfers/new" className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">New Transfer</p>
                <p className="text-[10px] text-muted-foreground">Setup operation</p>
              </div>
            </Link>
            <Link href="/diagram" className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Terminal Diagram</p>
                <p className="text-[10px] text-muted-foreground">Visual overview</p>
              </div>
            </Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Settings</p>
                <p className="text-[10px] text-muted-foreground">Configure terminal</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
