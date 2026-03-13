"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

// Generic hook for API data fetching with loading/error states
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Domain-specific hooks
export function useVesselCalls() {
  return useApiData(() => api.getVesselCalls(), []);
}

export function useVesselCall(id: string) {
  return useApiData(() => api.getVesselCall(id), [id]);
}

export function useTransfers() {
  return useApiData(() => api.getTransfers(), []);
}

export function useTransfer(id: string) {
  return useApiData(() => api.getTransfer(id), [id]);
}

export function useTanks() {
  return useApiData(() => api.getTanks(), []);
}

export function useTank(id: string) {
  return useApiData(() => api.getTank(id), [id]);
}

export function useTransferEvents(transferId: string) {
  return useApiData(() => api.getTransferEvents(transferId), [transferId]);
}
