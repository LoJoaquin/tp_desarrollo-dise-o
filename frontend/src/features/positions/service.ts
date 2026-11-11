import { api } from "@/shared/api";
import type { CreatePositionRequest, Position, PositionCharacteristic, PositionReportSummary, SearchPositionsRequest, UpdatePositionRequest } from "./types";

export const listPositions = () => api.get<Position[]>("Puesto");
export const getPosition = (id: number) => api.get<Position>(`Puesto/${id}`);
export const getPositionCharacteristics = (id: number) => api.get<PositionCharacteristic[]>(`Puesto/${id}/caracteristicas`);
export const searchPositions = (body: SearchPositionsRequest) => api.post<Position[], SearchPositionsRequest>("Puesto/buscar", body);
export const createPosition = (body: CreatePositionRequest) => api.post<Position, CreatePositionRequest>("Puesto/crear", body);
export const updatePosition = (id: number, body: UpdatePositionRequest) => api.patch<Position, UpdatePositionRequest>(`Puesto/modificar/${id}`, body);
export const reactivatePosition = (id: number) => api.patch<Position>(`Puesto/${id}/reactivar`);
export const deletePosition = (id: number) => api.delete(`Puesto/baja/${id}`);
export const searchPositionReportSummaries = (body: SearchPositionsRequest) => api.post<PositionReportSummary[], SearchPositionsRequest>("Reporte/puestos/buscar", body);
