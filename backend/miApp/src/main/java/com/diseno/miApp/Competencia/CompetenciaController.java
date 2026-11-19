package com.diseno.miApp.Competencia;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Competencia")
public class CompetenciaController {
    private CompetenciaService competenciaService;
    public CompetenciaController(CompetenciaService comptenciaService){
        this.competenciaService=comptenciaService;
    }

    @GetMapping
    public ResponseEntity<List<Competencia>> listarCompetencias() {
        return ResponseEntity.ok(competenciaService.listarTodas());
    }

    @PostMapping("/buscar")
    public ResponseEntity<List<Competencia>> buscarPorNombreConteniendo(
            @RequestBody CompetenciaBuscarRequest request) {
        return ResponseEntity.ok(
                competenciaService.buscarConteniendo(request)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Competencia> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(competenciaService.buscarPorId(id));
    }

    @PatchMapping("/{id}/reactivar")
    public ResponseEntity<Competencia> reactivarCompetencia(
            @PathVariable Long id) {
        return ResponseEntity.ok(competenciaService.reactivarCompetencia(id));
    }

    @PostMapping("/crear")
    public ResponseEntity<Competencia> crearCompetencia(
            @RequestBody CompetenciaCrearRequest request) {

        Competencia competencia =
                competenciaService.crearCompetencia(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(competencia);
    }
    @PatchMapping("/modificar/{id}")
    public ResponseEntity<Competencia> modificarCompetencia(
            @PathVariable Long id,
            @RequestBody CompetenciaModificarRequest request) {

        Competencia competencia =
                competenciaService.modificarCompetencia(id, request);

        return ResponseEntity.ok(competencia);
    }
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarCompetencia(
            @PathVariable Long id) {

        competenciaService.eliminarCompetencia(id);

        return ResponseEntity.noContent().build();
    }

}
