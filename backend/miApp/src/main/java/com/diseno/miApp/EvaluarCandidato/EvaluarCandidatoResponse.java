package com.diseno.miApp.EvaluarCandidato;

import com.diseno.miApp.tipoDocumento.TipoDocumento;

public record EvaluarCandidatoResponse(
        String apellido,
        String nombre,
        TipoDocumento tipoDocumento,
        String numeroDocumento,
        String claveIngreso) {
}
