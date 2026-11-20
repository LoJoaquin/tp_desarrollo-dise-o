package com.diseno.miApp.Pregunta;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class PreguntaIADTO {

    private PreguntaIADTO() {}

    public record GenerarRequest(
            @NotNull(message = "Seleccioná un factor")
            @Positive(message = "El factor debe ser válido")
            Long idFactor,
            @Size(max = 500, message = "Las indicaciones no pueden superar 500 caracteres")
            String indicaciones
    ) {}

    public record DetalleBorrador(
            @NotNull @Min(1) Integer ordenVisualizacion,
            @NotBlank @Size(max = 255) String descripcion,
            @NotNull @Min(0) @Max(10) Integer ponderacion
    ) {}

    public record Borrador(
            @NotBlank @Size(max = 100) String nombre,
            @NotBlank @Size(max = 1000) String textoPregunta,
            @Size(max = 500) String descripcion,
            @NotBlank @Size(max = 220) String nombreOpcionRespuesta,
            @NotBlank @Size(max = 255) String descripcionOpcionRespuesta,
            @NotEmpty @Size(min = 5, max = 5)
            List<@NotNull @Valid DetalleBorrador> detalles
    ) {}

    public record VistaPrevia(
            Long idFactor,
            String nombreFactor,
            Long idCompetencia,
            String nombreCompetencia,
            Borrador borrador
    ) {}

    public record ConfirmarRequest(
            @NotNull @Positive Long idFactor,
            @NotNull @Valid Borrador borrador
    ) {}

    public record PreguntaGuardada(
            Long idPregunta,
            String nombreFactor,
            String nombreCompetencia,
            Borrador borrador
    ) {}
}
