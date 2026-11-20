import { redirect } from "next/navigation";
import { appRoutes } from "@/shared/navigation/routes";

export default function LegacyEvaluationResultPage() {
  redirect(appRoutes.evaluationResult);
}
