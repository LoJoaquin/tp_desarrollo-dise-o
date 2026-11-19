package com.diseno.miApp.ModeloCuestionario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ModeloPreguntaRepository
        extends JpaRepository<ModeloPregunta, Long> {
    List<ModeloPregunta> findByModelo_IdOrderByBloqueAscOrdenAsc(Long idModelo);
    Optional<ModeloPregunta> findByIdAndModelo_Id(Long id, Long idModelo);
}
