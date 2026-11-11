import PositionForm from "@/features/positions/components/position-form";
export default async function EditPositionPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <PositionForm positionId={Number(id)} />; }
