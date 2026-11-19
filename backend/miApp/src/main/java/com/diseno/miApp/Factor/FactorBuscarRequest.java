package com.diseno.miApp.Factor;

public record FactorBuscarRequest(
        Long competenciaId,
        String nombreCompetencia,
        String codigo,
        String nombreFactor
) {
}
