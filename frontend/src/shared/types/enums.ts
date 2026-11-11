// Nationality options come from GET /candidatos/nacionalidades.
// Keep API values open to future additions.
export type TipoDocumento = string;
export type Genero = string;
export type Nacionalidad = string;

export type EstadoCuestionario =
  | "ACTIVO"
  | "EN_PROCESO"
  | "COMPLETO"
  | "INCOMPLETO"
  | "SIN_CONTESTAR";

export type EstadoGrupoMerito = EstadoCuestionario
  | "COMPLETO_SI_CUMPLE_PONDERACION_MINIMA"
  | "COMPLETO_NO_CUMPLE_PONDERACION_MINIMA";
