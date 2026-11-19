export type Factor = { id: number; codigo: string; nombre: string; descripcion: string | null; nroOrden: number | null; estaActivo: boolean; competenciaId: number | null };
export type SearchFactorsRequest = { competenciaId?: number | null; nombreCompetencia?: string; codigo?: string; nombreFactor?: string };
// The backend request uses these exact snake_case/typo field names.
export type CreateFactorRequest = { codigo: string; nombre: string; descripcion?: string | null; nroOrden?: number | null; estaActvivo?: boolean; competencia_id: number };
export type UpdateFactorRequest = { nombre?: string | null; descripcion?: string | null; competencia_id?: number | null; nroOrden?: number | null };
