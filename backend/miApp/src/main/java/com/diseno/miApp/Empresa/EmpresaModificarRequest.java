package com.diseno.miApp.Empresa;

public class EmpresaModificarRequest {

    private String nombre;

    public EmpresaModificarRequest() {
    }

    public EmpresaModificarRequest(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
