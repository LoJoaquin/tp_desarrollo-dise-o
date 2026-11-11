export type PositionCharacteristic = { id: number; ponderacion: number; competenciaId: number; competenciaNombre: string };
export type Position = { id: number; codigo: string; nombre: string; descripcion: string | null; estaActiva: boolean; empresaId: number | null; empresaNombre: string | null; caracteristicasPuesto: PositionCharacteristic[] };
export type SearchPositionsRequest = { codigo?: string | null; nombre?: string | null; empresa?: string | null };
// The current backend accepts nested JPA objects for company and competency.
export type PositionRelationInput = { id: number };
export type PositionCharacteristicInput = { ponderacion: number; competencia: PositionRelationInput };
export type CreatePositionRequest = { codigo: string; nombre: string; descripcion?: string | null; empresa: PositionRelationInput; caracteristicasPuesto: PositionCharacteristicInput[] };
export type UpdatePositionRequest = { nombre?: string | null; descripcion?: string | null; empresa?: PositionRelationInput | null; caracteristicasPuesto?: PositionCharacteristicInput[] | null };
export type PositionReportSummary = { idPuesto: number; codigoPuesto: string; nombrePuesto: string; empresa: string | null; candidatos: Array<{ nombre: string; apellido: string }>; evaluacionesCompletas: number };
