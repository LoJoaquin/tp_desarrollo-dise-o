import type { Competency } from "@/features/competencies/types";
import type { AnswerOption } from "@/features/answer-options/types";

export type QuestionFactor = { id: number; codigo: string; nombre: string; descripcion: string | null; nroOrden: number | null; estaActvivo: boolean; competencia: Competency | null };
export type Question = {
  id: number;
  factor: QuestionFactor | null;
  name: string;
  textoPregunta: string;
  descripcion: string | null;
  estaActivo: boolean | null;
  opcionRespuesta: AnswerOption | null;
};
export type QuestionWeightRequest = { detalleOpcionRespuestaId: number; ponderacion: number };
export type CreateQuestionRequest = { competenciaId: number; idFactor: number; nombre: string; textoPregunta: string; descripcion?: string | null; idOpcionRespuesta: number; ponderaciones: QuestionWeightRequest[] };
export type UpdateQuestionRequest = { nombre?: string | null; textoPregunta?: string | null; descripcion?: string | null; idOpcionRespuesta?: number | null; ponderaciones?: QuestionWeightRequest[] };
export type SearchQuestionsRequest = {
  competenciaId?: number | null;
  factorId?: number | null;
  nombreCompetencia?: string;
  nombreFactor?: string;
  nombrePregunta?: string;
};
