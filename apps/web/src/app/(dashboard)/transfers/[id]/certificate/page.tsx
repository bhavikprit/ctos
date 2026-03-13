"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle2,
  FileSignature,
  Loader2,
  Thermometer,
  Droplets,
  Ship,
  Cylinder,
  Scale,
} from "lucide-react";

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const transferId = params.id as string;
  const [certificate, setCertificate] = useState<any>(null);
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    loadData();
  }, [transferId]);

  async function loadData() {
    try {
      const [tData, certData] = await Promise.all([
        api.getTransfer(transferId),
        api.getCertificate(transferId).catch(() => null),
      ]);
      setTransfer(tData);
      setCertificate(certData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await api.generateCertificate(transferId);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSign() {
    if (!certificate) return;
    setSigning(true);
    try {
      await api.signCertificate(certificate.id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to sign certificate");
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  // No certificate — show generation prompt
  if (!certificate) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Quantity Certificate</h1>
        </div>
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Certificate Generated</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Generate a Quantity Certificate from the transfer data. The certificate will include
            volume measurements, temperature corrections to 15°C, and reconciliation figures.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {generating ? "Generating..." : "Generate Certificate"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quantity Certificate</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Certificate #{certificate.certificateNumber || certificate.id?.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!certificate.signedAt && (
            <button
              onClick={handleSign}
              disabled={signing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
              {signing ? "Signing..." : "Sign Certificate"}
            </button>
          )}
          {certificate.signedAt && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Signed
            </span>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Certificate body */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {/* Certificate header */}
        <div className="bg-slate-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">QUANTITY CERTIFICATE</h2>
              <p className="text-sm text-slate-300 mt-1">Chemical Terminal Product Transfer</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-300">Certificate No.</p>
              <p className="font-mono font-bold">{certificate.certificateNumber || transfer?.transferNumber}</p>
            </div>
          </div>
        </div>

        {/* Transfer info */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Transfer Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-8">
            <div>
              <p className="text-xs text-muted-foreground">Transfer Number</p>
              <p className="text-sm font-medium">{transfer?.transferNumber || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium">{transfer?.type?.replace(/_/g, " ") || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Product</p>
              <p className="text-sm font-medium">{transfer?.parcel?.product?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vessel</p>
              <p className="text-sm font-medium">{transfer?.parcel?.vesselCall?.vesselName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Start Time</p>
              <p className="text-sm font-medium">{transfer?.startTime ? new Date(transfer.startTime).toLocaleString() : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">End Time</p>
              <p className="text-sm font-medium">{transfer?.endTime ? new Date(transfer.endTime).toLocaleString() : "—"}</p>
            </div>
          </div>
        </div>

        {/* Volume measurements */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-500" />
            Volume Measurements
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Measurement</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Observed (m³)</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Temp (°C)</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Corrected @15°C (m³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2.5 flex items-center gap-2">
                    <Ship className="w-3.5 h-3.5 text-blue-500" />
                    <span>Ship (BOL)</span>
                  </td>
                  <td className="py-2.5 text-right font-mono">{certificate.bolVolumeM3?.toLocaleString() || transfer?.plannedVolume?.toLocaleString() || "—"}</td>
                  <td className="py-2.5 text-right font-mono">{certificate.bolTempC || "—"}</td>
                  <td className="py-2.5 text-right font-mono font-bold">{certificate.bolCorrectedM3?.toLocaleString() || "—"}</td>
                </tr>
                <tr>
                  <td className="py-2.5 flex items-center gap-2">
                    <Cylinder className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Shore Tank</span>
                  </td>
                  <td className="py-2.5 text-right font-mono">{certificate.shoreVolumeM3?.toLocaleString() || transfer?.actualVolume?.toLocaleString() || "—"}</td>
                  <td className="py-2.5 text-right font-mono">{certificate.shoreTempC || "—"}</td>
                  <td className="py-2.5 text-right font-mono font-bold">{certificate.shoreCorrectedM3?.toLocaleString() || "—"}</td>
                </tr>
                <tr>
                  <td className="py-2.5 flex items-center gap-2">
                    <Ship className="w-3.5 h-3.5 text-purple-500" />
                    <span>Ship (Ullage)</span>
                  </td>
                  <td className="py-2.5 text-right font-mono">{certificate.shipUllageM3?.toLocaleString() || "—"}</td>
                  <td className="py-2.5 text-right font-mono">{certificate.shipTempC || "—"}</td>
                  <td className="py-2.5 text-right font-mono font-bold">{certificate.shipCorrectedM3?.toLocaleString() || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Variance */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-amber-500" />
            Variance Analysis
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Ship vs Shore</p>
              <p className="text-lg font-bold text-foreground">{certificate.varianceM3?.toFixed(2) || "—"} m³</p>
              <p className="text-xs text-muted-foreground">{certificate.variancePercent?.toFixed(3) || "—"}%</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Tolerance</p>
              <p className="text-lg font-bold text-foreground">±0.5%</p>
              <p className={`text-xs font-medium ${
                (certificate.variancePercent || 0) <= 0.5 ? "text-emerald-600" : "text-red-500"
              }`}>
                {(certificate.variancePercent || 0) <= 0.5 ? "Within limits" : "Exceeds tolerance"}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Status</p>
              {certificate.varianceExplained ? (
                <p className="text-lg font-bold text-emerald-600">Explained</p>
              ) : (certificate.variancePercent || 0) > 0.5 ? (
                <p className="text-lg font-bold text-amber-500">Pending</p>
              ) : (
                <p className="text-lg font-bold text-emerald-600">Acceptable</p>
              )}
            </div>
          </div>
          {certificate.varianceExplanation && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-medium text-amber-800">Variance Explanation</p>
              <p className="text-sm text-amber-700 mt-1">{certificate.varianceExplanation}</p>
            </div>
          )}
        </div>

        {/* Signature block */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Signatures</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Terminal Representative</p>
              {certificate.terminalSignedBy ? (
                <div>
                  <p className="font-medium text-sm">{certificate.terminalSignedBy}</p>
                  <p className="text-xs text-muted-foreground">{new Date(certificate.terminalSignedAt).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Awaiting signature</p>
              )}
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Vessel Representative</p>
              {certificate.vesselSignedBy ? (
                <div>
                  <p className="font-medium text-sm">{certificate.vesselSignedBy}</p>
                  <p className="text-xs text-muted-foreground">{new Date(certificate.vesselSignedAt).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Awaiting signature</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
