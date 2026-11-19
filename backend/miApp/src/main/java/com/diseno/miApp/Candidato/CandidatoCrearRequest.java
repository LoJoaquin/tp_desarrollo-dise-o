package com.diseno.miApp.Candidato;

import com.diseno.miApp.Nacionalidad.Nacionalidad;
import com.diseno.miApp.genero.Genero;
import com.diseno.miApp.tipoDocumento.TipoDocumento;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CandidatoCrearRequest {
    @NotBlank(message = "El número de candidato es obligatorio")
    @Pattern(regexp = "[0-9]+", message = "El número de candidato solo puede contener dígitos")
    @Size(max = 50, message = "El número de candidato no puede superar 50 caracteres")
    private String numeroCandidato;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 255, message = "El nombre no puede superar 255 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 255, message = "El apellido no puede superar 255 caracteres")
    private String apellido;
    @NotNull(message = "El tipo de documento es obligatorio")
    private TipoDocumento tipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    @Pattern(regexp = "[0-9]+", message = "El número de documento solo puede contener dígitos")
    @Size(max = 255, message = "El número de documento no puede superar 255 caracteres")
    private String numeroDocumento;

    @NotBlank(message = "La contraseña provisoria es obligatoria")
    @Size(min = 4, max = 255, message = "La contraseña debe tener entre 4 y 255 caracteres")
    private String contrasenia;

    @PastOrPresent(message = "La fecha de nacimiento no puede ser futura")
    private LocalDate fechaNacimiento;
    @NotNull(message = "El género es obligatorio")
    private Genero genero;
    private Nacionalidad nacionalidad;

    @Email(message = "El email debe tener un formato válido")
    @Size(max = 255, message = "El email no puede superar 255 caracteres")
    private String email;

    @Size(max = 255, message = "La escolaridad no puede superar 255 caracteres")
    private String escolaridad;
    private LocalDateTime createdAt;

    public CandidatoCrearRequest(String nombre, String apellido, TipoDocumento tipoDocumento, LocalDate fechaNacimiento, Genero genero, Nacionalidad nacionalidad, String email, String escolaridad, LocalDateTime createdAt) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.tipoDocumento = tipoDocumento;
        this.fechaNacimiento = fechaNacimiento;
        this.genero = genero;
        this.nacionalidad = nacionalidad;
        this.email = email;
        this.escolaridad = escolaridad;
        this.createdAt = createdAt;
    }

    public CandidatoCrearRequest() {
    }

    public String getApellido() {
        return apellido;
    }

    public String getNumeroCandidato() {
        return numeroCandidato;
    }

    public void setNumeroCandidato(String numeroCandidato) {
        this.numeroCandidato = numeroCandidato;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
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

    public String getContrasenia() {
        return contrasenia;
    }

    public void setContrasenia(String contrasenia) {
        this.contrasenia = contrasenia;
    }

    public void setTipoDocumento(TipoDocumento tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getEscolaridad() {
        return escolaridad;
    }

    public void setEscolaridad(String escolaridad) {
        this.escolaridad = escolaridad;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
