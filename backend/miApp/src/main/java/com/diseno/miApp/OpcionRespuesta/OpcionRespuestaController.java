package com.diseno.miApp.OpcionRespuesta;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/opcion-respuesta")
public class OpcionRespuestaController {

    private final GestionOpcionRespuestaService service;

    public OpcionRespuestaController(GestionOpcionRespuestaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<OpcionRespuestaResponse>> listar() {
        return ResponseEntity.ok(service.listarActivasComoResponse());
    }

    @PostMapping("/buscar")
    public ResponseEntity<List<OpcionRespuestaResponse>> buscarPorNombre(
            @RequestBody OpcionRespuestaBuscarRequest request) {
        if (request == null) {
            throw com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud(
                    "Debe enviar los criterios de búsqueda"
            );
        }
        return ResponseEntity.ok(
                service.buscarActivasPorNombreConteniendo(request.nombre())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<OpcionRespuestaResponse> buscar(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.buscarRespuestaPorId(id));
    }

    @PostMapping
    public ResponseEntity<OpcionRespuestaResponse> crear(
            @RequestBody OpcionRespuestaCrearRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.crear(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OpcionRespuestaResponse> modificar(
            @PathVariable Long id,
            @RequestBody OpcionRespuestaModificarRequest request) {
        return ResponseEntity.ok(service.modificar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
