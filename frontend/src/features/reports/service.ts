import { api, downloadFile } from "@/shared/api";
import type { ComparativeCandidate, ComparativeReport, DateRange, EvaluatedPosition, EvaluatedPositionSearch, MeritGroup, PositionReportSearch, PositionReportSummary } from "./types";

export const searchPositionSummaries = (body: PositionReportSearch) => api.post<PositionReportSummary[], PositionReportSearch>("Reporte/puestos/buscar", body);
export const getMeritOrder = (positionId: number) => api.get<MeritGroup[]>(`Reporte/puestos/${positionId}/orden-merito`);

function rangeQuery(range?: DateRange) {
  const params = new URLSearchParams();
  if (range?.desde) params.set("desde", range.desde);
  if (range?.hasta) params.set("hasta", range.hasta);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const searchEvaluatedPositions = (body: EvaluatedPositionSearch) =>
  api.post<EvaluatedPosition[], EvaluatedPositionSearch>("Reporte/evaluados/puestos/buscar", {
    nombre: body.nombre?.trim() || null,
    empresa: body.empresa?.trim() || null,
    desde: body.desde || null,
    hasta: body.hasta || null,
  });

export const getEvaluatedCandidates = (positionId: number, range?: DateRange) =>
  api.get<ComparativeCandidate[]>(`Reporte/puestos/${positionId}/evaluados${rangeQuery(range)}`);

export const getComparativeReport = (positionId: number, questionnaireId: number) =>
  api.get<ComparativeReport>(`Reporte/puestos/${positionId}/cuestionarios/${questionnaireId}/comparativo`);

export const exportResults = (positionId: number, range?: DateRange) =>
  downloadFile(`Reporte/puestos/${positionId}/exportar${rangeQuery(range)}`);
