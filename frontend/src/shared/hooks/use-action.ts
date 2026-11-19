"use client";

import { useCallback, useState } from "react";

export function useAction() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const run = useCallback(async <T,>(action: () => Promise<T>, successMessage?: string): Promise<T | null> => {
    setIsPending(true);
    setError(null);
    if (successMessage) setSuccess(null);
    try {
      const result = await action();
      if (successMessage) setSuccess(successMessage);
      return result;
    } catch (reason) {
      setError(reason);
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  const clear = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { isPending, error, success, run, clear };
}
