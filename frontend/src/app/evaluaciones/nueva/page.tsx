"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSearchCandidatesForEvaluation } from "@/features/evaluations/hooks";
import { clearEvaluationFlow, writeEvaluationFlow } from "@/features/evaluations/flow";
import type { SearchEvaluationCandidatesRequest } from "@/features/evaluations/types";
import { appRoutes } from "@/shared/navigation/routes";
import { Button, ErrorMessage, Field, PageHeader, Panel, ValidationSummary } from "@/shared/ui";

export default function NewEvaluationPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState<SearchEvaluationCandidatesRequest>({ apellido: "", nombre: "", numeroCandidato: "" });
  const [validation, setValidation] = useState<string[]>([]);
  const searchAction = useSearchCandidatesForEvaluation();

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Object.values(criteria).some((value) => value?.trim())) {
      setValidation(["Completá al menos un criterio de búsqueda."]);
      return;
    }
    setValidation([]);
    clearEvaluationFlow();
    const candidates = await searchAction.execute(criteria);
    if (candidates) {
      writeEvaluationFlow({ criteria, candidates, selectedIds: [], positions: [], positionId: null, competencies: null, confirmed: null });
      router.push(appRoutes.evaluationCandidates);
    }
  }

  return <>
    <PageHeader eyebrow="CU025 · Paso 1 de 5" title="Buscar candidatos para evaluar" description="Ingresá al menos un criterio. Nombre y apellido admiten coincidencias parciales." />
    <Panel title="Criterios de búsqueda">
      <form onSubmit={search} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Número de candidato" value={criteria.numeroCandidato ?? ""} onChange={(event) => setCriteria({ ...criteria, numeroCandidato: event.target.value })} />
          <Field label="Apellido" value={criteria.apellido ?? ""} onChange={(event) => setCriteria({ ...criteria, apellido: event.target.value })} />
          <Field label="Nombre" value={criteria.nombre ?? ""} onChange={(event) => setCriteria({ ...criteria, nombre: event.target.value })} />
        </div>
        <ValidationSummary errors={validation} />
        <ErrorMessage error={searchAction.error} />
        <div><Button type="submit" disabled={searchAction.isPending}>{searchAction.isPending ? "Buscando…" : "Buscar candidatos"}</Button></div>
      </form>
    </Panel>
  </>;
}
