"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSignature,
  Loader2,
} from "lucide-react";

const SECTIONS = {
  PART_A: "Part A — Ship/Shore Safety (Joint)",
  PART_B: "Part B — Terminal Supplementary",
};

export default function IsgottChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const transferId = params.id as string;
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    loadChecklist();
  }, [transferId]);

  async function loadChecklist() {
    try {
      const data = await api.getIsgottChecklist(transferId);
      setChecklist(data);
    } catch {
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      await api.createIsgottChecklist(transferId);
      loadChecklist();
    } catch (err: any) {
      alert(err.message || "Failed to create checklist");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateItem(itemId: string, status: string, comment: string) {
    if (!checklist) return;
    try {
      await api.updateIsgottItem(checklist.id, itemId, {
        status,
        comment: status === "NO" || status === "NA" ? comment : undefined,
      });
      loadChecklist();
    } catch (err: any) {
      alert(err.message || "Failed to update item");
    }
  }

  async function handleSign() {
    if (!checklist) return;
    setSigning(true);
    try {
      await api.signIsgottChecklist(checklist.id);
      loadChecklist();
    } catch (err: any) {
      alert(err.message || "Failed to sign checklist");
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  // No checklist yet — show creation button
  if (!checklist) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">ISGOTT Safety Checklist</h1>
        </div>
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Checklist Created</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            The ISGOTT Ship/Shore Safety Checklist must be completed before transfer operations can begin.
            This creates a checklist based on ISGOTT 7th Edition standards.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {creating ? "Creating..." : "Create ISGOTT Checklist"}
          </button>
        </div>
      </div>
    );
  }

  const items = checklist.items || [];
  const partA = items.filter((i: any) => i.section === "PART_A");
  const partB = items.filter((i: any) => i.section === "PART_B");
  const completedCount = items.filter((i: any) => i.status && i.status !== "PENDING").length;
  const totalCount = items.length;
  const allDone = completedCount === totalCount;
  const isSigned = checklist.terminalSignedAt || checklist.vesselSignedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ISGOTT Safety Checklist</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ship/Shore Safety Checklist — ISGOTT 7th Edition
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{completedCount}/{totalCount} completed</span>
          {allDone && !isSigned && (
            <button
              onClick={handleSign}
              disabled={signing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
              {signing ? "Signing..." : "Sign Checklist"}
            </button>
          )}
          {isSigned && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Signed
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion Progress</p>
          <p className="text-sm font-bold text-foreground">{Math.round((completedCount / totalCount) * 100)}%</p>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Signature info */}
      {(checklist.terminalSignedAt || checklist.vesselSignedAt) && (
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 flex items-center gap-6">
          {checklist.terminalSignedAt && (
            <div>
              <p className="text-xs text-emerald-700 font-medium">Terminal Signed</p>
              <p className="text-xs text-emerald-600">{new Date(checklist.terminalSignedAt).toLocaleString()}</p>
            </div>
          )}
          {checklist.vesselSignedAt && (
            <div>
              <p className="text-xs text-emerald-700 font-medium">Vessel Signed</p>
              <p className="text-xs text-emerald-600">{new Date(checklist.vesselSignedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {/* Part A */}
      <ChecklistSection
        title={SECTIONS.PART_A}
        items={partA}
        onUpdate={handleUpdateItem}
        signed={isSigned}
      />

      {/* Part B */}
      <ChecklistSection
        title={SECTIONS.PART_B}
        items={partB}
        onUpdate={handleUpdateItem}
        signed={isSigned}
      />
    </div>
  );
}

function ChecklistSection({
  title,
  items,
  onUpdate,
  signed,
}: {
  title: string;
  items: any[];
  onUpdate: (id: string, status: string, comment: string) => void;
  signed: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{items.length} items</p>
      </div>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <ChecklistItem key={item.id} item={item} onUpdate={onUpdate} signed={signed} />
        ))}
      </div>
    </div>
  );
}

function ChecklistItem({
  item,
  onUpdate,
  signed,
}: {
  item: any;
  onUpdate: (id: string, status: string, comment: string) => void;
  signed: boolean;
}) {
  const [comment, setComment] = useState(item.comment || "");
  const [showComment, setShowComment] = useState(false);

  const statusColor =
    item.status === "YES" ? "text-emerald-600" :
    item.status === "NO" ? "text-red-500" :
    item.status === "NA" ? "text-slate-400" :
    "text-muted-foreground";

  return (
    <div className="px-5 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-foreground">{item.question || item.description}</p>
          {item.comment && (
            <p className="text-xs text-muted-foreground mt-1 italic">💬 {item.comment}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!signed ? (
            <>
              <button
                onClick={() => onUpdate(item.id, "YES", "")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  item.status === "YES"
                    ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500"
                    : "bg-muted/50 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                }`}
              >
                Y
              </button>
              <button
                onClick={() => {
                  if (item.status !== "NO") setShowComment(true);
                  onUpdate(item.id, "NO", comment);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  item.status === "NO"
                    ? "bg-red-100 text-red-700 ring-2 ring-red-500"
                    : "bg-muted/50 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                }`}
              >
                N
              </button>
              <button
                onClick={() => onUpdate(item.id, "NA", "")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  item.status === "NA"
                    ? "bg-slate-200 text-slate-700 ring-2 ring-slate-400"
                    : "bg-muted/50 text-muted-foreground hover:bg-slate-50"
                }`}
              >
                —
              </button>
            </>
          ) : (
            <span className={`text-sm font-bold ${statusColor}`}>
              {item.status === "YES" ? "✓" : item.status === "NO" ? "✗" : "—"}
            </span>
          )}
        </div>
      </div>
      {showComment && item.status === "NO" && !signed && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Reason for non-compliance..."
            className="flex-1 px-3 py-1.5 rounded-lg border border-input text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => {
              onUpdate(item.id, "NO", comment);
              setShowComment(false);
            }}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
