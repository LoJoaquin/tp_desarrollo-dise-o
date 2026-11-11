package com.diseno.miApp.Puesto;

import com.diseno.miApp.Candidato.CandidatoResumenDTO;
import com.diseno.miApp.Cuestionario.ResumenCuestionariosPuesto;

import java.util.List;

public class PuestoResponse {
    private Long idPuesto;
    private String codigoPuesto;
    private String nombrePuesto;
    private String empresa;
    private List<CandidatoResumenDTO> candidatos;
    private long evaluacionesCompletas;

    public PuestoResponse() {
    }

    public PuestoResponse(
            Puesto puesto,
            ResumenCuestionariosPuesto resumen) {
        this.idPuesto = puesto.getId();
        this.codigoPuesto = puesto.getCodigo();
        this.nombrePuesto = puesto.getNombre();
        this.empresa = puesto.getEmpresa() == null
                ? null
                : puesto.getEmpresa().getNombre();
        this.candidatos = resumen.getCandidatos();
        this.evaluacionesCompletas = resumen.getEvaluacionesCompletas();
    }

    public Long getIdPuesto() {
        return idPuesto;
    }

    public String getCodigoPuesto() {
        return codigoPuesto;
    }

    public String getNombrePuesto() {
        return nombrePuesto;
    }

    public String getEmpresa() {
        return empresa;
    }

    public List<CandidatoResumenDTO> getCandidatos() {
        return candidatos;
    }

    public long getEvaluacionesCompletas() {
        return evaluacionesCompletas;
    }
}
