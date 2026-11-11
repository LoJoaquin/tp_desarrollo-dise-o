package com.diseno.miApp.Puesto;

import com.diseno.miApp.Empresa.Empresa;
import jakarta.persistence.*;

@Entity
public class Puesto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Boolean estaActiva;
    @ManyToOne
    @JoinColumn(name ="empresa_id")
    private Empresa empresa;
    public Puesto(){}
    public Puesto(Long id, String codigo, String descripcion, String nombre, Boolean estaActiva, Empresa empresa) {
        this.id = id;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.nombre = nombre;
        this.estaActiva = estaActiva;
        this.empresa = empresa;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Boolean getEstaActiva() {
        return estaActiva;
    }

    public void setEstaActiva(Boolean estaActiva) {
        this.estaActiva = estaActiva;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }
}
