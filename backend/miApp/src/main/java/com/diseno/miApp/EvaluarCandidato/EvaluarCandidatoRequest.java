package com.diseno.miApp.EvaluarCandidato;

import java.util.List;

public record EvaluarCandidatoRequest(
        List<Long> idsCandidatos,
        Long idPuesto) {
}
