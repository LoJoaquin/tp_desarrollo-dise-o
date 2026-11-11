package com.diseno.miApp.Puesto;

import com.diseno.miApp.CaracteristicasPuesto.CaracteristicasPuesto;
import com.diseno.miApp.Empresa.Empresa;

import java.util.List;

public class PuestoModificarRequest {
    private String nombre;
    private String descripcion;
    private Empresa empresa;
    private List<CaracteristicasPuesto> caracteristicasPuesto;

    public PuestoModificarRequest() {
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

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public List<CaracteristicasPuesto> getCaracteristicasPuesto() {
        return caracteristicasPuesto;
    }

    public void setCaracteristicasPuesto(
            List<CaracteristicasPuesto> caracteristicasPuesto) {
        this.caracteristicasPuesto = caracteristicasPuesto;
    }
}
