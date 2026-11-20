import { api } from "@/shared/api";
import type { Question, CreateQuestionRequest, UpdateQuestionRequest, SearchQuestionsRequest, GenerateQuestionWithAiRequest, GeneratedQuestionPreview, ConfirmGeneratedQuestionRequest, GeneratedQuestionSaved } from "./types";

export const listQuestions = () => api.get<Question[]>("Pregunta");
export const searchQuestions = (body: SearchQuestionsRequest) =>
  api.post<Question[], SearchQuestionsRequest>("Pregunta/buscar", body);
export const getQuestion = (id: number) => api.get<Question>(`Pregunta/${id}`);
export const createQuestion = (body: CreateQuestionRequest) => api.post<Question, CreateQuestionRequest>("Pregunta/crear", body);
export const updateQuestion = (id: number, body: UpdateQuestionRequest) => api.patch<Question, UpdateQuestionRequest>(`Pregunta/modificar/${id}`, body);
export const reactivateQuestion = (id: number) => api.patch<Question>(`Pregunta/${id}/reactivar`);
export const deleteQuestion = (id: number) => api.delete(`Pregunta/eliminar/${id}`);
export const generateQuestionWithAi = (body: GenerateQuestionWithAiRequest) =>
  api.post<GeneratedQuestionPreview, GenerateQuestionWithAiRequest>("Pregunta/ia/generar", body);
export const confirmGeneratedQuestion = (body: ConfirmGeneratedQuestionRequest) =>
  api.post<GeneratedQuestionSaved, ConfirmGeneratedQuestionRequest>("Pregunta/ia/confirmar", body);
