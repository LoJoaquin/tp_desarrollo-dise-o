package com.diseno.miApp.Cuestionario;

public class EvaluacionesCompletasPorPuestoProjection {
    private final Long puestoId;
    private final Long cantidad;

    public EvaluacionesCompletasPorPuestoProjection(Long puestoId, Long cantidad) {
        this.puestoId = puestoId;
        this.cantidad = cantidad;
    }

    public Long getPuestoId() {
        return puestoId;
    }

    public Long getCantidad() {
        return cantidad;
    }
}
