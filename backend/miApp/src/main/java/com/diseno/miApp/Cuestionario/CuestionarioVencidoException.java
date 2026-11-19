package com.diseno.miApp.Cuestionario;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class CuestionarioVencidoException extends ResponseStatusException {
    public CuestionarioVencidoException(String motivo) {
        super(HttpStatus.CONFLICT, motivo);
    }
}
