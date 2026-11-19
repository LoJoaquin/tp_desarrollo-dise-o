"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompetencies } from "@/features/competencies/hooks";
import { useDeleteFactor, useFactorSearch, useReactivateFactor } from "@/features/factors/hooks";
import type { Factor } from "@/features/factors/types";
import type { Competency } from "@/features/competencies/types";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel } from "@/shared/ui";

type Criteria = { competenciaId: string; codigo: string; nombre: string };
export default function FactorResults({ criteria }: { criteria: Criteria }) {
  const router = useRouter();
  const [rows, setRows] = useState<Factor[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const searchFactors = useFactorSearch();
  const listCompetencies = useCompetencies();
  const deleteFactor = useDeleteFactor();
  const reactivateFactor = useReactivateFactor();
  async function load() {
    setLoading(true);
    const [factorRows, competencyRows] = await Promise.all([
      searchFactors.execute({
        competenciaId: criteria.competenciaId ? Number(criteria.competenciaId) : null,
        codigo: criteria.codigo,
        nombreFactor: criteria.nombre,
      }),
      listCompetencies.execute(undefined),
    ]);
    if (factorRows) setRows(factorRows);
    if (competencyRows) setCompetencies(competencyRows);
    setLoading(false);
  }
  useEffect(() => { void load(); }, [criteria.competenciaId, criteria.codigo, criteria.nombre]);
  async function toggle(row: Factor) {
    if (row.estaActivo && !window.confirm(`¿Dar de baja el factor ${row.nombre}?`)) return;
    const result = row.estaActivo
      ? await deleteFactor.execute(row.id, "Factor dado de baja.")
      : await reactivateFactor.execute(row.id, "Factor reactivado.");
    if (result) await load();
  }
  return <>
    <PageHeader eyebrow="CU016 · Gestión" title="Gestionar factores" description="Resultado de la búsqueda de factores." actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => router.push("/administracion/factores")}>Volver a buscar</Button><Button onClick={() => router.push("/administracion/factores/nuevo")}>Nuevo factor</Button></div>} />
    <Panel title="Resultados de la búsqueda" description="Se muestran los factores que coinciden con los criterios ingresados.">
      {loading ? <LoadingState label="Buscando factores…" /> : <DataTable rows={rows} rowKey={(row) => row.id} columns={[
        { key: "codigo", header: "Código", render: (row) => row.codigo },
        { key: "nombre", header: "Factor", render: (row) => row.nombre },
        { key: "competencia", header: "Competencia", render: (row) => competencies.find((item) => item.id === row.competenciaId)?.nombre ?? row.competenciaId ?? "—" },
        { key: "orden", header: "Orden", render: (row) => row.nroOrden ?? "—" },
        { key: "acciones", header: "Acciones", render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => router.push(`/administracion/factores/${row.id}/modificar`)}>Modificar</Button><Button variant={row.estaActivo ? "danger" : "secondary"} onClick={() => void toggle(row)}>{row.estaActivo ? "Eliminar" : "Reactivar"}</Button></div> },
      ]} emptyTitle="No se encontraron factores" emptyDescription="Volvé a la búsqueda y probá otros criterios." />}
      <ErrorMessage error={searchFactors.error ?? listCompetencies.error ?? deleteFactor.error ?? reactivateFactor.error} />
      {(deleteFactor.success || reactivateFactor.success) && <Notice tone="success">{deleteFactor.success || reactivateFactor.success}</Notice>}
      <Notice tone="warning" title="Auditoría pendiente">El caso de uso requiere registrar quién dio de baja el factor y en qué fecha/hora; esa auditoría no está implementada en el backend.</Notice>
    </Panel>
  </>;
}
