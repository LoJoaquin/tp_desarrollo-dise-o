package com.diseno.miApp.Pregunta;

import com.diseno.miApp.Competencia.Competencia;
import com.diseno.miApp.Competencia.CompetenciaService;
import com.diseno.miApp.DetalleOpcionRespuesta.DetalleOpcionRespuesta;
import com.diseno.miApp.DetalleOpcionRespuesta.DetalleOpcionRespuestaService;
import com.diseno.miApp.Factor.Factor;
import com.diseno.miApp.Factor.FactorService;
import com.diseno.miApp.OpcionRespuesta.OpcionRespuesta;
import com.diseno.miApp.OpcionRespuesta.OpcionRespuestaService;
import com.diseno.miApp.PreguntaOpcionPonderacion.PonderacionDetalleRequest;
import com.diseno.miApp.PreguntaOpcionPonderacion.PreguntaOpcionPonderacionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

import static com.diseno.miApp.helpers.ManejoErroresHelper.ejecutarAccionConMensajeDeError;
import static com.diseno.miApp.helpers.ManejoErroresHelper.ejecutarConMensajeDeError;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ValidacionesHelper.normalizarMayusculasObligatorio;
import static com.diseno.miApp.helpers.ValidacionesHelper.normalizarMayusculasOpcional;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class GestionPreguntaService {

    private final PreguntaService preguntaService;
    private final CompetenciaService competenciaService;
    private final FactorService factorService;
    private final OpcionRespuestaService opcionRespuestaService;
    private final DetalleOpcionRespuestaService detalleOpcionRespuestaService;
    private final PreguntaOpcionPonderacionService ponderacionService;

    public GestionPreguntaService(
            PreguntaService preguntaService,
            CompetenciaService competenciaService,
            FactorService factorService,
            OpcionRespuestaService opcionRespuestaService,
            DetalleOpcionRespuestaService detalleOpcionRespuestaService,
            PreguntaOpcionPonderacionService ponderacionService) {
        this.preguntaService = preguntaService;
        this.competenciaService = competenciaService;
        this.factorService = factorService;
        this.opcionRespuestaService = opcionRespuestaService;
        this.detalleOpcionRespuestaService = detalleOpcionRespuestaService;
        this.ponderacionService = ponderacionService;
    }

    @Transactional
    public Pregunta crearPregunta(PreguntaCrearRequest request) {
        if (request == null) {
            throw errorSolicitud("Debe enviar los datos de la pregunta");
        }

        Competencia competencia = ejecutarConMensajeDeError(
                "No se pudo validar la competencia para crear la pregunta",
                () -> competenciaService.buscarPorId(
                        request.getCompetenciaId())
        );

        Factor factor = ejecutarConMensajeDeError(
                "No se pudo validar el factor para crear la pregunta",
                () -> factorService.buscarPorId(request.getIdFactor())
        );

        if (factor.getCompetencia() == null
                || !factor.getCompetencia().getId().equals(competencia.getId())) {
            throw errorSolicitud(
                    "El factor no pertenece a la competencia seleccionada"
            );
        }

        Long idOpcionRespuesta = request.getIdOpcionRespuesta();
        validarIdPositivo(
                idOpcionRespuesta,
                "El ID de opción de respuesta debe ser un número positivo"
        );

        OpcionRespuesta opcionRespuesta = ejecutarConMensajeDeError(
                "No se pudo validar la opción de respuesta para crear la pregunta",
                () -> opcionRespuestaService.buscarPorId(idOpcionRespuesta)
        );

        String nombre = normalizarMayusculasObligatorio(
                request.getNombre(),
                "El nombre de la pregunta es obligatorio",
                PreguntaValidacionConstantes.MAX_NOMBRE_PREGUNTA
        );
        String textoPregunta = normalizarMayusculasObligatorio(
                request.getTextoPregunta(),
                "El texto de la pregunta es obligatorio",
                PreguntaValidacionConstantes.MAX_TEXTO_PREGUNTA
        );
        String descripcion = normalizarMayusculasOpcional(
                request.getDescripcion(),
                PreguntaValidacionConstantes.MAX_DESCRIPCION
        );

        List<Long> idsDetalles = extraerIdsDetalles(request.getPonderaciones());
        List<DetalleOpcionRespuesta> detallesValidados =
                ejecutarConMensajeDeError(
                        "No se pudieron validar los detalles de ponderación de la opción",
                        () -> detalleOpcionRespuestaService.validarDetallesDeOpcion(
                        opcionRespuesta.getId(),
                        idsDetalles
                        )
                );

        Pregunta pregunta = new Pregunta();
        pregunta.setFactor(factor);
        pregunta.setName(nombre);
        pregunta.setTextoPregunta(textoPregunta);
        pregunta.setDescripcion(descripcion);
        pregunta.setOpcionRespuesta(opcionRespuesta);
        pregunta.setEstaActivo(true);

        Pregunta preguntaGuardada = preguntaService.guardar(pregunta);

        ejecutarAccionConMensajeDeError(
                "No se pudieron guardar las ponderaciones de la pregunta",
                () -> ponderacionService.guardarParaPregunta(
                        preguntaGuardada,
                        detallesValidados,
                        request.getPonderaciones()
                )
        );

        return preguntaGuardada;
    }

    @Transactional
    public Pregunta modificarPregunta(
            Long id,
            PreguntaModificarRequest request) {

        validarIdPositivo(
                id,
                "El ID de pregunta debe ser un número positivo"
        );

        if (request == null) {
            throw errorSolicitud(
                    "Debe enviar los datos para modificar la pregunta"
            );
        }

        String nombre = normalizarMayusculasOpcional(
                request.getNombre(),
                PreguntaValidacionConstantes.MAX_NOMBRE_PREGUNTA
        );
        String textoPregunta = normalizarMayusculasOpcional(
                request.getTextoPregunta(),
                PreguntaValidacionConstantes.MAX_TEXTO_PREGUNTA
        );
        String descripcion = normalizarMayusculasOpcional(
                request.getDescripcion(),
                PreguntaValidacionConstantes.MAX_DESCRIPCION
        );
        Long idOpcionRespuesta = request.getIdOpcionRespuesta();
        List<PonderacionDetalleRequest> ponderaciones =
                request.getPonderaciones();

        if (idOpcionRespuesta != null) {
            validarIdPositivo(
                    idOpcionRespuesta,
                    "El ID de opción de respuesta debe ser un número positivo"
            );
        }

        if (nombre == null
                && textoPregunta == null
                && descripcion == null
                && idOpcionRespuesta == null
                && ponderaciones == null) {
            throw errorSolicitud(
                    "Debe enviar al menos un campo con valor para modificar"
            );
        }

        if (ponderaciones != null && ponderaciones.isEmpty()) {
            throw errorSolicitud(
                    "Si envía ponderaciones, debe incluir todos los detalles"
            );
        }

        Pregunta pregunta = ejecutarConMensajeDeError(
                "No se pudo encontrar la pregunta que se quiere modificar",
                () -> preguntaService.buscarPorId(id)
        );

        OpcionRespuesta opcionActual = pregunta.getOpcionRespuesta();
        OpcionRespuesta opcionFinal = opcionActual;

        if (idOpcionRespuesta != null) {
            opcionFinal = ejecutarConMensajeDeError(
                    "No se pudo validar la opción de respuesta para modificar la pregunta",
                    () -> opcionRespuestaService.buscarPorId(idOpcionRespuesta)
            );
        }

        Long idOpcionActual = opcionActual == null
                ? null
                : opcionActual.getId();
        Long idOpcionFinal = opcionFinal == null
                ? null
                : opcionFinal.getId();

        boolean cambiaOpcionRespuesta =
                !Objects.equals(idOpcionActual, idOpcionFinal);

        if (cambiaOpcionRespuesta && ponderaciones == null) {
            throw errorSolicitud(
                    "Al cambiar la opción de respuesta, debe enviar sus ponderaciones"
            );
        }

        if (nombre != null) {
            pregunta.setName(nombre);
        }

        if (textoPregunta != null) {
            pregunta.setTextoPregunta(textoPregunta);
        }

        if (descripcion != null) {
            pregunta.setDescripcion(descripcion);
        }

        if (ponderaciones != null) {
            if (opcionFinal == null) {
                throw errorSolicitud(
                        "La pregunta debe tener una opción de respuesta para asignar ponderaciones"
                );
            }

            List<Long> idsDetalles = extraerIdsDetalles(ponderaciones);
            Long idOpcionFinalParaValidacion = opcionFinal.getId();
            List<DetalleOpcionRespuesta> detallesValidados =
                    ejecutarConMensajeDeError(
                            "No se pudieron validar los detalles de ponderación de la opción",
                            () -> detalleOpcionRespuestaService
                                    .validarDetallesDeOpcion(
                                            idOpcionFinalParaValidacion,
                                            idsDetalles
                                    )
                    );

            ejecutarAccionConMensajeDeError(
                    "No se pudieron reemplazar las ponderaciones de la pregunta",
                    () -> ponderacionService.reemplazarParaPregunta(
                            pregunta,
                            detallesValidados,
                            ponderaciones
                    )
            );
        }

        if (idOpcionRespuesta != null) {
            pregunta.setOpcionRespuesta(opcionFinal);
        }

        return preguntaService.guardar(pregunta);
    }

    private List<Long> extraerIdsDetalles(
            List<PonderacionDetalleRequest> ponderaciones) {

        if (ponderaciones == null || ponderaciones.isEmpty()) {
            throw errorSolicitud("Debe enviar las ponderaciones de los detalles");
        }

        return ponderaciones.stream()
                .map(item -> {
                    if (item == null) {
                        throw errorSolicitud(
                                "Cada ponderación debe incluir un detalle"
                        );
                    }
                    return item.getDetalleOpcionRespuestaId();
                })
                .toList();
    }

}

