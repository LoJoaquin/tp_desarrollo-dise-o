package com.diseno.miApp.DetalleOpcionRespuesta;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleOpcionRespuestaRepository extends JpaRepository<DetalleOpcionRespuesta,Long> {
    List<DetalleOpcionRespuesta> findByOpcionRespuesta_Id(Long idOpcionRespuesta);
}
