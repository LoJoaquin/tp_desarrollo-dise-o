"use client";
import { useServiceAction } from "@/shared/hooks/use-service-action";
import * as service from "./service";
import type { DateRange, EvaluatedPositionSearch, PositionReportSearch } from "./types";

export const useSearchPositionSummaries = () =>
  useServiceAction((body: PositionReportSearch) => service.searchPositionSummaries(body));
export const useMeritOrder = () =>
  useServiceAction((positionId: number) => service.getMeritOrder(positionId));
export const useEvaluatedPositions = () =>
  useServiceAction((body: EvaluatedPositionSearch) => service.searchEvaluatedPositions(body));
export const useEvaluatedCandidates = () =>
  useServiceAction((input: { positionId: number; range?: DateRange }) => service.getEvaluatedCandidates(input.positionId, input.range));
export const useComparativeReport = () =>
  useServiceAction((input: { positionId: number; questionnaireId: number }) => service.getComparativeReport(input.positionId, input.questionnaireId));
export const useExportResults = () =>
  useServiceAction((input: { positionId: number; range?: DateRange }) => service.exportResults(input.positionId, input.range));
