package com.diseno.miApp.PreguntaOpcionPonderacion;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PonderacionDetalleRequest {

    @NotNull(message = "El detalle de la opción es obligatorio")
    private Long detalleOpcionRespuestaId;

    @NotNull(message = "La ponderación es obligatoria")
    @PositiveOrZero(message = "La ponderación debe ser cero o positiva")
    private Integer ponderacion;
}
