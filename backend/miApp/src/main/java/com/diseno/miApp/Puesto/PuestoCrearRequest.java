package com.diseno.miApp.Puesto;

import com.diseno.miApp.CaracteristicasPuesto.CaracteristicasPuesto;
import com.diseno.miApp.Empresa.Empresa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class PuestoCrearRequest {
    @NotBlank(message = "El código del puesto es obligatorio")
    private String codigo;

    @NotBlank(message = "El nombre del puesto es obligatorio")
    private String nombre;
    private String descripcion;
    private Empresa empresa;

    @NotEmpty(message = "Debe incluir al menos una característica del puesto")
    private List<@NotNull CaracteristicasPuesto> caracteristicasPuesto;
    public PuestoCrearRequest(){}
    public PuestoCrearRequest(String codigo, String nombre, String descripcion, Empresa empresa, List<CaracteristicasPuesto> caracteristicasPuesto) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.empresa = empresa;
        this.caracteristicasPuesto = caracteristicasPuesto;
    }

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

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public List<CaracteristicasPuesto> getCaracteristicasPuesto() {
        return caracteristicasPuesto;
    }

    public void setCaracteristicasPuesto(List<CaracteristicasPuesto> caracteristicasPuesto) {
        this.caracteristicasPuesto = caracteristicasPuesto;
    }
}
