package com.diseno.miApp.Factor;

import com.diseno.miApp.Competencia.Competencia;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

public class FactorCrearRequest {
    private String codigo;
    private String nombre;
    private String descripcion;
    private Integer nroOrden;
    private boolean estaActvivo;
    private Long competencia_id;

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

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

    public Integer getNroOrden() {
        return nroOrden;
    }

    public void setNroOrden(Integer nroOrden) {
        this.nroOrden = nroOrden;
    }

    public boolean isEstaActvivo() {
        return estaActvivo;
    }

    public void setEstaActvivo(boolean estaActvivo) {
        this.estaActvivo = estaActvivo;
    }

    public Long getCompetencia_id() {
        return competencia_id;
    }

    public void setCompetencia_id(Long competencia_id) {
        this.competencia_id = competencia_id;
    }
}
