"use client";
import { useApiMutation, useApiQuery } from "@/shared/api/hooks";
import * as service from "./service";
import type { CreateAnswerOptionRequest, UpdateAnswerOptionRequest } from "./types";

export const useAnswerOptions = () => useApiQuery(service.listAnswerOptions);
export const useAnswerOption = (id: number) => useApiQuery(() => service.getAnswerOption(id), [id]);
export const useCreateAnswerOption = () => useApiMutation((body: CreateAnswerOptionRequest) => service.createAnswerOption(body));
export const useUpdateAnswerOption = () => useApiMutation(({ id, body }: { id: number; body: UpdateAnswerOptionRequest }) => service.updateAnswerOption(id, body));
export const useDeleteAnswerOption = () => useApiMutation((id: number) => service.deleteAnswerOption(id));
