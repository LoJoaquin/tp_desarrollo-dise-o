package com.diseno.miApp.helpers;

import com.diseno.miApp.CaracteristicasPuesto.CaracteristicasPuesto;
import com.diseno.miApp.Factor.Factor;
import com.diseno.miApp.Pregunta.Pregunta;
import com.diseno.miApp.PreguntaOpcionPonderacion.PreguntaOpcionPonderacionService;
import com.diseno.miApp.RespuestaPreguntaCuestionario.RespuestaPreguntaCuestionario;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;

@Component
public class CalculoPuntajeHelper {

    private final PreguntaOpcionPonderacionService ponderacionService;

    public CalculoPuntajeHelper(
            PreguntaOpcionPonderacionService ponderacionService) {
        this.ponderacionService = ponderacionService;
    }

    public ResultadoPuntaje calcularResultado(
            List<RespuestaPreguntaCuestionario> respuestas,
            List<CaracteristicasPuesto> caracteristicas) {
        if (respuestas == null || respuestas.isEmpty()) {
            throw errorSolicitud(
                    "El cuestionario completo no tiene respuestas registradas"
            );
        }
        if (caracteristicas == null || caracteristicas.isEmpty()) {
            throw errorSolicitud(
                    "El puesto no tiene ponderaciones mínimas configuradas"
            );
        }

        Map<Long, Double> puntajesPorCompetencia =
                calcularPuntajesPorCompetencia(respuestas);

        return new ResultadoPuntaje(
                calcularPuntajeFinal(puntajesPorCompetencia, caracteristicas),
                cumplePonderacionMinima(puntajesPorCompetencia, caracteristicas),
                puntajesPorCompetencia
        );
    }

    private Map<Long, Double> calcularPuntajesPorCompetencia(
            List<RespuestaPreguntaCuestionario> respuestas) {
        Map<Long, Map<Long, Integer>> sumasPorCompetenciaYFactor =
                new HashMap<>();

        for (RespuestaPreguntaCuestionario respuesta : respuestas) {
            Pregunta pregunta = respuesta.getPregunta();
            Factor factor = pregunta.getFactor();
            Long idCompetencia = factor.getCompetencia().getId();
            Long idFactor = factor.getId();

            Integer ponderacion = ponderacionService.buscarPonderacion(
                    pregunta.getId(),
                    respuesta.getDetalleOpcionRespuesta().getId()
            );

            sumasPorCompetenciaYFactor
                    .computeIfAbsent(idCompetencia, id -> new HashMap<>())
                    .merge(idFactor, ponderacion, Integer::sum);
        }

        Map<Long, Double> puntajesPorCompetencia = new HashMap<>();
        sumasPorCompetenciaYFactor.forEach((idCompetencia, sumasPorFactor) -> {
            double puntajeCompetencia = sumasPorFactor.values()
                    .stream()
                    .mapToDouble(sumaFactor -> sumaFactor / 2.0)
                    .average()
                    .orElse(0.0);

            puntajesPorCompetencia.put(idCompetencia, puntajeCompetencia);
        });

        return puntajesPorCompetencia;
    }

    private boolean cumplePonderacionMinima(
            Map<Long, Double> puntajesPorCompetencia,
            List<CaracteristicasPuesto> caracteristicas) {
        return caracteristicas.stream().allMatch(caracteristica -> {
            Long idCompetencia = caracteristica.getCompetencia().getId();
            Double puntajeObtenido = puntajesPorCompetencia.get(idCompetencia);

            return puntajeObtenido != null
                    && caracteristica.getPonderacion() != null
                    && puntajeObtenido >= caracteristica.getPonderacion();
        });
    }

    private Float calcularPuntajeFinal(
            Map<Long, Double> puntajesPorCompetencia,
            List<CaracteristicasPuesto> caracteristicas) {
        return (float) caracteristicas.stream()
                .mapToDouble(caracteristica -> puntajesPorCompetencia.getOrDefault(
                        caracteristica.getCompetencia().getId(),
                        0.0
                ))
                .average()
                .orElse(0.0);
    }

    public record ResultadoPuntaje(
            Float puntajeFinal,
            boolean cumpleMinimo,
            Map<Long, Double> puntajesPorCompetencia) {
    }
}
