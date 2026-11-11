package com.diseno.miApp.Pregunta;

import com.diseno.miApp.PreguntaOpcionPonderacion.PonderacionDetalleRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PreguntaModificarRequest {

    @Size(max = PreguntaValidacionConstantes.MAX_NOMBRE_PREGUNTA,
            message = "El nombre de la pregunta excede la longitud máxima permitida")
    private String nombre;

    @Size(max = PreguntaValidacionConstantes.MAX_TEXTO_PREGUNTA,
            message = "El texto de la pregunta excede la longitud máxima permitida")
    private String textoPregunta;

    @Size(max = PreguntaValidacionConstantes.MAX_DESCRIPCION,
            message = "La descripción excede la longitud máxima permitida")
    private String descripcion;

    @Positive(message = "El ID de la opción de respuesta debe ser positivo")
    private Long idOpcionRespuesta;

    @Valid
    private List<@Valid PonderacionDetalleRequest> ponderaciones;
}
