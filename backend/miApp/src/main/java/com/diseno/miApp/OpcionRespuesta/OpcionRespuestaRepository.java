package com.diseno.miApp.OpcionRespuesta;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OpcionRespuestaRepository
        extends JpaRepository<OpcionRespuesta, Long> {

    @Query("""
        SELECT o
        FROM OpcionRespuesta o
        WHERE o.estaActivo = true
          AND (:nombre IS NULL OR o.nombre LIKE :nombre)
    """)
    List<OpcionRespuesta> buscarActivasPorNombreConteniendo(
            @Param("nombre") String nombre
    );
}
