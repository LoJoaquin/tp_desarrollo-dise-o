package com.diseno.miApp.Cuestionario;

import java.util.List;

public record GuardarRespuestasRequest(
        List<RespuestaMarcadaRequest> respuestas) {
}
