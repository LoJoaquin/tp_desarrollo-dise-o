import { UnavailablePage } from "@/shared/ui/unavailable-page";
export default function AiQuestionGenerationPage() { return <UnavailablePage title="Generar preguntas con IA" useCase="Asistencia de contenido" reason="El backend no implementa la generación de preguntas con IA." nextStep="Definir proveedor, datos de entrada, revisión humana y endpoint de generación." />; }
