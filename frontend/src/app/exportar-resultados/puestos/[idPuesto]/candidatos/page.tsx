import Link from "next/link";
import { Button, Notice, PageHeader, Panel } from "@/shared/ui";
import { appRoutes } from "@/shared/navigation/routes";

type Params = Promise<{ idPuesto: string }>;

export default async function ResultsExportCandidatesPage({ params }: { params: Params }) {
  const { idPuesto } = await params;
  return <>
    <PageHeader eyebrow="Consultor · CU007 · Paso 3 de 3" title="Candidatos evaluados" description={`Puesto seleccionado: ${idPuesto}. Acá se listarán quienes finalizaron el cuestionario.`} />
    <Panel title="Candidatos con cuestionario completo">
      <Notice tone="error" title="Falta el endpoint de candidatos evaluados">El backend todavía no expone la lista de candidatos con estado COMPLETO y fecha de finalización para este puesto. Por eso no es posible revisar los datos ni descargar resultados.</Notice>
      <Button disabled title="Se habilitará cuando el backend entregue los datos y el CSV">Descargar resultados CSV</Button>
      <p className="mt-2 text-sm text-slate-600">El CSV deberá incluir número de candidato, apellido, nombre, tipo y número de documento, competencia, resultado, puesto, código de puesto y fecha de finalización.</p>
      <Link className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold" href={appRoutes.resultsExportPositions}>Volver a puestos</Link>
    </Panel>
  </>;
}
