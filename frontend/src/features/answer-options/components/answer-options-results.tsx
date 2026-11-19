"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnswerOptionSearch, useDeleteAnswerOption } from "@/features/answer-options/hooks";
import type { AnswerOption } from "@/features/answer-options/types";
import { appRoutes } from "@/shared/navigation/routes";
import { Button, DataTable, ErrorMessage, LoadingState, Notice, PageHeader, Panel } from "@/shared/ui";

export default function AnswerOptionsResults({ criteria }: { criteria: { nombre: string } }) {
  const router = useRouter();
  const [rows, setRows] = useState<AnswerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const searchOptions = useAnswerOptionSearch();
  const deleteOption = useDeleteAnswerOption();

  async function load() {
    setLoading(true);
    const result = await searchOptions.execute(criteria.nombre);
    if (result) setRows(result);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [criteria.nombre]);

  async function remove(option: AnswerOption) {
    if (!window.confirm(`Los datos de la opción “${option.nombre}” serán dados de baja. ¿Continuar?`)) return;
    const result = await deleteOption.execute(
      option.id,
      `Opción “${option.nombre}” dada de baja.`,
    );
    if (result) setRows((current) => current.filter((row) => row.id !== option.id));
  }

  return <>
    <PageHeader eyebrow="CU024 · Gestión" title="Gestionar opciones de respuesta" description="Resultados de la búsqueda de opciones de respuesta." actions={<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => router.push(appRoutes.answerOptions)}>Volver a buscar</Button><Button onClick={() => router.push(appRoutes.createAnswerOption)}>Nueva opción</Button></div>} />
    <Panel title="Resultados de la búsqueda" description="Se muestran las opciones activas que coinciden con el nombre ingresado.">
      {loading ? <LoadingState label="Buscando opciones de respuesta…" /> : <DataTable rows={rows} rowKey={(row) => row.id} columns={[
        { key: "nombre", header: "Nombre", render: (row) => row.nombre },
        { key: "descripcion", header: "Descripción", render: (row) => row.descripcion },
        { key: "detalles", header: "Opciones", render: (row) => row.detalles?.map((detail) => `${detail.ordenVisualizacion}. ${detail.descripcion}`).join(" · ") ?? "—" },
        { key: "acciones", header: "Acciones", render: (row) => <div className="flex gap-2"><Button variant="secondary" aria-label={`Modificar ${row.nombre}`} onClick={() => router.push(appRoutes.updateAnswerOption(row.id))}>Modificar</Button><Button variant="danger" aria-label={`Eliminar ${row.nombre}`} onClick={() => void remove(row)}>Eliminar</Button></div> },
      ]} emptyTitle="No se encontraron opciones" emptyDescription="Volvé a la búsqueda y probá con otro nombre." />}
      <ErrorMessage error={searchOptions.error ?? deleteOption.error} />
      {deleteOption.success && <Notice tone="success">{deleteOption.success}</Notice>}
      <Notice tone="info" title="Baja de una opción">El backend no permite eliminar opciones asociadas a preguntas. Si intentás hacerlo, va a mostrar el motivo que devuelve la API.</Notice>
    </Panel>
  </>;
}
