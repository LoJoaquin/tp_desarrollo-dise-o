"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as service from "@/features/factors/service";
import * as competencyService from "@/features/competencies/service";
import type { Factor } from "@/features/factors/types";
import type { Competency } from "@/features/competencies/types";
import { useAction } from "@/shared/hooks/use-action";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel } from "@/shared/ui";

type Criteria = { competenciaId: string; codigo: string; nombre: string };
export default function FactorResults({ criteria }: { criteria: Criteria }) {
  const router = useRouter();
  const [allRows, setAllRows] = useState<Factor[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const action = useAction();
  async function load() {
    setLoading(true);
    const [factorRows, competencyRows] = await Promise.all([action.run(() => service.listFactors()), action.run(() => competencyService.listCompetencies())]);
    if (factorRows) setAllRows(factorRows);
    if (competencyRows) setCompetencies(competencyRows);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);
  const rows = useMemo(() => allRows.filter((row) =>
    (!criteria.competenciaId || row.competenciaId === Number(criteria.competenciaId)) &&
    row.codigo.toLocaleLowerCase("es-AR").includes(criteria.codigo.toLocaleLowerCase("es-AR")) &&
    row.nombre.toLocaleLowerCase("es-AR").includes(criteria.nombre.toLocaleLowerCase("es-AR"))), [allRows, criteria]);
  async function toggle(row: Factor) {
    if (row.estaActivo && !window.confirm(`¿Dar de baja el factor ${row.nombre}?`)) return;
    const result = await action.run(async () => { if (row.estaActivo) await service.deleteFactor(row.id); else await service.reactivateFactor(row.id); return true; }, row.estaActivo ? "Factor dado de baja." : "Factor reactivado.");
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
      <ErrorMessage error={action.error} />
      {action.success && <Notice tone="success">{action.success}</Notice>}
      <Notice tone="warning" title="Auditoría pendiente">El caso de uso requiere registrar quién dio de baja el factor y en qué fecha/hora; esa auditoría no está implementada en el backend.</Notice>
    </Panel>
  </>;
}
