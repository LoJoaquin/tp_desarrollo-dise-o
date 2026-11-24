package com.diseno.miApp.autenticador;

public record AutenticarConsultorResponse(
        String token,
        String usuario,
        String perfil) {
}
