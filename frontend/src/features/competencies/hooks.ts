"use client";

import { useServiceAction } from "@/shared/hooks/use-service-action";
import * as service from "./service";
import type { CreateCompetencyRequest, UpdateCompetencyRequest } from "./types";

export const useCompetencies = () =>
  useServiceAction<void, Awaited<ReturnType<typeof service.listCompetencies>>>(
    () => service.listCompetencies(),
  );

export const useCompetency = () =>
  useServiceAction((id: number) => service.getCompetency(id));

export const useCompetencySearch = () =>
  useServiceAction((criteria: { codigo?: string; nombre?: string }) =>
    service.searchCompetencies(criteria),
  );

export const useCreateCompetency = () =>
  useServiceAction((body: CreateCompetencyRequest) => service.createCompetency(body));

export const useUpdateCompetency = () =>
  useServiceAction(({ id, body }: { id: number; body: UpdateCompetencyRequest }) =>
    service.updateCompetency(id, body),
  );

export const useReactivateCompetency = () =>
  useServiceAction(async (id: number) => {
    await service.reactivateCompetency(id);
    return true;
  });

export const useDeleteCompetency = () =>
  useServiceAction(async (id: number) => {
    await service.deleteCompetency(id);
    return true;
  });
