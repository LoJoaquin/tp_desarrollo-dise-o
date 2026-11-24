import type { SearchPositionsRequest } from "@/features/positions/types";

export type PositionReportSearch = SearchPositionsRequest;
export type PositionReportSummary = { idPuesto: number; codigoPuesto: string; nombrePuesto: string; empresa: string | null; candidatos: Array<{ nombre: string; apellido: string }>; evaluacionesCompletas: number };
export type MeritCandidate = { idCuestionario: number; idCandidato: number | null; nombre: string | null; apellido: string | null; puntajeObtenido: number | null; ordenMerito: number | null; fechaInicio: string | null; fechaFin: string | null; ultimoIngreso: string | null; cantidadAccesos: number | null };
export type MeritGroup = { estado: string; candidatos: MeritCandidate[] };

// CU007 / CU027: funciones con candidatos evaluados (cuestionario COMPLETO).
export type EvaluatedPositionSearch = { nombre?: string | null; empresa?: string | null; desde?: string | null; hasta?: string | null };
export type EvaluatedPosition = { idPuesto: number; codigoPuesto: string; nombrePuesto: string; empresa: string | null; candidatosEvaluados: number };
export type ComparativeCandidate = { idCuestionario: number; idCandidato: number; nombre: string; apellido: string; tipoDocumento: string | null; numeroDocumento: string | null; numeroCandidato: string | null; fechaFinalizacion: string | null };
export type CompetencyComparison = { idCompetencia: number; nombreCompetencia: string; valorRequerido: number; valorObtenido: number };
export type ComparativeReport = { idPuesto: number; codigoPuesto: string; nombrePuesto: string; empresa: string | null; candidato: ComparativeCandidate; competencias: CompetencyComparison[] };
export type DateRange = { desde?: string | null; hasta?: string | null };
