import { api } from "@/shared/api";
import type { AnswerOption, CreateAnswerOptionRequest, UpdateAnswerOptionRequest } from "./types";

export const listAnswerOptions = () => api.get<AnswerOption[]>("opcion-respuesta");
export const searchAnswerOptions = (nombre: string) =>
  api.post<AnswerOption[], { nombre: string }>("opcion-respuesta/buscar", { nombre });
export const getAnswerOption = (id: number) => api.get<AnswerOption>(`opcion-respuesta/${id}`);
export const createAnswerOption = (body: CreateAnswerOptionRequest) => api.post<AnswerOption, CreateAnswerOptionRequest>("opcion-respuesta", body);
export const updateAnswerOption = (id: number, body: UpdateAnswerOptionRequest) => api.patch<AnswerOption, UpdateAnswerOptionRequest>(`opcion-respuesta/${id}`, body);
export const deleteAnswerOption = (id: number) => api.delete(`opcion-respuesta/${id}`);
