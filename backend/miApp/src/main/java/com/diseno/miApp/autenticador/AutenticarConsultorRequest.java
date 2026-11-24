package com.diseno.miApp.autenticador;

public record AutenticarConsultorRequest(
        String nombreUsuario,
        String contrasenia) {
}
