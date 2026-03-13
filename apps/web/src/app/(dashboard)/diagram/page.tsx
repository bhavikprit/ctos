"use client";

import { GitBranch } from "lucide-react";

export default function DiagramPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Terminal Diagram</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive view of the terminal infrastructure, pipelines, and active transfers
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Diagram Engine</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            The React Flow-based terminal diagram will render here, showing tanks, berths,
            pipelines, valves, and pumps with live transfer states.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-3">Coming up next in the build order</p>
        </div>
      </div>
    </div>
  );
}
