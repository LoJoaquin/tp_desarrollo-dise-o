import Link from "next/link";
import { Notice, PageHeader, Panel } from "@/shared/ui";
import { appRoutes } from "@/shared/navigation/routes";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResultsExportPositionsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = [
    ["Puesto", params.nombre],
    ["Empresa", params.empresa],
    ["Desde", params.desde],
    ["Hasta", params.hasta],
  ].filter((item): item is [string, string] => typeof item[1] === "string" && item[1].length > 0);
  return <>
    <PageHeader eyebrow="Consultor · CU007 · Paso 2 de 3" title="Puestos encontrados" description="Elegí un puesto para consultar sus candidatos con cuestionarios completos." />
    <Panel title="Filtros aplicados">
      {filters.length ? <ul className="grid gap-2 sm:grid-cols-2">{filters.map(([label, value]) => <li key={label}><strong>{label}:</strong> {value}</li>)}</ul> : <p>No se recibieron filtros de búsqueda.</p>}
    </Panel>
    <Panel className="mt-5" title="Resultados de puestos">
      <Notice tone="error" title="Falta conectar la búsqueda al backend">No hay un endpoint que busque puestos por fecha de finalización de cuestionarios completos y devuelva los resultados requeridos por CU007. La búsqueda general de puestos y la de orden de mérito no reemplazan este contrato, así que no se muestran resultados inventados.</Notice>
      <p className="text-sm text-slate-600">Cuando exista ese endpoint, cada fila permitirá abrir la lista de candidatos del puesto en una URL propia.</p>
      <Link className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold" href={appRoutes.resultsExport}>Volver a los filtros</Link>
    </Panel>
  </>;
}
