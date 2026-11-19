package com.diseno.miApp.autenticador;

import com.diseno.miApp.tipoDocumento.TipoDocumento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AutenticarCandidatoRequest(
        @NotNull(message = "Seleccioná el tipo de documento") TipoDocumento tipo,
        @NotBlank(message = "Ingresá el número de documento") String documento,
        @NotBlank(message = "Ingresá tu contraseña") String contrasenia) {
}
