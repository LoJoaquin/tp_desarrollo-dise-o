package com.diseno.miApp.Pregunta;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PreguntaRepository extends JpaRepository<Pregunta,Long> {
    List<Pregunta> findByFactor_IdAndEstaActivoTrue(Long idFactor);
    boolean existsByOpcionRespuesta_Id(Long idOpcionRespuesta);
    long countByFactor_IdAndEstaActivoTrue(Long idFactor);

    @Query("""
        SELECT p
        FROM Pregunta p
        JOIN p.factor f
        JOIN f.competencia c
        WHERE (:competenciaId IS NULL OR c.id = :competenciaId)
          AND (:factorId IS NULL OR f.id = :factorId)
          AND (:competencia IS NULL OR c.nombre LIKE :competencia)
          AND (:factor IS NULL OR f.nombre LIKE :factor)
          AND (:pregunta IS NULL OR p.name LIKE :pregunta)
    """)
    List<Pregunta> buscarConteniendo(
            @Param("competenciaId") Long competenciaId,
            @Param("factorId") Long factorId,
            @Param("competencia") String competencia,
            @Param("factor") String factor,
            @Param("pregunta") String pregunta
    );
}
