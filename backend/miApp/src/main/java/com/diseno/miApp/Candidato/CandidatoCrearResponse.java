package com.diseno.miApp.Candidato;

import com.diseno.miApp.Nacionalidad.Nacionalidad;
import com.diseno.miApp.genero.Genero;
import com.diseno.miApp.tipoDocumento.TipoDocumento;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CandidatoCrearResponse {
    private Long id;
    private String numeroCandidato;
    private String nombre;
    private String apellido;
    private TipoDocumento tipoDocumento;
    private String numeroDocumento;
    private LocalDate fechaNacimiento;
    private Genero genero;
    private Nacionalidad nacionalidad;
    private String email;
    private String escolaridad;

    public String getNombre() {
        return nombre;
    }

    public Long getId() {
        return id;
    }

    public String getNumeroCandidato() {
        return numeroCandidato;
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

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public TipoDocumento getTipoDocumento() {
        return tipoDocumento;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }

    public void setTipoDocumento(TipoDocumento tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public Genero getGenero() {
        return genero;
    }

    public void setGenero(Genero genero) {
        this.genero = genero;
    }

    public Nacionalidad getNacionalidad() {
        return nacionalidad;
    }

    public void setNacionalidad(Nacionalidad nacionalidad) {
        this.nacionalidad = nacionalidad;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEscolaridad() {
        return escolaridad;
    }

    public void setEscolaridad(String escolaridad) {
        this.escolaridad = escolaridad;
    }

    public CandidatoCrearResponse(Long id, String numeroCandidato, String nombre, String apellido, LocalDate fechaNacimiento, TipoDocumento tipoDocumento, Genero genero, Nacionalidad nacionalidad, String email, String escolaridad) {
        this.id = id;
        this.numeroCandidato = numeroCandidato;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
        this.tipoDocumento = tipoDocumento;
        this.genero = genero;
        this.nacionalidad = nacionalidad;
        this.email = email;
        this.escolaridad = escolaridad;
    }
}
