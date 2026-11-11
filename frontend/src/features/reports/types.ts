import type { SearchPositionsRequest } from "@/features/positions/types";

export type PositionReportSearch = SearchPositionsRequest;
export type PositionReportSummary = { idPuesto: number; codigoPuesto: string; nombrePuesto: string; empresa: string | null; candidatos: Array<{ nombre: string; apellido: string }>; evaluacionesCompletas: number };
export type MeritCandidate = { idCuestionario: number; idCandidato: number | null; nombre: string | null; apellido: string | null; puntajeObtenido: number | null; ordenMerito: number | null; fechaInicio: string | null; fechaFin: string | null; ultimoIngreso: string | null; cantidadAccesos: number | null };
export type MeritGroup = { estado: string; candidatos: MeritCandidate[] };
