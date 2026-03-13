"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileBarChart2,
  Download,
  Calendar,
  Filter,
  ArrowRightLeft,
  Ship,
  Cylinder,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";

const REPORTS = [
  {
    id: "transfer-summary",
    name: "Transfer Summary",
    description: "Overview of all transfers with volumes, durations, and variance data",
    icon: ArrowRightLeft,
    category: "Operations",
    lastRun: "2 hours ago",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "vessel-activity",
    name: "Vessel Activity",
    description: "Vessel call history with berth occupancy and turnaround times",
    icon: Ship,
    category: "Operations",
    lastRun: "Yesterday",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "tank-inventory",
    name: "Tank Inventory",
    description: "Current stock levels, product movements, and tank utilization rates",
    icon: Cylinder,
    category: "Inventory",
    lastRun: "3 hours ago",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "variance-report",
    name: "Variance Analysis",
    description: "Shore vs ship measurement discrepancies across all closed transfers",
    icon: TrendingUp,
    category: "Compliance",
    lastRun: "Yesterday",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "isgott-compliance",
    name: "ISGOTT Compliance",
    description: "Checklist completion rates, non-compliance items, and audit trail",
    icon: FileBarChart2,
    category: "Compliance",
    lastRun: "Last week",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    id: "throughput",
    name: "Throughput Report",
    description: "Terminal throughput volumes by product, period, and berth",
    icon: TrendingUp,
    category: "Performance",
    lastRun: "Today",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
];

const CATEGORIES = ["All", "Operations", "Inventory", "Compliance", "Performance"];

export default function ReportsPage() {
  const [category, setCategory] = useState("All");
  const [period, setPeriod] = useState("month");

  const filtered = category === "All"
    ? REPORTS
    : REPORTS.filter((r) => r.category === category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Generate and download operational reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last 12 months</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reports grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${report.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${report.color}`} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                  {report.category}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{report.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{report.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  Last run: {report.lastRun}
                </p>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Download CSV">
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                    Generate
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent generated reports */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recently Generated</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { name: "Transfer Summary - March 2026", format: "PDF", size: "1.2 MB", date: "2h ago" },
            { name: "Tank Inventory Report", format: "CSV", size: "342 KB", date: "3h ago" },
            { name: "Vessel Activity - Q1 2026", format: "PDF", size: "2.8 MB", date: "Yesterday" },
            { name: "Variance Analysis - February 2026", format: "XLSX", size: "856 KB", date: "3 days ago" },
          ].map((file, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <FileBarChart2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{file.format} · {file.size} · {file.date}</p>
                </div>
              </div>
              <button className="p-2 rounded-md hover:bg-muted transition-colors">
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
