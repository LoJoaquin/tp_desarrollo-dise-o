package com.diseno.miApp.Candidato;

/**
 * Estadística que muestra el CU006 al terminar la importación.
 */
public record ImportacionCandidatosResponse(
        int candidatosCreados,
        int candidatosActualizados,
        int candidatosEliminados,
        int filasProcesadas) {
}
