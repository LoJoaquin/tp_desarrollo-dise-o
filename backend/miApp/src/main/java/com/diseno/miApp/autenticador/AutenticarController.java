package com.diseno.miApp.autenticador;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/login")
public class AutenticarController {
    private final AutenticarService autenticarService;
    public AutenticarController(AutenticarService service){
        this.autenticarService=service;
    }
  @PostMapping("/candidato")
    public AutenticarResponse autenticarCandidato(
            @Valid @RequestBody AutenticarCandidatoRequest request
  ){
      return autenticarService.autenticarCandidato(request);
  }
  @PostMapping("/consultor")
    public AutenticarConsultorResponse autenticarConsultor(
            @RequestBody AutenticarConsultorRequest request
  ){
        return autenticarService.autenticarConsultor(request);
  }
}
