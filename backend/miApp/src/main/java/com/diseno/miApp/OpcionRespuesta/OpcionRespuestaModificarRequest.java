package com.diseno.miApp.OpcionRespuesta;

import java.util.List;

public record OpcionRespuestaModificarRequest(
        String descripcion,
        List<DetalleOpcionModificarRequest> detalles
) {}
