"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadEvaluationKeysExcel, readEvaluationFlow, type EvaluationFlowState } from "@/features/evaluations/flow";
import { appRoutes } from "@/shared/navigation/routes";
import { Button, DataTable, Notice, PageHeader, Panel } from "@/shared/ui";

export default function EvaluationResultPage() {
  const router = useRouter();
  const [flow, setFlow] = useState<EvaluationFlowState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readEvaluationFlow();
    if (saved?.confirmed) setFlow(saved);
    else router.replace(appRoutes.newEvaluation);
    setReady(true);
  }, [router]);

  if (!ready || !flow?.confirmed) return null;
  const position = flow.positions.find((item) => item.idPuesto === flow.positionId);
  const positionName = position?.nombrePuesto ?? "Puesto";
  return <>
    <PageHeader eyebrow="CU025 · Paso 5 de 5" title="Evaluaciones creadas" description="Los cuestionarios se generaron correctamente. Compartí cada clave con el candidato correspondiente." />
    <Panel title="Claves de ingreso">
      <Notice tone="success" title="Evaluación confirmada">La lista contiene datos personales y claves de acceso. Descargala y compartila de forma segura.</Notice>
      <DataTable rows={flow.confirmed} rowKey={(row) => `${row.numeroDocumento}-${row.claveIngreso}`} emptyTitle="No se generaron evaluaciones" columns={[
        { key: "candidate", header: "Candidato", render: (row) => `${row.apellido}, ${row.nombre}` },
        { key: "document", header: "Documento", render: (row) => `${row.tipoDocumento} ${row.numeroDocumento}` },
        { key: "key", header: "Clave de ingreso", render: (row) => <strong className="font-mono">{row.claveIngreso}</strong> },
      ]} />
      <Panel className="mt-5" title="¿Querés exportar la lista y las claves a Excel?" description="El archivo incluye nombre, apellido, tipo y número de documento, y clave de ingreso.">
        <div className="flex flex-wrap gap-3">
          <Button disabled={!flow.confirmed.length} onClick={() => downloadEvaluationKeysExcel(flow.confirmed ?? [], positionName)}>Descargar Excel</Button>
          <Link className="inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold" href="/consultor">No, volver al inicio</Link>
          <Link className="inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold" href={appRoutes.newEvaluation}>Finalizar y comenzar otra evaluación</Link>
        </div>
      </Panel>
    </Panel>
  </>;
}
