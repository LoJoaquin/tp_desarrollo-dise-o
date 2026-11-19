"use client";

import { useServiceAction } from "@/shared/hooks/use-service-action";
import { createCompany, listCompanies, searchCompanies, updateCompany } from "./service";
import type { CreateCompanyRequest, SearchCompaniesRequest, UpdateCompanyRequest } from "./types";

export const useCompanySearch = () =>
  useServiceAction((criteria: SearchCompaniesRequest) => searchCompanies(criteria));

export const useCompanies = () =>
  useServiceAction<void, Awaited<ReturnType<typeof listCompanies>>>(() => listCompanies());

export const useCreateCompany = () =>
  useServiceAction((body: CreateCompanyRequest) => createCompany(body));

export const useUpdateCompany = () =>
  useServiceAction(({ id, body }: { id: number; body: UpdateCompanyRequest }) =>
    updateCompany(id, body),
  );
