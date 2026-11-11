package com.diseno.miApp.Candidato;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class BuscarCandidatosRequest {
    @Size(max = 255, message = "El nombre no puede superar 255 caracteres")
    private String nombre;

    @Size(max = 255, message = "El apellido no puede superar 255 caracteres")
    private String apellido;

    @Pattern(regexp = "[0-9]*", message = "El número de candidato solo puede contener dígitos")
    @Size(max = 50, message = "El número de candidato no puede superar 50 caracteres")
    private String numeroCandidato;

    public BuscarCandidatosRequest() {
    }

    public BuscarCandidatosRequest(String nombre, String apellido, String numeroCandidato) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.numeroCandidato = numeroCandidato;
    }

    public String getNumeroCandidato() {
        return numeroCandidato;
    }

    public void setNumeroCandidato(String numeroCandidato) {
        this.numeroCandidato = numeroCandidato;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }
}
