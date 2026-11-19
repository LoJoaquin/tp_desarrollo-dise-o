package com.diseno.miApp.Pregunta;

public record PreguntaBuscarRequest(
        Long competenciaId,
        Long factorId,
        String nombreCompetencia,
        String nombreFactor,
        String nombrePregunta
) {
}
