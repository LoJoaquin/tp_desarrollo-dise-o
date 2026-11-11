"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as service from "@/features/candidates/service";
import type { Candidate, SearchCandidatesRequest } from "@/features/candidates/types";
import { useAction } from "@/shared/hooks/use-action";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel } from "@/shared/ui";

export default function CandidateResults({ criteria }: { criteria: SearchCandidatesRequest }) {
  const router = useRouter();
  const [allRows, setAllRows] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const action = useAction();
  async function load() { setLoading(true); const result = await action.run(() => service.searchCandidates(criteria)); if (result) setAllRows(result.filter((row) => row.estaActivo !== false)); setLoading(false); }
  useEffect(() => { void load(); }, []);
  const rows = useMemo(() => allRows.filter((row) =>
    row.numeroCandidato.toLocaleLowerCase("es-AR").includes((criteria.numeroCandidato ?? "").toLocaleLowerCase("es-AR")) &&
    row.apellido.toLocaleLowerCase("es-AR").includes((criteria.apellido ?? "").toLocaleLowerCase("es-AR")) &&
    row.nombre.toLocaleLowerCase("es-AR").includes((criteria.nombre ?? "").toLocaleLowerCase("es-AR"))), [allRows, criteria]);
  function edit(row: Candidate) {
    const query = new URLSearchParams({ numeroCandidato: row.numeroCandidato });
    router.push(`/candidatos/${row.id}/modificar?${query.toString()}`);
  }
  async function remove(row: Candidate) {
    if (!window.confirm(`¿Dar de baja al candidato ${row.numeroCandidato}?`)) return;
    const result = await action.run(async () => { await service.deleteCandidate(row.id); return true; }, "Candidato dado de baja.");
    if (result) setAllRows((current) => current.filter((item) => item.id !== row.id));
  }
  return <>
    <PageHeader eyebrow="Gestión" title="Gestionar candidatos" description="Resultado de la búsqueda de candidatos." actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => router.push("/candidatos")}>Volver a buscar</Button><Button onClick={() => router.push("/candidatos/nuevo")}>Nuevo candidato</Button></div>} />
    <Panel title="Resultados de la búsqueda" description="Se muestran los candidatos que coinciden con los criterios ingresados.">
      {loading ? <LoadingState label="Buscando candidatos…" /> : <DataTable rows={rows} rowKey={(row) => row.id} columns={[
        { key: "numero", header: "N.º candidato", render: (row) => row.numeroCandidato },
        { key: "apellido", header: "Apellido", render: (row) => row.apellido },
        { key: "nombre", header: "Nombre", render: (row) => row.nombre },
        { key: "documento", header: "Documento", render: (row) => [row.tipoDocumento, row.numeroDocumento].filter(Boolean).join(" ") || "—" },
        { key: "acciones", header: "Acciones", render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => edit(row)}>Modificar</Button><Button variant="danger" onClick={() => void remove(row)}>Eliminar</Button></div> },
      ]} emptyTitle="No se encontraron candidatos" emptyDescription="Volvé a la búsqueda y probá otros criterios." />}
      <ErrorMessage error={action.error} />{action.success && <Notice tone="success">{action.success}</Notice>}
    </Panel>
  </>;
}
