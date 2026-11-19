package com.diseno.miApp.RespuestaPreguntaCuestionario;

import java.util.List;
import java.time.LocalDate;
import java.util.ArrayList;
import com.diseno.miApp.Cuestionario.Cuestionario;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class RespuestaPreguntaCuestionarioService {

    private final RespuestaPreguntaCuestionarioRepository repository;

    public RespuestaPreguntaCuestionarioService(
            RespuestaPreguntaCuestionarioRepository repository) {

        this.repository = repository;
    }

    public List<RespuestaPreguntaCuestionario> obtenerPorCuestionario(
            Long idCuestionario) {

        return repository.findByCuestionario_Id(idCuestionario);
    }

    @Transactional
    public List<RespuestaPreguntaCuestionario> guardarOActualizar(
            Cuestionario cuestionario,
            List<RespuestaPreguntaCuestionario> respuestasRecibidas) {
        List<RespuestaPreguntaCuestionario> respuestasParaGuardar =
                new ArrayList<>();

        for (RespuestaPreguntaCuestionario recibida : respuestasRecibidas) {
            RespuestaPreguntaCuestionario existente = repository
                    .findByCuestionario_IdAndPregunta_Id(
                            cuestionario.getId(),
                            recibida.getPregunta().getId()
                    )
                    .orElseGet(RespuestaPreguntaCuestionario::new);

            existente.setCuestionario(cuestionario);
            existente.setPregunta(recibida.getPregunta());
            existente.setOpcionSeleccionada(recibida.getOpcionSeleccionada());
            existente.setFechaRespuesta(LocalDate.now());
            respuestasParaGuardar.add(existente);
        }

        return repository.saveAll(respuestasParaGuardar);
    }
}
