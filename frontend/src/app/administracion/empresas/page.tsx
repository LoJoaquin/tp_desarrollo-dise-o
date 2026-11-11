"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Notice, PageHeader, Panel } from "@/shared/ui";

export default function CompaniesManagementPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");

  function search(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() && !id) { setMessage("Completá al menos un criterio para buscar."); return; }
    const query = new URLSearchParams();
    if (name.trim()) query.set("nombre", name.trim());
    if (id) query.set("id", id);
    router.push(`/administracion/empresas/resultados?${query.toString()}`);
  }

  return <>
    <PageHeader eyebrow="Gestión" title="Gestionar empresas" description="Buscá empresas existentes o iniciá el alta de una nueva." />
    <Panel title="Filtros de búsqueda" description="Completá nombre o ID para buscar.">
      <form onSubmit={search} className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" placeholder="Buscar por nombre de empresa" value={name} onChange={(event) => setName(event.target.value)} />
        <Field label="ID" type="number" min="1" placeholder="ID de empresa" value={id} onChange={(event) => setId(event.target.value)} />
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={() => { setName(""); setId(""); setMessage(""); }}>Limpiar</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/administracion/empresas/nueva")}>Nueva empresa</Button>
          <Button>Buscar</Button>
        </div>
      </form>
      {message && <Notice tone="error">{message}</Notice>}
    </Panel>
    <Notice title="Búsqueda de empresas">Completá al menos un filtro y presioná “Buscar” para ver resultados. También podés crear una nueva empresa.</Notice>
  </>;
}
