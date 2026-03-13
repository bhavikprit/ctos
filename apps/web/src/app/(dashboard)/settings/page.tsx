"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure terminal parameters, manage users, and system preferences
        </p>
      </div>
      <div className="bg-white rounded-xl border border-border p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Settings Panel</h3>
        <p className="text-sm text-muted-foreground mt-1">Terminal configuration coming soon</p>
      </div>
    </div>
  );
}
