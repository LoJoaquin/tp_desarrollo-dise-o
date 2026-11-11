import CompanyResults from "@/features/companies/components/company-results";
import type { SearchCompaniesRequest } from "@/features/companies/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CompanyResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const criteria: SearchCompaniesRequest = {
    nombre: typeof params.nombre === "string" ? params.nombre : undefined,
    id: typeof params.id === "string" ? Number(params.id) : undefined,
  };
  return <CompanyResults criteria={criteria} />;
}
