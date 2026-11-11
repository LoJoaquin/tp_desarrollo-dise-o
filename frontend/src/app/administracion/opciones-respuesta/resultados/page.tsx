import AnswerOptionsResults from "@/features/answer-options/components/answer-options-results";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AnswerOptionsResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <AnswerOptionsResults criteria={{ nombre: typeof params.nombre === "string" ? params.nombre : "" }} />;
}
