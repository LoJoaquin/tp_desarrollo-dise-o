import { FeatureUnavailableError } from "@/shared/api/errors";

export type CapabilityState = "available" | "partial" | "unavailable";

export const capabilities = {
  candidates: { state: "partial", reason: "La API existe; revisar validaciones y semántica del PUT." },
  companies: { state: "partial", reason: "La API existe; no ofrece listado general y la modificación necesita validar nombre." },
  competencies: { state: "partial", reason: "La API existe; reglas y auditoría requieren revisión con el enunciado." },
  factors: { state: "partial", reason: "La API existe; la validación de nroOrden requiere revisión." },
  questions: { state: "partial", reason: "La API existe; el contrato de búsqueda y algunas reglas necesitan revisión." },
  answerOptions: { state: "partial", reason: "La API existe; la edición no permite agregar o quitar detalles." },
  positions: { state: "partial", reason: "La API existe; el alta/modificación usa relaciones como objetos anidados." },
  evaluations: { state: "partial", reason: "El flujo HTTP está implementado; falta cotejar alternativas con el enunciado." },
  reports: { state: "partial", reason: "Hay resumen y orden de mérito; revisar fórmula y filtros." },
  consultantLogin: { state: "partial", reason: "Valida contra el LDAP (LDAP_URL) o contra el consultor local de desarrollo; los endpoints todavía no exigen el token." },
  candidateLogin: { state: "available", reason: "Autentica al candidato por tipo y número de documento." },
  questionnaires: { state: "available", reason: "Endpoints de acceso, guardado parcial y finalización de bloques publicados." },
  csvImport: { state: "available", reason: "POST /candidatos/importar con el CSV del sistema de candidatos." },
  csvExport: { state: "available", reason: "Búsqueda de funciones evaluadas y descarga del CSV de resultados." },
  comparativeReport: { state: "available", reason: "Compara lo requerido por la función con lo obtenido por el candidato." },
  questionnaireClosing: { state: "available", reason: "Proceso periódico con registro de ejecución; también se puede ejecutar manualmente." },
  aiQuestionGeneration: { state: "partial", reason: "Requiere configurar OPENAI_API_KEY en el backend." },
} as const satisfies Record<string, { state: CapabilityState; reason: string }>;

export type CapabilityId = keyof typeof capabilities;
type Capability = { state: CapabilityState; reason: string };

export function assertCapabilityAvailable(id: CapabilityId): void {
  const capability: Capability = capabilities[id];
  if (capability.state === "unavailable") {
    throw new FeatureUnavailableError(id, capability.reason);
  }
}

export function getCapabilityMessage(id: CapabilityId): string | null {
  const capability: Capability = capabilities[id];
  return capability.state === "unavailable" ? capability.reason : null;
}
