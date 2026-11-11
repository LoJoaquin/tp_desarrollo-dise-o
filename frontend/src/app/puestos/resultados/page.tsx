import PositionResults from "@/features/positions/components/position-results";
import type { SearchPositionsRequest } from "@/features/positions/types";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export default async function PositionResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const criteria: SearchPositionsRequest = {
    codigo: typeof params.codigo === "string" ? params.codigo : "",
    nombre: typeof params.nombre === "string" ? params.nombre : "",
    empresa: typeof params.empresa === "string" ? params.empresa : "",
  };
  return <PositionResults criteria={criteria} />;
}
