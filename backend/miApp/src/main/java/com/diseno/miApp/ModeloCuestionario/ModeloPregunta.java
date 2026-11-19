package com.diseno.miApp.ModeloCuestionario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class ModeloPregunta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "modelo_cuestionario_id", nullable = false)
    private ModeloCuestionario modelo;

    private Long idPreguntaOriginal;
    private Long idFactorOriginal;
    private Long idCompetenciaOriginal;
    private String nombreFactor;
    private String nombreCompetencia;
    private String nombrePregunta;

    @Column(length = 4000)
    private String texto;

    @Column(length = 2000)
    private String descripcion;

    private Integer bloque;
    private Integer orden;

    @OneToMany(mappedBy = "pregunta", cascade = CascadeType.ALL)
    private List<ModeloOpcion> opciones = new ArrayList<>();

    public void agregarOpcion(ModeloOpcion opcion) {
        opcion.setPregunta(this);
        opciones.add(opcion);
    }
}
