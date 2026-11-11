package com.diseno.miApp.DetalleOpcionRespuesta;

import com.diseno.miApp.OpcionRespuesta.OpcionRespuesta;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class DetalleOpcionRespuesta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String descrpicion;
    private Integer ordenVisualizacion;
    @ManyToOne
    @JoinColumn(name ="opcion_respuesta_id")
    private OpcionRespuesta opcionRespuesta;

}
