import { api } from "@/shared/api";
import type { Company, CreateCompanyRequest, SearchCompaniesRequest, UpdateCompanyRequest } from "./types";

export const createCompany = (body: CreateCompanyRequest) => api.post<Company, CreateCompanyRequest>("Empresa/crear", body);
export const listCompanies = () => api.get<Company[]>("Empresa");
export const searchCompanies = (body: SearchCompaniesRequest) => api.post<Company[], SearchCompaniesRequest>("Empresa/buscar", body);
export const updateCompany = (id: number, body: UpdateCompanyRequest) => api.put<Company, UpdateCompanyRequest>(`Empresa/modificar/${id}`, body);
