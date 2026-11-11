package com.diseno.miApp.Puesto;

import com.diseno.miApp.CaracteristicasPuesto.CaracteristicasPuesto;
import java.util.List;

public record PuestoSalidaResponse(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        boolean estaActiva,
        Long empresaId,
        String empresaNombre,
        List<CaracteristicaResponse> caracteristicasPuesto) {

    public static PuestoSalidaResponse desde(
            Puesto puesto,
            List<CaracteristicasPuesto> caracteristicas) {
        return new PuestoSalidaResponse(
                puesto.getId(),
                puesto.getCodigo(),
                puesto.getNombre(),
                puesto.getDescripcion(),
                Boolean.TRUE.equals(puesto.getEstaActiva()),
                puesto.getEmpresa() == null ? null : puesto.getEmpresa().getId(),
                puesto.getEmpresa() == null ? null : puesto.getEmpresa().getNombre(),
                caracteristicas.stream().map(CaracteristicaResponse::desde).toList()
        );
    }

    public record CaracteristicaResponse(
            Long id,
            Integer ponderacion,
            Long competenciaId,
            String competenciaNombre) {
        private static CaracteristicaResponse desde(
                CaracteristicasPuesto caracteristica) {
            return new CaracteristicaResponse(
                    caracteristica.getId(),
                    caracteristica.getPonderacion(),
                    caracteristica.getCompetencia() == null
                            ? null : caracteristica.getCompetencia().getId(),
                    caracteristica.getCompetencia() == null
                            ? null : caracteristica.getCompetencia().getNombre()
            );
        }
    }
}
