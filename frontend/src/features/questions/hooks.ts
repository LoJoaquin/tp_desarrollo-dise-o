"use client";

import { useServiceAction } from "@/shared/hooks/use-service-action";
import * as service from "./service";
import type { CreateQuestionRequest, SearchQuestionsRequest, UpdateQuestionRequest } from "./types";

export const useQuestions = () =>
  useServiceAction<void, Awaited<ReturnType<typeof service.listQuestions>>>(
    () => service.listQuestions(),
  );

export const useQuestion = () =>
  useServiceAction((id: number) => service.getQuestion(id));

export const useQuestionSearch = () =>
  useServiceAction((criteria: SearchQuestionsRequest) => service.searchQuestions(criteria));

export const useCreateQuestion = () =>
  useServiceAction((body: CreateQuestionRequest) => service.createQuestion(body));

export const useUpdateQuestion = () =>
  useServiceAction(({ id, body }: { id: number; body: UpdateQuestionRequest }) =>
    service.updateQuestion(id, body),
  );

export const useReactivateQuestion = () =>
  useServiceAction(async (id: number) => {
    await service.reactivateQuestion(id);
    return true;
  });

export const useDeleteQuestion = () =>
  useServiceAction(async (id: number) => {
    await service.deleteQuestion(id);
    return true;
  });
