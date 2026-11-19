"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAnswerOption, useCreateAnswerOption, useUpdateAnswerOption } from "@/features/answer-options/hooks";
import type { AnswerOption, AnswerOptionDetail } from "@/features/answer-options/types";
import { appRoutes } from "@/shared/navigation/routes";
import { Button, ErrorMessage, Field, LoadingState, Notice, PageHeader, Panel, TextAreaField, ValidationSummary } from "@/shared/ui";

type Mode = "create" | "update";
type DetailForm = { id?: number; ordenVisualizacion: string; descripcion: string };
type FormState = { nombre: string; descripcion: string; detalles: DetailForm[] };
const blank: FormState = { nombre: "", descripcion: "", detalles: [{ ordenVisualizacion: "1", descripcion: "" }, { ordenVisualizacion: "2", descripcion: "" }] };

export default function AnswerOptionForm({ mode, answerOptionId }: { mode: Mode; answerOptionId?: number }) {
  const router = useRouter();
  const isUpdate = mode === "update";
  const [form, setForm] = useState<FormState>(blank);
  const [loading, setLoading] = useState(isUpdate);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const getAnswerOption = useAnswerOption();
  const createAnswerOption = useCreateAnswerOption();
  const updateAnswerOption = useUpdateAnswerOption();

  useEffect(() => {
    if (!isUpdate) return;
    if (!answerOptionId || answerOptionId < 1) {
      setLoadError(new Error("El identificador de la opción de respuesta no es válido."));
      setLoading(false);
      return;
    }
    getAnswerOption.execute(answerOptionId)
      .then((option) => { if (option) setForm(fromAnswerOption(option)); })
      .catch(setLoadError)
      .finally(() => setLoading(false));
  }, [isUpdate, answerOptionId]);

  function updateDetail(index: number, detail: DetailForm) {
    setForm((current) => ({ ...current, detalles: current.detalles.map((item, itemIndex) => itemIndex === index ? detail : item) }));
    setValidationErrors([]);
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!isUpdate && !form.nombre.trim()) errors.push("Ingresá el nombre de la opción.");
    if (!form.descripcion.trim()) errors.push("Ingresá la descripción de la opción.");
    if (form.detalles.length === 0) errors.push("La opción debe tener al menos un detalle.");
    form.detalles.forEach((detail, index) => {
      if (!detail.descripcion.trim()) errors.push(`Completá la descripción del detalle ${index + 1}.`);
      if (!detail.ordenVisualizacion.trim()) errors.push(`Ingresá el orden de visualización del detalle ${index + 1}.`);
      else if (!Number.isInteger(Number(detail.ordenVisualizacion)) || Number(detail.ordenVisualizacion) < 1) errors.push(`El orden del detalle ${index + 1} debe ser un entero mayor o igual a 1.`);
    });
    const orders = form.detalles.map((detail) => Number(detail.ordenVisualizacion)).sort((a, b) => a - b);
    if (orders.every(Number.isInteger) && orders.some((order, index) => order !== index + 1)) errors.push("Los órdenes de visualización deben ser consecutivos desde 1.");
    const descriptions = form.detalles.map((detail) => detail.descripcion.trim().toLocaleUpperCase("es-AR"));
    if (new Set(descriptions.filter(Boolean)).size !== descriptions.filter(Boolean).length) errors.push("No se puede repetir la descripción de un detalle dentro de la misma opción.");
    return errors;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setValidationErrors([]);
    const errors = validate();
    if (errors.length) { setValidationErrors(errors); return; }
    if (isUpdate && !answerOptionId) return;

    if (isUpdate) {
      const option = await updateAnswerOption.execute({ id: answerOptionId, body: {
        descripcion: form.descripcion.trim().toLocaleUpperCase("es-AR"),
        detalles: form.detalles.map((detail) => ({ id: detail.id!, ordenVisualizacion: Number(detail.ordenVisualizacion), descripcion: detail.descripcion.trim().toLocaleUpperCase("es-AR") })),
      } }, "La operación ha culminado con éxito.");
      if (option) router.push(appRoutes.answerOptionResults);
      return;
    }

    const option = await createAnswerOption.execute({
      nombre: form.nombre.trim().toLocaleUpperCase("es-AR"),
      descripcion: form.descripcion.trim().toLocaleUpperCase("es-AR"),
      detalles: form.detalles.map((detail) => ({ ordenVisualizacion: Number(detail.ordenVisualizacion), descripcion: detail.descripcion.trim().toLocaleUpperCase("es-AR") })),
    });
    if (option) setCreatedName(option.nombre);
  }

  function createAnother() {
    setForm(blank);
    setCreatedName(null);
    setValidationErrors([]);
    createAnswerOption.clear();
    updateAnswerOption.clear();
  }

  if (createdName) return <>
    <PageHeader eyebrow="CU029 · Alta" title="Opción de respuesta creada" description={`La opción “${createdName}” se creó correctamente.`} />
    <Panel title="¿Deseás cargar otra opción?">
      <div className="flex flex-wrap gap-2"><Button onClick={createAnother}>Sí, cargar otra</Button><Button variant="secondary" onClick={() => router.push(appRoutes.answerOptions)}>No, volver a gestionar opciones</Button></div>
    </Panel>
  </>;

  return <>
    <PageHeader eyebrow={isUpdate ? "CU030 · Modificación" : "CU029 · Alta"} title={isUpdate ? "Modificar opción de respuesta" : "Dar de alta opción de respuesta"} description={isUpdate ? "El nombre no se modifica y no se pueden agregar ni quitar detalles." : "Completá el nombre, la descripción y la lista ordenada de opciones."} />
    <Panel title={isUpdate ? "Datos de la opción" : "Nueva opción de respuesta"}>
      {loading ? <LoadingState label="Cargando la opción de respuesta…" /> : <form noValidate onSubmit={submit} className="grid max-w-3xl gap-4">
        <ErrorMessage error={loadError ?? getAnswerOption.error ?? createAnswerOption.error ?? updateAnswerOption.error} />
        {!isUpdate && <Field label="Nombre" value={form.nombre} onChange={(event) => { setForm({ ...form, nombre: event.target.value.toLocaleUpperCase("es-AR") }); setValidationErrors([]); }} />}
        {isUpdate && <Field label="Nombre (solo lectura)" readOnly value={form.nombre} />}
        <TextAreaField label="Descripción" value={form.descripcion} onChange={(event) => { setForm({ ...form, descripcion: event.target.value.toLocaleUpperCase("es-AR") }); setValidationErrors([]); }} />
        <fieldset className="grid gap-3">
          <legend className="text-sm font-semibold">Lista de opciones</legend>
          {form.detalles.map((detail, index) => <div key={detail.id ?? index} className="grid items-end gap-3 rounded-lg border border-[var(--color-border)] p-3 sm:grid-cols-[120px_minmax(0,1fr)_auto]">
            <Field label="Orden" type="number" min="1" value={detail.ordenVisualizacion} onChange={(event) => updateDetail(index, { ...detail, ordenVisualizacion: event.target.value })} />
            <Field label={`Descripción de opción ${index + 1}`} value={detail.descripcion} onChange={(event) => updateDetail(index, { ...detail, descripcion: event.target.value.toLocaleUpperCase("es-AR") })} />
            {!isUpdate && <Button type="button" variant="ghost" onClick={() => { setForm((current) => ({ ...current, detalles: current.detalles.filter((_, itemIndex) => itemIndex !== index) })); setValidationErrors([]); }}>Quitar</Button>}
          </div>)}
          {!isUpdate && <div><Button type="button" variant="secondary" onClick={() => { setForm((current) => ({ ...current, detalles: [...current.detalles, { ordenVisualizacion: String(current.detalles.length + 1), descripcion: "" }] })); setValidationErrors([]); }}>Agregar opción</Button></div>}
        </fieldset>
        {isUpdate && <Notice tone="info">La modificación conserva la cantidad de opciones existente. Podés cambiar el orden y las descripciones, pero no agregar ni quitar opciones.</Notice>}
        <ValidationSummary errors={validationErrors} />
        {updateAnswerOption.success && <Notice tone="success">{updateAnswerOption.success}</Notice>}
        <div className="flex gap-2"><Button disabled={createAnswerOption.isPending || updateAnswerOption.isPending}>{createAnswerOption.isPending || updateAnswerOption.isPending ? "Guardando…" : isUpdate ? "Guardar cambios" : "Crear opción"}</Button><Button type="button" variant="secondary" onClick={() => router.push(appRoutes.answerOptions)}>Cancelar</Button></div>
      </form>}
    </Panel>
  </>;
}

function fromAnswerOption(option: AnswerOption): FormState {
  return {
    nombre: option.nombre,
    descripcion: option.descripcion,
    detalles: (option.detalles ?? []).map((detail: AnswerOptionDetail) => ({ id: detail.id, ordenVisualizacion: String(detail.ordenVisualizacion), descripcion: detail.descripcion })),
  };
}
