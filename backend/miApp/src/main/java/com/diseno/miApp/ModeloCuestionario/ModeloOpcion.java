package com.diseno.miApp.ModeloCuestionario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ModeloOpcion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "modelo_pregunta_id", nullable = false)
    private ModeloPregunta pregunta;

    private Long idDetalleOriginal;

    @Column(length = 1000)
    private String descripcion;

    private Integer ordenVisualizacion;
    private Integer ponderacion;
}
