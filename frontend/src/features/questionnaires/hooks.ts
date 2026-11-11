"use client";
import { useApiMutation } from "@/shared/api/hooks";
import { accessQuestionnaire, finishQuestionnaireBlock, savePartialAnswers } from "./service";
import type { SaveQuestionnaireAnswersRequest } from "./types";

export const useQuestionnaireAccess = () => useApiMutation((candidateId: number) => accessQuestionnaire(candidateId));
export const useSavePartialAnswers = () => useApiMutation(({ id, body }: { id: number; body: SaveQuestionnaireAnswersRequest }) => savePartialAnswers(id, body));
export const useFinishQuestionnaireBlock = () => useApiMutation(({ id, body }: { id: number; body: SaveQuestionnaireAnswersRequest }) => finishQuestionnaireBlock(id, body));
