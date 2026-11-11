package com.diseno.miApp.PreguntaOpcionPonderacion;

import com.diseno.miApp.DetalleOpcionRespuesta.DetalleOpcionRespuesta;
import com.diseno.miApp.Pregunta.Pregunta;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PreguntaOpcionPonderacion {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer ponderacion;
    @ManyToOne
    @JoinColumn(name ="pregunta_id")
    private Pregunta pregunta;

    @ManyToOne
    @JoinColumn(name = "detalle_opcion_respuesta_id", nullable = false)
    private DetalleOpcionRespuesta detalleOpcionRespuesta;
    


}
