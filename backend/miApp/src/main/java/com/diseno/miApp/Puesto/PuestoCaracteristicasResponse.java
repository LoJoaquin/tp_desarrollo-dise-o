package com.diseno.miApp.Puesto;

import com.diseno.miApp.CaracteristicasPuesto.CaracteristicasPuesto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class PuestoCaracteristicasResponse {
    private Puesto puesto;
    private List<CaracteristicasPuesto> caracteristicasPuestos;
    public PuestoCaracteristicasResponse(Puesto puesto,List<CaracteristicasPuesto> caracteristicasPuestos){
        this.caracteristicasPuestos=caracteristicasPuestos;
        this.puesto=puesto;
    }
}
