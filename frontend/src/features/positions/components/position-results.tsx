"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeletePosition, usePositionSearch, useReactivatePosition } from "@/features/positions/hooks";
import type { Position, SearchPositionsRequest } from "@/features/positions/types";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel } from "@/shared/ui";

export default function PositionResults({ criteria }: { criteria: SearchPositionsRequest }) {
  const router = useRouter();
  const [rows, setRows] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const searchPositions = usePositionSearch();
  const deletePosition = useDeletePosition();
  const reactivatePosition = useReactivatePosition();
  async function load() { setLoading(true); const result = await searchPositions.execute(criteria); if (result) setRows(result); setLoading(false); }
  useEffect(() => { void load(); }, [criteria.codigo, criteria.nombre, criteria.empresa]);
  async function toggle(row: Position) {
    if (row.estaActiva && !window.confirm(`¿Dar de baja el puesto ${row.nombre}?`)) return;
    const result = row.estaActiva
      ? await deletePosition.execute(row.id, "Puesto dado de baja.")
      : await reactivatePosition.execute(row.id, "Puesto reactivado.");
    if (result) await load();
  }
  return <>
    <PageHeader eyebrow="CU008 · Gestión" title="Gestionar puestos" description="Resultado de la búsqueda de puestos." actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => router.push("/puestos")}>Volver a buscar</Button><Button onClick={() => router.push("/puestos/nuevo")}>Nuevo puesto</Button></div>} />
    <Panel title="Resultados de la búsqueda" description="Se muestran los puestos que coinciden con los criterios ingresados.">
      {loading ? <LoadingState label="Buscando puestos…" /> : <DataTable rows={rows} rowKey={(row) => row.id} columns={[
        { key: "codigo", header: "Código", render: (row) => row.codigo },
        { key: "nombre", header: "Puesto", render: (row) => row.nombre },
        { key: "empresa", header: "Empresa", render: (row) => row.empresaNombre ?? "—" },
        { key: "acciones", header: "Acciones", render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => router.push(`/puestos/${row.id}/modificar`)}>Modificar</Button><Button variant={row.estaActiva ? "danger" : "secondary"} onClick={() => void toggle(row)}>{row.estaActiva ? "Eliminar" : "Reactivar"}</Button></div> },
      ]} emptyTitle="No se encontraron puestos" emptyDescription="Volvé a la búsqueda y probá otros criterios." />}
      <ErrorMessage error={searchPositions.error ?? deletePosition.error ?? reactivatePosition.error} />
      {(deletePosition.success || reactivatePosition.success) && <Notice tone="success">{deletePosition.success || reactivatePosition.success}</Notice>}
    </Panel>
  </>;
}
