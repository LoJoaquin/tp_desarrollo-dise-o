"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCandidateLookupByNumber, useCreateCandidate, useNationalities, useUpdateCandidate } from "@/features/candidates/hooks";
import type { Candidate, CreateCandidateRequest, NationalityOption } from "@/features/candidates/types";
import { Button, CreateAnotherPrompt, ErrorMessage, Field, LoadingState, Notice, PageHeader, Panel, SelectField, TextAreaField, ValidationSummary } from "@/shared/ui";

function blankCandidate(): CreateCandidateRequest {
  return {
  numeroCandidato: "", apellido: "", nombre: "", tipoDocumento: null,
  numeroDocumento: null, fechaNacimiento: null, genero: null,
  nacionalidad: null, email: null, escolaridad: null,
  contrasenia: "",
  };
}

export default function CandidateForm({ candidateId, numeroCandidato }: { candidateId?: number; numeroCandidato?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<CreateCandidateRequest>(blankCandidate);
  const [nationalities, setNationalities] = useState<NationalityOption[]>([]);
  const [loading, setLoading] = useState(!!candidateId);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [created, setCreated] = useState(false);
  const nationalityQuery = useNationalities();
  const candidateLookup = useCandidateLookupByNumber();
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();

  useEffect(() => {
    void nationalityQuery.execute(undefined).then((rows) => { if (rows) setNationalities(rows); });
    if (!candidateId) return;
    if (!numeroCandidato) { setLoadError(new Error("No se recibió el número de candidato para cargar sus datos. Volvé a buscarlo.")); setLoading(false); return; }
    candidateLookup.execute(numeroCandidato).then((rows) => {
      if (!rows) return;
      const candidate = rows.find((row) => row.id === candidateId);
      if (!candidate) throw new Error("No se encontró el candidato. Volvé a realizar la búsqueda.");
      setForm(fromCandidate(candidate));
    }).catch(setLoadError).finally(() => setLoading(false));
  }, [candidateId, numeroCandidato]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errors: string[] = [];
    if (!form.numeroCandidato.trim()) errors.push("Ingresá el número de candidato.");
    if (form.numeroCandidato.length > 50) errors.push("El número de candidato no puede superar los 50 caracteres.");
    if (!form.apellido.trim()) errors.push("Ingresá el apellido.");
    if (!form.nombre.trim()) errors.push("Ingresá el nombre.");
    if (!form.tipoDocumento) errors.push("Seleccioná el tipo de documento.");
    if (!form.numeroDocumento?.trim()) errors.push("Ingresá el número de documento.");
    else if (!/^[0-9]+$/.test(form.numeroDocumento.trim())) errors.push("El número de documento solo puede contener dígitos.");
    if (!form.genero) errors.push("Seleccioná el género.");
    if (!candidateId && form.contrasenia.trim().length < 4) errors.push("Ingresá una contraseña provisoria de al menos 4 caracteres para el candidato.");
    if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.push("Ingresá un email válido.");
    setValidationErrors(errors);
    if (errors.length) return;
    const payload = { ...form, fechaNacimiento: form.fechaNacimiento || null };
    if (candidateId) {
      const { contrasenia, ...sinContrasenia } = payload;
      const update = contrasenia.trim() ? payload : sinContrasenia;
      const result = await updateCandidate.execute(
        { id: candidateId, body: update },
        "Candidato modificado.",
      );
      if (result) router.push("/candidatos");
      return;
    }

    const result = await createCandidate.execute(payload);
    if (result) setCreated(true);
  }

  function createAnother() {
    setForm(blankCandidate());
    setValidationErrors([]);
    setCreated(false);
    createCandidate.clear();
    updateCandidate.clear();
  }

  if (created) return <CreateAnotherPrompt
    title="Candidato creado"
    description={`El candidato ${form.numeroCandidato} — ${form.apellido}, ${form.nombre} se creó correctamente.`}
    question="¿Querés cargar otro candidato o volver a gestionar candidatos?"
    affirmativeLabel="Sí, cargar otro"
    finishLabel="No, volver a gestionar candidatos"
    onCreateAnother={createAnother}
    onFinish={() => router.push("/candidatos")}
  />;

  return <>
    <PageHeader eyebrow="Gestión de candidatos" title={candidateId ? "Modificar candidato" : "Dar de alta candidato"} description="Completá los datos del candidato y guardá los cambios." />
    <Panel title="Datos del candidato" description="Número de candidato, apellido y nombre son obligatorios.">
      {loading ? <LoadingState /> : <form noValidate autoComplete="off" onSubmit={submit} className="grid max-w-3xl gap-4">
        <Field label="Número de candidato" maxLength={50} value={form.numeroCandidato} onChange={(event) => { setForm({ ...form, numeroCandidato: event.target.value }); setValidationErrors([]); }} />
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Apellido" value={form.apellido} onChange={(event) => { setForm({ ...form, apellido: event.target.value }); setValidationErrors([]); }} /><Field label="Nombre" value={form.nombre} onChange={(event) => { setForm({ ...form, nombre: event.target.value }); setValidationErrors([]); }} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Tipo de documento *" value={form.tipoDocumento ?? ""} onChange={(event) => { setForm({ ...form, tipoDocumento: event.target.value || null }); setValidationErrors([]); }}><option value="">Seleccionar…</option><option value="DNI">DNI</option><option value="LE">LE</option><option value="LC">LC</option><option value="PP">PP</option></SelectField>
          <Field label="Número de documento *" maxLength={255} inputMode="numeric" value={form.numeroDocumento ?? ""} onChange={(event) => { setForm({ ...form, numeroDocumento: event.target.value || null }); setValidationErrors([]); }} />
          <Field label="Fecha de nacimiento" type="date" value={form.fechaNacimiento ?? ""} onChange={(event) => { setForm({ ...form, fechaNacimiento: event.target.value || null }); setValidationErrors([]); }} />
          <SelectField label="Género *" value={form.genero ?? ""} onChange={(event) => { setForm({ ...form, genero: event.target.value || null }); setValidationErrors([]); }}><option value="">Seleccionar…</option><option value="H">H</option><option value="M">M</option></SelectField>
          <SelectField label="Nacionalidad" value={form.nacionalidad ?? ""} onChange={(event) => setForm({ ...form, nacionalidad: event.target.value || null })}><option value="">Seleccionar…</option>{nationalities.map((item) => <option value={item.codigo} key={item.codigo}>{item.nombre}</option>)}</SelectField>
          <Field label="Email" type="email" value={form.email ?? ""} onChange={(event) => { setForm({ ...form, email: event.target.value || null }); setValidationErrors([]); }} />
        </div>
        <Field label={candidateId ? "Cambiar contraseña (opcional)" : "Contraseña provisoria para el candidato *"} type="password" autoComplete={candidateId ? "new-password" : "new-password"} value={form.contrasenia} onChange={(event) => { setForm({ ...form, contrasenia: event.target.value }); setValidationErrors([]); }} />
        <TextAreaField label="Escolaridad" value={form.escolaridad ?? ""} onChange={(event) => setForm({ ...form, escolaridad: event.target.value || null })} />
        <ValidationSummary errors={validationErrors} />
        <ErrorMessage error={loadError ?? nationalityQuery.error ?? candidateLookup.error ?? createCandidate.error ?? updateCandidate.error} />
        {(createCandidate.success || updateCandidate.success) && <Notice tone="success">{createCandidate.success || updateCandidate.success}</Notice>}
        <div className="flex gap-2"><Button disabled={createCandidate.isPending || updateCandidate.isPending}>{candidateId ? "Guardar cambios" : "Crear candidato"}</Button><Button type="button" variant="secondary" onClick={() => router.push("/candidatos")}>Cancelar</Button></div>
      </form>}
    </Panel>
  </>;
}

function fromCandidate(candidate: Candidate): CreateCandidateRequest {
  return {
    numeroCandidato: candidate.numeroCandidato,
    apellido: candidate.apellido,
    nombre: candidate.nombre,
    tipoDocumento: candidate.tipoDocumento,
    numeroDocumento: candidate.numeroDocumento,
    fechaNacimiento: candidate.fechaNacimiento,
    genero: candidate.genero,
    nacionalidad: candidate.nacionalidad,
    email: candidate.email,
    escolaridad: candidate.escolaridad,
    contrasenia: "",
  };
}
