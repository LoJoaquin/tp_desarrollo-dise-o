package com.diseno.miApp.Candidato;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.List;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorNoEncontrado;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorConflicto;
import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;
import static com.diseno.miApp.helpers.ValidacionesHelper.normalizarTextoOpcional;
import static com.diseno.miApp.helpers.ValidacionesHelper.validarIdPositivo;

@Service
public class CandidatoService {

    private final CandidatoRepository candidatoRepository;

    public CandidatoService(CandidatoRepository candidatoRepository) {
        this.candidatoRepository = candidatoRepository;
    }

    public CandidatoCrearResponse crearCandidato(CandidatoCrearRequest request) {
        if (request == null || request.getNumeroCandidato() == null
                || request.getNumeroCandidato().isBlank()) {
            throw errorSolicitud("El número de candidato es obligatorio");
        }

        Candidato candidato = new Candidato();
      //Validaciones
        candidato.setNumeroCandidato(normalizarNumeroCandidato(request.getNumeroCandidato()));
        String nombre = request.getNombre().trim();
        String apellido = request.getApellido().trim();
        validarNombreYApellidoUnicos(nombre, apellido, null);
        candidato.setNombre(nombre);
        candidato.setApellido(apellido);
        candidato.setTipoDocumento(request.getTipoDocumento());
        candidato.setNumeroDocumento(request.getNumeroDocumento());
        candidato.setFechaNacimiento(request.getFechaNacimiento());
        candidato.setGenero(request.getGenero());
        candidato.setNacionalidad(request.getNacionalidad());
        candidato.setEmail(request.getEmail());
        candidato.setEscolaridad(request.getEscolaridad());
        candidato.setEstaActivo(true);
        candidato.setCreatedAt(LocalDateTime.now());

        Candidato candidatoGuardado = candidatoRepository.save(candidato);

        CandidatoCrearResponse response = new CandidatoCrearResponse(
                candidatoGuardado.getId(),
                candidatoGuardado.getNumeroCandidato(),
                candidatoGuardado.getNombre(),
                candidatoGuardado.getApellido(),
                candidatoGuardado.getFechaNacimiento(),
                candidatoGuardado.getTipoDocumento(),
                candidatoGuardado.getGenero(),
                candidatoGuardado.getNacionalidad(),
                candidatoGuardado.getEmail(),
                candidatoGuardado.getEscolaridad()
        );
        response.setNumeroDocumento(candidatoGuardado.getNumeroDocumento());
        return response;
    }
    public List<Candidato> buscarCandidatos(
            String numeroCandidato,
            String nombre,
            String apellido) {
        if ((numeroCandidato == null || numeroCandidato.isBlank()) &&
                (nombre == null || nombre.isBlank()) &&
                (apellido == null || apellido.isBlank())) {

            throw errorSolicitud(
                    "Debe ingresar al menos un criterio de búsqueda"
            );
        }

        nombre = normalizarTextoOpcional(nombre);
        apellido = normalizarTextoOpcional(apellido);
        numeroCandidato = normalizarTextoOpcional(numeroCandidato);

        return candidatoRepository.buscarCandidatos(
                numeroCandidato,
                nombre,
                apellido
        );
    }

    public Candidato modificarCandidato(
            Long id,
            CandidatoModificarRequest request) {
        validarIdPositivo(id, "El ID del candidato debe ser positivo");

        if (request == null) {
            throw errorSolicitud(
                    "Debe enviar los datos para modificar el candidato"
            );
        }

        Candidato candidato = candidatoRepository.findById(id)
                .orElseThrow(() -> errorNoEncontrado("Candidato no encontrado"));

        String nombre = request.getNombre().trim();
        String apellido = request.getApellido().trim();
        validarNombreYApellidoUnicos(nombre, apellido, id);
        candidato.setNombre(nombre);
        candidato.setApellido(apellido);
        if (request.getNumeroCandidato() == null || request.getNumeroCandidato().isBlank()) {
            throw errorSolicitud("El número de candidato es obligatorio");
        }
        candidato.setNumeroCandidato(normalizarNumeroCandidato(request.getNumeroCandidato()));
        candidato.setTipoDocumento(request.getTipoDocumento());
        candidato.setNumeroDocumento(request.getNumeroDocumento());
        candidato.setFechaNacimiento(request.getFechaNacimiento());
        candidato.setGenero(request.getGenero());
        candidato.setNacionalidad(request.getNacionalidad());
        candidato.setEmail(request.getEmail());
        candidato.setEscolaridad(request.getEscolaridad());
        candidato.setUpdatedAt(LocalDateTime.now());

        return candidatoRepository.save(candidato);
    }

    public Candidato buscarPorId(Long id) {
        validarIdPositivo(id, "El ID del candidato debe ser positivo");

        return candidatoRepository.findById(id)
                .orElseThrow(() -> errorNoEncontrado("Candidato no encontrado"));
    }

    private String normalizarNumeroCandidato(String numeroCandidato) {
        String normalizado = numeroCandidato.trim().toUpperCase(Locale.ROOT);
        if (normalizado.length() > 50) {
            throw errorSolicitud("El número de candidato no puede superar 50 caracteres");
        }
        return normalizado;
    }

    private void validarNombreYApellidoUnicos(
            String nombre,
            String apellido,
            Long idExcluido) {
        if (candidatoRepository.existeNombreYApellido(
                nombre,
                apellido,
                idExcluido)) {
            throw errorConflicto(
                    "Ya existe un candidato con ese nombre y apellido"
            );
        }
    }

    public void darBajaCandidato(Long id) {
        validarIdPositivo(id, "El ID del candidato debe ser positivo");

        Candidato candidato = candidatoRepository.findById(id)
                .orElseThrow(() -> errorNoEncontrado("Candidato no encontrado"));

        candidato.setEstaActivo(false);
        candidato.setUpdatedAt(LocalDateTime.now());

        candidatoRepository.save(candidato);
    }
}
