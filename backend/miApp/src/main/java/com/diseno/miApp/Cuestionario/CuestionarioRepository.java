package com.diseno.miApp.Cuestionario;

import com.diseno.miApp.EstadoCuestionario.EstadoCuestionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    // CU007 / CU027: cuestionarios con un estado dado (COMPLETO) filtrados
    // por nombre de puesto, empresa y rango de fecha de finalización.
    // Los filtros vacíos se reciben como "%" y fechas extremas para evitar
    // parámetros nulos (PostgreSQL no puede inferir su tipo).
    @Query("""
            SELECT c FROM Cuestionario c
            JOIN FETCH c.puesto p
            LEFT JOIN FETCH p.empresa e
            JOIN FETCH c.candidato
            WHERE c.estadoCuestionario = :estado
              AND LOWER(p.nombre) LIKE :nombrePuesto
              AND LOWER(COALESCE(e.nombre, '')) LIKE :nombreEmpresa
              AND c.fechaRealizacion >= :desde
              AND c.fechaRealizacion < :hasta
            """)
    List<Cuestionario> buscarPorEstadoYFiltros(
            @Param("estado") EstadoCuestionario estado,
            @Param("nombrePuesto") String nombrePuesto,
            @Param("nombreEmpresa") String nombreEmpresa,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );

    @Query("""
            SELECT c FROM Cuestionario c
            JOIN FETCH c.candidato
            WHERE c.puesto.id = :idPuesto
              AND c.estadoCuestionario = :estado
              AND c.fechaRealizacion >= :desde
              AND c.fechaRealizacion < :hasta
            ORDER BY c.candidato.apellido, c.candidato.nombre
            """)
    List<Cuestionario> buscarPorPuestoEstadoYFechas(
            @Param("idPuesto") Long idPuesto,
            @Param("estado") EstadoCuestionario estado,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );

    // CU032 paso 2: cuestionarios en proceso cuyo plazo para completar venció.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Cuestionario c
            SET c.estadoCuestionario = :nuevoEstado,
                c.fechaCambioEstado = :ahora
            WHERE c.estadoCuestionario = :estadoActual
              AND c.fechaLimiteFinalizacion IS NOT NULL
              AND c.fechaLimiteFinalizacion < :ahora
            """)
    int vencerPorLimiteFinalizacion(
            @Param("estadoActual") EstadoCuestionario estadoActual,
            @Param("nuevoEstado") EstadoCuestionario nuevoEstado,
            @Param("ahora") LocalDateTime ahora
    );

    // CU032 paso 3: cuestionarios activos cuyo plazo en estado activo venció.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Cuestionario c
            SET c.estadoCuestionario = :nuevoEstado,
                c.fechaCambioEstado = :ahora
            WHERE c.estadoCuestionario = :estadoActual
              AND c.fechaLimiteActivo IS NOT NULL
              AND c.fechaLimiteActivo < :ahora
            """)
    int vencerPorLimiteActivo(
            @Param("estadoActual") EstadoCuestionario estadoActual,
            @Param("nuevoEstado") EstadoCuestionario nuevoEstado,
            @Param("ahora") LocalDateTime ahora
    );
}
