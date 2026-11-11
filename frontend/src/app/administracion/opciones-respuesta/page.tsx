"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/shared/navigation/routes";
import { Button, Field, Notice, PageHeader, Panel } from "@/shared/ui";

export default function AnswerOptionsManagementPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  function search(event: FormEvent) {
    event.preventDefault();
    const query = new URLSearchParams();
    if (name.trim()) query.set("nombre", name.trim());
    router.push(`${appRoutes.answerOptionResults}${query.size ? `?${query.toString()}` : ""}`);
  }

  function clear() {
    setName("");
  }

  return <>
    <PageHeader eyebrow="CU024 · Gestión" title="Gestionar opciones de respuesta" description="Buscá opciones existentes para modificarlas o eliminarlas, o iniciá el alta de una nueva." />
    <Panel title="Filtros de búsqueda" description="El nombre se busca por coincidencia. Si lo dejás vacío, se muestran todas las opciones activas.">
      <form onSubmit={search} className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre de la opción" placeholder="Buscar por nombre" value={name} onChange={(event) => setName(event.target.value)} />
        <div className="flex flex-wrap items-end justify-end gap-2">
          <Button type="button" variant="secondary" onClick={clear}>Limpiar</Button>
          <Button type="button" variant="secondary" onClick={() => router.push(appRoutes.createAnswerOption)}>Nueva opción</Button>
          <Button>Buscar</Button>
        </div>
      </form>
    </Panel>
    <Notice title="Búsqueda de opciones de respuesta">Ingresá un nombre para filtrar o presioná “Buscar” vacío para ver todas las opciones.</Notice>
  </>;
}
