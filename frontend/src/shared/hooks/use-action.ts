"use client";

import { useState } from "react";

export function useAction() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function run<T>(action: () => Promise<T>, successMessage?: string): Promise<T | null> {
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
  }

  function clear() {
    setError(null);
    setSuccess(null);
  }

  return { isPending, error, success, run, clear };
}
