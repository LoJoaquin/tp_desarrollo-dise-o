package com.diseno.miApp.Cuestionario;

import com.diseno.miApp.EstadoCuestionario.EstadoCuestionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CuestionarioRepository extends JpaRepository<Cuestionario,Long> {
    @Query("""
            SELECT DISTINCT new com.diseno.miApp.Cuestionario.CandidatoPorPuestoProjection(
                c.puesto.id,
                c.candidato
            )
            FROM Cuestionario c
            WHERE c.puesto.id IN :idsPuestos
              AND c.candidato IS NOT NULL
            """)
    List<CandidatoPorPuestoProjection> buscarCandidatosPorPuestoCuestionario(
            @Param("idsPuestos") List<Long> idsPuestos
    );

    @Query("""
            SELECT new com.diseno.miApp.Cuestionario.EvaluacionesCompletasPorPuestoProjection(
                c.puesto.id,
                COUNT(c)
            )
            FROM Cuestionario c
            WHERE c.puesto.id IN :idsPuestos
              AND c.estadoCuestionario = :estado
            GROUP BY c.puesto.id
            """)
    List<EvaluacionesCompletasPorPuestoProjection> contarEvaluacionesCompletasPorPuestos(
            @Param("idsPuestos") List<Long> idsPuestos,
            @Param("estado") EstadoCuestionario estado
    );

    List<Cuestionario> findByPuesto_IdAndEstadoCuestionario(
            Long puestoId,
            EstadoCuestionario estadoCuestionario
    );

    List<Cuestionario> findByPuesto_Id(Long puestoId);

    Optional<Cuestionario> findFirstByCandidato_IdAndEstadoCuestionarioIn(
            Long candidatoId,
            List<EstadoCuestionario> estados
    );
}
