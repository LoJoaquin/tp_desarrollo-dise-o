package com.diseno.miApp.Competencia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CompetenciaRepository extends JpaRepository<Competencia,Long> {
    Optional<Competencia> findByNombre(String nombre);

    @Query("""
        SELECT c
        FROM Competencia c
        WHERE (:codigo IS NULL OR c.codigo LIKE :codigo)
          AND (:nombre IS NULL OR c.nombre LIKE :nombre)
    """)
    List<Competencia> buscarConteniendo(
            @Param("codigo") String codigo,
            @Param("nombre") String nombre
    );
}
