package com.diseno.miApp.Candidato;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;


@Repository
public interface CandidatoRepository extends JpaRepository<Candidato,Long> {
    @Query(value = """
        SELECT EXISTS (
            SELECT 1
            FROM candidato c
            WHERE LOWER(BTRIM(c.nombre)) = LOWER(BTRIM(:nombre))
              AND LOWER(BTRIM(c.apellido)) = LOWER(BTRIM(:apellido))
              AND (:id IS NULL OR c.id <> :id)
        )
        """, nativeQuery = true)
    boolean existeNombreYApellido(
            @Param("nombre") String nombre,
            @Param("apellido") String apellido,
            @Param("id") Long id
    );

    @Query("""
        SELECT c
        FROM Candidato c
        WHERE (:numeroCandidato IS NULL OR LOWER(c.numeroCandidato) = LOWER(:numeroCandidato))
        AND (:nombre IS NULL OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND (:apellido IS NULL OR LOWER(c.apellido) LIKE LOWER(CONCAT('%', :apellido, '%')))
    """)
    List<Candidato> buscarCandidatos(
            @Param("numeroCandidato") String numeroCandidato,
            @Param("nombre") String nombre,
            @Param("apellido") String apellido
    );
}
