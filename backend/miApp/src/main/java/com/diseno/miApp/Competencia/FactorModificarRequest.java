package com.diseno.miApp.Competencia;

public class FactorModificarRequest {
    private String nombre;
    private String descripcion;
    private Long competencia_id;
    private Integer nroOrden;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getCompetencia_id() {
        return competencia_id;
    }

    public void setCompetencia_id(Long competencia_id) {
        this.competencia_id = competencia_id;
    }

    public Integer getNroOrden() {
        return nroOrden;
    }

    public void setNroOrden(Integer nroOrden) {
        this.nroOrden = nroOrden;
    }
}
