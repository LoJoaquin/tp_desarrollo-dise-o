export type Competency = { id: number; codigo: string; nombre: string; descripcion: string | null; estaActivo: boolean | null };
export type CreateCompetencyRequest = { codigo: string; nombre: string; descripcion?: string | null };
export type UpdateCompetencyRequest = { nombre?: string | null; descripcion?: string | null };
