package com.diseno.miApp.FinalizarCuestionarios;

import com.diseno.miApp.FinalizarCuestionarios.EjecucionFinalizacion.Origen;
import com.diseno.miApp.FinalizarCuestionarios.FinalizarCuestionariosService.EjecucionResponse;
import com.diseno.miApp.FinalizarCuestionarios.FinalizarCuestionariosService.ResultadoFinalizacion;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Permite consultar el registro de ejecuciones del CU032 y disparar el
 * proceso manualmente (útil para probar sin esperar al cron).
 */
@RestController
@RequestMapping("/procesos/finalizar-cuestionarios")
public class FinalizarCuestionariosController {

    private final FinalizarCuestionariosService service;

    public FinalizarCuestionariosController(FinalizarCuestionariosService service) {
        this.service = service;
    }

    @PostMapping("/ejecutar")
    public ResponseEntity<ResultadoFinalizacion> ejecutar() {
        return ResponseEntity.ok(service.ejecutar(Origen.MANUAL));
    }

    @GetMapping("/ejecuciones")
    public ResponseEntity<List<EjecucionResponse>> ejecuciones() {
        return ResponseEntity.ok(service.ultimasEjecuciones());
    }
}
