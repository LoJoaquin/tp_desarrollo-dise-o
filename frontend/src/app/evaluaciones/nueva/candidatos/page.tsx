"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useValidateCandidateSelection } from "@/features/evaluations/hooks";
import { readEvaluationFlow, writeEvaluationFlow, type EvaluationFlowState } from "@/features/evaluations/flow";
import { appRoutes } from "@/shared/navigation/routes";
import { Button, DataTable, ErrorMessage, Notice, PageHeader, Panel } from "@/shared/ui";

export default function EvaluationCandidatesPage() {
  const router = useRouter();
  const [flow, setFlow] = useState<EvaluationFlowState | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const action = useValidateCandidateSelection();

  useEffect(() => {
    const saved = readEvaluationFlow();
    if (saved) { setFlow(saved); setSelected(saved.selectedIds); }
    else router.replace(appRoutes.newEvaluation);
    setReady(true);
  }, [router]);

  async function continueToPosition() {
    if (!flow || selected.length === 0) return;
    const positions = await action.execute({ idsCandidatos: selected }, "Selección validada.");
    if (!positions) return;
    const updated = { ...flow, selectedIds: selected, positions, positionId: null, competencies: null, confirmed: null };
    writeEvaluationFlow(updated);
    router.push(appRoutes.evaluationPosition);
  }

  if (!ready || !flow) return null;
  return <>
    <PageHeader eyebrow="CU025 · Paso 2 de 5" title="Seleccionar candidatos" description="Revisá los resultados y marcá uno o varios candidatos para continuar." />
    <Panel title="Resultados de la búsqueda" description={`Candidatos encontrados: ${flow.candidates.length}`}>
      <DataTable rows={flow.candidates} rowKey={(row) => row.id} emptyTitle="No se encontraron candidatos" emptyDescription="Volvé a la búsqueda y probá con otros criterios." columns={[
        { key: "select", header: "Seleccionar", render: (row) => <input aria-label={`Seleccionar ${row.nombre} ${row.apellido}`} type="checkbox" checked={selected.includes(row.id)} onChange={() => setSelected((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])} /> },
        { key: "numero", header: "N.º candidato", render: (row) => row.numeroCandidato },
        { key: "apellido", header: "Apellido", render: (row) => row.apellido },
        { key: "nombre", header: "Nombre", render: (row) => row.nombre },
      ]} />
      <ErrorMessage error={action.error} />
      <div className="mt-5 flex flex-wrap gap-3">
        <Button disabled={!selected.length || action.isPending} onClick={continueToPosition}>{action.isPending ? "Validando…" : "Validar selección y elegir puesto"}</Button>
        <Link className="inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold" href={appRoutes.newEvaluation}>Volver a buscar</Link>
      </div>
      {selected.length === 0 && <Notice tone="info">Seleccioná al menos un candidato para continuar.</Notice>}
    </Panel>
  </>;
}
