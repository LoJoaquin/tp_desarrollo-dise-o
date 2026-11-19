"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCompanySearch, useCreateCompany, useUpdateCompany } from "@/features/companies/hooks";
import { Button, CreateAnotherPrompt, ErrorMessage, Field, LoadingState, Notice, PageHeader, Panel, ValidationSummary } from "@/shared/ui";

export default function CompanyForm({ companyId }: { companyId?: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(!!companyId);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [created, setCreated] = useState(false);
  const companySearch = useCompanySearch();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  useEffect(() => {
    if (!companyId) return;
    companySearch.execute({ id: companyId }).then((rows) => {
      if (!rows) return;
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
      ? await updateCompany.execute({ id: companyId, body: { nombre: name } }, "Empresa modificada.")
      : await createCompany.execute({ nombre: name });
    if (result && companyId) router.push("/administracion/empresas");
    else if (result) setCreated(true);
  }

  function createAnother() { setName(""); setValidationErrors([]); setCreated(false); createCompany.clear(); }

  if (created) return <CreateAnotherPrompt title="Empresa creada" description={`La empresa “${name.trim()}” se creó correctamente.`} question="¿Deseás crear otra empresa?" affirmativeLabel="Sí, crear otra" finishLabel="No, volver a gestionar empresas" onCreateAnother={createAnother} onFinish={() => router.push("/administracion/empresas")} />;

  return <>
    <PageHeader eyebrow="Gestión de empresas" title={companyId ? "Modificar empresa" : "Dar de alta empresa"} description="Ingresá el nombre de la empresa y confirmá la operación." />
    <Panel title="Datos de la empresa">
      {loading ? <LoadingState /> : <form noValidate onSubmit={submit} className="grid max-w-xl gap-4">
        <Field label="Nombre" value={name} onChange={(event) => { setName(event.target.value); setValidationErrors([]); }} />
        <ValidationSummary errors={validationErrors} />
        <ErrorMessage error={loadError ?? companySearch.error ?? createCompany.error ?? updateCompany.error} />
        {updateCompany.success && <Notice tone="success">{updateCompany.success}</Notice>}
        <div className="flex gap-2"><Button disabled={createCompany.isPending || updateCompany.isPending}>{companyId ? "Guardar cambios" : "Crear empresa"}</Button><Button type="button" variant="secondary" onClick={() => router.push("/administracion/empresas")}>Cancelar</Button></div>
      </form>}
    </Panel>
  </>;
}
