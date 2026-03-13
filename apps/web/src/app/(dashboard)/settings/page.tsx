"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores";
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  Shield,
  Bell,
  Database,
  Globe,
  ChevronRight,
  User,
  Mail,
  Key,
  Palette,
  Clock,
} from "lucide-react";

const TABS = [
  { id: "terminal", label: "Terminal", icon: Building2 },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("terminal");
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure your terminal and application preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "terminal" && <TerminalSettings />}
          {activeTab === "users" && <UsersSettings />}
          {activeTab === "notifications" && <NotificationsSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
        </div>
      </div>
    </div>
  );
}

function TerminalSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-500" />
          Terminal Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Terminal Name</label>
            <input
              type="text"
              defaultValue="Jurong Island Chemical Terminal"
              className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Terminal Code</label>
              <input
                type="text"
                defaultValue="JICT"
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Timezone</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Asia/Singapore (UTC+8)</option>
                <option>Europe/London (UTC+0)</option>
                <option>America/Houston (UTC-6)</option>
                <option>Asia/Dubai (UTC+4)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Location</label>
            <input
              type="text"
              defaultValue="Jurong Island, Singapore"
              className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-border flex justify-end">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" />
          Operations Configuration
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Variance Tolerance (%)</label>
              <input
                type="number"
                step="0.1"
                defaultValue="0.5"
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Reference Temperature (°C)</label>
              <input
                type="number"
                defaultValue="15"
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tank HLA Threshold (%)</label>
              <input
                type="number"
                defaultValue="90"
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tank HHLA Threshold (%)</label>
              <input
                type="number"
                defaultValue="95"
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Transfer Number Format</label>
            <input
              type="text"
              defaultValue="TRF-{YEAR}-{SEQ:4}"
              className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">Use {"{YEAR}"}, {"{MONTH}"}, {"{SEQ:N}"} for auto-numbering</p>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-border flex justify-end">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersSettings() {
  const users = [
    { name: "Admin User", email: "admin@jict.com", role: "ADMIN", active: true },
    { name: "Sarah Chen", email: "sarah@jict.com", role: "TERMINAL_MANAGER", active: true },
    { name: "John Ops", email: "john@jict.com", role: "OPERATIONS_MANAGER", active: true },
    { name: "Mike Plan", email: "mike@jict.com", role: "PLANNER", active: true },
    { name: "Alex Field", email: "alex@jict.com", role: "FIELD_OPERATOR", active: true },
    { name: "View Only", email: "viewer@jict.com", role: "VIEWER", active: true },
  ];

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: "bg-red-50 text-red-700",
    TERMINAL_MANAGER: "bg-purple-50 text-purple-700",
    OPERATIONS_MANAGER: "bg-blue-50 text-blue-700",
    PLANNER: "bg-emerald-50 text-emerald-700",
    FIELD_OPERATOR: "bg-amber-50 text-amber-700",
    VIEWER: "bg-slate-50 text-slate-700",
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Users & Roles</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Manage user accounts and role assignments</p>
        </div>
        <button className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          + Add User
        </button>
      </div>
      <div className="divide-y divide-border">
        {users.map((u) => (
          <div key={u.email} className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || ""}`}>
                {u.role.replace(/_/g, " ")}
              </span>
              <div className={`w-2 h-2 rounded-full ${u.active ? "bg-emerald-500" : "bg-slate-300"}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsSettings() {
  const notifications = [
    { label: "Transfer started", channel: "email,app", enabled: true },
    { label: "Emergency stop triggered", channel: "email,app,sms", enabled: true },
    { label: "ISGOTT checklist completed", channel: "app", enabled: true },
    { label: "Variance exceeds tolerance", channel: "email,app", enabled: true },
    { label: "Tank HLA alarm", channel: "email,app,sms", enabled: true },
    { label: "Tank HHLA alarm", channel: "email,app,sms", enabled: true },
    { label: "Vessel arrival", channel: "app", enabled: false },
    { label: "Transfer completed", channel: "email,app", enabled: true },
  ];

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" />
          Notification Preferences
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Configure when and how you receive notifications</p>
      </div>
      <div className="divide-y divide-border">
        {notifications.map((n, i) => (
          <div key={i} className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">{n.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {n.channel.split(",").map((c) => c.trim().toUpperCase()).join(" · ")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={n.enabled} className="sr-only peer" />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-500" />
          Theme
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <button className="p-4 rounded-xl border-2 border-primary bg-primary/5 text-center">
            <div className="w-full h-8 bg-white rounded-lg border border-border mb-2" />
            <p className="text-xs font-medium text-foreground">Light</p>
          </button>
          <button className="p-4 rounded-xl border-2 border-border text-center hover:border-primary/50 transition-colors">
            <div className="w-full h-8 bg-slate-800 rounded-lg mb-2" />
            <p className="text-xs font-medium text-foreground">Dark</p>
          </button>
          <button className="p-4 rounded-xl border-2 border-border text-center hover:border-primary/50 transition-colors">
            <div className="w-full h-8 bg-gradient-to-r from-white to-slate-800 rounded-lg mb-2" />
            <p className="text-xs font-medium text-foreground">System</p>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Display Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Date Format</label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>DD/MM/YYYY HH:mm</option>
              <option>MM/DD/YYYY HH:mm</option>
              <option>YYYY-MM-DD HH:mm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Volume Unit</label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Cubic metres (m³)</option>
              <option>Barrels (bbl)</option>
              <option>Litres (L)</option>
              <option>Gallons (gal)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Temperature Unit</label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Celsius (°C)</option>
              <option>Fahrenheit (°F)</option>
            </select>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-border flex justify-end">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
