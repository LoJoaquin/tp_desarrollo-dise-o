export type SearchEvaluationCandidatesRequest = { apellido?: string | null; nombre?: string | null; numeroCandidato?: string | null };
export type EvaluationCandidate = { id: number; numeroCandidato: string; nombre: string; apellido: string };
export type SelectedCandidatesRequest = { idsCandidatos: number[] };
export type EvaluationPosition = { idPuesto: number; nombrePuesto: string; nombreEmpresa: string };
export type VerifyPositionRequest = { idPuesto: number };
export type RequiredCompetency = { nombreCompetencia: string; ponderacion: number };
export type ConfirmEvaluationRequest = { idsCandidatos: number[]; idPuesto: number };
export type ConfirmedEvaluation = { apellido: string; nombre: string; tipoDocumento: string; numeroDocumento: string; claveIngreso: string };
