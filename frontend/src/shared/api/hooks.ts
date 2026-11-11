"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "@/shared/api/errors";

export type QueryState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export function useApiQuery<T>(loader: () => Promise<T>, dependencies: readonly unknown[] = []): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(async () => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    loader().then((result) => {
      if (active) setData(result);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason : new Error("Ocurrió un error inesperado."));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
    // dependencies are supplied by the feature hook; refreshKey enables explicit reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, refreshKey]);

  return { data, error, isLoading, refetch };
}

export type MutationState<TData, TResult> = {
  data: TResult | null;
  error: Error | null;
  isPending: boolean;
  mutate: (input: TData) => Promise<TResult>;
  reset: () => void;
};

export function useApiMutation<TData, TResult>(action: (input: TData) => Promise<TResult>): MutationState<TData, TResult> {
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (input: TData) => {
    setIsPending(true);
    setError(null);
    try {
      const result = await action(input);
      setData(result);
      return result;
    } catch (reason) {
      const normalized = reason instanceof Error ? reason : new Error("Ocurrió un error inesperado.");
      setError(normalized);
      throw normalized;
    } finally {
      setIsPending(false);
    }
  }, [action]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, error, isPending, mutate, reset };
}

export function fieldErrorsByName(error: Error | null) {
  const apiError = error as ApiError | null;
  return Object.fromEntries((apiError?.fieldErrors ?? []).map((item) => [item.campo, item.mensaje]));
}
