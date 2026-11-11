"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as questionService from "@/features/questions/service";
import type { Question } from "@/features/questions/types";
import { useAction } from "@/shared/hooks/use-action";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel } from "@/shared/ui";

type Criteria = { competenciaId: string; factorId: string; nombre: string };

export default function QuestionsResults({ criteria }: { criteria: Criteria }) {
  const router = useRouter();
  const [allRows, setAllRows] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [removedName, setRemovedName] = useState("");
  const [auditMissing, setAuditMissing] = useState(false);
  const action = useAction();

  useEffect(() => {
    setLoading(true);
    questionService.listQuestions()
      .then((questions) => setAllRows(questions.filter((question) => question.estaActivo !== false)))
      .catch(setLoadError)
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const nameNeedle = criteria.nombre.trim().toLocaleLowerCase("es-AR");
    return allRows.filter((question) => {
      const competencyMatches = !criteria.competenciaId || question.factor?.competencia?.id === Number(criteria.competenciaId);
      const factorMatches = !criteria.factorId || question.factor?.id === Number(criteria.factorId);
      const nameMatches = !nameNeedle || question.name.toLocaleLowerCase("es-AR").includes(nameNeedle);
      return competencyMatches && factorMatches && nameMatches;
    });
  }, [allRows, criteria]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);

  async function remove(question: Question) {
    if (!window.confirm(`Los datos de la pregunta “${question.name}” serán eliminados del sistema. ¿Continuar?`)) return;
    const result = await action.run(async () => {
      await questionService.deleteQuestion(question.id);
      return true;
    });
    if (result) {
      setAllRows((current) => current.filter((item) => item.id !== question.id));
      setRemovedName(question.name);
      setAuditMissing(true);
    }
  }

  return <>
    <PageHeader eyebrow="CU020 · Gestión" title="Gestionar preguntas" description="Resultado de la búsqueda de preguntas." actions={<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => router.push("/administracion/preguntas")}>Volver a buscar</Button><Button onClick={() => router.push("/administracion/preguntas/nueva")}>Nueva pregunta</Button></div>} />
    <Panel title="Resultados de la búsqueda" description="Se muestran las preguntas que coinciden con los criterios ingresados.">
      {loading ? <LoadingState label="Buscando preguntas…" /> : <DataTable rows={visibleRows} rowKey={(row) => row.id} columns={[
        { key: "competencia", header: "Competencia", render: (row) => row.factor?.competencia?.nombre ?? "—" },
        { key: "factor", header: "Factor", render: (row) => row.factor?.nombre ?? "—" },
        { key: "pregunta", header: "Pregunta", render: (row) => <div><strong className="block">{row.name}</strong><span className="mt-1 block text-slate-600">{row.textoPregunta}</span></div> },
        { key: "acciones", header: "Acciones", render: (row) => <div className="flex gap-2">
          <Button variant="secondary" aria-label={`Modificar ${row.name}`} title="Modificar" onClick={() => router.push(`/administracion/preguntas/${row.id}/modificar`)}>✎</Button>
          <Button variant="danger" aria-label={`Eliminar ${row.name}`} title="Eliminar" onClick={() => void remove(row)}>▢</Button>
        </div> },
      ]} emptyTitle="No se encontraron preguntas" emptyDescription="Volvé a la búsqueda y probá otros criterios." />}

      {rows.length > 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span>Mostrando {Math.min((page - 1) * pageSize + 1, rows.length)} a {Math.min(page * pageSize, rows.length)} de {rows.length} preguntas</span>
        <div className="flex items-center gap-2"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Anterior</Button><span>Página {page} de {pageCount}</span><Button variant="secondary" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Siguiente</Button><label className="ml-2">Mostrar <select className="ml-1 rounded border px-2 py-1" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></label></div>
      </div>}
      <ErrorMessage error={loadError ?? action.error} />
      {removedName && <Notice tone="success" title="Baja realizada">La pregunta “{removedName}” fue dada de baja. El backend todavía no registra la auditoría de usuario, fecha y hora requerida por el caso de uso.<Button className="ml-3" variant="secondary" onClick={() => { setRemovedName(""); setAuditMissing(false); }}>Aceptar</Button>{auditMissing && <span className="sr-only">Auditoría pendiente.</span>}</Notice>}
    </Panel>
  </>;
}
