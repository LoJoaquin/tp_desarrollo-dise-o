package com.diseno.miApp.helpers;

import java.util.Locale;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;

public final class ValidacionesHelper {

    private ValidacionesHelper() {
    }

    public static void validarIdPositivo(Long id, String mensaje) {
        if (id == null || id <= 0) {
            throw errorSolicitud(mensaje);
        }
    }

    public static String normalizarTextoOpcional(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }

        return texto.trim();
    }

    public static String normalizarTextoObligatorio(
            String texto,
            String mensaje) {
        String normalizado = normalizarTextoOpcional(texto);
        if (normalizado == null) {
            throw errorSolicitud(mensaje);
        }

        return normalizado;
    }

    public static String normalizarMayusculasOpcional(
            String texto,
            int longitudMaxima) {
        if (texto == null || texto.isBlank()) {
            return null;
        }

        String normalizado = texto.trim().toUpperCase(Locale.ROOT);
        if (normalizado.length() > longitudMaxima) {
            throw errorSolicitud(
                    "El texto excede la longitud máxima permitida"
            );
        }

        return normalizado;
    }

    public static String normalizarMayusculasObligatorio(
            String texto,
            String mensaje,
            int longitudMaxima) {
        String normalizado = normalizarMayusculasOpcional(
                texto,
                longitudMaxima
        );
        if (normalizado == null) {
            throw errorSolicitud(mensaje);
        }

        return normalizado;
    }
}
