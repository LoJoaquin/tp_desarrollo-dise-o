import type { TipoDocumento } from "@/shared/types/enums";

export type CandidateLoginRequest = { tipo: TipoDocumento; documento: string; contrasenia: string };
export type ConsultantLoginRequest = { nombreUsuario: string; contrasenia: string };
export type LoginResponse = { token: string; idCandidato: number; nombreCandidato: string };
export type ConsultantLoginResponse = { token: string; usuario: string; perfil: "CONSULTOR" };
