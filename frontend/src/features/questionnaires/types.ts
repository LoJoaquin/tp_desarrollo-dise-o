import type { EstadoCuestionario } from "@/shared/types/enums";

export type Questionnaire = { idCuestionario: number; estado: EstadoCuestionario; bloque: number | null; preguntas: QuestionnaireQuestion[]; respuestasGuardadas: QuestionnaireAnswer[]; puntajeFinal: number | null; cumplePonderacionMinima: boolean | null; puntajesPorCompetencia: Record<number, number> | null };
export type QuestionnaireQuestion = { idPregunta: number; texto: string; descripcion: string | null; orden: number; opciones: Array<{ id: number; descripcion: string; ordenVisualizacion: number }> };
export type QuestionnaireAnswer = { idPregunta: number; idDetalleOpcionRespuesta: number };
export type SaveQuestionnaireAnswersRequest = { respuestas: QuestionnaireAnswer[] };
