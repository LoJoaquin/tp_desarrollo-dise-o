"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as service from "@/features/competencies/service";
import { useAction } from "@/shared/hooks/use-action";
import { Button, CreateAnotherPrompt, ErrorMessage, Field, LoadingState, Notice, PageHeader, Panel, TextAreaField, ValidationSummary } from "@/shared/ui";

const blank = { codigo: "", nombre: "", descripcion: "" };
export default function CompetencyForm({ competencyId }: { competencyId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(!!competencyId);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [created, setCreated] = useState(false);
  const action = useAction();
  useEffect(() => {
    if (!competencyId) return;
    service.getCompetency(competencyId).then((row) => setForm({ codigo: row.codigo, nombre: row.nombre, descripcion: row.descripcion ?? "" })).catch(setLoadError).finally(() => setLoading(false));
  }, [competencyId]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const errors: string[] = [];
    if (!competencyId && !form.codigo.trim()) errors.push("Ingresá el código de la competencia.");
    if (!form.nombre.trim()) errors.push("Ingresá el nombre de la competencia.");
    setValidationErrors(errors);
    if (errors.length) return;
    const result = competencyId
      ? await action.run(() => service.updateCompetency(competencyId, { nombre: form.nombre, descripcion: form.descripcion || null }), "Competencia modificada.")
      : await action.run(() => service.createCompetency({ ...form, descripcion: form.descripcion || null }));
    if (result && competencyId) router.push("/administracion/competencias");
    else if (result) setCreated(true);
  }

  function createAnother() { setForm(blank); setValidationErrors([]); setCreated(false); action.clear(); }

  if (created) return <CreateAnotherPrompt title="Competencia creada" description={`La competencia “${form.nombre.trim()}” se creó correctamente.`} question="¿Deseás crear otra competencia?" affirmativeLabel="Sí, crear otra" finishLabel="No, volver a gestionar competencias" onCreateAnother={createAnother} onFinish={() => router.push("/administracion/competencias")} />;
  return <>
    <PageHeader eyebrow="Gestión de competencias" title={competencyId ? "Modificar competencia" : "Dar de alta competencia"} />
    <Panel title="Datos de la competencia">{loading ? <LoadingState /> : <form noValidate onSubmit={submit} className="grid max-w-xl gap-4">
      <Field label="Código" disabled={!!competencyId} value={form.codigo} onChange={(event) => { setForm({ ...form, codigo: event.target.value }); setValidationErrors([]); }} />
      <Field label="Nombre" value={form.nombre} onChange={(event) => { setForm({ ...form, nombre: event.target.value }); setValidationErrors([]); }} />
      <TextAreaField label="Descripción" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
      <ValidationSummary errors={validationErrors} />
      <ErrorMessage error={loadError ?? action.error} />{action.success && <Notice tone="success">{action.success}</Notice>}
      <div className="flex gap-2"><Button disabled={action.isPending}>{competencyId ? "Guardar cambios" : "Crear competencia"}</Button><Button type="button" variant="secondary" onClick={() => router.push("/administracion/competencias")}>Cancelar</Button></div>
    </form>}</Panel>
  </>;
}
