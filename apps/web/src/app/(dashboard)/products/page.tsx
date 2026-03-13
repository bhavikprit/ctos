"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Package,
  Plus,
  Search,
  Filter,
  Cylinder,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Trash2,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  code: string;
  unNumber?: string;
  casNumber?: string;
  density?: number;
  flashPoint?: number;
  hazardClass?: string;
  tankCount?: number;
  currentStock?: number;
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: "1", name: "Methanol", code: "MEOH", unNumber: "1230", casNumber: "67-56-1", density: 0.792, flashPoint: 11, hazardClass: "3", tankCount: 3, currentStock: 4850 },
  { id: "2", name: "Ethanol", code: "ETOH", unNumber: "1170", casNumber: "64-17-5", density: 0.789, flashPoint: 13, hazardClass: "3", tankCount: 2, currentStock: 3200 },
  { id: "3", name: "Toluene", code: "TOL", unNumber: "1294", casNumber: "108-88-3", density: 0.867, flashPoint: 4, hazardClass: "3", tankCount: 2, currentStock: 2100 },
  { id: "4", name: "Xylene", code: "XYL", unNumber: "1307", casNumber: "1330-20-7", density: 0.860, flashPoint: 27, hazardClass: "3", tankCount: 1, currentStock: 1500 },
  { id: "5", name: "Acetone", code: "ACE", unNumber: "1090", casNumber: "67-64-1", density: 0.784, flashPoint: -20, hazardClass: "3", tankCount: 1, currentStock: 800 },
  { id: "6", name: "Benzene", code: "BEN", unNumber: "1114", casNumber: "71-43-2", density: 0.879, flashPoint: -11, hazardClass: "3", tankCount: 1, currentStock: 450 },
  { id: "7", name: "Ethylene Glycol", code: "EGL", unNumber: "—", casNumber: "107-21-1", density: 1.113, flashPoint: 111, hazardClass: "—", tankCount: 2, currentStock: 5200 },
  { id: "8", name: "Isopropanol", code: "IPA", unNumber: "1219", casNumber: "67-63-0", density: 0.786, flashPoint: 12, hazardClass: "3", tankCount: 1, currentStock: 1200 },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = search
    ? products.filter((p) =>
        `${p.name} ${p.code} ${p.unNumber || ""}`.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const totalStock = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} products · {totalStock.toLocaleString()} m³ total inventory
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name, code, or UN number..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Add product form (collapsible) */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Add New Product</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border border-input text-sm" placeholder="e.g. Methanol" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Code</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border border-input text-sm" placeholder="e.g. MEOH" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">UN Number</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border border-input text-sm" placeholder="e.g. 1230" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Density (g/mL)</label>
              <input type="number" step="0.001" className="w-full px-3 py-2 rounded-lg border border-input text-sm" placeholder="e.g. 0.792" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">CAS Number</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border border-input text-sm" placeholder="e.g. 67-56-1" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Flash Point (°C)</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg border border-input text-sm" placeholder="e.g. 11" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Hazard Class</label>
              <select className="w-full px-3 py-2 rounded-lg border border-input text-sm">
                <option>3 — Flammable Liquid</option>
                <option>6.1 — Toxic</option>
                <option>8 — Corrosive</option>
                <option>9 — Misc Dangerous</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">UN #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">CAS #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Density</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flash Pt</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hazard</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanks</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock (m³)</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{product.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono">{product.unNumber || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-muted-foreground">{product.casNumber || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{product.density} g/mL</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${(product.flashPoint || 999) < 23 ? "text-red-600 font-medium" : ""}`}>
                      {product.flashPoint}°C
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.hazardClass !== "—" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        Class {product.hazardClass}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Cylinder className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{product.tankCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold">{product.currentStock?.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                      <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
