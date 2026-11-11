import CompetencyResults from "@/features/competencies/components/competency-results";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export default async function CompetencyResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <CompetencyResults criteria={{
    codigo: typeof params.codigo === "string" ? params.codigo : "",
    nombre: typeof params.nombre === "string" ? params.nombre : "",
  }} />;
}
