const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("ctos_token");
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;
    const token = this.getToken();

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "An error occurred" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  // Auth
  async login(userId: string) {
    return this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: { userId },
    });
  }

  async getMe() {
    return this.request<{ user: any }>("/auth/me");
  }

  async getUsers() {
    return this.request<any[]>("/auth/users");
  }

  // Vessel Calls
  async getVesselCalls(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return this.request<{ data: any[]; total: number }>(`/vessel-calls${query}`);
  }

  async getVesselCall(id: string) {
    return this.request<any>(`/vessel-calls/${id}`);
  }

  async createVesselCall(data: any) {
    return this.request<any>("/vessel-calls", { method: "POST", body: data });
  }

  async updateVesselCall(id: string, data: any) {
    return this.request<any>(`/vessel-calls/${id}`, { method: "PUT", body: data });
  }

  // Parcels
  async getParcels(vesselCallId: string) {
    return this.request<any[]>(`/vessel-calls/${vesselCallId}/parcels`);
  }

  async getVesselCallParcels(vesselCallId: string) {
    return this.getParcels(vesselCallId);
  }

  async createParcel(vesselCallId: string, data: any) {
    return this.request<any>(`/vessel-calls/${vesselCallId}/parcels`, { method: "POST", body: data });
  }

  async updateParcel(id: string, data: any) {
    return this.request<any>(`/parcels/${id}`, { method: "PUT", body: data });
  }

  // Tanks
  async getTanks(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return this.request<any[]>(`/tanks${query}`);
  }

  async getTank(id: string) {
    return this.request<any>(`/tanks/${id}`);
  }

  async recommendTanks(data: { productId: string; volume: number }) {
    return this.request<any[]>("/tanks/recommend", { method: "POST", body: data });
  }

  async allocateTank(parcelId: string, tankId: string) {
    return this.request<any>(`/parcels/${parcelId}/allocate-tank`, {
      method: "POST",
      body: { tankId },
    });
  }

  // Transfers
  async getTransfers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return this.request<{ data: any[]; total: number }>(`/transfers${query}`);
  }

  async getTransfer(id: string) {
    return this.request<any>(`/transfers/${id}`);
  }

  async createTransfer(data: any) {
    return this.request<any>("/transfers", { method: "POST", body: data });
  }

  async updateTransferStatus(id: string, status: string, reason?: string) {
    return this.request<any>(`/transfers/${id}/status`, {
      method: "PUT",
      body: { status, reason },
    });
  }

  async emergencyStop(id: string, reason: string) {
    return this.request<any>(`/transfers/${id}/emergency-stop`, {
      method: "POST",
      body: { reason },
    });
  }

  // Flow Rate
  async recordFlowRate(transferId: string, flowRateOrData: number | { flowRate: number; segmentId?: string }) {
    const body = typeof flowRateOrData === "number" ? { flowRate: flowRateOrData } : flowRateOrData;
    return this.request<any>(`/transfers/${transferId}/flow-rate`, {
      method: "POST",
      body,
    });
  }

  // Ullage
  async recordUllage(transferId: string, data: any) {
    return this.request<any>(`/transfers/${transferId}/ullage`, {
      method: "POST",
      body: data,
    });
  }

  async getUllageReadings(transferId: string) {
    return this.request<any[]>(`/transfers/${transferId}/ullage`);
  }

  // Ship Figures
  async recordShipFigure(transferId: string, data: any) {
    return this.request<any>(`/transfers/${transferId}/ship-figures`, {
      method: "POST",
      body: data,
    });
  }

  async getVariance(transferId: string) {
    return this.request<any>(`/transfers/${transferId}/variance`);
  }

  // ISGOTT
  async getIsgottChecklist(transferId: string) {
    return this.request<any>(`/transfers/${transferId}/isgott`);
  }

  async createIsgottChecklist(transferId: string) {
    return this.request<any>(`/transfers/${transferId}/isgott`, { method: "POST" });
  }

  async updateIsgottItem(checklistId: string, itemId: string, data: any) {
    return this.request<any>(`/isgott/${checklistId}/items/${itemId}`, {
      method: "PUT",
      body: data,
    });
  }

  async signIsgottChecklist(checklistId: string) {
    return this.request<any>(`/isgott/${checklistId}/sign`, { method: "POST" });
  }

  // Events
  async getTransferEvents(transferId: string) {
    return this.request<any[]>(`/transfers/${transferId}/events`);
  }

  // Communications
  async addCommunication(transferId: string, data: any) {
    return this.request<any>(`/transfers/${transferId}/communications`, {
      method: "POST",
      body: typeof data === "string" ? { message: data } : data,
    });
  }

  async getCommunications(transferId: string) {
    return this.request<any[]>(`/transfers/${transferId}/communications`);
  }

  // Certificate
  async getCertificate(transferId: string) {
    return this.request<any>(`/transfers/${transferId}/certificate`);
  }

  async generateCertificate(transferId: string) {
    return this.request<any>(`/transfers/${transferId}/certificate`, { method: "POST" });
  }

  async signCertificate(certificateId: string) {
    return this.request<any>(`/certificates/${certificateId}/sign`, { method: "POST" });
  }

  // Transfer Closure
  async completeTransfer(id: string, data: any) {
    return this.request<any>(`/transfers/${id}/complete`, { method: "POST", body: data });
  }

  async closeTransfer(id: string) {
    return this.request<any>(`/transfers/${id}/close`, { method: "POST" });
  }

  async getReconciliation(id: string) {
    return this.request<any>(`/transfers/${id}/reconciliation`);
  }

  async explainVariance(id: string, data: any) {
    return this.request<any>(`/transfers/${id}/variance-explain`, {
      method: "POST",
      body: data,
    });
  }

  // Products
  async getProducts() {
    return this.request<any[]>("/products");
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request<any>("/products", { method: "POST", body: data });
  }

  async updateProduct(id: string, data: any) {
    return this.request<any>(`/products/${id}`, { method: "PATCH", body: data });
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, { method: "DELETE" });
  }

  // Berths
  async getBerths() {
    return this.request<any[]>("/berths");
  }

  async getBerth(id: string) {
    return this.request<any>(`/berths/${id}`);
  }

  // Activity
  async getActivityLog(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return this.request<any[]>(`/activity${query}`);
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<any>("/dashboard/stats");
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>("/notifications");
  }

  async markNotificationRead(id: string) {
    return this.request<void>(`/notifications/${id}/read`, { method: "POST" });
  }

  async markAllNotificationsRead() {
    return this.request<void>("/notifications/read-all", { method: "POST" });
  }

  // Settings
  async getSettings() {
    return this.request<any>("/settings");
  }

  async updateSettings(data: any) {
    return this.request<any>("/settings", { method: "PATCH", body: data });
  }

  // Terminals
  async getTerminals() {
    return this.request<any[]>("/terminals");
  }

  async getTerminal(id: string) {
    return this.request<any>(`/terminals/${id}`);
  }

  async createTerminal(data: any) {
    return this.request<any>("/terminals", { method: "POST", body: data });
  }

  async updateTerminal(id: string, data: any) {
    return this.request<any>(`/terminals/${id}`, { method: "PATCH", body: data });
  }

  async deleteTerminal(id: string) {
    return this.request<void>(`/terminals/${id}`, { method: "DELETE" });
  }

  // Terminal infrastructure
  async addTankToTerminal(terminalId: string, data: any) {
    return this.request<any>(`/terminals/${terminalId}/tanks`, { method: "POST", body: data });
  }

  async addPipelineToTerminal(terminalId: string, data: any) {
    return this.request<any>(`/terminals/${terminalId}/pipelines`, { method: "POST", body: data });
  }

  async addBerthToTerminal(terminalId: string, data: any) {
    return this.request<any>(`/terminals/${terminalId}/berths`, { method: "POST", body: data });
  }

  async addPumpToTerminal(terminalId: string, data: any) {
    return this.request<any>(`/terminals/${terminalId}/pumps`, { method: "POST", body: data });
  }

  async addValveToTerminal(terminalId: string, data: any) {
    return this.request<any>(`/terminals/${terminalId}/valves`, { method: "POST", body: data });
  }
}

export const api = new ApiClient(API_BASE_URL);
