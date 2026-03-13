"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Ship,
  Cylinder,
  FileText,
  Loader2,
} from "lucide-react";

export default function TransferClosurePage() {
  const params = useParams();
  const router = useRouter();
  const transferId = params.id as string;
  const [transfer, setTransfer] = useState<any>(null);
  const [variance, setVariance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    loadData();
  }, [transferId]);

  async function loadData() {
    try {
      const [tData, vData] = await Promise.all([
        api.getTransfer(transferId),
        api.getVariance(transferId).catch(() => null),
      ]);
      setTransfer(tData);
      setVariance(vData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExplainVariance(e: React.FormEvent) {
    e.preventDefault();
    setExplaining(true);
    try {
      await api.explainVariance(transferId, { explanation });
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to submit explanation");
    } finally {
      setExplaining(false);
    }
  }

  async function handleClose() {
    if (!confirm("This will permanently close the transfer. All data becomes immutable. Continue?")) return;
    setClosing(true);
    try {
      await api.closeTransfer(transferId);
      router.push(`/transfers/${transferId}`);
    } catch (err: any) {
      alert(err.message || "Failed to close transfer");
      setClosing(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  if (!transfer) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Transfer not found</p>
      </div>
    );
  }

  const canClose = transfer.status === "PENDING_CLOSURE";
  const varianceExceeds = variance && Math.abs(variance.percent || 0) > 0.5;
  const varianceExplained = variance?.explained;
  const readyToClose = canClose && (!varianceExceeds || varianceExplained);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transfer Closure</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{transfer.transferNumber}</p>
        </div>
      </div>

      {/* Status check */}
      {!canClose && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              Transfer must be in &quot;Pending Closure&quot; status to close. Current status: {transfer.status?.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      )}

      {/* 3-way reconciliation */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-500" />
            Three-Way Reconciliation
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">BOL vs Shore vs Ship figures</p>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            {/* BOL */}
            <div className="p-4 rounded-xl border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Bill of Lading</p>
              <p className="text-xl font-bold text-foreground">{transfer.plannedVolume?.toLocaleString() || "—"}</p>
              <p className="text-xs text-muted-foreground">m³</p>
            </div>

            {/* Shore */}
            <div className="p-4 rounded-xl border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                <Cylinder className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Shore Tank</p>
              <p className="text-xl font-bold text-foreground">{transfer.actualVolume?.toLocaleString() || "—"}</p>
              <p className="text-xs text-muted-foreground">m³</p>
            </div>

            {/* Ship */}
            <div className="p-4 rounded-xl border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-2">
                <Ship className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Ship Figure</p>
              <p className="text-xl font-bold text-foreground">{variance?.shipFigure?.toLocaleString() || "—"}</p>
              <p className="text-xs text-muted-foreground">m³</p>
            </div>
          </div>
        </div>
      </div>

      {/* Variance */}
      {variance && (
        <div className={`rounded-xl border overflow-hidden ${
          varianceExceeds && !varianceExplained
            ? "border-amber-300 bg-amber-50"
            : "border-border bg-white"
        }`}>
          <div className="p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              {varianceExceeds ? (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
              Variance
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Absolute</p>
                <p className="text-lg font-bold">{variance.absolute?.toFixed(2) || "—"} m³</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Percentage</p>
                <p className={`text-lg font-bold ${varianceExceeds ? "text-amber-600" : "text-emerald-600"}`}>
                  {variance.percent?.toFixed(3) || "—"}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tolerance</p>
                <p className="text-lg font-bold">±0.5%</p>
              </div>
            </div>

            {/* Variance explanation form */}
            {varianceExceeds && !varianceExplained && (
              <form onSubmit={handleExplainVariance} className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  ⚠️ Variance exceeds tolerance. An explanation is required before closure.
                </p>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={3}
                  placeholder="Explain the variance (e.g., trim correction, temperature difference, ROB, clingage)..."
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-3"
                  required
                />
                <button
                  type="submit"
                  disabled={explaining}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {explaining ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {explaining ? "Submitting..." : "Submit Explanation"}
                </button>
              </form>
            )}

            {varianceExplained && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs font-medium text-emerald-700 mb-1">Explanation Accepted</p>
                <p className="text-sm text-emerald-600">{variance.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close button */}
      <div className="bg-white rounded-xl border border-border p-6 text-center">
        <Lock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">
          Closing this transfer will make all data <strong>immutable</strong>. This action cannot be undone.
        </p>
        <button
          onClick={handleClose}
          disabled={!readyToClose || closing}
          className="inline-flex items-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {closing ? "Closing..." : "Close Transfer Permanently"}
        </button>
        {!readyToClose && canClose && varianceExceeds && !varianceExplained && (
          <p className="text-xs text-amber-600 mt-2">Variance explanation required before closure</p>
        )}
      </div>
    </div>
  );
}
