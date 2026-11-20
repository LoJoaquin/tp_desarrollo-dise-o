import { ComparativePositionResults } from "@/features/reports/components/comparative-position-results";
import type { SearchPositionsRequest } from "@/features/positions/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ComparativePositionResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const criteria: SearchPositionsRequest = {
    nombre: typeof params.nombre === "string" ? params.nombre : "",
    empresa: typeof params.empresa === "string" ? params.empresa : "",
  };
  return <ComparativePositionResults criteria={criteria} />;
}
