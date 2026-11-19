package com.diseno.miApp.RespuestaPreguntaCuestionario;

import com.diseno.miApp.Cuestionario.Cuestionario;
import com.diseno.miApp.ModeloCuestionario.ModeloOpcion;
import com.diseno.miApp.ModeloCuestionario.ModeloPregunta;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class RespuestaPreguntaCuestionario {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name= "cuestionario_id")
    private Cuestionario cuestionario;
    @ManyToOne
    @JoinColumn(name= "modelo_pregunta_id")
    private ModeloPregunta pregunta;
    @ManyToOne
    @JoinColumn(name= "modelo_opcion_id")
    private ModeloOpcion opcionSeleccionada;
    private LocalDate fechaRespuesta;


}
