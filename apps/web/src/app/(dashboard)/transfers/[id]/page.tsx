"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Activity,
  Droplets,
  Ship,
  Cylinder,
  FileText,
  MessageSquare,
  ChevronRight,
  Gauge,
  ArrowRightLeft,
  AlertTriangle,
  Shield,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PLANNED: { label: "Planned", color: "text-slate-600", bg: "bg-slate-50" },
  AWAITING_CHECKLIST: { label: "Awaiting Checklist", color: "text-amber-600", bg: "bg-amber-50" },
  READY: { label: "Ready", color: "text-emerald-600", bg: "bg-emerald-50" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50" },
  PAUSED: { label: "Paused", color: "text-amber-600", bg: "bg-amber-50" },
  COMPLETING: { label: "Completing", color: "text-teal-600", bg: "bg-teal-50" },
  PENDING_CLOSURE: { label: "Pending Closure", color: "text-cyan-600", bg: "bg-cyan-50" },
  COMPLETED: { label: "Completed", color: "text-green-600", bg: "bg-green-50" },
  TERMINATED: { label: "Terminated", color: "text-red-600", bg: "bg-red-50" },
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ["AWAITING_CHECKLIST"],
  AWAITING_CHECKLIST: ["READY"],
  READY: ["IN_PROGRESS"],
  IN_PROGRESS: ["PAUSED", "COMPLETING"],
  PAUSED: ["IN_PROGRESS", "TERMINATED"],
  COMPLETING: ["PENDING_CLOSURE"],
  PENDING_CLOSURE: ["COMPLETED"],
  COMPLETED: [],
  TERMINATED: [],
};

const TRANSITION_LABELS: Record<string, { label: string; icon: any; variant: string }> = {
  AWAITING_CHECKLIST: { label: "Send for Checklist", icon: FileText, variant: "primary" },
  READY: { label: "Mark Ready", icon: CheckCircle2, variant: "success" },
  IN_PROGRESS: { label: "Start Transfer", icon: Play, variant: "success" },
  PAUSED: { label: "Pause", icon: Pause, variant: "warning" },
  COMPLETING: { label: "Begin Completion", icon: Droplets, variant: "primary" },
  PENDING_CLOSURE: { label: "Submit for Closure", icon: FileText, variant: "primary" },
  COMPLETED: { label: "Close Transfer", icon: CheckCircle2, variant: "success" },
  TERMINATED: { label: "Terminate", icon: XCircle, variant: "danger" },
};

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const EVENT_ICONS: Record<string, any> = {
  TRANSFER_CREATED: FileText,
  TRANSFER_STARTED: Play,
  TRANSFER_PAUSED: Pause,
  TRANSFER_RESUMED: Play,
  TRANSFER_COMPLETED: CheckCircle2,
  TRANSFER_TERMINATED: XCircle,
  FLOW_RATE_CHANGE: Gauge,
  ULLAGE_READING: Droplets,
  SHIP_FIGURE_RECORDED: Ship,
  ALARM_TRIGGERED: AlertTriangle,
  EMERGENCY_STOP: AlertOctagon,
  CHECKLIST_COMPLETED: Shield,
  ROUTE_CONFIRMED: ArrowRightLeft,
  COMMUNICATION: MessageSquare,
};

