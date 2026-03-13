"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Ship } from "lucide-react";

export default function NewVesselCallPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vesselName: "",
    imoNumber: "",
    eta: "",
    agent: "",
    berthId: "",
    notes: "",
  });
  const [berths, setBerths] = useState<any[]>([]);

  useEffect(() => {
    // Load available berths
    // In a real scenario this would be an API call; for now just stub it
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        vesselName: form.vesselName,
        eta: new Date(form.eta).toISOString(),
      };
      if (form.imoNumber) payload.imoNumber = form.imoNumber;
      if (form.agent) payload.agent = form.agent;
      if (form.berthId) payload.berthId = form.berthId;
      if (form.notes) payload.notes = form.notes;

      const result = await api.createVesselCall(payload);
      router.push(`/vessels/${result.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to create vessel call");
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
          <h1 className="text-2xl font-bold text-foreground">New Vessel Call</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Register a new vessel arrival</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Vessel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vesselName"
              value={form.vesselName}
              onChange={handleChange}
              placeholder="e.g. MT Chem Voyager"
              className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">IMO Number</label>
              <input
                type="text"
                name="imoNumber"
                value={form.imoNumber}
                onChange={handleChange}
                placeholder="e.g. 9876543"
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                ETA <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="eta"
                value={form.eta}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Agent</label>
            <input
              type="text"
              name="agent"
              value={form.agent}
              onChange={handleChange}
              placeholder="e.g. Global Ship Agency"
              className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional details about the vessel call..."
              className="w-full px-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
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
            <Ship className="w-4 h-4" />
            {submitting ? "Creating..." : "Create Vessel Call"}
          </button>
        </div>
      </form>
    </div>
  );
}
