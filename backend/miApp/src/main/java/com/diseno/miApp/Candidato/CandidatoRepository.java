package com.diseno.miApp.Candidato;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import com.diseno.miApp.tipoDocumento.TipoDocumento;

@Repository
public interface CandidatoRepository
        extends JpaRepository<Candidato, Long>,
                JpaSpecificationExecutor<Candidato> {

    @Query(value = """
        SELECT EXISTS (
            SELECT 1
            FROM candidato c
            WHERE c.nombre = :nombre
              AND c.apellido = :apellido
              AND (:id IS NULL OR c.id <> :id)
        )
        """, nativeQuery = true)
    boolean existeNombreYApellido(
            @Param("nombre") String nombre,
            @Param("apellido") String apellido,
            @Param("id") Long id
    );

    Optional<Candidato> findFirstByTipoDocumentoAndNumeroDocumentoAndEstaActivoTrue(
            TipoDocumento tipoDocumento,
            String numeroDocumento);
}
