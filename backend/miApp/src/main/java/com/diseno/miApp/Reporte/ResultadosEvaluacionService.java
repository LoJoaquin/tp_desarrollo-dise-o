package com.diseno.miApp.Reporte;

import com.diseno.miApp.Candidato.Candidato;
import com.diseno.miApp.Competencia.Competencia;
import com.diseno.miApp.Competencia.CompetenciaRepository;
import com.diseno.miApp.Cuestionario.Cuestionario;
import com.diseno.miApp.Cuestionario.CuestionarioRepository;
import com.diseno.miApp.EstadoCuestionario.EstadoCuestionario;
import com.diseno.miApp.ModeloCuestionario.ModeloCompetencia;
import com.diseno.miApp.Puesto.Puesto;
import com.diseno.miApp.Puesto.PuestoService;
import com.diseno.miApp.Reporte.ResultadosDTOs.ArchivoCsv;
import com.diseno.miApp.Reporte.ResultadosDTOs.BuscarPuestosEvaluadosRequest;
import com.diseno.miApp.Reporte.ResultadosDTOs.CandidatoEvaluadoResponse;
import com.diseno.miApp.Reporte.ResultadosDTOs.CompetenciaComparadaResponse;
import com.diseno.miApp.Reporte.ResultadosDTOs.PuestoEvaluadoResponse;
import com.diseno.miApp.Reporte.ResultadosDTOs.ReporteComparativoResponse;
import com.diseno.miApp.RespuestaPreguntaCuestionario.RespuestaPreguntaCuestionarioService;
import com.diseno.miApp.helpers.CalculoPuntajeHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorConflicto;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

/**
 * CU007 — Exportar resultados y CU027 — Emitir reporte comparativo.
 *
 * En ambos casos "evaluado" significa que el cuestionario está en estado
 * COMPLETO. Los valores requeridos y obtenidos se calculan con el modelo
 * congelado del cuestionario, igual que el orden de mérito (CU028), para que
 * los reportes no cambien si después se edita el puesto o las preguntas.
 */
@Service
public class ResultadosEvaluacionService {

    private static final LocalDateTime FECHA_MINIMA = LocalDateTime.of(1900, 1, 1, 0, 0);
    private static final LocalDateTime FECHA_MAXIMA = LocalDateTime.of(9999, 12, 31, 0, 0);
    private static final DateTimeFormatter FORMATO_FECHA_CSV =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter FORMATO_NOMBRE_ARCHIVO =
            DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm");
    private static final String SEPARADOR = ";";
    private static final String[] ENCABEZADOS_CSV = {
            "Nro candidato", "Apellido", "Nombre", "Tipo documento",
            "Nro documento", "Código Competencia", "Resultado",
            "Nombre puesto", "Código puesto", "Fecha finalización cuestionario"
    };

    private final CuestionarioRepository cuestionarioRepository;
    private final PuestoService puestoService;
    private final RespuestaPreguntaCuestionarioService respuestaService;
    private final CompetenciaRepository competenciaRepository;
    private final CalculoPuntajeHelper calculoPuntajeHelper;

    public ResultadosEvaluacionService(
            CuestionarioRepository cuestionarioRepository,
            PuestoService puestoService,
            RespuestaPreguntaCuestionarioService respuestaService,
            CompetenciaRepository competenciaRepository,
            CalculoPuntajeHelper calculoPuntajeHelper) {
        this.cuestionarioRepository = cuestionarioRepository;
        this.puestoService = puestoService;
        this.respuestaService = respuestaService;
        this.competenciaRepository = competenciaRepository;
        this.calculoPuntajeHelper = calculoPuntajeHelper;
    }

