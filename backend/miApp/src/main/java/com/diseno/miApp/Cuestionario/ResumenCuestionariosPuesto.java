package com.diseno.miApp.Cuestionario;

import com.diseno.miApp.Candidato.CandidatoResumenDTO;

import java.util.List;

public class ResumenCuestionariosPuesto {
    private final List<CandidatoResumenDTO> candidatos;
    private final long evaluacionesCompletas;

    public ResumenCuestionariosPuesto(
            List<CandidatoResumenDTO> candidatos,
            long evaluacionesCompletas) {
        this.candidatos = candidatos;
        this.evaluacionesCompletas = evaluacionesCompletas;
    }

    public List<CandidatoResumenDTO> getCandidatos() {
        return candidatos;
    }

    public long getEvaluacionesCompletas() {
        return evaluacionesCompletas;
    }
}
