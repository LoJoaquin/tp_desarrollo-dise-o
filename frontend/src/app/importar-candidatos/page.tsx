"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useImportCandidates } from "@/features/candidates/hooks";
import type { CandidateImportResult } from "@/features/candidates/types";
import { Button, ErrorMessage, LoadingState, Notice, PageHeader, Panel, ValidationSummary } from "@/shared/ui";

const COLUMNAS = [
  "Nro candidato",
  "Apellido",
  "Nombre",
  "Nro documento",
  "Tipo documento (DNI, LE, LC, PP)",
  "Fecha de nacimiento (aaaa-mm-dd)",
  "Género (H/M)",
  "Nacionalidad (código ISO, p. ej. AR, o nombre)",
  "Email",
  "Escolaridad",
  "Eliminado (True/False)",
];

export default function CandidateImportPage() {
  const router = useRouter();
  const importer = useImportCandidates();
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<CandidateImportResult | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    if (!file) {
      setErrors(["Seleccioná el archivo CSV a importar."]);
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrors(["El archivo debe tener extensión .csv."]);
      return;
    }
    setErrors([]);
    const response = await importer.execute(file);
    if (response) setResult(response);
  }

  return <>
    <PageHeader eyebrow="Consultor · CU006" title="Importar candidatos" description="Importá los candidatos desde el archivo CSV del sistema de gestión de candidatos y CV." />

    {result ? <Panel title="Importación realizada con éxito">
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] p-4"><dt className="text-sm text-slate-500">Candidatos creados</dt><dd className="text-2xl font-bold">{result.candidatosCreados}</dd></div>
        <div className="rounded-lg border border-[var(--color-border)] p-4"><dt className="text-sm text-slate-500">Candidatos actualizados</dt><dd className="text-2xl font-bold">{result.candidatosActualizados}</dd></div>
        <div className="rounded-lg border border-[var(--color-border)] p-4"><dt className="text-sm text-slate-500">Candidatos eliminados</dt><dd className="text-2xl font-bold">{result.candidatosEliminados}</dd></div>
      </dl>
      <p className="mt-3 text-sm text-slate-500">Filas procesadas: {result.filasProcesadas}.</p>
      <div className="mt-4"><Button onClick={() => router.push("/consultor")}>Aceptar</Button></div>
    </Panel> : <Panel title="Archivo a importar" description="Elegí el archivo CSV desde una carpeta de tu equipo y presioná Importar.">
      <form noValidate onSubmit={submit} className="grid max-w-xl gap-4">
        <label className="block text-sm font-medium text-slate-700">Archivo CSV *
          <input
            type="file"
            accept=".csv,text/csv"
            className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
            disabled={importer.isPending}
            onChange={(event) => { setFile(event.target.files?.[0] ?? null); setErrors([]); importer.clear(); }}
          />
        </label>
        <ValidationSummary errors={errors} />
        <ErrorMessage error={importer.error} />
        {importer.isPending && <LoadingState label="Importando candidatos, esto puede tardar unos segundos…" />}
        <div className="flex flex-wrap gap-3">
          <Button disabled={importer.isPending}>{importer.isPending ? "Importando…" : "Importar"}</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/consultor")}>Cancelar</Button>
        </div>
      </form>
    </Panel>}

    <Panel className="mt-5" title="Formato esperado">
      <Notice tone="info">La primera fila debe contener los nombres de las columnas y los valores se separan con punto y coma (;). El nro de candidato es la clave única: si ya existe se actualiza, y si la columna Eliminado es True se da de baja. Si alguna fila tiene errores no se importa ningún candidato.</Notice>
      <ol className="mt-3 list-inside list-decimal text-sm leading-6 text-slate-600">{COLUMNAS.map((column) => <li key={column}>{column}</li>)}</ol>
    </Panel>
  </>;
}