    // ---------------------------------------------------------------
    // Búsqueda de funciones con candidatos evaluados (CU007 paso 2-3, CU027 paso 2-3)
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<PuestoEvaluadoResponse> buscarPuestosEvaluados(
            BuscarPuestosEvaluadosRequest request) {
        BuscarPuestosEvaluadosRequest filtros = request == null
                ? new BuscarPuestosEvaluadosRequest(null, null, null, null)
                : request;
        validarRango(filtros.desde(), filtros.hasta());

        List<Cuestionario> completos = cuestionarioRepository.buscarPorEstadoYFiltros(
                EstadoCuestionario.COMPLETO,
                patronLike(filtros.nombre()),
                patronLike(filtros.empresa()),
                inicioDelDia(filtros.desde()),
                finDelDia(filtros.hasta()));

        Map<Long, List<Cuestionario>> porPuesto = completos.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getPuesto().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        return porPuesto.values().stream()
                .map(cuestionarios -> {
                    Puesto puesto = cuestionarios.get(0).getPuesto();
                    long candidatos = cuestionarios.stream()
                            .map(c -> c.getCandidato().getId())
                            .distinct()
                            .count();
                    return new PuestoEvaluadoResponse(
                            puesto.getId(),
                            puesto.getCodigo(),
                            puesto.getNombre(),
                            puesto.getEmpresa() == null ? null : puesto.getEmpresa().getNombre(),
                            candidatos);
                })
                .sorted(Comparator.comparing(PuestoEvaluadoResponse::nombrePuesto,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .toList();
    }

    // ---------------------------------------------------------------
    // Candidatos evaluados de una función (CU007 paso 5, CU027 paso 5)
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<CandidatoEvaluadoResponse> listarCandidatosEvaluados(
            Long idPuesto, LocalDate desde, LocalDate hasta) {
        validarIdPositivo(idPuesto, "El ID del puesto debe ser positivo");
        validarRango(desde, hasta);
        puestoService.buscarPorId(idPuesto);

        return buscarCompletosDelPuesto(idPuesto, desde, hasta).stream()
                .map(ResultadosEvaluacionService::aCandidatoEvaluado)
                .toList();
    }

    // ---------------------------------------------------------------
    // CU027 paso 7: grilla requerido vs. obtenido por competencia
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public ReporteComparativoResponse emitirReporteComparativo(
            Long idPuesto, Long idCuestionario) {
        validarIdPositivo(idPuesto, "El ID del puesto debe ser positivo");
        validarIdPositivo(idCuestionario, "El ID del cuestionario debe ser positivo");

        Cuestionario cuestionario = cuestionarioRepository.findById(idCuestionario)
                .orElseThrow(() -> errorNoEncontrado("No existe el cuestionario seleccionado"));
        Puesto puesto = cuestionario.getPuesto();
        if (puesto == null || !idPuesto.equals(puesto.getId())) {
            throw errorSolicitud("El cuestionario no corresponde al puesto seleccionado");
        }
        if (cuestionario.getEstadoCuestionario() != EstadoCuestionario.COMPLETO) {
            throw errorConflicto("El candidato no completó el cuestionario de este puesto");
        }

        Map<Long, Double> obtenidos = calcularPuntajes(cuestionario);
        List<CompetenciaComparadaResponse> competencias = cuestionario.getModelo()
                .getCompetencias().stream()
                .sorted(Comparator.comparing(ModeloCompetencia::getNombreCompetencia,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .map(competencia -> new CompetenciaComparadaResponse(
                        competencia.getIdCompetenciaOriginal(),
                        competencia.getNombreCompetencia(),
                        competencia.getPonderacionMinima() == null
                                ? 0.0 : competencia.getPonderacionMinima(),
                        redondear(obtenidos.getOrDefault(
                                competencia.getIdCompetenciaOriginal(), 0.0))))
                .toList();

        return new ReporteComparativoResponse(
                puesto.getId(),
                puesto.getCodigo(),
                puesto.getNombre(),
                puesto.getEmpresa() == null ? null : puesto.getEmpresa().getNombre(),
                aCandidatoEvaluado(cuestionario),
                competencias);
    }

    // ---------------------------------------------------------------
    // CU007 pasos 6-9: generar el archivo CSV
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public ArchivoCsv exportarResultados(Long idPuesto, LocalDate desde, LocalDate hasta) {
        validarIdPositivo(idPuesto, "Debe seleccionar una función o puesto");
        validarRango(desde, hasta);
        Puesto puesto = puestoService.buscarPorId(idPuesto);

        List<Cuestionario> cuestionarios = buscarCompletosDelPuesto(idPuesto, desde, hasta);
        if (cuestionarios.isEmpty()) {
            throw errorNoEncontrado("La función seleccionada no tiene candidatos evaluados para exportar");
        }

        Map<Long, String> codigosCompetencia = competenciaRepository.findAll().stream()
                .collect(Collectors.toMap(Competencia::getId,
                        c -> c.getCodigo() == null ? "" : c.getCodigo(),
                        (a, b) -> a));

        StringBuilder csv = new StringBuilder();
        // BOM para que Excel reconozca el UTF-8 (tildes y eñes).
        csv.append('﻿');
        csv.append(String.join(SEPARADOR, ENCABEZADOS_CSV)).append("\r\n");

        for (Cuestionario cuestionario : cuestionarios) {
            Candidato candidato = cuestionario.getCandidato();
            Map<Long, Double> puntajes = calcularPuntajes(cuestionario);
            List<ModeloCompetencia> competencias = cuestionario.getModelo().getCompetencias()
                    .stream()
                    .sorted(Comparator.comparing(ModeloCompetencia::getIdCompetenciaOriginal,
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();

            for (ModeloCompetencia competencia : competencias) {
                Long idCompetencia = competencia.getIdCompetenciaOriginal();
                String[] fila = {
                        candidato.getNumeroCandidato(),
                        candidato.getApellido(),
                        candidato.getNombre(),
                        candidato.getTipoDocumento() == null ? "" : candidato.getTipoDocumento().name(),
                        candidato.getNumeroDocumento(),
                        codigosCompetencia.getOrDefault(idCompetencia,
                                idCompetencia == null ? "" : idCompetencia.toString()),
                        String.format(Locale.ROOT, "%.2f", puntajes.getOrDefault(idCompetencia, 0.0)),
                        puesto.getNombre(),
                        puesto.getCodigo(),
                        cuestionario.getFechaRealizacion() == null
                                ? "" : cuestionario.getFechaRealizacion().format(FORMATO_FECHA_CSV)
                };
                csv.append(Arrays.stream(fila)
                                .map(ResultadosEvaluacionService::escaparCsv)
                                .collect(Collectors.joining(SEPARADOR)))
                        .append("\r\n");
            }
        }

        return new ArchivoCsv(nombreArchivo(puesto), csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    // ---------------------------------------------------------------
    // Auxiliares
    // ---------------------------------------------------------------

    private List<Cuestionario> buscarCompletosDelPuesto(Long idPuesto, LocalDate desde, LocalDate hasta) {
        return cuestionarioRepository.buscarPorPuestoEstadoYFechas(
                idPuesto, EstadoCuestionario.COMPLETO, inicioDelDia(desde), finDelDia(hasta));
    }

    private Map<Long, Double> calcularPuntajes(Cuestionario cuestionario) {
        if (cuestionario.getModelo() == null) {
            throw errorConflicto("El cuestionario completo no tiene un modelo congelado");
        }
        return calculoPuntajeHelper.calcularResultado(
                        respuestaService.obtenerPorCuestionario(cuestionario.getId()),
                        cuestionario.getModelo().getCompetencias())
                .puntajesPorCompetencia();
    }

    private static CandidatoEvaluadoResponse aCandidatoEvaluado(Cuestionario cuestionario) {
        Candidato candidato = cuestionario.getCandidato();
        return new CandidatoEvaluadoResponse(
                cuestionario.getId(),
                candidato.getId(),
                candidato.getNombre(),
                candidato.getApellido(),
                candidato.getTipoDocumento() == null ? null : candidato.getTipoDocumento().name(),
                candidato.getNumeroDocumento(),
                candidato.getNumeroCandidato(),
                cuestionario.getFechaRealizacion());
    }

    /** aaaa-mm-dd-hh-mm-Empresa-NombreFunción.csv */
    private static String nombreArchivo(Puesto puesto) {
        String empresa = puesto.getEmpresa() == null ? "SinEmpresa" : puesto.getEmpresa().getNombre();
        return LocalDateTime.now().format(FORMATO_NOMBRE_ARCHIVO)
                + "-" + paraNombreArchivo(empresa)
                + "-" + paraNombreArchivo(puesto.getNombre())
                + ".csv";
    }

    private static String paraNombreArchivo(String texto) {
        if (texto == null || texto.isBlank()) {
            return "SinNombre";
        }
        // Se quitan caracteres no válidos en nombres de archivo de Windows.
        return texto.trim().replaceAll("[\\\\/:*?\"<>|]", "").replaceAll("\\s+", " ");
    }

    private static String escaparCsv(String valor) {
        if (valor == null) {
            return "";
        }
        if (valor.contains(SEPARADOR) || valor.contains("\"")
                || valor.contains("\n") || valor.contains("\r")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }

    private static String patronLike(String filtro) {
        if (filtro == null || filtro.isBlank()) {
            return "%";
        }
        return "%" + filtro.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private static LocalDateTime inicioDelDia(LocalDate fecha) {
        return fecha == null ? FECHA_MINIMA : fecha.atStartOfDay();
    }

    private static LocalDateTime finDelDia(LocalDate fecha) {
        return fecha == null ? FECHA_MAXIMA : fecha.plusDays(1).atStartOfDay();
    }

    private static void validarRango(LocalDate desde, LocalDate hasta) {
        if (desde != null && hasta != null && desde.isAfter(hasta)) {
            throw errorSolicitud("La fecha desde no puede ser posterior a la fecha hasta");
        }
    }

    private static double redondear(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}
