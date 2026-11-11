"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as service from "@/features/questions/service";
import type { Question } from "@/features/questions/types";
import { QuestionEditor } from "@/features/questions/components/question-editor";
import { ErrorMessage, LoadingState } from "@/shared/ui";

export default function UpdateQuestionPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setError(new Error("El identificador de la pregunta no es válido."));
      setLoading(false);
      return;
    }
    service.getQuestion(id).then(setQuestion).catch(setError).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState label="Cargando la pregunta…" />;
  if (error) return <ErrorMessage error={error} />;
  return question ? <QuestionEditor mode="update" question={question} /> : <ErrorMessage error={new Error("No se encontró la pregunta.")} />;
}
