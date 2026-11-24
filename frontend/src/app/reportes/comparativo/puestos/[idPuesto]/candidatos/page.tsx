"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePosition } from "@/features/positions/hooks";
import type { Position } from "@/features/positions/types";
import { useEvaluatedCandidates } from "@/features/reports/hooks";
import type { ComparativeCandidate } from "@/features/reports/types";
import { Button, DataTable, ErrorMessage, LoadingState, PageHeader, Panel, ValidationSummary, formatDate } from "@/shared/ui";

export default function ComparativeCandidatesPage() {
  const params = useParams<{ idPuesto: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idPuesto = Number(params.idPuesto);
  const [position, setPosition] = useState<Position | null>(null);
  const [candidates, setCandidates] = useState<ComparativeCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const positionQuery = usePosition();
  const candidatesQuery = useEvaluatedCandidates();
  const query = searchParams.toString();
  const querySuffix = query ? `?${query}` : "";

  useEffect(() => {
    let mounted = true;
    if (!Number.isInteger(idPuesto) || idPuesto <= 0) return;
    positionQuery.execute(idPuesto).then((result) => { if (mounted && result) setPosition(result); });
    candidatesQuery.execute({ positionId: idPuesto }).then((result) => {
      if (!mounted) return;
      setCandidates(result ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [idPuesto, positionQuery.execute, candidatesQuery.execute]);

  function compare() {
    if (!selected) {
      setErrors(["Debés seleccionar al menos un candidato de la lista."]);
      return;
    }
    router.push(`/reportes/comparativo/puestos/${idPuesto}/cuestionarios/${selected}${querySuffix}`);
  }

  function backToPositions() {
    router.push(query ? `/reportes/comparativo/puestos/resultados?${query}` : "/reportes/comparativo");
  }

  return <>
    <PageHeader eyebrow="CU027 · Paso 2 de 3" title="Candidatos evaluados" description={position ? `${position.nombre} · ${position.empresaNombre ?? "Empresa sin nombre"}` : `Puesto ID ${idPuesto}`} actions={<Button variant="secondary" onClick={backToPositions}>Volver a funciones</Button>} />
    <Panel title="Elegir candidato" description="Se listan los candidatos con cuestionario completo para la función seleccionada.">
      {loading ? <LoadingState label="Buscando candidatos evaluados…" /> : <DataTable
        rows={candidates}
        rowKey={(row) => row.idCuestionario}
        emptyTitle="No hay candidatos evaluados"
        emptyDescription="Ningún candidato completó el cuestionario de esta función."
        columns={[
          { key: "select", header: "Elegir", render: (row) => <input type="radio" name="candidate" checked={selected === row.idCuestionario} onChange={() => { setSelected(row.idCuestionario); setErrors([]); }} aria-label={`Elegir a ${row.apellido}, ${row.nombre}`} /> },
          { key: "apellido", header: "Apellido", render: (row) => row.apellido },
          { key: "nombre", header: "Nombre", render: (row) => row.nombre },
          { key: "tipoDocumento", header: "Tipo de documento", render: (row) => row.tipoDocumento ?? "—" },
          { key: "documento", header: "Documento", render: (row) => row.numeroDocumento ?? "—" },
          { key: "numeroCandidato", header: "N.º de candidato", render: (row) => row.numeroCandidato ?? "—" },
          { key: "fecha", header: "Finalización", render: (row) => formatDate(row.fechaFinalizacion) },
        ]}
      />}
      <div className="mt-4 grid justify-items-start gap-2">
        <ValidationSummary errors={errors} />
        <ErrorMessage error={positionQuery.error} />
        <ErrorMessage error={candidatesQuery.error} />
        <div className="flex flex-wrap gap-3">
          <Button onClick={compare}>Comparar</Button>
          <Button variant="secondary" onClick={() => router.push("/consultor")}>Cancelar</Button>
        </div>
      </div>
    </Panel>
  </>;
}
