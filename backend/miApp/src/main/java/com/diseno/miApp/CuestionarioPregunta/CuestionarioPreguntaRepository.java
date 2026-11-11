package com.diseno.miApp.CuestionarioPregunta;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CuestionarioPreguntaRepository extends JpaRepository<CuestionarioPregunta,Long> {
    List<CuestionarioPregunta> findByCuestionarioIdOrderByBloqueAscOrdenAsc(Long idCuestionario);
}
