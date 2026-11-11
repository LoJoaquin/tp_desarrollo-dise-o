"use client";
import { useApiMutation, useApiQuery } from "@/shared/api/hooks";
import * as service from "./service";
import type { PositionReportSearch } from "./types";

export const useSearchPositionSummaries = () => useApiMutation((body: PositionReportSearch) => service.searchPositionSummaries(body));
export const useMeritOrder = (positionId: number) => useApiQuery(() => service.getMeritOrder(positionId), [positionId]);
