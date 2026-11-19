"use client";

import { useServiceAction } from "@/shared/hooks/use-service-action";
import * as service from "./service";
import type { CreateFactorRequest, SearchFactorsRequest, UpdateFactorRequest } from "./types";

export const useFactors = () =>
  useServiceAction<void, Awaited<ReturnType<typeof service.listFactors>>>(
    () => service.listFactors(),
  );

export const useFactor = () =>
  useServiceAction((id: number) => service.getFactor(id));

export const useFactorsByCompetency = () =>
  useServiceAction((id: number) => service.listFactorsByCompetency(id));

export const useFactorSearch = () =>
  useServiceAction((criteria: SearchFactorsRequest) => service.searchFactors(criteria));

export const useCreateFactor = () =>
  useServiceAction((body: CreateFactorRequest) => service.createFactor(body));

export const useUpdateFactor = () =>
  useServiceAction(({ id, body }: { id: number; body: UpdateFactorRequest }) =>
    service.updateFactor(id, body),
  );

export const useReactivateFactor = () =>
  useServiceAction(async (id: number) => {
    await service.reactivateFactor(id);
    return true;
  });

export const useDeleteFactor = () =>
  useServiceAction(async (id: number) => {
    await service.deleteFactor(id);
    return true;
  });
