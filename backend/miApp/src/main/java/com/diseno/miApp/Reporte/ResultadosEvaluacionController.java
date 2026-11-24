package com.diseno.miApp.Reporte;

import com.diseno.miApp.Reporte.ResultadosDTOs.ArchivoCsv;
import com.diseno.miApp.Reporte.ResultadosDTOs.BuscarPuestosEvaluadosRequest;
import com.diseno.miApp.Reporte.ResultadosDTOs.CandidatoEvaluadoResponse;
import com.diseno.miApp.Reporte.ResultadosDTOs.PuestoEvaluadoResponse;
import com.diseno.miApp.Reporte.ResultadosDTOs.ReporteComparativoResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

/**
 * Endpoints de CU007 (Exportar resultados) y CU027 (Reporte comparativo).
 */
@RestController
@RequestMapping("/Reporte")
public class ResultadosEvaluacionController {

    private final ResultadosEvaluacionService service;

    public ResultadosEvaluacionController(ResultadosEvaluacionService service) {
        this.service = service;
    }

    // Funciones o puestos con al menos un candidato evaluado (cuestionario COMPLETO).
    @PostMapping("/evaluados/puestos/buscar")
    public ResponseEntity<List<PuestoEvaluadoResponse>> buscarPuestosEvaluados(
            @RequestBody(required = false) BuscarPuestosEvaluadosRequest request) {
        return ResponseEntity.ok(service.buscarPuestosEvaluados(request));
    }

    @GetMapping("/puestos/{idPuesto}/evaluados")
    public ResponseEntity<List<CandidatoEvaluadoResponse>> listarCandidatosEvaluados(
            @PathVariable Long idPuesto,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(service.listarCandidatosEvaluados(idPuesto, desde, hasta));
    }

    // CU027
    @GetMapping("/puestos/{idPuesto}/cuestionarios/{idCuestionario}/comparativo")
    public ResponseEntity<ReporteComparativoResponse> emitirReporteComparativo(
            @PathVariable Long idPuesto,
            @PathVariable Long idCuestionario) {
        return ResponseEntity.ok(service.emitirReporteComparativo(idPuesto, idCuestionario));
    }

    // CU007
    @GetMapping("/puestos/{idPuesto}/exportar")
    public ResponseEntity<byte[]> exportarResultados(
            @PathVariable Long idPuesto,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        ArchivoCsv archivo = service.exportarResultados(idPuesto, desde, hasta);
        ContentDisposition disposicion = ContentDisposition.attachment()
                .filename(archivo.nombreArchivo(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposicion.toString())
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(archivo.contenido());
    }
}
