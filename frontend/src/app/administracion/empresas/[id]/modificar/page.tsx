import CompanyForm from "@/features/companies/components/company-form";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompanyForm companyId={Number(id)} />;
}
