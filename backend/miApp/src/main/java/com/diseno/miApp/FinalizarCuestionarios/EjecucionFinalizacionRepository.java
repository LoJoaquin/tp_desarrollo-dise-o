package com.diseno.miApp.FinalizarCuestionarios;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EjecucionFinalizacionRepository
        extends JpaRepository<EjecucionFinalizacion, Long> {

    List<EjecucionFinalizacion> findTop50ByOrderByIdDesc();
}
