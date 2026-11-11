import QuestionsResults from "@/features/questions/components/questions-results";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function QuestionsResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <QuestionsResults criteria={{
    competenciaId: typeof params.competenciaId === "string" ? params.competenciaId : "",
    factorId: typeof params.factorId === "string" ? params.factorId : "",
    nombre: typeof params.nombre === "string" ? params.nombre : "",
  }} />;
}
