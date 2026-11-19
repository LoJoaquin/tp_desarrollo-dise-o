"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCompanies } from "@/features/companies/hooks";
import type { Company } from "@/features/companies/types";
import { useCompetencies } from "@/features/competencies/hooks";
import { useCreatePosition, usePosition, usePositionCharacteristics, useUpdatePosition } from "@/features/positions/hooks";
import type { Competency } from "@/features/competencies/types";
import { Button, CreateAnotherPrompt, ErrorMessage, Field, LoadingState, Notice, PageHeader, Panel, SelectField, TextAreaField, ValidationSummary } from "@/shared/ui";

const blank = { codigo: "", nombre: "", descripcion: "", empresaId: "" };
export default function PositionForm({ positionId }: { positionId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState(blank);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [weights, setWeights] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(!!positionId);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [created, setCreated] = useState(false);
  const competencyList = useCompetencies();
  const companyList = useCompanies();
  const positionQuery = usePosition();
  const characteristicsQuery = usePositionCharacteristics();
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [rows, companyRows] = await Promise.all([
        competencyList.execute(undefined),
        companyList.execute(undefined),
      ]);
      if (mounted && rows) setCompetencies(rows);
      if (mounted && companyRows) setCompanies(companyRows);
      if (!positionId) return;
      const [position, characteristics] = await Promise.all([
        positionQuery.execute(positionId),
        characteristicsQuery.execute(positionId),
      ]);
      if (mounted && position) setForm({ codigo: position.codigo, nombre: position.nombre, descripcion: position.descripcion ?? "", empresaId: String(position.empresaId ?? "") });
      if (mounted && characteristics) setWeights(Object.fromEntries(characteristics.map((item) => [item.competenciaId, String(item.ponderacion)])));
      if (mounted) setLoading(false);
    }
    void load();
    return () => { mounted = false; };
  }, [positionId, competencyList.execute, companyList.execute, positionQuery.execute, characteristicsQuery.execute]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errors: string[] = [];
    if (!positionId && !form.codigo.trim()) errors.push("Ingresá el código del puesto.");
    if (!form.nombre.trim()) errors.push("Ingresá el nombre del puesto.");
    if (!form.empresaId) errors.push("Seleccioná una empresa.");
    const selectedWeights = Object.entries(weights);
    if (selectedWeights.length === 0) errors.push("Seleccioná al menos una competencia y asignale una ponderación.");
    if (selectedWeights.some(([, value]) => value.trim() === "")) errors.push("Completá la ponderación de cada competencia seleccionada.");
    if (selectedWeights.some(([, value]) => value.trim() !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 10))) errors.push("Cada ponderación debe ser un número entre 0 y 10.");
    setValidationErrors(errors);
    if (errors.length) return;
    const characteristics = Object.entries(weights).filter(([, value]) => value !== "").map(([id, value]) => ({ ponderacion: Number(value), competencia: { id: Number(id) } }));
    const result = positionId
      ? await updatePosition.execute({ id: positionId, body: { nombre: form.nombre, descripcion: form.descripcion || null, empresa: { id: Number(form.empresaId) }, caracteristicasPuesto: characteristics } }, "Puesto modificado.")
      : await createPosition.execute({ codigo: form.codigo, nombre: form.nombre, descripcion: form.descripcion || null, empresa: { id: Number(form.empresaId) }, caracteristicasPuesto: characteristics });
    if (result && positionId) router.push("/puestos");
    else if (result) setCreated(true);
  }

  function createAnother() { setForm(blank); setWeights({}); setValidationErrors([]); setCreated(false); createPosition.clear(); }

  if (created) return <CreateAnotherPrompt title="Puesto creado" description={`El puesto “${form.nombre.trim()}” se creó correctamente.`} question="¿Deseás crear otro puesto?" affirmativeLabel="Sí, crear otro" finishLabel="No, volver a gestionar puestos" onCreateAnother={createAnother} onFinish={() => router.push("/puestos")} />;

  function updateWeight(id: number, checked: boolean, value = "1") {
    setWeights((current) => checked ? { ...current, [id]: value } : Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== id)));
  }

  return <>
    <PageHeader eyebrow="Gestión de puestos" title={positionId ? "Modificar puesto" : "Dar de alta puesto"} description="Ingresá los datos del puesto, la empresa y las competencias requeridas." />
    <Panel title="Datos del puesto">{loading ? <LoadingState /> : <form noValidate onSubmit={submit} className="grid max-w-3xl gap-4">
      <Field label="Código" disabled={!!positionId} value={form.codigo} onChange={(event) => { setForm({ ...form, codigo: event.target.value }); setValidationErrors([]); }} />
      <Field label="Nombre" value={form.nombre} onChange={(event) => { setForm({ ...form, nombre: event.target.value }); setValidationErrors([]); }} />
      <TextAreaField label="Descripción" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
      <SelectField label="Empresa" value={form.empresaId} disabled={companyList.isPending || companies.length === 0} onChange={(event) => { setForm({ ...form, empresaId: event.target.value }); setValidationErrors([]); }}>
        <option value="">{companyList.isPending ? "Cargando empresas…" : companies.length ? "Seleccionar empresa" : "No hay empresas disponibles"}</option>
        {companies.map((company) => <option key={company.id} value={company.id}>{company.nombre}</option>)}
      </SelectField>
      <fieldset><legend className="mb-2 text-sm font-semibold">Competencias y ponderaciones</legend><div className="grid gap-2 rounded-lg border border-[var(--color-border)] p-3">{competencies.filter((item) => item.estaActivo).map((item) => <label key={item.id} className="grid grid-cols-[1fr_130px] items-center gap-3 text-sm"><span><input className="mr-2 accent-blue-700" type="checkbox" checked={weights[item.id] !== undefined} onChange={(event) => updateWeight(item.id, event.target.checked)} />{item.nombre}</span>{weights[item.id] !== undefined && <input aria-label={`Ponderación ${item.nombre}`} className="rounded-lg border border-[var(--color-border)] px-2 py-1" type="number" min="0" max="10" step="any" value={weights[item.id]} onChange={(event) => updateWeight(item.id, true, event.target.value)} />}</label>)}</div></fieldset>
      <ValidationSummary errors={validationErrors} />
      <ErrorMessage error={companyList.error} />
      <ErrorMessage error={competencyList.error} />
      <ErrorMessage error={positionQuery.error} />
      <ErrorMessage error={characteristicsQuery.error} />
      <ErrorMessage error={createPosition.error} />
      <ErrorMessage error={updatePosition.error} />
      {(createPosition.success || updatePosition.success) && <Notice tone="success">{createPosition.success || updatePosition.success}</Notice>}
      <div className="flex gap-2"><Button disabled={createPosition.isPending || updatePosition.isPending}>{positionId ? "Guardar cambios" : "Crear puesto"}</Button><Button type="button" variant="secondary" onClick={() => router.push("/puestos")}>Cancelar</Button></div>
    </form>}</Panel>
  </>;
}
