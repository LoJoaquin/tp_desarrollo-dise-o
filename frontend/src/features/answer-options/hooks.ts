"use client";

import { useServiceAction } from "@/shared/hooks/use-service-action";
import * as service from "./service";
import type { CreateAnswerOptionRequest, UpdateAnswerOptionRequest } from "./types";

export const useAnswerOptions = () =>
  useServiceAction<void, Awaited<ReturnType<typeof service.listAnswerOptions>>>(
    () => service.listAnswerOptions(),
  );

export const useAnswerOptionSearch = () =>
  useServiceAction((nombre: string) => service.searchAnswerOptions(nombre));

export const useAnswerOption = () =>
  useServiceAction((id: number) => service.getAnswerOption(id));

export const useCreateAnswerOption = () =>
  useServiceAction((body: CreateAnswerOptionRequest) => service.createAnswerOption(body));

export const useUpdateAnswerOption = () =>
  useServiceAction(({ id, body }: { id: number; body: UpdateAnswerOptionRequest }) =>
    service.updateAnswerOption(id, body),
  );

export const useDeleteAnswerOption = () =>
  useServiceAction(async (id: number) => {
    await service.deleteAnswerOption(id);
    return true;
  });
