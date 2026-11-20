import { redirect } from "next/navigation";
import { appRoutes } from "@/shared/navigation/routes";

export default function LegacyEvaluationCandidatesPage() {
  redirect(appRoutes.evaluationCandidates);
}
