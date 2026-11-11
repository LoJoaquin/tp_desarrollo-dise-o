"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as service from "@/features/reports/service";
import type { MeritGroup, MeritCandidate } from "@/features/reports/types";
import { useAction } from "@/shared/hooks/use-action";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel, StatusBadge } from "@/shared/ui";

export default function MeritOrderPage() {
  const params = useParams<{ idPuesto: string }>(); const id = Number(params.idPuesto); const [groups, setGroups] = useState<MeritGroup[]>([]); const [loading, setLoading] = useState(true); const action = useAction();
  useEffect(() => { service.getMeritOrder(id).then(setGroups).catch((error) => action.run(() => Promise.reject(error))).finally(() => setLoading(false)); }, [id]);
  return <><PageHeader eyebrow="CU028 · Reportes" title="Orden de mérito" description={`Puesto ID ${id}. Los candidatos se muestran agrupados por estado del cuestionario.`} actions={<Button variant="secondary" onClick={() => window.print()}>Imprimir</Button>} /><Notice tone="warning" title="Filtro de evaluaciones pendiente">La especificación permite elegir una evaluación o “TODAS”, pero el endpoint actual solo devuelve todos los grupos. Se muestran todos los resultados disponibles hasta que el backend acepte ese filtro.</Notice>{loading ? <LoadingState /> : groups.length === 0 ? <Panel><p className="text-sm text-slate-600">No hay grupos de resultados para este puesto. Puede no tener evaluaciones asociadas.</p></Panel> : <div className="space-y-5">{groups.map((group) => <MeritGroupPanel key={group.estado} group={group} />)}</div>}<ErrorMessage error={action.error} /></>;
}

function MeritGroupPanel({ group }: { group: MeritGroup }) {
  return <Panel title={<><StatusBadge>{group.estado}</StatusBadge><span className="ml-3">{group.candidatos.length} candidatos</span></>}><DataTable<MeritCandidate> rows={group.candidatos} rowKey={(row) => row.idCuestionario} columns={[{ key: "rank", header: "Orden", render: (row) => row.ordenMerito ?? "—" }, { key: "candidate", header: "Candidato", render: (row) => [row.apellido, row.nombre].filter(Boolean).join(", ") || "—" }, { key: "score", header: "Puntaje", render: (row) => row.puntajeObtenido ?? "—" }, { key: "start", header: "Inicio", render: (row) => row.fechaInicio ?? "—" }, { key: "end", header: "Finalización", render: (row) => row.fechaFin ?? "—" }, { key: "access", header: "Accesos", render: (row) => row.cantidadAccesos ?? "—" }]}/></Panel>;
}
