"use client";
import { useServiceAction } from "@/shared/hooks/use-service-action";
import * as service from "./service";
import type { ConfirmEvaluationRequest, SearchEvaluationCandidatesRequest, SelectedCandidatesRequest, VerifyPositionRequest } from "./types";

export const useSearchCandidatesForEvaluation = () =>
  useServiceAction((body: SearchEvaluationCandidatesRequest) => service.searchCandidatesForEvaluation(body));
export const useValidateCandidateSelection = () =>
  useServiceAction((body: SelectedCandidatesRequest) => service.validateSelectionAndListPositions(body));
export const useVerifyEvaluationPosition = () =>
  useServiceAction((body: VerifyPositionRequest) => service.verifyEvaluationPosition(body));
export const useConfirmEvaluation = () =>
  useServiceAction((body: ConfirmEvaluationRequest) => service.confirmEvaluation(body));
