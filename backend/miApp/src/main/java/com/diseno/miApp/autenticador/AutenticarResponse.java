package com.diseno.miApp.autenticador;

public record AutenticarResponse(
        String token,
        Long idCandidato,
        String nombreCandidato) {
}
