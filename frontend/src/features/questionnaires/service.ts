import { assertCapabilityAvailable } from "@/features/capabilities";
import type { Questionnaire, SaveQuestionnaireAnswersRequest } from "./types";

// No HTTP paths are invented here: the backend service has no controller yet.
export async function accessQuestionnaire(_candidateId: number): Promise<Questionnaire> {
  assertCapabilityAvailable("questionnaires");
  throw new Error("El backend no expone el acceso al cuestionario.");
}
export async function savePartialAnswers(_questionnaireId: number, _body: SaveQuestionnaireAnswersRequest): Promise<Questionnaire> {
  assertCapabilityAvailable("questionnaires");
  throw new Error("El backend no expone el guardado de respuestas.");
}
export async function finishQuestionnaireBlock(_questionnaireId: number, _body: SaveQuestionnaireAnswersRequest): Promise<Questionnaire> {
  assertCapabilityAvailable("questionnaires");
  throw new Error("El backend no expone la finalización de bloques.");
}
