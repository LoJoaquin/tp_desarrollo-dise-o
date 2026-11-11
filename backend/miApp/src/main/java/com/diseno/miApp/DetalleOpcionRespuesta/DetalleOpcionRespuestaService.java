package com.diseno.miApp.DetalleOpcionRespuesta;

import com.diseno.miApp.OpcionRespuesta.DetalleOpcionCrearRequest;
import com.diseno.miApp.OpcionRespuesta.DetalleOpcionModificarRequest;
import com.diseno.miApp.OpcionRespuesta.OpcionRespuesta;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;

@Service
public class DetalleOpcionRespuestaService {

    private final DetalleOpcionRespuestaRepository repository;

    public DetalleOpcionRespuestaService(
            DetalleOpcionRespuestaRepository repository) {
        this.repository = repository;
    }

    public List<DetalleOpcionRespuesta> listarPorOpcionRespuesta(
            Long idOpcionRespuesta) {
        return repository.findByOpcionRespuesta_Id(idOpcionRespuesta)
                .stream()
                .sorted(Comparator.comparing(
                        DetalleOpcionRespuesta::getOrdenVisualizacion,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public DetalleOpcionRespuesta buscarPorId(Long id) {
        if (id == null || id <= 0) {
            throw errorSolicitud(
                    "El ID del detalle de respuesta debe ser positivo"
            );
        }

        return repository.findById(id)
                .orElseThrow(() -> errorNoEncontrado(
                        "Detalle de respuesta no encontrado"
                ));
    }

    public List<DetalleOpcionRespuesta> crearDetalles(
            OpcionRespuesta opcionRespuesta,
            List<DetalleOpcionCrearRequest> requests) {

        validarContenidoDetalles(requests);

        List<DetalleOpcionRespuesta> detalles = new ArrayList<>();

        for (DetalleOpcionCrearRequest request : requests) {
            DetalleOpcionRespuesta detalle = new DetalleOpcionRespuesta();
            detalle.setDescrpicion(request.descripcion().trim());
            detalle.setOrdenVisualizacion(request.ordenVisualizacion());
            detalle.setOpcionRespuesta(opcionRespuesta);
            detalles.add(detalle);
        }

        return repository.saveAll(detalles);
    }

    public List<DetalleOpcionRespuesta> modificarDetalles(
            OpcionRespuesta opcionRespuesta,
            List<DetalleOpcionModificarRequest> requests) {

        if (requests == null || requests.isEmpty()) {
            throw errorSolicitud("Debe enviar los detalles de la opción");
        }

        List<DetalleOpcionRespuesta> existentes =
                listarPorOpcionRespuesta(opcionRespuesta.getId());

        if (existentes.isEmpty()) {
            throw errorSolicitud("La opción de respuesta no tiene detalles");
        }

        validarContenidoDetallesModificar(requests);

        Map<Long, DetalleOpcionRespuesta> existentesPorId =
                existentes.stream().collect(Collectors.toMap(
                        DetalleOpcionRespuesta::getId,
                        detalle -> detalle
                ));

        Set<Long> idsRecibidos = requests.stream()
                .map(DetalleOpcionModificarRequest::id)
                .collect(Collectors.toSet());

        if (idsRecibidos.size() != requests.size()
                || !idsRecibidos.equals(existentesPorId.keySet())) {
            throw errorSolicitud(
                    "No se pueden agregar ni quitar detalles al modificar "
                            + "una opción de respuesta"
            );
        }

        for (DetalleOpcionModificarRequest request : requests) {
            DetalleOpcionRespuesta detalle =
                    existentesPorId.get(request.id());

            detalle.setDescrpicion(request.descripcion().trim());
            detalle.setOrdenVisualizacion(request.ordenVisualizacion());
        }

        return repository.saveAll(existentes);
    }

    // PreguntaService usa esta validación al recibir ponderaciones por detalle.
    public List<DetalleOpcionRespuesta> validarDetallesDeOpcion(
            Long idOpcionRespuesta,
            List<Long> idsDetallesRecibidos) {

        if (idOpcionRespuesta == null || idOpcionRespuesta <= 0) {
            throw errorSolicitud(
                    "El ID de la opción de respuesta debe ser positivo"
            );
        }

        if (idsDetallesRecibidos == null || idsDetallesRecibidos.isEmpty()) {
            throw errorSolicitud(
                    "Debe enviar los detalles de la opción de respuesta"
            );
        }

        if (idsDetallesRecibidos.stream().anyMatch(Objects::isNull)) {
            throw errorSolicitud("Los IDs de los detalles son obligatorios");
        }

        Set<Long> idsRecibidos = new HashSet<>(idsDetallesRecibidos);
        if (idsRecibidos.size() != idsDetallesRecibidos.size()) {
            throw errorSolicitud("Hay detalles repetidos");
        }

        List<DetalleOpcionRespuesta> detallesValidos =
                repository.findByOpcionRespuesta_Id(idOpcionRespuesta);

        Set<Long> idsValidos = detallesValidos.stream()
                .map(DetalleOpcionRespuesta::getId)
                .collect(Collectors.toSet());

        if (!idsValidos.equals(idsRecibidos)) {
            throw errorSolicitud(
                    "Los detalles deben corresponder exactamente "
                            + "a la opción seleccionada"
            );
        }

        return detallesValidos;
    }

    private void validarContenidoDetalles(
            List<DetalleOpcionCrearRequest> requests) {

        if (requests == null || requests.isEmpty()) {
            throw errorSolicitud(
                    "Debe cargar al menos un detalle para la opción"
            );
        }

        Set<Integer> ordenes = new HashSet<>();
        Set<String> descripciones = new HashSet<>();

        for (DetalleOpcionCrearRequest request : requests) {
            if (request == null
                    || request.ordenVisualizacion() == null
                    || request.descripcion() == null
                    || request.descripcion().isBlank()) {
                throw errorSolicitud(
                        "Cada detalle requiere orden y descripción"
                );
            }

            if (request.ordenVisualizacion() <= 0
                    || !ordenes.add(request.ordenVisualizacion())) {
                throw errorSolicitud(
                        "El orden debe ser positivo y no repetirse"
                );
            }

            String descripcionNormalizada = request.descripcion()
                    .trim()
                    .toLowerCase(Locale.ROOT);

            if (!descripciones.add(descripcionNormalizada)) {
                throw errorSolicitud(
                        "Las descripciones de los detalles no pueden repetirse"
                );
            }
        }

        validarOrdenConsecutivo(ordenes);
    }

    private void validarContenidoDetallesModificar(
            List<DetalleOpcionModificarRequest> requests) {

        Set<Integer> ordenes = new HashSet<>();
        Set<String> descripciones = new HashSet<>();

        for (DetalleOpcionModificarRequest request : requests) {
            if (request == null
                    || request.id() == null
                    || request.ordenVisualizacion() == null
                    || request.descripcion() == null
                    || request.descripcion().isBlank()) {
                throw errorSolicitud(
                        "Cada detalle requiere ID, orden y descripción"
                );
            }

            if (request.ordenVisualizacion() <= 0
                    || !ordenes.add(request.ordenVisualizacion())) {
                throw errorSolicitud(
                        "El orden debe ser positivo y no repetirse"
                );
            }

            String descripcionNormalizada = request.descripcion()
                    .trim()
                    .toLowerCase(Locale.ROOT);

            if (!descripciones.add(descripcionNormalizada)) {
                throw errorSolicitud(
                        "Las descripciones de los detalles no pueden repetirse"
                );
            }
        }

        validarOrdenConsecutivo(ordenes);
    }

    private void validarOrdenConsecutivo(Set<Integer> ordenes) {
        for (int esperado = 1; esperado <= ordenes.size(); esperado++) {
            if (!ordenes.contains(esperado)) {
                throw errorSolicitud(
                        "El orden de visualización debe ser consecutivo "
                                + "desde 1"
                );
            }
        }
    }

}
