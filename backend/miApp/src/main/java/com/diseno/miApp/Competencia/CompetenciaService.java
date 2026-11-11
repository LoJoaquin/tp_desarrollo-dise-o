package com.diseno.miApp.Competencia;

import org.springframework.stereotype.Service;

import java.util.List;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ValidacionesHelper.normalizarTextoOpcional;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class CompetenciaService {

    private final CompetenciaRepository competenciaRepository;

    public CompetenciaService(CompetenciaRepository competenciaRepository) {
        this.competenciaRepository = competenciaRepository;
    }

    public Competencia buscarPorId(Long id) {
        validarIdPositivo(
                id,
                "El ID de competencia debe ser un número positivo"
        );

        return competenciaRepository.findById(id)
                .orElseThrow(() -> errorNoEncontrado(
                        "Competencia no encontrada"
                ));
    }

    public List<Competencia> listarTodas() {
        return competenciaRepository.findAll();
    }

    public Competencia reactivarCompetencia(Long id) {
        Competencia competencia = buscarPorId(id);
        competencia.setEstaActivo(true);
        return competenciaRepository.save(competencia);
    }

    public Competencia crearCompetencia(CompetenciaCrearRequest request) {
        if (request == null) {
            throw errorSolicitud("Debe enviar los datos de la competencia");
        }

        String codigo = normalizarTextoOpcional(request.getCodigo());
        String nombre = normalizarTextoOpcional(request.getNombre());

        if (codigo == null) {
            throw errorSolicitud("El código es obligatorio");
        }

        if (nombre == null) {
            throw errorSolicitud("El nombre es obligatorio");
        }

        Competencia competencia = new Competencia();
        competencia.setCodigo(codigo);
        competencia.setNombre(nombre);
        competencia.setDescripcion(
                normalizarTextoOpcional(request.getDescripcion())
        );
        competencia.setEstaActivo(true);

        return competenciaRepository.save(competencia);
    }

    public Competencia modificarCompetencia(
            Long id,
            CompetenciaModificarRequest request) {

        validarIdPositivo(
                id,
                "El ID de competencia debe ser un número positivo"
        );

        if (request == null) {
            throw errorSolicitud(
                    "Debe enviar los datos para modificar la competencia"
            );
        }

        String nombre = normalizarTextoOpcional(request.getNombre());
        String descripcion = normalizarTextoOpcional(request.getDescripcion());

        if (nombre == null && descripcion == null) {
            throw errorSolicitud(
                    "Debe enviar al menos un campo con valor para modificar"
            );
        }

        Competencia competencia = buscarPorId(id);

        if (nombre != null) {
            competencia.setNombre(nombre);
        }

        if (descripcion != null) {
            competencia.setDescripcion(descripcion);
        }

        return competenciaRepository.save(competencia);
    }

    public void eliminarCompetencia(Long id) {
        Competencia competencia = buscarPorId(id);
        competencia.setEstaActivo(false);
        competenciaRepository.save(competencia);
    }

}
