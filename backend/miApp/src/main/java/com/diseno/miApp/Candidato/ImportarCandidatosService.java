package com.diseno.miApp.Candidato;

import com.diseno.miApp.Nacionalidad.Nacionalidad;
import com.diseno.miApp.genero.Genero;
import com.diseno.miApp.tipoDocumento.TipoDocumento;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;

/**
 * CU006 — Importar candidatos desde el CSV del sistema de candidatos y CV.
 *
 * Formato (primera fila con encabezados, separador ";"):
 * Nro candidato; Apellido; Nombre; Nro documento; Tipo documento;
 * Fecha de nacimiento (aaaa-mm-dd); Género (H/M); Nacionalidad; Email;
 * Escolaridad; Eliminado (True/False)
 *
 * El nro de candidato es la clave única. La importación es "todo o nada":
 * si alguna fila es inválida no se guarda ningún cambio y se informan todos
 * los errores encontrados.
 */
@Service
public class ImportarCandidatosService {

    private static final int CANTIDAD_COLUMNAS = 11;
    private static final int MAXIMO_ERRORES_INFORMADOS = 20;

    private final CandidatoRepository candidatoRepository;
    private final Map<String, Nacionalidad> nacionalidadesPorNombre = new HashMap<>();

    public ImportarCandidatosService(CandidatoRepository candidatoRepository) {
        this.candidatoRepository = candidatoRepository;
        for (Nacionalidad nacionalidad : Nacionalidad.values()) {
            nacionalidadesPorNombre.put(normalizar(nacionalidad.getNombre()), nacionalidad);
        }
    }

    private record FilaCandidato(
            int numeroLinea,
            String numeroCandidato,
            String apellido,
            String nombre,
            String numeroDocumento,
            TipoDocumento tipoDocumento,
            LocalDate fechaNacimiento,
            Genero genero,
            Nacionalidad nacionalidad,
            String email,
            String escolaridad,
            boolean eliminado) {
    }

