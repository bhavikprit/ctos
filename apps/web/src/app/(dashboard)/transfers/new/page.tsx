"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";

const TRANSFER_TYPES = [
  { value: "SHIP_TO_TANK", label: "Ship → Tank" },
  { value: "TANK_TO_SHIP", label: "Tank → Ship" },
  { value: "TANK_TO_TANK", label: "Tank → Tank" },
  { value: "TANK_TO_TRUCK", label: "Tank → Truck" },
  { value: "TANK_TO_IBC", label: "Tank → IBC" },
  { value: "CROSS_TERMINAL", label: "Cross-Terminal" },
];

export default function NewTransferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parcelId = searchParams.get("parcel") || "";
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    transferNumber: "",
    parcelId: parcelId,
    type: "SHIP_TO_TANK",
    sourceType: "vessel",
    sourceId: "",
    destType: "tank",
    destId: "",
    plannedVolume: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await api.createTransfer({
        ...form,
        plannedVolume: Number(form.plannedVolume),
      });
      router.push(`/transfers/${result.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to create transfer");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Transfer</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Set up a new transfer operation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Transfer Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="transferNumber"
                value={form.transferNumber}
                onChange={handleChange}
                placeholder="e.g. TRF-2026-0003"
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Transfer Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type" value={form.type} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {TRANSFER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Parcel ID</label>
            <input
              type="text"
              name="parcelId"
              value={form.parcelId}
              onChange={handleChange}
              placeholder="Link to an existing parcel (optional)"
              className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Source Type</label>
              <select
                name="sourceType" value={form.sourceType} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="vessel">Vessel</option>
                <option value="tank">Tank</option>
                <option value="truck">Truck</option>
                <option value="ibc">IBC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Source ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sourceId"
                value={form.sourceId}
                onChange={handleChange}
                placeholder="e.g. vessel call ID or tank code"
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Destination Type</label>
              <select
                name="destType" value={form.destType} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="tank">Tank</option>
                <option value="vessel">Vessel</option>
                <option value="truck">Truck</option>
                <option value="ibc">IBC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Destination ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="destId"
                value={form.destId}
                onChange={handleChange}
                placeholder="e.g. T103"
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Planned Volume (m³) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="plannedVolume"
              value={form.plannedVolume}
              onChange={handleChange}
              placeholder="e.g. 3000"
              className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {submitting ? "Creating..." : "Create Transfer"}
          </button>
        </div>
      </form>
    </div>
  );
}
