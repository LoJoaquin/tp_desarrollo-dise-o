"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Notice, PageHeader, Panel, DataTable } from "@/shared/ui";

type Job = { codigo: string; nombre: string; empresa: string };

export default function ResultsExportPage() {
  const [filters, setFilters] = useState({ nombre: "", empresa: "", desde: "", hasta: "" });
  const [rows, setRows] = useState<Job[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  function search(event: FormEvent) {
    event.preventDefault();
    setRows([]);
    setSelected(null);
    setAttempted(true);
  }

  return <>
    <PageHeader eyebrow="Consultor · CU007" title="Exportar resultados" description="El caso de uso busca puestos por nombre, empresa y fechas de finalización, y después genera un CSV con sus evaluaciones completas." />
    <Notice tone="warning" title="Pantalla preparada; exportación pendiente del backend">No existe un endpoint para buscar evaluaciones completas por fechas ni para obtener/descargar el CSV. Los resultados no se inventan. El botón de búsqueda deja visible el faltante y no genera un archivo falso.</Notice>
    <Panel title="Buscar puestos"><form onSubmit={search} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Field label="Nombre del puesto" value={filters.nombre} onChange={(e) => setFilters({ ...filters, nombre: e.target.value })} /><Field label="Empresa" value={filters.empresa} onChange={(e) => setFilters({ ...filters, empresa: e.target.value })} /><Field label="Finalización desde" type="date" value={filters.desde} onChange={(e) => setFilters({ ...filters, desde: e.target.value })} /><Field label="Finalización hasta" type="date" value={filters.hasta} onChange={(e) => setFilters({ ...filters, hasta: e.target.value })} /><div className="sm:col-span-2 xl:col-span-4"><Button>Buscar evaluaciones</Button></div></form>
      {attempted && <Notice tone="error" title="No se pudieron consultar evaluaciones">Falta el endpoint de búsqueda de evaluaciones finalizadas con filtros por puesto, empresa y fecha. El endpoint actual de reportes solo devuelve un resumen y no incluye los datos requeridos para el CSV.</Notice>}
    </Panel>
    <Panel className="mt-6" title="Puestos encontrados" description="El CU pide seleccionar un puesto y revisar sus candidatos evaluados antes de exportar." ><DataTable rows={rows} rowKey={(row) => row.codigo} columns={[{ key: "select", header: "Seleccionar", render: (row) => <input aria-label={`Seleccionar ${row.nombre}`} type="radio" name="puesto" checked={selected === row.codigo} onChange={() => setSelected(row.codigo)} /> }, { key: "codigo", header: "Código", render: (row) => row.codigo }, { key: "puesto", header: "Puesto", render: (row) => row.nombre }, { key: "empresa", header: "Empresa", render: (row) => row.empresa }]} emptyTitle="No hay datos del backend para mostrar" emptyDescription="La tabla está preparada; se completará cuando exista el endpoint de búsqueda definido para este caso de uso." />
      <div className="mt-4"><Button disabled={!selected} onClick={() => setAttempted(true)}>Exportar CSV</Button>{!selected && <p className="mt-2 text-xs text-slate-500">Primero se debe seleccionar un puesto. La exportación seguirá pendiente hasta que el backend entregue los candidatos y el archivo.</p>}</div>
    </Panel>
  </>;
}
