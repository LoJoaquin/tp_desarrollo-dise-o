import { api } from "@/shared/api";
import type { Competency, CreateCompetencyRequest, UpdateCompetencyRequest } from "./types";

export const listCompetencies = () => api.get<Competency[]>("Competencia");
export const getCompetency = (id: number) => api.get<Competency>(`Competencia/${id}`);
export const createCompetency = (body: CreateCompetencyRequest) => api.post<Competency, CreateCompetencyRequest>("Competencia/crear", body);
export const updateCompetency = (id: number, body: UpdateCompetencyRequest) => api.patch<Competency, UpdateCompetencyRequest>(`Competencia/modificar/${id}`, body);
export const reactivateCompetency = (id: number) => api.patch<Competency>(`Competencia/${id}/reactivar`);
export const deleteCompetency = (id: number) => api.delete(`Competencia/eliminar/${id}`);
