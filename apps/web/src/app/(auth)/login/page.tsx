"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import {
  Ship,
  Shield,
  ClipboardList,
  Wrench,
  Eye,
  Settings,
  Loader2,
  ChevronRight,
  Waves,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface UserCard {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

const ROLE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string; description: string }> = {
  ADMIN: {
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20 hover:border-red-500/40",
    label: "Admin",
    description: "Full system access and configuration",
  },
  TERMINAL_MANAGER: {
    icon: Settings,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
    label: "Terminal Manager",
    description: "Oversee all terminal operations and approvals",
  },
  OPERATIONS_MANAGER: {
    icon: ClipboardList,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
    label: "Operations Manager",
    description: "Monitor live transfers and manage operations",
  },
  PLANNER: {
    icon: Ship,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40",
    label: "Planner",
    description: "Plan vessel calls, parcels, and tank allocation",
  },
  FIELD_OPERATOR: {
    icon: Wrench,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
    label: "Field Operator",
    description: "Execute field tasks and record readings",
  },
  VIEWER: {
    icon: Eye,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40",
    label: "Viewer",
    description: "Read-only access to all terminal data",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/auth/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = async (userId: string) => {
    setLoggingIn(userId);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      login(data.user, data.token);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setLoggingIn(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-3xl" />
      </div>

      {/* Logo and header */}
      <div className="relative z-10 text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Waves className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-white tracking-tight">CTOS</h1>
            <p className="text-xs text-blue-300/60 font-medium tracking-widest uppercase">Chemical Terminal OS</p>
          </div>
        </div>
        <h2 className="text-xl text-slate-300 font-medium mt-2">Select your role to continue</h2>
        <p className="text-sm text-slate-500 mt-1">Choose a user profile to explore the system</p>
      </div>

      {/* User cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-slate-400 text-lg">No users found.</p>
            <p className="text-slate-500 text-sm mt-1">Run the seed script to create demo users.</p>
          </div>
        ) : (
          users.map((user) => {
            const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.VIEWER;
            const Icon = config.icon;
            const isActive = loggingIn === user.id;

            return (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                disabled={loggingIn !== null}
                className={`group relative flex flex-col p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 text-left ${config.bg} ${
                  isActive ? "scale-[0.98] opacity-80" : "hover:scale-[1.02] hover:shadow-lg"
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isActive ? (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  )}
                </div>
                <h3 className="text-white font-semibold text-base">{user.name}</h3>
                <p className={`text-sm font-medium ${config.color} mt-0.5`}>{config.label}</p>
                <p className="text-xs text-slate-500 mt-2">{config.description}</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">{user.email}</p>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-10 text-center">
        <p className="text-xs text-slate-600">
          CTOS v0.1.0 — Open Source Chemical Terminal Operating System
        </p>
      </div>
    </div>
  );
}
