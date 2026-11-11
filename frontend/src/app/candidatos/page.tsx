"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Notice, PageHeader, Panel } from "@/shared/ui";

export default function CandidatesManagementPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState({ numeroCandidato: "", apellido: "", nombre: "" });
  const [message, setMessage] = useState("");
  function search(event: FormEvent) {
    event.preventDefault();
    if (!criteria.numeroCandidato.trim() && !criteria.apellido.trim() && !criteria.nombre.trim()) { setMessage("Completá al menos un criterio para buscar."); return; }
    const query = new URLSearchParams();
    if (criteria.numeroCandidato.trim()) query.set("numeroCandidato", criteria.numeroCandidato.trim());
    if (criteria.apellido.trim()) query.set("apellido", criteria.apellido.trim());
    if (criteria.nombre.trim()) query.set("nombre", criteria.nombre.trim());
    router.push(`/candidatos/resultados?${query.toString()}`);
  }
  return <>
    <PageHeader eyebrow="Gestión" title="Gestionar candidatos" description="Buscá candidatos existentes o iniciá el alta de uno nuevo." />
    <Panel title="Filtros de búsqueda" description="Completá al menos un criterio.">
      <form onSubmit={search} className="grid gap-4 sm:grid-cols-3">
        <Field label="Número de candidato" placeholder="Buscar por número" value={criteria.numeroCandidato} onChange={(event) => setCriteria({ ...criteria, numeroCandidato: event.target.value })} />
        <Field label="Apellido" placeholder="Buscar por apellido" value={criteria.apellido} onChange={(event) => setCriteria({ ...criteria, apellido: event.target.value })} />
        <Field label="Nombre" placeholder="Buscar por nombre" value={criteria.nombre} onChange={(event) => setCriteria({ ...criteria, nombre: event.target.value })} />
        <div className="flex justify-end gap-2 sm:col-span-3"><Button type="button" variant="secondary" onClick={() => { setCriteria({ numeroCandidato: "", apellido: "", nombre: "" }); setMessage(""); }}>Limpiar</Button><Button type="button" variant="secondary" onClick={() => router.push("/candidatos/nuevo")}>Nuevo candidato</Button><Button>Buscar</Button></div>
      </form>
      {message && <Notice tone="error">{message}</Notice>}
    </Panel>
    <Notice title="Búsqueda de candidatos">Ingresá número, apellido o nombre y presioná “Buscar” para ver resultados.</Notice>
  </>;
}
