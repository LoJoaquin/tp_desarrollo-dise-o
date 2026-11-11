import CandidateResults from "@/features/candidates/components/candidate-results";
import type { SearchCandidatesRequest } from "@/features/candidates/types";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export default async function CandidateResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const criteria: SearchCandidatesRequest = {
    numeroCandidato: typeof params.numeroCandidato === "string" ? params.numeroCandidato : "",
    apellido: typeof params.apellido === "string" ? params.apellido : "",
    nombre: typeof params.nombre === "string" ? params.nombre : "",
  };
  return <CandidateResults criteria={criteria} />;
}
