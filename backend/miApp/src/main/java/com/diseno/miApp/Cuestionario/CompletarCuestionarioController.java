package com.diseno.miApp.Cuestionario;

import com.diseno.miApp.JWT.JwtService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cuestionario")
public class CompletarCuestionarioController {
    private final CompletarCuestionarioService service;
    private final JwtService jwtService;

    public CompletarCuestionarioController(
            CompletarCuestionarioService service,
            JwtService jwtService) {
        this.service = service;
        this.jwtService = jwtService;
    }

    @PostMapping("/acceder")
    public CuestionarioDTO acceder(
            @RequestHeader(value = "Authorization", required = false)
            String authorization,
            @Valid @RequestBody ClaveIngresoRequest request) {
        Long idCandidato = jwtService.obtenerIdCandidato(authorization);
        return service.accederCuestionario(
                idCandidato, request.claveIngreso());
    }

    @PatchMapping("/{idCuestionario}/respuestas")
    public CuestionarioDTO guardarParcial(
            @RequestHeader(value = "Authorization", required = false)
            String authorization,
            @PathVariable Long idCuestionario,
            @RequestBody GuardarRespuestasRequest request) {
        Long idCandidato = jwtService.obtenerIdCandidato(authorization);
        return service.guardarRespuestasParciales(
                idCandidato, idCuestionario, request);
    }

    @PostMapping("/{idCuestionario}/finalizar-bloque")
    public CuestionarioDTO finalizarBloque(
            @RequestHeader(value = "Authorization", required = false)
            String authorization,
            @PathVariable Long idCuestionario,
            @RequestBody(required = false) GuardarRespuestasRequest request) {
        Long idCandidato = jwtService.obtenerIdCandidato(authorization);
        return service.finalizarBloque(
                idCandidato, idCuestionario, request);
    }
}
