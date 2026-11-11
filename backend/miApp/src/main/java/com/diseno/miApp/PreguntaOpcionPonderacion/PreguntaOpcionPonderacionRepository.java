package com.diseno.miApp.PreguntaOpcionPonderacion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PreguntaOpcionPonderacionRepository
        extends JpaRepository<PreguntaOpcionPonderacion, Long> {

    void deleteByPregunta_Id(Long idPregunta);

    Optional<PreguntaOpcionPonderacion>
    findByPregunta_IdAndDetalleOpcionRespuesta_Id(
            Long idPregunta,
            Long idDetalleOpcionRespuesta
    );
}
