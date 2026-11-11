package com.diseno.miApp.PreguntaOpcionPonderacion;

import com.diseno.miApp.DetalleOpcionRespuesta.DetalleOpcionRespuesta;
import com.diseno.miApp.Pregunta.Pregunta;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;

@Service
public class PreguntaOpcionPonderacionService {

    private final PreguntaOpcionPonderacionRepository repository;

    public PreguntaOpcionPonderacionService(
            PreguntaOpcionPonderacionRepository repository) {
        this.repository = repository;
    }

    public Integer buscarPonderacion(
            Long idPregunta,
            Long idDetalleOpcionRespuesta) {
        return repository
                .findByPregunta_IdAndDetalleOpcionRespuesta_Id(
                        idPregunta,
                        idDetalleOpcionRespuesta
                )
                .map(PreguntaOpcionPonderacion::getPonderacion)
                .orElseThrow(() -> errorNoEncontrado(
                        "No existe una ponderación para la respuesta seleccionada"
                ));
    }

    @Transactional
    public void guardarParaPregunta(
            Pregunta pregunta,
            List<DetalleOpcionRespuesta> detallesValidados,
            List<PonderacionDetalleRequest> ponderaciones) {

        List<PreguntaOpcionPonderacion> asignaciones =
                validarYConstruirAsignaciones(
                        pregunta,
                        detallesValidados,
                        ponderaciones
                );

        repository.saveAll(asignaciones);
    }

    @Transactional
    public void reemplazarParaPregunta(
            Pregunta pregunta,
            List<DetalleOpcionRespuesta> detallesValidados,
            List<PonderacionDetalleRequest> ponderaciones) {

        List<PreguntaOpcionPonderacion> asignaciones =
                validarYConstruirAsignaciones(
                        pregunta,
                        detallesValidados,
                        ponderaciones
                );

        repository.deleteByPregunta_Id(pregunta.getId());
        repository.saveAll(asignaciones);
    }

    private List<PreguntaOpcionPonderacion> validarYConstruirAsignaciones(
            Pregunta pregunta,
            List<DetalleOpcionRespuesta> detallesValidados,
            List<PonderacionDetalleRequest> ponderaciones) {

        if (pregunta == null) {
            throw errorSolicitud(
                    "La pregunta es obligatoria para guardar ponderaciones"
            );
        }

        if (detallesValidados == null || detallesValidados.isEmpty()) {
            throw errorSolicitud(
                    "La opción de respuesta debe tener detalles"
            );
        }

        if (ponderaciones == null || ponderaciones.isEmpty()) {
            throw errorSolicitud("Debe enviar las ponderaciones");
        }

        Map<Long, Integer> ponderacionesPorDetalle = new HashMap<>();
        int suma = 0;

        for (PonderacionDetalleRequest item : ponderaciones) {
            if (item == null
                    || item.getDetalleOpcionRespuestaId() == null
                    || item.getPonderacion() == null
                    || item.getPonderacion() < 0) {
                throw errorSolicitud(
                        "Cada detalle debe tener un ID y una ponderación cero o positiva"
                );
            }

            ponderacionesPorDetalle.put(
                    item.getDetalleOpcionRespuestaId(),
                    item.getPonderacion()
            );
            suma += item.getPonderacion();
        }

        if (ponderacionesPorDetalle.size() != detallesValidados.size()) {
            throw errorSolicitud(
                    "Debe enviar una ponderación por cada detalle de la opción"
            );
        }

        if (suma != 10) {
            throw errorSolicitud("Las ponderaciones deben sumar 10");
        }

        List<PreguntaOpcionPonderacion> asignaciones = new ArrayList<>();

        for (DetalleOpcionRespuesta detalle : detallesValidados) {
            Integer ponderacion =
                    ponderacionesPorDetalle.get(detalle.getId());

            if (ponderacion == null) {
                throw errorSolicitud("Falta la ponderación de un detalle");
            }

            PreguntaOpcionPonderacion asignacion =
                    new PreguntaOpcionPonderacion();
            asignacion.setPregunta(pregunta);
            asignacion.setDetalleOpcionRespuesta(detalle);
            asignacion.setPonderacion(ponderacion);
            asignaciones.add(asignacion);
        }

        return asignaciones;
    }
}
