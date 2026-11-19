"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCandidateLogin } from "@/features/auth/hooks";
import type { TipoDocumento } from "@/shared/types/enums";
import { Button, ErrorMessage, Field, PageHeader, Panel, SelectField, ValidationSummary } from "@/shared/ui";

export default function CandidateLoginPage() {
  const router = useRouter();
  const login = useCandidateLogin();
  const [tipo, setTipo] = useState<TipoDocumento | "">("");
  const [documento, setDocumento] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (!tipo) nextErrors.push("Seleccioná el tipo de documento.");
    if (!documento.trim()) nextErrors.push("Ingresá el número de documento.");
    if (!contrasenia) nextErrors.push("Ingresá tu contraseña.");
    setErrors(nextErrors);
    if (nextErrors.length) return;

    const result = await login.execute({
      tipo: tipo as TipoDocumento,
      documento: documento.trim(),
      contrasenia,
    });
    if (!result) return;
    sessionStorage.setItem("candidate-session", JSON.stringify(result));
    router.push("/cuestionario");
  }

  return <>
    <PageHeader eyebrow="Ingreso de candidato" title="Iniciá sesión" description="Ingresá tus datos personales. Después vas a ingresar la clave del cuestionario que te compartió el consultor." />
    <Panel title="Datos de acceso" description="Usá el tipo y número de documento registrados para tu candidatura.">
      <form noValidate onSubmit={submit} className="grid max-w-xl gap-4">
        <SelectField label="Tipo de documento *" value={tipo} onChange={(event) => { setTipo(event.target.value); setErrors([]); }}>
          <option value="">Seleccionar…</option><option value="DNI">DNI</option><option value="LE">LE</option><option value="LC">LC</option><option value="PP">PP</option>
        </SelectField>
        <Field label="Número de documento *" inputMode="numeric" value={documento} onChange={(event) => { setDocumento(event.target.value); setErrors([]); }} />
        <Field label="Contraseña *" type="password" autoComplete="current-password" value={contrasenia} onChange={(event) => { setContrasenia(event.target.value); setErrors([]); }} />
        <ValidationSummary errors={errors} />
        <ErrorMessage error={login.error} />
        <Button disabled={login.isPending}>{login.isPending ? "Verificando…" : "Continuar"}</Button>
      </form>
    </Panel>
  </>;
}
