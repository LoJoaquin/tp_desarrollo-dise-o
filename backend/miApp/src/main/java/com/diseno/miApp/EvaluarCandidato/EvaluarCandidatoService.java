package com.diseno.miApp.EvaluarCandidato;

import com.diseno.miApp.Candidato.Candidato;
import com.diseno.miApp.Candidato.CandidatoService;
import com.diseno.miApp.CaracteristicasPuesto.CaracteristicasPuesto;
import com.diseno.miApp.Cuestionario.Cuestionario;
import com.diseno.miApp.Cuestionario.CuestionarioServices;
import com.diseno.miApp.ModeloCuestionario.ModeloCuestionario;
import com.diseno.miApp.ModeloCuestionario.ModeloCuestionarioRepository;
import com.diseno.miApp.ModeloCuestionario.ModeloCuestionarioService;
import com.diseno.miApp.Factor.Factor;
import com.diseno.miApp.Factor.FactorService;
import com.diseno.miApp.Puesto.Puesto;
import com.diseno.miApp.Puesto.PuestoService;
import com.diseno.miApp.Pregunta.PreguntaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorConflicto;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class EvaluarCandidatoService {

    private final CandidatoService candidatoService;
    private final CuestionarioServices cuestionarioServices;
    private final PuestoService puestoService;
    private final FactorService factorService;
    private final PreguntaService preguntaService;
    private final ModeloCuestionarioService modeloCuestionarioService;
    private final ModeloCuestionarioRepository modeloCuestionarioRepository;

    public EvaluarCandidatoService(
            CandidatoService candidatoService,
            CuestionarioServices cuestionarioServices,
            PuestoService puestoService,
            FactorService factorService,
            PreguntaService preguntaService,
            ModeloCuestionarioService modeloCuestionarioService,
            ModeloCuestionarioRepository modeloCuestionarioRepository) {
        this.candidatoService = candidatoService;
        this.cuestionarioServices = cuestionarioServices;
        this.puestoService = puestoService;
        this.factorService = factorService;
        this.preguntaService = preguntaService;
        this.modeloCuestionarioService = modeloCuestionarioService;
        this.modeloCuestionarioRepository = modeloCuestionarioRepository;
    }

    // HTTP 1: búsqueda por número de candidato y/o coincidencia parcial de nombre/apellido.
    public List<BuscarCandidatoEvaluarCandidatoResponse> buscarCandidatos(
            BuscarCandidatoEvaluarCandidatoRequest request) {
        if (request == null) {
            throw errorSolicitud("Debe enviar criterios de búsqueda");
        }

        return candidatoService.buscarCandidatos(
                        request.numeroCandidato(),
                        request.nombre(),
                        request.apellido())
                .stream()
                .map(candidato -> new BuscarCandidatoEvaluarCandidatoResponse(
                        candidato.getId(),
                        candidato.getNumeroCandidato(),
                        candidato.getNombre(),
                        candidato.getApellido()))
                .toList();
    }

    // HTTP 2: valida los candidatos seleccionados y devuelve los puestos activos.
    public List<BuscarPuestoEvaluarCandidatoResponse>
    validarCandidatosYListarPuestos(CandidatosSeleccionadosRequest request) {
        validarIdsCandidatos(request == null ? null : request.idsCandidatos());

        for (Long idCandidato : request.idsCandidatos()) {
            candidatoService.buscarPorId(idCandidato);
        }

        cuestionarioServices.validarSinCuestionarioActivoOEnProceso(
                request.idsCandidatos());

        return puestoService.listarTodos().stream()
                .filter(puesto -> Boolean.TRUE.equals(puesto.getEstaActiva()))
                .map(puesto -> new BuscarPuestoEvaluarCandidatoResponse(
                        puesto.getId(),
                        puesto.getNombre(),
                        puesto.getEmpresa() == null
                                ? null
                                : puesto.getEmpresa().getNombre()))
                .toList();
    }

    // HTTP 3: valida el puesto elegido y devuelve las competencias requeridas.
    public List<CompetenciaRequeridaDTO> verificarPuesto(
            BuscarPuestoEvaluarCandidatoRequest request) {
        if (request == null) {
            throw errorSolicitud("Debe indicar el puesto seleccionado");
        }

        validarPuestoEvaluable(request.idPuesto());

        return puestoService.obtenerCaracteristicas(request.idPuesto()).stream()
                .map(caracteristica -> new CompetenciaRequeridaDTO(
                        caracteristica.getCompetencia().getNombre(),
                        caracteristica.getPonderacion()))
                .toList();
    }

    // HTTP 4: persiste la evaluación. La unicidad de estados abiertos la impone
    // la restricción parcial de la base, sin una consulta previa de estado aquí.
    @Transactional
    public List<EvaluarCandidatoResponse> confirmar(
            EvaluarCandidatoRequest request) {
        if (request == null) {
            throw errorSolicitud("Debe enviar candidatos y puesto");
        }

        validarIdsCandidatos(request.idsCandidatos());
        List<Candidato> candidatos = new ArrayList<>();
        for (Long idCandidato : request.idsCandidatos()) {
            Candidato candidato = candidatoService.buscarPorId(idCandidato);
            if (candidato.getTipoDocumento() == null
                    || candidato.getNumeroDocumento() == null
                    || candidato.getNumeroDocumento().isBlank()) {
                throw errorSolicitud(
                        "El candidato con ID " + idCandidato
                                + " debe tener tipo y número de documento para generar la evaluación"
                );
            }
            candidatos.add(candidato);
        }

        Puesto puesto = puestoService.buscarPorId(request.idPuesto());
        // Reemplaza la validación previa y la selección al primer acceso:
        // construye y valida el snapshot una sola vez, antes de persistir.
        ModeloCuestionario modelo = modeloCuestionarioService
                .construirYValidar(puesto);
        modelo = modeloCuestionarioRepository.save(modelo);
        List<Cuestionario> cuestionarios =
                cuestionarioServices.crearCuestionarios(
                        candidatos, puesto, modelo);

        return cuestionarios.stream()
                .map(cuestionario -> new EvaluarCandidatoResponse(
                        cuestionario.getCandidato().getApellido(),
                        cuestionario.getCandidato().getNombre(),
                        cuestionario.getCandidato().getTipoDocumento(),
                        cuestionario.getCandidato().getNumeroDocumento(),
                        cuestionario.getClaveIngreso()))
                .toList();
    }

    private void validarPuestoEvaluable(Long idPuesto) {
        validarIdPositivo(idPuesto, "El ID del puesto debe ser positivo");
        Puesto puesto = puestoService.buscarPorId(idPuesto);

        if (!Boolean.TRUE.equals(puesto.getEstaActiva())) {
            throw errorConflicto("El puesto seleccionado está dado de baja");
        }

        List<String> competenciasNoEvaluables = new ArrayList<>();
        List<CaracteristicasPuesto> caracteristicas =
                puestoService.obtenerCaracteristicas(idPuesto);

        if (caracteristicas.isEmpty()) {
            throw errorSolicitud(
                    "El puesto seleccionado no tiene competencias asociadas"
            );
        }

        for (CaracteristicasPuesto caracteristica : caracteristicas) {
            if (caracteristica.getCompetencia() == null) {
                competenciasNoEvaluables.add("(competencia sin nombre)");
                continue;
            }

            Long idCompetencia = caracteristica.getCompetencia().getId();
            boolean tieneFactorEvaluable = false;

            for (Factor factor : factorService.listarPorCompetencia(idCompetencia)) {
                if (factor.isEstaActvivo()
                        && preguntaService.contarActivasPorFactor(factor.getId()) >= 2) {
                    tieneFactorEvaluable = true;
                    break;
                }
            }

            if (!tieneFactorEvaluable) {
                competenciasNoEvaluables.add(
                        caracteristica.getCompetencia().getNombre());
            }
        }

        if (!competenciasNoEvaluables.isEmpty()) {
            throw errorSolicitud(
                    "No se puede evaluar el puesto. Estas competencias no tienen " +
                    "un factor activo con al menos dos preguntas activas: " +
                    String.join(", ", competenciasNoEvaluables));
        }
    }

    private void validarIdsCandidatos(List<Long> idsCandidatos) {
        if (idsCandidatos == null || idsCandidatos.isEmpty()) {
            throw errorSolicitud("Debe seleccionar al menos un candidato");
        }

        Set<Long> idsUnicos = new HashSet<>();
        for (Long id : idsCandidatos) {
            validarIdPositivo(id, "Cada ID de candidato debe ser positivo");
            if (!idsUnicos.add(id)) {
                throw errorSolicitud("No puede seleccionar un candidato más de una vez");
            }
        }
    }
}
