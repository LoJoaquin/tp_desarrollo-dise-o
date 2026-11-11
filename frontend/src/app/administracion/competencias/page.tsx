"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Notice, PageHeader, Panel } from "@/shared/ui";

export default function CompetenciesManagementPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [message, setMessage] = useState("");
  function search(event: FormEvent) {
    event.preventDefault();
    if (!codigo.trim() && !nombre.trim()) { setMessage("Completá al menos un criterio para buscar."); return; }
    const query = new URLSearchParams();
    if (codigo.trim()) query.set("codigo", codigo.trim());
    if (nombre.trim()) query.set("nombre", nombre.trim());
    router.push(`/administracion/competencias/resultados?${query.toString()}`);
  }
  return <>
    <PageHeader eyebrow="CU012 · Gestión" title="Gestionar competencias" description="Buscá competencias existentes o iniciá el alta de una nueva." />
    <Panel title="Filtros de búsqueda" description="Completá código o nombre para buscar competencias.">
      <form onSubmit={search} className="grid gap-4 sm:grid-cols-2">
        <Field label="Código" placeholder="Buscar por código" value={codigo} onChange={(event) => setCodigo(event.target.value)} />
        <Field label="Nombre" placeholder="Buscar por nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} />
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={() => { setCodigo(""); setNombre(""); setMessage(""); }}>Limpiar</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/administracion/competencias/nueva")}>Nueva competencia</Button>
          <Button>Buscar</Button>
        </div>
      </form>
      {message && <Notice tone="error">{message}</Notice>}
    </Panel>
    <Notice title="Búsqueda de competencias">Completá al menos un filtro y presioná “Buscar” para ver los resultados.</Notice>
  </>;
}
