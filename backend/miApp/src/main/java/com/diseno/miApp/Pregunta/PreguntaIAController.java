package com.diseno.miApp.Pregunta;

import com.diseno.miApp.Pregunta.PreguntaIADTO.ConfirmarRequest;
import com.diseno.miApp.Pregunta.PreguntaIADTO.GenerarRequest;
import com.diseno.miApp.Pregunta.PreguntaIADTO.PreguntaGuardada;
import com.diseno.miApp.Pregunta.PreguntaIADTO.VistaPrevia;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/Pregunta/ia")
public class PreguntaIAController {

    private final PreguntaIAService service;

    public PreguntaIAController(PreguntaIAService service) {
        this.service = service;
    }

    @PostMapping("/generar")
    public VistaPrevia generar(
            @Valid @RequestBody GenerarRequest request) {
        return service.generar(request);
    }

    @PostMapping("/confirmar")
    @ResponseStatus(HttpStatus.CREATED)
    public PreguntaGuardada confirmar(
            @Valid @RequestBody ConfirmarRequest request) {
        return service.confirmar(request);
    }
}
