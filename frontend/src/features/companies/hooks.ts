"use client";
import { useApiMutation, useApiQuery } from "@/shared/api/hooks";
import { createCompany, searchCompanies, updateCompany } from "./service";
import type { CreateCompanyRequest, SearchCompaniesRequest, UpdateCompanyRequest } from "./types";

export function useCompanySearch(criteria: SearchCompaniesRequest) {
  return useApiQuery(() => searchCompanies(criteria), [criteria.id, criteria.nombre]);
}
export function useCreateCompany() { return useApiMutation((body: CreateCompanyRequest) => createCompany(body)); }
export function useUpdateCompany() { return useApiMutation(({ id, body }: { id: number; body: UpdateCompanyRequest }) => updateCompany(id, body)); }
