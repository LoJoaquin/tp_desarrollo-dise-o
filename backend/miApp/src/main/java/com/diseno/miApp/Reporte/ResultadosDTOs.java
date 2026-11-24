package com.diseno.miApp.Reporte;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs de entrada y salida de CU007 (Exportar resultados) y CU027 (Reporte
 * comparativo).
 */
public final class ResultadosDTOs {

    private ResultadosDTOs() {
    }

    /** Filtros de búsqueda de funciones o puestos con candidatos evaluados. */
    public record BuscarPuestosEvaluadosRequest(
            String nombre,
            String empresa,
            LocalDate desde,
            LocalDate hasta) {
    }

    public record PuestoEvaluadoResponse(
            Long idPuesto,
            String codigoPuesto,
            String nombrePuesto,
            String empresa,
            long candidatosEvaluados) {
    }

    /** Fila de candidato evaluado (cuestionario en estado COMPLETO). */
    public record CandidatoEvaluadoResponse(
            Long idCuestionario,
            Long idCandidato,
            String nombre,
            String apellido,
            String tipoDocumento,
            String numeroDocumento,
            String numeroCandidato,
            LocalDateTime fechaFinalizacion) {
    }

    public record CompetenciaComparadaResponse(
            Long idCompetencia,
            String nombreCompetencia,
            double valorRequerido,
            double valorObtenido) {
    }

    public record ReporteComparativoResponse(
            Long idPuesto,
            String codigoPuesto,
            String nombrePuesto,
            String empresa,
            CandidatoEvaluadoResponse candidato,
            List<CompetenciaComparadaResponse> competencias) {
    }

    /** Archivo CSV generado por el CU007. */
    public record ArchivoCsv(String nombreArchivo, byte[] contenido) {
    }
}
