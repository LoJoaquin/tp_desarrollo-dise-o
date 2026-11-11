"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as service from "@/features/positions/service";
import * as competencyService from "@/features/competencies/service";
import type { Position } from "@/features/positions/types";
import type { Competency } from "@/features/competencies/types";
import { useAction } from "@/shared/hooks/use-action";
import { Button, CreateAnotherPrompt, ErrorMessage, Field, LoadingState, Notice, PageHeader, Panel, TextAreaField, ValidationSummary } from "@/shared/ui";

const blank = { codigo: "", nombre: "", descripcion: "", empresaId: "" };
export default function PositionForm({ positionId }: { positionId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState(blank);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [weights, setWeights] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(!!positionId);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [created, setCreated] = useState(false);
  const action = useAction();

  useEffect(() => {
    competencyService.listCompetencies().then(setCompetencies).catch(setLoadError);
    if (!positionId) return;
    Promise.all([service.getPosition(positionId), service.getPositionCharacteristics(positionId)])
      .then(([position, characteristics]) => {
        setForm({ codigo: position.codigo, nombre: position.nombre, descripcion: position.descripcion ?? "", empresaId: String(position.empresaId ?? "") });
        setWeights(Object.fromEntries(characteristics.map((item) => [item.competenciaId, String(item.ponderacion)])));
      })
      .catch(setLoadError)
      .finally(() => setLoading(false));
  }, [positionId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errors: string[] = [];
    if (!positionId && !form.codigo.trim()) errors.push("Ingresá el código del puesto.");
    if (!form.nombre.trim()) errors.push("Ingresá el nombre del puesto.");
    if (!form.empresaId.trim()) errors.push("Ingresá el ID de la empresa.");
    else if (!Number.isInteger(Number(form.empresaId)) || Number(form.empresaId) < 1) errors.push("El ID de la empresa debe ser un entero mayor o igual a 1.");
    const selectedWeights = Object.entries(weights);
    if (selectedWeights.length === 0) errors.push("Seleccioná al menos una competencia y asignale una ponderación.");
    if (selectedWeights.some(([, value]) => value.trim() === "")) errors.push("Completá la ponderación de cada competencia seleccionada.");
    if (selectedWeights.some(([, value]) => value.trim() !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 10))) errors.push("Cada ponderación debe ser un número entre 0 y 10.");
    setValidationErrors(errors);
    if (errors.length) return;
    const characteristics = Object.entries(weights).filter(([, value]) => value !== "").map(([id, value]) => ({ ponderacion: Number(value), competencia: { id: Number(id) } }));
    const result = positionId
      ? await action.run(() => service.updatePosition(positionId, { nombre: form.nombre, descripcion: form.descripcion || null, empresa: { id: Number(form.empresaId) }, caracteristicasPuesto: characteristics }), "Puesto modificado.")
      : await action.run(() => service.createPosition({ codigo: form.codigo, nombre: form.nombre, descripcion: form.descripcion || null, empresa: { id: Number(form.empresaId) }, caracteristicasPuesto: characteristics }));
    if (result && positionId) router.push("/puestos");
    else if (result) setCreated(true);
  }

  function createAnother() { setForm(blank); setWeights({}); setValidationErrors([]); setCreated(false); action.clear(); }

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
      <Field label="ID de empresa" type="number" min="1" value={form.empresaId} onChange={(event) => { setForm({ ...form, empresaId: event.target.value }); setValidationErrors([]); }} hint="La API de empresas no ofrece listado general. Buscá la empresa para obtener su ID." />
      <fieldset><legend className="mb-2 text-sm font-semibold">Competencias y ponderaciones</legend><div className="grid gap-2 rounded-lg border border-[var(--color-border)] p-3">{competencies.filter((item) => item.estaActivo).map((item) => <label key={item.id} className="grid grid-cols-[1fr_130px] items-center gap-3 text-sm"><span><input className="mr-2 accent-blue-700" type="checkbox" checked={weights[item.id] !== undefined} onChange={(event) => updateWeight(item.id, event.target.checked)} />{item.nombre}</span>{weights[item.id] !== undefined && <input aria-label={`Ponderación ${item.nombre}`} className="rounded-lg border border-[var(--color-border)] px-2 py-1" type="number" min="0" max="10" step="any" value={weights[item.id]} onChange={(event) => updateWeight(item.id, true, event.target.value)} />}</label>)}</div></fieldset>
      <ValidationSummary errors={validationErrors} /><ErrorMessage error={loadError ?? action.error} />{action.success && <Notice tone="success">{action.success}</Notice>}
      <div className="flex gap-2"><Button disabled={action.isPending}>{positionId ? "Guardar cambios" : "Crear puesto"}</Button><Button type="button" variant="secondary" onClick={() => router.push("/puestos")}>Cancelar</Button></div>
    </form>}</Panel>
  </>;
}
