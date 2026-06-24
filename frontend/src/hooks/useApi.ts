import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosError } from "axios";

export interface ApiState<T> {
  data:     T | null;
  loading:  boolean;
  error:    string | null;
  refetch:  () => void;
}

export function useApi<T>(
  url:      string,
  interval: number = 5000,
  enabled:  boolean = true
): ApiState<T> {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error,   setError]   = useState<string | null>(null);
  const abortRef              = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      const response = await axios.get<T>(url, {
        signal: abortRef.current.signal,
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.code === "ERR_CANCELED") return;
      setError(axiosError.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();
    if (interval > 0) {
      const id = setInterval(fetchData, interval);
      return () => {
        clearInterval(id);
        abortRef.current?.abort();
      };
    }
    return () => abortRef.current?.abort();
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
}

export function usePost<T, B = unknown>(url: string) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [data,    setData]    = useState<T | null>(null);

  const post = useCallback(async (body: B): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<T>(url, body);
      setData(response.data);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || "Request failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { post, loading, error, data };
}

export function usePipelineStats() {
  return useApi<{
    stats: {
      total_readings:      number;
      valid_readings:      number;
      anomalies_detected:  number;
      batches_created:     number;
      tonnes_verified:     number;
      guardian_payouts:    number;
      insurance_triggers:  number;
    };
    contract:  string;
    network:   string;
    timestamp: string;
  }>(`http://127.0.0.1:8000/pipeline/stats`, 3000);
}

export function useReadings(limit = 30) {
  return useApi<{
    readings:  any[];
    total:     number;
    valid:     number;
    anomalies: number;
    timestamp: string;
  }>(`http://127.0.0.1:8000/readings?limit=${limit}`, 3000);
}

export function useBatches() {
  return useApi<{
    batches:   any[];
    total:     number;
    minted:    number;
    pending:   number;
    timestamp: string;
  }>(`http://127.0.0.1:8000/batches`, 5000);
}

export function useGuardianPatrols() {
  return useApi<{
    patrols:   any[];
    total:     number;
    confirmed: number;
    pending:   number;
    timestamp: string;
  }>(`http://127.0.0.1:8000/guardian/patrols`, 4000);
}

export function useInsuranceEvents() {
  return useApi<{
    events:        any[];
    total:         number;
    triggered:     number;
    pool_balance:  number;
    threshold_mph: number;
    timestamp:     string;
  }>(`http://127.0.0.1:8000/insurance/events`, 4000);
}

export function useTreasury() {
  return useApi<{
    total_tonnes_minted:  number;
    total_revenue_usdc:   number;
    splits: {
      guardian_payroll: { percentage: number; amount_usdc: number; address: string };
      ecosystem_fund:   { percentage: number; amount_usdc: number; address: string };
      insurance_pool:   { percentage: number; amount_usdc: number; address: string };
    };
    contract_address: string;
    timestamp:        string;
  }>(`http://127.0.0.1:8000/treasury`, 5000);
}

export function useHealth() {
  return useApi<{
    status:           string;
    backend:          string;
    database:         string;
    ml_models:        string;
    blockchain:       string;
    contract_address: string;
    timestamp:        string;
  }>(`http://127.0.0.1:8000/health`, 8000);
}