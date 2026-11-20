import { redirect } from "next/navigation";
import { appRoutes } from "@/shared/navigation/routes";

export default function LegacyEvaluationCompetenciesPage() {
  redirect(appRoutes.evaluationCompetencies);
}
