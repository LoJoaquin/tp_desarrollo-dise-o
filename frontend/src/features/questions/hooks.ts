"use client";
import { useApiMutation, useApiQuery } from "@/shared/api/hooks";
import * as service from "./service";
import type { CreateQuestionRequest, UpdateQuestionRequest } from "./types";

export const useQuestions = () => useApiQuery(service.listQuestions);
export const useQuestion = (id: number) => useApiQuery(() => service.getQuestion(id), [id]);
export const useCreateQuestion = () => useApiMutation((body: CreateQuestionRequest) => service.createQuestion(body));
export const useUpdateQuestion = () => useApiMutation(({ id, body }: { id: number; body: UpdateQuestionRequest }) => service.updateQuestion(id, body));
export const useReactivateQuestion = () => useApiMutation((id: number) => service.reactivateQuestion(id));
export const useDeleteQuestion = () => useApiMutation((id: number) => service.deleteQuestion(id));
