package com.diseno.miApp.Factor;

import com.diseno.miApp.Competencia.Competencia;
import com.diseno.miApp.Competencia.FactorModificarRequest;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ValidacionesHelper.normalizarTextoOpcional;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class FactorService {

    private final FactorRepository factorRepository;
    public FactorService(FactorRepository factorRepository) {
        this.factorRepository = factorRepository;
    }

    public Factor buscarPorId(Long id) {
        validarIdPositivo(id, "El ID de factor debe ser un número positivo");

        return factorRepository.findById(id)
                .orElseThrow(() -> errorNoEncontrado(
                        "Factor no encontrado"
                ));
    }

    public List<Factor> listarTodos() {
        return factorRepository.findAll();
    }

    public Factor reactivarFactor(Long id) {
        Factor factor = buscarPorId(id);
        factor.setEstaActivo(true);
        return factorRepository.save(factor);
    }

    public List<Factor> listarPorCompetencia(Long idCompetencia) {
        validarIdPositivo(
                idCompetencia,
                "El ID de competencia debe ser un número positivo"
        );

        return factorRepository.findByCompetenciaId(idCompetencia);
    }

    public Factor crearFactor(
            FactorCrearRequest request,
            Competencia competencia) {
        if (request == null) {
            throw errorSolicitud("Debe enviar los datos del factor");
        }

        String codigo = normalizarTextoOpcional(request.getCodigo());
        String nombre = normalizarTextoOpcional(request.getNombre());

        if (codigo == null) {
            throw errorSolicitud("El código es obligatorio");
        }

        if (nombre == null) {
            throw errorSolicitud("El nombre es obligatorio");
        }

        Long idCompetencia = request.getCompetencia_id();
        validarIdPositivo(
                idCompetencia,
                "El ID de competencia debe ser un número positivo"
        );

        Factor factor = new Factor();
        factor.setCodigo(codigo);
        factor.setNombre(nombre);
        factor.setDescripcion(normalizarTextoOpcional(request.getDescripcion()));
        factor.setNroOrden(request.getNroOrden());
        factor.setEstaActivo(true);
        factor.setCompetencia(competencia);

        return factorRepository.save(factor);
    }

    public Factor modificarFactor(
            Long id,
            FactorModificarRequest request,
            Competencia competencia) {

        validarIdPositivo(id, "El ID de factor debe ser un número positivo");

        if (request == null) {
            throw errorSolicitud(
                    "Debe enviar los datos para modificar el factor"
            );
        }

        String nombre = normalizarTextoOpcional(request.getNombre());
        String descripcion = normalizarTextoOpcional(request.getDescripcion());
        Long idCompetencia = request.getCompetencia_id();
        Integer nroOrden = request.getNroOrden();

        if (nombre == null
                && descripcion == null
                && idCompetencia == null
                && nroOrden == null) {
            throw errorSolicitud(
                    "Debe enviar al menos un campo con valor para modificar"
            );
        }

        if (idCompetencia != null) {
            validarIdPositivo(
                    idCompetencia,
                    "El ID de competencia debe ser un número positivo"
            );
        }

        Factor factor = buscarPorId(id);

        if (nombre != null) {
            factor.setNombre(nombre);
        }

        if (descripcion != null) {
            factor.setDescripcion(descripcion);
        }

        if (idCompetencia != null) {
            factor.setCompetencia(competencia);
        }

        if (nroOrden != null) {
            factor.setNroOrden(nroOrden);
        }

        return factorRepository.save(factor);
    }

    public void eliminarFactor(Long id) {
        Factor factor = buscarPorId(id);
        factor.setEstaActivo(false);
        factorRepository.save(factor);
    }

}
