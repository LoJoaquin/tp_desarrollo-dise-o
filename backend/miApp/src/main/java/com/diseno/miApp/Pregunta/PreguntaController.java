package com.diseno.miApp.Pregunta;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Pregunta")
public class PreguntaController {

    private final PreguntaService preguntaService;
    private final GestionPreguntaService gestionPreguntaService;

    public PreguntaController(
            PreguntaService preguntaService,
            GestionPreguntaService gestionPreguntaService) {
        this.preguntaService = preguntaService;
        this.gestionPreguntaService = gestionPreguntaService;
    }

    @GetMapping
    public ResponseEntity<List<Pregunta>> listarPreguntas() {
        return ResponseEntity.ok(preguntaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pregunta> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(preguntaService.buscarPorId(id));
    }

    @PatchMapping("/{id}/reactivar")
    public ResponseEntity<Pregunta> reactivarPregunta(
            @PathVariable Long id) {
        return ResponseEntity.ok(preguntaService.reactivarPregunta(id));
    }

    @PostMapping("/crear")
    public ResponseEntity<Pregunta> crearPregunta(
            @Valid @RequestBody PreguntaCrearRequest request) {

        Pregunta pregunta = gestionPreguntaService.crearPregunta(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(pregunta);
    }

    @PatchMapping("/modificar/{id}")
    public ResponseEntity<Pregunta> modificarPregunta(
            @PathVariable Long id,
            @Valid @RequestBody PreguntaModificarRequest request) {

        Pregunta pregunta = gestionPreguntaService.modificarPregunta(id, request);

        return ResponseEntity.ok(pregunta);
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarPregunta(
            @PathVariable Long id) {

        preguntaService.eliminarPregunta(id);

        return ResponseEntity.noContent().build();
    }
}
