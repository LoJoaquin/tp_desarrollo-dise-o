"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Notice, PageHeader, Panel } from "@/shared/ui";

export default function PositionsManagementPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState({ codigo: "", nombre: "", empresa: "" });
  const [message, setMessage] = useState("");
  function search(event: FormEvent) {
    event.preventDefault();
    if (!criteria.codigo.trim() && !criteria.nombre.trim() && !criteria.empresa.trim()) { setMessage("Completá al menos un criterio para buscar."); return; }
    const query = new URLSearchParams();
    if (criteria.codigo.trim()) query.set("codigo", criteria.codigo.trim());
    if (criteria.nombre.trim()) query.set("nombre", criteria.nombre.trim());
    if (criteria.empresa.trim()) query.set("empresa", criteria.empresa.trim());
    router.push(`/puestos/resultados?${query.toString()}`);
  }
  return <>
    <PageHeader eyebrow="CU008 · Gestión" title="Gestionar puestos" description="Buscá puestos existentes o iniciá el alta de uno nuevo." />
    <Panel title="Filtros de búsqueda" description="Completá al menos un criterio.">
      <form onSubmit={search} className="grid gap-4 sm:grid-cols-3">
        <Field label="Código" placeholder="Buscar por código" value={criteria.codigo} onChange={(event) => setCriteria({ ...criteria, codigo: event.target.value })} />
        <Field label="Nombre del puesto" placeholder="Buscar por nombre" value={criteria.nombre} onChange={(event) => setCriteria({ ...criteria, nombre: event.target.value })} />
        <Field label="Empresa" placeholder="Buscar por empresa" value={criteria.empresa} onChange={(event) => setCriteria({ ...criteria, empresa: event.target.value })} />
        <div className="flex justify-end gap-2 sm:col-span-3"><Button type="button" variant="secondary" onClick={() => { setCriteria({ codigo: "", nombre: "", empresa: "" }); setMessage(""); }}>Limpiar</Button><Button type="button" variant="secondary" onClick={() => router.push("/puestos/nuevo")}>Nuevo puesto</Button><Button>Buscar</Button></div>
      </form>
      {message && <Notice tone="error">{message}</Notice>}
    </Panel>
    <Notice title="Búsqueda de puestos">Ingresá código, nombre o empresa y presioná “Buscar” para ver resultados.</Notice>
  </>;
}
