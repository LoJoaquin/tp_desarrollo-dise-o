"use client";
import { useServiceAction } from "@/shared/hooks/use-service-action";
import * as service from "./service";
import type { PositionReportSearch } from "./types";

export const useSearchPositionSummaries = () =>
  useServiceAction((body: PositionReportSearch) => service.searchPositionSummaries(body));
export const useMeritOrder = () =>
  useServiceAction((positionId: number) => service.getMeritOrder(positionId));
