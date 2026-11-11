"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as service from "@/features/competencies/service";
import type { Competency } from "@/features/competencies/types";
import { useAction } from "@/shared/hooks/use-action";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel } from "@/shared/ui";

type Criteria = { codigo: string; nombre: string };
export default function CompetencyResults({ criteria }: { criteria: Criteria }) {
  const router = useRouter();
  const [allRows, setAllRows] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const action = useAction();
  async function load() { setLoading(true); const result = await action.run(() => service.listCompetencies()); if (result) setAllRows(result); setLoading(false); }
  useEffect(() => { void load(); }, []);
  const rows = useMemo(() => allRows.filter((row) =>
    row.codigo.toLocaleLowerCase("es-AR").includes(criteria.codigo.toLocaleLowerCase("es-AR")) &&
    row.nombre.toLocaleLowerCase("es-AR").includes(criteria.nombre.toLocaleLowerCase("es-AR"))), [allRows, criteria]);
  async function toggle(row: Competency) {
    if (row.estaActivo && !window.confirm(`¿Dar de baja la competencia ${row.nombre}?`)) return;
    const result = await action.run(async () => { if (row.estaActivo) await service.deleteCompetency(row.id); else await service.reactivateCompetency(row.id); return true; }, row.estaActivo ? "Competencia dada de baja." : "Competencia reactivada.");
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
      <ErrorMessage error={action.error} />
      {action.success && <Notice tone="success" title={action.success}>La acción se completó.</Notice>}
      <Notice tone="warning" title="Auditoría pendiente">El caso de uso requiere registrar el usuario y la fecha/hora de la baja; esa auditoría no está implementada en el backend.</Notice>
    </Panel>
  </>;
}
