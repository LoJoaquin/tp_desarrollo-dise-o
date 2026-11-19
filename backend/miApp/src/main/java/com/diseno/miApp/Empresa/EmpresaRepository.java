package com.diseno.miApp.Empresa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    @Query("SELECT e FROM Empresa e ORDER BY e.nombre ASC")
    List<Empresa> listarTodas();

    @Query("""
        SELECT e
        FROM Empresa e
        WHERE (:id IS NULL OR e.id = :id)
          AND (:nombre IS NULL OR e.nombre LIKE :nombre)
    """)
    List<Empresa> buscarEmpresas(
            @Param("id") Long id,
            @Param("nombre") String nombre
    );
}
