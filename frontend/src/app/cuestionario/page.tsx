"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Notice, PageHeader, Panel, StatusBadge } from "@/shared/ui";

const exampleQuestions = [
  { id: 1, factor: "Organización", text: "Cuando tengo varias tareas pendientes, suelo…", answers: ["Ordenarlas por prioridad", "Resolverlas en el orden en que aparecen", "Pedir ayuda para organizarlas"] },
  { id: 2, factor: "Comunicación", text: "Si no estoy de acuerdo con una decisión del equipo…", answers: ["Explico mi punto de vista con respeto", "Prefiero no comentarlo", "Busco primero más información"] },
  { id: 3, factor: "Resolución de problemas", text: "Ante un problema nuevo en el trabajo…", answers: ["Analizo las causas y propongo alternativas", "Espero instrucciones", "Pruebo una solución conocida"] },
];

export default function QuestionnairePage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [notice, setNotice] = useState("");
  const answered = Object.keys(answers).length;

  return <>
    <PageHeader eyebrow="Perfil candidato · CU026" title="Cuestionario de ejemplo" description="Así se vería el recorrido de un candidato al responder. Las preguntas y opciones de esta pantalla son inventadas para mostrar el formato." actions={<Link href="/" className="text-sm font-semibold text-[var(--color-brand)]">Cambiar perfil</Link>} />
    <Notice tone="warning" title="Modo de demostración: no hay un cuestionario real cargado">El backend todavía no publica el acceso, la lectura de preguntas, el guardado de respuestas ni la finalización del cuestionario. Estos datos no vienen de la base y las respuestas solo se conservan mientras esta página está abierta.</Notice>
    <Panel title="Evaluación para Analista de selección" description="Ejemplo ficticio · Bloque 1 de 3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><StatusBadge tone="warning">Datos inventados</StatusBadge><span className="text-sm text-slate-600">Preguntas respondidas: {answered} de {exampleQuestions.length}</span></div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`Progreso ${answered} de ${exampleQuestions.length}`}><div className="h-full rounded-full bg-[var(--color-brand)] transition-all" style={{ width: `${(answered / exampleQuestions.length) * 100}%` }} /></div>
      <div className="space-y-5">{exampleQuestions.map((question, index) => <section key={question.id} className="rounded-lg border border-[var(--color-border)] p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">Pregunta {index + 1} · {question.factor}</p><h2 className="mt-2 font-semibold">{question.text}</h2>
        <fieldset className="mt-4 grid gap-2"><legend className="sr-only">Elegí una respuesta</legend>{question.answers.map((answer, optionIndex) => <label key={answer} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50"><input type="radio" name={`question-${question.id}`} className="mt-0.5 accent-blue-700" checked={answers[question.id] === optionIndex} onChange={() => { setAnswers({ ...answers, [question.id]: optionIndex }); setNotice(""); }} /><span>{answer}</span></label>)}</fieldset>
      </section>)}</div>
      {notice && <Notice tone="error" title="No se enviaron las respuestas">{notice}</Notice>}
      <div className="mt-6 flex flex-wrap gap-3"><Button variant="secondary" onClick={() => setNotice("El backend todavía no ofrece el guardado parcial de respuestas. La selección que ves es local y temporal.")}>Guardar y continuar después</Button><Button onClick={() => setNotice(answered < exampleQuestions.length ? "Respondé todas las preguntas de este ejemplo. Cuando estén completas, el backend todavía necesita el endpoint para finalizar el bloque." : "El backend todavía no ofrece el endpoint para finalizar el cuestionario. Tus respuestas no se guardaron.")}>Finalizar bloque</Button></div>
    </Panel>
    <Panel className="mt-5" title="Qué falta para usar preguntas reales"><p className="text-sm leading-6 text-slate-600">Publicar endpoints para autenticar al candidato y obtener su cuestionario activo, devolver bloques/preguntas/opciones, guardar respuestas parciales y finalizar cada bloque. Hasta entonces, no se puede saber desde el frontend si la base contiene un cuestionario; por eso se indica claramente que este es un ejemplo ficticio.</p></Panel>
  </>;
}
