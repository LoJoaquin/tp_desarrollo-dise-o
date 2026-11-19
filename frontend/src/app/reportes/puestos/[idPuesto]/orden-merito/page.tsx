"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMeritOrder } from "@/features/reports/hooks";
import type { MeritGroup, MeritCandidate } from "@/features/reports/types";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel, StatusBadge } from "@/shared/ui";

export default function MeritOrderPage() {
  const params = useParams<{ idPuesto: string }>(); const id = Number(params.idPuesto); const [groups, setGroups] = useState<MeritGroup[]>([]); const [loading, setLoading] = useState(true); const meritOrder = useMeritOrder();
  useEffect(() => { let mounted = true; meritOrder.execute(id).then((rows) => { if (mounted && rows) setGroups(rows); }).finally(() => { if (mounted) setLoading(false); }); return () => { mounted = false; }; }, [id, meritOrder.execute]);
  return <><PageHeader eyebrow="CU028 · Reportes" title="Orden de mérito" description={`Puesto ID ${id}. Los candidatos se muestran agrupados por estado del cuestionario.`} actions={<Button variant="secondary" onClick={() => window.print()}>Imprimir</Button>} /><Notice tone="warning" title="Filtro de evaluaciones pendiente">La especificación permite elegir una evaluación o “TODAS”, pero el endpoint actual solo devuelve todos los grupos. Se muestran todos los resultados disponibles hasta que el backend acepte ese filtro.</Notice>{loading ? <LoadingState /> : groups.length === 0 ? <Panel><p className="text-sm text-slate-600">No hay grupos de resultados para este puesto. Puede no tener evaluaciones asociadas.</p></Panel> : <div className="space-y-5">{groups.map((group) => <MeritGroupPanel key={group.estado} group={group} />)}</div>}<ErrorMessage error={meritOrder.error} /></>;
}

function MeritGroupPanel({ group }: { group: MeritGroup }) {
  return <Panel title={<><StatusBadge>{group.estado}</StatusBadge><span className="ml-3">{group.candidatos.length} candidatos</span></>}><DataTable<MeritCandidate> rows={group.candidatos} rowKey={(row) => row.idCuestionario} columns={[{ key: "rank", header: "Orden", render: (row) => row.ordenMerito ?? "—" }, { key: "candidate", header: "Candidato", render: (row) => [row.apellido, row.nombre].filter(Boolean).join(", ") || "—" }, { key: "score", header: "Puntaje", render: (row) => row.puntajeObtenido ?? "—" }, { key: "start", header: "Inicio", render: (row) => row.fechaInicio ?? "—" }, { key: "end", header: "Finalización", render: (row) => row.fechaFin ?? "—" }, { key: "access", header: "Accesos", render: (row) => row.cantidadAccesos ?? "—" }]}/></Panel>;
}
