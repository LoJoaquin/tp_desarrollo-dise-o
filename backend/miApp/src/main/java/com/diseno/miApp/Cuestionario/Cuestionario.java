package com.diseno.miApp.Cuestionario;

import com.diseno.miApp.Candidato.Candidato;
import com.diseno.miApp.EstadoCuestionario.EstadoCuestionario;

import com.diseno.miApp.Puesto.Puesto;
import com.diseno.miApp.ModeloCuestionario.ModeloCuestionario;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
/*

 */
public class Cuestionario {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    // Se persiste el nombre del estado (por ejemplo, "ACTIVO").
    @Enumerated(EnumType.STRING)
    private EstadoCuestionario estadoCuestionario;
    private String claveIngreso;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaRealizacion;
    private LocalDateTime fechaLimiteActivo;
    private LocalDateTime fechaLimiteFinalizacion;
    private LocalDateTime ultimoIngreso;
    private Integer cantidadAccesos;
    private LocalDateTime fechaCambioEstado;
    @ManyToOne
    @JoinColumn(name="candidato_id")
    private Candidato candidato;
    @ManyToOne
    @JoinColumn(name="puesto_id")
    private Puesto puesto;

    @ManyToOne
    @JoinColumn(name = "modelo_cuestionario_id")
    private ModeloCuestionario modelo;



}
