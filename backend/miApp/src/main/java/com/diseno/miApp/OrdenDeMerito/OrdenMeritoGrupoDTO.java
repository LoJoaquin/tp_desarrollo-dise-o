package com.diseno.miApp.OrdenDeMerito;

import java.util.List;

public class OrdenMeritoGrupoDTO {

    private final String estado;
    private final List<OrdenMeritoDTO> candidatos;

    public OrdenMeritoGrupoDTO(
            String estado,
            List<OrdenMeritoDTO> candidatos) {
        this.estado = estado;
        this.candidatos = List.copyOf(candidatos);
    }

    public String getEstado() {
        return estado;
    }

    public List<OrdenMeritoDTO> getCandidatos() {
        return candidatos;
    }
}
