package com.diseno.miApp.helpers;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.function.Supplier;

public final class ManejoErroresHelper {

    private ManejoErroresHelper() {
    }

    public static ResponseStatusException errorSolicitud(String mensaje) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje);
    }

    public static ResponseStatusException errorNoEncontrado(String mensaje) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, mensaje);
    }

    public static ResponseStatusException errorNoEncontrado(
            String mensaje,
            Throwable causa) {
        return new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                mensaje,
                causa
        );
    }

    public static ResponseStatusException errorConflicto(String mensaje) {
        return new ResponseStatusException(HttpStatus.CONFLICT, mensaje);
    }

    public static <T> T ejecutarConMensajeDeError(
            String mensaje,
            Supplier<T> operacion) {
        try {
            return operacion.get();
        } catch (ResponseStatusException error) {
            throw agregarMensajeDeError(error, mensaje);
        }
    }

    public static void ejecutarAccionConMensajeDeError(
            String mensaje,
            Runnable operacion) {
        try {
            operacion.run();
        } catch (ResponseStatusException error) {
            throw agregarMensajeDeError(error, mensaje);
        }
    }

    public static ResponseStatusException agregarMensajeDeError(
            ResponseStatusException error,
            String mensaje) {
        String motivoOriginal = error.getReason();
        String mensajeFinal = motivoOriginal == null
                ? mensaje
                : mensaje + ": " + motivoOriginal;

        return new ResponseStatusException(
                error.getStatusCode(),
                mensajeFinal,
                error
        );
    }
}
