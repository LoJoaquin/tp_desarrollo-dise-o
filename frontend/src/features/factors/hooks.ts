"use client";
import { useApiMutation, useApiQuery } from "@/shared/api/hooks";
import * as service from "./service";
import type { CreateFactorRequest, UpdateFactorRequest } from "./types";

export const useFactors = () => useApiQuery(service.listFactors);
export const useFactor = (id: number) => useApiQuery(() => service.getFactor(id), [id]);
export const useFactorsByCompetency = (id: number) => useApiQuery(() => service.listFactorsByCompetency(id), [id]);
export const useCreateFactor = () => useApiMutation((body: CreateFactorRequest) => service.createFactor(body));
export const useUpdateFactor = () => useApiMutation(({ id, body }: { id: number; body: UpdateFactorRequest }) => service.updateFactor(id, body));
export const useReactivateFactor = () => useApiMutation((id: number) => service.reactivateFactor(id));
export const useDeleteFactor = () => useApiMutation((id: number) => service.deleteFactor(id));
