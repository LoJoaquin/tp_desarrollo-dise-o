"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/shared/api";
import { useServiceAction } from "@/shared/hooks/use-service-action";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel, StatusBadge } from "@/shared/ui";

type Execution = { id: number; fechaHora: string; accion: "INICIO" | "FINALIZACION" | "ERROR"; origen: "AUTOMATICO" | "MANUAL"; cuestionariosIncompletos: number | null; cuestionariosSinContestar: number | null; detalle: string | null };
type ExecutionResult = { fechaEjecucion: string; cuestionariosIncompletos: number; cuestionariosSinContestar: number };

const listExecutions = () => api.get<Execution[]>("procesos/finalizar-cuestionarios/ejecuciones");
const runProcess = () => api.post<ExecutionResult, Record<string, never>>("procesos/finalizar-cuestionarios/ejecutar", {});

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-AR");
}

export default function QuestionnaireClosurePage() {
  const [rows, setRows] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const list = useServiceAction(listExecutions);
  const run = useServiceAction(runProcess);

  const reload = useCallback(async () => {
    const result = await list.execute(undefined);
    if (result) setRows(result);
    setLoading(false);
  }, [list.execute]);

  useEffect(() => { void reload(); }, [reload]);

  async function execute() {
    const result = await run.execute(undefined);
    if (result) setLastResult(result);
    await reload();
  }

  return <>
    <PageHeader eyebrow="Sistema · CU032" title="Finalizar cuestionarios" description="El sistema ejecuta este proceso en forma periódica: los cuestionarios en proceso con el plazo vencido pasan a Incompleto y los activos que no se iniciaron a tiempo pasan a Sin contestar." actions={<Button onClick={execute} disabled={run.isPending}>{run.isPending ? "Ejecutando…" : "Ejecutar ahora"}</Button>} />
    {lastResult && <Notice tone="success" title="Ejecución finalizada">{lastResult.cuestionariosIncompletos} cuestionario(s) pasaron a Incompleto y {lastResult.cuestionariosSinContestar} a Sin contestar.</Notice>}
    <ErrorMessage error={run.error} />
    <Panel title="Registro de ejecuciones" description="Últimas 50 entradas: fecha, hora y acción (inicio o finalización) de cada ejecución.">
      {loading ? <LoadingState /> : <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="Todavía no hay ejecuciones registradas"
        columns={[
          { key: "fecha", header: "Fecha y hora", render: (row) => formatDateTime(row.fechaHora) },
          { key: "accion", header: "Acción", render: (row) => <StatusBadge tone={row.accion === "ERROR" ? "danger" : row.accion === "FINALIZACION" ? "success" : "neutral"}>{row.accion === "FINALIZACION" ? "Finalización" : row.accion === "INICIO" ? "Inicio" : "Error"}</StatusBadge> },
          { key: "origen", header: "Origen", render: (row) => row.origen === "AUTOMATICO" ? "Automático" : "Manual" },
          { key: "incompletos", header: "→ Incompleto", render: (row) => row.cuestionariosIncompletos ?? "—" },
          { key: "sinContestar", header: "→ Sin contestar", render: (row) => row.cuestionariosSinContestar ?? "—" },
          { key: "detalle", header: "Detalle", render: (row) => row.detalle ?? "—" },
        ]}
      />}
      <ErrorMessage error={list.error} />
    </Panel>
  </>;
}
