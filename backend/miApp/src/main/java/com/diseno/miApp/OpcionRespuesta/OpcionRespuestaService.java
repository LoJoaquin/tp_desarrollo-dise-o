package com.diseno.miApp.OpcionRespuesta;

import org.springframework.stereotype.Service;

import java.util.List;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ValidacionesHelper.patronContieneOpcional;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class OpcionRespuestaService {

    private final OpcionRespuestaRepository repository;

    public OpcionRespuestaService(OpcionRespuestaRepository repository) {
        this.repository = repository;
    }

    public List<OpcionRespuesta> listarTodas() {
        return repository.findAll();
    }

    public List<OpcionRespuesta> buscarActivasPorNombreConteniendo(
            String nombre) {
        String patron = patronContieneOpcional(nombre);
        return repository.buscarActivasPorNombreConteniendo(patron);
    }

    public OpcionRespuesta guardar(OpcionRespuesta opcion) {
        return repository.save(opcion);
    }

    public OpcionRespuesta buscarPorId(Long id) {
        validarIdPositivo(
                id,
                "El ID de la opción de respuesta debe ser positivo"
        );

        OpcionRespuesta opcion = repository.findById(id)
                .orElseThrow(() -> errorNoEncontrado(
                        "Opción de respuesta no encontrada"
                ));

        if (Boolean.FALSE.equals(opcion.getEstaActivo())) {
            throw errorNoEncontrado(
                    "Opción de respuesta no encontrada"
            );
        }

        return opcion;
    }
}
