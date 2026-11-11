import FactorForm from "@/features/factors/components/factor-form";
export default async function EditFactorPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <FactorForm factorId={Number(id)} />; }
