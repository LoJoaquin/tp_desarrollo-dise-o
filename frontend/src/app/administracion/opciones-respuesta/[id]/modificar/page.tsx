import AnswerOptionForm from "@/features/answer-options/components/answer-option-form";

export default async function UpdateAnswerOptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const answerOptionId = Number(id);
  if (!Number.isInteger(answerOptionId) || answerOptionId < 1) {
    return <AnswerOptionForm mode="update" answerOptionId={-1} />;
  }
  return <AnswerOptionForm mode="update" answerOptionId={answerOptionId} />;
}
