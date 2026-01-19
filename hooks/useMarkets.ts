"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  GammaMarket,
  GammaMarketsQuery,
  GammaPublicSearchQuery,
  GammaPublicSearchResponse,
} from "@/lib/polymarket/gamma";

const buildQueryString = (params?: Record<string, unknown>) => {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry === null || entry === undefined) {
          return;
        }
        searchParams.append(key, String(entry));
      });
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export interface UseMarketsOptions {
  enabled?: boolean;
  initialData?: GammaMarket[] | null;
}

export interface UseMarketSearchOptions {
  enabled?: boolean;
  initialData?: GammaPublicSearchResponse | null;
}

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useMarkets = (
  params?: GammaMarketsQuery,
  options?: UseMarketsOptions
): UseQueryResult<GammaMarket[]> => {
  const [data, setData] = useState<GammaMarket[] | null>(
    options?.initialData ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);
  const paramsRef = useRef(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [paramsKey, params]);

  const enabled = options?.enabled ?? true;
  const refetch = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/gamma/markets${buildQueryString(paramsRef.current)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          let message = "";
          try {
            const payload = (await response.json()) as { error?: string };
            message = payload?.error ?? "";
          } catch {
            message = await response.text().catch(() => "");
          }
          throw new Error(message || `Request failed (${response.status})`);
        }
        const result = (await response.json()) as GammaMarket[];
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    void run();

    return () => controller.abort();
  }, [enabled, paramsKey, refreshIndex]);

  return { data, isLoading, error, refetch };
};

export const useMarketSearch = (
  params: GammaPublicSearchQuery | null,
  options?: UseMarketSearchOptions
): UseQueryResult<GammaPublicSearchResponse> => {
  const [data, setData] = useState<GammaPublicSearchResponse | null>(
    options?.initialData ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);
  const paramsRef = useRef(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [paramsKey, params]);

  const enabled = options?.enabled ?? true;
  const searchQuery = (params?.q ?? "").trim();
  const canFetch = enabled && searchQuery.length > 0;

  const refetch = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!canFetch) {
      setIsLoading(false);
      setError(null);
      if (!searchQuery) {
        setData(null);
      }
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const requestParams: GammaPublicSearchQuery = {
          ...(paramsRef.current ?? { q: searchQuery }),
          q: searchQuery,
        };
        const response = await fetch(
          `/api/gamma/search${buildQueryString(requestParams)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          let message = "";
          try {
            const payload = (await response.json()) as { error?: string };
            message = payload?.error ?? "";
          } catch {
            message = await response.text().catch(() => "");
          }
          throw new Error(message || `Request failed (${response.status})`);
        }
        const result = (await response.json()) as GammaPublicSearchResponse;
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    void run();

    return () => controller.abort();
  }, [canFetch, paramsKey, refreshIndex, searchQuery]);

  return { data, isLoading, error, refetch };
};
