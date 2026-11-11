package com.diseno.miApp.Factor;

import com.diseno.miApp.Competencia.Competencia;
import com.diseno.miApp.Competencia.CompetenciaService;
import com.diseno.miApp.Competencia.FactorModificarRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class GestionFactorService {

    private final FactorService factorService;
    private final CompetenciaService competenciaService;

    public GestionFactorService(
            FactorService factorService,
            CompetenciaService competenciaService) {
        this.factorService = factorService;
        this.competenciaService = competenciaService;
    }

    public List<FactorResponse> listarPorCompetencia(Long idCompetencia) {
        validarIdPositivo(
                idCompetencia,
                "Debe indicar un ID de competencia positivo"
        );

        buscarCompetencia(
                idCompetencia,
                "No se pueden listar factores: la competencia indicada no existe"
        );

        return factorService.listarPorCompetencia(idCompetencia).stream()
                .map(FactorResponse::desde).toList();
    }

    public FactorResponse crearFactor(FactorCrearRequest request) {
        if (request == null) {
            throw errorSolicitud("Debe enviar los datos del factor");
        }

        Long idCompetencia = request.getCompetencia_id();
        validarIdPositivo(
                idCompetencia,
                "Debe indicar un ID de competencia positivo"
        );

        Competencia competencia = buscarCompetencia(
                idCompetencia,
                "No se puede asociar el factor: la competencia indicada no existe"
        );

        return FactorResponse.desde(factorService.crearFactor(request, competencia));
    }

    public FactorResponse modificarFactor(
            Long id,
            FactorModificarRequest request) {
        if (request == null) {
            throw errorSolicitud(
                    "Debe enviar los datos para modificar el factor"
            );
        }

        Competencia competencia = null;
        Long idCompetencia = request.getCompetencia_id();

        if (idCompetencia != null) {
            validarIdPositivo(
                    idCompetencia,
                    "Debe indicar un ID de competencia positivo"
            );
            competencia = buscarCompetencia(
                    idCompetencia,
                    "No se puede asociar el factor: la competencia indicada no existe"
            );
        }

        return FactorResponse.desde(
                factorService.modificarFactor(id, request, competencia)
        );
    }

    private Competencia buscarCompetencia(
            Long idCompetencia,
            String mensajeSiNoExiste) {
        try {
            return competenciaService.buscarPorId(idCompetencia);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
                throw errorNoEncontrado(mensajeSiNoExiste, ex);
            }

            throw ex;
        }
    }

}
