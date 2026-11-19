import { api } from "@/shared/api";
import type { Factor, CreateFactorRequest, SearchFactorsRequest, UpdateFactorRequest } from "./types";

export const listFactors = () => api.get<Factor[]>("factor");
export const searchFactors = (body: SearchFactorsRequest) =>
  api.post<Factor[], SearchFactorsRequest>("factor/buscar", body);
export const getFactor = (id: number) => api.get<Factor>(`factor/${id}`);
export const listFactorsByCompetency = (id: number) => api.get<Factor[]>(`factor/competencia/${id}`);
export const createFactor = (body: CreateFactorRequest) => api.post<Factor, CreateFactorRequest>("factor", body);
export const updateFactor = (id: number, body: UpdateFactorRequest) => api.patch<Factor, UpdateFactorRequest>(`factor/${id}`, body);
export const reactivateFactor = (id: number) => api.patch<Factor>(`factor/${id}/reactivar`);
export const deleteFactor = (id: number) => api.delete(`factor/${id}`);
