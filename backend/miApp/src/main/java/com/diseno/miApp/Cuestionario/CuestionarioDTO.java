package com.diseno.miApp.Cuestionario;

import com.diseno.miApp.EstadoCuestionario.EstadoCuestionario;

import java.util.List;
import java.util.Map;

public record CuestionarioDTO(
        Long idCuestionario,
        EstadoCuestionario estado,
        Integer bloque,
        List<PreguntaDTO> preguntas,
        List<RespuestaDTO> respuestasGuardadas,
        Float puntajeFinal,
        Boolean cumplePonderacionMinima,
        Map<Long, Double> puntajesPorCompetencia) {

    public record PreguntaDTO(
            Long idPregunta,
            String texto,
            String descripcion,
            Integer orden,
            List<DetalleRespuestaDTO> opciones) {
    }

    public record DetalleRespuestaDTO(
            Long id,
            String descripcion,
            Integer ordenVisualizacion) {
    }

    public record RespuestaDTO(
            Long idPregunta,
            Long idDetalleOpcionRespuesta) {
    }
}
