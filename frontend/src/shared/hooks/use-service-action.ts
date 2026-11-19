"use client";

import { useCallback, useRef } from "react";
import { useAction } from "@/shared/hooks/use-action";

export function useServiceAction<TInput, TResult>(
  operation: (input: TInput) => Promise<TResult>,
) {
  const operationRef = useRef(operation);
  operationRef.current = operation;
  const action = useAction();

  const execute = useCallback(
    (input: TInput, successMessage?: string) =>
      action.run(() => operationRef.current(input), successMessage),
    [action.run],
  );

  return { ...action, execute };
}
