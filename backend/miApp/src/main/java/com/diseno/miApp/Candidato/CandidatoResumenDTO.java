package com.diseno.miApp.Candidato;

public class CandidatoResumenDTO {
    private String nombre;
    private String apellido;

    public CandidatoResumenDTO() {
    }

    public CandidatoResumenDTO(Candidato candidato) {
        this.nombre = candidato.getNombre();
        this.apellido = candidato.getApellido();
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }
}
