"use client";
import { useApiMutation } from "@/shared/api/hooks";
import * as service from "./service";
import type { ConfirmEvaluationRequest, SearchEvaluationCandidatesRequest, SelectedCandidatesRequest, VerifyPositionRequest } from "./types";

export const useSearchCandidatesForEvaluation = () => useApiMutation((body: SearchEvaluationCandidatesRequest) => service.searchCandidatesForEvaluation(body));
export const useValidateCandidateSelection = () => useApiMutation((body: SelectedCandidatesRequest) => service.validateSelectionAndListPositions(body));
export const useVerifyEvaluationPosition = () => useApiMutation((body: VerifyPositionRequest) => service.verifyEvaluationPosition(body));
export const useConfirmEvaluation = () => useApiMutation((body: ConfirmEvaluationRequest) => service.confirmEvaluation(body));
