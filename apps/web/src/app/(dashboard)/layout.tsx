"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, useSidebarStore } from "@/stores";
import Link from "next/link";
import {
  LayoutDashboard,
  Ship,
  ArrowRightLeft,
  Cylinder,
  GitBranch,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Waves,
  User,
  FileBarChart2,
  Package,
  History,
  Anchor,
  ShieldCheck,
  Building2,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vessels", label: "Vessel Calls", icon: Ship },
  { href: "/transfers", label: "Transfers", icon: ArrowRightLeft },
  { href: "/tanks", label: "Tanks", icon: Cylinder },
  { href: "/berths", label: "Berths", icon: Anchor },
  { href: "/products", label: "Products", icon: Package },
  { href: "/safety", label: "Safety / SDS", icon: ShieldCheck },
  { href: "/terminals", label: "Terminals", icon: Building2 },
  { href: "/diagram", label: "Diagram", icon: GitBranch },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/activity", label: "Activity", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  TERMINAL_MANAGER: "Terminal Mgr",
  OPERATIONS_MANAGER: "Ops Manager",
  PLANNER: "Planner",
  FIELD_OPERATOR: "Field Operator",
  VIEWER: "Viewer",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isCollapsed, toggle } = useSidebarStore();

  useEffect(() => {
    // Hydrate user from localStorage
    if (!isAuthenticated) {
      const storedUser = localStorage.getItem("ctos_user");
      const storedToken = localStorage.getItem("ctos_token");
      if (storedUser && storedToken) {
        useAuthStore.getState().login(JSON.parse(storedUser), storedToken);
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-16" : "w-60"
        } bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 border-r border-white/5`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Waves className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-white tracking-tight">CTOS</h1>
              <p className="text-[10px] text-blue-300/50 font-medium tracking-wider uppercase">
                Chemical Terminal OS
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-blue-400" : ""}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="mx-2 mb-2 p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors flex items-center justify-center"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User section */}
        <div className={`border-t border-white/5 p-3 ${isCollapsed ? "px-2" : ""}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {ROLE_LABELS[user?.role || ""] || user?.role}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-foreground">
              Al Chem Terminal 1
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
              Operational
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
