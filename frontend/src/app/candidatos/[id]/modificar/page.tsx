import CandidateForm from "@/features/candidates/components/candidate-form";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export default async function EditCandidatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <CandidateForm candidateId={Number(id)} numeroCandidato={typeof query.numeroCandidato === "string" ? query.numeroCandidato : undefined} />;
}
