package com.diseno.miApp.Pregunta;

import com.diseno.miApp.PreguntaOpcionPonderacion.PonderacionDetalleRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PreguntaCrearRequest {

    @NotNull(message = "La competencia es obligatoria")
    private Long competenciaId;

    @NotNull(message = "El factor es obligatorio")
    private Long idFactor;

    @NotBlank(message = "El nombre de la pregunta es obligatorio")
    @Size(
            max = PreguntaValidacionConstantes.MAX_NOMBRE_PREGUNTA,
            message = "El nombre de la pregunta excede la longitud máxima permitida"
    )
    private String nombre;

    @NotBlank(message = "El texto de la pregunta es obligatorio")
    @Size(
            max = PreguntaValidacionConstantes.MAX_TEXTO_PREGUNTA,
            message = "El texto de la pregunta excede la longitud máxima permitida"
    )
    private String textoPregunta;

    @Size(
            max = PreguntaValidacionConstantes.MAX_DESCRIPCION,
            message = "La descripción excede la longitud máxima permitida"
    )
    private String descripcion;

    @NotNull(message = "La opción de respuesta es obligatoria")
    private Long idOpcionRespuesta;

    @NotEmpty(message = "Debe ingresar las ponderaciones de las opciones")
    @Valid
    private List<@NotNull @Valid PonderacionDetalleRequest> ponderaciones;
}
