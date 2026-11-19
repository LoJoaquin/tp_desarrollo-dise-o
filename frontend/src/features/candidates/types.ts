import type { Genero, Nacionalidad, TipoDocumento } from "@/shared/types/enums";

export type Candidate = {
  id: number;
  numeroCandidato: string;
  nombre: string;
  apellido: string;
  tipoDocumento: TipoDocumento | null;
  numeroDocumento: string | null;
  fechaNacimiento: string | null;
  genero: Genero | null;
  nacionalidad: Nacionalidad | null;
  email: string | null;
  escolaridad: string | null;
  estaActivo: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
};
export type SearchCandidatesRequest = { apellido?: string | null; nombre?: string | null; numeroCandidato?: string | null };
export type CreateCandidateRequest = Omit<Candidate, "id" | "estaActivo" | "updatedAt" | "createdAt"> & { createdAt?: string | null; contrasenia: string };
export type UpdateCandidateRequest = Omit<CreateCandidateRequest, "createdAt" | "contrasenia"> & { contrasenia?: string };
export type CandidateCreatedResponse = Omit<Candidate, "estaActivo" | "createdAt" | "updatedAt">;
export type NationalityOption = { codigo: Nacionalidad; nombre: string };
