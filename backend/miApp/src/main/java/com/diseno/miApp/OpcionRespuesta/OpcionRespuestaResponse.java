package com.diseno.miApp.OpcionRespuesta;

import java.util.List;

public record OpcionRespuestaResponse(
        Long id,
        String nombre,
        String descripcion,
        boolean estaActivo,
        List<DetalleOpcionRespuestaResponse> detalles
) {}
