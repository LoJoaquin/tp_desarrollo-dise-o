"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConsultantLogin } from "@/features/auth/hooks";
import { Button, Field, Notice, PageHeader, Panel, ValidationSummary } from "@/shared/ui";

// Requerimientos especiales del CU001: el LDAP admite hasta 15 caracteres de
// usuario y 20 de contraseña; el usuario se ingresa siempre en mayúsculas.
const MAX_USUARIO = 15;
const MAX_CONTRASENIA = 20;
const MENSAJE_INVALIDO = "El usuario o la contraseña no son válidos";

function alertaSonora() {
  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = 440;
    gain.gain.value = 0.08;
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
    oscillator.onended = () => void context.close();
  } catch {
    // Si el navegador no permite audio, solo se muestra el mensaje.
  }
}

export default function ConsultantLoginPage() {
  const router = useRouter();
  const login = useConsultantLogin();
  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (!usuario.trim()) nextErrors.push("Ingresá el nombre de usuario.");
    if (!contrasenia) nextErrors.push("Ingresá la contraseña.");
    setErrors(nextErrors);
    setLoginError(null);
    if (nextErrors.length) return;

    const result = await login.execute({ nombreUsuario: usuario.trim().toUpperCase(), contrasenia });
    if (!result) {
      // CU001 5.A: mensaje de error, alerta sonora y blanqueo de campos.
      alertaSonora();
      setLoginError(MENSAJE_INVALIDO);
      setUsuario("");
      setContrasenia("");
      document.getElementById("consultor-usuario")?.focus();
      return;
    }
    sessionStorage.removeItem("candidate-session");
    sessionStorage.setItem("consultant-session", JSON.stringify(result));
    router.push("/consultor");
  }

  const serverMessage = login.error instanceof Error ? login.error.message : null;
  const showServerDetail = serverMessage && serverMessage !== MENSAJE_INVALIDO && !serverMessage.startsWith(MENSAJE_INVALIDO);

  return <>
    <PageHeader eyebrow="CU001 · Ingresar como usuario" title="Ingreso de consultor" description="Ingresá con tu usuario y contraseña de la organización." actions={<Link className="inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold" href="/">Cambiar tipo de acceso</Link>} />
    <Panel title="Datos de acceso">
      <form noValidate onSubmit={submit} className="grid max-w-xl gap-4">
        <Field
          id="consultor-usuario"
          label="Nombre de usuario *"
          autoComplete="username"
          maxLength={MAX_USUARIO}
          value={usuario}
          onChange={(event) => { setUsuario(event.target.value.toUpperCase()); setErrors([]); setLoginError(null); }}
          style={{ textTransform: "uppercase" }}
        />
        <Field
          label="Contraseña *"
          type="password"
          autoComplete="current-password"
          maxLength={MAX_CONTRASENIA}
          value={contrasenia}
          onChange={(event) => { setContrasenia(event.target.value); setErrors([]); setLoginError(null); }}
        />
        <ValidationSummary errors={errors} />
        {loginError && <Notice tone="error" title={loginError} onDismiss={() => setLoginError(null)}>
          {showServerDetail ? serverMessage : "Revisá los datos e intentá de nuevo."}
        </Notice>}
        <div className="flex flex-wrap gap-3">
          <Button disabled={login.isPending}>{login.isPending ? "Verificando…" : "Ingresar"}</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/")}>Salir</Button>
        </div>
      </form>
    </Panel>
  </>;
}
