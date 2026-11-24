"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePosition } from "@/features/positions/hooks";
import type { Position } from "@/features/positions/types";
import { useEvaluatedCandidates, useExportResults } from "@/features/reports/hooks";
import type { ComparativeCandidate } from "@/features/reports/types";
import { appRoutes } from "@/shared/navigation/routes";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel, formatDate } from "@/shared/ui";

type SaveFilePicker = (options: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<{ createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }>;

// CU007 pasos 7-9: el usuario elige la carpeta y guarda el archivo. Si el
// navegador permite elegir dónde guardar se usa ese diálogo; si no, se
// descarga en la carpeta de descargas configurada.
async function saveFile(blob: Blob, fileName: string): Promise<boolean> {
  const picker = (window as unknown as { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker({ suggestedName: fileName, types: [{ description: "Archivo CSV", accept: { "text/csv": [".csv"] } }] });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return false;
      // Si falla el diálogo se usa la descarga común.
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

export default function ResultsExportCandidatesPage() {
  const params = useParams<{ idPuesto: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idPuesto = Number(params.idPuesto);
  const desde = searchParams.get("desde") ?? "";
  const hasta = searchParams.get("hasta") ?? "";
  const query = searchParams.toString();
  const [position, setPosition] = useState<Position | null>(null);
  const [candidates, setCandidates] = useState<ComparativeCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string | null>(null);
  const positionQuery = usePosition();
  const candidatesQuery = useEvaluatedCandidates();
  const exportQuery = useExportResults();

  useEffect(() => {
    let mounted = true;
    if (!Number.isInteger(idPuesto) || idPuesto <= 0) return;
    positionQuery.execute(idPuesto).then((result) => { if (mounted && result) setPosition(result); });
    candidatesQuery.execute({ positionId: idPuesto, range: { desde, hasta } }).then((result) => {
      if (!mounted) return;
      setCandidates(result ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [idPuesto, desde, hasta, positionQuery.execute, candidatesQuery.execute]);

  async function exportCsv() {
    setSaved(null);
    const result = await exportQuery.execute({ positionId: idPuesto, range: { desde, hasta } });
    if (!result) return;
    const fileName = result.fileName ?? `resultados-puesto-${idPuesto}.csv`;
    if (await saveFile(result.blob, fileName)) setSaved(fileName);
  }

  return <>
    <PageHeader eyebrow="Consultor · CU007 · Paso 3 de 3" title="Candidatos evaluados" description={position ? `${position.nombre} · ${position.empresaNombre ?? "Empresa sin nombre"}` : `Puesto ID ${idPuesto}`} actions={<Button variant="secondary" onClick={() => router.push(`${appRoutes.resultsExportPositions}${query ? `?${query}` : ""}`)}>Volver a funciones</Button>} />
    <Panel title="Candidatos con cuestionario completo">
      {loading ? <LoadingState label="Buscando candidatos evaluados…" /> : <DataTable
        rows={candidates}
        rowKey={(row) => row.idCuestionario}
        emptyTitle="No hay candidatos evaluados"
        emptyDescription="Ningún candidato completó el cuestionario de esta función en el período indicado."
        columns={[
          { key: "apellido", header: "Apellido", render: (row) => row.apellido },
          { key: "nombre", header: "Nombre", render: (row) => row.nombre },
          { key: "tipo", header: "Tipo documento", render: (row) => row.tipoDocumento ?? "—" },
          { key: "documento", header: "Nro documento", render: (row) => row.numeroDocumento ?? "—" },
          { key: "numero", header: "Nro candidato", render: (row) => row.numeroCandidato ?? "—" },
          { key: "fecha", header: "Finalización", render: (row) => formatDate(row.fechaFinalizacion) },
        ]}
      />}
      <div className="mt-4 grid justify-items-start gap-2">
        <ErrorMessage error={positionQuery.error} />
        <ErrorMessage error={candidatesQuery.error} />
        <ErrorMessage error={exportQuery.error} />
        {saved && <Notice tone="success" title="Archivo guardado">Se generó {saved}.</Notice>}
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportCsv} disabled={exportQuery.isPending || loading || candidates.length === 0}>{exportQuery.isPending ? "Generando…" : "Exportar"}</Button>
          <Button variant="secondary" onClick={() => router.push("/consultor")}>Cancelar</Button>
        </div>
      </div>
    </Panel>
  </>;
}
