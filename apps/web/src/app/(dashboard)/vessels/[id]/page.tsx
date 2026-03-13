"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Ship,
  ArrowLeft,
  Anchor,
  Calendar,
  Package,
  Plus,
  Trash2,
  Cylinder,
  ChevronRight,
  MapPin,
  FileText,
  ArrowRightLeft,
} from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  SCHEDULED: { bg: "bg-slate-50", text: "text-slate-600" },
  ARRIVED: { bg: "bg-blue-50", text: "text-blue-600" },
  BERTHED: { bg: "bg-purple-50", text: "text-purple-600" },
  OPERATIONS: { bg: "bg-emerald-50", text: "text-emerald-600" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-600" },
  DEPARTED: { bg: "bg-slate-50", text: "text-slate-500" },
};

const PARCEL_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  NOMINATED: { bg: "bg-slate-50", text: "text-slate-600" },
  ALLOCATED: { bg: "bg-blue-50", text: "text-blue-600" },
  TRANSFERRING: { bg: "bg-purple-50", text: "text-purple-600" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-600" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-500" },
};

export default function VesselCallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vesselCall, setVesselCall] = useState<any>(null);
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddParcel, setShowAddParcel] = useState(false);
  const [newParcel, setNewParcel] = useState({
    productId: "",
    nominatedVolume: "",
    owner: "",
    qualitySpec: "",
  });

  useEffect(() => {
    if (params.id) loadData();
  }, [params.id]);

  async function loadData() {
    try {
      const [vcData, parcelData] = await Promise.all([
        api.getVesselCall(params.id as string),
        api.getVesselCallParcels(params.id as string),
      ]);
      setVesselCall(vcData);
      setParcels(parcelData);
    } catch (err) {
      console.error("Failed to load vessel call:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddParcel(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createParcel(params.id as string, {
        productId: newParcel.productId,
        nominatedVolume: Number(newParcel.nominatedVolume),
        owner: newParcel.owner,
        qualitySpec: newParcel.qualitySpec,
      });
      setShowAddParcel(false);
      setNewParcel({ productId: "", nominatedVolume: "", owner: "", qualitySpec: "" });
      loadData();
    } catch (err) {
      console.error("Failed to add parcel:", err);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  if (!vesselCall) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Vessel call not found</p>
        <Link href="/vessels" className="text-primary text-sm mt-2 inline-block">← Back to vessel calls</Link>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[vesselCall.status] || STATUS_STYLES.SCHEDULED;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{vesselCall.vesselName}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              {vesselCall.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vesselCall.imoNumber && `IMO ${vesselCall.imoNumber} · `}
            {vesselCall.agent || "No agent"}
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Calendar className="w-3.5 h-3.5" />
            ETA
          </div>
          <p className="font-semibold text-foreground">
            {new Date(vesselCall.eta).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Calendar className="w-3.5 h-3.5" />
            ATA
          </div>
          <p className="font-semibold text-foreground">
            {vesselCall.ata ? new Date(vesselCall.ata).toLocaleString() : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Anchor className="w-3.5 h-3.5" />
            Berth
          </div>
          <p className="font-semibold text-foreground">
            {vesselCall.berth?.name || "Not assigned"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Package className="w-3.5 h-3.5" />
            Parcels
          </div>
          <p className="font-semibold text-foreground">{parcels.length}</p>
        </div>
      </div>

      {/* Notes */}
      {vesselCall.notes && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground">{vesselCall.notes}</p>
        </div>
      )}

      {/* Parcels */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Cargo Parcels</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage the parcels assigned to this vessel call
            </p>
          </div>
          <button
            onClick={() => setShowAddParcel(!showAddParcel)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Parcel
          </button>
        </div>

        {/* Add parcel form */}
        {showAddParcel && (
          <form onSubmit={handleAddParcel} className="p-5 border-b border-border bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Product ID"
                value={newParcel.productId}
                onChange={(e) => setNewParcel({ ...newParcel, productId: e.target.value })}
                className="px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <input
                type="number"
                placeholder="Volume (m³)"
                value={newParcel.nominatedVolume}
                onChange={(e) => setNewParcel({ ...newParcel, nominatedVolume: e.target.value })}
                className="px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <input
                type="text"
                placeholder="Owner"
                value={newParcel.owner}
                onChange={(e) => setNewParcel({ ...newParcel, owner: e.target.value })}
                className="px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Quality spec"
                  value={newParcel.qualitySpec}
                  onChange={(e) => setNewParcel({ ...newParcel, qualitySpec: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
                  Add
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Parcel list */}
        {parcels.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No parcels yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {parcels.map((parcel) => {
              const pStatus = PARCEL_STATUS_STYLES[parcel.status] || PARCEL_STATUS_STYLES.NOMINATED;
              return (
                <div key={parcel.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {parcel.product?.name || "Unknown Product"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {parcel.nominatedVolume?.toLocaleString()} m³
                        {parcel.owner && ` · ${parcel.owner}`}
                        {parcel.qualitySpec && ` · ${parcel.qualitySpec}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {parcel.allocatedTank && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Cylinder className="w-3.5 h-3.5" />
                        {parcel.allocatedTank.code}
                      </div>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${pStatus.bg} ${pStatus.text}`}>
                      {parcel.status}
                    </span>
                    <Link
                      href={`/transfers?parcel=${parcel.id}`}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="View transfers"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
