export type Company = { id: number; nombre: string };
export type CreateCompanyRequest = { nombre: string };
export type UpdateCompanyRequest = { nombre: string };
export type SearchCompaniesRequest = { id?: number; nombre?: string };
