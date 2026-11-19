package com.diseno.miApp.Empresa;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Empresa")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @GetMapping
    public ResponseEntity<List<Empresa>> listarEmpresas() {
        return ResponseEntity.ok(empresaService.listarTodas());
    }

    // CREAR
    @PostMapping("/crear")
    public ResponseEntity<Empresa> crearEmpresa(
            @RequestBody EmpresaCrearRequest request) {

        Empresa empresa = empresaService.crearEmpresa(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(empresa);
    }

    // MODIFICAR
    @PutMapping("/modificar/{id}")
    public ResponseEntity<Empresa> modificarEmpresa(
            @PathVariable Long id,
            @RequestBody EmpresaModificarRequest request) {

        Empresa empresa =
                empresaService.modificarEmpresa(id, request);

        return ResponseEntity.ok(empresa);
    }

    // BUSCAR
    @PostMapping("/buscar")
    public ResponseEntity<List<Empresa>> buscarEmpresas(
            @RequestBody EmpresaBuscarRequest request) {

        List<Empresa> empresas =
                empresaService.buscarEmpresas(request);

        return ResponseEntity.ok(empresas);
    }
}