export default function TransferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transfer, setTransfer] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [showFlowRate, setShowFlowRate] = useState(false);
  const [flowRate, setFlowRate] = useState("");
  const [showUllage, setShowUllage] = useState(false);
  const [ullageData, setUllageData] = useState({ tankCode: "", level: "", type: "CURRENT" });
  const [showComm, setShowComm] = useState(false);
  const [commData, setCommData] = useState({ direction: "OUTGOING", channel: "VHF", message: "" });

  const loadData = useCallback(async () => {
    try {
      const [tData, eData] = await Promise.all([
        api.getTransfer(params.id as string),
        api.getTransferEvents(params.id as string),
      ]);
      setTransfer(tData);
      setEvents(eData);
    } catch (err) {
      console.error("Failed to load transfer:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) loadData();
  }, [params.id, loadData]);

  async function handleTransition(newStatus: string) {
    setActionLoading(true);
    try {
      await api.updateTransferStatus(params.id as string, newStatus);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEmergencyStop() {
    if (!confirm("⚠️ EMERGENCY STOP — This will immediately halt the transfer. Continue?")) return;
    setActionLoading(true);
    try {
      await api.emergencyStop(params.id as string, "Emergency stop initiated by operator");
      loadData();
    } catch (err: any) {
      alert(err.message || "Emergency stop failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFlowRate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.recordFlowRate(params.id as string, Number(flowRate));
      setShowFlowRate(false);
      setFlowRate("");
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUllage(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.recordUllage(params.id as string, {
        tankCode: ullageData.tankCode,
        levelM3: Number(ullageData.level),
        readingType: ullageData.type,
      });
      setShowUllage(false);
      setUllageData({ tankCode: "", level: "", type: "CURRENT" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleComm(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.addCommunication(params.id as string, commData);
      setShowComm(false);
      setCommData({ direction: "OUTGOING", channel: "VHF", message: "" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  if (!transfer) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Transfer not found</p>
        <Link href="/transfers" className="text-primary text-sm mt-2 inline-block">← Back to transfers</Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[transfer.status] || STATUS_CONFIG.PLANNED;
  const nextStatuses = VALID_TRANSITIONS[transfer.status] || [];
  const isActive = transfer.status === "IN_PROGRESS";
  const volumeProgress = transfer.plannedVolume > 0
    ? Math.round(((transfer.actualVolume || 0) / transfer.plannedVolume) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{transfer.transferNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {transfer.type?.replace(/_/g, " ")}
              {transfer.parcel?.product?.name && ` · ${transfer.parcel.product.name}`}
              {transfer.parcel?.vesselCall?.vesselName && ` · ${transfer.parcel.vesselCall.vesselName}`}
            </p>
          </div>
        </div>

        {/* Emergency Stop */}
        {isActive && (
          <button
            onClick={handleEmergencyStop}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25 animate-pulse hover:animate-none"
          >
            <AlertOctagon className="w-5 h-5" />
            EMERGENCY STOP
          </button>
        )}
      </div>

      {/* State transition controls */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Actions</p>
          <div className="flex flex-wrap gap-3">
            {nextStatuses.map((status) => {
              const config = TRANSITION_LABELS[status];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <button
                  key={status}
                  onClick={() => handleTransition(status)}
                  disabled={actionLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${VARIANT_CLASSES[config.variant]} disabled:opacity-50`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-page navigation */}
      <div className="bg-white rounded-xl border border-border p-4">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Documents & Compliance</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Link
            href={`/transfers/${params.id}/diagram`}
            className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Diagram</p>
              <p className="text-xs text-muted-foreground">Flow Visualization</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <Link
            href={`/transfers/${params.id}/isgott`}
            className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">ISGOTT Checklist</p>
              <p className="text-xs text-muted-foreground">Ship/Shore Safety</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <Link
            href={`/transfers/${params.id}/certificate`}
            className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Quantity Certificate</p>
              <p className="text-xs text-muted-foreground">Volume & Reconciliation</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <Link
            href={`/transfers/${params.id}/closure`}
            className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted/50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Transfer Closure</p>
              <p className="text-xs text-muted-foreground">3-Way Reconciliation</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Info + Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transfer info */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Transfer Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="font-medium text-sm">{transfer.sourceType}: {transfer.sourceId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-medium text-sm">{transfer.destType}: {transfer.destId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Planned Volume</p>
                <p className="font-medium text-sm">{transfer.plannedVolume?.toLocaleString()} m³</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual Volume</p>
                <p className="font-medium text-sm">{transfer.actualVolume?.toLocaleString() || "—"} m³</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Flow Rate</p>
                <p className="font-medium text-sm flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-500" />
                  {transfer.flowRateM3h || "—"} m³/h
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Start Time</p>
                <p className="font-medium text-sm">
                  {transfer.startTime ? new Date(transfer.startTime).toLocaleString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End Time</p>
                <p className="font-medium text-sm">
                  {transfer.endTime ? new Date(transfer.endTime).toLocaleString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="font-bold text-sm text-blue-600">{volumeProgress}%</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(volumeProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Operational controls (visible when active) */}
          {(isActive || transfer.status === "PAUSED") && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Operational Controls</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFlowRate(!showFlowRate)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Gauge className="w-4 h-4 text-blue-500" />
                  Record Flow Rate
                </button>
                <button
                  onClick={() => setShowUllage(!showUllage)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Droplets className="w-4 h-4 text-emerald-500" />
                  Record Ullage
                </button>
                <button
                  onClick={() => setShowComm(!showComm)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  Log Communication
                </button>
              </div>

              {/* Flow rate form */}
              {showFlowRate && (
                <form onSubmit={handleFlowRate} className="mt-4 p-4 bg-muted/30 rounded-lg flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Flow Rate (m³/h)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={flowRate}
                      onChange={(e) => setFlowRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                    Save
                  </button>
                </form>
              )}

              {/* Ullage form */}
              {showUllage && (
                <form onSubmit={handleUllage} className="mt-4 p-4 bg-muted/30 rounded-lg flex items-end gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Tank Code</label>
                    <input
                      type="text"
                      value={ullageData.tankCode}
                      onChange={(e) => setUllageData({ ...ullageData, tankCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Level (m³)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ullageData.level}
                      onChange={(e) => setUllageData({ ...ullageData, level: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                    <select
                      value={ullageData.type}
                      onChange={(e) => setUllageData({ ...ullageData, type: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="OPENING">Opening</option>
                      <option value="CURRENT">Current</option>
                      <option value="CLOSING">Closing</option>
                    </select>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                    Save
                  </button>
                </form>
              )}

              {/* Communication form */}
              {showComm && (
                <form onSubmit={handleComm} className="mt-4 p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Direction</label>
                      <select
                        value={commData.direction}
                        onChange={(e) => setCommData({ ...commData, direction: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-input text-sm"
                      >
                        <option value="OUTGOING">Ship → Shore</option>
                        <option value="INCOMING">Shore → Ship</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Channel</label>
                      <select
                        value={commData.channel}
                        onChange={(e) => setCommData({ ...commData, channel: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-input text-sm"
                      >
                        <option value="VHF">VHF Radio</option>
                        <option value="PHONE">Phone</option>
                        <option value="EMAIL">Email</option>
                        <option value="IN_PERSON">In Person</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                    <textarea
                      value={commData.message}
                      onChange={(e) => setCommData({ ...commData, message: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      required
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                    Log Communication
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right column — Event Timeline */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">Event Timeline</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{events.length} events</p>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {events.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No events yet</p>
              </div>
            ) : (
              <div className="p-4 space-y-0">
                {events.map((event, idx) => {
                  const Icon = EVENT_ICONS[event.eventType] || Clock;
                  const isLast = idx === events.length - 1;
                  return (
                    <div key={event.id} className="flex gap-3">
                      {/* Timeline stem */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-border min-h-[16px]" />}
                      </div>
                      {/* Content */}
                      <div className={`pb-4 ${isLast ? "" : ""}`}>
                        <p className="text-sm font-medium text-foreground">
                          {event.eventType.replace(/_/g, " ")}
                        </p>
                        {event.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{event.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                          {event.user && ` · ${event.user.name}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
