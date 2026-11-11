"use client";
import { useApiMutation, useApiQuery } from "@/shared/api/hooks";
import * as service from "./service";
import type { CreateCompetencyRequest, UpdateCompetencyRequest } from "./types";

export const useCompetencies = () => useApiQuery(service.listCompetencies);
export const useCompetency = (id: number) => useApiQuery(() => service.getCompetency(id), [id]);
export const useCreateCompetency = () => useApiMutation((body: CreateCompetencyRequest) => service.createCompetency(body));
export const useUpdateCompetency = () => useApiMutation(({ id, body }: { id: number; body: UpdateCompetencyRequest }) => service.updateCompetency(id, body));
export const useReactivateCompetency = () => useApiMutation((id: number) => service.reactivateCompetency(id));
export const useDeleteCompetency = () => useApiMutation((id: number) => service.deleteCompetency(id));
