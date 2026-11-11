package com.diseno.miApp.Factor;

public record FactorResponse(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        Integer nroOrden,
        boolean estaActivo,
        Long competenciaId) {

    public static FactorResponse desde(Factor factor) {
        return new FactorResponse(
                factor.getId(),
                factor.getCodigo(),
                factor.getNombre(),
                factor.getDescripcion(),
                factor.getNroOrden(),
                factor.isEstaActvivo(),
                factor.getCompetencia() == null
                        ? null : factor.getCompetencia().getId()
        );
    }
}
