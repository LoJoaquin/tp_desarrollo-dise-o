package com.diseno.miApp.Cuestionario;

import com.diseno.miApp.CaracteristicasPuesto.CaracteristicasPuesto;
import com.diseno.miApp.CaracteristicasPuesto.CaracteristicasPuestoRepository;
import com.diseno.miApp.CuestionarioPregunta.CuestionarioPregunta;
import com.diseno.miApp.CuestionarioPregunta.CuestionarioPreguntaRepository;
import com.diseno.miApp.DetalleOpcionRespuesta.DetalleOpcionRespuesta;
import com.diseno.miApp.DetalleOpcionRespuesta.DetalleOpcionRespuestaService;
import com.diseno.miApp.EstadoCuestionario.EstadoCuestionario;
import com.diseno.miApp.Pregunta.Pregunta;
import com.diseno.miApp.Pregunta.PreguntaService;
import com.diseno.miApp.RespuestaPreguntaCuestionario.RespuestaPreguntaCuestionario;
import com.diseno.miApp.RespuestaPreguntaCuestionario.RespuestaPreguntaCuestionarioService;
import com.diseno.miApp.helpers.CalculoPuntajeHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorConflicto;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class CompletarCuestionarioService {

    private final CuestionarioRepository cuestionarioRepository;
    private final CuestionarioPreguntaRepository cuestionarioPreguntaRepository;
    private final RespuestaPreguntaCuestionarioService respuestaService;
    private final PreguntaService preguntaService;
    private final DetalleOpcionRespuestaService detalleService;
    private final CaracteristicasPuestoRepository caracteristicasRepository;
    private final CalculoPuntajeHelper calculoPuntajeHelper;
    private final Duration plazoCompletar;

    public CompletarCuestionarioService(
            CuestionarioRepository cuestionarioRepository,
            CuestionarioPreguntaRepository cuestionarioPreguntaRepository,
            RespuestaPreguntaCuestionarioService respuestaService,
            PreguntaService preguntaService,
            DetalleOpcionRespuestaService detalleService,
            CaracteristicasPuestoRepository caracteristicasRepository,
            CalculoPuntajeHelper calculoPuntajeHelper,
            @Value("${cuestionario.plazo-completar}") Duration plazoCompletar) {
        this.cuestionarioRepository = cuestionarioRepository;
        this.cuestionarioPreguntaRepository = cuestionarioPreguntaRepository;
        this.respuestaService = respuestaService;
        this.preguntaService = preguntaService;
        this.detalleService = detalleService;
        this.caracteristicasRepository = caracteristicasRepository;
        this.calculoPuntajeHelper = calculoPuntajeHelper;
        this.plazoCompletar = plazoCompletar;
    }

    @Transactional
    public CuestionarioDTO accederCuestionario(Long idCandidato) {
        Cuestionario cuestionario =
                buscarCuestionarioActivoOEnProceso(idCandidato);

        return switch (cuestionario.getEstadoCuestionario()) {
            case ACTIVO -> iniciarCuestionario(cuestionario);
            case EN_PROCESO -> obtenerBloquePendiente(cuestionario);
            default -> throw errorConflicto(
                    "El cuestionario no está disponible"
            );
        };
    }

    @Transactional
    public CuestionarioDTO guardarRespuestasParciales(
            Long idCuestionario,
            GuardarRespuestasRequest request) {
        Cuestionario cuestionario = buscarCuestionarioEnProceso(idCuestionario);
        List<CuestionarioPregunta> bloque =
                obtenerAsignacionesDelBloquePendiente(cuestionario);

        if (request == null || request.respuestas() == null
                || request.respuestas().isEmpty()) {
            throw errorSolicitud(
                    "Debe enviar al menos una respuesta parcial"
            );
        }

        List<RespuestaPreguntaCuestionario> respuestas =
                validarYConstruirRespuestas(cuestionario, bloque, request);

        respuestaService.guardarOActualizar(cuestionario, respuestas);

        return construirDTO(
                cuestionario,
                bloque,
                respuestasDelBloque(cuestionario.getId(), bloque),
                null
        );
    }

    @Transactional
    public CuestionarioDTO finalizarBloque(
            Long idCuestionario,
            GuardarRespuestasRequest request) {
        Cuestionario cuestionario = buscarCuestionarioEnProceso(idCuestionario);
        List<CuestionarioPregunta> bloque =
                obtenerAsignacionesDelBloquePendiente(cuestionario);
        List<RespuestaPreguntaCuestionario> respuestasNuevas =
                validarYConstruirRespuestas(cuestionario, bloque, request);

        Set<Long> idsRespondidos = respuestasDelBloque(
                idCuestionario,
                bloque
        ).stream()
                .map(respuesta -> respuesta.getPregunta().getId())
                .collect(Collectors.toSet());
        respuestasNuevas.stream()
                .map(respuesta -> respuesta.getPregunta().getId())
                .forEach(idsRespondidos::add);

        List<String> faltantes = bloque.stream()
                .filter(asignacion -> !idsRespondidos.contains(
                        asignacion.getPregunta().getId()
                ))
                .map(asignacion -> "pregunta "
                        + asignacion.getPregunta().getId())
                .toList();

        if (!faltantes.isEmpty()) {
            throw errorSolicitud(
                    "No se puede finalizar el bloque. Faltan respuestas para: "
                            + String.join(", ", faltantes)
            );
        }

        if (!respuestasNuevas.isEmpty()) {
            respuestaService.guardarOActualizar(
                    cuestionario,
                    respuestasNuevas
            );
        }

        if (esUltimoBloque(bloque, cuestionario)) {
            return calcularResultadoYCompletar(cuestionario, bloque);
        }

        return construirBloquePendiente(cuestionario);
    }

    private Cuestionario buscarCuestionarioActivoOEnProceso(Long idCandidato) {
        validarIdPositivo(
                idCandidato,
                "El ID del candidato debe ser positivo"
        );

        Cuestionario cuestionario = cuestionarioRepository
                .findFirstByCandidato_IdAndEstadoCuestionarioIn(
                        idCandidato,
                        List.of(
                                EstadoCuestionario.ACTIVO,
                                EstadoCuestionario.EN_PROCESO
                        )
                )
                .orElseThrow(() -> errorNoEncontrado(
                        "El candidato no tiene un cuestionario disponible"
                ));

        validarAccesosYPlazos(cuestionario);
        return cuestionario;
    }

    private Cuestionario buscarCuestionarioEnProceso(Long idCuestionario) {
        validarIdPositivo(
                idCuestionario,
                "El ID del cuestionario debe ser positivo"
        );

        Cuestionario cuestionario = cuestionarioRepository
                .findById(idCuestionario)
                .orElseThrow(() -> errorNoEncontrado(
                        "El cuestionario no existe"
                ));

        if (cuestionario.getEstadoCuestionario()
                != EstadoCuestionario.EN_PROCESO) {
            throw errorConflicto(
                    "El cuestionario no está en proceso"
            );
        }

        validarAccesosYPlazos(cuestionario);
        return cuestionario;
    }

    private CuestionarioDTO iniciarCuestionario(Cuestionario cuestionario) {
        List<Pregunta> preguntasSeleccionadas =
                seleccionarPreguntasAleatorias(cuestionario);
        List<CuestionarioPregunta> asignaciones =
                asignarPreguntasACuestionario(
                        cuestionario,
                        preguntasSeleccionadas
                );
        asignaciones = cuestionarioPreguntaRepository.saveAll(asignaciones);

        LocalDateTime ahora = LocalDateTime.now();
        cuestionario.setEstadoCuestionario(EstadoCuestionario.EN_PROCESO);
        cuestionario.setFechaInicio(ahora);
        cuestionario.setFechaLimiteFinalizacion(ahora.plus(plazoCompletar));
        cuestionario.setFechaCambioEstado(ahora);
        registrarAcceso(cuestionario, ahora);
        cuestionarioRepository.save(cuestionario);

        List<CuestionarioPregunta> primerBloque = asignaciones.stream()
                .filter(asignacion -> asignacion.getBloque().equals(1))
                .toList();

        return construirDTO(cuestionario, primerBloque, List.of(), null);
    }

    private CuestionarioDTO obtenerBloquePendiente(
            Cuestionario cuestionario) {
        LocalDateTime ahora = LocalDateTime.now();
        registrarAcceso(cuestionario, ahora);
        cuestionarioRepository.save(cuestionario);

        return construirBloquePendiente(cuestionario);
    }

    private CuestionarioDTO construirBloquePendiente(
            Cuestionario cuestionario) {
        List<CuestionarioPregunta> asignaciones =
                cuestionarioPreguntaRepository
                        .findByCuestionarioIdOrderByBloqueAscOrdenAsc(
                                cuestionario.getId()
                        );
        List<RespuestaPreguntaCuestionario> respuestas =
                respuestaService.obtenerPorCuestionario(cuestionario.getId());

        Set<Long> idsRespondidos = respuestas.stream()
                .map(respuesta -> respuesta.getPregunta().getId())
                .collect(Collectors.toSet());

        Integer bloquePendiente = asignaciones.stream()
                .collect(Collectors.groupingBy(
                        CuestionarioPregunta::getBloque,
                        java.util.TreeMap::new,
                        Collectors.toList()
                ))
                .entrySet()
                .stream()
                .filter(entrada -> entrada.getValue().stream()
                        .anyMatch(asignacion -> !idsRespondidos.contains(
                                asignacion.getPregunta().getId()
                        )))
                .map(java.util.Map.Entry::getKey)
                .findFirst()
                .orElseThrow(() -> errorConflicto(
                        "No hay bloques pendientes para este cuestionario"
                ));

        List<CuestionarioPregunta> bloque = asignaciones.stream()
                .filter(asignacion -> asignacion.getBloque()
                        .equals(bloquePendiente))
                .toList();

        return construirDTO(
                cuestionario,
                bloque,
                respuestasDelBloque(cuestionario.getId(), bloque),
                null
        );
    }

    private List<CuestionarioPregunta> obtenerAsignacionesDelBloquePendiente(
            Cuestionario cuestionario) {
        List<CuestionarioPregunta> asignaciones =
                cuestionarioPreguntaRepository
                        .findByCuestionarioIdOrderByBloqueAscOrdenAsc(
                                cuestionario.getId()
                        );
        Set<Long> idsRespondidos = respuestaService
                .obtenerPorCuestionario(cuestionario.getId())
                .stream()
                .map(respuesta -> respuesta.getPregunta().getId())
                .collect(Collectors.toSet());

        Integer numeroBloque = asignaciones.stream()
                .collect(Collectors.groupingBy(
                        CuestionarioPregunta::getBloque,
                        java.util.TreeMap::new,
                        Collectors.toList()
                ))
                .entrySet()
                .stream()
                .filter(entrada -> entrada.getValue().stream()
                        .anyMatch(asignacion -> !idsRespondidos.contains(
                                asignacion.getPregunta().getId()
                        )))
                .map(java.util.Map.Entry::getKey)
                .findFirst()
                .orElseThrow(() -> errorConflicto(
                        "No hay bloques pendientes para este cuestionario"
                ));

        return asignaciones
                .stream()
                .filter(asignacion -> asignacion.getBloque().equals(numeroBloque))
                .toList();
    }

    private List<RespuestaPreguntaCuestionario> validarYConstruirRespuestas(
            Cuestionario cuestionario,
            List<CuestionarioPregunta> bloque,
            GuardarRespuestasRequest request) {
        if (request == null || request.respuestas() == null) {
            return List.of();
        }

        Set<Long> idsPermitidos = bloque.stream()
                .map(asignacion -> asignacion.getPregunta().getId())
                .collect(Collectors.toSet());
        Set<Long> idsRecibidos = new HashSet<>();
        List<RespuestaPreguntaCuestionario> respuestas = new ArrayList<>();

        for (RespuestaMarcadaRequest item : request.respuestas()) {
            if (item == null || item.idPregunta() == null
                    || item.idDetalleOpcionRespuesta() == null) {
                throw errorSolicitud(
                        "Cada respuesta requiere el ID de pregunta y el ID de opción"
                );
            }

            if (!idsPermitidos.contains(item.idPregunta())) {
                throw errorSolicitud(
                        "La pregunta " + item.idPregunta()
                                + " no pertenece al bloque pendiente"
                );
            }

            if (!idsRecibidos.add(item.idPregunta())) {
                throw errorSolicitud(
                        "La pregunta " + item.idPregunta()
                                + " está repetida en la solicitud"
                );
            }

            Pregunta pregunta = preguntaService.buscarPorId(item.idPregunta());
            DetalleOpcionRespuesta detalle = detalleService.buscarPorId(
                    item.idDetalleOpcionRespuesta()
            );

            if (pregunta.getOpcionRespuesta() == null
                    || detalle.getOpcionRespuesta() == null
                    || !pregunta.getOpcionRespuesta().getId().equals(
                            detalle.getOpcionRespuesta().getId()
                    )) {
                throw errorSolicitud(
                        "La opción elegida no corresponde a la pregunta "
                                + pregunta.getId()
                );
            }

            RespuestaPreguntaCuestionario respuesta =
                    new RespuestaPreguntaCuestionario();
            respuesta.setCuestionario(cuestionario);
            respuesta.setPregunta(pregunta);
            respuesta.setDetalleOpcionRespuesta(detalle);
            respuesta.setFechaRespuesta(LocalDate.now());
            respuestas.add(respuesta);
        }

        return respuestas;
    }

    private List<RespuestaPreguntaCuestionario> respuestasDelBloque(
            Long idCuestionario,
            List<CuestionarioPregunta> bloque) {
        Set<Long> idsPreguntas = bloque.stream()
                .map(asignacion -> asignacion.getPregunta().getId())
                .collect(Collectors.toSet());

        return respuestaService.obtenerPorCuestionario(idCuestionario)
                .stream()
                .filter(respuesta -> idsPreguntas.contains(
                        respuesta.getPregunta().getId()
                ))
                .toList();
    }

    private boolean esUltimoBloque(
            List<CuestionarioPregunta> bloque,
            Cuestionario cuestionario) {
        Integer numeroActual = bloque.getFirst().getBloque();

        return cuestionarioPreguntaRepository
                .findByCuestionarioIdOrderByBloqueAscOrdenAsc(
                        cuestionario.getId()
                )
                .stream()
                .map(CuestionarioPregunta::getBloque)
                .max(Comparator.naturalOrder())
                .orElseThrow(() -> errorConflicto(
                        "El cuestionario no tiene preguntas asignadas"
                ))
                .equals(numeroActual);
    }

    private CuestionarioDTO calcularResultadoYCompletar(
            Cuestionario cuestionario,
            List<CuestionarioPregunta> ultimoBloque) {
        List<CaracteristicasPuesto> caracteristicas =
                caracteristicasRepository.findByPuesto_Id(
                        cuestionario.getPuesto().getId()
                );
        List<RespuestaPreguntaCuestionario> respuestas =
                respuestaService.obtenerPorCuestionario(cuestionario.getId());

        CalculoPuntajeHelper.ResultadoPuntaje resultado =
                calculoPuntajeHelper.calcularResultado(
                        respuestas,
                        caracteristicas
                );

        cuestionario.setEstadoCuestionario(EstadoCuestionario.COMPLETO);
        cuestionario.setFechaRealizacion(LocalDateTime.now());
        cuestionarioRepository.save(cuestionario);

        return construirDTO(
                cuestionario,
                ultimoBloque,
                respuestasDelBloque(cuestionario.getId(), ultimoBloque),
                resultado
        );
    }

    private CuestionarioDTO construirDTO(
            Cuestionario cuestionario,
            List<CuestionarioPregunta> bloque,
            List<RespuestaPreguntaCuestionario> respuestas,
            CalculoPuntajeHelper.ResultadoPuntaje resultado) {
        List<CuestionarioDTO.PreguntaDTO> preguntas = bloque.stream()
                .sorted(Comparator.comparing(CuestionarioPregunta::getOrden))
                .map(asignacion -> {
                    Pregunta pregunta = asignacion.getPregunta();
                    List<CuestionarioDTO.DetalleRespuestaDTO> opciones =
                            pregunta.getOpcionRespuesta() == null
                                    ? List.of()
                                    : detalleService.listarPorOpcionRespuesta(
                                            pregunta.getOpcionRespuesta().getId()
                                    ).stream()
                                    .map(detalle ->
                                            new CuestionarioDTO.DetalleRespuestaDTO(
                                                    detalle.getId(),
                                                    detalle.getDescrpicion(),
                                                    detalle.getOrdenVisualizacion()
                                            )
                                    )
                                    .toList();

                    return new CuestionarioDTO.PreguntaDTO(
                            pregunta.getId(),
                            pregunta.getTextoPregunta(),
                            pregunta.getDescripcion(),
                            asignacion.getOrden(),
                            opciones
                    );
                })
                .toList();

        List<CuestionarioDTO.RespuestaDTO> respuestasDTO = respuestas.stream()
                .map(respuesta -> new CuestionarioDTO.RespuestaDTO(
                        respuesta.getPregunta().getId(),
                        respuesta.getDetalleOpcionRespuesta().getId()
                ))
                .toList();

        Integer numeroBloque = bloque.isEmpty()
                ? null
                : bloque.getFirst().getBloque();

        return new CuestionarioDTO(
                cuestionario.getId(),
                cuestionario.getEstadoCuestionario(),
                numeroBloque,
                preguntas,
                respuestasDTO,
                resultado == null ? null : resultado.puntajeFinal(),
                resultado == null ? null : resultado.cumpleMinimo(),
                resultado == null ? java.util.Map.of()
                        : resultado.puntajesPorCompetencia()
        );
    }

    private void registrarAcceso(
            Cuestionario cuestionario,
            LocalDateTime ahora) {
        cuestionario.setUltimoIngreso(ahora);
        cuestionario.setCantidadAccesos(
                cuestionario.getCantidadAccesos() == null
                        ? 1
                        : cuestionario.getCantidadAccesos() + 1
        );
    }

    private void validarAccesosYPlazos(Cuestionario cuestionario) {
        throw new UnsupportedOperationException();
    }

    private List<Pregunta> seleccionarPreguntasAleatorias(
            Cuestionario cuestionario) {
        throw new UnsupportedOperationException();
    }

    private List<CuestionarioPregunta> asignarPreguntasACuestionario(
            Cuestionario cuestionario,
            List<Pregunta> preguntasSeleccionadas) {
        throw new UnsupportedOperationException();
    }
}
