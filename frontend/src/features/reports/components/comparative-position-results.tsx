"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEvaluatedPositions } from "@/features/reports/hooks";
import type { EvaluatedPosition } from "@/features/reports/types";
import type { SearchPositionsRequest } from "@/features/positions/types";
import { Button, DataTable, ErrorMessage, LoadingState, PageHeader, Panel } from "@/shared/ui";

export function ComparativePositionResults({ criteria }: { criteria: SearchPositionsRequest }) {
  const router = useRouter();
  const [rows, setRows] = useState<EvaluatedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const searchPositions = useEvaluatedPositions();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const result = await searchPositions.execute({ nombre: criteria.nombre, empresa: criteria.empresa });
      if (mounted) {
        setRows(result ?? []);
        setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [criteria.nombre, criteria.empresa, searchPositions.execute]);

  function choose(position: EvaluatedPosition) {
    const params = new URLSearchParams();
    if (criteria.nombre) params.set("nombre", criteria.nombre);
    if (criteria.empresa) params.set("empresa", criteria.empresa);
    const query = params.toString();
    router.push(`/reportes/comparativo/puestos/${position.idPuesto}/candidatos${query ? `?${query}` : ""}`);
  }

  return <>
    <PageHeader eyebrow="CU027 · Paso 1 de 3" title="Funciones encontradas" description="Elegí la función o puesto para ver los candidatos que completaron su evaluación." actions={<Button variant="secondary" onClick={() => router.push("/reportes/comparativo")}>Cambiar búsqueda</Button>} />
    <Panel title="Resultados" description="Solo se listan funciones con al menos un cuestionario completo.">
      {loading ? <LoadingState label="Buscando funciones…" /> : <DataTable
        rows={rows}
        rowKey={(row) => row.idPuesto}
        emptyTitle="No se encontraron funciones con candidatos evaluados"
        emptyDescription="Volvé a la búsqueda y probá con otro nombre o empresa."
        columns={[
          { key: "codigo", header: "Código", render: (row) => row.codigoPuesto },
          { key: "puesto", header: "Función o puesto", render: (row) => row.nombrePuesto },
          { key: "empresa", header: "Empresa", render: (row) => row.empresa ?? "—" },
          { key: "evaluados", header: "Evaluados", render: (row) => row.candidatosEvaluados },
          { key: "select", header: "Acción", render: (row) => <Button onClick={() => choose(row)}>Elegir</Button> },
        ]}
      />}
      <ErrorMessage error={searchPositions.error} />
    </Panel>
  </>;
}
