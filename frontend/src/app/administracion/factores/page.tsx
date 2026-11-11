"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as competencyService from "@/features/competencies/service";
import type { Competency } from "@/features/competencies/types";
import { Button, Field, LoadingState, Notice, PageHeader, Panel, SelectField } from "@/shared/ui";

export default function FactorsManagementPage() {
  const router = useRouter();
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [competencyId, setCompetencyId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => { competencyService.listCompetencies().then(setCompetencies).catch((error) => setMessage(error instanceof Error ? error.message : "No se pudieron cargar competencias.")).finally(() => setLoading(false)); }, []);
  function search(event: FormEvent) {
    event.preventDefault();
    if (!competencyId && !codigo.trim() && !nombre.trim()) { setMessage("Completá al menos un criterio para buscar."); return; }
    const query = new URLSearchParams();
    if (competencyId) query.set("competenciaId", competencyId);
    if (codigo.trim()) query.set("codigo", codigo.trim());
    if (nombre.trim()) query.set("nombre", nombre.trim());
    router.push(`/administracion/factores/resultados?${query.toString()}`);
  }
  return <>
    <PageHeader eyebrow="CU016 · Gestión" title="Gestionar factores" description="Buscá factores existentes o iniciá el alta de uno nuevo." />
    <Panel title="Filtros de búsqueda" description="Completá al menos uno de los criterios.">
      {loading ? <LoadingState label="Cargando competencias…" /> : <form onSubmit={search} className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Competencia" value={competencyId} onChange={(event) => setCompetencyId(event.target.value)}><option value="">Seleccionar competencia</option>{competencies.filter((row) => row.estaActivo).map((row) => <option key={row.id} value={row.id}>{row.nombre}</option>)}</SelectField>
        <Field label="Código" placeholder="Buscar por código" value={codigo} onChange={(event) => setCodigo(event.target.value)} />
        <Field label="Nombre" placeholder="Buscar por nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} />
        <div className="flex items-end justify-end gap-2"><Button type="button" variant="secondary" onClick={() => { setCompetencyId(""); setCodigo(""); setNombre(""); setMessage(""); }}>Limpiar</Button><Button type="button" variant="secondary" onClick={() => router.push("/administracion/factores/nuevo")}>Nuevo factor</Button><Button>Buscar</Button></div>
      </form>}
      {message && <Notice tone="error">{message}</Notice>}
    </Panel>
    <Notice title="Búsqueda de factores">Completá al menos un filtro y presioná “Buscar” para ver los resultados.</Notice>
  </>;
}
