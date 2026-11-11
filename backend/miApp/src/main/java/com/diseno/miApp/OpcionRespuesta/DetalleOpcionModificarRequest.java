package com.diseno.miApp.OpcionRespuesta;

public record DetalleOpcionModificarRequest(
        Long id,
        Integer ordenVisualizacion,
        String descripcion
) {}
