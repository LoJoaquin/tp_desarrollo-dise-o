"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanySearch } from "@/features/companies/hooks";
import type { Company, SearchCompaniesRequest } from "@/features/companies/types";
import { Button, DataTable, ErrorMessage, LoadingState, PageHeader, Panel } from "@/shared/ui";

export default function CompanyResults({ criteria }: { criteria: SearchCompaniesRequest }) {
  const router = useRouter();
  const [rows, setRows] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const searchCompanies = useCompanySearch();

  async function search() {
    setLoading(true);
    const result = await searchCompanies.execute(criteria);
    if (result) setRows(result);
    setLoading(false);
  }
  useEffect(() => { void search(); }, []);

  return <>
    <PageHeader eyebrow="Gestión" title="Gestionar empresas" description="Resultado de la búsqueda de empresas." actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => router.push("/administracion/empresas")}>Volver a buscar</Button><Button onClick={() => router.push("/administracion/empresas/nueva")}>Nueva empresa</Button></div>} />
    <Panel title="Resultados de la búsqueda" description="Se muestran las empresas que coinciden con los criterios ingresados.">
      {loading ? <LoadingState label="Buscando empresas…" /> : <DataTable rows={rows} rowKey={(row) => row.id} columns={[
        { key: "id", header: "ID", render: (row) => row.id },
        { key: "nombre", header: "Empresa", render: (row) => row.nombre },
        { key: "acciones", header: "Acciones", render: (row) => <Button variant="secondary" onClick={() => router.push(`/administracion/empresas/${row.id}/modificar`)}>Modificar</Button> },
      ]} emptyTitle="No se encontraron empresas" emptyDescription="Volvé a la búsqueda y probá otros criterios." />}
      <ErrorMessage error={searchCompanies.error} />
    </Panel>
  </>;
}
