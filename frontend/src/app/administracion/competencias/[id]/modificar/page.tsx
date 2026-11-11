import CompetencyForm from "@/features/competencies/components/competency-form";
export default async function EditCompetencyPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CompetencyForm competencyId={Number(id)} />; }
