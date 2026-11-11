import { UnavailablePage } from "@/shared/ui/unavailable-page";
export default function QuestionnaireClosurePage() { return <UnavailablePage title="Cierre de cuestionarios" useCase="Proceso periódico" reason="El backend todavía no implementa el cierre automático o periódico de cuestionarios." nextStep="Implementar la regla de vencimientos y el proceso que actualiza los estados." />; }
