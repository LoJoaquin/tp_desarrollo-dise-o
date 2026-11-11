package com.diseno.miApp.EvaluarCandidato;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/evaluar-candidato")
public class EvaluarCandidatoController {

    private final EvaluarCandidatoService evaluarCandidatoService;

    public EvaluarCandidatoController(
            EvaluarCandidatoService evaluarCandidatoService) {
        this.evaluarCandidatoService = evaluarCandidatoService;
    }

    @PostMapping("/candidatos/buscar")
    public List<BuscarCandidatoEvaluarCandidatoResponse> buscarCandidatos(
            @RequestBody BuscarCandidatoEvaluarCandidatoRequest request) {
        return evaluarCandidatoService.buscarCandidatos(request);
    }

    @PostMapping("/candidatos/seleccion")
    public List<BuscarPuestoEvaluarCandidatoResponse>
    validarCandidatosYListarPuestos(
            @RequestBody CandidatosSeleccionadosRequest request) {
        return evaluarCandidatoService.validarCandidatosYListarPuestos(request);
    }

    @PostMapping("/puesto/verificar")
    public List<CompetenciaRequeridaDTO> verificarPuesto(
            @RequestBody BuscarPuestoEvaluarCandidatoRequest request) {
        return evaluarCandidatoService.verificarPuesto(request);
    }

    @PostMapping("/confirmar")
    @ResponseStatus(HttpStatus.CREATED)
    public List<EvaluarCandidatoResponse> confirmar(
            @RequestBody EvaluarCandidatoRequest request) {
        return evaluarCandidatoService.confirmar(request);
    }
}
