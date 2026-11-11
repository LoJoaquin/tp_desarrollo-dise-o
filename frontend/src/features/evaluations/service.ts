import { api } from "@/shared/api";
import type { ConfirmEvaluationRequest, ConfirmedEvaluation, EvaluationCandidate, EvaluationPosition, RequiredCompetency, SearchEvaluationCandidatesRequest, SelectedCandidatesRequest, VerifyPositionRequest } from "./types";

export const searchCandidatesForEvaluation = (body: SearchEvaluationCandidatesRequest) => api.post<EvaluationCandidate[], SearchEvaluationCandidatesRequest>("evaluar-candidato/candidatos/buscar", body);
export const validateSelectionAndListPositions = (body: SelectedCandidatesRequest) => api.post<EvaluationPosition[], SelectedCandidatesRequest>("evaluar-candidato/candidatos/seleccion", body);
export const verifyEvaluationPosition = (body: VerifyPositionRequest) => api.post<RequiredCompetency[], VerifyPositionRequest>("evaluar-candidato/puesto/verificar", body);
export const confirmEvaluation = (body: ConfirmEvaluationRequest) => api.post<ConfirmedEvaluation[], ConfirmEvaluationRequest>("evaluar-candidato/confirmar", body);
