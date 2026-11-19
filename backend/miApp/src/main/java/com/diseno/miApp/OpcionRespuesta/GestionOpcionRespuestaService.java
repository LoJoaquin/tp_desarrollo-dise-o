package com.diseno.miApp.OpcionRespuesta;

import com.diseno.miApp.DetalleOpcionRespuesta.DetalleOpcionRespuesta;
import com.diseno.miApp.DetalleOpcionRespuesta.DetalleOpcionRespuestaService;
import com.diseno.miApp.Pregunta.PreguntaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

import static com.diseno.miApp.helpers.ManejoErroresHelper.ejecutarConMensajeDeError;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorConflicto;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ValidacionesHelper.normalizarMayusculasObligatorio;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class GestionOpcionRespuestaService {

    private final OpcionRespuestaService opcionService;
    private final PreguntaService preguntaService;
    private final DetalleOpcionRespuestaService detalleService;

    public GestionOpcionRespuestaService(
            OpcionRespuestaService opcionService,
            PreguntaService preguntaService,
            DetalleOpcionRespuestaService detalleService) {
        this.opcionService = opcionService;
        this.preguntaService = preguntaService;
        this.detalleService = detalleService;
    }

    public List<OpcionRespuesta> listarTodas() {
        return opcionService.listarTodas();
    }

    public List<OpcionRespuestaResponse> listarActivasComoResponse() {
        return opcionService.listarTodas().stream()
                .filter(opcion -> !Boolean.FALSE.equals(
                        opcion.getEstaActivo()
                ))
                .map(this::aResponse)
                .toList();
    }

    public List<OpcionRespuestaResponse> buscarActivasPorNombreConteniendo(
            String nombre) {
        return opcionService.buscarActivasPorNombreConteniendo(nombre)
                .stream()
                .map(this::aResponse)
                .toList();
    }

    public OpcionRespuestaResponse buscarRespuestaPorId(Long id) {
        return aResponse(buscarOpcion(
                id,
                "No se pudo buscar la opción de respuesta"
        ));
    }

    public OpcionRespuesta buscarPorId(Long id) {
        return buscarOpcion(
                id,
                "No se pudo buscar la opción de respuesta"
        );
    }

    @Transactional
    public OpcionRespuestaResponse crear(OpcionRespuestaCrearRequest request) {
        if (request == null) {
            throw errorSolicitud(
                    "Debe enviar los datos de la opción de respuesta"
            );
        }

        String nombre = normalizarMayusculasObligatorio(
                request.nombre(),
                "El nombre es obligatorio"
        );
        String descripcion = normalizarMayusculasObligatorio(
                request.descripcion(),
                "La descripción es obligatoria"
        );

        OpcionRespuesta opcion = new OpcionRespuesta();
        opcion.setNombre(nombre);
        opcion.setDescripcion(descripcion);
        opcion.setEstaActivo(true);

        OpcionRespuesta guardada = opcionService.guardar(opcion);

        List<DetalleOpcionRespuesta> detalles =
                ejecutarConMensajeDeError(
                        "No se pudieron crear los detalles de la opción de respuesta",
                        () -> detalleService.crearDetalles(
                                guardada,
                                request.detalles()
                        )
                );

        return aResponse(guardada, detalles);
    }

    @Transactional
    public OpcionRespuestaResponse modificar(
            Long id,
            OpcionRespuestaModificarRequest request) {

        validarIdPositivo(
                id,
                "El ID de la opción de respuesta debe ser positivo"
        );

        if (request == null) {
            throw errorSolicitud("Debe enviar los datos para modificar");
        }

        if (request.descripcion() == null && request.detalles() == null) {
            throw errorSolicitud(
                    "Debe enviar al menos un campo para modificar"
            );
        }

        OpcionRespuesta opcion = buscarOpcion(
                id,
                "No se pudo modificar la opción de respuesta"
        );

        if (request.descripcion() != null) {
            opcion.setDescripcion(normalizarMayusculasObligatorio(
                    request.descripcion(),
                    "La descripción no puede estar vacía"
            ));
            opcionService.guardar(opcion);
        }

        List<DetalleOpcionRespuesta> detalles =
                ejecutarConMensajeDeError(
                        "No se pudieron obtener los detalles de la opción de respuesta",
                        () -> detalleService.listarPorOpcionRespuesta(id)
                );

        if (request.detalles() != null) {
            detalles = ejecutarConMensajeDeError(
                    "No se pudieron modificar los detalles de la opción de respuesta",
                    () -> detalleService.modificarDetalles(
                            opcion,
                            request.detalles()
                    )
            );
        }

        return aResponse(opcion, detalles);
    }

    @Transactional
    public void eliminar(Long id) {
        OpcionRespuesta opcion = buscarOpcion(
                id,
                "No se pudo eliminar la opción de respuesta"
        );

        if (preguntaService.existeAsociadaAOpcionRespuesta(id)) {
            throw errorConflicto(
                    "La opción de respuesta está siendo usada por preguntas "
                            + "y no puede eliminarse"
            );
        }

        opcion.setEstaActivo(false);
        opcionService.guardar(opcion);
    }

    private OpcionRespuesta buscarOpcion(Long id, String mensaje) {
        validarIdPositivo(
                id,
                "El ID de la opción de respuesta debe ser positivo"
        );

        return ejecutarConMensajeDeError(mensaje, () -> {
            OpcionRespuesta opcion = opcionService.buscarPorId(id);

            if (Boolean.FALSE.equals(opcion.getEstaActivo())) {
                throw errorNoEncontrado(
                        "Opción de respuesta no encontrada"
                );
            }

            return opcion;
        });
    }

    private OpcionRespuestaResponse aResponse(OpcionRespuesta opcion) {
        List<DetalleOpcionRespuesta> detalles =
                ejecutarConMensajeDeError(
                        "No se pudieron obtener los detalles de la opción de respuesta",
                        () -> detalleService.listarPorOpcionRespuesta(
                                opcion.getId()
                        )
                );

        return aResponse(opcion, detalles);
    }

    private OpcionRespuestaResponse aResponse(
            OpcionRespuesta opcion,
            List<DetalleOpcionRespuesta> detalles) {

        List<DetalleOpcionRespuestaResponse> detalleResponses =
                detalles.stream()
                        .sorted(Comparator.comparing(
                                DetalleOpcionRespuesta
                                        ::getOrdenVisualizacion,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        ))
                        .map(detalle ->
                                new DetalleOpcionRespuestaResponse(
                                        detalle.getId(),
                                        detalle.getOrdenVisualizacion(),
                                        detalle.getDescrpicion()
                                )
                        )
                        .toList();

        return new OpcionRespuestaResponse(
                opcion.getId(),
                opcion.getNombre(),
                opcion.getDescripcion(),
                !Boolean.FALSE.equals(opcion.getEstaActivo()),
                detalleResponses
        );
    }

}
