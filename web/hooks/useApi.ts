import { useCallback, useState } from "react";
import apiClient, { ApiResponse } from "@/lib/api-client";

/**
 * Hook for GET requests
 * Automatically extracts data from API response format
 */
export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ApiResponse<T>>(url);
      // Extract data from response wrapper
      const extractedData: T = (response.data?.data || response.data) as T;
      setData(extractedData);
      return extractedData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url]);

  const refetch = useCallback(fetch, [fetch]);

  return { data, loading, error, fetch: refetch, refetch };
}

/**
 * Hook for POST requests
 * Automatically extracts data from API response format
 */
export function usePost<T, R>(url: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<R | null>(null);

  const mutate = useCallback(
    async (payload: T) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.post<ApiResponse<R>>(url, payload);
        // Extract data from response wrapper
        const extractedData: R = (response.data?.data || response.data) as R;
        setData(extractedData);
        return extractedData;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  return { mutate, loading, error, data };
}

/**
 * Hook for PATCH requests
 * Automatically extracts data from API response format
 */
export function usePatch<T, R>(url: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<R | null>(null);

  const mutate = useCallback(
    async (payload: Partial<T>) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.patch<ApiResponse<R>>(url, payload);
        // Extract data from response wrapper
        const extractedData: R = (response.data?.data || response.data) as R;
        setData(extractedData);
        return extractedData;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  return { mutate, loading, error, data };
}

/**
 * Hook for DELETE requests
 */
export function useDelete<R>(url: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<R | null>(null);

  const mutate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.delete<ApiResponse<R>>(url);
      const extractedData: R = (response.data?.data || response.data) as R;
      setData(extractedData);
      return extractedData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { mutate, loading, error, data };
}
