"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as service from "@/features/factors/service";
import * as competencyService from "@/features/competencies/service";
import type { Competency } from "@/features/competencies/types";
import { useAction } from "@/shared/hooks/use-action";
import { Button, CreateAnotherPrompt, ErrorMessage, Field, LoadingState, Notice, PageHeader, Panel, SelectField, TextAreaField, ValidationSummary } from "@/shared/ui";

const blank = { codigo: "", nombre: "", descripcion: "", nroOrden: "", competencia_id: "" };
export default function FactorForm({ factorId }: { factorId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState(blank);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(!!factorId);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [created, setCreated] = useState(false);
  const action = useAction();
  useEffect(() => {
    competencyService.listCompetencies().then(setCompetencies).catch(setLoadError);
    if (!factorId) return;
    service.getFactor(factorId).then((row) => setForm({ codigo: row.codigo, nombre: row.nombre, descripcion: row.descripcion ?? "", nroOrden: String(row.nroOrden ?? ""), competencia_id: String(row.competenciaId ?? "") })).catch(setLoadError).finally(() => setLoading(false));
  }, [factorId]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const errors: string[] = [];
    if (!factorId && !form.codigo.trim()) errors.push("Ingresá el código del factor.");
    if (!form.nombre.trim()) errors.push("Ingresá el nombre del factor.");
    if (!form.nroOrden.trim()) errors.push("Ingresá el número de orden.");
    else if (!Number.isInteger(Number(form.nroOrden)) || Number(form.nroOrden) < 1) errors.push("El número de orden debe ser un entero mayor o igual a 1.");
    if (!form.competencia_id) errors.push("Seleccioná una competencia.");
    setValidationErrors(errors);
    if (errors.length) return;
    const result = factorId
      ? await action.run(() => service.updateFactor(factorId, { nombre: form.nombre, descripcion: form.descripcion || null, competencia_id: Number(form.competencia_id), nroOrden: Number(form.nroOrden) }), "Factor modificado.")
      : await action.run(() => service.createFactor({ codigo: form.codigo, nombre: form.nombre, descripcion: form.descripcion || null, nroOrden: Number(form.nroOrden), estaActvivo: true, competencia_id: Number(form.competencia_id) }));
    if (result && factorId) router.push("/administracion/factores");
    else if (result) setCreated(true);
  }

  function createAnother() { setForm(blank); setValidationErrors([]); setCreated(false); action.clear(); }

  if (created) return <CreateAnotherPrompt title="Factor creado" description={`El factor “${form.nombre.trim()}” se creó correctamente.`} question="¿Deseás crear otro factor?" affirmativeLabel="Sí, crear otro" finishLabel="No, volver a gestionar factores" onCreateAnother={createAnother} onFinish={() => router.push("/administracion/factores")} />;
  return <>
    <PageHeader eyebrow="Gestión de factores" title={factorId ? "Modificar factor" : "Dar de alta factor"} description="Los factores se asocian a una competencia y se ordenan dentro de ella." />
    <Panel title="Datos del factor">{loading ? <LoadingState /> : <form noValidate onSubmit={submit} className="grid max-w-2xl gap-4">
      <Field label="Código" disabled={!!factorId} value={form.codigo} onChange={(event) => { setForm({ ...form, codigo: event.target.value }); setValidationErrors([]); }} />
      <Field label="Nombre" value={form.nombre} onChange={(event) => { setForm({ ...form, nombre: event.target.value }); setValidationErrors([]); }} />
      <TextAreaField label="Descripción" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Número de orden" min="1" type="number" value={form.nroOrden} onChange={(event) => { setForm({ ...form, nroOrden: event.target.value }); setValidationErrors([]); }} /><SelectField label="Competencia" value={form.competencia_id} onChange={(event) => { setForm({ ...form, competencia_id: event.target.value }); setValidationErrors([]); }}><option value="">Seleccionar competencia</option>{competencies.filter((row) => row.estaActivo).map((row) => <option key={row.id} value={row.id}>{row.codigo} · {row.nombre}</option>)}</SelectField></div>
      <ValidationSummary errors={validationErrors} />
      <ErrorMessage error={loadError ?? action.error} />{action.success && <Notice tone="success">{action.success}</Notice>}
      <div className="flex gap-2"><Button disabled={action.isPending}>{factorId ? "Guardar cambios" : "Crear factor"}</Button><Button type="button" variant="secondary" onClick={() => router.push("/administracion/factores")}>Cancelar</Button></div>
    </form>}</Panel>
  </>;
}
