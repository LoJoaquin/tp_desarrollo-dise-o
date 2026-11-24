"use client";

import { useServiceAction } from "@/shared/hooks/use-service-action";
import * as service from "./service";
import type { CreateCandidateRequest, SearchCandidatesRequest, UpdateCandidateRequest } from "./types";

export const useCandidateSearch = () =>
  useServiceAction((criteria: SearchCandidatesRequest) => service.searchCandidates(criteria));

export const useCandidateLookupByNumber = () =>
  useServiceAction((numeroCandidato: string) => service.searchCandidates({ numeroCandidato }));

export const useNationalities = () =>
  useServiceAction<void, Awaited<ReturnType<typeof service.listNationalities>>>(
    () => service.listNationalities(),
  );

export const useCreateCandidate = () =>
  useServiceAction((body: CreateCandidateRequest) => service.createCandidate(body));

export const useUpdateCandidate = () =>
  useServiceAction(({ id, body }: { id: number; body: UpdateCandidateRequest }) =>
    service.updateCandidate(id, body),
  );

export const useDeleteCandidate = () =>
  useServiceAction(async (id: number) => {
    await service.deleteCandidate(id);
    return true;
  });
export const useImportCandidates = () =>
  useServiceAction((file: File) => service.importCandidates(file));
