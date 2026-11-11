"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as service from "@/features/companies/service";
import { useAction } from "@/shared/hooks/use-action";
import { Button, CreateAnotherPrompt, ErrorMessage, Field, LoadingState, Notice, PageHeader, Panel, ValidationSummary } from "@/shared/ui";

export default function CompanyForm({ companyId }: { companyId?: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(!!companyId);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [created, setCreated] = useState(false);
  const action = useAction();

  useEffect(() => {
    if (!companyId) return;
    service.searchCompanies({ id: companyId }).then((rows) => {
      if (!rows[0]) throw new Error("No se encontró la empresa solicitada.");
      setName(rows[0].nombre);
    }).catch(setLoadError).finally(() => setLoading(false));
  }, [companyId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errors = name.trim() ? [] : ["Ingresá el nombre de la empresa."];
    setValidationErrors(errors);
    if (errors.length) return;
    const result = companyId
      ? await action.run(() => service.updateCompany(companyId, { nombre: name }), "Empresa modificada.")
      : await action.run(() => service.createCompany({ nombre: name }));
    if (result && companyId) router.push("/administracion/empresas");
    else if (result) setCreated(true);
  }

  function createAnother() { setName(""); setValidationErrors([]); setCreated(false); action.clear(); }

  if (created) return <CreateAnotherPrompt title="Empresa creada" description={`La empresa “${name.trim()}” se creó correctamente.`} question="¿Deseás crear otra empresa?" affirmativeLabel="Sí, crear otra" finishLabel="No, volver a gestionar empresas" onCreateAnother={createAnother} onFinish={() => router.push("/administracion/empresas")} />;

  return <>
    <PageHeader eyebrow="Gestión de empresas" title={companyId ? "Modificar empresa" : "Dar de alta empresa"} description="Ingresá el nombre de la empresa y confirmá la operación." />
    <Panel title="Datos de la empresa">
      {loading ? <LoadingState /> : <form noValidate onSubmit={submit} className="grid max-w-xl gap-4">
        <Field label="Nombre" value={name} onChange={(event) => { setName(event.target.value); setValidationErrors([]); }} />
        <ValidationSummary errors={validationErrors} />
        <ErrorMessage error={loadError ?? action.error} />
        {action.success && <Notice tone="success">{action.success}</Notice>}
        <div className="flex gap-2"><Button disabled={action.isPending}>{companyId ? "Guardar cambios" : "Crear empresa"}</Button><Button type="button" variant="secondary" onClick={() => router.push("/administracion/empresas")}>Cancelar</Button></div>
      </form>}
    </Panel>
  </>;
}
