import type { TipoDocumento } from "@/shared/types/enums";

export type CandidateLoginRequest = { tipo: TipoDocumento; documento: string; clave: string };
export type ConsultantLoginRequest = { nombreUsuario: string; contrasenia: string };
export type LoginResponse = { token: string };
