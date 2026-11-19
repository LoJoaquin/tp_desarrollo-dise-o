"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompetencySearch, useDeleteCompetency, useReactivateCompetency } from "@/features/competencies/hooks";
import type { Competency } from "@/features/competencies/types";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel } from "@/shared/ui";

type Criteria = { codigo: string; nombre: string };
export default function CompetencyResults({ criteria }: { criteria: Criteria }) {
  const router = useRouter();
  const [rows, setRows] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const searchCompetencies = useCompetencySearch();
  const deleteCompetency = useDeleteCompetency();
  const reactivateCompetency = useReactivateCompetency();
  async function load() {
    setLoading(true);
    const result = await searchCompetencies.execute(criteria);
    if (result) setRows(result);
    setLoading(false);
  }
  useEffect(() => { void load(); }, [criteria.codigo, criteria.nombre]);
  async function toggle(row: Competency) {
    if (row.estaActivo && !window.confirm(`¿Dar de baja la competencia ${row.nombre}?`)) return;
    const result = row.estaActivo
      ? await deleteCompetency.execute(row.id, "Competencia dada de baja.")
      : await reactivateCompetency.execute(row.id, "Competencia reactivada.");
    if (result) await load();
  }
  return <>
    <PageHeader eyebrow="CU012 · Gestión" title="Gestionar competencias" description="Resultado de la búsqueda de competencias." actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => router.push("/administracion/competencias")}>Volver a buscar</Button><Button onClick={() => router.push("/administracion/competencias/nueva")}>Nueva competencia</Button></div>} />
    <Panel title="Resultados de la búsqueda" description="Se muestran las competencias que coinciden con los criterios ingresados.">
      {loading ? <LoadingState label="Buscando competencias…" /> : <DataTable rows={rows} rowKey={(row) => row.id} columns={[
        { key: "codigo", header: "Código", render: (row) => row.codigo },
        { key: "nombre", header: "Competencia", render: (row) => row.nombre },
        { key: "estado", header: "Estado", render: (row) => row.estaActivo ? "Activa" : "Inactiva" },
        { key: "acciones", header: "Acciones", render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => router.push(`/administracion/competencias/${row.id}/modificar`)}>Modificar</Button><Button variant={row.estaActivo ? "danger" : "secondary"} onClick={() => void toggle(row)}>{row.estaActivo ? "Eliminar" : "Reactivar"}</Button></div> },
      ]} emptyTitle="No se encontraron competencias" emptyDescription="Volvé a la búsqueda y probá otros criterios." />}
      <ErrorMessage error={searchCompetencies.error ?? deleteCompetency.error ?? reactivateCompetency.error} />
      {(deleteCompetency.success || reactivateCompetency.success) && <Notice tone="success" title={deleteCompetency.success || reactivateCompetency.success || undefined}>La acción se completó.</Notice>}
      <Notice tone="warning" title="Auditoría pendiente">El caso de uso requiere registrar el usuario y la fecha/hora de la baja; esa auditoría no está implementada en el backend.</Notice>
    </Panel>
  </>;
}
