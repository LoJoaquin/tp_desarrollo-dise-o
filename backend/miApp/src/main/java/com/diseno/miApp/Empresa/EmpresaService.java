package com.diseno.miApp.Empresa;

import org.springframework.stereotype.Service;

import java.util.List;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ValidacionesHelper.normalizarMayusculasObligatorio;
import static com.diseno.miApp.helpers.ValidacionesHelper.normalizarMayusculasOpcional;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    // CREAR
    public Empresa crearEmpresa(EmpresaCrearRequest request) {
        if (request == null) {
            throw errorSolicitud("Debe enviar los datos de la empresa");
        }

        String nombre = normalizarMayusculasObligatorio(
                request.getNombre(),
                "El nombre de la empresa es obligatorio"
        );

        Empresa empresa = new Empresa();
        empresa.setNombre(nombre);

        return empresaRepository.save(empresa);
    }

    public Empresa buscarPorId(Long id) {
        validarIdPositivo(id, "El ID de empresa debe ser un número positivo");
        return empresaRepository.findById(id)
                .orElseThrow(() -> errorNoEncontrado("Empresa no encontrada"));
    }

    public List<Empresa> listarTodas() {
        return empresaRepository.listarTodas();
    }

    // MODIFICAR
    public Empresa modificarEmpresa(
            Long id,
            EmpresaModificarRequest request) {

        if (request == null) {
            throw errorSolicitud(
                    "Debe enviar los datos para modificar la empresa"
            );
        }

        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> errorNoEncontrado("Empresa no encontrada"));

        empresa.setNombre(normalizarMayusculasObligatorio(
                request.getNombre(),
                "El nombre de la empresa es obligatorio"
        ));

        return empresaRepository.save(empresa);
    }

    // BUSCAR
    public List<Empresa> buscarEmpresas(
            EmpresaBuscarRequest request) {

        if (request == null) {
            throw errorSolicitud(
                    "Debe ingresar ID o nombre para buscar empresas"
            );
        }

        Long id = request.getId();
        String nombre = normalizarMayusculasOpcional(request.getNombre());

        if (id == null && (nombre == null || nombre.isBlank())) {
            throw errorSolicitud(
                    "Debe ingresar ID o nombre para buscar empresas"
            );
        }

        if (nombre != null) {
            nombre = "%" + nombre + "%";
        }

        return empresaRepository.buscarEmpresas(id, nombre);
    }
}
