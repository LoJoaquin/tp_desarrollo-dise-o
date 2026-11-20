import { redirect } from "next/navigation";
import { appRoutes } from "@/shared/navigation/routes";

export default function LegacyEvaluationPositionPage() {
  redirect(appRoutes.evaluationPosition);
}
