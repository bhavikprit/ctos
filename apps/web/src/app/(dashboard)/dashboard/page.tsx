"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import {
  Ship,
  ArrowRightLeft,
  Cylinder,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Activity,
  Droplets,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface DashboardStats {
  activeTransfers: number;
  vesselCalls: number;
  tanksInUse: number;
  alerts: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    activeTransfers: 1,
    vesselCalls: 2,
    tanksInUse: 8,
    alerts: 3,
  });

  const STAT_CARDS = [
    {
      title: "Active Transfers",
      value: stats.activeTransfers,
      icon: ArrowRightLeft,
      color: "text-blue-500",
      bg: "bg-blue-50",
      change: "+0 today",
    },
    {
      title: "Vessel Calls",
      value: stats.vesselCalls,
      icon: Ship,
      color: "text-purple-500",
      bg: "bg-purple-50",
      change: "1 at berth",
    },
    {
      title: "Tanks In Use",
      value: stats.tanksInUse,
      icon: Cylinder,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      change: "of 12 total",
    },
    {
      title: "Alerts",
      value: stats.alerts,
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50",
      change: "2 warnings",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening at your terminal today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl border border-border p-5 flex items-start justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.bg} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Transfer panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active transfer */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Active Transfers</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
              1 in progress
            </span>
          </div>
          <div className="divide-y divide-border">
            {/* Sample active transfer */}
            <div className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">TRF-2026-0001</p>
                  <p className="text-xs text-muted-foreground">
                    Ship → Tank · MT Chem Voyager → T103 · Methanol
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="w-3 h-3" />
                    250 m³/h
                  </div>
                  <p className="text-xs text-emerald-600 mt-0.5">1,000 / 3,000 m³</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                  In Progress
                </span>
              </div>
            </div>
            {/* Completed transfer */}
            <div className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">TRF-2026-0002</p>
                  <p className="text-xs text-muted-foreground">
                    Tank → Truck · T102 → Truck Bay 1 · Methanol
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">29.8 / 30 m³</p>
                  <p className="text-xs text-muted-foreground mt-0.5">2 days ago</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { time: "2 min ago", text: "Flow rate changed to 250 m³/h", type: "info" },
              { time: "15 min ago", text: "Ullage reading recorded for T103", type: "info" },
              { time: "1 hour ago", text: "Ship figure received from vessel", type: "info" },
              { time: "2 hours ago", text: "Variance alert: 0.2% within tolerance", type: "warning" },
              { time: "4 hours ago", text: "Transfer TRF-2026-0001 started", type: "success" },
              { time: "6 hours ago", text: "ISGOTT checklist completed", type: "success" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                  activity.type === "warning" ? "bg-amber-400" :
                  activity.type === "success" ? "bg-emerald-400" :
                  "bg-blue-400"
                }`} />
                <div>
                  <p className="text-sm text-foreground">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "New Vessel Call", href: "/vessels/new", icon: Ship },
            { label: "View Transfers", href: "/transfers", icon: ArrowRightLeft },
            { label: "Tank Overview", href: "/tanks", icon: Cylinder },
            { label: "Terminal Diagram", href: "/diagram", icon: TrendingUp },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted transition-colors text-sm font-medium text-foreground"
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                {action.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
