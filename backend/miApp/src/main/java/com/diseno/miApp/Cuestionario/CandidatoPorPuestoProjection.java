package com.diseno.miApp.Cuestionario;

import com.diseno.miApp.Candidato.Candidato;

public class CandidatoPorPuestoProjection {
    private final Long puestoId;
    private final Candidato candidato;

    public CandidatoPorPuestoProjection(Long puestoId, Candidato candidato) {
        this.puestoId = puestoId;
        this.candidato = candidato;
    }

    public Long getPuestoId() {
        return puestoId;
    }

    public Candidato getCandidato() {
        return candidato;
    }
}
