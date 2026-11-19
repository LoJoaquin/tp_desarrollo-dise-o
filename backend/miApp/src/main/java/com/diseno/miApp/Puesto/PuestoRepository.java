package com.diseno.miApp.Puesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PuestoRepository extends JpaRepository<Puesto,Long> {
    @Query("""
    SELECT p FROM Puesto p LEFT JOIN FETCH p.empresa
    WHERE (:codigo IS NULL OR p.codigo = :codigo)
      AND (:nombre IS NULL OR p.nombre = :nombre)
      AND (:empresa IS NULL OR p.empresa.nombre = :empresa)
""")
     List<Puesto> buscarPuestoPorCodigoNombreYEmpresa(
            @Param("codigo") String codigo,
            @Param("nombre") String nombre,
            @Param("empresa") String empresa
    );

    @Query("""
    SELECT p FROM Puesto p LEFT JOIN FETCH p.empresa
    WHERE (:codigo IS NULL OR p.codigo LIKE :codigo)
      AND (:nombre IS NULL OR p.nombre LIKE :nombre)
      AND (:empresa IS NULL OR p.empresa.nombre LIKE :empresa)
""")
    List<Puesto> buscarPuestoPorCodigoNombreYEmpresaConteniendo(
            @Param("codigo") String codigo,
            @Param("nombre") String nombre,
            @Param("empresa") String empresa
    );
}
