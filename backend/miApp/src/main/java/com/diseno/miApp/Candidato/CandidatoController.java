package com.diseno.miApp.Candidato;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Arrays;
import java.util.List;
import com.diseno.miApp.Nacionalidad.Nacionalidad;

@RestController
@RequestMapping("/candidatos")
public class CandidatoController {

    private final CandidatoService candidatoService;

    public CandidatoController(CandidatoService candidatoService) {
        this.candidatoService = candidatoService;
    }

    @GetMapping("/nacionalidades")
    public ResponseEntity<List<NacionalidadResponse>> listarNacionalidades() {
        List<NacionalidadResponse> nacionalidades = Arrays
                .stream(Nacionalidad.values())
                .map(NacionalidadResponse::desde)
                .toList();
        return ResponseEntity.ok(nacionalidades);
    }

    @PostMapping
    public ResponseEntity<CandidatoCrearResponse> crearCandidato(
            @Valid @RequestBody CandidatoCrearRequest request) {

        CandidatoCrearResponse response = candidatoService.crearCandidato(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PostMapping("/buscar")
    public ResponseEntity<List<Candidato>> buscarCandidatos(
            @Valid @RequestBody BuscarCandidatosRequest request) {

        List<Candidato> candidatos = candidatoService.buscarCandidatos(
                request.getNumeroCandidato(),
                request.getNombre(),
                request.getApellido()
        );

        return ResponseEntity.ok(candidatos);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Candidato> modificarCandidato(
            @PathVariable Long id,
            @Valid @RequestBody CandidatoModificarRequest request) {

        Candidato candidato =
                candidatoService.modificarCandidato(id, request);

        return ResponseEntity.ok(candidato);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> darBajaCandidato(
            @PathVariable Long id) {

        candidatoService.darBajaCandidato(id);

        return ResponseEntity.noContent().build();
    }
}
