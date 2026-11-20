"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePositionSearch } from "@/features/positions/hooks";
import type { Position, SearchPositionsRequest } from "@/features/positions/types";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel } from "@/shared/ui";

export function ComparativePositionResults({ criteria }: { criteria: SearchPositionsRequest }) {
  const router = useRouter();
  const [rows, setRows] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const searchPositions = usePositionSearch();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const result = await searchPositions.execute(criteria);
      if (mounted && result) setRows(result.filter((position) => position.estaActiva));
      if (mounted) setLoading(false);
    }
    void load();
    return () => { mounted = false; };
  }, [criteria.nombre, criteria.empresa, searchPositions.execute]);

  function choose(position: Position) {
    const params = new URLSearchParams();
    if (criteria.nombre) params.set("nombre", criteria.nombre);
    if (criteria.empresa) params.set("empresa", criteria.empresa);
    const query = params.toString();
    router.push(`/reportes/comparativo/puestos/${position.id}/candidatos${query ? `?${query}` : ""}`);
  }

  return <>
    <PageHeader eyebrow="CU027 · Paso 1 de 3" title="Puestos encontrados" description="Elegí el puesto para ver los candidatos que completaron su evaluación." actions={<Button variant="secondary" onClick={() => router.push("/reportes/comparativo")}>Cambiar búsqueda</Button>} />
    <Panel title="Resultados de puestos" description="Solo se muestran puestos activos.">
      {loading ? <LoadingState label="Buscando puestos…" /> : <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No se encontraron puestos activos"
        emptyDescription="Volvé a la búsqueda y probá con otro nombre o empresa."
        columns={[
          { key: "codigo", header: "Código", render: (row) => row.codigo },
          { key: "puesto", header: "Puesto", render: (row) => row.nombre },
          { key: "empresa", header: "Empresa", render: (row) => row.empresaNombre ?? "—" },
          { key: "select", header: "Acción", render: (row) => <Button onClick={() => choose(row)}>Elegir puesto</Button> },
        ]}
      />}
      <ErrorMessage error={searchPositions.error} />
      {Boolean(searchPositions.error) && <Notice tone="info">La búsqueda utiliza el servicio existente de puestos. Si no devuelve resultados, verificá que haya puestos activos que coincidan con los filtros.</Notice>}
    </Panel>
  </>;
}