    @Transactional
    public ImportacionCandidatosResponse importar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw errorSolicitud("Seleccioná un archivo CSV para importar");
        }
        String nombreArchivo = archivo.getOriginalFilename();
        if (nombreArchivo != null && !nombreArchivo.toLowerCase(Locale.ROOT).endsWith(".csv")) {
            throw errorSolicitud("El archivo debe tener extensión .csv");
        }

        List<FilaCandidato> filas = leerFilas(archivo);

        int creados = 0;
        int actualizados = 0;
        int eliminados = 0;
        LocalDateTime ahora = LocalDateTime.now();

        for (FilaCandidato fila : filas) {
            Candidato existente = candidatoRepository
                    .findByNumeroCandidato(fila.numeroCandidato())
                    .orElse(null);

            if (fila.eliminado()) {
                if (existente != null && !Boolean.FALSE.equals(existente.getEstaActivo())) {
                    existente.setEstaActivo(false);
                    existente.setUpdatedAt(ahora);
                    candidatoRepository.save(existente);
                    eliminados++;
                }
                // Si no existía o ya estaba dado de baja no hay nada que hacer.
                continue;
            }

            Candidato candidato = existente != null ? existente : new Candidato();
            copiarDatos(fila, candidato);
            candidato.setEstaActivo(true);
            candidato.setUpdatedAt(ahora);
            if (existente == null) {
                candidato.setCreatedAt(ahora);
                creados++;
            } else {
                actualizados++;
            }
            candidatoRepository.save(candidato);
        }

        return new ImportacionCandidatosResponse(creados, actualizados, eliminados, filas.size());
    }

    private void copiarDatos(FilaCandidato fila, Candidato candidato) {
        candidato.setNumeroCandidato(fila.numeroCandidato());
        candidato.setApellido(fila.apellido());
        candidato.setNombre(fila.nombre());
        candidato.setNumeroDocumento(fila.numeroDocumento());
        candidato.setTipoDocumento(fila.tipoDocumento());
        candidato.setFechaNacimiento(fila.fechaNacimiento());
        candidato.setGenero(fila.genero());
        candidato.setNacionalidad(fila.nacionalidad());
        candidato.setEmail(fila.email());
        candidato.setEscolaridad(fila.escolaridad());
    }

    private List<FilaCandidato> leerFilas(MultipartFile archivo) {
        List<FilaCandidato> filas = new ArrayList<>();
        List<String> errores = new ArrayList<>();
        Set<String> numerosVistos = new HashSet<>();

        try (BufferedReader lector = new BufferedReader(new InputStreamReader(
                archivo.getInputStream(), StandardCharsets.UTF_8))) {
            String encabezado = lector.readLine();
            if (encabezado == null || encabezado.isBlank()) {
                throw errorSolicitud("El archivo está vacío");
            }
            encabezado = encabezado.replace("﻿", "");
            if (encabezado.split(";", -1).length != CANTIDAD_COLUMNAS) {
                throw errorSolicitud("La primera fila debe tener los " + CANTIDAD_COLUMNAS
                        + " encabezados separados por punto y coma (;)");
            }

            String linea;
            int numeroLinea = 1;
            while ((linea = lector.readLine()) != null) {
                numeroLinea++;
                if (linea.isBlank()) {
                    continue;
                }
                List<String> erroresFila = new ArrayList<>();
                FilaCandidato fila = parsearFila(linea, numeroLinea, erroresFila);
                if (fila != null && !numerosVistos.add(fila.numeroCandidato())) {
                    erroresFila.add("Línea " + numeroLinea + ": el nro de candidato "
                            + fila.numeroCandidato() + " está repetido en el archivo");
                }
                if (erroresFila.isEmpty()) {
                    filas.add(fila);
                } else {
                    errores.addAll(erroresFila);
                }
            }
        } catch (IOException e) {
            throw errorSolicitud("No se pudo leer el archivo CSV");
        }

        if (!errores.isEmpty()) {
            List<String> informados = errores.subList(0, Math.min(errores.size(), MAXIMO_ERRORES_INFORMADOS));
            String extra = errores.size() > informados.size()
                    ? " (y " + (errores.size() - informados.size()) + " errores más)"
                    : "";
            throw errorSolicitud("No se importó ningún candidato porque el archivo tiene errores: "
                    + String.join(" | ", informados) + extra);
        }
        if (filas.isEmpty()) {
            throw errorSolicitud("El archivo no tiene candidatos para importar");
        }
        return filas;
    }

    private FilaCandidato parsearFila(String linea, int numeroLinea, List<String> errores) {
        String[] columnas = linea.split(";", -1);
        String prefijo = "Línea " + numeroLinea + ": ";
        if (columnas.length != CANTIDAD_COLUMNAS) {
            errores.add(prefijo + "tiene " + columnas.length + " columnas y se esperaban "
                    + CANTIDAD_COLUMNAS);
            return null;
        }
        for (int i = 0; i < columnas.length; i++) {
            columnas[i] = limpiar(columnas[i]);
        }

        String numeroCandidato = obligatorio(columnas[0], "Nro candidato", prefijo, errores);
        // Mismas reglas que el alta manual (CandidatoCrearRequest).
        if (numeroCandidato != null && numeroCandidato.length() > 50) {
            errores.add(prefijo + "el nro de candidato supera los 50 caracteres");
        }
        if (numeroCandidato != null && !numeroCandidato.matches("[0-9]+")) {
            errores.add(prefijo + "el nro de candidato solo puede contener dígitos");
        }
        String apellido = obligatorio(columnas[1], "Apellido", prefijo, errores);
        String nombre = obligatorio(columnas[2], "Nombre", prefijo, errores);
        String numeroDocumento = obligatorio(columnas[3], "Nro documento", prefijo, errores);
        if (numeroDocumento != null && !numeroDocumento.matches("[0-9]+")) {
            errores.add(prefijo + "el nro de documento solo puede contener dígitos");
        }

        TipoDocumento tipo = null;
        try {
            tipo = TipoDocumento.valueOf(columnas[4].toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            errores.add(prefijo + "tipo de documento inválido \"" + columnas[4]
                    + "\" (valores admitidos: DNI, LE, LC, PP)");
        }

        LocalDate fechaNacimiento = null;
        try {
            fechaNacimiento = LocalDate.parse(columnas[5]);
            if (fechaNacimiento.isAfter(LocalDate.now())) {
                errores.add(prefijo + "la fecha de nacimiento no puede ser futura");
            }
        } catch (DateTimeParseException e) {
            errores.add(prefijo + "fecha de nacimiento inválida \"" + columnas[5]
                    + "\" (formato aaaa-mm-dd)");
        }

        Genero genero = null;
        try {
            genero = Genero.valueOf(columnas[6].toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            errores.add(prefijo + "género inválido \"" + columnas[6] + "\" (valores admitidos: H, M)");
        }

        Nacionalidad nacionalidad = buscarNacionalidad(columnas[7]);
        if (nacionalidad == null) {
            errores.add(prefijo + "nacionalidad desconocida \"" + columnas[7] + "\"");
        }

        String email = columnas[8].isEmpty() ? null : columnas[8];
        if (email != null && !email.matches("[^@\\s]+@[^@\\s]+\\.[^@\\s]+")) {
            errores.add(prefijo + "email inválido \"" + email + "\"");
        }
        String escolaridad = columnas[9].isEmpty() ? null : columnas[9];

        Boolean eliminado = switch (columnas[10].toLowerCase(Locale.ROOT)) {
            case "true", "verdadero", "1", "si", "sí" -> true;
            case "false", "falso", "0", "no" -> false;
            default -> null;
        };
        if (eliminado == null) {
            errores.add(prefijo + "valor de Eliminado inválido \"" + columnas[10]
                    + "\" (valores admitidos: True, False)");
        }

        if (!errores.isEmpty()) {
            return null;
        }
        return new FilaCandidato(numeroLinea, numeroCandidato, apellido, nombre,
                numeroDocumento, tipo, fechaNacimiento, genero, nacionalidad,
                email, escolaridad, eliminado);
    }

    private Nacionalidad buscarNacionalidad(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        if (valor.length() == 2) {
            try {
                return Nacionalidad.valueOf(valor.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ignored) {
                // Se intenta por nombre.
            }
        }
        Nacionalidad porNombre = nacionalidadesPorNombre.get(normalizar(valor));
        if (porNombre != null) {
            return porNombre;
        }
        // Se aceptan gentilicios frecuentes del sistema de CV.
        return switch (normalizar(valor)) {
            case "argentina", "argentino" -> Nacionalidad.AR;
            case "uruguaya", "uruguayo" -> Nacionalidad.UY;
            case "paraguaya", "paraguayo" -> Nacionalidad.PY;
            case "chilena", "chileno" -> Nacionalidad.CL;
            case "boliviana", "boliviano" -> Nacionalidad.BO;
            case "brasilena", "brasileno" -> Nacionalidad.BR;
            case "peruana", "peruano" -> Nacionalidad.PE;
            case "venezolana", "venezolano" -> Nacionalidad.VE;
            case "colombiana", "colombiano" -> Nacionalidad.CO;
            case "espanola", "espanol" -> Nacionalidad.ES;
            case "italiana", "italiano" -> Nacionalidad.IT;
            default -> null;
        };
    }

    private static String obligatorio(String valor, String columna, String prefijo, List<String> errores) {
        if (valor == null || valor.isEmpty()) {
            errores.add(prefijo + "falta el valor de \"" + columna + "\"");
            return null;
        }
        return valor;
    }

    private static String limpiar(String valor) {
        String limpio = valor.trim();
        if (limpio.length() >= 2 && limpio.startsWith("\"") && limpio.endsWith("\"")) {
            limpio = limpio.substring(1, limpio.length() - 1).replace("\"\"", "\"").trim();
        }
        return limpio;
    }

    private static String normalizar(String texto) {
        return Normalizer.normalize(texto.trim().toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }
}
