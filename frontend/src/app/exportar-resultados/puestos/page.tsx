"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEvaluatedPositions } from "@/features/reports/hooks";
import type { EvaluatedPosition } from "@/features/reports/types";
import { appRoutes } from "@/shared/navigation/routes";
import { Button, DataTable, ErrorMessage, LoadingState, PageHeader, Panel } from "@/shared/ui";

export default function ResultsExportPositionsPage() {
  return <Suspense fallback={<LoadingState label="Cargando…" />}><ResultsExportPositions /></Suspense>;
}

function ResultsExportPositions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nombre = searchParams.get("nombre") ?? "";
  const empresa = searchParams.get("empresa") ?? "";
  const desde = searchParams.get("desde") ?? "";
  const hasta = searchParams.get("hasta") ?? "";
  const query = searchParams.toString();
  const [rows, setRows] = useState<EvaluatedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const search = useEvaluatedPositions();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    search.execute({ nombre, empresa, desde, hasta }).then((result) => {
      if (!mounted) return;
      setRows(result ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [nombre, empresa, desde, hasta, search.execute]);

  const filters = [["Función o puesto", nombre], ["Empresa", empresa], ["Desde", desde], ["Hasta", hasta]].filter(([, value]) => value);

  return <>
    <PageHeader eyebrow="Consultor · CU007 · Paso 2 de 3" title="Funciones encontradas" description="Elegí una función o puesto para ver los candidatos evaluados y exportar sus resultados." actions={<Button variant="secondary" onClick={() => router.push(appRoutes.resultsExport)}>Cambiar filtros</Button>} />
    {filters.length > 0 && <Panel title="Filtros aplicados">
      <ul className="grid gap-2 sm:grid-cols-2">{filters.map(([label, value]) => <li key={label}><strong>{label}:</strong> {value}</li>)}</ul>
    </Panel>}
    <Panel className="mt-5" title="Resultados" description="Solo se listan funciones con cuestionarios en estado Completo.">
      {loading ? <LoadingState label="Buscando funciones…" /> : <DataTable
        rows={rows}
        rowKey={(row) => row.idPuesto}
        emptyTitle="No hay funciones con candidatos evaluados"
        emptyDescription="Probá con otros filtros o con otro rango de fechas."
        columns={[
          { key: "codigo", header: "Código", render: (row) => row.codigoPuesto },
          { key: "puesto", header: "Función o puesto", render: (row) => row.nombrePuesto },
          { key: "empresa", header: "Empresa", render: (row) => row.empresa ?? "—" },
          { key: "evaluados", header: "Evaluados", render: (row) => row.candidatosEvaluados },
          { key: "select", header: "Acción", render: (row) => <Button onClick={() => router.push(`${appRoutes.resultsExportCandidates(row.idPuesto)}${query ? `?${query}` : ""}`)}>Elegir</Button> },
        ]}
      />}
      <ErrorMessage error={search.error} />
    </Panel>
  </>;
}
