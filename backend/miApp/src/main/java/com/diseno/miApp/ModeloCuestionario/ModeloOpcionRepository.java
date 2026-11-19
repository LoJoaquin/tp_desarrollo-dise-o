package com.diseno.miApp.ModeloCuestionario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ModeloOpcionRepository extends JpaRepository<ModeloOpcion, Long> {
    Optional<ModeloOpcion> findByIdAndPregunta_Id(Long id, Long idPregunta);
}
