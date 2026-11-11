package com.diseno.miApp.OpcionRespuesta;

import java.util.List;

public record OpcionRespuestaCrearRequest(
        String nombre,
        String descripcion,
        List<DetalleOpcionCrearRequest> detalles
) {}
