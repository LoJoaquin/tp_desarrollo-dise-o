import { api } from "@/shared/api";
import type { MeritGroup, PositionReportSearch, PositionReportSummary } from "./types";

export const searchPositionSummaries = (body: PositionReportSearch) => api.post<PositionReportSummary[], PositionReportSearch>("Reporte/puestos/buscar", body);
export const getMeritOrder = (positionId: number) => api.get<MeritGroup[]>(`Reporte/puestos/${positionId}/orden-merito`);
