package com.diseno.miApp.RespuestaPreguntaCuestionario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RespuestaPreguntaCuestionarioRepository
        extends JpaRepository<RespuestaPreguntaCuestionario, Long> {

    List<RespuestaPreguntaCuestionario> findByCuestionario_Id(
            Long idCuestionario
    );

    java.util.Optional<RespuestaPreguntaCuestionario>
    findByCuestionario_IdAndPregunta_Id(Long idCuestionario, Long idPregunta);
}
