export type AnswerOptionDetail = { id: number; ordenVisualizacion: number; descripcion: string };
export type AnswerOption = { id: number; nombre: string; descripcion: string; estaActivo: boolean; detalles?: AnswerOptionDetail[] };
export type CreateAnswerOptionRequest = { nombre: string; descripcion: string; detalles: Array<{ ordenVisualizacion: number; descripcion: string }> };
export type UpdateAnswerOptionRequest = { descripcion?: string | null; detalles?: Array<{ id: number; ordenVisualizacion: number; descripcion: string }> };
