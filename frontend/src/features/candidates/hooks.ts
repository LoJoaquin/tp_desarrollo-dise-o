"use client";
import { useApiMutation, useApiQuery } from "@/shared/api/hooks";
import * as service from "./service";
import type { CreateCandidateRequest, SearchCandidatesRequest, UpdateCandidateRequest } from "./types";

export const useCandidateSearch = (criteria: SearchCandidatesRequest) => useApiQuery(() => service.searchCandidates(criteria), [criteria.numeroCandidato, criteria.nombre, criteria.apellido]);
export const useNationalities = () => useApiQuery(service.listNationalities, []);
export const useCreateCandidate = () => useApiMutation((body: CreateCandidateRequest) => service.createCandidate(body));
export const useUpdateCandidate = () => useApiMutation(({ id, body }: { id: number; body: UpdateCandidateRequest }) => service.updateCandidate(id, body));
export const useDeleteCandidate = () => useApiMutation((id: number) => service.deleteCandidate(id));
