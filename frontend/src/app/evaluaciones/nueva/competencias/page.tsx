"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirmEvaluation } from "@/features/evaluations/hooks";
import { readEvaluationFlow, writeEvaluationFlow, type EvaluationFlowState } from "@/features/evaluations/flow";
import { appRoutes } from "@/shared/navigation/routes";
import { Button, DataTable, ErrorMessage, Notice, PageHeader, Panel } from "@/shared/ui";

export default function EvaluationCompetenciesPage() {
  const router = useRouter();
  const [flow, setFlow] = useState<EvaluationFlowState | null>(null);
  const [ready, setReady] = useState(false);
  const action = useConfirmEvaluation();

  useEffect(() => {
    const saved = readEvaluationFlow();
    if (saved?.selectedIds.length && saved.positionId && saved.competencies) setFlow(saved);
    else router.replace(appRoutes.newEvaluation);
    setReady(true);
  }, [router]);

  async function confirm() {
    if (!flow?.positionId || !flow.selectedIds.length) return;
    if (!window.confirm("¿Confirmar la evaluación para los candidatos y el puesto seleccionados?")) return;
    const confirmed = await action.execute({ idsCandidatos: flow.selectedIds, idPuesto: flow.positionId });
    if (!confirmed) return;
    writeEvaluationFlow({ ...flow, confirmed });
    router.push(appRoutes.evaluationResult);
  }

  if (!ready || !flow) return null;
  const selectedPosition = flow.positions.find((item) => item.idPuesto === flow.positionId);
  return <>
    <PageHeader eyebrow="CU025 · Paso 4 de 5" title="Revisar y confirmar evaluación" description="Verificá las competencias requeridas antes de crear los cuestionarios." />
    <div className="space-y-5">
      <Panel title="Resumen"><p><strong>Puesto:</strong> {selectedPosition?.nombrePuesto ?? flow.positionId}{selectedPosition?.nombreEmpresa ? ` · ${selectedPosition.nombreEmpresa}` : ""}</p><p className="mt-1"><strong>Candidatos:</strong> {flow.selectedIds.length}</p></Panel>
      <Panel title="Competencias requeridas">
        {flow.competencies?.length ? <DataTable rows={flow.competencies} rowKey={(row) => row.nombreCompetencia} columns={[{ key: "competencia", header: "Competencia", render: (row) => row.nombreCompetencia }, { key: "ponderacion", header: "Ponderación", render: (row) => row.ponderacion }]} /> : <Notice tone="warning">El puesto no tiene competencias devueltas por el backend; no es posible confirmar.</Notice>}
        <ErrorMessage error={action.error} />
        <div className="mt-5 flex flex-wrap gap-3">
          <Button disabled={!flow.competencies?.length || action.isPending} onClick={confirm}>{action.isPending ? "Creando evaluaciones…" : "Confirmar evaluación"}</Button>
          <Link className="inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold" href={appRoutes.evaluationPosition}>Volver a elegir puesto</Link>
        </div>
      </Panel>
    </div>
  </>;
}
