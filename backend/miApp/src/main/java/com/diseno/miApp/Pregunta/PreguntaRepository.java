package com.diseno.miApp.Pregunta;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PreguntaRepository extends JpaRepository<Pregunta,Long> {
    boolean existsByOpcionRespuesta_Id(Long idOpcionRespuesta);
    long countByFactor_IdAndEstaActivoTrue(Long idFactor);
}
