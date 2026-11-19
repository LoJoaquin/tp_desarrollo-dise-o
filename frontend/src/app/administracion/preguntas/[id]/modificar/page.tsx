"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuestion } from "@/features/questions/hooks";
import type { Question } from "@/features/questions/types";
import { QuestionEditor } from "@/features/questions/components/question-editor";
import { ErrorMessage, LoadingState } from "@/shared/ui";

export default function UpdateQuestionPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const questionQuery = useQuestion();

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setLoading(false);
      return;
    }
    let mounted = true;
    questionQuery.execute(id).then((row) => { if (mounted && row) setQuestion(row); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id, questionQuery.execute]);

  if (loading) return <LoadingState label="Cargando la pregunta…" />;
  if (!Number.isInteger(id) || id <= 0) return <ErrorMessage error={new Error("El identificador de la pregunta no es válido.")} />;
  if (questionQuery.error) return <ErrorMessage error={questionQuery.error} />;
  return question ? <QuestionEditor mode="update" question={question} /> : <ErrorMessage error={new Error("No se encontró la pregunta.")} />;
}
