import { api } from "@/shared/api";
import type { Candidate, CandidateCreatedResponse, CreateCandidateRequest, NationalityOption, SearchCandidatesRequest, UpdateCandidateRequest } from "./types";

export const createCandidate = (body: CreateCandidateRequest) => api.post<CandidateCreatedResponse, CreateCandidateRequest>("candidatos", body);
export const searchCandidates = (body: SearchCandidatesRequest) => api.post<Candidate[], SearchCandidatesRequest>("candidatos/buscar", body);
export const updateCandidate = (id: number, body: UpdateCandidateRequest) => api.put<Candidate, UpdateCandidateRequest>(`candidatos/${id}`, body);
export const deleteCandidate = (id: number) => api.delete(`candidatos/${id}`);
export const listNationalities = () => api.get<NationalityOption[]>("candidatos/nacionalidades");
