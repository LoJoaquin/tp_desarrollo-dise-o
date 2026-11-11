package com.diseno.miApp.Candidato;

import com.diseno.miApp.Nacionalidad.Nacionalidad;

public record NacionalidadResponse(String codigo, String nombre) {
    public static NacionalidadResponse desde(Nacionalidad nacionalidad) {
        return new NacionalidadResponse(
                nacionalidad.name(),
                nacionalidad.getNombre());
    }
}
