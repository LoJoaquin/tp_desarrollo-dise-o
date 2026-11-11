package com.diseno.miApp.Empresa;

public class EmpresaCrearRequest {

    private String nombre;

    public EmpresaCrearRequest() {
    }

    public EmpresaCrearRequest(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
