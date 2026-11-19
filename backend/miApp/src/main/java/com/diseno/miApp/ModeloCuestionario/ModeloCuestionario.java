package com.diseno.miApp.ModeloCuestionario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class ModeloCuestionario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idPuestoOriginal;
    private String nombrePuesto;
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "modelo", cascade = CascadeType.ALL)
    private List<ModeloCompetencia> competencias = new ArrayList<>();

    @OneToMany(mappedBy = "modelo", cascade = CascadeType.ALL)
    private List<ModeloPregunta> preguntas = new ArrayList<>();

    public void agregarCompetencia(ModeloCompetencia competencia) {
        competencia.setModelo(this);
        competencias.add(competencia);
    }

    public void agregarPregunta(ModeloPregunta pregunta) {
        pregunta.setModelo(this);
        preguntas.add(pregunta);
    }
}
