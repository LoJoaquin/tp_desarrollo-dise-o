"use client";
import { useServiceAction } from "@/shared/hooks/use-service-action";
import { accessQuestionnaire, finishQuestionnaireBlock, savePartialAnswers } from "./service";
import type { SaveQuestionnaireAnswersRequest } from "./types";

export const useQuestionnaireAccess = () =>
  useServiceAction(({ token, claveIngreso }: { token: string; claveIngreso: string }) =>
    accessQuestionnaire(token, claveIngreso),
  );
export const useSavePartialAnswers = () =>
  useServiceAction(({ token, id, body }: { token: string; id: number; body: SaveQuestionnaireAnswersRequest }) =>
    savePartialAnswers(token, id, body),
  );
export const useFinishQuestionnaireBlock = () =>
  useServiceAction(({ token, id, body }: { token: string; id: number; body: SaveQuestionnaireAnswersRequest }) =>
    finishQuestionnaireBlock(token, id, body),
  );
