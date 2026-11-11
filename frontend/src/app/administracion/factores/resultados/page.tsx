import FactorResults from "@/features/factors/components/factor-results";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export default async function FactorResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <FactorResults criteria={{
    competenciaId: typeof params.competenciaId === "string" ? params.competenciaId : "",
    codigo: typeof params.codigo === "string" ? params.codigo : "",
    nombre: typeof params.nombre === "string" ? params.nombre : "",
  }} />;
}
