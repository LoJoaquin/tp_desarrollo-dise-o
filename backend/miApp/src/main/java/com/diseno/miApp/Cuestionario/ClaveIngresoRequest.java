package com.diseno.miApp.Cuestionario;

import jakarta.validation.constraints.NotBlank;

public record ClaveIngresoRequest(
        @NotBlank(message = "La clave de ingreso es obligatoria")
        String claveIngreso) {
}
