package com.diseno.miApp.Pregunta;

import org.springframework.stereotype.Service;

import java.util.List;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class PreguntaService {

    private final PreguntaRepository preguntaRepository;

    public PreguntaService(PreguntaRepository preguntaRepository) {
        this.preguntaRepository = preguntaRepository;
    }

    public List<Pregunta> listarTodas() {
        return preguntaRepository.findAll();
    }

    public Pregunta buscarPorId(Long id) {
        validarIdPositivo(id, "El ID de pregunta debe ser positivo");
        return preguntaRepository.findById(id)
                .orElseThrow(() -> errorNoEncontrado(
                        "Pregunta no encontrada"
                ));
    }

    public Pregunta guardar(Pregunta pregunta) {
        return preguntaRepository.save(pregunta);
    }

    public boolean existeAsociadaAOpcionRespuesta(Long idOpcionRespuesta) {
        return preguntaRepository.existsByOpcionRespuesta_Id(idOpcionRespuesta);
    }

    public long contarActivasPorFactor(Long idFactor) {
        validarIdPositivo(idFactor, "El ID del factor debe ser positivo");
        return preguntaRepository.countByFactor_IdAndEstaActivoTrue(idFactor);
    }

    public Pregunta reactivarPregunta(Long id) {
        Pregunta pregunta = buscarPorId(id);
        pregunta.setEstaActivo(true);
        return preguntaRepository.save(pregunta);
    }

    public void eliminarPregunta(Long id) {
        Pregunta pregunta = buscarPorId(id);
        pregunta.setEstaActivo(false);
        preguntaRepository.save(pregunta);
    }

}
