package com.diseno.miApp.autenticador;

import com.diseno.miApp.Candidato.Candidato;
import com.diseno.miApp.Candidato.CandidatoRepository;
import com.diseno.miApp.JWT.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;

@Service
public class AutenticarService {
    private final CandidatoRepository candidatoRepository;
    private final JwtService jwtService;
    public AutenticarService(
            CandidatoRepository candidatoRepository,
            JwtService jwtService) {
        this.jwtService = jwtService;
        this.candidatoRepository = candidatoRepository;
    }

    public AutenticarResponse autenticarCandidato(
            AutenticarCandidatoRequest request) {
        if (request == null || request.tipo() == null
                || request.documento() == null
                || request.documento().isBlank()
                || request.contrasenia() == null
                || request.contrasenia().isBlank()) {
            throw errorSolicitud(
                    "Ingresá tipo y número de documento y contraseña");
        }

        Candidato candidato = candidatoRepository
                .findFirstByTipoDocumentoAndNumeroDocumentoAndEstaActivoTrue(
                        request.tipo(), request.documento().trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Tipo, documento o contraseña no válidos"));

        if (candidato.getContrasenia() == null
                || !candidato.getContrasenia().equals(request.contrasenia())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Tipo, documento o contraseña no válidos");
        }

        return new AutenticarResponse(
                jwtService.generarToken(candidato.getId().toString()),
                candidato.getId(),
                candidato.getNombre() + " " + candidato.getApellido());
    }

    public AutenticarResponse autenticarConsultor(AutenticarConsultorRequest request) {
    return null;}
}
