package com.diseno.miApp.Candidato;

import com.diseno.miApp.Nacionalidad.Nacionalidad;
import com.diseno.miApp.genero.Genero;
import com.diseno.miApp.tipoDocumento.TipoDocumento;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ImportarCandidatosServiceTest {

    private static final String ENCABEZADO =
            "Nro candidato;Apellido;Nombre;Nro documento;Tipo documento;Fecha de nacimiento;Género;Nacionalidad;Email;Escolaridad;Eliminado\n";

    private CandidatoRepository repository;
    private ImportarCandidatosService service;

    @BeforeEach
    void preparar() {
        repository = mock(CandidatoRepository.class);
        when(repository.save(any(Candidato.class))).thenAnswer(inv -> inv.getArgument(0));
        service = new ImportarCandidatosService(repository);
    }

    private static MockMultipartFile csv(String contenido) {
        return new MockMultipartFile("archivo", "candidatos.csv", "text/csv",
                contenido.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void creaActualizaYEliminaSegunElNroCandidato() {
        Candidato existente = new Candidato();
        existente.setNumeroCandidato("1002");
        existente.setEstaActivo(true);
        Candidato aEliminar = new Candidato();
        aEliminar.setNumeroCandidato("1003");
        aEliminar.setEstaActivo(true);

        when(repository.findByNumeroCandidato("1001")).thenReturn(Optional.empty());
        when(repository.findByNumeroCandidato("1002")).thenReturn(Optional.of(existente));
        when(repository.findByNumeroCandidato("1003")).thenReturn(Optional.of(aEliminar));
        when(repository.findByNumeroCandidato("1004")).thenReturn(Optional.empty());

        ImportacionCandidatosResponse resultado = service.importar(csv("﻿" + ENCABEZADO
                + "1001;Gómez;Lucía;30123456;DNI;1990-05-01;M;Argentina;lucia@mail.com;Universitario;False\n"
                + "1002;Pérez;Juan;20111222;dni;1985-01-31;H;AR;;Secundario;false\n"
                + "1003;Díaz;Ana;27000111;LC;1970-10-10;M;UY;ana@mail.com;;True\n"
                + "1004;Nadie;Nuevo;1;PP;2000-01-01;H;BR;;;True\n"
                + "\n"));

        assertEquals(1, resultado.candidatosCreados());
        assertEquals(1, resultado.candidatosActualizados());
        assertEquals(1, resultado.candidatosEliminados());
        assertEquals(4, resultado.filasProcesadas());

        assertEquals("Pérez", existente.getApellido());
        assertEquals(TipoDocumento.DNI, existente.getTipoDocumento());
        assertEquals(Genero.H, existente.getGenero());
        assertEquals(Nacionalidad.AR, existente.getNacionalidad());
        assertEquals(LocalDate.of(1985, 1, 31), existente.getFechaNacimiento());
        assertNull(existente.getEmail());
        assertFalse(aEliminar.getEstaActivo());
        // C4 viene eliminado y no existía: no se crea.
        verify(repository, times(3)).save(any(Candidato.class));
    }

    @Test
    void rechazaElArchivoCompletoSiHayFilasInvalidas() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.importar(csv(ENCABEZADO
                        + "1001;Gómez;Lucía;30123456;CUIT;1990-13-01;X;Marte;no-es-mail;;quizas\n"
                        + "1001;Gómez;Lucía;30123456;DNI;1990-05-01;M;AR;;;False\n"
                        + "1001;Gómez;Lucía;30123456;DNI;1990-05-01;M;AR;;;False\n")));

        String mensaje = error.getReason();
        assertNotNull(mensaje);
        assertTrue(mensaje.contains("tipo de documento"));
        assertTrue(mensaje.contains("fecha de nacimiento"));
        assertTrue(mensaje.contains("género"));
        assertTrue(mensaje.contains("nacionalidad"));
        assertTrue(mensaje.contains("email"));
        assertTrue(mensaje.contains("Eliminado"));
        assertTrue(mensaje.contains("repetido"));
        verify(repository, never()).save(any());
    }

    @Test
    void rechazaEncabezadoConColumnasIncorrectas() {
        assertThrows(ResponseStatusException.class,
                () -> service.importar(csv("a,b,c\n1,2,3\n")));
    }
}
